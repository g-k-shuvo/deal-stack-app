import type { Track, SkillFormat } from "@/lib/types";

export type ProjectStatus = "prospect" | "active" | "onhold" | "closed";
export type StepStatus = "notstarted" | "inprogress" | "completed";
export type DocSource = "ai" | "uploaded";

export interface Firm {
  id: string;
  name: string;
  website?: string;
  address?: string;
  marketFocus?: string;
  industrySpecializations?: string;
  totalTransactions?: string;
  geography?: string;
  description?: string;
  advisorBio?: string;
  aiInstructions?: string;
  defaults: Record<string, string>;
  apiKeyEncrypted?: string;
  apiKeyVerified: boolean;
  storageLimitBytes: number;
}

export interface User {
  id: string;
  firmId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  title?: string;
  yearsExperience?: string;
}

export interface Project {
  id: string;
  firmId: string;
  companyName: string;
  website?: string;
  industry?: string;
  location?: string;
  type: Track;
  status: ProjectStatus;
  estValue?: string;
  ebitda?: string;
  multiple?: string;
  structure?: string;
  contactName?: string;
  contactTitle?: string;
  contactPhone?: string;
  engagementStart?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectStep {
  projectId: string;
  skillKey: string;
  ordinal: number;
  status: StepStatus;
  linkedDocumentId?: string;
  completedAt?: string;
}

export interface RunVersion {
  id: string;
  runId: string;
  versionNo: number;
  contentJson: unknown;
  previewMd: string;
  modelUsed: string;
  createdAt: string;
}

export interface Run {
  id: string;
  projectId: string;
  skillKey: string;
  inputs: Record<string, string>;
  versions: RunVersion[];
  createdAt: string;
}

export interface DocRecord {
  id: string;
  firmId: string;
  projectId?: string;
  runVersionId?: string;
  source: DocSource;
  skillKey?: string;
  filename: string;
  format: SkillFormat | "pdf";
  storagePath: string;
  sizeBytes: number;
  createdAt: string;
}

export interface ActivityEvent {
  id: string;
  firmId: string;
  projectId?: string;
  type: string;
  text: string;
  createdAt: string;
}
