"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Lock, Mail, User, Home, Phone, MapPin } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"USER" | "OWNER">("USER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("Prayagraj");
  const [occupation, setOccupation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          role,
          preferredCity: city,
          occupation,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      if (role === "OWNER") {
        router.push("/owner/dashboard");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/90 shadow-floating p-8 space-y-6">
        
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
            Join the UrbanNest Community
          </h1>
          <p className="text-xs text-slate-500">
            Create an account to search for rooms or list your property
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-700 rounded-xl">
            {error}
          </div>
        )}

        {/* Role Toggle */}
        <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-slate-100">
          <button
            type="button"
            onClick={() => setRole("USER")}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              role === "USER"
                ? "bg-white text-navy-900 shadow-soft"
                : "text-slate-500 hover:text-navy-900"
            }`}
          >
            <User className="w-4 h-4 text-brand-600" />
            I'm a Tenant / Seeker
          </button>
          <button
            type="button"
            onClick={() => setRole("OWNER")}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              role === "OWNER"
                ? "bg-white text-navy-900 shadow-soft"
                : "text-slate-500 hover:text-navy-900"
            }`}
          >
            <Home className="w-4 h-4 text-amber-600" />
            I'm a Property Owner
          </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-navy-900 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="Rohan Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-navy-900 font-medium focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-navy-900 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-navy-900 font-medium focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-navy-900 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="rohan@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-navy-900 font-medium focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-navy-900 uppercase tracking-wider mb-1">
                Preferred City
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-navy-900 font-medium focus:outline-none"
              >
                <option value="Prayagraj">Prayagraj</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Pune">Pune</option>
                <option value="Delhi NCR">Delhi NCR</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Chennai">Chennai</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-navy-900 uppercase tracking-wider mb-1">
                Occupation / College
              </label>
              <input
                type="text"
                placeholder="Student, Engineer, etc."
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-navy-900 font-medium focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-navy-900 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-navy-900 font-medium focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-soft flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? "Creating Account..." : `Register as ${role === "OWNER" ? "Owner" : "Tenant"}`}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-brand-600 hover:underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
