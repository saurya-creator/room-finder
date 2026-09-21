import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { verifyRazorpaySignature } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      bookingId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paymentMethod = "UPI",
      paidAmountRupees,
    } = await req.json();

    if (!bookingId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: "Missing required payment verification details" }, { status: 400 });
    }

    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid payment signature verification failed" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        property: {
          include: {
            owner: {
              select: { id: true, name: true, email: true, phone: true },
            },
          },
        },
        tenant: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const effectivePaidRupees = paidAmountRupees || booking.totalAmount;
    const amountInPaise = effectivePaidRupees * 100;
    const receiptNum = `RCPT-${new Date().getFullYear()}-${bookingId.slice(-6).toUpperCase()}`;

    // Save payment and transition booking
    const payment = await prisma.payment.upsert({
      where: { bookingId },
      create: {
        bookingId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        amount: amountInPaise,
        currency: "INR",
        status: "SUCCESS",
        receiptUrl: `/receipts/${receiptNum}.pdf`,
      },
      update: {
        razorpayPaymentId,
        razorpaySignature,
        status: "SUCCESS",
        amount: amountInPaise,
      },
    });

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CONFIRMED",
        paidAmount: (booking.paidAmount || 0) + effectivePaidRupees,
      },
    });

    // Notify owner about confirmed booking & payment
    await prisma.notification.create({
      data: {
        userId: booking.property.ownerId,
        title: "Payment Received - Booking Confirmed!",
        message: `Payment of ₹${effectivePaidRupees.toLocaleString("en-IN")} via ${paymentMethod} for "${booking.property.title}" received successfully.`,
        type: "PAYMENT_RECEIVED",
        link: "/owner/dashboard",
      },
    });

    // Notify tenant
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Payment Successful & Room Locked!",
        message: `Your payment of ₹${effectivePaidRupees.toLocaleString("en-IN")} for "${booking.property.title}" was verified. Receipt #${receiptNum} generated.`,
        type: "PAYMENT_RECEIVED",
        link: "/dashboard",
      },
    });

    const receipt = {
      receiptNumber: receiptNum,
      transactionId: razorpayPaymentId,
      orderId: razorpayOrderId,
      paymentMethod,
      amount: effectivePaidRupees,
      paidAt: new Date().toISOString(),
      status: "SUCCESS",
      tenant: {
        name: booking.tenant.name || user.name || "Tenant",
        email: booking.tenant.email || user.email || "",
        phone: booking.tenant.phone || "Not provided",
      },
      landlord: {
        name: booking.property.owner.name || "Property Host",
        email: booking.property.owner.email || "",
        phone: booking.property.owner.phone || "+91 98765 43210",
        pan: "ABCPR9482K",
      },
      property: {
        title: booking.property.title,
        address: `${booking.property.address}, ${booking.property.area}, ${booking.property.city}`,
        city: booking.property.city,
      },
      breakdown: {
        monthlyRent: booking.monthlyRent,
        depositAmount: booking.depositAmount,
        maintenanceAmount: booking.maintenanceAmount,
        platformFee: booking.platformFee,
        taxesAmount: booking.taxesAmount,
        totalAmount: booking.totalAmount,
        paidNow: effectivePaidRupees,
      },
    };

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      payment,
      receipt,
    });
  } catch (err: any) {
    console.error("Payment verification error:", err);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}
