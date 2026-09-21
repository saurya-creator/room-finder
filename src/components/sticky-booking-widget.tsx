"use client";

import React, { useState } from "react";
import {
  Calendar,
  Users,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Clock,
  Sparkles,
  Info,
  ChevronRight,
  CreditCard,
} from "lucide-react";
import { PropertyItem } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { RazorpayModal } from "./razorpay-modal";

interface StickyBookingWidgetProps {
  property: PropertyItem;
}

export function StickyBookingWidget({ property }: StickyBookingWidgetProps) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split("T")[0];

  const [moveInDate, setMoveInDate] = useState(defaultDateStr);
  const [stayMonths, setStayMonths] = useState(property.minStayMonths || 3);
  const [occupants, setOccupants] = useState(1);
  const [tenantMessage, setTenantMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  // Financial calculations
  const rent = property.rentMonthly;
  const deposit = property.deposit;
  const maintenance = property.maintenanceCharges || 0;
  const platformFee = 299;
  const taxes = 54;
  const totalAmount = rent + deposit + maintenance + platformFee + taxes;

  const handleRequestBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: property.id,
          moveInDate,
          stayMonths,
          occupantsCount: occupants,
          tenantMessage,
          monthlyRent: rent,
          depositAmount: deposit,
          maintenanceAmount: maintenance,
          platformFee,
          taxesAmount: taxes,
          totalAmount,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit booking request");
      }

      setBookingSuccess(data.booking);
    } catch (err: any) {
      alert(err.message || "Something went wrong submitting booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 amoled:bg-zinc-950 rounded-3xl border border-slate-200/90 dark:border-slate-800 amoled:border-zinc-850 shadow-card p-6 sticky top-28 space-y-5 transition-colors">
        
        {/* Price Header */}
        <div className="flex items-baseline justify-between pb-4 border-b border-slate-100 dark:border-slate-800 amoled:border-zinc-850">
          <div>
            <span className="text-2xl font-black text-navy-900 dark:text-white amoled:text-white">
              {formatCurrency(property.rentMonthly)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium"> / month</span>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              Deposit: {formatCurrency(property.deposit)} (Refundable)
            </div>
          </div>
          {property.noBrokerage && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 amoled:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
              Zero Brokerage
            </span>
          )}
        </div>

        {isPaid ? (
          <div className="py-6 text-center space-y-3 bg-emerald-50/60 dark:bg-emerald-950/30 amoled:bg-emerald-950/20 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800/80">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-sm text-navy-900 dark:text-white">Stay Confirmed!</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Your move-in is locked for {new Date(moveInDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}. We sent the agreement details to your dashboard.
            </p>
            <a
              href="/dashboard"
              className="inline-block px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-soft"
            >
              View in My Bookings
            </a>
          </div>
        ) : bookingSuccess ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 amoled:bg-amber-950/20 border border-amber-200 dark:border-amber-800/80 text-xs text-amber-900 dark:text-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                <Clock className="w-4 h-4" />
                Booking Request Sent to Owner!
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-300/80">
                Owner {property.owner?.name || "Rajesh Mehra"} typically responds within {property.owner?.ownerProfile?.responseTime || "1 hour"}.
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-850 amoled:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-slate-800 amoled:border-zinc-800 text-xs space-y-1">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Move-in Date:</span>
                <span className="font-semibold text-navy-900 dark:text-white">{moveInDate}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Duration:</span>
                <span className="font-semibold text-navy-900 dark:text-white">{stayMonths} Months</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Total Payable:</span>
                <span className="font-bold text-navy-900 dark:text-white">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            {/* Pay Now Options */}
            <div className="space-y-2">
              <a
                href={`/pay?bookingId=${bookingSuccess.id}&type=FULL_DEPOSIT`}
                className="w-full py-3 rounded-2xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay Full Deposit Online (UPI / Card / NetBanking)</span>
              </a>

              <a
                href={`/pay?bookingId=${bookingSuccess.id}&type=TOKEN_ADVANCE`}
                className="w-full py-2.5 rounded-2xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-850 hover:bg-emerald-100 flex items-center justify-center gap-2 transition-colors"
              >
                <span>⚡ Lock Room with ₹999 Token Advance</span>
              </a>
            </div>

            <button
              onClick={() => setBookingSuccess(null)}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 pt-1"
            >
              Edit Request Parameters
            </button>
          </div>
        ) : (
          <form onSubmit={handleRequestBooking} className="space-y-4">
            
            {/* Move-in Date Input */}
            <div>
              <label className="block text-xs font-bold text-navy-900 dark:text-slate-200 amoled:text-zinc-200 uppercase tracking-wider mb-1.5">
                Expected Move-in Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={moveInDate}
                  min={defaultDateStr}
                  onChange={(e) => setMoveInDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 amoled:border-zinc-800 bg-slate-50 dark:bg-slate-800/80 amoled:bg-zinc-900 focus:bg-white dark:focus:bg-slate-900 amoled:focus:bg-black focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium text-navy-900 dark:text-white"
                />
              </div>
            </div>

            {/* Stay Duration & Occupants */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-navy-900 dark:text-slate-200 amoled:text-zinc-200 uppercase tracking-wider mb-1.5">
                  Stay Duration
                </label>
                <div className="flex items-center justify-between border border-slate-200 dark:border-slate-700 amoled:border-zinc-800 rounded-xl px-2 py-1.5 bg-slate-50 dark:bg-slate-800/80 amoled:bg-zinc-900">
                  <button
                    type="button"
                    onClick={() => setStayMonths(Math.max(1, stayMonths - 1))}
                    className="w-6 h-6 rounded-md bg-white dark:bg-slate-700 amoled:bg-zinc-800 border border-slate-200 dark:border-slate-600 amoled:border-zinc-700 text-navy-900 dark:text-white font-bold flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600"
                  >
                    -
                  </button>
                  <span className="text-xs font-semibold text-navy-900 dark:text-white">
                    {stayMonths} mo
                  </span>
                  <button
                    type="button"
                    onClick={() => setStayMonths(Math.min(12, stayMonths + 1))}
                    className="w-6 h-6 rounded-md bg-white dark:bg-slate-700 amoled:bg-zinc-800 border border-slate-200 dark:border-slate-600 amoled:border-zinc-700 text-navy-900 dark:text-white font-bold flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 dark:text-slate-200 amoled:text-zinc-200 uppercase tracking-wider mb-1.5">
                  Occupants
                </label>
                <div className="flex items-center justify-between border border-slate-200 dark:border-slate-700 amoled:border-zinc-800 rounded-xl px-2 py-1.5 bg-slate-50 dark:bg-slate-800/80 amoled:bg-zinc-900">
                  <button
                    type="button"
                    onClick={() => setOccupants(Math.max(1, occupants - 1))}
                    className="w-6 h-6 rounded-md bg-white dark:bg-slate-700 amoled:bg-zinc-800 border border-slate-200 dark:border-slate-600 amoled:border-zinc-700 text-navy-900 dark:text-white font-bold flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600"
                  >
                    -
                  </button>
                  <span className="text-xs font-semibold text-navy-900 dark:text-white">
                    {occupants} {occupants === 1 ? "Person" : "Persons"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOccupants(Math.min(4, occupants + 1))}
                    className="w-6 h-6 rounded-md bg-white dark:bg-slate-700 amoled:bg-zinc-800 border border-slate-200 dark:border-slate-600 amoled:border-zinc-700 text-navy-900 dark:text-white font-bold flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Note to Owner */}
            <div>
              <label className="block text-xs font-bold text-navy-900 dark:text-slate-200 amoled:text-zinc-200 uppercase tracking-wider mb-1.5">
                Message for Owner (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Hi, I am a student/working professional looking to move in..."
                value={tenantMessage}
                onChange={(e) => setTenantMessage(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 amoled:border-zinc-800 bg-slate-50 dark:bg-slate-800/80 amoled:bg-zinc-900 focus:bg-white dark:focus:bg-slate-900 amoled:focus:bg-black focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-navy-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            {/* Itemized Price Breakdown */}
            <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 amoled:border-zinc-850 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>First Month Rent</span>
                <span className="font-semibold text-navy-900 dark:text-slate-200">{formatCurrency(rent)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Refundable Security Deposit</span>
                <span className="font-semibold text-navy-900 dark:text-slate-200">{formatCurrency(deposit)}</span>
              </div>
              {maintenance > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Monthly Maintenance</span>
                  <span className="font-semibold text-navy-900 dark:text-slate-200">{formatCurrency(maintenance)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                <span>Platform & Tenant Protection Fee</span>
                <span>{formatCurrency(platformFee)}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                <span>Taxes & GST (18%)</span>
                <span>{formatCurrency(taxes)}</span>
              </div>

              <div className="flex justify-between items-baseline pt-2 border-t border-slate-100 dark:border-slate-800 amoled:border-zinc-850 font-bold text-sm text-navy-900 dark:text-white">
                <span>Total Due at Move-in</span>
                <span className="text-base text-brand-700 dark:text-brand-400 font-extrabold">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>

            {/* Submit & Payment CTAs */}
            <div className="space-y-2 pt-1">
              <a
                href={`/pay?propertyId=${property.id}&type=FULL_DEPOSIT&moveInDate=${moveInDate}&stayMonths=${stayMonths}`}
                className="w-full py-3.5 rounded-2xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Instant Online Booking & Pay</span>
              </a>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`/pay?propertyId=${property.id}&type=TOKEN_ADVANCE&moveInDate=${moveInDate}&stayMonths=${stayMonths}`}
                  className="py-2.5 px-2 rounded-xl text-center text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 flex items-center justify-center transition-colors"
                >
                  <span>⚡ Lock with ₹999</span>
                </a>

                <button
                  type="submit"
                  disabled={loading}
                  className="py-2.5 px-2 rounded-xl text-xs font-semibold text-navy-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-70 truncate"
                >
                  {loading ? "Sending..." : "Request Approval"}
                </button>
              </div>
            </div>

            <div className="text-center">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Zero cancellation fee within 24 hours of owner acceptance
              </span>
            </div>
          </form>
        )}

      </div>

      {/* Razorpay Simulation Modal */}
      {showRazorpay && (
        <RazorpayModal
          isOpen={showRazorpay}
          onClose={() => setShowRazorpay(false)}
          bookingId={bookingSuccess?.id || "demo-booking-id"}
          amount={totalAmount}
          propertyTitle={property.title}
          onPaymentSuccess={() => {
            setIsPaid(true);
            setShowRazorpay(false);
          }}
        />
      )}
    </>
  );
}
