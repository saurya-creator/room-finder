"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Compass,
  Map as MapIcon,
  List,
  SlidersHorizontal,
  ArrowUpDown,
  Search,
  X,
  Building2,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { PropertyItem, FilterParams } from "@/types";
import { PropertyCard } from "@/components/property-card";
import { SearchFilters } from "@/components/search-filters";
import { InteractiveMap } from "@/components/interactive-map";
import { Footer } from "@/components/footer";

function RoomsSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [comparingIds, setComparingIds] = useState<string[]>([]);

  // Parse initial filters from search params
  const [filters, setFilters] = useState<FilterParams>({
    city: searchParams.get("city") || undefined,
    area: searchParams.get("area") || undefined,
    query: searchParams.get("query") || undefined,
    minRent: searchParams.get("minRent") ? Number(searchParams.get("minRent")) : undefined,
    maxRent: searchParams.get("maxRent") ? Number(searchParams.get("maxRent")) : undefined,
    roomType: searchParams.get("roomType") ? searchParams.get("roomType")!.split(",") : undefined,
    propertyType: searchParams.get("propertyType") ? searchParams.get("propertyType")!.split(",") : undefined,
    furnishing: searchParams.get("furnishing") ? searchParams.get("furnishing")!.split(",") : undefined,
    genderPreference: searchParams.get("genderPreference") || undefined,
    tenantPreference: searchParams.get("tenantPreference") || undefined,
    verifiedOnly: searchParams.get("verifiedOnly") === "true",
    foodIncluded: searchParams.get("foodIncluded") === "true",
    noBrokerage: searchParams.get("noBrokerage") === "true",
    sortBy: (searchParams.get("sortBy") as any) || "relevance",
  });

  // Sync state to URL and fetch properties
  const fetchProperties = async (currentFilters: FilterParams) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentFilters.city) params.set("city", currentFilters.city);
      if (currentFilters.area) params.set("area", currentFilters.area);
      if (currentFilters.query) params.set("query", currentFilters.query);
      if (currentFilters.minRent) params.set("minRent", currentFilters.minRent.toString());
      if (currentFilters.maxRent) params.set("maxRent", currentFilters.maxRent.toString());
      if (currentFilters.roomType && currentFilters.roomType.length > 0)
        params.set("roomType", currentFilters.roomType.join(","));
      if (currentFilters.propertyType && currentFilters.propertyType.length > 0)
        params.set("propertyType", currentFilters.propertyType.join(","));
      if (currentFilters.furnishing && currentFilters.furnishing.length > 0)
        params.set("furnishing", currentFilters.furnishing.join(","));
      if (currentFilters.genderPreference) params.set("genderPreference", currentFilters.genderPreference);
      if (currentFilters.tenantPreference) params.set("tenantPreference", currentFilters.tenantPreference);
      if (currentFilters.verifiedOnly) params.set("verifiedOnly", "true");
      if (currentFilters.foodIncluded) params.set("foodIncluded", "true");
      if (currentFilters.noBrokerage) params.set("noBrokerage", "true");
      if (currentFilters.sortBy) params.set("sortBy", currentFilters.sortBy);

      const queryString = params.toString();
      // Update URL silently without full reload
      router.replace(`/rooms${queryString ? `?${queryString}` : ""}`, { scroll: false });

      const res = await fetch(`/api/properties${queryString ? `?${queryString}` : ""}`);
      const data = await res.json();
      if (res.ok && data.properties) {
        setProperties(data.properties);
      }
    } catch (err) {
      console.error("Failed to load properties:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties(filters);
  }, [filters]);

  const handleFilterChange = (newFilters: FilterParams) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    const defaultFilters: FilterParams = { sortBy: "relevance" };
    setFilters(defaultFilters);
  };

  const handleCompareToggle = (property: PropertyItem) => {
    setComparingIds((prev) => {
      if (prev.includes(property.id)) {
        return prev.filter((id) => id !== property.id);
      } else {
        if (prev.length >= 4) {
          alert("You can compare up to 4 properties simultaneously.");
          return prev;
        }
        return [...prev, property.id];
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      
      {/* Top Search Context Bar */}
      <div className="bg-white dark:bg-slate-900 amoled:bg-black border-b border-slate-200/80 dark:border-slate-800 amoled:border-zinc-850 px-4 py-3 sticky top-20 z-30 shadow-soft">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <h1 className="text-base font-extrabold text-navy-900 dark:text-white amoled:text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <span>
                {filters.city ? `Stays in ${filters.city}` : "All Available Stays"}
              </span>
            </h1>
            <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 amoled:bg-zinc-900 text-slate-700 dark:text-slate-300 amoled:text-zinc-300">
              {properties.length} results
            </span>
          </div>

          <div className="flex items-center gap-3">
            
            {/* Sort Selector */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 amoled:text-zinc-400">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span className="hidden md:inline">Sort:</span>
              <select
                value={filters.sortBy || "relevance"}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                className="bg-slate-50 dark:bg-slate-800 amoled:bg-zinc-900 border border-slate-200 dark:border-slate-700 amoled:border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-navy-900 dark:text-white amoled:text-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="relevance">Recommended</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 amoled:border-zinc-800 text-xs font-semibold text-navy-900 dark:text-white amoled:text-white bg-white dark:bg-slate-800 amoled:bg-zinc-900"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            {/* Mobile Map / List Toggle */}
            <button
              onClick={() => setMobileView(mobileView === "list" ? "map" : "list")}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-900 dark:bg-brand-600 amoled:bg-brand-600 text-white text-xs font-semibold"
            >
              {mobileView === "list" ? (
                <>
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Map</span>
                </>
              ) : (
                <>
                  <List className="w-3.5 h-3.5" />
                  <span>List</span>
                </>
              )}
            </button>

          </div>

        </div>
      </div>

      {/* Floating Compare Banner when items are selected */}
      {comparingIds.length > 0 && (
        <aside aria-label="Compare properties" className="fixed bottom-16 md:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-navy-900/95 dark:bg-slate-900/95 amoled:bg-black/95 backdrop-blur-md text-white px-5 py-3 rounded-full shadow-floating border border-slate-700 dark:border-slate-800 amoled:border-zinc-800 flex items-center gap-4 animate-slide-up">
          <span className="text-xs font-semibold">
            {comparingIds.length} {comparingIds.length === 1 ? "room" : "rooms"} selected for comparison
          </span>
          <button
            onClick={() => router.push(`/compare?ids=${comparingIds.join(",")}`)}
            className="px-4 py-1.5 rounded-full text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white transition-colors"
          >
            Compare Now →
          </button>
          <button
            onClick={() => setComparingIds([])}
            className="text-xs text-slate-400 hover:text-white"
          >
            Clear
          </button>
        </aside>
      )}

      {/* Main Split Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: Filters Sidebar (Desktop) */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-36 max-h-[calc(100vh-160px)] overflow-y-auto pr-1">
              <SearchFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
                totalResults={properties.length}
              />
            </div>
          </div>

          {/* CENTER: Property Results Grid */}
          <div
            className={`lg:col-span-5 space-y-4 ${
              mobileView === "map" ? "hidden lg:block" : "block"
            }`}
          >
            {loading ? (
              <div className="grid grid-cols-1 gap-5">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-80 rounded-3xl bg-slate-200/70 animate-pulse border border-slate-200"
                  />
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 amoled:bg-zinc-950 rounded-3xl border border-slate-200 dark:border-slate-800 amoled:border-zinc-850 p-8 space-y-4">
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 amoled:bg-zinc-900 flex items-center justify-center mx-auto text-slate-400 dark:text-slate-500">
                  <Building2 className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-navy-900 dark:text-white amoled:text-white">No rooms found</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 amoled:text-zinc-400 max-w-sm mx-auto">
                  We couldn't find any rooms matching your current filter criteria. Try adjusting your budget or selecting a nearby city.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onHover={(id) => setHoveredPropertyId(id)}
                    isComparing={comparingIds.includes(property.id)}
                    onCompareToggle={handleCompareToggle}
                  />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Interactive Map (Desktop Split + Mobile Map Toggle) */}
          <div
            className={`lg:col-span-4 ${
              mobileView === "list" ? "hidden lg:block" : "block"
            }`}
          >
            <div className="sticky top-36 h-[calc(100vh-160px)]">
              <InteractiveMap
                properties={properties}
                hoveredPropertyId={hoveredPropertyId}
                onPropertySelect={(prop) => {
                  setHoveredPropertyId(prop.id);
                }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Filter Bottom Sheet Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end lg:hidden animate-fade-in">
          <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 rounded-t-3xl max-h-[85vh] overflow-y-auto p-5 space-y-4 border-t border-slate-200 dark:border-slate-800 amoled:border-zinc-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 amoled:border-zinc-900">
              <h3 className="font-bold text-sm text-navy-900 dark:text-white amoled:text-white">Filters</h3>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="p-1 text-slate-400 hover:text-navy-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <SearchFilters
              filters={filters}
              onFilterChange={(f) => {
                handleFilterChange(f);
              }}
              onReset={handleResetFilters}
              totalResults={properties.length}
            />

            <button
              onClick={() => setIsFilterModalOpen(false)}
              className="w-full py-3 rounded-2xl bg-brand-600 text-white font-bold text-xs shadow-md"
            >
              Show {properties.length} Stays
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function RoomsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm">Loading rooms...</div>}>
      <RoomsSearchContent />
    </Suspense>
  );
}
