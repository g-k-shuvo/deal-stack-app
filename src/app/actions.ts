"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getRepo } from "@/lib/data";
import { requireSkill } from "@/lib/skills/registry";
import { assembleContext } from "@/lib/engine/context";
import { generateForSkill, verifyFirmKey } from "@/lib/ai/provider";
import { logEvent } from "@/lib/log";
import { toPreviewMarkdown } from "@/lib/preview";
import { encryptSecret } from "@/lib/crypto";
import { buildFilename } from "@/lib/util/filename";
import type { Firm, Project, ProjectStatus } from "@/lib/data/model";
import type { Track, FirmContext, ProjectContext, PriorOutput, SourceDoc } from "@/lib/types";
import type { Skill } from "@/lib/skills/types";

function toFirmContext(f: Firm): FirmContext {
  return {
    name: f.name,
    description: f.description,
    advisorBio: f.advisorBio,
    aiInstructions: f.aiInstructions,
    defaults: f.defaults,
  };
}
function toProjectContext(p: Project): ProjectContext {
  return {
    companyName: p.companyName,
    website: p.website,
    industry: p.industry,
    location: p.location,
    type: p.type,
    estValue: p.estValue,
    ebitda: p.ebitda,
    multiple: p.multiple,
    structure: p.structure,
    contactName: p.contactName,
    contactTitle: p.contactTitle,
    contactPhone: p.contactPhone,
  };
}
async function priorOutputsFor(projectId: string, skill: Skill): Promise<PriorOutput[]> {
  const repo = getRepo();
  const out: PriorOutput[] = [];
  for (const key of skill.chainsFrom) {
    const runs = await repo.runsFor(projectId, key);
    const latest = runs.at(-1)?.versions.at(-1);
    const name = requireSkill(key).name;
    if (latest) {
      out.push({ skillKey: key, skillName: name, preview: latest.previewMd });
    } else {
      const steps = await repo.listSteps(projectId);
      if (steps.some((s) => s.skillKey === key && s.status === "completed")) {
        out.push({ skillKey: key, skillName: name, preview: "(prior deliverable on file)" });
      }
    }
  }
  return out;
}
async function gatherSourceDocs(projectId: string): Promise<SourceDoc[]> {
  const repo = getRepo();
  const docs = (await repo.listDocuments()).filter(
    (d) => d.projectId === projectId && d.source === "uploaded",
  );
  const out: SourceDoc[] = [];
  for (const d of docs) {
    const blob = await repo.getBlob(d.id);
    out.push(
      d.format === "pdf" && blob
        ? { filename: d.filename, format: "pdf", base64: blob.toString("base64") }
        : { filename: d.filename, format: d.format },
    );
  }
  return out;
}
function str(fd: FormData, k: string): string | undefined {
  const v = fd.get(k);
  const s = typeof v === "string" ? v.trim() : "";
  return s === "" ? undefined : s;
}

export interface GenResult {
  runId: string;
  versionNo: number;
  previewMd: string;
}

export async function runSkillAction(
  projectId: string,
  skillKey: string,
  inputs: Record<string, string>,
): Promise<GenResult> {
  const repo = getRepo();
  const project = await repo.getProject(projectId);
  if (!project) throw new Error("Project not found");
  const skill = requireSkill(skillKey);
  const firm = await repo.getFirm();
  const ctx = assembleContext({
    skill,
    firm: toFirmContext(firm),
    project: toProjectContext(project),
    priorOutputs: await priorOutputsFor(projectId, skill),
    inputs,
    sourceDocs: await gatherSourceDocs(projectId),
  });
  const { content, model } = await generateForSkill(ctx, firm);
  const preview = toPreviewMarkdown(content);
  const run =
    (await repo.runsFor(projectId, skillKey))[0] ??
    (await repo.createRun(projectId, skillKey, inputs));
  const version = await repo.addRunVersion(run.id, {
    contentJson: content,
    previewMd: preview,
    modelUsed: model,
  });
  const steps = await repo.listSteps(projectId);
  const step = steps.find((s) => s.skillKey === skillKey);
  if (step && step.status === "notstarted")
    await repo.setStep(projectId, skillKey, { status: "inprogress" });
  await repo.addActivity("skill", `${skill.name} generated — ${project.companyName}`, projectId);
  logEvent("skill.run", { skillKey, projectId, model, version: version.versionNo });
  revalidatePath(`/projects/${projectId}/skills/${skillKey}`);
  revalidatePath(`/projects/${projectId}`);
  return { runId: run.id, versionNo: version.versionNo, previewMd: preview };
}

