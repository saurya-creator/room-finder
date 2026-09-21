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
    const roleParam = searchParams.get("role") || user.role;

    if (roleParam === "OWNER" || user.role === "OWNER") {
      // Fetch payments received by this owner's properties
      const payments = await prisma.payment.findMany({
        where: {
          booking: {
            property: {
              ownerId: user.id,
            },
          },
        },
        include: {
          booking: {
            include: {
              property: {
                select: {
                  id: true,
                  title: true,
                  city: true,
                  area: true,
                  rentMonthly: true,
                },
              },
              tenant: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                  avatar: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ success: true, payments });
    }

    // Default: Tenant's own payments
    const payments = await prisma.payment.findMany({
      where: {
        booking: {
          tenantId: user.id,
        },
      },
      include: {
        booking: {
          include: {
            property: {
              select: {
                id: true,
                title: true,
                city: true,
                area: true,
                rentMonthly: true,
                images: {
                  take: 1,
                  select: { url: true },
                },
                owner: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, payments });
  } catch (err: any) {
    console.error("Get payments error:", err);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}
