import { NextResponse } from "next/server";

// Layer 1 stub — admin login lands in a later layer.
export async function POST() {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
