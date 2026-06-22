import { describe, it, expect, afterEach } from "vitest";
import { generateForSkill, verifyFirmKey } from "@/lib/ai/provider";
import { assembleContext } from "@/lib/engine/context";
import { requireSkill } from "@/lib/skills/registry";
import type { FirmContext, ProjectContext } from "@/lib/types";
import type { Firm } from "@/lib/data/model";

const firmCtx: FirmContext = { name: "Jackim Woods & Co." };
const project: ProjectContext = { companyName: "Midwest HVAC", type: "sell", industry: "HVAC" };
const firmNoKey: Firm = {
  id: "f",
  name: "JWC",
  defaults: {},
  apiKeyVerified: false,
  storageLimitBytes: 0,
};

function ctxFor(key: string) {
  return assembleContext({ skill: requireSkill(key), firm: firmCtx, project });
}

describe("generateForSkill (mock path)", () => {
  it("returns schema-valid mock content + model 'mock' when no key is set", async () => {
    const r = await generateForSkill(ctxFor("sell.cim"), firmNoKey);
    expect(r.model).toBe("mock");
    expect((r.content as { title: string }).title).toContain("CONFIDENTIAL");
  });

  it("produces valid content for a data skill too", async () => {
    const r = await generateForSkill(ctxFor("sell.buyer_research"), firmNoKey);
    expect((r.content as { columns: string[] }).columns.length).toBeGreaterThan(0);
  });
});

describe("verifyFirmKey", () => {
  const prev = process.env.DCC_AI_MODE;
  afterEach(() => {
    if (prev === undefined) delete process.env.DCC_AI_MODE;
    else process.env.DCC_AI_MODE = prev;
  });
  it("passes in mock mode", async () => {
    process.env.DCC_AI_MODE = "mock";
    expect(await verifyFirmKey(firmNoKey)).toBe(true);
  });
  it("fails when no key is set and not mock", async () => {
    delete process.env.DCC_AI_MODE;
    expect(await verifyFirmKey(firmNoKey)).toBe(false);
  });
});
