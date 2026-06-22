import type { Firm, User, Project, ProjectStep, DocRecord, ActivityEvent } from "@/lib/data/model";
import type { Track } from "@/lib/types";
import { skillsByTrack } from "@/lib/skills/registry";

// In-memory seed mirroring supabase/seed.sql (PRD Appendix A), internally consistent.

export const FIRM_ID = "firm-jwc";

export function buildFirm(): Firm {
  return {
    id: FIRM_ID,
    name: "Jackim Woods & Co.",
    website: "jackim.com",
    address: "Chicago, IL",
    marketFocus: "Lower middle market · $1M–$25M transactions",
    industrySpecializations: "Manufacturing, Healthcare, Business Services, Distribution",
    totalTransactions: "70+",
    geography: "Midwest / National",
    description:
      "Jackim Woods & Co. is a Chicago-based M&A advisory firm specializing in lower middle-market transactions, serving owners and investors across the Midwest and nationally.",
    advisorBio:
      "Rich Jackim is the Managing Director of Jackim Woods & Co. with more than 30 years of M&A experience and over 70 closed transactions.",
    aiInstructions:
      "Write in a professional, confident tone appropriate for lower middle-market M&A. Use Jackim Woods & Co. as the advisor firm name. Keep executive summaries to one page. Present financial figures in thousands (000s).",
    defaults: {
      success_fee: "5%",
      retainer: "$5,000",
      exclusivity: "12 months",
      deal_size_range: "$1M – $25M",
      default_type: "sell",
      default_status: "prospect",
    },
    apiKeyVerified: false,
    storageLimitBytes: 10 * 1024 * 1024 * 1024,
  };
}

export function buildUser(): User {
  return {
    id: "user-rich",
    firmId: FIRM_ID,
    firstName: "Rich",
    lastName: "Jackim",
    email: "rich@jackim.com",
    phone: "847-555-0141",
    title: "Managing Director",
    yearsExperience: "30+",
  };
}

interface ProjectSeed extends Omit<Project, "firmId" | "createdAt" | "updatedAt"> {
  completed: number;
  updatedDaysAgo: number;
}

const PROJECT_SEEDS: ProjectSeed[] = [
  {
    id: "p-midwest",
    companyName: "Midwest HVAC Services, LLC",
    website: "midwesthvac.com",
    industry: "Manufacturing / HVAC",
    location: "Dayton, OH",
    type: "sell",
    status: "active",
    estValue: "$4.2M",
    ebitda: "$840K",
    multiple: "5.0x",
    structure: "Asset sale",
    contactName: "Tom Kowalski",
    contactTitle: "Owner",
    contactPhone: "937-555-0182",
    engagementStart: "2026-05-12",
    completed: 5,
    updatedDaysAgo: 0,
  },
  {
    id: "p-apex",
    companyName: "Apex Distribution Partners",
    industry: "Distribution / Logistics",
    type: "buy",
    status: "active",
    estValue: "$8–15M target",
    contactName: "Sandra Cho",
    contactTitle: "CFO",
    completed: 2,
    updatedDaysAgo: 1,
  },
  {
    id: "p-lakeview",
    companyName: "Lakeview Dental Group",
    industry: "Healthcare",
    type: "sell",
    status: "prospect",
    estValue: "$2.8M",
    contactName: "Dr. Karen Wu",
    contactTitle: "Owner",
    completed: 2,
    updatedDaysAgo: 3,
  },
  {
    id: "p-summit",
    companyName: "Summit Tech Solutions",
    industry: "Technology",
    type: "sell",
    status: "active",
    contactName: "Brian Foster",
    completed: 7,
    updatedDaysAgo: 4,
  },
  {
    id: "p-prairie",
    companyName: "Prairie Winds Energy",
    industry: "Energy",
    type: "sell",
    status: "onhold",
    contactName: "Diane Reyes",
    completed: 4,
    updatedDaysAgo: 14,
  },
  {
    id: "p-greenfield",
    companyName: "Greenfield Landscaping",
    industry: "Services",
    type: "sell",
    status: "prospect",
    contactName: "Mark Ellis",
    completed: 1,
    updatedDaysAgo: 21,
  },
  {
    id: "p-novacare",
    companyName: "NovaCare Home Health",
    industry: "Healthcare",
    type: "buy",
    status: "active",
    contactName: "Lisa Tran",
    completed: 3,
    updatedDaysAgo: 7,
  },
];

function iso(now: number, msAgo: number): string {
  return new Date(now - msAgo).toISOString();
}

export function buildSteps(
  projectId: string,
  track: Track,
  completed: number,
  active: boolean,
): ProjectStep[] {
  return skillsByTrack(track).map((s, i) => ({
    projectId,
    skillKey: s.key,
    ordinal: s.step,
    status: i < completed ? "completed" : i === completed && active ? "inprogress" : "notstarted",
    completedAt: i < completed ? undefined : undefined,
  }));
}

export interface SeedData {
  firm: Firm;
  user: User;
  projects: Project[];
  steps: ProjectStep[];
  documents: DocRecord[];
  activities: ActivityEvent[];
}

