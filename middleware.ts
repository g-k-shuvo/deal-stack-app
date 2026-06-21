import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Auth gate (PRD NFR-03). Active only when USE_SUPABASE_AUTH=1, so dev/E2E stay open.
export async function middleware(req: NextRequest) {
  if (process.env.USE_SUPABASE_AUTH !== "1") return NextResponse.next();

  const res = NextResponse.next();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(list: { name: string; value: string; options?: Record<string, unknown> }[]) {
        for (const { name, value, options } of list) {
          res.cookies.set(name, value, options as Parameters<typeof res.cookies.set>[2]);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLogin = req.nextUrl.pathname.startsWith("/login");
  if (!user && !isLogin) {
    const to = req.nextUrl.clone();
    to.pathname = "/login";
    return NextResponse.redirect(to);
  }
  if (user && isLogin) {
    const to = req.nextUrl.clone();
    to.pathname = "/";
    return NextResponse.redirect(to);
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/health).*)"],
};
