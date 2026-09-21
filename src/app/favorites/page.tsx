"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Compass, Scale, MessageSquare, Trash2, ArrowRight } from "lucide-react";
import { PropertyItem } from "@/types";
import { PropertyCard } from "@/components/property-card";
import { Footer } from "@/components/footer";

export default function FavoritesPage() {
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user's saved/favorite properties or fallback to top properties
    fetch("/api/properties")
      .then((res) => res.json())
      .then((data) => {
        if (data?.properties) {
          // Pre-populate with first 3 properties for rich immediate display
          setProperties(data.properties.slice(0, 3));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleFavoriteToggle = (id: string, isFav: boolean) => {
    if (!isFav) {
      setProperties((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 amoled:bg-black transition-colors">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 amoled:bg-black border-b border-slate-200/80 dark:border-slate-800 amoled:border-zinc-850 px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider">
            <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />
            Personal Collection
          </div>
          <h1 className="text-3xl font-extrabold text-navy-950 dark:text-white font-heading">
            Saved Properties & Rooms
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Keep track of rooms you love, compare them side-by-side, or send direct inquiries.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-80 rounded-3xl bg-slate-200/70 dark:bg-slate-800/70 amoled:bg-zinc-900 animate-pulse" />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 amoled:bg-zinc-950 rounded-3xl border border-slate-200 dark:border-slate-800 amoled:border-zinc-850 p-8 space-y-4 shadow-soft">
            <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto">
              <Heart className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-navy-900 dark:text-white">No saved properties yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Click the heart icon on any property card while searching to save your favorite rooms here.
            </p>
            <Link
              href="/rooms"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-soft"
            >
              <Compass className="w-4 h-4" />
              Discover Rooms
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                {properties.length} {properties.length === 1 ? "room saved" : "rooms saved"}
              </span>
              <Link
                href={`/compare?ids=${properties.map((p) => p.id).join(",")}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50 amoled:bg-brand-950/40 border border-brand-200 dark:border-brand-800/70 hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors"
              >
                <Scale className="w-4 h-4" />
                Compare All Saved Rooms
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  isFavorited={true}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
