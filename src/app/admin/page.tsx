"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  Edit3,
  Trash2,
  Plus,
  Search,
  SlidersHorizontal,
  Star,
  Settings,
  Globe,
  Phone,
  Mail,
  MapPin,
  Save,
  Layers,
  Home,
  Check,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Footer } from "@/components/footer";
import { AdminPropertyModal } from "@/components/admin-property-modal";
import { SiteSettings, DEFAULT_SITE_SETTINGS } from "@/lib/site-settings";

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "properties";
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Data States
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  // Filters & Selection
  const [propSearch, setPropSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [userSearch, setUserSearch] = useState("");

  // Modals & Feedback
  const [editingProperty, setEditingProperty] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Sync tab with URL if changed
  useEffect(() => {
    const t = searchParams.get("tab");
    if (t) setActiveTab(t);
  }, [searchParams]);

  // Load all data
  const loadAllAdminData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/analytics").then((r) => r.json()).catch(() => ({})),
      fetch("/api/admin/verifications").then((r) => r.json()).catch(() => ({})),
      fetch("/api/properties?all=true").then((r) => r.json()).catch(() => ({})),
      fetch("/api/admin/users").then((r) => r.json()).catch(() => ({})),
      fetch("/api/admin/settings").then((r) => r.json()).catch(() => ({})),
    ])
      .then(([analyticsData, verifData, propsData, usersData, settingsData]) => {
        if (analyticsData?.analytics) setAnalytics(analyticsData.analytics);
        if (verifData?.unverifiedProperties) setVerifications(verifData.unverifiedProperties);
        if (propsData?.properties) setProperties(propsData.properties);
        if (usersData?.users) setUsersList(usersData.users);
        if (settingsData?.settings) setSiteSettings(settingsData.settings);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  // Verification Decision
  const handleVerifyDecision = async (propId: string, action: "APPROVE" | "REJECT") => {
    setActionLoading(propId);
    try {
      const res = await fetch("/api/admin/verifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType: "PROPERTY", targetId: propId, action }),
      });
      if (res.ok) {
        setVerifications((prev) => prev.filter((p) => p.id !== propId));
        loadAllAdminData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  // Quick Toggle Property Featured
  const handleToggleFeatured = async (property: any) => {
    const nextFeatured = !property.featured;
    try {
      const res = await fetch(`/api/properties/${property.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: nextFeatured }),
      });
      if (res.ok) {
        setProperties((prev) =>
          prev.map((p) => (p.id === property.id ? { ...p, featured: nextFeatured } : p))
        );
      }
    } catch (err) {
      console.error("Toggle featured error:", err);
    }
  };

  // Quick Toggle Property Verified
  const handleToggleVerified = async (property: any) => {
    const nextVerified = !property.isVerified;
    try {
      const res = await fetch(`/api/properties/${property.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: nextVerified }),
      });
      if (res.ok) {
        setProperties((prev) =>
          prev.map((p) => (p.id === property.id ? { ...p, isVerified: nextVerified } : p))
        );
      }
    } catch (err) {
      console.error("Toggle verified error:", err);
    }
  };

  // Delete Property
  const handleDeleteProperty = async (propId: string) => {
    if (!confirm("Are you sure you want to permanently delete this listing from the site?")) return;
    try {
      const res = await fetch(`/api/properties/${propId}`, { method: "DELETE" });
      if (res.ok) {
        setProperties((prev) => prev.filter((p) => p.id !== propId));
      }
    } catch (err) {
      console.error("Delete property error:", err);
    }
  };

  // User Role Change
  const handleUserRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        setUsersList((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      console.error("Update role error:", err);
    }
  };

  // Save Site Settings
  const handleSaveSettings = async () => {
    setSavingSettings(true);
    setSettingsSuccess(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(siteSettings),
      });
      if (res.ok) {
        setSettingsSuccess(true);
        setTimeout(() => setSettingsSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Save settings error:", err);
    } finally {
      setSavingSettings(false);
    }
  };

  // Filtered Properties
  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      propSearch.trim() === "" ||
      p.title.toLowerCase().includes(propSearch.toLowerCase()) ||
      p.area.toLowerCase().includes(propSearch.toLowerCase()) ||
      p.city.toLowerCase().includes(propSearch.toLowerCase());

    const matchesCity = cityFilter === "ALL" || p.city.toLowerCase() === cityFilter.toLowerCase();
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;

    return matchesSearch && matchesCity && matchesStatus;
  });

  // Filtered Users
  const filteredUsers = usersList.filter((u) => {
    return (
      userSearch.trim() === "" ||
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.phone && u.phone.includes(userSearch))
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 amoled:bg-black transition-colors">
      
      {/* Top Header Banner */}
      <div className="bg-navy-950 amoled:bg-black text-white border-b border-slate-800 amoled:border-zinc-850 px-4 sm:px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-base">
                👑
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
                Super Admin Control Center
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-900/80 text-purple-200 border border-purple-600">
                Full Site Authority
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Manage all property listings, edit site-wide content, configure hero & cities, verify landlords, and control platform economics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/owner/properties/new"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-soft flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add New Room
            </Link>
            <Link
              href="/rooms"
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              View Public Site ↗
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto mt-6 flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
          <button
            onClick={() => setActiveTab("properties")}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "properties"
                ? "bg-purple-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Manage All Properties ({properties.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("cms")}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "cms"
                ? "bg-purple-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Site Content & Cities CMS</span>
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "users"
                ? "bg-purple-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users & Hosts ({usersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("verifications")}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "verifications"
                ? "bg-purple-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Verification Queue ({verifications.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "analytics"
                ? "bg-purple-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <IndianRupee className="w-4 h-4" />
            <span>Revenue & Metrics</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* ========================================================= */}
        {/* TAB 1: PROPERTIES & LISTINGS FULL CRUD MANAGER            */}
        {/* ========================================================= */}
        {activeTab === "properties" && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Top Toolbar & Filters */}
            <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 amoled:border-zinc-850 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by title, area, city..."
                  value={propSearch}
                  onChange={(e) => setPropSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div>
                  <select
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-navy-900 dark:text-white font-semibold"
                  >
                    <option value="ALL">All Cities</option>
                    <option value="Prayagraj">Prayagraj</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Pune">Pune</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Mumbai">Mumbai</option>
                  </select>
                </div>

                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-navy-900 dark:text-white font-semibold"
                  >
                    <option value="ALL">All Status</option>
                    <option value="PUBLISHED">Published (Live)</option>
                    <option value="DRAFT">Draft</option>
                    <option value="RENTED">Rented</option>
                    <option value="PAUSED">Paused</option>
                  </select>
                </div>

                <Link
                  href="/owner/properties/new"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-soft flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Room
                </Link>
              </div>
            </div>

            {/* Properties Table */}
            <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 rounded-3xl border border-slate-200/90 dark:border-slate-800 amoled:border-zinc-850 shadow-soft overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-navy-900 dark:text-white">
                    Showing {filteredProperties.length} Properties
                  </h3>
                  <p className="text-xs text-slate-500">
                    Click "Edit" on any property to change prices, photos, description, location, or badges.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold bg-slate-50/50 dark:bg-slate-900/50">
                      <th className="p-4">Property</th>
                      <th className="p-4">Location</th>
                      <th className="p-4">Pricing</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Badges & Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {filteredProperties.map((prop) => (
                      <tr
                        key={prop.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Thumbnail & Title */}
                        <td className="p-4">
                          <div className="flex items-center gap-3 min-w-[200px]">
                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0">
                              <img
                                src={prop.images?.[0]?.url || "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=200"}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-bold text-navy-900 dark:text-white line-clamp-1">
                                {prop.title}
                              </div>
                              <div className="text-[11px] text-slate-500 line-clamp-1">
                                ID: {prop.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="p-4 whitespace-nowrap">
                          <div className="font-semibold text-navy-900 dark:text-white">
                            {prop.area}
                          </div>
                          <div className="text-slate-500 text-[11px]">
                            {prop.city}
                          </div>
                        </td>

                        {/* Rent */}
                        <td className="p-4 whitespace-nowrap">
                          <div className="font-black text-navy-900 dark:text-white">
                            {formatCurrency(prop.rentMonthly)}
                            <span className="text-[10px] font-normal text-slate-500">/mo</span>
                          </div>
                          <div className="text-slate-500 text-[10px]">
                            Dep: {formatCurrency(prop.deposit)}
                          </div>
                        </td>

                        {/* Room Type */}
                        <td className="p-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                            {prop.roomType}
                          </span>
                        </td>

                        {/* Badges & Status */}
                        <td className="p-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                prop.status === "PUBLISHED"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                              }`}
                            >
                              {prop.status}
                            </span>
                            {prop.isVerified && (
                              <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 font-bold text-[10px]">
                                ✓ Verified
                              </span>
                            )}
                            {prop.featured && (
                              <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 font-bold text-[10px]">
                                ★ Featured
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Action Buttons */}
                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditingProperty(prop)}
                              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center gap-1 transition-colors shadow-sm"
                              title="Edit this room"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => handleToggleFeatured(prop)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                prop.featured
                                  ? "bg-amber-500 text-white border-amber-600"
                                  : "border-slate-200 dark:border-slate-700 text-slate-400 hover:text-amber-500"
                              }`}
                              title={prop.featured ? "Remove from Featured" : "Feature on Homepage"}
                            >
                              <Star className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleToggleVerified(prop)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                prop.isVerified
                                  ? "bg-blue-500 text-white border-blue-600"
                                  : "border-slate-200 dark:border-slate-700 text-slate-400 hover:text-blue-500"
                              }`}
                              title={prop.isVerified ? "Remove Verified Badge" : "Mark as Verified"}
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </button>

                            <Link
                              href={`/property/${prop.id}`}
                              target="_blank"
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-navy-900 dark:hover:text-white"
                              title="View on site"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>

                            <button
                              onClick={() => handleDeleteProperty(prop.id)}
                              className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              title="Delete Listing"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: SITE CONTENT & HOMEPAGE CMS                        */}
        {/* ========================================================= */}
        {activeTab === "cms" && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 amoled:bg-zinc-950 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-soft">
              <div>
                <h2 className="text-lg font-bold text-navy-900 dark:text-white font-heading">
                  Site Content & Global Configuration
                </h2>
                <p className="text-xs text-slate-500">
                  Update headlines, announcement banners, contact numbers, and featured cities in real time.
                </p>
              </div>

              <button
                disabled={savingSettings}
                onClick={handleSaveSettings}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center gap-2 shadow-soft transition-all shrink-0"
              >
                {savingSettings ? (
                  <span>Saving Changes...</span>
                ) : settingsSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Saved Successfully!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save All Site Changes</span>
                  </>
                )}
              </button>
            </div>

            {/* Section: Announcement & Identity */}
            <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 p-6 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-soft space-y-6">
              <h3 className="font-bold text-sm text-navy-900 dark:text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-600" />
                Top Announcement Banner & Branding
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-navy-900 dark:text-white uppercase tracking-wider mb-1.5">
                    Website Name
                  </label>
                  <input
                    type="text"
                    value={siteSettings.siteName}
                    onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy-900 dark:text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-navy-900 dark:text-white uppercase tracking-wider mb-1.5">
                    Brand Tagline
                  </label>
                  <input
                    type="text"
                    value={siteSettings.tagline}
                    onChange={(e) => setSiteSettings({ ...siteSettings, tagline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-navy-900 dark:text-white uppercase tracking-wider">
                    Top Announcement Bar Text
                  </label>
                  <label className="flex items-center gap-1.5 font-bold cursor-pointer text-purple-700 dark:text-purple-300">
                    <input
                      type="checkbox"
                      checked={siteSettings.showAnnouncement}
                      onChange={(e) => setSiteSettings({ ...siteSettings, showAnnouncement: e.target.checked })}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span>Show Banner</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={siteSettings.announcementText}
                  onChange={(e) => setSiteSettings({ ...siteSettings, announcementText: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy-900 dark:text-white font-medium"
                />
              </div>
            </div>

            {/* Section: Hero Section Copy */}
            <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 p-6 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-soft space-y-6">
              <h3 className="font-bold text-sm text-navy-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-500" />
                Homepage Hero Section
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-navy-900 dark:text-white uppercase tracking-wider mb-1.5">
                    Hero Pill Badge Text
                  </label>
                  <input
                    type="text"
                    value={siteSettings.heroBadge}
                    onChange={(e) => setSiteSettings({ ...siteSettings, heroBadge: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy-900 dark:text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-navy-900 dark:text-white uppercase tracking-wider mb-1.5">
                    Search Bar Placeholder
                  </label>
                  <input
                    type="text"
                    value={siteSettings.heroSearchPlaceholder}
                    onChange={(e) => setSiteSettings({ ...siteSettings, heroSearchPlaceholder: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="block font-bold text-navy-900 dark:text-white uppercase tracking-wider">
                  Main Headline
                </label>
                <input
                  type="text"
                  value={siteSettings.heroTitle}
                  onChange={(e) => setSiteSettings({ ...siteSettings, heroTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy-900 dark:text-white font-bold text-base"
                />
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="block font-bold text-navy-900 dark:text-white uppercase tracking-wider">
                  Hero Subtitle
                </label>
                <textarea
                  rows={2}
                  value={siteSettings.heroSubtitle}
                  onChange={(e) => setSiteSettings({ ...siteSettings, heroSubtitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy-900 dark:text-white"
                />
              </div>
            </div>

            {/* Section: Support & Contact */}
            <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 p-6 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-soft space-y-6">
              <h3 className="font-bold text-sm text-navy-900 dark:text-white flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500" />
                Contact & Support Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-navy-900 dark:text-white uppercase tracking-wider mb-1.5">
                    Phone Support
                  </label>
                  <input
                    type="text"
                    value={siteSettings.supportPhone}
                    onChange={(e) => setSiteSettings({ ...siteSettings, supportPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy-900 dark:text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-navy-900 dark:text-white uppercase tracking-wider mb-1.5">
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={siteSettings.supportEmail}
                    onChange={(e) => setSiteSettings({ ...siteSettings, supportEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy-900 dark:text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-navy-900 dark:text-white uppercase tracking-wider mb-1.5">
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={siteSettings.whatsappNumber}
                    onChange={(e) => setSiteSettings({ ...siteSettings, whatsappNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy-900 dark:text-white font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Section: Featured Cities Manager */}
            <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 p-6 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-soft space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-navy-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    Popular Featured Cities
                  </h3>
                  <p className="text-xs text-slate-500">
                    Control which cities appear in the "Explore Top Cities" carousel on the home page.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newCity = {
                      id: `city-${Date.now()}`,
                      name: "New City",
                      state: "State",
                      image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600",
                      areas: "Area 1, Area 2",
                      staysCount: "50+ Stays",
                    };
                    setSiteSettings({
                      ...siteSettings,
                      featuredCities: [...siteSettings.featuredCities, newCity],
                    });
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add City
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {siteSettings.featuredCities.map((city, index) => (
                  <div
                    key={city.id || index}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-3 relative group"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSiteSettings({
                          ...siteSettings,
                          featuredCities: siteSettings.featuredCities.filter((_, i) => i !== index),
                        });
                      }}
                      className="absolute top-3 right-3 p-1 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-600 hover:bg-rose-200"
                      title="Remove City"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="h-28 rounded-xl overflow-hidden bg-slate-200">
                      <img src={city.image} alt="" className="w-full h-full object-cover" />
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400">City Name</label>
                        <input
                          type="text"
                          value={city.name}
                          onChange={(e) => {
                            const updated = [...siteSettings.featuredCities];
                            updated[index].name = e.target.value;
                            setSiteSettings({ ...siteSettings, featuredCities: updated });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy-900 dark:text-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400">State / Region</label>
                        <input
                          type="text"
                          value={city.state}
                          onChange={(e) => {
                            const updated = [...siteSettings.featuredCities];
                            updated[index].state = e.target.value;
                            setSiteSettings({ ...siteSettings, featuredCities: updated });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400">Areas Highlighted</label>
                        <input
                          type="text"
                          value={city.areas}
                          onChange={(e) => {
                            const updated = [...siteSettings.featuredCities];
                            updated[index].areas = e.target.value;
                            setSiteSettings({ ...siteSettings, featuredCities: updated });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400">Photo URL</label>
                        <input
                          type="text"
                          value={city.image}
                          onChange={(e) => {
                            const updated = [...siteSettings.featuredCities];
                            updated[index].image = e.target.value;
                            setSiteSettings({ ...siteSettings, featuredCities: updated });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: USERS & HOSTS MANAGEMENT                           */}
        {/* ========================================================= */}
        {activeTab === "users" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-soft flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search user by name, email or phone..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-navy-900 dark:text-white"
                />
              </div>
              <span className="text-xs text-slate-500 font-semibold">
                Total Users: {filteredUsers.length}
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold bg-slate-50/50 dark:bg-slate-900/50">
                      <th className="p-4">User</th>
                      <th className="p-4">Role (Editable)</th>
                      <th className="p-4">City</th>
                      <th className="p-4">Listings</th>
                      <th className="p-4">Bookings</th>
                      <th className="p-4">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 font-bold flex items-center justify-center text-xs">
                              {u.name[0]}
                            </div>
                            <div>
                              <div className="font-bold text-navy-900 dark:text-white flex items-center gap-1">
                                {u.name}
                                {u.isVerified && <span className="text-blue-500 text-[11px]">✓</span>}
                              </div>
                              <div className="text-slate-500 text-[11px]">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Editable Role Selector */}
                        <td className="p-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleUserRoleChange(u.id, e.target.value)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy-900 dark:text-white font-bold text-xs"
                          >
                            <option value="ADMIN">ADMIN (Super Control)</option>
                            <option value="OWNER">OWNER (Landlord)</option>
                            <option value="USER">USER (Tenant Seeker)</option>
                          </select>
                        </td>

                        <td className="p-4 text-slate-600 dark:text-slate-300">
                          {u.preferredCity || "India"}
                        </td>

                        <td className="p-4 font-bold text-navy-900 dark:text-white">
                          {u._count?.properties || 0}
                        </td>

                        <td className="p-4 font-bold text-navy-900 dark:text-white">
                          {u._count?.bookings || 0}
                        </td>

                        <td className="p-4 text-slate-400">
                          {formatDate(u.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: VERIFICATION QUEUE                                 */}
        {/* ========================================================= */}
        {activeTab === "verifications" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-soft p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-navy-900 dark:text-white font-heading">
                    Property Verification Queue
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Inspect newly submitted rooms, verify owner documentation, and issue verified safety badges.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200">
                  {verifications.length} Pending Approval
                </span>
              </div>

              {verifications.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400 dark:text-slate-500 space-y-2 bg-slate-50 dark:bg-slate-850 rounded-2xl p-6 border border-slate-200/60">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
                  <p className="font-bold text-navy-900 dark:text-white">Verification Queue Clear!</p>
                  <p>All active listings have passed owner documentation verification.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {verifications.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
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
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                              Awaiting Badge
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
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
                          <CheckCircle2 className="w-4 h-4" /> Approve & Verify
                        </button>
                        <button
                          disabled={actionLoading === item.id}
                          onClick={() => handleVerifyDecision(item.id, "REJECT")}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 hover:bg-rose-100 flex items-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                        <Link
                          href={`/property/${item.id}`}
                          target="_blank"
                          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-navy-900 bg-white dark:bg-slate-800"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: REVENUE & PLATFORM METRICS                         */}
        {/* ========================================================= */}
        {activeTab === "analytics" && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-soft">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Users</span>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-2xl font-black text-navy-900 dark:text-white">{analytics?.totalUsers || usersList.length}</span>
                  <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-soft">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Properties</span>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-2xl font-black text-navy-900 dark:text-white">{properties.length}</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                    <Building className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-soft">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Platform Volume</span>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xl font-black text-navy-900 dark:text-white">{formatCurrency(analytics?.totalGrossVolume || 54000)}</span>
                  <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
                    <IndianRupee className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-soft">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Platform Revenue</span>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(analytics?.totalRevenue || 1200)}</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Property Edit Modal */}
      {editingProperty && (
        <AdminPropertyModal
          property={editingProperty}
          isOpen={Boolean(editingProperty)}
          onClose={() => setEditingProperty(null)}
          onUpdated={(updated) => {
            setProperties((prev) =>
              prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
            );
          }}
          onDeleted={(deletedId) => {
            setProperties((prev) => prev.filter((p) => p.id !== deletedId));
          }}
        />
      )}

      <Footer />
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center p-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground text-sm font-medium">Loading Admin Control Center...</p>
          </div>
        </div>
      }
    >
      <AdminDashboardContent />
    </React.Suspense>
  );
}
