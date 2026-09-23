const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "hackdark590@gmail.com";
  const rawPassword = "sv#223221";

  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  console.log(`Setting up Super Admin / Owner: ${email}`);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: "ADMIN",
      isVerified: true,
      name: "Site Owner & Super Admin",
    },
    create: {
      email,
      password: hashedPassword,
      name: "Site Owner & Super Admin",
      role: "ADMIN",
      isVerified: true,
      phone: "+91 99999 88888",
      preferredCity: "Prayagraj",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
    },
  });

  // Ensure owner profile also exists for listing properties
  await prisma.ownerProfile.upsert({
    where: { userId: user.id },
    update: {
      verificationStatus: "VERIFIED",
    },
    create: {
      userId: user.id,
      businessName: "UrbanNest Management",
      verificationStatus: "VERIFIED",
      responseRate: 100,
      responseTime: "Instant",
    },
  });

  console.log("Successfully created/updated Super Admin user:");
  console.log({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
