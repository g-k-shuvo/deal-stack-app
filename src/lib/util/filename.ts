// Filename convention: {Skill}_{vN}_{Company}.{ext} (PRD REN-07).

export function slugForFile(s: string): string {
  return s
    .replace(/[^a-z0-9]+/gi, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
}

export function buildFilename(
  skillName: string,
  version: number,
  company: string,
  ext: string,
): string {
  return `${slugForFile(skillName)}_v${version}_${slugForFile(company)}.${ext}`;
}
