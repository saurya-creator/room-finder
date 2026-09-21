import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: propertyId } = params;
    const body = await req.json().catch(() => ({}));
    const shouldFavorite = body.isFavorite;

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId: user.id,
          propertyId,
        },
      },
    });

    if (shouldFavorite === true || (!existing && shouldFavorite === undefined)) {
      if (!existing) {
        await prisma.favorite.create({
          data: { userId: user.id, propertyId },
        });
        await prisma.property.update({
          where: { id: propertyId },
          data: { favoritesCount: { increment: 1 } },
        });
      }
      return NextResponse.json({ success: true, isFavorite: true });
    } else {
      if (existing) {
        await prisma.favorite.delete({
          where: { id: existing.id },
        });
        await prisma.property.update({
          where: { id: propertyId },
          data: { favoritesCount: { decrement: 1 } },
        });
      }
      return NextResponse.json({ success: true, isFavorite: false });
    }
  } catch (err: any) {
    console.error("Favorite toggle error:", err);
    return NextResponse.json({ error: "Failed to toggle favorite" }, { status: 500 });
  }
}
