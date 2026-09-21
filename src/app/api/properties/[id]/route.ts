import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const property = await prisma.property.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        images: { orderBy: { displayOrder: "asc" } },
        videos: true,
        amenities: true,
        rules: true,
        reviews: {
          include: {
            tenant: {
              select: { id: true, name: true, avatar: true, occupation: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            createdAt: true,
            ownerProfile: true,
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Increment view count
    await prisma.property.update({
      where: { id: property.id },
      data: { viewsCount: { increment: 1 } },
    });

    return NextResponse.json({ property });
  } catch (err: any) {
    console.error("Fetch property by ID error:", err);
    return NextResponse.json({ error: "Failed to fetch property details" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();

    const existing = await prisma.property.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Only owner or admin can update
    if (existing.ownerId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.property.update({
      where: { id },
      data: {
        ...(body.status ? { status: body.status } : {}),
        ...(body.rentMonthly ? { rentMonthly: Number(body.rentMonthly) } : {}),
        ...(body.deposit ? { deposit: Number(body.deposit) } : {}),
        ...(body.availableFrom ? { availableFrom: new Date(body.availableFrom) } : {}),
        ...(body.title ? { title: body.title } : {}),
        ...(body.description ? { description: body.description } : {}),
        ...(body.isVerified !== undefined && user.role === "ADMIN" ? { isVerified: body.isVerified } : {}),
      },
    });

    return NextResponse.json({ success: true, property: updated });
  } catch (err: any) {
    console.error("Update property error:", err);
    return NextResponse.json({ error: "Failed to update property" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const existing = await prisma.property.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    if (existing.ownerId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.property.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Property deleted" });
  } catch (err: any) {
    console.error("Delete property error:", err);
    return NextResponse.json({ error: "Failed to delete property" }, { status: 500 });
  }
}