export async function reviseAction(runId: string, instruction: string): Promise<GenResult> {
  const repo = getRepo();
  const run = await repo.getRun(runId);
  if (!run) throw new Error("Run not found");
  const skill = requireSkill(run.skillKey);
  const project = await repo.getProject(run.projectId);
  if (!project) throw new Error("Project not found");
  const firm = await repo.getFirm();
  const ctx = assembleContext({
    skill,
    firm: toFirmContext(firm),
    project: toProjectContext(project),
    priorOutputs: await priorOutputsFor(run.projectId, skill),
    inputs: { ...run.inputs, _revision: instruction },
    sourceDocs: await gatherSourceDocs(run.projectId),
  });
  const { content, model } = await generateForSkill(ctx, firm);
  const preview = toPreviewMarkdown(content);
  const version = await repo.addRunVersion(runId, {
    contentJson: content,
    previewMd: preview,
    modelUsed: model,
  });
  revalidatePath(`/projects/${run.projectId}/skills/${run.skillKey}`);
  return { runId, versionNo: version.versionNo, previewMd: preview };
}

export async function saveOutputAction(
  runId: string,
  versionNo: number,
): Promise<{ documentId: string; filename: string }> {
  const repo = getRepo();
  const run = await repo.getRun(runId);
  if (!run) throw new Error("Run not found");
  const version = run.versions.find((v) => v.versionNo === versionNo);
  if (!version) throw new Error("Version not found");
  const skill = requireSkill(run.skillKey);
  const project = await repo.getProject(run.projectId);
  if (!project) throw new Error("Project not found");
  const firm = await repo.getFirm();
  const existing = (await repo.listDocuments()).find((d) => d.runVersionId === version.id);
  if (existing) return { documentId: existing.id, filename: existing.filename };
  const doc = await repo.addDocument({
    firmId: firm.id,
    projectId: run.projectId,
    runVersionId: version.id,
    source: "ai",
    skillKey: skill.key,
    filename: buildFilename(skill.name, versionNo, project.companyName, skill.format),
    format: skill.format,
    storagePath: `runs/${runId}/${version.id}`,
    sizeBytes: 0,
  });
  await repo.addActivity("save", `${doc.filename} saved to library`, run.projectId);
  revalidatePath("/library");
  return { documentId: doc.id, filename: doc.filename };
}

export async function markStepCompleteAction(runId: string, versionNo: number): Promise<void> {
  const repo = getRepo();
  const run = await repo.getRun(runId);
  if (!run) throw new Error("Run not found");
  const saved = await saveOutputAction(runId, versionNo);
  const skill = requireSkill(run.skillKey);
  const project = await repo.getProject(run.projectId);
  await repo.setStep(run.projectId, run.skillKey, {
    status: "completed",
    linkedDocumentId: saved.documentId,
    completedAt: new Date().toISOString(),
  });
  await repo.addActivity(
    "step",
    `${skill.name} completed — ${project?.companyName ?? ""}`,
    run.projectId,
  );
  revalidatePath(`/projects/${run.projectId}`);
  revalidatePath(`/projects/${run.projectId}/skills/${run.skillKey}`);
}

export async function createProjectAction(formData: FormData): Promise<void> {
  const repo = getRepo();
  const companyName = str(formData, "companyName");
  if (!companyName) throw new Error("Company name is required");
  const type = (str(formData, "type") ?? "sell") as Track;
  const project = await repo.createProject({
    companyName,
    type,
    status: (str(formData, "status") as ProjectStatus | undefined) ?? undefined,
    industry: str(formData, "industry"),
    location: str(formData, "location"),
    website: str(formData, "website"),
    estValue: str(formData, "estValue"),
    contactName: str(formData, "contactName"),
    contactTitle: str(formData, "contactTitle"),
  });
  redirect(`/projects/${project.id}`);
}

export async function updateProjectAction(formData: FormData): Promise<void> {
  const id = str(formData, "id");
  if (!id) throw new Error("Project id required");
  await getRepo().updateProject(id, {
    companyName: str(formData, "companyName") ?? undefined,
    industry: str(formData, "industry"),
    location: str(formData, "location"),
    website: str(formData, "website"),
    status: (str(formData, "status") as ProjectStatus | undefined) ?? undefined,
    estValue: str(formData, "estValue"),
    ebitda: str(formData, "ebitda"),
    multiple: str(formData, "multiple"),
    structure: str(formData, "structure"),
    contactName: str(formData, "contactName"),
    contactTitle: str(formData, "contactTitle"),
    contactPhone: str(formData, "contactPhone"),
  });
  revalidatePath(`/projects/${id}`);
  redirect(`/projects/${id}`);
}

