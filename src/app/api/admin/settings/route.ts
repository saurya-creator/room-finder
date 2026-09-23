import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSiteSettings, saveSiteSettings } from "@/lib/site-settings.server";

export async function GET() {
  try {
    const settings = getSiteSettings();
    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to load site settings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Super Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const updated = saveSiteSettings(body);

    return NextResponse.json({ success: true, settings: updated });
  } catch (err: any) {
    console.error("Save site settings error:", err);
    return NextResponse.json({ error: err.message || "Failed to update settings" }, { status: 500 });
  }
}
