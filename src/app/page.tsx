import React from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Calendar,
  IndianRupee,
  Bed,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Heart,
  Compass,
  Building,
  GraduationCap,
  Briefcase,
  Layers,
  ChevronRight,
  Star,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PropertyCard } from "@/components/property-card";
import { Footer } from "@/components/footer";
import { formatCurrency } from "@/lib/utils";

// Fetch featured and verified properties directly on server
async function getHomepageData() {
  try {
    const [featuredProps, budgetProps, verifiedProps] = await Promise.all([
      prisma.property.findMany({
        where: { status: "PUBLISHED" },
        take: 6,
        orderBy: { featured: "desc" },
        include: {
          images: { orderBy: { displayOrder: "asc" } },
          amenities: true,
          rules: true,
          reviews: { take: 2 },
          owner: {
            select: { id: true, name: true, phone: true, avatar: true, ownerProfile: true },
          },
        },
      }),
      prisma.property.findMany({
        where: { status: "PUBLISHED", rentMonthly: { lte: 9000 } },
        take: 4,
        orderBy: { rentMonthly: "asc" },
        include: {
          images: { orderBy: { displayOrder: "asc" } },
          amenities: true,
          rules: true,
          reviews: { take: 1 },
          owner: { select: { name: true } },
        },
      }),
      prisma.property.findMany({
        where: { status: "PUBLISHED", isVerified: true },
        take: 4,
        orderBy: { viewsCount: "desc" },
        include: {
          images: { orderBy: { displayOrder: "asc" } },
          amenities: true,
          rules: true,
          reviews: { take: 1 },
          owner: { select: { name: true } },
        },
      }),
    ]);

    return { featuredProps, budgetProps, verifiedProps };
  } catch (err) {
    console.error("Error fetching homepage data:", err);
    return { featuredProps: [], budgetProps: [], verifiedProps: [] };
  }
}

const POPULAR_CITIES = [
  {
    name: "Prayagraj",
    state: "Uttar Pradesh",
    image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600&auto=format&fit=crop&q=80",
    areas: "Civil Lines, Katra, Georgetown",
    staysCount: "120+ Stays",
  },
  {
    name: "Bengaluru",
    state: "Karnataka",
    image: "https://images.unsplash.com/photo-1502005229762-ee1b2da9730f?w=600&auto=format&fit=crop&q=80",
    areas: "Koramangala, HSR, Indiranagar",
    staysCount: "450+ Stays",
  },
  {
    name: "Pune",
    state: "Maharashtra",
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&auto=format&fit=crop&q=80",
    areas: "Viman Nagar, Hinjewadi, Baner",
    staysCount: "310+ Stays",
  },
  {
    name: "Delhi NCR",
    state: "Delhi & Haryana",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&auto=format&fit=crop&q=80",
    areas: "Hauz Khas, Gurgaon Cyber City, Noida",
    staysCount: "520+ Stays",
  },
  {
    name: "Hyderabad",
    state: "Telangana",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop&q=80",
    areas: "Hitec City, Gachibowli, Madhapur",
    staysCount: "280+ Stays",
  },
  {
    name: "Mumbai",
    state: "Maharashtra",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&auto=format&fit=crop&q=80",
    areas: "Andheri West, Bandra, Powai",
    staysCount: "390+ Stays",
  },
];

