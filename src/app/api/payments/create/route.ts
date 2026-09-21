import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createRazorpayOrder } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    let { bookingId, amount, propertyId, paymentType = "FULL_DEPOSIT", moveInDate, stayMonths = 6 } = body;

    if (!amount) {
      return NextResponse.json({ error: "Amount is required" }, { status: 400 });
    }

    let targetBookingId = bookingId;

    // If no bookingId provided or bookingId is "instant", create a booking for the property
    if (!targetBookingId && propertyId) {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
      });
      if (!property) {
        return NextResponse.json({ error: "Property not found" }, { status: 404 });
      }

      const effectiveMoveIn = moveInDate ? new Date(moveInDate) : new Date(Date.now() + 86400000);
      const rent = property.rentMonthly;
      const deposit = property.deposit;
      const maintenance = property.maintenanceCharges || 0;
      const platformFee = 299;
      const taxes = 54;
      const totalAmount = rent + deposit + maintenance + platformFee + taxes;

      const newBooking = await prisma.booking.create({
        data: {
          propertyId: property.id,
          tenantId: user.id,
          moveInDate: effectiveMoveIn,
          stayMonths: Number(stayMonths),
          occupantsCount: 1,
          monthlyRent: rent,
          depositAmount: deposit,
          maintenanceAmount: maintenance,
          platformFee,
          taxesAmount: taxes,
          totalAmount: paymentType === "TOKEN_ADVANCE" ? 999 : totalAmount,
          status: "PAYMENT_PENDING",
        },
      });
      targetBookingId = newBooking.id;
    } else if (targetBookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: targetBookingId },
      });
      if (!booking) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      }
    } else {
      return NextResponse.json({ error: "Booking ID or Property ID required" }, { status: 400 });
    }

    // Create Razorpay order
    const order = createRazorpayOrder({
      amount: Number(amount),
      receipt: `rcpt_${targetBookingId.substring(0, 10)}`,
      notes: {
        bookingId: targetBookingId,
        tenantId: user.id,
        paymentType,
      },
    });

    return NextResponse.json({
      success: true,
      order,
      bookingId: targetBookingId,
      paymentType,
    });
  } catch (err: any) {
    console.error("Create payment order error:", err);
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 });
  }
}
