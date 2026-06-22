import { NextResponse, type NextRequest } from "next/server";

// Auth gate (PRD NFR-03). Active only when USE_SUPABASE_AUTH=1, so dev/E2E stay open.
export async function middleware(req: NextRequest) {
  if (process.env.USE_SUPABASE_AUTH !== "1") return NextResponse.next();

  // Better Auth sessions are stored in session cookies
  const sessionToken =
    req.cookies.get("better-auth.session_token") ||
    req.cookies.get("__secure-better-auth.session_token");

  const pathname = req.nextUrl.pathname;

  // List of paths that require authentication (PRD §8.2)
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/projects") ||
    pathname.startsWith("/library") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/skills") ||
    pathname.startsWith("/how-to") ||
    pathname.startsWith("/search");

  const isLoginOrSignup = pathname.startsWith("/login") || pathname.startsWith("/signup");

  if (!sessionToken && isProtected) {
    const to = req.nextUrl.clone();
    to.pathname = "/login";
    // Preserve current path so user gets redirected back after signing in
    to.searchParams.set("callbackURL", pathname + req.nextUrl.search);
    return NextResponse.redirect(to);
  }

  if (sessionToken && isLoginOrSignup) {
    const to = req.nextUrl.clone();
    to.pathname = "/dashboard";
    return NextResponse.redirect(to);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/health).*)"],
};