export default async function HomePage() {
  const { featuredProps, budgetProps, verifiedProps } = await getHomepageData();

  return (
    <div className="space-y-20 pb-16">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-brand-100/50 via-brand-50/20 to-transparent dark:from-brand-950/20 dark:via-transparent blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-slate-900 amoled:bg-zinc-950 border border-brand-200/80 dark:border-brand-900 amoled:border-zinc-800 shadow-soft text-brand-700 dark:text-brand-300 amoled:text-brand-400 text-xs font-semibold animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-ping" />
            <span>Zero Brokerage • 100% Verified Property Owners</span>
          </div>

          {/* Headlines */}
          <div className="space-y-4 max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-navy-950 dark:text-white amoled:text-white font-heading">
              Find a place that <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-emerald-600 to-teal-600 dark:from-brand-400 dark:via-emerald-400 dark:to-teal-400">
                feels like home.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 amoled:text-zinc-300 font-normal max-w-2xl mx-auto leading-relaxed">
              Discover verified rooms, student PGs, serviced apartments, and shared stays near your college or workplace.
            </p>
          </div>

          {/* Main Search Component */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 rounded-3xl p-3 sm:p-4 shadow-floating border border-slate-200/90 dark:border-slate-800 amoled:border-zinc-850 transition-all">
              <form action="/rooms" method="GET" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
                
                {/* 1. Location Input */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 amoled:bg-zinc-900 hover:bg-slate-100/80 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700 amoled:border-zinc-800 transition-colors text-left">
                  <MapPin className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />
                  <div className="w-full">
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Where to stay?
                    </label>
                    <input
                      type="text"
                      name="city"
                      placeholder="Prayagraj, Bengaluru..."
                      className="w-full bg-transparent text-xs font-semibold text-navy-900 dark:text-white amoled:text-white focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* 2. Move-in Date */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 amoled:bg-zinc-900 hover:bg-slate-100/80 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700 amoled:border-zinc-800 transition-colors text-left">
                  <Calendar className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />
                  <div className="w-full">
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Move-in Date
                    </label>
                    <input
                      type="date"
                      name="moveIn"
                      className="w-full bg-transparent text-xs font-semibold text-navy-900 dark:text-white amoled:text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* 3. Room Type */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 amoled:bg-zinc-900 hover:bg-slate-100/80 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700 amoled:border-zinc-800 transition-colors text-left">
                  <Bed className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />
                  <div className="w-full">
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Room Type
                    </label>
                    <select
                      name="roomType"
                      className="w-full bg-transparent text-xs font-semibold text-navy-900 dark:text-white amoled:text-white focus:outline-none cursor-pointer"
                    >
                      <option value="" className="dark:bg-slate-900 amoled:bg-black">Any Room Type</option>
                      <option value="Single" className="dark:bg-slate-900 amoled:bg-black">Single Private Room</option>
                      <option value="Double" className="dark:bg-slate-900 amoled:bg-black">Shared / PG Room</option>
                      <option value="Studio" className="dark:bg-slate-900 amoled:bg-black">Studio Apartment</option>
                      <option value="1BHK" className="dark:bg-slate-900 amoled:bg-black">1BHK Flat</option>
                      <option value="2BHK" className="dark:bg-slate-900 amoled:bg-black">2BHK Flat</option>
                    </select>
                  </div>
                </div>

                {/* 4. Submit Search Button */}
                <button
                  type="submit"
                  className="w-full h-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-700 hover:to-emerald-700 text-white font-bold text-sm shadow-md shadow-brand-600/30 flex items-center justify-center gap-2 active:scale-[0.99] transition-all"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Rooms</span>
                </button>

              </form>
            </div>

            {/* Popular quick-click location tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-400 dark:text-slate-500">Popular:</span>
              {["Civil Lines, Prayagraj", "Koramangala, Bengaluru", "Viman Nagar, Pune", "Cyber City, Gurgaon", "Hitec City, Hyderabad"].map((tag) => (
                <Link
                  key={tag}
                  href={`/rooms?query=${encodeURIComponent(tag.split(",")[0])}`}
                  className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 amoled:bg-zinc-900 border border-slate-200 dark:border-slate-700 amoled:border-zinc-800 hover:border-brand-500 dark:hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400 text-slate-700 dark:text-slate-300 amoled:text-zinc-300 transition-all text-[11px]"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Popular Cities Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 font-heading">
              Explore Popular Cities
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Top student hubs and tech corridors with high tenant demand
            </p>
          </div>
          <Link
            href="/rooms"
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700"
          >
            View all cities <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {POPULAR_CITIES.map((city) => (
            <Link
              key={city.name}
              href={`/rooms?city=${encodeURIComponent(city.name)}`}
              className="group relative rounded-3xl overflow-hidden aspect-[4/5] bg-slate-900 shadow-soft hover:shadow-card transition-all"
            >
              <img
                src={city.image}
                alt={city.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-base font-bold font-heading">{city.name}</p>
                <p className="text-[10px] text-slate-300 truncate">{city.areas}</p>
                <span className="inline-block mt-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-brand-500/80 text-white backdrop-blur-sm">
                  {city.staysCount}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Properties Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-brand-600 font-bold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              Handpicked By Our Curators
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 font-heading">
              Featured Stays & Rooms
            </h2>
          </div>
          <Link
            href="/rooms"
            className="flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline"
          >
            Explore all {featuredProps.length}+ stays <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProps.slice(0, 6).map((property: any) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </section>

      {/* Target Audiences: Students & Working Professionals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* For Students */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-8 sm:p-10 flex flex-col justify-between shadow-card">
            <div className="space-y-3 z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-blue-300">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold font-heading">Student Accommodations</h3>
              <p className="text-xs text-blue-100 leading-relaxed max-w-md">
                Find budget-friendly rooms and PGs with 3-time meals, quiet study desks, high-speed WiFi, and zero curfew hassle near university faculties.
              </p>
            </div>
            <div className="pt-6 z-10">
              <Link
                href="/rooms?tenantPreference=Students"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-navy-950 bg-white hover:bg-blue-50 transition-colors shadow-soft"
              >
                Find Student PGs <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* For Working Professionals */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-900 to-teal-950 text-white p-8 sm:p-10 flex flex-col justify-between shadow-card">
            <div className="space-y-3 z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-emerald-300">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold font-heading">Working Professionals</h3>
              <p className="text-xs text-emerald-100 leading-relaxed max-w-md">
                Modern studios and coliving rooms equipped with ergonomic chairs, 100% power backup, bi-weekly housekeeping, and minutes away from tech parks.
              </p>
            </div>
            <div className="pt-6 z-10">
              <Link
                href="/rooms?tenantPreference=Working+Professionals"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-navy-950 bg-white hover:bg-emerald-50 transition-colors shadow-soft"
              >
                Explore Pro Stays <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* How It Works - 4 Steps */}
      <section className="bg-white dark:bg-slate-900/60 amoled:bg-black py-16 border-y border-slate-200/80 dark:border-slate-800 amoled:border-zinc-850">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          
          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white amoled:text-white font-heading">
              How UrbanNest Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 amoled:text-zinc-400">
              Moving into a new city has never been this transparent and seamless.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Step 1 */}
            <div className="space-y-3 p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/70 amoled:bg-zinc-950 border border-slate-100 dark:border-slate-800 amoled:border-zinc-800 text-left">
              <div className="w-10 h-10 rounded-2xl bg-brand-100 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-extrabold flex items-center justify-center text-sm">
                01
              </div>
              <h3 className="font-bold text-base text-navy-900 dark:text-white amoled:text-white">Search & Filter</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 amoled:text-zinc-400 leading-relaxed">
                Filter by neighborhood, budget, amenities, food availability, and distance to your metro or university.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-3 p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/70 amoled:bg-zinc-950 border border-slate-100 dark:border-slate-800 amoled:border-zinc-800 text-left">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-extrabold flex items-center justify-center text-sm">
                02
              </div>
              <h3 className="font-bold text-base text-navy-900 dark:text-white amoled:text-white">Compare Stays</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 amoled:text-zinc-400 leading-relaxed">
                Use our side-by-side comparison matrix to weigh rent, security deposits, room dimensions, and house rules.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-3 p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/70 amoled:bg-zinc-950 border border-slate-100 dark:border-slate-800 amoled:border-zinc-800 text-left">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-extrabold flex items-center justify-center text-sm">
                03
              </div>
              <h3 className="font-bold text-base text-navy-900 dark:text-white amoled:text-white">Request & Pay</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 amoled:text-zinc-400 leading-relaxed">
                Send an instant booking request to the owner. Once accepted, lock your room with secure Razorpay checkout.
              </p>
            </div>

            {/* Step 4 */}
            <div className="space-y-3 p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/70 amoled:bg-zinc-950 border border-slate-100 dark:border-slate-800 amoled:border-zinc-800 text-left">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold flex items-center justify-center text-sm">
                04
              </div>
              <h3 className="font-bold text-base text-navy-900 dark:text-white amoled:text-white">Move In With Ease</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 amoled:text-zinc-400 leading-relaxed">
                Receive your move-in receipt, verified owner contact, and digital key pass. Welcome to your new home!
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Budget Friendly Rooms (< ₹9,000) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
              <IndianRupee className="w-4 h-4" />
              Budget Friendly
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white amoled:text-white font-heading">
              Rooms Under ₹9,000 / Month
            </h2>
          </div>
          <Link
            href="/rooms?maxRent=9000"
            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
          >
            View all budget stays <ChevronRight className="w-4 h-4 inline" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {budgetProps.map((property: any) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </section>

      {/* Owner CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-4xl bg-navy-950 dark:bg-slate-900 amoled:bg-zinc-950 border border-transparent dark:border-slate-800 amoled:border-zinc-800 text-white p-8 sm:p-14 overflow-hidden shadow-2xl">
          {/* Subtle graphic element */}
          <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-brand-500/20 blur-3xl" />

          <div className="relative z-10 max-w-xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 text-xs font-bold border border-brand-500/30">
              <Building className="w-4 h-4" />
              For Property Owners & Landlords
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading tracking-tight leading-tight">
              Have a room to rent? <br />
              Find the right tenant in days.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              List your room, PG, flat or apartment on UrbanNest. Receive verified tenant inquiries, manage bookings in one dashboard, and collect deposits directly with zero commission.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/owner/properties/new"
                className="px-6 py-3.5 rounded-full text-xs font-bold text-navy-950 bg-white hover:bg-brand-50 transition-colors shadow-lg"
              >
                List Your Property For Free
              </Link>
              <Link
                href="/owner/dashboard"
                className="px-6 py-3.5 rounded-full text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-colors"
              >
                View Owner Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white amoled:text-white font-heading">
            Trusted by Tenants & Owners
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 amoled:text-zinc-400">
            Real experiences from people who found their perfect home through UrbanNest
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 amoled:bg-zinc-950 border border-slate-200/90 dark:border-slate-800 amoled:border-zinc-850 shadow-soft space-y-4">
            <div className="flex text-amber-400 gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 amoled:text-zinc-300 leading-relaxed">
              "Finding a peaceful single room near Civil Lines in Prayagraj was so hard until I used UrbanNest. I spoke with the owner directly, verified the room via photos, and paid the deposit securely without paying any broker."
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-950/60 font-bold text-brand-700 dark:text-brand-300 flex items-center justify-center text-xs">
                RS
              </div>
              <div>
                <p className="font-bold text-xs text-navy-900 dark:text-white amoled:text-white">Rahul Sharma</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Software Engineer • Prayagraj</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 amoled:bg-zinc-950 border border-slate-200/90 dark:border-slate-800 amoled:border-zinc-850 shadow-soft space-y-4">
            <div className="flex text-amber-400 gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 amoled:text-zinc-300 leading-relaxed">
              "As an owner with 8 PG rooms in Koramangala, managing tenant inquiries on WhatsApp was chaotic. UrbanNest's owner dashboard gives me instant booking requests with complete tenant profiles."
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/60 font-bold text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs">
                RM
              </div>
              <div>
                <p className="font-bold text-xs text-navy-900 dark:text-white amoled:text-white">Rajesh Mehra</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Property Owner • Bengaluru</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 amoled:bg-zinc-950 border border-slate-200/90 dark:border-slate-800 amoled:border-zinc-850 shadow-soft space-y-4">
            <div className="flex text-amber-400 gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 amoled:text-zinc-300 leading-relaxed">
              "The side-by-side property comparison tool helped me choose between a shared flat in Viman Nagar and a private studio. The amenities were exactly as listed when I moved in."
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950/60 font-bold text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs">
                SP
              </div>
              <div>
                <p className="font-bold text-xs text-navy-900 dark:text-white amoled:text-white">Sneha Patel</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Student • Pune</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white amoled:text-white font-heading">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 amoled:text-zinc-400">
            Everything you need to know about finding and booking rooms
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "Is there any brokerage fee on UrbanNest?",
              a: "No! All properties on UrbanNest are listed directly by verified property owners and managers. You will never be charged brokerage fees.",
            },
            {
              q: "How are properties and owners verified?",
              a: "Our verification team inspects government identification (Aadhaar/PAN) of owners and verifies property photographs and address records before awarding the 'Verified Stay' badge.",
            },
            {
              q: "Can I schedule a property visit before booking?",
              a: "Yes! You can use our in-app messaging feature on any property page to chat directly with the owner and set up a visit.",
            },
            {
              q: "How does the security deposit refund work?",
              a: "Security deposits are held under formal tenancy terms specified by the owner. When you move out in accordance with the agreement notice, the deposit is refunded directly.",
            },
          ].map((faq, idx) => (
            <details
              key={idx}
              className="group bg-white dark:bg-slate-900 amoled:bg-zinc-950 rounded-2xl border border-slate-200/90 dark:border-slate-800 amoled:border-zinc-850 p-4 transition-all"
            >
              <summary className="font-bold text-xs sm:text-sm text-navy-900 dark:text-white amoled:text-white cursor-pointer list-none flex items-center justify-between">
                <span>{faq.q}</span>
                <span className="text-brand-600 dark:text-brand-400 font-bold group-open:rotate-180 transition-transform">
                  ▾
                </span>
              </summary>
              <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 amoled:text-zinc-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 amoled:border-zinc-900 pt-3">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Footer */}
      <Footer />

    </div>
  );
}
