"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Lock, Mail, ArrowRight, ShieldCheck, User, Home } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("rahul.sharma@example.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.user.role === "ADMIN") {
        router.push("/admin");
      } else if (data.user.role === "OWNER") {
        router.push("/owner/dashboard");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string, role: string) => {
    setEmail(demoEmail);
    if (role === "ADMIN") {
      setPassword("sv#223221");
    } else {
      setPassword("password123");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-floating p-8 space-y-6">
        
        {/* Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-glow">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-navy-900">
              Urban<span className="text-brand-600">Nest</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold text-navy-900 font-heading">
            Sign In to Your Account
          </h1>
          <p className="text-xs text-slate-500">
            Access your bookings, saved rooms, and tenant inquiries
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-700 rounded-xl">
            {error}
          </div>
        )}

        {/* 1-Click Quick Demo Selectors */}
        <div className="space-y-2">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
            One-Click Account Switcher
          </span>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickFill("rahul.sharma@example.com", "USER")}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-center transition-colors"
            >
              <User className="w-4 h-4 mx-auto mb-1 text-brand-600" />
              <span className="font-bold block text-[11px]">Tenant</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("rajesh.mehra@example.com", "OWNER")}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-center transition-colors"
            >
              <Home className="w-4 h-4 mx-auto mb-1 text-amber-600" />
              <span className="font-bold block text-[11px]">Owner</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("hackdark590@gmail.com", "ADMIN")}
              className="p-2 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 text-center transition-colors font-bold shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-purple-600" />
              <span className="block text-[11px]">Site Owner</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-navy-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-navy-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-soft flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In to UrbanNest"}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Don't have an account?{" "}
          <Link href="/register" className="font-bold text-brand-600 hover:underline">
            Create account
          </Link>
        </div>

      </div>
    </div>
  );
}
