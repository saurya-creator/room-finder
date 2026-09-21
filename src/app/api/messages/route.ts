import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ participant1Id: user.id }, { participant2Id: user.id }],
      },
      include: {
        property: {
          select: { id: true, title: true, area: true, city: true, images: { take: 1 } },
        },
        participant1: {
          select: { id: true, name: true, avatar: true, role: true },
        },
        participant2: {
          select: { id: true, name: true, avatar: true, role: true },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ conversations });
  } catch (err: any) {
    console.error("Messages GET error:", err);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId, receiverId, propertyId, content } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Message content cannot be empty" }, { status: 400 });
    }

    let targetConvId = conversationId;

    if (!targetConvId) {
      if (!receiverId) {
        return NextResponse.json({ error: "Receiver ID is required" }, { status: 400 });
      }

      // Find or create conversation
      let conv = await prisma.conversation.findFirst({
        where: {
          OR: [
            { participant1Id: user.id, participant2Id: receiverId },
            { participant1Id: receiverId, participant2Id: user.id },
          ],
          ...(propertyId ? { propertyId } : {}),
        },
      });

      if (!conv) {
        conv = await prisma.conversation.create({
          data: {
            participant1Id: user.id,
            participant2Id: receiverId,
            propertyId: propertyId || null,
          },
        });
      }
      targetConvId = conv.id;
    }

    const message = await prisma.message.create({
      data: {
        conversationId: targetConvId,
        senderId: user.id,
        content: content.trim(),
        readStatus: false,
      },
    });

    await prisma.conversation.update({
      where: { id: targetConvId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ success: true, message, conversationId: targetConvId });
  } catch (err: any) {
    console.error("Send message error:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
