import { NextResponse } from "next/server";
import { getCurrentUser, destroySession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ user });
}

export async function POST() {
  await destroySession();
  return NextResponse.json({ success: true });
}
