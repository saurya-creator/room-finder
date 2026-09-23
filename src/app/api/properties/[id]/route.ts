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

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.rentMonthly !== undefined) updateData.rentMonthly = Number(body.rentMonthly);
    if (body.deposit !== undefined) updateData.deposit = Number(body.deposit);
    if (body.maintenanceCharges !== undefined) updateData.maintenanceCharges = Number(body.maintenanceCharges);
    if (body.propertyType !== undefined) updateData.propertyType = body.propertyType;
    if (body.roomType !== undefined) updateData.roomType = body.roomType;
    if (body.furnishing !== undefined) updateData.furnishing = body.furnishing;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.area !== undefined) updateData.area = body.area;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.landmark !== undefined) updateData.landmark = body.landmark;
    if (body.latitude !== undefined) updateData.latitude = Number(body.latitude);
    if (body.longitude !== undefined) updateData.longitude = Number(body.longitude);
    if (body.genderPreference !== undefined) updateData.genderPreference = body.genderPreference;
    if (body.tenantPreference !== undefined) updateData.tenantPreference = body.tenantPreference;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.isVerified !== undefined && user.role === "ADMIN") updateData.isVerified = Boolean(body.isVerified);
    if (body.featured !== undefined && user.role === "ADMIN") updateData.featured = Boolean(body.featured);
    if (body.availableFrom !== undefined) updateData.availableFrom = new Date(body.availableFrom);

    const updated = await prisma.property.update({
      where: { id },
      data: updateData,
    });

    // If new images array provided
    if (Array.isArray(body.images) && body.images.length > 0) {
      await prisma.propertyImage.deleteMany({ where: { propertyId: id } });
      await prisma.propertyImage.createMany({
        data: body.images.map((img: any, idx: number) => ({
          propertyId: id,
          url: typeof img === "string" ? img : img.url,
          isCover: idx === 0,
          displayOrder: idx,
        })),
      });
    }

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
