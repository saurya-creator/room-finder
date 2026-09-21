import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const city = searchParams.get("city");
    const area = searchParams.get("area");
    const query = searchParams.get("query");
    const minRent = searchParams.get("minRent") ? parseInt(searchParams.get("minRent")!) : undefined;
    const maxRent = searchParams.get("maxRent") ? parseInt(searchParams.get("maxRent")!) : undefined;
    const roomType = searchParams.get("roomType")?.split(",").filter(Boolean);
    const propertyType = searchParams.get("propertyType")?.split(",").filter(Boolean);
    const furnishing = searchParams.get("furnishing")?.split(",").filter(Boolean);
    const genderPreference = searchParams.get("genderPreference");
    const tenantPreference = searchParams.get("tenantPreference");
    const verifiedOnly = searchParams.get("verifiedOnly") === "true";
    const foodIncluded = searchParams.get("foodIncluded") === "true";
    const noBrokerage = searchParams.get("noBrokerage") === "true";
    const sortBy = searchParams.get("sortBy") || "relevance";

    // Prisma filter conditions
    const where: any = {
      status: "PUBLISHED",
    };

    if (city) {
      where.city = { contains: city };
    }

    if (area) {
      where.area = { contains: area };
    }

    if (query) {
      where.OR = [
        { title: { contains: query } },
        { description: { contains: query } },
        { city: { contains: query } },
        { area: { contains: query } },
        { landmark: { contains: query } },
      ];
    }

    if (minRent !== undefined || maxRent !== undefined) {
      where.rentMonthly = {};
      if (minRent !== undefined) where.rentMonthly.gte = minRent;
      if (maxRent !== undefined) where.rentMonthly.lte = maxRent;
    }

    if (roomType && roomType.length > 0) {
      where.roomType = { in: roomType };
    }

    if (propertyType && propertyType.length > 0) {
      where.propertyType = { in: propertyType };
    }

    if (furnishing && furnishing.length > 0) {
      where.furnishing = { in: furnishing };
    }

    if (genderPreference && genderPreference !== "Any") {
      where.genderPreference = { in: [genderPreference, "Any"] };
    }

    if (tenantPreference && tenantPreference !== "Any") {
      where.tenantPreference = { in: [tenantPreference, "Any"] };
    }

    if (verifiedOnly) {
      where.isVerified = true;
    }

    if (foodIncluded) {
      where.foodIncluded = true;
    }

    if (noBrokerage) {
      where.noBrokerage = true;
    }

    // Sort order
    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "price_asc") {
      orderBy = { rentMonthly: "asc" };
    } else if (sortBy === "price_desc") {
      orderBy = { rentMonthly: "desc" };
    } else if (sortBy === "newest") {
      orderBy = { createdAt: "desc" };
    } else if (sortBy === "relevance" || sortBy === "rating") {
      orderBy = [{ featured: "desc" }, { viewsCount: "desc" }];
    }

    const properties = await prisma.property.findMany({
      where,
      orderBy,
      include: {
        images: { orderBy: { displayOrder: "asc" } },
        amenities: true,
        rules: true,
        reviews: {
          include: {
            tenant: {
              select: { id: true, name: true, avatar: true, occupation: true },
            },
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            ownerProfile: true,
          },
        },
      },
    });

    return NextResponse.json({ properties, total: properties.length });
  } catch (err: any) {
    console.error("Properties fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      propertyType,
      roomType,
      furnishing,
      floor,
      totalFloors,
      roomSizeSqft,
      bathrooms,
      balconies,
      kitchenType,
      parkingType,
      rentMonthly,
      deposit,
      maintenanceCharges,
      electricityIncluded,
      waterIncluded,
      foodIncluded,
      availableFrom,
      minStayMonths,
      maxStayMonths,
      genderPreference,
      tenantPreference,
      country,
      state,
      city,
      area,
      address,
      landmark,
      latitude,
      longitude,
      distanceToHub,
      images,
      amenities,
      rules,
    } = body;

    if (!title || !city || !area || !rentMonthly) {
      return NextResponse.json({ error: "Missing required listing details" }, { status: 400 });
    }

    const baseSlug = slugify(title);
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    // Create property listing
    const property = await prisma.property.create({
      data: {
        ownerId: user.id,
        title,
        slug,
        description: description || "No detailed description provided.",
        propertyType: propertyType || "Apartment",
        roomType: roomType || "Single",
        furnishing: furnishing || "Semi furnished",
        floor: Number(floor) || 1,
        totalFloors: Number(totalFloors) || 4,
        roomSizeSqft: Number(roomSizeSqft) || 250,
        bathrooms: Number(bathrooms) || 1,
        balconies: Number(balconies) || 1,
        kitchenType: kitchenType || "Shared",
        parkingType: parkingType || "Two Wheeler",
        rentMonthly: Number(rentMonthly),
        deposit: Number(deposit) || Number(rentMonthly),
        maintenanceCharges: Number(maintenanceCharges) || 0,
        electricityIncluded: !!electricityIncluded,
        waterIncluded: waterIncluded !== false,
        foodIncluded: !!foodIncluded,
        availableFrom: availableFrom ? new Date(availableFrom) : new Date(),
        minStayMonths: Number(minStayMonths) || 1,
        maxStayMonths: maxStayMonths ? Number(maxStayMonths) : 12,
        genderPreference: genderPreference || "Any",
        tenantPreference: tenantPreference || "Any",
        country: country || "India",
        state: state || "State",
        city,
        area,
        address: address || `${area}, ${city}`,
        landmark: landmark || null,
        latitude: Number(latitude) || 25.4526,
        longitude: Number(longitude) || 81.8349,
        distanceToHub: distanceToHub || null,
        status: "PUBLISHED",
        isVerified: user.role === "ADMIN" || user.isVerified,
        images: {
          create: (images && images.length > 0
            ? images
            : [
                {
                  url: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1000",
                  isCover: true,
                  caption: "Living Room",
                  displayOrder: 0,
                },
              ]
          ).map((img: any, idx: number) => ({
            url: typeof img === "string" ? img : img.url,
            isCover: idx === 0,
            displayOrder: idx,
            caption: img.caption || `Image ${idx + 1}`,
          })),
        },
        amenities: {
          create: (amenities || []).map((a: any) => ({
            name: typeof a === "string" ? a : a.name,
            category: a.category || "General",
            iconKey: a.iconKey || "wifi",
          })),
        },
        rules: {
          create: (rules || []).map((r: any) => ({
            ruleText: typeof r === "string" ? r : r.ruleText,
            ruleType: r.ruleType || "ALLOWED",
          })),
        },
      },
      include: {
        images: true,
        amenities: true,
        rules: true,
      },
    });

    return NextResponse.json({ success: true, property });
  } catch (err: any) {
    console.error("Create property error:", err);
    return NextResponse.json({ error: err.message || "Failed to create property" }, { status: 500 });
  }
}
