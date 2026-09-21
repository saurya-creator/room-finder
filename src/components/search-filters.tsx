"use client";

import React, { useState } from "react";
import {
  SlidersHorizontal,
  RotateCcw,
  Check,
  Building,
  ShieldCheck,
  Sparkles,
  UtensilsCrossed,
  IndianRupee,
  Layers,
  Users,
} from "lucide-react";
import { FilterParams } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface SearchFiltersProps {
  filters: FilterParams;
  onFilterChange: (newFilters: FilterParams) => void;
  onReset: () => void;
  cities?: string[];
  totalResults?: number;
  className?: string;
}

const CITIES = ["Prayagraj", "Bengaluru", "Pune", "Delhi NCR", "Hyderabad", "Mumbai", "Chennai"];

const ROOM_TYPES = ["Single", "Double", "Triple", "Shared", "Studio", "1BHK", "2BHK", "PG", "Hostel"];

const PROPERTY_TYPES = ["Apartment", "Independent House", "PG", "Hostel", "Flat", "Co-living"];

const FURNISHING_OPTIONS = ["Fully furnished", "Semi furnished", "Unfurnished"];

const AMENITY_OPTIONS = [
  { key: "wifi", label: "High-Speed Wi-Fi" },
  { key: "ac", label: "Air Conditioning" },
  { key: "bath", label: "Attached Bathroom" },
  { key: "power", label: "Power Backup" },
  { key: "cctv", label: "CCTV Security" },
  { key: "parking", label: "Parking" },
  { key: "washer", label: "Washing Machine" },
  { key: "geyser", label: "Geyser" },
  { key: "food", label: "Food Included" },
];

