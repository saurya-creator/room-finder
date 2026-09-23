"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldCheck,
  Edit3,
  PlusCircle,
  Settings,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Layers,
  Home,
} from "lucide-react";

export function AdminFloatingBar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const checkUserRole = () => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setIsAdmin(data?.user?.role === "ADMIN");
      })
      .catch(() => {});
  };

  useEffect(() => {
    checkUserRole();
  }, [pathname]);

  const handleClaimAdmin = async () => {
    try {
      const res = await fetch("/api/admin/claim-admin", { method: "POST" });
      if (res.ok) {
        setIsAdmin(true);
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to claim admin", err);
    }
  };

  if (!isAdmin) {
    return (
      <div className="fixed top-24 right-4 z-40 animate-fade-in hidden sm:block">
        <button
          onClick={handleClaimAdmin}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-900/90 text-purple-200 border border-purple-600/50 hover:bg-purple-800 backdrop-blur-md shadow-lg text-[11px] font-bold transition-all hover:scale-105"
          title="Click to elevate current session to Super Admin with full site editing rights"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
          <span>Enable Super Admin Mode</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed top-20 left-0 right-0 z-40 bg-gradient-to-r from-purple-950/95 via-indigo-950/95 to-slate-950/95 text-white border-b border-purple-800/60 shadow-xl backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-3 text-xs">
        
        {/* Left: Status & Label */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-400/30 font-bold">
            👑
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-wide uppercase text-purple-300 text-[11px]">
              Super Admin Edit Mode
            </span>
            <span className="hidden md:inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="hidden md:inline-block text-[11px] text-slate-400">
              Full Site Control & Real-Time CMS
            </span>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <Link
            href="/admin?tab=properties"
            className="px-3 py-1 rounded-xl bg-purple-800/80 hover:bg-purple-700 text-white font-bold flex items-center gap-1.5 transition-colors border border-purple-600"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Manage All</span> Rooms
          </Link>

          <Link
            href="/admin?tab=cms"
            className="px-3 py-1 rounded-xl bg-indigo-800/80 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 transition-colors border border-indigo-600"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit Site</span> Content & Cities
          </Link>

          <Link
            href="/owner/properties/new"
            className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add</span> Listing
          </Link>

          <Link
            href="/admin"
            className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <Settings className="w-3.5 h-3.5" />
            Dashboard
          </Link>
        </div>

      </div>
    </div>
  );
}
