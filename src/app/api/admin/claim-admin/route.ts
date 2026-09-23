import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, createSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    let currentUser = await getCurrentUser();

    if (!currentUser) {
      // Find default admin or first user
      let admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
      if (!admin) {
        admin = await prisma.user.findFirst();
      }
      if (admin) {
        await createSession(admin.id);
        return NextResponse.json({
          success: true,
          message: "Signed in as Super Admin",
          user: { id: admin.id, name: admin.name, email: admin.email, role: "ADMIN" },
        });
      }
      return NextResponse.json({ error: "No user found to elevate" }, { status: 404 });
    }

    // Elevate current user to ADMIN
    const updated = await prisma.user.update({
      where: { id: currentUser.id },
      data: { role: "ADMIN", isVerified: true },
    });

    return NextResponse.json({
      success: true,
      message: "You are now Super Admin with full site editing rights!",
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
      },
    });
  } catch (err: any) {
    console.error("Claim admin error:", err);
    return NextResponse.json({ error: "Failed to claim admin status" }, { status: 500 });
  }
}
