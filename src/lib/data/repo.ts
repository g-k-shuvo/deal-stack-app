import { randomUUID } from "node:crypto";
import type {
  Firm,
  User,
  Project,
  ProjectStep,
  DocRecord,
  ActivityEvent,
  Run,
  RunVersion,
} from "@/lib/data/model";
import type { Track } from "@/lib/types";
import { skillsByTrack } from "@/lib/skills/registry";
import { buildSeed, type SeedData } from "@/lib/data/seed";

export interface CreateProjectInput {
  companyName: string;
  type: Track;
  status?: Project["status"];
  industry?: string;
  location?: string;
  website?: string;
  estValue?: string;
  contactName?: string;
  contactTitle?: string;
  contactPhone?: string;
}

// Async so a Supabase-backed adapter can implement the same interface (PRD §15).
export interface Repo {
  getFirm(): Promise<Firm>;
  updateFirm(patch: Partial<Firm>): Promise<Firm>;
  updateDefaults(patch: Record<string, string>): Promise<Record<string, string>>;
  getUser(): Promise<User>;
  updateUser(patch: Partial<User>): Promise<User>;
  getNotifications(): Promise<{ key: string; enabled: boolean }[]>;
  setNotification(key: string, enabled: boolean): Promise<void>;
  listStyleExamples(): Promise<{ skillKey: string; documentId: string }[]>;
  addStyleExample(skillKey: string, documentId: string): Promise<void>;
  putBlob(id: string, bytes: Buffer): Promise<void>;
  getBlob(id: string): Promise<Buffer | undefined>;
  resetWorkspace(): Promise<void>;
  listProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(input: CreateProjectInput): Promise<Project>;
  updateProject(id: string, patch: Partial<Project>): Promise<Project>;
  listSteps(projectId: string): Promise<ProjectStep[]>;
  stepsByProject(): Promise<Map<string, ProjectStep[]>>;
  setStep(projectId: string, skillKey: string, patch: Partial<ProjectStep>): Promise<void>;
  listDocuments(): Promise<DocRecord[]>;
  getDocument(id: string): Promise<DocRecord | undefined>;
  addDocument(doc: Omit<DocRecord, "id" | "createdAt">): Promise<DocRecord>;
  renameDocument(id: string, filename: string): Promise<void>;
  deleteDocument(id: string): Promise<void>;
  listActivities(limit?: number): Promise<ActivityEvent[]>;
  addActivity(type: string, text: string, projectId?: string): Promise<ActivityEvent>;
  createRun(projectId: string, skillKey: string, inputs: Record<string, string>): Promise<Run>;
  getRun(id: string): Promise<Run | undefined>;
  runsFor(projectId: string, skillKey: string): Promise<Run[]>;
  runVersionCount(): Promise<number>;
  findVersion(versionId: string): Promise<{ run: Run; version: RunVersion } | undefined>;
  addRunVersion(
    runId: string,
    v: Omit<RunVersion, "id" | "runId" | "versionNo" | "createdAt">,
  ): Promise<RunVersion>;
}

export class InMemoryRepo implements Repo {
  private firm: Firm;
  private user: User;
  private projects: Project[];
  private steps: ProjectStep[];
  private documents: DocRecord[];
  private activities: ActivityEvent[];
  private runs: Run[] = [];
  private notifications = [
    { key: "skill_run_completion", enabled: true },
    { key: "new_updated_skills", enabled: true },
    { key: "storage_warnings", enabled: true },
    { key: "api_key_issues", enabled: true },
  ];
  private styleExamples: { skillKey: string; documentId: string }[] = [];
  private blobs = new Map<string, Buffer>();

  constructor(seed: SeedData = buildSeed()) {
    this.firm = seed.firm;
    this.user = seed.user;
    this.projects = seed.projects;
    this.steps = seed.steps;
    this.documents = seed.documents;
    this.activities = seed.activities;
  }

  async getFirm() {
    return this.firm;
  }
  async updateFirm(patch: Partial<Firm>) {
    this.firm = { ...this.firm, ...patch };
    return this.firm;
  }
  async updateDefaults(patch: Record<string, string>) {
    this.firm = { ...this.firm, defaults: { ...this.firm.defaults, ...patch } };
    return this.firm.defaults;
  }
  async getUser() {
    return this.user;
  }
  async updateUser(patch: Partial<User>) {
    this.user = { ...this.user, ...patch };
    return this.user;
  }
  async getNotifications() {
    return [...this.notifications];
  }
  async setNotification(key: string, enabled: boolean) {
    const n = this.notifications.find((x) => x.key === key);
    if (n) n.enabled = enabled;
  }
  async listStyleExamples() {
    return [...this.styleExamples];
  }
  async addStyleExample(skillKey: string, documentId: string) {
    this.styleExamples = this.styleExamples.filter((s) => s.skillKey !== skillKey);
    this.styleExamples.push({ skillKey, documentId });
  }
  async putBlob(id: string, bytes: Buffer) {
    this.blobs.set(id, bytes);
  }
  async getBlob(id: string) {
    return this.blobs.get(id);
  }
  async resetWorkspace() {
    this.projects = [];
    this.steps = [];
    this.runs = [];
    this.documents = [];
    this.activities = [];
    this.styleExamples = [];
    this.blobs.clear();
  }

