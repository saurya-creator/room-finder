"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Heart,
  MapPin,
  ShieldCheck,
  User,
  Building,
  FileText,
  AlertCircle,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Printer,
  QrCode,
  Download,
  Receipt,
  Check,
} from "lucide-react";
import { BookingItem, UserSummary } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { RazorpayModal } from "@/components/razorpay-modal";
import { RentReceiptModal, RentReceiptData } from "@/components/rent-receipt-modal";
import { Footer } from "@/components/footer";

export default function TenantDashboardPage() {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"bookings" | "payments" | "profile">("bookings");
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<BookingItem | null>(null);
  const [receiptModalData, setReceiptModalData] = useState<RentReceiptData | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/bookings?role=USER").then((r) => r.json()),
      fetch("/api/payments").then((r) => r.json()).catch(() => ({ payments: [] })),
    ])
      .then(([userData, bookingData, paymentData]) => {
        if (userData?.user) setUser(userData.user);
        if (bookingData?.bookings) setBookings(bookingData.bookings);
        if (paymentData?.payments) setPayments(paymentData.payments);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED");
  const pendingBookings = bookings.filter(
    (b) => b.status === "REQUESTED" || b.status === "ACCEPTED" || b.status === "PAYMENT_PENDING"
  );

  const openReceiptFromBooking = (b: any, paymentObj?: any) => {
    const paidAmount = paymentObj
      ? (paymentObj.amount > 10000 ? Math.round(paymentObj.amount / 100) : paymentObj.amount)
      : (b.paidAmount || b.totalAmount);

    const receiptData: RentReceiptData = {
      receiptNumber: `RCPT-${new Date().getFullYear()}-${b.id.slice(-6).toUpperCase()}`,
      transactionId: paymentObj?.razorpayPaymentId || `pay_escrow_${b.id.slice(0, 8)}`,
      orderId: paymentObj?.razorpayOrderId,
      paymentMethod: "UPI / NetBanking",
      amount: paidAmount,
      paidAt: paymentObj?.createdAt || b.updatedAt || new Date().toISOString(),
      status: "SUCCESS",
      tenant: {
        name: user?.name || "Tenant",
        email: user?.email || "",
        phone: user?.phone || "+91 97111 11111",
      },
      landlord: {
        name: b.property.owner?.name || "Verified Landlord",
        email: b.property.owner?.email,
        phone: b.property.owner?.phone || "+91 98765 43210",
        pan: "ABCPR9482K",
      },
      property: {
        title: b.property.title,
        address: `${b.property.address}, ${b.property.area || ""}, ${b.property.city}`,
        city: b.property.city,
      },
      breakdown: {
        monthlyRent: b.monthlyRent,
        depositAmount: b.depositAmount,
        maintenanceAmount: b.maintenanceAmount,
        platformFee: b.platformFee,
        taxesAmount: b.taxesAmount,
        totalAmount: b.totalAmount,
        paidNow: paidAmount,
      },
    };

    setReceiptModalData(receiptData);
    setShowReceiptModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 amoled:bg-black text-foreground transition-colors">
      
      {/* Dashboard Header */}
      <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 border-b border-slate-200/80 dark:border-slate-800 amoled:border-zinc-850 px-4 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-brand-100 border-2 border-brand-500 shadow-soft shrink-0">
              <img
                src={user?.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300"}
                alt={user?.name || "Tenant"}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-navy-950 dark:text-white amoled:text-white font-heading">
                  Welcome back, {user?.name?.split(" ")[0] || "Rahul"}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-100 dark:bg-brand-950/60 text-brand-800 dark:text-brand-300">
                  Tenant Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {user?.occupation || "Software Engineer"} • {user?.preferredCity || "Bengaluru"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/pay"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-soft flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Pay Rent Online</span>
            </Link>
            <Link
              href="/rooms"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-soft"
            >
              Find Rooms
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 border-b border-slate-200/80 dark:border-slate-800 amoled:border-zinc-850 px-4">
        <div className="max-w-7xl mx-auto flex gap-8 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`py-3.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "bookings"
                ? "border-brand-600 text-brand-600 dark:text-brand-400 font-extrabold"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white"
            }`}
          >
            My Bookings & Stays ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`py-3.5 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "payments"
                ? "border-brand-600 text-brand-600 dark:text-brand-400 font-extrabold"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white"
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Online Payments & Tax Invoices ({payments.length})</span>
          </button>
          <Link
            href="/favorites"
            className="py-3.5 border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white whitespace-nowrap"
          >
            Saved Rooms
          </Link>
          <button
            onClick={() => setActiveTab("profile")}
            className={`py-3.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "profile"
                ? "border-brand-600 text-brand-600 dark:text-brand-400 font-extrabold"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white"
            }`}
          >
            Profile & KYC
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* KPI Quick Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 amoled:border-zinc-850 shadow-soft">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Confirmed Stays
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-black text-navy-900 dark:text-white amoled:text-white">
                {confirmedBookings.length}
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 amoled:border-zinc-850 shadow-soft">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Active Inquiries
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-black text-navy-900 dark:text-white amoled:text-white">
                {pendingBookings.length}
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 amoled:border-zinc-850 shadow-soft">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Online Payments
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-black text-navy-900 dark:text-white amoled:text-white">
                {payments.length}
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 amoled:border-zinc-850 shadow-soft">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              HRA Tax Invoices
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                100% Tax Compliant
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content: Bookings */}
        {activeTab === "bookings" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-navy-900 dark:text-white font-heading">
                Booking History & Active Stays
              </h2>
              <Link
                href="/pay"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>Make an Online Payment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-40 bg-slate-200/60 dark:bg-slate-800/60 rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 amoled:bg-zinc-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4 shadow-soft">
                <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-navy-900 dark:text-white">No bookings yet</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Browse verified listings and submit your first booking request to view updates here.
                </p>
                <Link
                  href="/rooms"
                  className="inline-block px-5 py-2.5 rounded-full text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-soft"
                >
                  Explore Rooms
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((b) => {
                  const isAccepted = b.status === "ACCEPTED" || b.status === "PAYMENT_PENDING";
                  const isConfirmed = b.status === "CONFIRMED";
                  const isPending = b.status === "REQUESTED";

                  return (
                    <div
                      key={b.id}
                      className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 rounded-3xl border border-slate-200/90 dark:border-slate-800 amoled:border-zinc-850 shadow-soft p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors"
                    >
                      <div className="flex gap-4">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                          <img
                            src={
                              b.property.images?.[0]?.url ||
                              "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=400"
                            }
                            alt={b.property.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                isConfirmed
                                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                                  : isAccepted
                                  ? "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300"
                                  : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                              }`}
                            >
                              {b.status}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Booked on {formatDate(b.createdAt)}
                            </span>
                          </div>

                          <Link
                            href={`/property/${b.propertyId}`}
                            className="text-sm font-bold text-navy-900 dark:text-white hover:text-brand-600 line-clamp-1 block"
                          >
                            {b.property.title}
                          </Link>

                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Move-in: <strong className="text-navy-900 dark:text-slate-200">{formatDate(b.moveInDate)}</strong> • Stay: {b.stayMonths} Months • {b.occupantsCount} {b.occupantsCount === 1 ? "Guest" : "Guests"}
                          </p>

                          <p className="text-xs text-slate-700 dark:text-slate-300 font-bold mt-1">
                            Total: {formatCurrency(b.totalAmount)} {b.paidAmount > 0 && <span className="text-emerald-600 dark:text-emerald-400">(Paid: {formatCurrency(b.paidAmount)})</span>}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
                        {isAccepted && (
                          <Link
                            href={`/pay?bookingId=${b.id}&type=FULL_DEPOSIT`}
                            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md flex items-center justify-center gap-2"
                          >
                            <CreditCard className="w-4 h-4" />
                            <span>Pay Online (UPI / Card)</span>
                          </Link>
                        )}

                        {isConfirmed && (
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/pay?bookingId=${b.id}&type=MONTHLY_RENT`}
                              className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 flex items-center gap-1.5"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Pay Rent</span>
                            </Link>
                            <button
                              onClick={() => openReceiptFromBooking(b)}
                              className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-bold text-navy-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5"
                            >
                              <FileText className="w-3.5 h-3.5 text-brand-600" />
                              <span>HRA Receipt</span>
                            </button>
                          </div>
                        )}

                        <Link
                          href={`/messages?receiverId=${b.property.owner?.id || "demo"}&propertyId=${b.propertyId}`}
                          className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-navy-900 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-brand-600" />
                          Chat Host
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Payments & Tax Invoices */}
        {activeTab === "payments" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h2 className="text-lg font-bold text-navy-900 dark:text-white font-heading">
                  Rent Receipts & Tax Invoices
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Certified digital receipts compliant with Section 10(13A) of Indian Income Tax Act.
                </p>
              </div>

              <Link
                href="/pay"
                className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-soft flex items-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Instant Payment Portal</span>
              </Link>
            </div>

            {payments.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 amoled:bg-zinc-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
                <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-navy-900 dark:text-white">No payment transactions recorded yet</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  When you make online payments for deposits or monthly rent via UPI/Card, your receipts and HRA invoices will appear here.
                </p>
                <Link
                  href="/pay"
                  className="inline-block px-5 py-2.5 rounded-full text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-soft"
                >
                  Make a Payment
                </Link>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-soft">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-6 py-4">Receipt / Txn ID</th>
                        <th className="px-6 py-4">Property</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Invoice Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                      {payments.map((p) => {
                        const rupees = p.amount > 10000 ? Math.round(p.amount / 100) : p.amount;
                        return (
                          <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-navy-900 dark:text-white">
                              {p.razorpayPaymentId || p.id.slice(0, 12)}
                            </td>
                            <td className="px-6 py-4 font-medium text-navy-900 dark:text-white">
                              {p.booking?.property?.title || "Residential Room"}
                            </td>
                            <td className="px-6 py-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              ₹{rupees.toLocaleString("en-IN")}
                            </td>
                            <td className="px-6 py-4 text-slate-400">
                              {new Date(p.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                                <Check className="w-3 h-3" />
                                {p.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => openReceiptFromBooking(p.booking, p)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy-900 dark:text-white hover:bg-slate-100 font-semibold"
                              >
                                <Printer className="w-3.5 h-3.5 text-brand-600" />
                                <span>Receipt</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Profile & Settings */}
        {activeTab === "profile" && (
          <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-soft p-6 sm:p-8 max-w-2xl space-y-6">
            <h2 className="text-lg font-bold text-navy-900 dark:text-white font-heading">
              Tenant Profile & Preferences
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  readOnly
                  value={user?.name || "Rahul Sharma"}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-navy-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  readOnly
                  value={user?.email || "rahul.sharma@example.com"}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-navy-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  readOnly
                  value={user?.phone || "+91 97111 11111"}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-navy-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Occupation / College
                </label>
                <input
                  type="text"
                  readOnly
                  value={user?.occupation || "Software Engineer at Tech Park"}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-navy-900 dark:text-white font-medium"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Your profile is verified with Government ID. Private contact information is only shared with owners of rooms you book.
            </p>
          </div>
        )}

      </div>

      {/* Official Rent Receipt & Tax Invoice Modal */}
      <RentReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        receipt={receiptModalData}
      />

      <Footer />
    </div>
  );
}
