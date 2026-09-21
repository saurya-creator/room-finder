"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Building,
  Users,
  Calendar,
  IndianRupee,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck,
  Eye,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Footer } from "@/components/footer";

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadAdminData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/analytics").then((r) => r.json()),
      fetch("/api/admin/verifications").then((r) => r.json()),
    ])
      .then(([analyticsData, verifData]) => {
        if (analyticsData?.analytics) setAnalytics(analyticsData.analytics);
        if (analyticsData?.recentUsers) setRecentUsers(analyticsData.recentUsers);
        if (verifData?.unverifiedProperties) setVerifications(verifData.unverifiedProperties);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleVerifyDecision = async (propId: string, action: "APPROVE" | "REJECT") => {
    setActionLoading(propId);
    try {
      const res = await fetch("/api/admin/verifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: "PROPERTY",
          targetId: propId,
          action,
        }),
      });
      if (res.ok) {
        setVerifications((prev) => prev.filter((p) => p.id !== propId));
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 amoled:bg-black transition-colors">
      
      {/* Header */}
      <div className="bg-navy-950 amoled:bg-black text-white border-b border-slate-800 amoled:border-zinc-850 px-4 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-extrabold font-heading text-white">
                Admin Moderation & Operations
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-900/60 text-purple-200 border border-purple-700">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Verify submitted property listings, inspect owner documentation, monitor platform gross volume and oversee user safety.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/rooms"
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Public Directory
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* KPI Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 amoled:border-zinc-850 shadow-soft">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Users & Seekers
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-black text-navy-900 dark:text-white">
                {analytics?.totalUsers || 10}
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
              Active tenant seekers
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 amoled:border-zinc-850 shadow-soft">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Registered Owners
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-black text-navy-900 dark:text-white">
                {analytics?.totalOwners || 10}
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
              Verified host landlords
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 amoled:border-zinc-850 shadow-soft">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Platform Gross Volume
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xl font-black text-navy-900 dark:text-white truncate">
                {formatCurrency(analytics?.totalGrossVolume || 54000)}
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>
            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-1 block">
              Fees: {formatCurrency(analytics?.totalRevenue || 1200)}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 amoled:border-zinc-850 shadow-soft">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Pending Verifications
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {verifications.length}
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
            </div>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1 block">
              Requires audit
            </span>
          </div>

        </div>

        {/* Verification Queue Section */}
        <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 rounded-3xl border border-slate-200/90 dark:border-slate-800 amoled:border-zinc-850 shadow-soft p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-navy-900 dark:text-white font-heading">
                Property Verification Queue
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inspect submitted rooms, verify owner documentation, and issue verified safety badges.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80">
              {verifications.length} Pending Approval
            </span>
          </div>

          {verifications.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400 dark:text-slate-500 space-y-2 bg-slate-50 dark:bg-slate-850 amoled:bg-zinc-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800 amoled:border-zinc-800">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
              <p className="font-bold text-navy-900 dark:text-white">Verification Queue Clear!</p>
              <p>All active listings have passed owner documentation verification.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {verifications.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850 amoled:bg-zinc-900/70 border border-slate-200 dark:border-slate-800 amoled:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0">
                      <img
                        src={item.images?.[0]?.url || "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=200"}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-navy-900 dark:text-white">{item.title}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                          Awaiting Badge
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {item.area}, {item.city} • Rent: {formatCurrency(item.rentMonthly)}/mo
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Host: <strong>{item.owner?.name}</strong> ({item.owner?.email} • {item.owner?.phone})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      disabled={actionLoading === item.id}
                      onClick={() => handleVerifyDecision(item.id, "APPROVE")}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-soft flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve & Verify
                    </button>
                    <button
                      disabled={actionLoading === item.id}
                      onClick={() => handleVerifyDecision(item.id, "REJECT")}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                    <Link
                      href={`/property/${item.id}`}
                      target="_blank"
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 amoled:border-zinc-800 text-slate-600 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white bg-white dark:bg-slate-800 amoled:bg-zinc-900"
                      title="Inspect Listing"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User & Owner Management Table */}
        <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 rounded-3xl border border-slate-200/90 dark:border-slate-800 amoled:border-zinc-850 shadow-soft p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-navy-900 dark:text-white font-heading">
                Platform Users & Host Directory
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Monitor registered tenants and verified property managers.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 amoled:border-zinc-850 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="pb-3">User Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">City</th>
                  <th className="pb-3">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 amoled:divide-zinc-850">
                {recentUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 amoled:hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3 font-bold text-navy-900 dark:text-white">{u.name}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">{u.email}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          u.role === "ADMIN"
                            ? "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300"
                            : u.role === "OWNER"
                            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                            : "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">{u.preferredCity || "India"}</td>
                    <td className="py-3 text-slate-400 dark:text-slate-500">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}
