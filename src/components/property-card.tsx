"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Heart,
  ShieldCheck,
  Star,
  MapPin,
  Sparkles,
  CheckCircle2,
  Scale,
  Bed,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PropertyItem } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AmenityIcon } from "./amenity-icon";

interface PropertyCardProps {
  property: PropertyItem;
  isFavorited?: boolean;
  onFavoriteToggle?: (id: string, isFav: boolean) => void;
  onHover?: (id: string | null) => void;
  isComparing?: boolean;
  onCompareToggle?: (property: PropertyItem) => void;
}

export function PropertyCard({
  property,
  isFavorited = false,
  onFavoriteToggle,
  onHover,
  isComparing = false,
  onCompareToggle,
}: PropertyCardProps) {
  const [favorite, setFavorite] = useState(isFavorited);
  const [isAnimateHeart, setIsAnimateHeart] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  const images = property.images && property.images.length > 0
    ? property.images
    : [{ id: "def", url: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800", isCover: true, displayOrder: 0 }];

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !favorite;
    setFavorite(nextState);
    setIsAnimateHeart(true);
    setTimeout(() => setIsAnimateHeart(false), 400);

    if (onFavoriteToggle) {
      onFavoriteToggle(property.id, nextState);
    }

    try {
      await fetch(`/api/properties/${property.id}/favorite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: nextState }),
      });
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIdx((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const avgRating = property.reviews && property.reviews.length > 0
    ? (property.reviews.reduce((acc, r) => acc + r.ratingOverall, 0) / property.reviews.length).toFixed(1)
    : "4.8";

  const reviewCount = property.reviews?.length || 12;

  return (
    <div
      onMouseEnter={() => onHover && onHover(property.id)}
      onMouseLeave={() => onHover && onHover(null)}
      className="group relative bg-white dark:bg-slate-900 amoled:bg-zinc-950 rounded-3xl border border-slate-200/90 dark:border-slate-800 amoled:border-zinc-850 hover:border-brand-500/40 dark:hover:border-brand-500/40 hover:shadow-card transition-all duration-300 flex flex-col overflow-hidden"
    >
      {/* Image Carousel Container */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] bg-slate-100 dark:bg-slate-800 amoled:bg-zinc-900 overflow-hidden">
        <Link href={`/property/${property.id}`} className="block w-full h-full">
          <img
            src={images[currentImageIdx].url}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Badges Top-Left */}
        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5 z-10">
          {property.isVerified && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500 text-white shadow-md backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Stay
            </span>
          )}
          {property.featured && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-md">
              <Sparkles className="w-3 h-3" />
              Featured
            </span>
          )}
          {property.noBrokerage && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 dark:bg-slate-900/90 amoled:bg-black/90 text-navy-900 dark:text-white amoled:text-white shadow-sm backdrop-blur-sm">
              Zero Brokerage
            </span>
          )}
        </div>

        {/* Top-Right Favorite & Compare Buttons */}
        <div className="absolute top-3.5 right-3.5 flex items-center gap-2 z-10">
          {onCompareToggle && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onCompareToggle(property);
              }}
              title={isComparing ? "Remove from comparison" : "Add to compare"}
              className={`p-2 rounded-full backdrop-blur-md transition-all ${
                isComparing
                  ? "bg-brand-600 text-white shadow-md"
                  : "bg-black/40 hover:bg-black/60 text-white"
              }`}
            >
              <Scale className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleFavoriteClick}
            title={favorite ? "Remove from favorites" : "Save property"}
            className={`p-2 rounded-full backdrop-blur-md transition-all ${
              favorite
                ? "bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 shadow-md"
                : "bg-black/40 hover:bg-black/60 text-white"
            } ${isAnimateHeart ? "animate-heart" : ""}`}
          >
            <Heart className={`w-4 h-4 ${favorite ? "fill-rose-600 text-rose-600" : ""}`} />
          </button>
        </div>

        {/* Carousel Image Controls */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 dark:bg-slate-900/80 amoled:bg-black/80 hover:bg-white dark:hover:bg-slate-900 text-navy-900 dark:text-white amoled:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextImage}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 dark:bg-slate-900/80 amoled:bg-black/80 hover:bg-white dark:hover:bg-slate-900 text-navy-900 dark:text-white amoled:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Carousel Dots */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`block h-1.5 rounded-full transition-all ${
                    idx === currentImageIdx ? "w-4 bg-white" : "w-1.5 bg-white/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Property Details Content */}
      <div className="p-5 flex flex-col flex-1">
        
        {/* Location & Rating Header */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 amoled:text-zinc-400 mb-1.5">
          <div className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300 amoled:text-zinc-300 truncate max-w-[70%]">
            <MapPin className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
            <span className="truncate">{property.area}, {property.city}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-900 dark:text-amber-300 amoled:text-amber-300 font-bold bg-amber-50 dark:bg-amber-950/40 amoled:bg-amber-950/30 px-2 py-0.5 rounded-md text-[11px] border border-amber-200/50 dark:border-amber-900/40">
            <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
            <span>{avgRating}</span>
            <span className="text-slate-400 dark:text-slate-500 font-normal">({reviewCount})</span>
          </div>
        </div>

        {/* Title */}
        <Link href={`/property/${property.id}`} className="block">
          <h3 className="font-bold text-base text-navy-900 dark:text-white amoled:text-white line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            {property.title}
          </h3>
        </Link>

        {/* Key Specs Pills */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2.5 text-xs text-slate-600 dark:text-slate-300 amoled:text-zinc-300">
          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 amoled:bg-zinc-900 font-medium">
            {property.roomType}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 amoled:bg-zinc-900">
            {property.furnishing}
          </span>
          {property.foodIncluded && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 amoled:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-medium border border-emerald-200/50 dark:border-emerald-900/40">
              Food Included
            </span>
          )}
        </div>

        {/* Amenities Icons Preview */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 amoled:border-zinc-900 text-slate-500 dark:text-slate-400 amoled:text-zinc-400 text-xs">
            {property.amenities.slice(0, 3).map((amenity) => (
              <span key={amenity.id || amenity.name} className="flex items-center gap-1" title={amenity.name}>
                <AmenityIcon iconKey={amenity.iconKey} className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                <span className="text-[11px] truncate max-w-[90px]">{amenity.name}</span>
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Distance landmark if present */}
        {property.distanceToHub && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 truncate">
            📍 {property.distanceToHub}
          </p>
        )}

        {/* Price & CTA Footer */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 amoled:border-zinc-900">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-extrabold text-navy-900 dark:text-white amoled:text-white">
                {formatCurrency(property.rentMonthly)}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">/mo</span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
              Deposit: {formatCurrency(property.deposit)}
            </span>
          </div>

          <Link
            href={`/property/${property.id}`}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-navy-900 dark:bg-brand-600 amoled:bg-brand-600 hover:bg-brand-600 dark:hover:bg-brand-500 transition-colors shadow-soft"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
