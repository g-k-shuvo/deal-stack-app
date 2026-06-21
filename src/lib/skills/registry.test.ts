import { describe, it, expect } from "vitest";
import {
  listSkills,
  getSkill,
  requireSkill,
  skillsByTrack,
  trackLength,
} from "@/lib/skills/registry";

describe("skill registry", () => {
  it("holds 15 skills (9 sell + 6 buy)", () => {
    expect(listSkills()).toHaveLength(15);
    expect(skillsByTrack("sell")).toHaveLength(9);
    expect(skillsByTrack("buy")).toHaveLength(6);
    expect(trackLength("sell")).toBe(9);
    expect(trackLength("buy")).toBe(6);
  });

  it("orders tracks by step", () => {
    const sell = skillsByTrack("sell");
    expect(sell.map((s) => s.step)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(sell[0]?.key).toBe("sell.client_profile");
  });

  it("looks up and requires skills", () => {
    expect(getSkill("sell.cim")?.name).toBe("CIM generator");
    expect(getSkill("nope")).toBeUndefined();
    expect(() => requireSkill("nope")).toThrow("Unknown skill");
  });

  it("every skill is well-formed", () => {
    const keys = new Set<string>();
    for (const s of listSkills()) {
      expect(keys.has(s.key)).toBe(false);
      keys.add(s.key);
      expect(["docx", "xlsx", "pptx"]).toContain(s.format);
      expect(["narrative", "model", "data"]).toContain(s.archetype);
      expect(s.instruction.length).toBeGreaterThan(10);
      expect(typeof s.outputSchema).toBe("object");
      expect(Array.isArray(s.chainsFrom)).toBe(true);
    }
  });

  it("chainsFrom references only existing skill keys", () => {
    const all = new Set(listSkills().map((s) => s.key));
    for (const s of listSkills()) {
      for (const dep of s.chainsFrom) expect(all.has(dep)).toBe(true);
    }
  });
});
