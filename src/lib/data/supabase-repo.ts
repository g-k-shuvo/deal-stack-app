import { supabaseAdmin, BLOB_BUCKET } from "@/lib/data/supabase";
import { skillsByTrack } from "@/lib/skills/registry";
import type { Repo, CreateProjectInput } from "@/lib/data/repo";
import type {
  Firm,
  User,
  Project,
  ProjectStep,
  DocRecord,
  ActivityEvent,
  Run,
  RunVersion,
  ProjectStatus,
  StepStatus,
  DocSource,
} from "@/lib/data/model";
import type { SkillFormat } from "@/lib/types";

// Production data adapter (PRD §15). Maps the snake_case SQL schema (0001_init.sql)
// to the camelCase domain model. Requires a live Supabase + applied migration/seed;
// enabled via USE_SUPABASE=1. Not exercised by the in-memory test suite.

type Row = Record<string, unknown>;
const str = (r: Row, k: string): string | undefined => (r[k] == null ? undefined : String(r[k]));
const req = (r: Row, k: string): string => String(r[k] ?? "");
const num = (r: Row, k: string): number => Number(r[k] ?? 0);
const rows = (data: unknown): Row[] => (Array.isArray(data) ? (data as Row[]) : []);
const FIRM_ID = "00000000-0000-0000-0000-000000000001";

function firmFromRow(r: Row): Firm {
  return {
    id: req(r, "id"),
    name: req(r, "name"),
    website: str(r, "website"),
    address: str(r, "address"),
    marketFocus: str(r, "market_focus"),
    industrySpecializations: str(r, "industry_specializations"),
    totalTransactions: str(r, "total_transactions"),
    geography: str(r, "geography"),
    description: str(r, "description"),
    advisorBio: str(r, "advisor_bio"),
    aiInstructions: str(r, "ai_instructions"),
    defaults: (r.defaults as Record<string, string>) ?? {},
    apiKeyEncrypted: str(r, "api_key_encrypted"),
    apiKeyVerified: Boolean(r.api_key_verified),
    storageLimitBytes: num(r, "storage_limit_bytes"),
  };
}
function userFromRow(r: Row): User {
  return {
    id: req(r, "id"),
    firmId: req(r, "firm_id"),
    firstName: req(r, "first_name"),
    lastName: req(r, "last_name"),
    email: req(r, "email"),
    phone: str(r, "phone"),
    title: str(r, "title"),
    yearsExperience: str(r, "years_experience"),
  };
}
function projectFromRow(r: Row): Project {
  return {
    id: req(r, "id"),
    firmId: req(r, "firm_id"),
    companyName: req(r, "company_name"),
    website: str(r, "website"),
    industry: str(r, "industry"),
    location: str(r, "location"),
    type: req(r, "type") === "buy" ? "buy" : "sell",
    status: req(r, "status") as ProjectStatus,
    estValue: str(r, "est_value"),
    ebitda: str(r, "ebitda"),
    multiple: str(r, "multiple"),
    structure: str(r, "structure"),
    contactName: str(r, "contact_name"),
    contactTitle: str(r, "contact_title"),
    contactPhone: str(r, "contact_phone"),
    engagementStart: str(r, "engagement_start"),
    createdAt: req(r, "created_at"),
    updatedAt: req(r, "updated_at"),
  };
}
function stepFromRow(r: Row): ProjectStep {
  return {
    projectId: req(r, "project_id"),
    skillKey: req(r, "skill_key"),
    ordinal: num(r, "ordinal"),
    status: req(r, "status") as StepStatus,
    linkedDocumentId: str(r, "linked_document_id"),
    completedAt: str(r, "completed_at"),
  };
}
function docFromRow(r: Row): DocRecord {
  return {
    id: req(r, "id"),
    firmId: req(r, "firm_id"),
    projectId: str(r, "project_id"),
    runVersionId: str(r, "run_version_id"),
    source: req(r, "source") as DocSource,
    skillKey: str(r, "skill_key"),
    filename: req(r, "filename"),
    format: req(r, "format") as SkillFormat | "pdf",
    storagePath: req(r, "storage_path"),
    sizeBytes: num(r, "size_bytes"),
    createdAt: req(r, "created_at"),
  };
}
function activityFromRow(r: Row): ActivityEvent {
  return {
    id: req(r, "id"),
    firmId: req(r, "firm_id"),
    projectId: str(r, "project_id"),
    type: req(r, "type"),
    text: req(r, "text"),
    createdAt: req(r, "created_at"),
  };
}
function versionFromRow(r: Row): RunVersion {
  return {
    id: req(r, "id"),
    runId: req(r, "run_id"),
    versionNo: num(r, "version_no"),
    contentJson: r.content_json,
    previewMd: req(r, "preview_md"),
    modelUsed: req(r, "model_used"),
    createdAt: req(r, "created_at"),
  };
}

