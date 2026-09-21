import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { status, ownerNotes } = body;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        property: true,
        tenant: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Permission check: Owner, Tenant, or Admin
    const isOwner = booking.property.ownerId === user.id;
    const isTenant = booking.tenantId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isOwner && !isTenant && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(ownerNotes ? { ownerNotes } : {}),
      },
      include: {
        property: true,
        tenant: true,
      },
    });

    // Notify tenant if owner accepted or rejected
    if (status === "ACCEPTED" || status === "REJECTED") {
      await prisma.notification.create({
        data: {
          userId: booking.tenantId,
          title: status === "ACCEPTED" ? "Booking Accepted!" : "Booking Request Update",
          message:
            status === "ACCEPTED"
              ? `Your booking for "${booking.property.title}" has been accepted! You can now proceed to pay the deposit.`
              : `Your booking request for "${booking.property.title}" was not accepted.`,
          type: status === "ACCEPTED" ? "BOOKING_ACCEPTED" : "BOOKING_REJECTED",
          link: "/dashboard",
        },
      });
    }

    return NextResponse.json({ success: true, booking: updated });
  } catch (err: any) {
    console.error("Update booking error:", err);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}
