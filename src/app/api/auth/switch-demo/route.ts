import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, role } = body;

    if (!email && !role) {
      return NextResponse.json(
        { error: "Email or role is required to switch persona" },
        { status: 400 }
      );
    }

    let user = null;

    // 1. Try finding by email
    if (email) {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
        include: { ownerProfile: true },
      });
    }

    // 2. If not found by email and role provided, try finding by role
    if (!user && role) {
      user = await prisma.user.findFirst({
        where: { role: role.toUpperCase() },
        include: { ownerProfile: true },
      });
    }

    // 3. If still not found, auto-create the demo user so switching NEVER fails
    if (!user) {
      const defaultPassword = await hashPassword("password123");

      if (role === "ADMIN" || email?.includes("admin") || email === "hackdark590@gmail.com") {
        user = await prisma.user.create({
          data: {
            name: "Site Owner & Super Admin",
            email: email ? email.toLowerCase().trim() : "hackdark590@gmail.com",
            password: defaultPassword,
            phone: "+91 99999 88888",
            role: "ADMIN",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
            gender: "Male",
            occupation: "Site Owner & Administrator",
            preferredCity: "Prayagraj",
            isVerified: true,
            ownerProfile: {
              create: {
                businessName: "Site Owner Official",
                verificationStatus: "VERIFIED",
                responseRate: 100,
                responseTime: "Instant",
              },
            },
          },
          include: { ownerProfile: true },
        });
      } else if (role === "OWNER" || email?.includes("owner") || email === "rajesh.mehra@example.com") {
        user = await prisma.user.create({
          data: {
            name: "Rajesh Mehra",
            email: email ? email.toLowerCase().trim() : "rajesh.mehra@example.com",
            password: defaultPassword,
            phone: "+91 98111 23456",
            role: "OWNER",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
            gender: "Male",
            preferredCity: "Prayagraj",
            isVerified: true,
            ownerProfile: {
              create: {
                businessName: "Mehra Stays & PGs",
                verificationStatus: "VERIFIED",
                responseRate: 98,
                responseTime: "Within 15 mins",
              },
            },
          },
          include: { ownerProfile: true },
        });
      } else {
        user = await prisma.user.create({
          data: {
            name: "Rahul Sharma",
            email: email ? email.toLowerCase().trim() : "rahul.sharma@example.com",
            password: defaultPassword,
            phone: "+91 97111 11111",
            role: "USER",
            avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80",
            gender: "Male",
            occupation: "Software Engineer",
            preferredCity: "Prayagraj",
            isVerified: true,
          },
          include: { ownerProfile: true },
        });
      }
    }

    // 4. Create session token
    const token = await createSession(user.id);

    // 5. Construct response with explicit cookie setting
    const res = NextResponse.json({
      success: true,
      message: `Switched persona to ${user.name} (${user.role})`,
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

    res.cookies.set("urbannest_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (err: any) {
    console.error("Switch demo error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to switch user" },
      { status: 500 }
    );
  }
}