export async function renameDocAction(id: string, filename: string): Promise<void> {
  await getRepo().renameDocument(id, filename);
  revalidatePath("/library");
}

export async function deleteDocAction(id: string): Promise<void> {
  await getRepo().deleteDocument(id);
  revalidatePath("/library");
}

export async function updateFirmAction(formData: FormData): Promise<void> {
  await getRepo().updateFirm({
    name: str(formData, "name") ?? "Jackim Woods & Co.",
    website: str(formData, "website"),
    address: str(formData, "address"),
    marketFocus: str(formData, "marketFocus"),
    industrySpecializations: str(formData, "industrySpecializations"),
    description: str(formData, "description"),
    advisorBio: str(formData, "advisorBio"),
  });
  revalidatePath("/settings");
}

export async function updateAiInstructionsAction(formData: FormData): Promise<void> {
  await getRepo().updateFirm({
    aiInstructions: (str(formData, "aiInstructions") ?? "").slice(0, 2000),
  });
  revalidatePath("/settings");
}

export async function updateProfileAction(formData: FormData): Promise<void> {
  await getRepo().updateUser({
    firstName: str(formData, "firstName") ?? "",
    lastName: str(formData, "lastName") ?? "",
    email: str(formData, "email") ?? "",
    phone: str(formData, "phone"),
    title: str(formData, "title"),
    yearsExperience: str(formData, "yearsExperience"),
  });
  revalidatePath("/settings");
}

export async function updateDefaultsAction(formData: FormData): Promise<void> {
  const keys = [
    "success_fee",
    "retainer",
    "exclusivity",
    "deal_size_range",
    "default_type",
    "default_status",
  ];
  const patch: Record<string, string> = {};
  for (const k of keys) {
    const v = str(formData, k);
    if (v !== undefined) patch[k] = v;
  }
  await getRepo().updateDefaults(patch);
  revalidatePath("/settings");
}

export async function setNotificationAction(key: string, enabled: boolean): Promise<void> {
  await getRepo().setNotification(key, enabled);
  revalidatePath("/settings");
}

export async function setApiKeyAction(formData: FormData): Promise<void> {
  const key = str(formData, "apiKey");
  if (!key) throw new Error("API key is required");
  await getRepo().updateFirm({ apiKeyEncrypted: encryptSecret(key), apiKeyVerified: false });
  revalidatePath("/settings");
}

export async function verifyKeyAction(_formData?: FormData): Promise<void> {
  const repo = getRepo();
  const firm = await repo.getFirm();
  if (!firm.apiKeyEncrypted) throw new Error("No API key set");
  const ok = await verifyFirmKey(firm);
  await repo.updateFirm({ apiKeyVerified: ok });
  revalidatePath("/settings");
  if (!ok) throw new Error("Key verification failed");
}

async function storeUpload(
  formData: FormData,
): Promise<{ id: string; name: string; projectId?: string }> {
  const repo = getRepo();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) throw new Error("No file provided");
  const projectId = str(formData, "projectId");
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = (file.name.split(".").pop() ?? "pdf").toLowerCase();
  const fmt = (["docx", "xlsx", "pptx", "pdf"].includes(ext) ? ext : "pdf") as
    | "docx"
    | "xlsx"
    | "pptx"
    | "pdf";
  const firm = await repo.getFirm();
  const doc = await repo.addDocument({
    firmId: firm.id,
    projectId,
    source: "uploaded",
    filename: file.name,
    format: fmt,
    storagePath: `uploads/${file.name}`,
    sizeBytes: buf.length,
  });
  await repo.putBlob(doc.id, buf);
  return { id: doc.id, name: file.name, projectId };
}

export async function uploadDocAction(formData: FormData): Promise<void> {
  const { name, projectId } = await storeUpload(formData);
  await getRepo().addActivity("upload", `${name} uploaded`, projectId);
  revalidatePath("/library");
  if (projectId) revalidatePath(`/projects/${projectId}`);
}

export async function addStyleExampleAction(formData: FormData): Promise<void> {
  const skillKey = str(formData, "skillKey");
  if (!skillKey) throw new Error("skillKey required");
  const { id } = await storeUpload(formData);
  await getRepo().addStyleExample(skillKey, id);
  revalidatePath("/settings");
}

export async function resetWorkspaceAction(): Promise<void> {
  const repo = getRepo();
  await repo.resetWorkspace();
  await repo.addActivity("status", "Workspace reset");
  redirect("/");
}
