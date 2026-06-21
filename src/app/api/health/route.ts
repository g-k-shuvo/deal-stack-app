import { NextResponse } from "next/server";

// Healthcheck (PRD DOCKER-07). Extend to probe DB reachability in Phase 2.
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ status: "ok", time: new Date().toISOString() });
}
