"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  Heart,
  Home,
  Menu,
  X,
  Bell,
  Search,
  PlusCircle,
  Building2,
  ShieldCheck,
  Calendar,
  MessageSquare,
  Scale,
  Sparkles,
  ArrowRight,
  LogOut,
  CreditCard,
} from "lucide-react";
import { UserSummary } from "@/types";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(1);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Load current session
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/rooms?query=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/rooms");
    }
  };

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  if (isAuthPage) return null;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/90 amoled:bg-black/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 amoled:border-zinc-850 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-navy-900 dark:text-white amoled:text-white flex items-center">
                  Urban<span className="text-brand-600 dark:text-brand-400">Nest</span>
                </span>
                <span className="hidden sm:block text-[10px] font-semibold text-slate-500 dark:text-slate-400 amoled:text-zinc-500 uppercase tracking-widest -mt-1">
                  Verified Stays
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 amoled:text-zinc-300">
              <Link
                href="/rooms"
                className={`flex items-center gap-1.5 transition-colors hover:text-brand-600 dark:hover:text-brand-400 ${
                  pathname === "/rooms" ? "text-brand-600 dark:text-brand-400 font-semibold" : ""
                }`}
              >
                <Compass className="w-4 h-4" />
                Find Rooms
              </Link>
              <Link
                href="/compare"
                className={`flex items-center gap-1.5 transition-colors hover:text-brand-600 dark:hover:text-brand-400 ${
                  pathname === "/compare" ? "text-brand-600 dark:text-brand-400 font-semibold" : ""
                }`}
              >
                <Scale className="w-4 h-4" />
                Compare
              </Link>
              <Link
                href="/favorites"
                className={`flex items-center gap-1.5 transition-colors hover:text-brand-600 dark:hover:text-brand-400 ${
                  pathname === "/favorites" ? "text-brand-600 dark:text-brand-400 font-semibold" : ""
                }`}
              >
                <Heart className="w-4 h-4" />
                Saved
              </Link>
              <Link
                href="/pay"
                className={`flex items-center gap-1.5 transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 ${
                  pathname === "/pay" ? "text-emerald-600 dark:text-emerald-400 font-semibold" : ""
                }`}
              >
                <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Pay Rent</span>
              </Link>
            </nav>
          </div>

          {/* Quick Search Bar (Middle on Desktop) */}
          <div className="hidden lg:block flex-1 max-w-xs mx-6">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search city, area or landmark..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-full border border-slate-200 dark:border-slate-800 amoled:border-zinc-800 bg-slate-50 dark:bg-slate-800/80 amoled:bg-zinc-900 focus:bg-white dark:focus:bg-slate-900 amoled:focus:bg-black focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100 amoled:text-white"
              />
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
            </form>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            
            {/* Theme Toggle Button (Light / Dark / AMOLED) */}
            <ThemeToggle />

            {/* List Property CTA (Highlighted) */}
            <Link
              href="/owner/properties/new"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-brand-700 dark:text-brand-300 amoled:text-brand-400 bg-brand-50 dark:bg-brand-950/50 amoled:bg-zinc-900 border border-brand-200 dark:border-brand-900 amoled:border-zinc-800 hover:bg-brand-100 dark:hover:bg-brand-900/60 amoled:hover:bg-zinc-800 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              List Your Room
            </Link>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 rounded-full text-slate-600 dark:text-slate-300 amoled:text-zinc-300 hover:text-navy-900 dark:hover:text-white amoled:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 amoled:hover:bg-zinc-900 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-brand-500 ring-2 ring-white" />
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 amoled:bg-zinc-950 border border-slate-200 dark:border-slate-800 amoled:border-zinc-800 rounded-2xl shadow-floating p-4 z-50 animate-slide-up">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 amoled:border-zinc-900">
                    <h3 className="text-sm font-bold text-navy-900 dark:text-white amoled:text-white">Notifications</h3>
                    <span className="text-xs text-brand-600 dark:text-brand-400 font-semibold cursor-pointer" onClick={() => setUnreadNotifications(0)}>
                      Mark all as read
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 amoled:divide-zinc-900 max-h-80 overflow-y-auto mt-2">
                    <div className="py-3 flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-850 amoled:hover:bg-zinc-900 p-2 rounded-xl transition-colors">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="text-xs">
                        <p className="font-semibold text-navy-900 dark:text-white amoled:text-white">Welcome to UrbanNest!</p>
                        <p className="text-slate-500 dark:text-slate-400 amoled:text-zinc-400 mt-0.5">Explore 20+ verified rooms in Prayagraj, Bengaluru, Pune & more.</p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">Just now</span>
                      </div>
                    </div>
                    <div className="py-3 flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-850 amoled:hover:bg-zinc-900 p-2 rounded-xl transition-colors">
                      <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="text-xs">
                        <p className="font-semibold text-navy-900 dark:text-white amoled:text-white">Booking Confirmed</p>
                        <p className="text-slate-500 dark:text-slate-400 amoled:text-zinc-400 mt-0.5">Your stay at Civil Lines, Prayagraj is ready for move-in.</p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">2 hours ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile / Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 pl-3 rounded-full border border-slate-200 dark:border-slate-800 amoled:border-zinc-800 hover:border-slate-300 dark:hover:border-slate-700 amoled:hover:border-zinc-700 bg-white/50 dark:bg-slate-900/50 amoled:bg-zinc-950/50 hover:shadow-soft transition-all"
              >
                <span className="hidden sm:block text-xs font-semibold text-navy-900 dark:text-slate-200 amoled:text-white">
                  {user ? user.name.split(" ")[0] : "Account"}
                </span>
                <div className="w-8 h-8 rounded-full overflow-hidden bg-brand-100 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-xs">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.[0] || "U"
                  )}
                </div>
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 amoled:bg-zinc-950 border border-slate-200 dark:border-slate-800 amoled:border-zinc-800 rounded-2xl shadow-floating py-2 z-50 animate-slide-up">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 amoled:border-zinc-900">
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Signed in as</p>
                    <p className="text-sm font-bold text-navy-900 dark:text-white amoled:text-white truncate">{user?.name || "Guest User"}</p>
                    <div className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 amoled:bg-zinc-900 text-slate-700 dark:text-slate-300 amoled:text-zinc-300">
                      Role: {user?.role || "USER"}
                    </div>
                  </div>

                  <div className="py-1 text-xs text-slate-700 dark:text-slate-200 amoled:text-zinc-200">
                    {/* Role specific shortcuts */}
                    {user?.role === "ADMIN" ? (
                      <>
                        <Link
                          href="/admin"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 amoled:hover:bg-zinc-900 font-semibold text-purple-700 dark:text-purple-400"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Admin Moderation Panel
                        </Link>
                        <Link
                          href="/admin/verifications"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 amoled:hover:bg-zinc-900"
                        >
                          <Sparkles className="w-4 h-4" />
                          Verification Queue
                        </Link>
                      </>
                    ) : user?.role === "OWNER" ? (
                      <>
                        <Link
                          href="/owner/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 amoled:hover:bg-zinc-900 font-semibold text-brand-700 dark:text-brand-400"
                        >
                          <Home className="w-4 h-4" />
                          Owner Dashboard
                        </Link>
                        <Link
                          href="/owner/properties/new"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 amoled:hover:bg-zinc-900"
                        >
                          <PlusCircle className="w-4 h-4" />
                          Add New Room
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 amoled:hover:bg-zinc-900 font-semibold text-navy-900 dark:text-white amoled:text-white"
                        >
                          <Calendar className="w-4 h-4" />
                          My Bookings
                        </Link>
                        <Link
                          href="/favorites"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 amoled:hover:bg-zinc-900"
                        >
                          <Heart className="w-4 h-4" />
                          Saved Rooms
                        </Link>
                      </>
                    )}

                    <Link
                      href="/messages"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 amoled:hover:bg-zinc-900"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Messages
                    </Link>

                    <div className="border-t border-slate-100 dark:border-slate-800 amoled:border-zinc-900 my-1"></div>

                    <Link
                      href="/rooms"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 amoled:hover:bg-zinc-900"
                    >
                      <Compass className="w-4 h-4" />
                      Explore All Rooms
                    </Link>

                    <Link
                      href="/login"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 amoled:hover:bg-zinc-900 text-slate-500 dark:text-slate-400"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign in with other account
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 amoled:text-zinc-300 hover:text-navy-900 dark:hover:text-white amoled:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 amoled:hover:bg-zinc-900"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 dark:border-slate-800 amoled:border-zinc-900 space-y-3 animate-slide-up">
            <form onSubmit={handleSearchSubmit} className="relative mb-3">
              <input
                type="text"
                placeholder="Search rooms, cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 amoled:border-zinc-800 bg-slate-50 dark:bg-slate-800 amoled:bg-zinc-900 text-slate-900 dark:text-white amoled:text-white placeholder:text-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </form>

            <Link
              href="/rooms"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-navy-900 dark:text-white amoled:text-white hover:bg-slate-50 dark:hover:bg-slate-800 amoled:hover:bg-zinc-900"
            >
              <div className="flex items-center gap-3">
                <Compass className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                Find Rooms
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              href="/compare"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-navy-900 dark:text-white amoled:text-white hover:bg-slate-50 dark:hover:bg-slate-800 amoled:hover:bg-zinc-900"
            >
              <div className="flex items-center gap-3">
                <Scale className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                Compare Rooms
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              href="/favorites"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-navy-900 dark:text-white amoled:text-white hover:bg-slate-50 dark:hover:bg-slate-800 amoled:hover:bg-zinc-900"
            >
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                Saved Rooms
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              href="/pay"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-navy-900 dark:text-white amoled:text-white hover:bg-slate-50 dark:hover:bg-slate-800 amoled:hover:bg-zinc-900"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Pay Rent Online
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              href="/owner/properties/new"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-brand-700 dark:text-brand-300 amoled:text-brand-400 bg-brand-50 dark:bg-brand-950/60 amoled:bg-zinc-900 border border-brand-200 dark:border-brand-900 amoled:border-zinc-800"
            >
              <div className="flex items-center gap-3">
                <PlusCircle className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                List Your Room
              </div>
              <ArrowRight className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
