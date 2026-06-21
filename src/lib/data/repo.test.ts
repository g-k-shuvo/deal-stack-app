import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryRepo } from "@/lib/data/repo";
import { buildSeed } from "@/lib/data/seed";

function freshRepo() {
  return new InMemoryRepo(buildSeed(Date.parse("2026-06-21T00:00:00Z")));
}

describe("InMemoryRepo", () => {
  let repo: InMemoryRepo;
  beforeEach(() => {
    repo = freshRepo();
  });

  it("seeds firm + 7 projects", async () => {
    expect((await repo.getFirm()).name).toBe("Jackim Woods & Co.");
    expect(await repo.listProjects()).toHaveLength(7);
    expect((await repo.getProject("p-midwest"))?.companyName).toContain("Midwest HVAC");
  });

  it("creates a project with track steps + activity", async () => {
    const before = (await repo.listActivities()).length;
    const p = await repo.createProject({ companyName: "New Co", type: "buy" });
    expect(await repo.getProject(p.id)).toBeDefined();
    expect(await repo.listSteps(p.id)).toHaveLength(6);
    expect((await repo.listSteps(p.id)).every((s) => s.status === "notstarted")).toBe(true);
    expect((await repo.listActivities()).length).toBe(before + 1);
  });

  it("transitions a step", async () => {
    await repo.setStep("p-midwest", "sell.cim", { status: "inprogress" });
    const cim = (await repo.listSteps("p-midwest")).find((s) => s.skillKey === "sell.cim");
    expect(cim?.status).toBe("inprogress");
  });

  it("adds, renames, and deletes documents (unlinking steps)", async () => {
    const doc = await repo.addDocument({
      firmId: (await repo.getFirm()).id,
      projectId: "p-midwest",
      source: "ai",
      skillKey: "sell.cim",
      filename: "CIM_v1.docx",
      format: "docx",
      storagePath: "x",
      sizeBytes: 1,
    });
    await repo.setStep("p-midwest", "sell.cim", { status: "completed", linkedDocumentId: doc.id });
    await repo.renameDocument(doc.id, "CIM_final.docx");
    expect((await repo.getDocument(doc.id))?.filename).toBe("CIM_final.docx");
    await repo.deleteDocument(doc.id);
    expect(await repo.getDocument(doc.id)).toBeUndefined();
    expect((await repo.listSteps("p-midwest")).find((s) => s.skillKey === "sell.cim")?.linkedDocumentId).toBeUndefined();
  });

  it("creates runs and appends auto-incrementing versions", async () => {
    const run = await repo.createRun("p-midwest", "sell.cim", { yearFounded: "1998" });
    const v1 = await repo.addRunVersion(run.id, { contentJson: { title: "CIM", sections: [] }, previewMd: "# CIM", modelUsed: "m" });
    const v2 = await repo.addRunVersion(run.id, { contentJson: { title: "CIM2", sections: [] }, previewMd: "# CIM2", modelUsed: "m" });
    expect(v1.versionNo).toBe(1);
    expect(v2.versionNo).toBe(2);
    expect((await repo.getRun(run.id))?.versions).toHaveLength(2);
    expect(await repo.runsFor("p-midwest", "sell.cim")).toHaveLength(1);
    expect(await repo.runVersionCount()).toBe(2);
    expect((await repo.findVersion(v2.id))?.version.versionNo).toBe(2);
  });

  it("lists activities newest-first", async () => {
    const acts = await repo.listActivities(3);
    expect(acts).toHaveLength(3);
    expect(acts[0]!.createdAt >= acts[1]!.createdAt).toBe(true);
  });

  it("updates user, defaults, notifications, and style examples", async () => {
    expect((await repo.updateUser({ firstName: "Richard" })).firstName).toBe("Richard");
    expect((await repo.updateDefaults({ success_fee: "6%" })).success_fee).toBe("6%");
    await repo.setNotification("storage_warnings", false);
    expect((await repo.getNotifications()).find((n) => n.key === "storage_warnings")?.enabled).toBe(false);
    await repo.addStyleExample("sell.cim", "doc-1");
    await repo.addStyleExample("sell.cim", "doc-2");
    expect((await repo.listStyleExamples()).filter((s) => s.skillKey === "sell.cim")).toHaveLength(1);
    expect((await repo.listStyleExamples())[0]?.documentId).toBe("doc-2");
  });

  it("stores and retrieves blobs", async () => {
    await repo.putBlob("b1", Buffer.from("hello"));
    expect((await repo.getBlob("b1"))?.toString()).toBe("hello");
    expect(await repo.getBlob("missing")).toBeUndefined();
  });

  it("resets the workspace but keeps firm/user", async () => {
    await repo.resetWorkspace();
    expect(await repo.listProjects()).toHaveLength(0);
    expect(await repo.listDocuments()).toHaveLength(0);
    expect((await repo.getFirm()).name).toBe("Jackim Woods & Co.");
  });
});
