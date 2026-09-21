import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { name, email, password, phone, role, occupation, preferredCity } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const assignedRole = role === "OWNER" ? "OWNER" : "USER";

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        password: passwordHash,
        phone: phone || null,
        role: assignedRole,
        occupation: occupation || null,
        preferredCity: preferredCity || null,
        isVerified: false,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        ...(assignedRole === "OWNER"
          ? {
              ownerProfile: {
                create: {
                  businessName: `${name}'s Stays`,
                  verificationStatus: "PENDING",
                },
              },
            }
          : {}),
      },
    });

    await createSession(user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        isVerified: user.isVerified,
      },
    });
  } catch (err: any) {
    console.error("Register API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
