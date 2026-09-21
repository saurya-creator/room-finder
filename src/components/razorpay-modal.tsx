"use client";

import React, { useState } from "react";
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Lock,
  Building,
  Smartphone,
  Check,
  Sparkles,
  X,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  amount: number;
  propertyTitle: string;
  onPaymentSuccess: (paymentId: string) => void;
}

export function RazorpayModal({
  isOpen,
  onClose,
  bookingId,
  amount,
  propertyTitle,
  onPaymentSuccess,
}: RazorpayModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [upiId, setUpiId] = useState("user@okhdfcbank");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulatePayment = async () => {
    setProcessing(true);
    setError(null);

    try {
      // 1. Create order on server
      const orderRes = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, amount }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to initialize payment");
      }

      // Simulate network latency like real Razorpay gateway
      await new Promise((r) => setTimeout(r, 1200));

      // 2. Verify payment on server
      const verifyRes = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          razorpayOrderId: orderData.order.id,
          razorpayPaymentId: `pay_sim_${Date.now()}`,
          razorpaySignature: "simulated_valid_signature",
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || "Signature verification failed");
      }

      setSuccess(true);
      setTimeout(() => {
        onPaymentSuccess(verifyData.payment.razorpayPaymentId);
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("Payment error:", err);
      setError(err.message || "Payment processing failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 amoled:bg-zinc-950 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 amoled:border-zinc-850">
        
        {/* Razorpay Brand Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/30 flex items-center justify-center font-bold text-white border border-blue-400/30">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-200 uppercase tracking-wider">
                <Lock className="w-3 h-3 text-emerald-400" />
                Razorpay Secure Checkout
              </div>
              <p className="font-extrabold text-base text-white">{formatCurrency(amount)}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={processing}
            className="text-white/70 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          <div className="mb-4 pb-3 border-b border-slate-100 dark:border-slate-800 amoled:border-zinc-850">
            <p className="text-xs text-slate-500 dark:text-slate-400">Booking Reservation For</p>
            <p className="text-sm font-bold text-navy-900 dark:text-white truncate">{propertyTitle}</p>
          </div>

          {success ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-extrabold text-navy-900 dark:text-white">Payment Verified!</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your booking is confirmed. Generating official receipt...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Payment Methods */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMethod("upi")}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    selectedMethod === "upi"
                      ? "border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-bold"
                      : "border-slate-200 dark:border-slate-700 amoled:border-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 amoled:hover:bg-zinc-900"
                  }`}
                >
                  <Smartphone className="w-5 h-5 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs block">UPI / GPay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod("card")}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    selectedMethod === "card"
                      ? "border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-bold"
                      : "border-slate-200 dark:border-slate-700 amoled:border-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 amoled:hover:bg-zinc-900"
                  }`}
                >
                  <CreditCard className="w-5 h-5 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs block">Cards</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod("netbanking")}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    selectedMethod === "netbanking"
                      ? "border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-bold"
                      : "border-slate-200 dark:border-slate-700 amoled:border-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 amoled:hover:bg-zinc-900"
                  }`}
                >
                  <Building className="w-5 h-5 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs block">NetBanking</span>
                </button>
              </div>

              {/* Method Details */}
              {selectedMethod === "upi" && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 amoled:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-700 amoled:border-zinc-800">
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    UPI ID (Virtual Payment Address)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="name@okhdfcbank"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 amoled:border-zinc-800 bg-white dark:bg-slate-900 amoled:bg-black text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    Supports Google Pay, PhonePe, Paytm & BHIM
                  </p>
                </div>
              )}

              {selectedMethod === "card" && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 amoled:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-700 amoled:border-zinc-800 space-y-2">
                  <input
                    type="text"
                    readOnly
                    value="4532 •••• •••• 8819"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 amoled:border-zinc-800 bg-white dark:bg-slate-900 amoled:bg-black text-slate-700 dark:text-slate-300"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      readOnly
                      value="12/28"
                      className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 amoled:border-zinc-800 bg-white dark:bg-slate-900 amoled:bg-black text-slate-700 dark:text-slate-300"
                    />
                    <input
                      type="password"
                      readOnly
                      value="•••"
                      className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 amoled:border-zinc-800 bg-white dark:bg-slate-900 amoled:bg-black text-slate-700 dark:text-slate-300"
                    />
                  </div>
                </div>
              )}

              {selectedMethod === "netbanking" && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 amoled:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-700 amoled:border-zinc-800 text-xs text-slate-600 dark:text-slate-300">
                  Supported banks: HDFC, SBI, ICICI, Axis, Kotak. Immediate test sandbox settlement.
                </div>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Pay Button */}
              <button
                type="button"
                disabled={processing}
                onClick={handleSimulatePayment}
                className="w-full py-3.5 rounded-2xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {processing ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Verifying with Razorpay...
                  </span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Pay {formatCurrency(amount)} via Razorpay
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-slate-400">
                256-bit encrypted • Powered by Razorpay Standard Test Simulator
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
