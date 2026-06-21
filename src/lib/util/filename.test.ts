import { describe, it, expect } from "vitest";
import { buildFilename, slugForFile } from "@/lib/util/filename";

describe("filename", () => {
  it("builds the convention {Skill}_{vN}_{Company}.{ext}", () => {
    expect(buildFilename("CIM generator", 2, "Midwest HVAC Services", "docx")).toBe(
      "CIM_generator_v2_Midwest_HVAC_Services.docx",
    );
  });
  it("slugifies special characters", () => {
    expect(slugForFile("a/b c!")).toBe("a_b_c");
    expect(slugForFile("__trim__")).toBe("trim");
  });
});
