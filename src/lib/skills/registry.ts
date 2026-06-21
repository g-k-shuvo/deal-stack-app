import { CATALOG } from "@/lib/skills/catalog";
import type { Skill } from "@/lib/skills/types";
import type { Track } from "@/lib/types";

const byKey = new Map<string, Skill>(CATALOG.map((s) => [s.key, s]));

export function listSkills(): Skill[] {
  return [...CATALOG];
}

export function getSkill(key: string): Skill | undefined {
  return byKey.get(key);
}

export function requireSkill(key: string): Skill {
  const s = byKey.get(key);
  if (!s) throw new Error(`Unknown skill: ${key}`);
  return s;
}

export function skillsByTrack(track: Track): Skill[] {
  return CATALOG.filter((s) => s.track === track).sort((a, b) => a.step - b.step);
}

export function trackLength(track: Track): number {
  return skillsByTrack(track).length;
}
