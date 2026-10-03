import { NextResponse } from "next/server";

// Layer 1 stub — POST (public create) and GET (admin list) land in a later
// layer. GET must require isAdminRequest (see lib/admin-auth.ts); POST stays
// public.
export async function POST() {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}

export async function GET() {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
