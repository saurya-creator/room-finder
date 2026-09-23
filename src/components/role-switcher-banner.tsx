"use client";

import React, { useState, useEffect } from "react";
import { User, ShieldCheck, Home, ArrowRightLeft, Check, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

interface DemoUser {
  name: string;
  role: "USER" | "OWNER" | "ADMIN";
  label: string;
  email: string;
  tagline: string;
}

const DEMO_USERS: DemoUser[] = [
  {
    name: "Rahul Sharma",
    role: "USER",
    label: "Tenant (Seeker)",
    email: "rahul.sharma@example.com",
    tagline: "Search, Compare, Book & Chat",
  },
  {
    name: "Rajesh Mehra",
    role: "OWNER",
    label: "Property Owner",
    email: "rajesh.mehra@example.com",
    tagline: "Dashboard, Enquiries, Add Room",
  },
  {
    name: "Site Owner",
    role: "ADMIN",
    label: "Super Admin (Owner)",
    email: "hackdark590@gmail.com",
    tagline: "Site Owner & Full CMS Authority",
  },
];

export function RoleSwitcherBanner() {
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("rahul.sharma@example.com");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    // Fetch active session user email
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user?.email) {
          setCurrentUserEmail(data.user.email);
        }
      })
      .catch(() => {});
  }, []);

  const handleSwitch = async (demoUser: DemoUser) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/switch-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: demoUser.email }),
      });
      if (res.ok) {
        setCurrentUserEmail(demoUser.email);
        setIsExpanded(false);
        // Direct redirect based on role
        if (demoUser.role === "OWNER") {
          router.push("/owner/dashboard");
        } else if (demoUser.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to switch demo role", err);
    } finally {
      setLoading(false);
    }
  };

  const activeUser = DEMO_USERS.find((u) => u.email === currentUserEmail) || DEMO_USERS[0];

  return (
    <aside aria-label="Demo role selector" className="fixed bottom-5 right-5 z-50">
      <div className="bg-navy-900/95 dark:bg-slate-900/95 amoled:bg-black/95 backdrop-blur-md text-white border border-slate-700/80 dark:border-slate-800 amoled:border-zinc-800 rounded-2xl shadow-floating p-2 transition-all duration-300">
        {!isExpanded ? (
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-3 px-3 py-2 text-xs font-medium hover:text-brand-400 transition-colors"
            title="Click to switch between Tenant, Owner, and Admin personas"
          >
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30">
              {activeUser.role === "ADMIN" ? (
                <ShieldCheck className="w-4 h-4" />
              ) : activeUser.role === "OWNER" ? (
                <Home className="w-4 h-4" />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
            <div className="text-left">
              <span className="block text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Active Persona</span>
              <span className="font-semibold text-slate-200">{activeUser.label}</span>
            </div>
            <ArrowRightLeft className="w-3.5 h-3.5 ml-1 text-slate-400" />
          </button>
        ) : (
          <div className="p-3 w-80">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 amoled:border-zinc-900">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-400" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Instant Persona Switcher</span>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-xs text-slate-400 hover:text-white px-1.5 py-0.5 rounded"
              >
                Close ✕
              </button>
            </div>

            <div className="space-y-2">
              {DEMO_USERS.map((user) => {
                const isActive = user.email === currentUserEmail;
                return (
                  <button
                    key={user.email}
                    disabled={loading}
                    onClick={() => handleSwitch(user)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                      isActive
                        ? "bg-brand-500/15 border-brand-500/50 text-white"
                        : "bg-navy-800/60 dark:bg-slate-800/60 amoled:bg-zinc-900/80 border-slate-700/60 dark:border-slate-700/60 amoled:border-zinc-800 hover:bg-navy-800 dark:hover:bg-slate-800 amoled:hover:bg-zinc-850 text-slate-300 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          user.role === "ADMIN"
                            ? "bg-purple-500/20 text-purple-400"
                            : user.role === "OWNER"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-brand-500/20 text-brand-400"
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
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          {user.label}
                          {isActive && <Check className="w-3.5 h-3.5 text-brand-400" />}
                        </div>
                        <div className="text-[11px] text-slate-400">{user.tagline}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="mt-3 text-[10px] text-slate-400 text-center">
              Switch anytime to test Tenant, Owner & Admin flows seamlessly.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
