import { InMemoryRepo, type Repo } from "@/lib/data/repo";
import { SupabaseRepo } from "@/lib/data/supabase-repo";
import { useSupabase } from "@/lib/data/supabase";

// Single source of data access. Selects the Supabase-backed repo when USE_SUPABASE=1
// (production), else a seeded in-memory repo (dev/test/E2E — deterministic, no service).
// Stored on globalThis so the singleton survives Next.js hot-reload in dev.

declare global {
  var __dccRepo: Repo | undefined;
}

export function getRepo(): Repo {
  if (!globalThis.__dccRepo) {
    globalThis.__dccRepo = useSupabase() ? new SupabaseRepo() : new InMemoryRepo();
  }
  return globalThis.__dccRepo;
}

export type { Repo } from "@/lib/data/repo";