export class SupabaseRepo implements Repo {
  private db = supabaseAdmin();

  async getFirm(): Promise<Firm> {
    const { data } = await this.db.from("firm").select("*").limit(1).single();
    return firmFromRow(
      (data as Row) ?? { id: FIRM_ID, name: "Firm", defaults: {}, storage_limit_bytes: 0 },
    );
  }
  async updateFirm(patch: Partial<Firm>): Promise<Firm> {
    const map: Row = {};
    if (patch.name !== undefined) map.name = patch.name;
    if (patch.website !== undefined) map.website = patch.website;
    if (patch.address !== undefined) map.address = patch.address;
    if (patch.marketFocus !== undefined) map.market_focus = patch.marketFocus;
    if (patch.industrySpecializations !== undefined)
      map.industry_specializations = patch.industrySpecializations;
    if (patch.description !== undefined) map.description = patch.description;
    if (patch.advisorBio !== undefined) map.advisor_bio = patch.advisorBio;
    if (patch.aiInstructions !== undefined) map.ai_instructions = patch.aiInstructions;
    if (patch.apiKeyEncrypted !== undefined) map.api_key_encrypted = patch.apiKeyEncrypted;
    if (patch.apiKeyVerified !== undefined) map.api_key_verified = patch.apiKeyVerified;
    if (patch.defaults !== undefined) map.defaults = patch.defaults;
    await this.db
      .from("firm")
      .update(map)
      .eq("id", (await this.getFirm()).id);
    return this.getFirm();
  }
  async updateDefaults(patch: Record<string, string>): Promise<Record<string, string>> {
    const firm = await this.getFirm();
    const merged = { ...firm.defaults, ...patch };
    await this.db.from("firm").update({ defaults: merged }).eq("id", firm.id);
    return merged;
  }
  async getUser(): Promise<User> {
    const { data } = await this.db.from("app_user").select("*").limit(1).single();
    return userFromRow(
      (data as Row) ?? { id: "u", firm_id: FIRM_ID, first_name: "", last_name: "", email: "" },
    );
  }
  async updateUser(patch: Partial<User>): Promise<User> {
    const map: Row = {};
    if (patch.firstName !== undefined) map.first_name = patch.firstName;
    if (patch.lastName !== undefined) map.last_name = patch.lastName;
    if (patch.email !== undefined) map.email = patch.email;
    if (patch.phone !== undefined) map.phone = patch.phone;
    if (patch.title !== undefined) map.title = patch.title;
    if (patch.yearsExperience !== undefined) map.years_experience = patch.yearsExperience;
    await this.db
      .from("app_user")
      .update(map)
      .eq("id", (await this.getUser()).id);
    return this.getUser();
  }
  async getNotifications(): Promise<{ key: string; enabled: boolean }[]> {
    const { data } = await this.db.from("notification_pref").select("*");
    return rows(data).map((r) => ({ key: req(r, "key"), enabled: Boolean(r.enabled) }));
  }
  async setNotification(key: string, enabled: boolean): Promise<void> {
    await this.db.from("notification_pref").update({ enabled }).eq("key", key);
  }
  async listStyleExamples(): Promise<{ skillKey: string; documentId: string }[]> {
    const { data } = await this.db.from("style_example").select("*");
    return rows(data).map((r) => ({
      skillKey: req(r, "skill_key"),
      documentId: req(r, "document_id"),
    }));
  }
  async addStyleExample(skillKey: string, documentId: string): Promise<void> {
    const firm = await this.getFirm();
    await this.db
      .from("style_example")
      .upsert(
        { firm_id: firm.id, skill_key: skillKey, document_id: documentId },
        { onConflict: "firm_id,skill_key" },
      );
  }
  async putBlob(id: string, bytes: Buffer): Promise<void> {
    await this.db.storage.from(BLOB_BUCKET).upload(id, bytes, { upsert: true });
  }
  async getBlob(id: string): Promise<Buffer | undefined> {
    const { data } = await this.db.storage.from(BLOB_BUCKET).download(id);
    if (!data) return undefined;
    return Buffer.from(await data.arrayBuffer());
  }
  async resetWorkspace(): Promise<void> {
    const firm = await this.getFirm();
    await this.db.from("project").delete().eq("firm_id", firm.id);
    await this.db.from("activity_event").delete().eq("firm_id", firm.id);
    await this.db.from("style_example").delete().eq("firm_id", firm.id);
  }

