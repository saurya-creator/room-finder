import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const roleMode = searchParams.get("role") || user.role;

    let where: any = {};
    if (roleMode === "OWNER") {
      // Find properties owned by user
      where = {
        property: {
          ownerId: user.id,
        },
      };
    } else if (roleMode === "ADMIN") {
      where = {};
    } else {
      where = {
        tenantId: user.id,
      };
    }

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        property: {
          include: {
            images: { take: 1 },
            owner: {
              select: { id: true, name: true, phone: true, avatar: true },
            },
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            occupation: true,
            preferredCity: true,
          },
        },
        payment: true,
      },
    });

    return NextResponse.json({ bookings });
  } catch (err: any) {
    console.error("Bookings fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to book a room" }, { status: 401 });
    }

    const body = await req.json();
    const {
      propertyId,
      moveInDate,
      stayMonths,
      occupantsCount,
      tenantMessage,
      monthlyRent,
      depositAmount,
      maintenanceAmount,
      platformFee,
      taxesAmount,
      totalAmount,
    } = body;

    if (!propertyId || !moveInDate) {
      return NextResponse.json({ error: "Property ID and Move-in Date are required" }, { status: 400 });
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { owner: true },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const booking = await prisma.booking.create({
      data: {
        propertyId,
        tenantId: user.id,
        status: "REQUESTED",
        moveInDate: new Date(moveInDate),
        stayMonths: Number(stayMonths) || 3,
        occupantsCount: Number(occupantsCount) || 1,
        tenantMessage: tenantMessage || null,
        monthlyRent: Number(monthlyRent) || property.rentMonthly,
        depositAmount: Number(depositAmount) || property.deposit,
        maintenanceAmount: Number(maintenanceAmount) || property.maintenanceCharges,
        platformFee: Number(platformFee) || 299,
        taxesAmount: Number(taxesAmount) || 54,
        totalAmount: Number(totalAmount),
      },
      include: {
        property: true,
        tenant: true,
      },
    });

    // Create notification for property owner
    await prisma.notification.create({
      data: {
        userId: property.ownerId,
        title: "New Booking Request!",
        message: `${user.name} requested to book "${property.title}" from ${new Date(moveInDate).toLocaleDateString("en-IN")}.`,
        type: "BOOKING_REQUEST",
        link: "/owner/dashboard",
      },
    });

    return NextResponse.json({ success: true, booking });
  } catch (err: any) {
    console.error("Create booking error:", err);
    return NextResponse.json({ error: err.message || "Failed to create booking" }, { status: 500 });
  }
}