export function buildSeed(now: number = Date.now()): SeedData {
  const projects: Project[] = PROJECT_SEEDS.map((p) => ({
    id: p.id,
    firmId: FIRM_ID,
    companyName: p.companyName,
    website: p.website,
    industry: p.industry,
    location: p.location,
    type: p.type,
    status: p.status,
    estValue: p.estValue,
    ebitda: p.ebitda,
    multiple: p.multiple,
    structure: p.structure,
    contactName: p.contactName,
    contactTitle: p.contactTitle,
    contactPhone: p.contactPhone,
    engagementStart: p.engagementStart,
    createdAt: iso(now, 40 * 86_400_000),
    updatedAt: iso(now, p.updatedDaysAgo * 86_400_000),
  }));

  const steps: ProjectStep[] = PROJECT_SEEDS.flatMap((p) =>
    buildSteps(p.id, p.type, p.completed, p.status === "active"),
  );

  const documents: DocRecord[] = [
    {
      id: "d-cp",
      firmId: FIRM_ID,
      projectId: "p-midwest",
      source: "ai",
      skillKey: "sell.client_profile",
      filename: "Client_Profile_HVAC.docx",
      format: "docx",
      storagePath: "seed/cp.docx",
      sizeBytes: 48000,
      createdAt: iso(now, 9 * 86_400_000),
    },
    {
      id: "d-val",
      firmId: FIRM_ID,
      projectId: "p-midwest",
      source: "ai",
      skillKey: "sell.valuation",
      filename: "Valuation_HVAC.xlsx",
      format: "xlsx",
      storagePath: "seed/val.xlsx",
      sizeBytes: 64000,
      createdAt: iso(now, 7 * 86_400_000),
    },
    {
      id: "d-ma",
      firmId: FIRM_ID,
      projectId: "p-midwest",
      source: "ai",
      skillKey: "sell.market_assessment",
      filename: "Market_Assessment_HVAC.pptx",
      format: "pptx",
      storagePath: "seed/ma.pptx",
      sizeBytes: 512000,
      createdAt: iso(now, 5 * 86_400_000),
    },
    {
      id: "d-eng",
      firmId: FIRM_ID,
      projectId: "p-midwest",
      source: "ai",
      skillKey: "sell.engagement",
      filename: "Engagement_Agreement_HVAC.docx",
      format: "docx",
      storagePath: "seed/eng.docx",
      sizeBytes: 52000,
      createdAt: iso(now, 4 * 86_400_000),
    },
    {
      id: "d-dr",
      firmId: FIRM_ID,
      projectId: "p-midwest",
      source: "ai",
      skillKey: "sell.data_room_checklist",
      filename: "Data_Room_Checklist_HVAC.xlsx",
      format: "xlsx",
      storagePath: "seed/dr.xlsx",
      sizeBytes: 40000,
      createdAt: iso(now, 2 * 86_400_000),
    },
    {
      id: "d-fin",
      firmId: FIRM_ID,
      projectId: "p-midwest",
      source: "uploaded",
      filename: "HVAC_Financials_3yr.xlsx",
      format: "xlsx",
      storagePath: "seed/up/fin.xlsx",
      sizeBytes: 88000,
      createdAt: iso(now, 8 * 86_400_000),
    },
    {
      id: "d-tax",
      firmId: FIRM_ID,
      projectId: "p-midwest",
      source: "uploaded",
      filename: "Tax_Returns_2023_2024.pdf",
      format: "pdf",
      storagePath: "seed/up/tax.pdf",
      sizeBytes: 120000,
      createdAt: iso(now, 8 * 86_400_000),
    },
    {
      id: "d-lake",
      firmId: FIRM_ID,
      projectId: "p-lakeview",
      source: "uploaded",
      filename: "Lakeview_Dental_Financials.pdf",
      format: "pdf",
      storagePath: "seed/up/lake.pdf",
      sizeBytes: 96000,
      createdAt: iso(now, 6 * 86_400_000),
    },
  ];

  // link Midwest completed steps to their deliverables
  const linkMap: Record<string, string> = {
    "sell.client_profile": "d-cp",
    "sell.valuation": "d-val",
    "sell.market_assessment": "d-ma",
    "sell.engagement": "d-eng",
    "sell.data_room_checklist": "d-dr",
  };
  for (const step of steps) {
    if (step.projectId === "p-midwest" && linkMap[step.skillKey] && step.status === "completed") {
      step.linkedDocumentId = linkMap[step.skillKey];
    }
  }

  const activities: ActivityEvent[] = [
    {
      id: "a1",
      firmId: FIRM_ID,
      projectId: "p-midwest",
      type: "step",
      text: "Data room checklist completed — Midwest HVAC Services",
      createdAt: iso(now, 2 * 3_600_000),
    },
    {
      id: "a2",
      firmId: FIRM_ID,
      projectId: "p-apex",
      type: "upload",
      text: "3 files uploaded to Apex Distribution data room",
      createdAt: iso(now, 5 * 3_600_000),
    },
    {
      id: "a3",
      firmId: FIRM_ID,
      projectId: "p-lakeview",
      type: "status",
      text: "Lakeview Dental moved to Prospect",
      createdAt: iso(now, 1 * 86_400_000),
    },
    {
      id: "a4",
      firmId: FIRM_ID,
      projectId: "p-midwest",
      type: "step",
      text: "Engagement agreement completed — Midwest HVAC Services",
      createdAt: iso(now, 2 * 86_400_000),
    },
    {
      id: "a5",
      firmId: FIRM_ID,
      projectId: "p-lakeview",
      type: "step",
      text: "Market assessment completed — Lakeview Dental Group",
      createdAt: iso(now, 3 * 86_400_000),
    },
    {
      id: "a6",
      firmId: FIRM_ID,
      projectId: "p-apex",
      type: "nda",
      text: "NDA executed — Apex Distribution, buyer #3",
      createdAt: iso(now, 4 * 86_400_000),
    },
    {
      id: "a7",
      firmId: FIRM_ID,
      projectId: "p-midwest",
      type: "status",
      text: "Midwest HVAC status changed to Active",
      createdAt: iso(now, 7 * 86_400_000),
    },
  ];

  return { firm: buildFirm(), user: buildUser(), projects, steps, documents, activities };
}