  async listProjects(): Promise<Project[]> {
    const { data } = await this.db
      .from("project")
      .select("*")
      .order("updated_at", { ascending: false });
    return rows(data).map(projectFromRow);
  }
  async getProject(id: string): Promise<Project | undefined> {
    const { data } = await this.db.from("project").select("*").eq("id", id).maybeSingle();
    return data ? projectFromRow(data as Row) : undefined;
  }
  async createProject(input: CreateProjectInput): Promise<Project> {
    const firm = await this.getFirm();
    const { data } = await this.db
      .from("project")
      .insert({
        firm_id: firm.id,
        company_name: input.companyName,
        type: input.type,
        track: input.type,
        status: input.status ?? "prospect",
        industry: input.industry,
        location: input.location,
        website: input.website,
        est_value: input.estValue,
        contact_name: input.contactName,
        contact_title: input.contactTitle,
        contact_phone: input.contactPhone,
      })
      .select("*")
      .single();
    const project = projectFromRow(data as Row);
    const steps = skillsByTrack(input.type).map((s) => ({
      project_id: project.id,
      skill_key: s.key,
      ordinal: s.step,
      status: "notstarted",
    }));
    await this.db.from("project_step").insert(steps);
    await this.addActivity("status", `${project.companyName} created`, project.id);
    return project;
  }
  async updateProject(id: string, patch: Partial<Project>): Promise<Project> {
    const map: Row = { updated_at: new Date().toISOString() };
    const set = (k: keyof Project, col: string) => {
      if (patch[k] !== undefined) map[col] = patch[k];
    };
    set("companyName", "company_name");
    set("industry", "industry");
    set("location", "location");
    set("website", "website");
    set("status", "status");
    set("estValue", "est_value");
    set("ebitda", "ebitda");
    set("multiple", "multiple");
    set("structure", "structure");
    set("contactName", "contact_name");
    set("contactTitle", "contact_title");
    set("contactPhone", "contact_phone");
    await this.db.from("project").update(map).eq("id", id);
    const p = await this.getProject(id);
    if (!p) throw new Error(`Unknown project: ${id}`);
    return p;
  }

  async listSteps(projectId: string): Promise<ProjectStep[]> {
    const { data } = await this.db
      .from("project_step")
      .select("*")
      .eq("project_id", projectId)
      .order("ordinal");
    return rows(data).map(stepFromRow);
  }
  async stepsByProject(): Promise<Map<string, ProjectStep[]>> {
    const { data } = await this.db.from("project_step").select("*").order("ordinal");
    const map = new Map<string, ProjectStep[]>();
    for (const r of rows(data)) {
      const s = stepFromRow(r);
      const arr = map.get(s.projectId) ?? [];
      arr.push(s);
      map.set(s.projectId, arr);
    }
    return map;
  }
  async setStep(projectId: string, skillKey: string, patch: Partial<ProjectStep>): Promise<void> {
    const map: Row = {};
    if (patch.status !== undefined) map.status = patch.status;
    if (patch.linkedDocumentId !== undefined) map.linked_document_id = patch.linkedDocumentId;
    if (patch.completedAt !== undefined) map.completed_at = patch.completedAt;
    await this.db
      .from("project_step")
      .update(map)
      .eq("project_id", projectId)
      .eq("skill_key", skillKey);
    await this.db
      .from("project")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", projectId);
  }

