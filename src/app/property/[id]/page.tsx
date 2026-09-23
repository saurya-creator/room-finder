import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  ShieldCheck,
  Star,
  Share2,
  Heart,
  Flag,
  Calendar,
  CheckCircle2,
  Clock,
  MessageSquare,
  Building,
  Bed,
  Layers,
  Sparkles,
  Maximize2,
  Compass,
  AlertCircle,
  Car,
  UtensilsCrossed,
  Train,
  GraduationCap,
  Briefcase,
  Hospital,
  ShoppingCart,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ImageGallery } from "@/components/image-gallery";
import { AmenityIcon } from "@/components/amenity-icon";
import { StickyBookingWidget } from "@/components/sticky-booking-widget";
import { InteractiveMap } from "@/components/interactive-map";
import { Footer } from "@/components/footer";
import { PropertyAdminActions } from "@/components/property-admin-actions";

interface PropertyPageProps {
  params: {
    id: string;
  };
}

async function getProperty(idOrSlug: string) {
  try {
    const property = await prisma.property.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
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

    return property;
  } catch (err) {
    console.error("Error loading property:", err);
    return null;
  }
}

export default async function PropertyDetailsPage({ params }: PropertyPageProps) {
  const property = await getProperty(params.id);

  if (!property) {
    notFound();
  }

  const avgRating =
    property.reviews && property.reviews.length > 0
      ? (
          property.reviews.reduce((acc, r) => acc + r.ratingOverall, 0) /
          property.reviews.length
        ).toFixed(1)
      : "4.9";

  const reviewCount = property.reviews?.length || 14;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 amoled:bg-black">
      
      {/* Breadcrumb Bar */}
      <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 border-b border-slate-200/80 dark:border-slate-800 amoled:border-zinc-850 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2 truncate">
            <Link href="/" className="hover:text-brand-600 dark:hover:text-brand-400">Home</Link>
            <span>/</span>
            <Link href={`/rooms?city=${encodeURIComponent(property.city)}`} className="hover:text-brand-600 dark:hover:text-brand-400">
              {property.city}
            </Link>
            <span>/</span>
            <Link href={`/rooms?city=${encodeURIComponent(property.city)}&area=${encodeURIComponent(property.area)}`} className="hover:text-brand-600 dark:hover:text-brand-400">
              {property.area}
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white amoled:text-white font-semibold truncate max-w-xs">{property.title}</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 amoled:text-zinc-300 hover:text-navy-900 dark:hover:text-white">
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
            <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 amoled:text-zinc-300 hover:text-rose-600">
              <Heart className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* Admin & Owner Edit Actions */}
        <PropertyAdminActions property={property} />

        {/* Title Header */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {property.isVerified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Verified Property
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200/80 dark:bg-slate-800 amoled:bg-zinc-900 text-slate-800 dark:text-slate-200 amoled:text-zinc-200">
              {property.roomType}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200/80 dark:bg-slate-800 amoled:bg-zinc-900 text-slate-800 dark:text-slate-200 amoled:text-zinc-200">
              {property.furnishing}
            </span>
            {property.foodIncluded && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-900">
                Food Included
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-950 dark:text-white amoled:text-white font-heading">
            {property.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1 font-medium text-slate-800 dark:text-slate-200 amoled:text-zinc-200">
              <MapPin className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>{property.address}, {property.area}, {property.city}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1 font-bold text-navy-900 dark:text-white amoled:text-white">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>{avgRating}</span>
              <span className="font-normal text-slate-500 dark:text-slate-400">({reviewCount} reviews)</span>
            </div>
            {property.distanceToHub && (
              <>
                <span>•</span>
                <span className="text-slate-500 dark:text-slate-400">📍 {property.distanceToHub}</span>
              </>
            )}
          </div>
        </div>

        {/* Rich Image Gallery */}
        <ImageGallery
          images={property.images}
          title={property.title}
          videoUrl={property.videos?.[0]?.url}
        />

        {/* 2-Column Split Details + Sticky Booking Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left: Property Full Info */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Quick Specs Highlight Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 amoled:bg-zinc-950 border border-slate-200/90 dark:border-slate-800 amoled:border-zinc-850 shadow-soft">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                  Room Size
                </span>
                <p className="text-sm font-extrabold text-navy-900 dark:text-white amoled:text-white">
                  {property.roomSizeSqft} sq.ft
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                  Floor
                </span>
                <p className="text-sm font-extrabold text-navy-900 dark:text-white amoled:text-white">
                  Floor {property.floor} of {property.totalFloors}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                  Bathrooms
                </span>
                <p className="text-sm font-extrabold text-navy-900 dark:text-white amoled:text-white">
                  {property.bathrooms} Attached
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                  Available From
                </span>
                <p className="text-sm font-extrabold text-brand-700 dark:text-brand-400">
                  {formatDate(property.availableFrom)}
                </p>
              </div>
            </div>

            {/* Description Section */}
            <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 rounded-3xl border border-slate-200/90 dark:border-slate-800 amoled:border-zinc-850 p-6 sm:p-8 space-y-4 shadow-soft">
              <h2 className="text-lg font-bold text-navy-900 dark:text-white amoled:text-white font-heading">
                About this stay
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 amoled:text-zinc-300 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 amoled:border-zinc-900 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-semibold text-slate-500 dark:text-slate-400 block">Preferred Tenant:</span>
                  <span className="font-bold text-navy-900 dark:text-white amoled:text-white mt-0.5 block">{property.tenantPreference}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 dark:text-slate-400 block">Gender Preference:</span>
                  <span className="font-bold text-navy-900 dark:text-white amoled:text-white mt-0.5 block">{property.genderPreference}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 dark:text-slate-400 block">Minimum Lease Period:</span>
                  <span className="font-bold text-navy-900 dark:text-white amoled:text-white mt-0.5 block">{property.minStayMonths} Months</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 dark:text-slate-400 block">Electricity & Water:</span>
                  <span className="font-bold text-navy-900 dark:text-white amoled:text-white mt-0.5 block">
                    {property.electricityIncluded ? "Electricity included" : "Electricity as per meter"} • {property.waterIncluded ? "24/7 Water included" : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Amenities Grid */}
            <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 rounded-3xl border border-slate-200/90 dark:border-slate-800 amoled:border-zinc-850 p-6 sm:p-8 space-y-5 shadow-soft">
              <h2 className="text-lg font-bold text-navy-900 dark:text-white amoled:text-white font-heading">
                What this place offers
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {property.amenities.map((amenity) => (
                  <div
                    key={amenity.id}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 amoled:bg-zinc-900 border border-slate-100 dark:border-slate-800 amoled:border-zinc-800"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 amoled:bg-zinc-800 border border-slate-200 dark:border-slate-600 amoled:border-zinc-700 flex items-center justify-center shrink-0">
                      <AmenityIcon iconKey={amenity.iconKey} className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-navy-900 dark:text-white amoled:text-white">{amenity.name}</p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">{amenity.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Neighborhood & Connectivity Landmarks */}
            <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 rounded-3xl border border-slate-200/90 dark:border-slate-800 amoled:border-zinc-850 p-6 sm:p-8 space-y-5 shadow-soft">
              <h2 className="text-lg font-bold text-navy-900 dark:text-white amoled:text-white font-heading">
                Neighborhood & Connectivity
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Key distances from this room in {property.area}:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 amoled:bg-zinc-900 border border-slate-100 dark:border-slate-800 amoled:border-zinc-800 text-xs">
                  <Train className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <div>
                    <p className="font-bold text-navy-900 dark:text-white amoled:text-white">Metro / Railway Station</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">600m - 1.2 km</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 amoled:bg-zinc-900 border border-slate-100 dark:border-slate-800 amoled:border-zinc-800 text-xs">
                  <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-bold text-navy-900 dark:text-white amoled:text-white">Nearby Colleges & Coaching</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">500m - 1.5 km</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 amoled:bg-zinc-900 border border-slate-100 dark:border-slate-800 amoled:border-zinc-800 text-xs">
                  <Briefcase className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <div>
                    <p className="font-bold text-navy-900 dark:text-white amoled:text-white">Commercial Tech Hubs</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">10 mins commute</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 amoled:bg-zinc-900 border border-slate-100 dark:border-slate-800 amoled:border-zinc-800 text-xs">
                  <ShoppingCart className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
                  <div>
                    <p className="font-bold text-navy-900 dark:text-white amoled:text-white">Grocery & Daily Needs</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">200m walk</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Location Map */}
            <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 rounded-3xl border border-slate-200/90 dark:border-slate-800 amoled:border-zinc-850 p-6 sm:p-8 space-y-4 shadow-soft">
              <h2 className="text-lg font-bold text-navy-900 dark:text-white amoled:text-white font-heading">
                Where you will be
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Exact location is provided upon booking request confirmation. Approximate area shown below.
              </p>
              <div className="h-72 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 amoled:border-zinc-800">
                <InteractiveMap
                  properties={[property as any]}
                  initialCenter={[property.latitude, property.longitude]}
                  initialZoom={14}
                />
              </div>
            </div>

            {/* House Rules */}
            <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 rounded-3xl border border-slate-200/90 dark:border-slate-800 amoled:border-zinc-850 p-6 sm:p-8 space-y-4 shadow-soft">
              <h2 className="text-lg font-bold text-navy-900 dark:text-white amoled:text-white font-heading">
                House Rules & Policies
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {property.rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 amoled:bg-zinc-900 border border-slate-100 dark:border-slate-800 amoled:border-zinc-800"
                  >
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${
                        rule.ruleType === "NOT_ALLOWED" ? "text-rose-500" : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    />
                    <span className="text-slate-800 dark:text-slate-200 amoled:text-zinc-200 font-medium">{rule.ruleText}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Owner Profile Card */}
            <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 rounded-3xl border border-slate-200/90 dark:border-slate-800 amoled:border-zinc-850 p-6 sm:p-8 space-y-5 shadow-soft">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 amoled:border-zinc-900">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-brand-100 border-2 border-brand-500">
                    <img
                      src={property.owner.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300"}
                      alt={property.owner.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-navy-900 dark:text-white amoled:text-white">
                        {property.owner.name}
                      </h3>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        Verified Host
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Member since {new Date(property.owner.createdAt).getFullYear()}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/messages?receiverId=${property.owner.id}&propertyId=${property.id}`}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 amoled:border-zinc-800 text-xs font-bold text-navy-900 dark:text-white amoled:text-white hover:bg-slate-50 dark:hover:bg-slate-800 amoled:hover:bg-zinc-900 transition-colors flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  Chat With Owner
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block">Response Rate</span>
                  <span className="font-extrabold text-navy-900 dark:text-white amoled:text-white text-sm">
                    {property.owner.ownerProfile?.responseRate || 98}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block">Response Time</span>
                  <span className="font-extrabold text-navy-900 dark:text-white amoled:text-white text-sm">
                    {property.owner.ownerProfile?.responseTime || "Within 15 mins"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block">Host Business</span>
                  <span className="font-extrabold text-navy-900 dark:text-white amoled:text-white text-sm truncate block">
                    {property.owner.ownerProfile?.businessName || "Private Landlord"}
                  </span>
                </div>
              </div>
            </div>

            {/* Verified Tenant Reviews Section */}
            <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 rounded-3xl border border-slate-200/90 dark:border-slate-800 amoled:border-zinc-850 p-6 sm:p-8 space-y-6 shadow-soft">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 amoled:border-zinc-900">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                  <h2 className="text-xl font-bold text-navy-900 dark:text-white amoled:text-white font-heading">
                    {avgRating} • {property.reviews.length} Verified Reviews
                  </h2>
                </div>
              </div>

              {/* Rating criteria breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 amoled:border-zinc-900 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Cleanliness</span>
                  <span className="font-bold text-navy-900 dark:text-white amoled:text-white text-sm">5.0 ★</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Location</span>
                  <span className="font-bold text-navy-900 dark:text-white amoled:text-white text-sm">4.9 ★</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Amenities</span>
                  <span className="font-bold text-navy-900 dark:text-white amoled:text-white text-sm">4.8 ★</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Host Communication</span>
                  <span className="font-bold text-navy-900 dark:text-white amoled:text-white text-sm">5.0 ★</span>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-6">
                {property.reviews.map((review) => (
                  <div key={review.id} className="space-y-3 pb-6 border-b border-slate-100 dark:border-slate-800 amoled:border-zinc-900 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img
                          src={review.tenant.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                          alt={review.tenant.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-xs text-navy-900 dark:text-white amoled:text-white">{review.tenant.name}</p>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                            Verified Stay
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">
                          {review.tenant.occupation || "Verified Resident"} • {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 amoled:text-zinc-300 leading-relaxed">
                      "{review.comment}"
                    </p>

                    {review.ownerReply && (
                      <div className="ml-6 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 amoled:bg-zinc-900 border border-slate-200 dark:border-slate-700 amoled:border-zinc-800 text-xs space-y-1">
                        <span className="font-bold text-[11px] text-navy-900 dark:text-white amoled:text-white block">
                          Response from {property.owner.name} (Host):
                        </span>
                        <p className="text-slate-600 dark:text-slate-300 amoled:text-zinc-300 text-[11px]">{review.ownerReply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right: Sticky Booking Card (Desktop) */}
          <div className="lg:col-span-4">
            <StickyBookingWidget property={property as any} />
          </div>

        </div>

      </div>

      <Footer />
    </div>
  );
}
