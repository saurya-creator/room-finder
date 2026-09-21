"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Heart, Calendar, User } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  if (isAuthPage) return null;

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Search", href: "/rooms", icon: Compass },
    { label: "Saved", href: "/favorites", icon: Heart },
    { label: "Bookings", href: "/dashboard", icon: Calendar },
    { label: "Profile", href: "/dashboard", icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 amoled:bg-black/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 amoled:border-zinc-800 px-4 py-2 flex items-center justify-around">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-semibold transition-colors ${
              isActive
                ? "text-brand-600 dark:text-brand-400 font-bold"
                : "text-slate-500 dark:text-slate-400 amoled:text-zinc-400 hover:text-navy-900 dark:hover:text-white amoled:hover:text-white"
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? "text-brand-600 dark:text-brand-400 stroke-[2.5]" : "text-slate-400 dark:text-slate-500 amoled:text-zinc-500"}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
