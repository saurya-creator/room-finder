import { NextResponse } from "next/server";
import { getCurrentUser, destroySession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json(
    { user },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}

export async function POST() {
  await destroySession();
  const res = NextResponse.json({ success: true });
  res.cookies.delete("urbannest_session");
  return res;
}
