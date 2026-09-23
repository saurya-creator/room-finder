"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Edit3, Trash2, Sparkles, Star } from "lucide-react";
import { AdminPropertyModal } from "@/components/admin-property-modal";

interface PropertyAdminActionsProps {
  property: any;
}

export function PropertyAdminActions({ property }: PropertyAdminActionsProps) {
  const [isAdminOrOwner, setIsAdminOrOwner] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProp, setCurrentProp] = useState(property);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        const role = data?.user?.role;
        const uid = data?.user?.id;
        if (role === "ADMIN" || (uid && uid === property.ownerId)) {
          setIsAdminOrOwner(true);
        }
      })
      .catch(() => {});
  }, [property.ownerId]);

  if (!isAdminOrOwner) return null;

  return (
    <>
      <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-brand-500/10 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
            👑
          </div>
          <div>
            <div className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
              <span>Admin & Host Management Tools</span>
              {currentProp.featured && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
                  ★ Featured
                </span>
              )}
              {currentProp.isVerified && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                  ✓ Verified
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              You have full permission to edit prices, photos, location, or remove this listing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-soft flex items-center gap-1.5 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit Listing Details
          </button>
        </div>
      </div>

      <AdminPropertyModal
        property={currentProp}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdated={(updated) => {
          setCurrentProp(updated);
          router.refresh();
        }}
        onDeleted={() => {
          router.push("/rooms");
        }}
      />
    </>
  );
}
