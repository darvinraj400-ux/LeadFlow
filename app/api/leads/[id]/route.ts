import { NextResponse } from "next/server";

// Layer 1 stub — GET (admin read) and PATCH (admin update) land in a later
// layer. Both must require isAdminRequest (see lib/admin-auth.ts); POST
// /api/leads stays public.
export async function GET() {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}

export async function PATCH() {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
