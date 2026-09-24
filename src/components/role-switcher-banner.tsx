"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  User,
  ShieldCheck,
  Home,
  ArrowRightLeft,
  Check,
  Sparkles,
  Loader2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

interface DemoUser {
  name: string;
  role: "USER" | "OWNER" | "ADMIN";
  label: string;
  email: string;
  tagline: string;
  dashboardPath: string;
}

const DEMO_USERS: DemoUser[] = [
  {
    name: "Rahul Sharma",
    role: "USER",
    label: "Tenant (Seeker)",
    email: "rahul.sharma@example.com",
    tagline: "Search, Compare, Book & Chat",
    dashboardPath: "/dashboard",
  },
  {
    name: "Rajesh Mehra",
    role: "OWNER",
    label: "Property Owner",
    email: "rajesh.mehra@example.com",
    tagline: "Dashboard, Enquiries, Add Room",
    dashboardPath: "/owner/dashboard",
  },
  {
    name: "Site Owner",
    role: "ADMIN",
    label: "Super Admin (Owner)",
    email: "hackdark590@gmail.com",
    tagline: "Site Owner & Full CMS Authority",
    dashboardPath: "/admin",
  },
];

interface SessionUserInfo {
  id?: string;
  name?: string;
  email?: string;
  role?: "USER" | "OWNER" | "ADMIN";
}

export function RoleSwitcherBanner() {
  const [currentUser, setCurrentUser] = useState<SessionUserInfo | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [switchingEmail, setSwitchingEmail] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const pathname = usePathname();

  const fetchSessionUser = () => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchSessionUser();
    const handleAuthChange = () => fetchSessionUser();
    window.addEventListener("auth-changed", handleAuthChange);
    return () => window.removeEventListener("auth-changed", handleAuthChange);
  }, [pathname]);

  const handleSwitch = async (demoUser: DemoUser, stayOnPage = false) => {
    setLoading(true);
    setSwitchingEmail(demoUser.email);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/switch-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: demoUser.email, role: demoUser.role }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to switch role");
      }

      // Notify any other components listening on window
      window.dispatchEvent(new Event("auth-changed"));

      // Determine destination
      if (stayOnPage) {
        window.location.reload();
        return;
      }

      // If user is currently on an unauthorized dashboard, navigate to matching dashboard
      const isCurrentlyOnDashboard =
        pathname.startsWith("/admin") ||
        pathname.startsWith("/owner") ||
        pathname === "/dashboard";

      let target = demoUser.dashboardPath;
      if (!isCurrentlyOnDashboard && !stayOnPage) {
        // From public pages, go to their dashboard to showcase persona capabilities
        target = demoUser.dashboardPath;
      }

      // Hard redirect to clear out any stale Next.js client router caches
      window.location.href = target;
    } catch (err: any) {
      console.error("Failed to switch demo role:", err);
      setErrorMsg(err.message || "Failed to switch persona. Please retry.");
      setLoading(false);
      setSwitchingEmail(null);
    }
  };

  // Find active demo persona matching either email or role
  const activeUser =
    DEMO_USERS.find(
      (u) =>
        currentUser?.email?.toLowerCase() === u.email.toLowerCase() ||
        currentUser?.role === u.role
    ) || DEMO_USERS[0];

  const currentRole = currentUser?.role || activeUser.role;

  return (
    <aside
      aria-label="Instant Persona Switcher"
      className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 select-none"
    >
      <div className="bg-navy-900/95 dark:bg-slate-900/95 amoled:bg-black/95 backdrop-blur-xl text-white border border-slate-700/80 dark:border-slate-800 amoled:border-zinc-800 rounded-2xl shadow-floating p-2 transition-all duration-300">
        {!isExpanded ? (
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-3 px-3 py-2 text-xs font-medium hover:text-brand-400 transition-colors group"
            title="Click to switch between Tenant, Owner, and Admin personas"
          >
            <div
              className={`flex items-center justify-center w-7 h-7 rounded-full border transition-transform group-hover:scale-110 ${
                currentRole === "ADMIN"
                  ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                  : currentRole === "OWNER"
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  : "bg-brand-500/20 text-brand-400 border-brand-500/30"
              }`}
            >
              {currentRole === "ADMIN" ? (
                <ShieldCheck className="w-4 h-4" />
              ) : currentRole === "OWNER" ? (
                <Home className="w-4 h-4" />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
            <div className="text-left">
              <span className="block text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                Active Persona
              </span>
              <span className="font-bold text-slate-100 flex items-center gap-1.5">
                {activeUser.label}
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </span>
            </div>
            <ArrowRightLeft className="w-3.5 h-3.5 ml-1 text-slate-400 group-hover:rotate-180 transition-transform duration-300" />
          </button>
        ) : (
          <div className="p-3 w-84 sm:w-96 max-w-[calc(100vw-2rem)]">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 amoled:border-zinc-900">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-slate-100 tracking-wide uppercase">
                    Instant Persona Switcher
                  </span>
                  <span className="block text-[10px] text-slate-400">
                    Switch roles instantly with 1-click
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsExpanded(false);
                  setErrorMsg(null);
                }}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕ Close
              </button>
            </div>

            {errorMsg && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-2">
              {DEMO_USERS.map((user) => {
                const isActive =
                  currentUser?.email?.toLowerCase() === user.email.toLowerCase() ||
                  currentRole === user.role;
                const isThisSwitching = loading && switchingEmail === user.email;

                return (
                  <div
                    key={user.email}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isActive
                        ? "bg-brand-500/15 border-brand-500/50 text-white shadow-soft"
                        : "bg-navy-800/60 dark:bg-slate-800/60 amoled:bg-zinc-900/80 border-slate-700/60 hover:bg-navy-800 dark:hover:bg-slate-800 amoled:hover:bg-zinc-850 text-slate-300 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                            user.role === "ADMIN"
                              ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                              : user.role === "OWNER"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : "bg-brand-500/20 text-brand-400 border border-brand-500/30"
                          }`}
                        >
                          {user.role === "ADMIN" ? (
                            <ShieldCheck className="w-4 h-4" />
                          ) : user.role === "OWNER" ? (
                            <Home className="w-4 h-4" />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold flex items-center gap-1.5 truncate">
                            <span>{user.label}</span>
                            {isActive && (
                              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-brand-500/30 text-brand-300 border border-brand-400/30">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {user.name} • {user.tagline}
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        disabled={loading}
                        onClick={() => handleSwitch(user, false)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                          isActive
                            ? "bg-brand-600/60 text-white hover:bg-brand-600 border border-brand-400/40"
                            : "bg-brand-600 hover:bg-brand-500 text-white shadow-soft"
                        } disabled:opacity-50`}
                      >
                        {isThisSwitching ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Switching...</span>
                          </>
                        ) : isActive ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-brand-300" />
                            <span>Dashboard</span>
                          </>
                        ) : (
                          <>
                            <span>Switch</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>

                    {/* Secondary option: Switch and Stay on this page */}
                    {!isActive && !loading && (
                      <div className="mt-1.5 pt-1.5 border-t border-slate-700/40 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleSwitch(user, true)}
                          className="text-[10px] text-slate-400 hover:text-brand-300 transition-colors flex items-center gap-1"
                        >
                          Switch & stay on current page
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800 amoled:border-zinc-900 text-center">
              <p className="text-[10px] text-slate-400">
                Switch anytime to test Tenant, Owner & Admin flows seamlessly.
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
