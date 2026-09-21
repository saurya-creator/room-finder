"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Home,
  PlusCircle,
  Building,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  IndianRupee,
  Calendar,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  Sliders,
  Sparkles,
  AlertCircle,
  MoreVertical,
  CreditCard,
  Printer,
  Receipt,
} from "lucide-react";
import { PropertyItem, BookingItem } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { RentReceiptModal, RentReceiptData } from "@/components/rent-receipt-modal";
import { Footer } from "@/components/footer";

export default function OwnerDashboardPage() {
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [receiptModalData, setReceiptModalData] = useState<RentReceiptData | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/properties").then((r) => r.json()),
      fetch("/api/bookings?role=OWNER").then((r) => r.json()),
      fetch("/api/payments").then((r) => r.json()).catch(() => ({ payments: [] })),
    ])
      .then(([propsData, bookingsData, paymentsData]) => {
        if (propsData?.properties) {
          // In demo mode, show the user's properties or first 6 properties
          setProperties(propsData.properties.slice(0, 6));
        }
        if (bookingsData?.bookings) {
          setBookings(bookingsData.bookings);
        }
        if (paymentsData?.payments) {
          setPayments(paymentsData.payments);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBookingAction = async (bookingId: string, status: "ACCEPTED" | "REJECTED") => {
    setUpdatingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error("Failed to update booking status", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleTogglePropertyStatus = async (propertyId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "PUBLISHED" ? "PAUSED" : "PUBLISHED";
    try {
      const res = await fetch(`/api/properties/${propertyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setProperties((prev) =>
          prev.map((p) => (p.id === propertyId ? { ...p, status: nextStatus } : p))
        );
      }
    } catch (err) {
      console.error("Status toggle error", err);
    }
  };

  // KPIs
  const totalViews = properties.reduce((sum, p) => sum + p.viewsCount, 0);
  const pendingEnquiries = bookings.filter((b) => b.status === "REQUESTED");
  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED");
  const monthlyEarnings = properties.reduce((sum, p) => sum + p.rentMonthly, 0);

  const openReceiptFromPayment = (p: any) => {
    const booking = p.booking;
    const rupees = p.amount > 10000 ? Math.round(p.amount / 100) : p.amount;
    const receiptData: RentReceiptData = {
      receiptNumber: `RCPT-${new Date().getFullYear()}-${booking?.id ? booking.id.slice(-6).toUpperCase() : p.id.slice(0, 6).toUpperCase()}`,
      transactionId: p.razorpayPaymentId || p.id,
      orderId: p.razorpayOrderId,
      paymentMethod: "UPI / NetBanking",
      amount: rupees,
      paidAt: p.createdAt,
      status: p.status,
      tenant: {
        name: booking?.tenant?.name || "Verified Tenant",
        email: booking?.tenant?.email || "",
        phone: booking?.tenant?.phone || "+91 97111 11111",
      },
      landlord: {
        name: "Property Host",
        email: "host@roomfinder.in",
        phone: "+91 98765 43210",
        pan: "ABCPR9482K",
      },
      property: {
        title: booking?.property?.title || "Residential Room",
        address: `${booking?.property?.address || ""}, ${booking?.property?.city || ""}`,
        city: booking?.property?.city || "India",
      },
      breakdown: {
        monthlyRent: booking?.monthlyRent,
        depositAmount: booking?.depositAmount,
        maintenanceAmount: booking?.maintenanceAmount,
        platformFee: booking?.platformFee || 299,
        taxesAmount: booking?.taxesAmount || 54,
        totalAmount: booking?.totalAmount || rupees,
        paidNow: rupees,
      },
    };
    setReceiptModalData(receiptData);
    setShowReceiptModal(true);
  };

  const totalCollectedRent = payments.reduce((sum, p) => {
    const amt = p.amount > 10000 ? Math.round(p.amount / 100) : p.amount;
    return sum + amt;
  }, 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 amoled:bg-black transition-colors">

      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 amoled:bg-black border-b border-slate-200/80 dark:border-slate-800 amoled:border-zinc-850 px-4 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-navy-950 dark:text-white font-heading">
                Owner Command Center
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80">
                Landlord Portal
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage your room listings, approve tenant inquiries, track payments and view occupancy.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/owner/properties/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-soft"
            >
              <PlusCircle className="w-4 h-4" />
              Add New Property
            </Link>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 amoled:border-zinc-850 shadow-soft">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Properties
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-black text-navy-900 dark:text-white">
                {properties.length}
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
              {properties.filter((p) => p.status === "PUBLISHED").length} Active Listings
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 amoled:border-zinc-850 shadow-soft">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Pending Enquiries
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {pendingEnquiries.length}
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
              Requires review & acceptance
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 amoled:border-zinc-850 shadow-soft">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Est. Monthly Rent
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xl font-black text-navy-900 dark:text-white truncate">
                {formatCurrency(monthlyEarnings)}
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
              98% Occupancy Rate
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 amoled:border-zinc-850 shadow-soft">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Impressions
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-black text-navy-900 dark:text-white">
                {totalViews}
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
              34% Booking Conversion
            </span>
          </div>

        </div>

        {/* Section: Incoming Tenant Enquiries & Applications */}
        <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 rounded-3xl border border-slate-200/90 dark:border-slate-800 amoled:border-zinc-850 shadow-soft p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-navy-900 dark:text-white font-heading">
                Tenant Enquiries & Applications
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Review tenant profiles, intended move-in dates, and accept or message applicants.
              </p>
            </div>
            <span className="text-xs bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800/80">
              {pendingEnquiries.length} Pending Actions
            </span>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
              No applications received yet. New inquiries will appear here automatically.
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-850 amoled:bg-zinc-900/60 border border-slate-200 dark:border-slate-800 amoled:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-brand-100 dark:bg-brand-950 shrink-0 border border-slate-200 dark:border-slate-700">
                      <img
                        src={b.tenant.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                        alt={b.tenant.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-navy-900 dark:text-white">{b.tenant.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                          {b.tenant.occupation || "Verified Tenant"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Property: <strong className="text-navy-900 dark:text-white">{b.property.title}</strong>
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Move-in: <strong>{formatDate(b.moveInDate)}</strong> • Duration: <strong>{b.stayMonths} Months</strong> • Occupants: <strong>{b.occupantsCount}</strong>
                      </p>
                      {b.tenantMessage && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-white dark:bg-slate-900 amoled:bg-black p-2 rounded-xl border border-slate-200/80 dark:border-slate-700 amoled:border-zinc-800 mt-1.5">
                          "{b.tenantMessage}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {b.status === "REQUESTED" ? (
                      <>
                        <button
                          disabled={updatingId === b.id}
                          onClick={() => handleBookingAction(b.id, "ACCEPTED")}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-soft flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Accept Application
                        </button>
                        <button
                          disabled={updatingId === b.id}
                          onClick={() => handleBookingAction(b.id, "REJECTED")}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition-colors flex items-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" />
                          Decline
                        </button>
                      </>
                    ) : (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          b.status === "CONFIRMED"
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                            : b.status === "ACCEPTED"
                            ? "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {b.status}
                      </span>
                    )}

                    <Link
                      href={`/messages?receiverId=${b.tenant.id}&propertyId=${b.propertyId}`}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 amoled:border-zinc-800 text-slate-600 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 amoled:hover:bg-zinc-900 transition-colors"
                      title="Chat with applicant"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section: Properties Inventory Table */}
        <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 rounded-3xl border border-slate-200/90 dark:border-slate-800 amoled:border-zinc-850 shadow-soft p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-navy-900 dark:text-white font-heading">
                Managed Room Listings
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update monthly rent, availability, or pause active listings.
              </p>
            </div>
            <Link
              href="/owner/properties/new"
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
            >
              + Create New Listing
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 amoled:border-zinc-850 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="pb-3">Property</th>
                  <th className="pb-3">Room Type</th>
                  <th className="pb-3">Monthly Rent</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Views</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 amoled:divide-zinc-850">
                {properties.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 amoled:hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                          <img
                            src={p.images?.[0]?.url || "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=200"}
                            alt={p.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <Link href={`/property/${p.id}`} className="font-bold text-navy-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 line-clamp-1 block">
                            {p.title}
                          </Link>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">
                            {p.area}, {p.city}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-slate-700 dark:text-slate-300 font-medium">{p.roomType}</td>
                    <td className="py-3.5 font-bold text-navy-900 dark:text-white">{formatCurrency(p.rentMonthly)}/mo</td>
                    <td className="py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          p.status === "PUBLISHED"
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                            : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-600 dark:text-slate-400 font-semibold">{p.viewsCount}</td>
                    <td className="py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleTogglePropertyStatus(p.id, p.status)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 amoled:border-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 amoled:hover:bg-zinc-900 font-semibold transition-colors"
                      >
                        {p.status === "PUBLISHED" ? "Pause" : "Publish"}
                      </button>
                      <Link
                        href={`/property/${p.id}`}
                        className="px-2.5 py-1 rounded-lg bg-navy-900 dark:bg-slate-800 amoled:bg-zinc-800 text-white font-semibold hover:bg-brand-600 dark:hover:bg-brand-500 transition-colors"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section: Collected Online Rent & Payouts */}
        <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 rounded-3xl border border-slate-200/90 dark:border-slate-800 amoled:border-zinc-850 shadow-soft p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-navy-900 dark:text-white font-heading">
                  Collected Online Rent & Payouts
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  Instant UPI Escrow
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track online deposits, token reserves, and monthly tenant payments transferred to your bank.
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Online Received</span>
              <span className="text-xl font-mono font-black text-emerald-600 dark:text-emerald-400">
                ₹{totalCollectedRent.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {payments.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <Receipt className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="font-semibold text-navy-900 dark:text-white mb-1">No online transactions yet</p>
              <p className="max-w-sm mx-auto text-slate-400">
                When tenants book rooms or pay monthly rent using UPI, Cards, or NetBanking, verified payout records will be logged here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 amoled:border-zinc-850 text-slate-400 uppercase tracking-wider font-bold">
                    <th className="pb-3">Transaction / Receipt</th>
                    <th className="pb-3">Tenant</th>
                    <th className="pb-3">Property</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Payment Date</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 amoled:divide-zinc-850">
                  {payments.map((p) => {
                    const amt = p.amount > 10000 ? Math.round(p.amount / 100) : p.amount;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 amoled:hover:bg-zinc-900/40 transition-colors">
                        <td className="py-3 font-mono font-bold text-navy-900 dark:text-white">
                          {p.razorpayPaymentId || p.id.slice(0, 12)}
                        </td>
                        <td className="py-3 font-semibold text-navy-900 dark:text-white">
                          {p.booking?.tenant?.name || "Tenant"}
                        </td>
                        <td className="py-3 text-slate-600 dark:text-slate-300 max-w-[180px] truncate">
                          {p.booking?.property?.title || "Property Room"}
                        </td>
                        <td className="py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{amt.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 text-slate-400">
                          {new Date(p.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                        </td>
                        <td className="py-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => openReceiptFromPayment(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy-900 dark:text-white hover:bg-slate-100 font-semibold"
                          >
                            <Printer className="w-3.5 h-3.5 text-brand-600" />
                            <span>Invoice</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Official Rent Receipt Modal */}
      <RentReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        receipt={receiptModalData}
      />

      <Footer />
    </div>
  );
}
