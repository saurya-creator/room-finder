"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Scale,
  X,
  Check,
  ShieldCheck,
  Star,
  Plus,
  ArrowRight,
  Sparkles,
  MapPin,
  Bed,
  IndianRupee,
} from "lucide-react";
import { PropertyItem } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Footer } from "@/components/footer";

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [allProperties, setAllProperties] = useState<PropertyItem[]>([]);
  const [loading, setLoading] = useState(true);

  const idsParam = searchParams.get("ids");

  useEffect(() => {
    fetch("/api/properties")
      .then((res) => res.json())
      .then((data) => {
        if (data?.properties) {
          setAllProperties(data.properties);

          const requestedIds = idsParam ? idsParam.split(",").filter(Boolean) : [];
          if (requestedIds.length > 0) {
            const matched = data.properties.filter((p: PropertyItem) =>
              requestedIds.includes(p.id)
            );
            setProperties(matched);
          } else {
            // Default select top 3 properties to compare immediately
            setProperties(data.properties.slice(0, 3));
          }
        }
      })
      .finally(() => setLoading(false));
  }, [idsParam]);

  const handleRemoveProperty = (id: string) => {
    const updated = properties.filter((p) => p.id !== id);
    setProperties(updated);
    router.replace(`/compare?ids=${updated.map((p) => p.id).join(",")}`);
  };

  const handleAddProperty = (prop: PropertyItem) => {
    if (properties.some((p) => p.id === prop.id)) return;
    if (properties.length >= 4) {
      alert("You can compare up to 4 properties simultaneously.");
      return;
    }
    const updated = [...properties, prop];
    setProperties(updated);
    router.replace(`/compare?ids=${updated.map((p) => p.id).join(",")}`);
  };

  // Find minimum rent among compared properties for best value highlight
  const minRent = properties.length > 0
    ? Math.min(...properties.map((p) => p.rentMonthly))
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 amoled:bg-black transition-colors">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 amoled:bg-black border-b border-slate-200/80 dark:border-slate-800 amoled:border-zinc-850 px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
            <Scale className="w-4 h-4" />
            Decision Matrix
          </div>
          <h1 className="text-3xl font-extrabold text-navy-950 dark:text-white font-heading">
            Side-by-Side Property Comparison
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Evaluate rent, security deposits, amenities, room dimensions, house rules, and verified host credentials to pick the ideal stay.
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 dark:text-slate-500">Loading comparison matrix...</div>
        ) : properties.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 amoled:bg-zinc-950 rounded-3xl border border-slate-200 dark:border-slate-800 amoled:border-zinc-850 p-8 space-y-4 shadow-soft">
            <Scale className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-navy-900 dark:text-white">No properties selected for comparison</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Select rooms while browsing or pick from our recommended stays below.
            </p>
            <Link
              href="/rooms"
              className="inline-block px-5 py-2.5 rounded-full text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-soft"
            >
              Browse Stays
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 rounded-3xl border border-slate-200/90 dark:border-slate-800 amoled:border-zinc-850 shadow-soft overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 amoled:border-zinc-850">
                  <th className="p-5 w-48 min-w-[180px] bg-slate-50/50 dark:bg-slate-850/50 amoled:bg-zinc-900/50 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Features
                  </th>
                  {properties.map((prop) => (
                    <th key={prop.id} className="p-5 w-64 min-w-[240px] align-top relative">
                      <button
                        onClick={() => handleRemoveProperty(prop.id)}
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 amoled:bg-zinc-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <div className="space-y-3 pr-6">
                        <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                          <img
                            src={prop.images?.[0]?.url || "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600"}
                            alt={prop.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                            <MapPin className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
                            <span className="truncate">{prop.area}, {prop.city}</span>
                          </div>
                          <Link href={`/property/${prop.id}`} className="block font-bold text-sm text-navy-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 line-clamp-1 mt-0.5">
                            {prop.title}
                          </Link>
                        </div>

                        <Link
                          href={`/property/${prop.id}`}
                          className="inline-block w-full py-2 text-center rounded-xl text-xs font-bold text-white bg-navy-900 dark:bg-brand-600 amoled:bg-brand-600 hover:bg-brand-600 dark:hover:bg-brand-700 transition-colors"
                        >
                          Book Stay
                        </Link>
                      </div>
                    </th>
                  ))}

                  {properties.length < 4 && (
                    <th className="p-5 w-48 min-w-[180px] border-l border-dashed border-slate-200 dark:border-slate-800 amoled:border-zinc-850 text-center align-middle bg-slate-50/30 dark:bg-slate-850/30 amoled:bg-zinc-900/30">
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Compare another</p>
                        <select
                          onChange={(e) => {
                            const found = allProperties.find((p) => p.id === e.target.value);
                            if (found) handleAddProperty(found);
                          }}
                          defaultValue=""
                          className="w-full px-2 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 amoled:border-zinc-800 bg-white dark:bg-slate-800 amoled:bg-zinc-900 text-navy-900 dark:text-white"
                        >
                          <option value="" disabled>+ Add property</option>
                          {allProperties
                            .filter((p) => !properties.some((cp) => cp.id === p.id))
                            .map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.city} - {p.title.substring(0, 24)}...
                              </option>
                            ))}
                        </select>
                      </div>
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 amoled:divide-zinc-850 text-xs">
                
                {/* Monthly Rent */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 amoled:hover:bg-zinc-900/40 transition-colors">
                  <td className="p-4 font-bold text-navy-900 dark:text-slate-200 bg-slate-50/40 dark:bg-slate-850/40 amoled:bg-zinc-900/40">Monthly Rent</td>
                  {properties.map((p) => {
                    const isBest = p.rentMonthly === minRent;
                    return (
                      <td key={p.id} className="p-4">
                        <div className="flex items-baseline gap-1">
                          <span className={`text-base font-extrabold ${isBest ? "text-emerald-600 dark:text-emerald-400" : "text-navy-900 dark:text-white"}`}>
                            {formatCurrency(p.rentMonthly)}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">/mo</span>
                          {isBest && (
                            <span className="ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                              Best Price
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                  {properties.length < 4 && <td />}
                </tr>

                {/* Deposit */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 amoled:hover:bg-zinc-900/40 transition-colors">
                  <td className="p-4 font-bold text-navy-900 dark:text-slate-200 bg-slate-50/40 dark:bg-slate-850/40 amoled:bg-zinc-900/40">Security Deposit</td>
                  {properties.map((p) => (
                    <td key={p.id} className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                      {formatCurrency(p.deposit)}
                    </td>
                  ))}
                  {properties.length < 4 && <td />}
                </tr>

                {/* Room Type */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 amoled:hover:bg-zinc-900/40 transition-colors">
                  <td className="p-4 font-bold text-navy-900 dark:text-slate-200 bg-slate-50/40 dark:bg-slate-850/40 amoled:bg-zinc-900/40">Room Type</td>
                  {properties.map((p) => (
                    <td key={p.id} className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                      {p.roomType}
                    </td>
                  ))}
                  {properties.length < 4 && <td />}
                </tr>

                {/* Furnishing */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 amoled:hover:bg-zinc-900/40 transition-colors">
                  <td className="p-4 font-bold text-navy-900 dark:text-slate-200 bg-slate-50/40 dark:bg-slate-850/40 amoled:bg-zinc-900/40">Furnishing</td>
                  {properties.map((p) => (
                    <td key={p.id} className="p-4 text-slate-700 dark:text-slate-300">
                      {p.furnishing}
                    </td>
                  ))}
                  {properties.length < 4 && <td />}
                </tr>

                {/* Size */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 amoled:hover:bg-zinc-900/40 transition-colors">
                  <td className="p-4 font-bold text-navy-900 dark:text-slate-200 bg-slate-50/40 dark:bg-slate-850/40 amoled:bg-zinc-900/40">Room Size</td>
                  {properties.map((p) => (
                    <td key={p.id} className="p-4 text-slate-700 dark:text-slate-300">
                      {p.roomSizeSqft} sq.ft
                    </td>
                  ))}
                  {properties.length < 4 && <td />}
                </tr>

                {/* Bathrooms & Balcony */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 amoled:hover:bg-zinc-900/40 transition-colors">
                  <td className="p-4 font-bold text-navy-900 dark:text-slate-200 bg-slate-50/40 dark:bg-slate-850/40 amoled:bg-zinc-900/40">Baths & Balcony</td>
                  {properties.map((p) => (
                    <td key={p.id} className="p-4 text-slate-700 dark:text-slate-300">
                      {p.bathrooms} Bath • {p.balconies} Balcony
                    </td>
                  ))}
                  {properties.length < 4 && <td />}
                </tr>

                {/* Meals & Food */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 amoled:hover:bg-zinc-900/40 transition-colors">
                  <td className="p-4 font-bold text-navy-900 dark:text-slate-200 bg-slate-50/40 dark:bg-slate-850/40 amoled:bg-zinc-900/40">Meals / Food</td>
                  {properties.map((p) => (
                    <td key={p.id} className="p-4">
                      {p.foodIncluded ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400">
                          <Check className="w-3.5 h-3.5" /> Included
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500">Not Included</span>
                      )}
                    </td>
                  ))}
                  {properties.length < 4 && <td />}
                </tr>

                {/* Verification */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 amoled:hover:bg-zinc-900/40 transition-colors">
                  <td className="p-4 font-bold text-navy-900 dark:text-slate-200 bg-slate-50/40 dark:bg-slate-850/40 amoled:bg-zinc-900/40">Host Verification</td>
                  {properties.map((p) => (
                    <td key={p.id} className="p-4">
                      {p.isVerified ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Verified Host
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500">Standard</span>
                      )}
                    </td>
                  ))}
                  {properties.length < 4 && <td />}
                </tr>

                {/* Key Amenities */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 amoled:hover:bg-zinc-900/40 transition-colors">
                  <td className="p-4 font-bold text-navy-900 dark:text-slate-200 bg-slate-50/40 dark:bg-slate-850/40 amoled:bg-zinc-900/40">Key Amenities</td>
                  {properties.map((p) => (
                    <td key={p.id} className="p-4 text-slate-600 dark:text-slate-300 space-y-1">
                      {p.amenities.slice(0, 4).map((a) => (
                        <div key={a.id || a.name} className="flex items-center gap-1.5 text-[11px]">
                          <Check className="w-3 h-3 text-brand-600 dark:text-brand-400" />
                          <span>{a.name}</span>
                        </div>
                      ))}
                    </td>
                  ))}
                  {properties.length < 4 && <td />}
                </tr>

                {/* Connectivity Distance */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 amoled:hover:bg-zinc-900/40 transition-colors">
                  <td className="p-4 font-bold text-navy-900 dark:text-slate-200 bg-slate-50/40 dark:bg-slate-850/40 amoled:bg-zinc-900/40">Transit Distance</td>
                  {properties.map((p) => (
                    <td key={p.id} className="p-4 text-slate-600 dark:text-slate-400 text-[11px]">
                      {p.distanceToHub || "Central location"}
                    </td>
                  ))}
                  {properties.length < 4 && <td />}
                </tr>

              </tbody>
            </table>
          </div>
        )}

      </div>

      <Footer />
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs">Loading comparison...</div>}>
      <CompareContent />
    </Suspense>
  );
}
