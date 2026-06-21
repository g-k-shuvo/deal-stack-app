import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Supabase SSR client bound to the request cookie store (for server actions / RSC).
export async function createSupabaseServerClient() {
  const store = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(list: { name: string; value: string; options?: Record<string, unknown> }[]) {
        try {
          for (const { name, value, options } of list) {
            store.set(name, value, options as Parameters<typeof store.set>[2]);
          }
        } catch {
          /* called from a RSC where cookies are read-only — ignore */
        }
      },
    },
  });
}