  async listDocuments(): Promise<DocRecord[]> {
    const { data } = await this.db
      .from("document")
      .select("*")
      .order("created_at", { ascending: false });
    return rows(data).map(docFromRow);
  }
  async getDocument(id: string): Promise<DocRecord | undefined> {
    const { data } = await this.db.from("document").select("*").eq("id", id).maybeSingle();
    return data ? docFromRow(data as Row) : undefined;
  }
  async addDocument(doc: Omit<DocRecord, "id" | "createdAt">): Promise<DocRecord> {
    const { data } = await this.db
      .from("document")
      .insert({
        firm_id: doc.firmId,
        project_id: doc.projectId,
        run_version_id: doc.runVersionId,
        source: doc.source,
        skill_key: doc.skillKey,
        filename: doc.filename,
        format: doc.format,
        storage_path: doc.storagePath,
        size_bytes: doc.sizeBytes,
      })
      .select("*")
      .single();
    return docFromRow(data as Row);
  }
  async renameDocument(id: string, filename: string): Promise<void> {
    await this.db.from("document").update({ filename }).eq("id", id);
  }
  async deleteDocument(id: string): Promise<void> {
    await this.db.from("document").delete().eq("id", id);
  }

  async listActivities(limit = 20): Promise<ActivityEvent[]> {
    const { data } = await this.db
      .from("activity_event")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    return rows(data).map(activityFromRow);
  }
  async addActivity(type: string, text: string, projectId?: string): Promise<ActivityEvent> {
    const firm = await this.getFirm();
    const { data } = await this.db
      .from("activity_event")
      .insert({ firm_id: firm.id, project_id: projectId, type, text })
      .select("*")
      .single();
    return activityFromRow(data as Row);
  }

  private async loadVersions(runId: string): Promise<RunVersion[]> {
    const { data } = await this.db
      .from("run_version")
      .select("*")
      .eq("run_id", runId)
      .order("version_no");
    return rows(data).map(versionFromRow);
  }
  private async runFromRow(r: Row): Promise<Run> {
    return {
      id: req(r, "id"),
      projectId: req(r, "project_id"),
      skillKey: req(r, "skill_key"),
      inputs: (r.inputs as Record<string, string>) ?? {},
      versions: await this.loadVersions(req(r, "id")),
      createdAt: req(r, "created_at"),
    };
  }
  async createRun(
    projectId: string,
    skillKey: string,
    inputs: Record<string, string>,
  ): Promise<Run> {
    const { data } = await this.db
      .from("run")
      .insert({ project_id: projectId, skill_key: skillKey, inputs })
      .select("*")
      .single();
    return this.runFromRow(data as Row);
  }
  async getRun(id: string): Promise<Run | undefined> {
    const { data } = await this.db.from("run").select("*").eq("id", id).maybeSingle();
    return data ? this.runFromRow(data as Row) : undefined;
  }
  async runsFor(projectId: string, skillKey: string): Promise<Run[]> {
    const { data } = await this.db
      .from("run")
      .select("*")
      .eq("project_id", projectId)
      .eq("skill_key", skillKey);
    return Promise.all(rows(data).map((r) => this.runFromRow(r)));
  }
  async runVersionCount(): Promise<number> {
    const { count } = await this.db.from("run_version").select("*", { count: "exact", head: true });
    return count ?? 0;
  }
  async findVersion(versionId: string): Promise<{ run: Run; version: RunVersion } | undefined> {
    const { data } = await this.db
      .from("run_version")
      .select("*")
      .eq("id", versionId)
      .maybeSingle();
    if (!data) return undefined;
    const version = versionFromRow(data as Row);
    const run = await this.getRun(version.runId);
    return run ? { run, version } : undefined;
  }
  async addRunVersion(
    runId: string,
    v: Omit<RunVersion, "id" | "runId" | "versionNo" | "createdAt">,
  ): Promise<RunVersion> {
    const existing = await this.loadVersions(runId);
    const { data } = await this.db
      .from("run_version")
      .insert({
        run_id: runId,
        version_no: existing.length + 1,
        content_json: v.contentJson,
        preview_md: v.previewMd,
        model_used: v.modelUsed,
      })
      .select("*")
      .single();
    return versionFromRow(data as Row);
  }
}
