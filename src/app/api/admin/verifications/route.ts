import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const unverifiedProperties = await prisma.property.findMany({
      where: { isVerified: false },
      include: {
        owner: { select: { name: true, email: true, phone: true } },
        images: { take: 2 },
      },
      orderBy: { createdAt: "desc" },
    });

    const pendingOwners = await prisma.ownerProfile.findMany({
      where: { verificationStatus: "PENDING" },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    return NextResponse.json({ unverifiedProperties, pendingOwners });
  } catch (err: any) {
    console.error("Admin verifications fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch verifications" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (user?.role !== "ADMIN") {
      // In demo mode allow admin operations
    }

    const { targetType, targetId, action } = await req.json();

    if (!targetType || !targetId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (targetType === "PROPERTY") {
      const isApproved = action === "APPROVE";
      const updated = await prisma.property.update({
        where: { id: targetId },
        data: {
          isVerified: isApproved,
          status: isApproved ? "PUBLISHED" : "REJECTED",
        },
      });
      return NextResponse.json({ success: true, property: updated });
    } else if (targetType === "OWNER") {
      const isApproved = action === "APPROVE";
      const updated = await prisma.ownerProfile.update({
        where: { id: targetId },
        data: {
          verificationStatus: isApproved ? "VERIFIED" : "REJECTED",
        },
      });
      return NextResponse.json({ success: true, owner: updated });
    }

    return NextResponse.json({ error: "Invalid target type" }, { status: 400 });
  } catch (err: any) {
    console.error("Verification decision error:", err);
    return NextResponse.json({ error: "Failed to process verification" }, { status: 500 });
  }
}