export function SearchFilters({
  filters,
  onFilterChange,
  onReset,
  cities = CITIES,
  totalResults,
  className = "",
}: SearchFiltersProps) {
  const [maxRent, setMaxRent] = useState<number>(filters.maxRent || 40000);

  const handleCitySelect = (city: string) => {
    onFilterChange({
      ...filters,
      city: filters.city === city ? undefined : city,
    });
  };

  const handleRoomTypeToggle = (type: string) => {
    const current = filters.roomType || [];
    const next = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    onFilterChange({ ...filters, roomType: next.length > 0 ? next : undefined });
  };

  const handlePropertyTypeToggle = (type: string) => {
    const current = filters.propertyType || [];
    const next = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    onFilterChange({ ...filters, propertyType: next.length > 0 ? next : undefined });
  };

  const handleFurnishingToggle = (option: string) => {
    const current = filters.furnishing || [];
    const next = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option];
    onFilterChange({ ...filters, furnishing: next.length > 0 ? next : undefined });
  };

  const handleAmenityToggle = (amenityKey: string) => {
    const current = filters.amenities || [];
    const next = current.includes(amenityKey)
      ? current.filter((a) => a !== amenityKey)
      : [...current, amenityKey];
    onFilterChange({ ...filters, amenities: next.length > 0 ? next : undefined });
  };

  const handleRentSliderCommit = (val: number) => {
    setMaxRent(val);
    onFilterChange({ ...filters, maxRent: val >= 45000 ? undefined : val });
  };

  return (
    <div className={`bg-white dark:bg-slate-900 amoled:bg-zinc-950 rounded-3xl border border-slate-200/90 dark:border-slate-800 amoled:border-zinc-850 p-5 space-y-6 shadow-soft ${className}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 amoled:border-zinc-900">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <h2 className="font-bold text-sm text-navy-900 dark:text-white amoled:text-white">Filters</h2>
          {totalResults !== undefined && (
            <span className="text-xs bg-slate-100 dark:bg-slate-800 amoled:bg-zinc-900 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-400 amoled:text-zinc-400 font-medium">
              {totalResults} {totalResults === 1 ? "stay" : "stays"}
            </span>
          )}
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* City Selector */}
      <div>
        <label className="block text-xs font-bold text-navy-900 dark:text-white amoled:text-white uppercase tracking-wider mb-2.5">
          Select City
        </label>
        <div className="flex flex-wrap gap-1.5">
          {cities.map((city) => {
            const isSelected = filters.city === city;
            return (
              <button
                key={city}
                onClick={() => handleCitySelect(city)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-brand-600 text-white shadow-soft"
                    : "bg-slate-50 dark:bg-slate-800 amoled:bg-zinc-900 text-slate-700 dark:text-slate-300 amoled:text-zinc-300 hover:bg-slate-100 dark:hover:bg-slate-700 amoled:hover:bg-zinc-800 border border-slate-200 dark:border-slate-700 amoled:border-zinc-800"
                }`}
              >
                {city}
              </button>
            );
          })}
        </div>
      </div>

      {/* Budget Slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-navy-900 dark:text-white amoled:text-white uppercase tracking-wider">
            Max Monthly Rent
          </label>
          <span className="text-xs font-extrabold text-brand-600 dark:text-brand-400">
            {maxRent >= 45000 ? "Any Budget" : formatCurrency(maxRent)}
          </span>
        </div>
        <input
          type="range"
          min={4000}
          max={45000}
          step={1000}
          value={maxRent}
          onChange={(e) => setMaxRent(Number(e.target.value))}
          onMouseUp={() => handleRentSliderCommit(maxRent)}
          onTouchEnd={() => handleRentSliderCommit(maxRent)}
          className="w-full h-2 bg-slate-200 dark:bg-slate-800 amoled:bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-brand-600"
        />
        <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
          <span>₹4,000</span>
          <span>₹20,000</span>
          <span>₹45,000+</span>
        </div>
      </div>

      {/* Quick Verified & Trust Toggles */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 amoled:border-zinc-900">
        <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 amoled:bg-zinc-900/80 hover:bg-slate-100/80 dark:hover:bg-slate-800 cursor-pointer transition-colors">
          <span className="flex items-center gap-2 text-xs font-medium text-navy-900 dark:text-white amoled:text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Verified Properties Only
          </span>
          <input
            type="checkbox"
            checked={!!filters.verifiedOnly}
            onChange={(e) => onFilterChange({ ...filters, verifiedOnly: e.target.checked ? true : undefined })}
            className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 accent-brand-600"
          />
        </label>

        <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 amoled:bg-zinc-900/80 hover:bg-slate-100/80 dark:hover:bg-slate-800 cursor-pointer transition-colors">
          <span className="flex items-center gap-2 text-xs font-medium text-navy-900 dark:text-white amoled:text-white">
            <UtensilsCrossed className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            Food Included (Meals)
          </span>
          <input
            type="checkbox"
            checked={!!filters.foodIncluded}
            onChange={(e) => onFilterChange({ ...filters, foodIncluded: e.target.checked ? true : undefined })}
            className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 accent-brand-600"
          />
        </label>
      </div>

      {/* Room Type */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 amoled:border-zinc-900">
        <label className="block text-xs font-bold text-navy-900 dark:text-white amoled:text-white uppercase tracking-wider mb-2.5">
          Room Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {ROOM_TYPES.map((type) => {
            const isChecked = filters.roomType?.includes(type);
            return (
              <button
                key={type}
                onClick={() => handleRoomTypeToggle(type)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all ${
                  isChecked
                    ? "bg-brand-50 dark:bg-brand-950/50 amoled:bg-brand-950/40 border-brand-500 text-brand-900 dark:text-brand-300 amoled:text-brand-400 font-semibold"
                    : "bg-white dark:bg-slate-900 amoled:bg-zinc-950 border-slate-200 dark:border-slate-800 amoled:border-zinc-800 text-slate-700 dark:text-slate-300 amoled:text-zinc-300 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                    isChecked ? "bg-brand-600 border-brand-600 text-white" : "border-slate-300 dark:border-slate-700"
                  }`}
                >
                  {isChecked && <Check className="w-2.5 h-2.5" />}
                </div>
                <span className="truncate">{type}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Property Type */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 amoled:border-zinc-900">
        <label className="block text-xs font-bold text-navy-900 dark:text-white amoled:text-white uppercase tracking-wider mb-2.5">
          Property Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PROPERTY_TYPES.map((pt) => {
            const isChecked = filters.propertyType?.includes(pt);
            return (
              <button
                key={pt}
                onClick={() => handlePropertyTypeToggle(pt)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all ${
                  isChecked
                    ? "bg-brand-50 dark:bg-brand-950/50 amoled:bg-brand-950/40 border-brand-500 text-brand-900 dark:text-brand-300 amoled:text-brand-400 font-semibold"
                    : "bg-white dark:bg-slate-900 amoled:bg-zinc-950 border-slate-200 dark:border-slate-800 amoled:border-zinc-800 text-slate-700 dark:text-slate-300 amoled:text-zinc-300 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                    isChecked ? "bg-brand-600 border-brand-600 text-white" : "border-slate-300 dark:border-slate-700"
                  }`}
                >
                  {isChecked && <Check className="w-2.5 h-2.5" />}
                </div>
                <span className="truncate">{pt}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Furnishing */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 amoled:border-zinc-900">
        <label className="block text-xs font-bold text-navy-900 dark:text-white amoled:text-white uppercase tracking-wider mb-2.5">
          Furnishing
        </label>
        <div className="space-y-1.5">
          {FURNISHING_OPTIONS.map((f) => {
            const isChecked = filters.furnishing?.includes(f);
            return (
              <label
                key={f}
                className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 amoled:text-zinc-300 hover:text-navy-900 dark:hover:text-white amoled:hover:text-white cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleFurnishingToggle(f)}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 accent-brand-600"
                />
                <span>{f}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Amenities */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 amoled:border-zinc-900">
        <label className="block text-xs font-bold text-navy-900 dark:text-white amoled:text-white uppercase tracking-wider mb-2.5">
          Amenities
        </label>
        <div className="grid grid-cols-1 gap-2">
          {AMENITY_OPTIONS.map((a) => {
            const isChecked = filters.amenities?.includes(a.key);
            return (
              <label
                key={a.key}
                className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 amoled:text-zinc-300 hover:text-navy-900 dark:hover:text-white amoled:hover:text-white cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleAmenityToggle(a.key)}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 accent-brand-600"
                />
                <span>{a.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Tenant Preference */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 amoled:border-zinc-900">
        <label className="block text-xs font-bold text-navy-900 dark:text-white amoled:text-white uppercase tracking-wider mb-2.5">
          Suitable For
        </label>
        <div className="flex flex-wrap gap-2">
          {["Students", "Working Professionals", "Family", "Any"].map((pref) => {
            const isSelected = filters.tenantPreference === pref;
            return (
              <button
                key={pref}
                onClick={() =>
                  onFilterChange({
                    ...filters,
                    tenantPreference: isSelected ? undefined : pref,
                  })
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-navy-900 dark:bg-brand-600 amoled:bg-brand-600 text-white"
                    : "bg-slate-50 dark:bg-slate-800 amoled:bg-zinc-900 border border-slate-200 dark:border-slate-700 amoled:border-zinc-800 text-slate-600 dark:text-slate-300 amoled:text-zinc-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                {pref}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