  async listProjects() {
    return [...this.projects];
  }
  async getProject(id: string) {
    return this.projects.find((p) => p.id === id);
  }
  async createProject(input: CreateProjectInput) {
    const now = new Date().toISOString();
    const project: Project = {
      id: `p-${randomUUID().slice(0, 8)}`,
      firmId: this.firm.id,
      companyName: input.companyName,
      type: input.type,
      status: input.status ?? "prospect",
      industry: input.industry,
      location: input.location,
      website: input.website,
      estValue: input.estValue,
      contactName: input.contactName,
      contactTitle: input.contactTitle,
      contactPhone: input.contactPhone,
      createdAt: now,
      updatedAt: now,
    };
    this.projects.unshift(project);
    for (const s of skillsByTrack(input.type)) {
      this.steps.push({
        projectId: project.id,
        skillKey: s.key,
        ordinal: s.step,
        status: "notstarted",
      });
    }
    await this.addActivity("status", `${project.companyName} created`, project.id);
    return project;
  }
  async updateProject(id: string, patch: Partial<Project>) {
    const p = this.projects.find((x) => x.id === id);
    if (!p) throw new Error(`Unknown project: ${id}`);
    Object.assign(p, patch, { updatedAt: new Date().toISOString() });
    return p;
  }

  async listSteps(projectId: string) {
    return this.steps
      .filter((s) => s.projectId === projectId)
      .sort((a, b) => a.ordinal - b.ordinal);
  }
  async stepsByProject() {
    const map = new Map<string, ProjectStep[]>();
    for (const s of this.steps) {
      const arr = map.get(s.projectId) ?? [];
      arr.push(s);
      map.set(s.projectId, arr);
    }
    return map;
  }
  async setStep(projectId: string, skillKey: string, patch: Partial<ProjectStep>) {
    const step = this.steps.find((s) => s.projectId === projectId && s.skillKey === skillKey);
    if (!step) throw new Error(`Unknown step: ${projectId}/${skillKey}`);
    Object.assign(step, patch);
    this.touch(projectId);
  }

  async listDocuments() {
    return [...this.documents].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  async getDocument(id: string) {
    return this.documents.find((d) => d.id === id);
  }
  async addDocument(doc: Omit<DocRecord, "id" | "createdAt">) {
    const record: DocRecord = {
      ...doc,
      id: `d-${randomUUID().slice(0, 8)}`,
      createdAt: new Date().toISOString(),
    };
    this.documents.unshift(record);
    return record;
  }
  async renameDocument(id: string, filename: string) {
    const d = this.documents.find((x) => x.id === id);
    if (d) d.filename = filename;
  }
  async deleteDocument(id: string) {
    this.documents = this.documents.filter((d) => d.id !== id);
    for (const s of this.steps) if (s.linkedDocumentId === id) s.linkedDocumentId = undefined;
  }

  async listActivities(limit = 20) {
    return [...this.activities]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }
  async addActivity(type: string, text: string, projectId?: string) {
    const ev: ActivityEvent = {
      id: `a-${randomUUID().slice(0, 8)}`,
      firmId: this.firm.id,
      projectId,
      type,
      text,
      createdAt: new Date().toISOString(),
    };
    this.activities.unshift(ev);
    return ev;
  }

  async createRun(projectId: string, skillKey: string, inputs: Record<string, string>) {
    const run: Run = {
      id: `r-${randomUUID().slice(0, 8)}`,
      projectId,
      skillKey,
      inputs,
      versions: [],
      createdAt: new Date().toISOString(),
    };
    this.runs.push(run);
    return run;
  }
  async getRun(id: string) {
    return this.runs.find((r) => r.id === id);
  }
  async runsFor(projectId: string, skillKey: string) {
    return this.runs.filter((r) => r.projectId === projectId && r.skillKey === skillKey);
  }
  async runVersionCount() {
    return this.runs.reduce((n, r) => n + r.versions.length, 0);
  }
  async findVersion(versionId: string) {
    for (const run of this.runs) {
      const version = run.versions.find((v) => v.id === versionId);
      if (version) return { run, version };
    }
    return undefined;
  }
  async addRunVersion(
    runId: string,
    v: Omit<RunVersion, "id" | "runId" | "versionNo" | "createdAt">,
  ) {
    const run = this.runs.find((r) => r.id === runId);
    if (!run) throw new Error(`Unknown run: ${runId}`);
    const version: RunVersion = {
      ...v,
      id: `rv-${randomUUID().slice(0, 8)}`,
      runId,
      versionNo: run.versions.length + 1,
      createdAt: new Date().toISOString(),
    };
    run.versions.push(version);
    return version;
  }

  private touch(projectId: string) {
    const p = this.projects.find((x) => x.id === projectId);
    if (p) p.updatedAt = new Date().toISOString();
  }
}
