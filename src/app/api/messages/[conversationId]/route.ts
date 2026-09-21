import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: { conversationId: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = params;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        property: {
          include: { images: { take: 1 } },
        },
        participant1: {
          select: { id: true, name: true, avatar: true, role: true },
        },
        participant2: {
          select: { id: true, name: true, avatar: true, role: true },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    return NextResponse.json({ conversation });
  } catch (err: any) {
    console.error("Conversation detail error:", err);
    return NextResponse.json({ error: "Failed to fetch conversation" }, { status: 500 });
  }
}
