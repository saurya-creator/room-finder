"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  QrCode,
  CreditCard,
  Building,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Timer,
  Smartphone,
  ArrowRight,
  ChevronRight,
  Info,
  AlertCircle,
  FileText,
  Loader2,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { RentReceiptModal, RentReceiptData } from "@/components/rent-receipt-modal";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const bookingIdParam = searchParams.get("bookingId");
  const propertyIdParam = searchParams.get("propertyId");
  const typeParam = searchParams.get("type") || "FULL_DEPOSIT"; // FULL_DEPOSIT | TOKEN_ADVANCE | MONTHLY_RENT

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Property & Booking data
  const [property, setProperty] = useState<any>(null);
  const [booking, setBooking] = useState<any>(null);
  const [paymentType, setPaymentType] = useState<string>(typeParam);

  // Payment UI state
  const [activeTab, setActiveTab] = useState<"upi" | "card" | "netbanking" | "wallet">("upi");
  const [submitting, setSubmitting] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [verifiedReceipt, setVerifiedReceipt] = useState<RentReceiptData | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // UPI State
  const [upiId, setUpiId] = useState("");
  const [upiTimer, setUpiTimer] = useState(300); // 5 mins

  // Card State
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [saveCard, setSaveCard] = useState(true);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  // Netbanking State
  const [selectedBank, setSelectedBank] = useState("HDFC");

  // Fetch booking/property details
  useEffect(() => {
    async function loadDetails() {
      try {
        setLoading(true);
        if (bookingIdParam) {
          const res = await fetch(`/api/bookings/${bookingIdParam}`);
          if (res.ok) {
            const data = await res.json();
            setBooking(data.booking || data);
            setProperty(data.booking?.property || data.property);
          } else {
            // fallback: check if propertyId exists
            if (propertyIdParam) {
              const pRes = await fetch(`/api/properties/${propertyIdParam}`);
              if (pRes.ok) {
                const pData = await pRes.json();
                setProperty(pData.property || pData);
              }
            }
          }
        } else if (propertyIdParam) {
          const res = await fetch(`/api/properties/${propertyIdParam}`);
          if (res.ok) {
            const data = await res.json();
            setProperty(data.property || data);
          }
        } else {
          // No params, fetch first user booking
          const bRes = await fetch("/api/bookings");
          if (bRes.ok) {
            const bData = await bRes.json();
            const list = bData.bookings || [];
            if (list.length > 0) {
              setBooking(list[0]);
              setProperty(list[0].property);
            }
          }
        }
      } catch (e: any) {
        console.error("Load checkout error:", e);
        setError("Failed to load checkout details");
      } finally {
        setLoading(false);
      }
    }

    loadDetails();
  }, [bookingIdParam, propertyIdParam]);

  // Timer countdown for UPI QR
  useEffect(() => {
    if (activeTab !== "upi" || paymentSuccess) return;
    const timer = setInterval(() => {
      setUpiTimer((prev) => (prev > 0 ? prev - 1 : 300));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeTab, paymentSuccess]);

  // Calculations
  const rent = property?.rentMonthly || booking?.monthlyRent || 12000;
  const deposit = property?.deposit || booking?.depositAmount || 24000;
  const maintenance = property?.maintenanceCharges || booking?.maintenanceAmount || 1500;
  const platformFee = booking?.platformFee || 299;
  const taxes = booking?.taxesAmount || 54;
  const fullTotal = rent + deposit + maintenance + platformFee + taxes;

  // Pay amount depending on type
  const payableAmount =
    paymentType === "TOKEN_ADVANCE"
      ? 999
      : paymentType === "MONTHLY_RENT"
      ? rent + maintenance
      : fullTotal;

  // Handle Complete Payment Simulation & Verification
  const executePayment = async (method: string) => {
    try {
      setSubmitting(true);
      setError(null);

      // Step 1: Create Order
      const createRes = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking?.id || bookingIdParam,
          propertyId: property?.id || propertyIdParam,
          amount: payableAmount,
          paymentType,
        }),
      });

      const orderData = await createRes.json();
      if (!createRes.ok || !orderData.order) {
        throw new Error(orderData.error || "Failed to initialize payment order");
      }

      const orderId = orderData.order.id;
      const targetBookingId = orderData.bookingId || booking?.id;
      const paymentId = `pay_sim_${Date.now()}`;
      const signature = `sig_${orderId}_${paymentId}`;

      // Step 2: Verify Payment
      const verifyRes = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: targetBookingId,
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId,
          razorpaySignature: signature,
          paymentMethod: method,
          paidAmountRupees: payableAmount,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.error || "Verification failed");
      }

      setVerifiedReceipt(verifyData.receipt);
      setPaymentSuccess(true);
      setShowOtpModal(false);
    } catch (err: any) {
      console.error("Payment execution error:", err);
      setError(err.message || "Payment transaction could not be completed");
    } finally {
      setSubmitting(false);
    }
  };

  // Format Card Number (adds space every 4 chars)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 16);
    val = val.replace(/(.{4})/g, "$1 ").trim();
    setCardNumber(val);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (val.length >= 2) {
      val = val.slice(0, 2) + "/" + val.slice(2);
    }
    setCardExpiry(val);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Securing checkout session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Header Breadcrumb */}
      <div className="max-w-6xl mx-auto mb-6">
        <Link
          href={property?.id ? `/property/${property.id}` : "/rooms"}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Property Details</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span>Secure Payment Checkout</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                256-Bit Escrow Encrypted
              </span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Powered by Razorpay & Unified Payments Interface (UPI)
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <Lock className="w-3.5 h-3.5" />
            <span>Funds held safely in escrow until move-in</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {paymentSuccess ? (
          /* ================= SUCCESS STATE ================= */
          <div className="max-w-2xl mx-auto bg-card border border-border rounded-2xl p-6 sm:p-10 text-center shadow-xl space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Payment Confirmed
              </span>
              <h2 className="text-2xl font-black text-foreground">Room Reserved Successfully!</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Your payment of <strong className="text-foreground">₹{payableAmount.toLocaleString("en-IN")}</strong> has been authenticated. The host has been notified, and your reservation is locked.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-5 rounded-xl bg-muted/40 border border-border/80 text-left space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-border/60 text-xs">
                <span className="text-muted-foreground">Receipt Number</span>
                <span className="font-mono font-bold text-foreground">{verifiedReceipt?.receiptNumber || "RCPT-2026-RF"}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Property</span>
                <span className="font-semibold text-foreground truncate max-w-[220px]">
                  {property?.title || "Premium Room Accommodation"}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-mono font-bold text-primary text-sm">
                  ₹{payableAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Transaction Mode</span>
                <span className="font-medium text-foreground uppercase">{verifiedReceipt?.paymentMethod || "UPI"}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowReceiptModal(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center justify-center gap-2 shadow hover:bg-primary/90 transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>View & Print Official Rent Receipt</span>
              </button>

              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-border bg-background hover:bg-muted font-medium text-xs text-foreground flex items-center justify-center gap-2 transition-colors"
              >
                <span>Go to Tenant Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          /* ================= ACTIVE CHECKOUT FORM ================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Payment Methods Tabs (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Payment Type Switcher Card */}
              <div className="p-4 rounded-xl bg-card border border-border">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Select Payment Option
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentType("TOKEN_ADVANCE")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      paymentType === "TOKEN_ADVANCE"
                        ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
                        : "border-border bg-background text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-foreground">Token Lock</span>
                      <span className="text-xs font-bold text-primary">₹999</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-tight">
                      Reserve instantly, pay balance at move-in.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentType("FULL_DEPOSIT")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      paymentType === "FULL_DEPOSIT"
                        ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
                        : "border-border bg-background text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-foreground">Full Move-in</span>
                      <span className="text-xs font-bold text-primary">₹{fullTotal.toLocaleString("en-IN")}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-tight">
                      1st Month + Deposit + Zero hassle.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentType("MONTHLY_RENT")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      paymentType === "MONTHLY_RENT"
                        ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
                        : "border-border bg-background text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-foreground">Monthly Rent</span>
                      <span className="text-xs font-bold text-primary">₹{(rent + maintenance).toLocaleString("en-IN")}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-tight">
                      Regular monthly recurring rent.
                    </p>
                  </button>
                </div>
              </div>

              {/* Payment Methods Nav */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="flex border-b border-border bg-muted/30 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab("upi")}
                    className={`flex items-center gap-2 px-5 py-3.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
                      activeTab === "upi"
                        ? "border-primary text-primary bg-card"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>UPI & QR Code</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-600 font-bold">
                      FAST
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("card")}
                    className={`flex items-center gap-2 px-5 py-3.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
                      activeTab === "card"
                        ? "border-primary text-primary bg-card"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Credit / Debit Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("netbanking")}
                    className={`flex items-center gap-2 px-5 py-3.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
                      activeTab === "netbanking"
                        ? "border-primary text-primary bg-card"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Building className="w-4 h-4" />
                    <span>Net Banking</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("wallet")}
                    className={`flex items-center gap-2 px-5 py-3.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
                      activeTab === "wallet"
                        ? "border-primary text-primary bg-card"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Wallets</span>
                  </button>
                </div>

                {/* Tab Content Panes */}
                <div className="p-6">
                  {error && (
                    <div className="mb-5 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* ================= TAB 1: UPI ================= */}
                  {activeTab === "upi" && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-muted/20 border border-border/60">
                        {/* Dynamic QR Code Box */}
                        <div className="relative p-3 bg-white rounded-xl shadow-inner border border-gray-200 shrink-0">
                          {/* SVG QR Code Simulation */}
                          <div className="w-36 h-36 flex flex-col items-center justify-center bg-white p-2">
                            <svg viewBox="0 0 100 100" className="w-full h-full text-black">
                              <rect x="0" y="0" width="30" height="30" fill="black" />
                              <rect x="5" y="5" width="20" height="20" fill="white" />
                              <rect x="8" y="8" width="14" height="14" fill="black" />

                              <rect x="70" y="0" width="30" height="30" fill="black" />
                              <rect x="75" y="5" width="20" height="20" fill="white" />
                              <rect x="78" y="8" width="14" height="14" fill="black" />

                              <rect x="0" y="70" width="30" height="30" fill="black" />
                              <rect x="5" y="75" width="20" height="20" fill="white" />
                              <rect x="8" y="78" width="14" height="14" fill="black" />

                              {/* Matrix Pattern dots */}
                              <rect x="35" y="5" width="8" height="8" fill="black" />
                              <rect x="48" y="10" width="8" height="8" fill="black" />
                              <rect x="40" y="25" width="10" height="10" fill="black" />
                              <rect x="55" y="25" width="8" height="8" fill="black" />

                              <rect x="10" y="40" width="8" height="8" fill="black" />
                              <rect x="25" y="40" width="8" height="8" fill="black" />
                              <rect x="40" y="40" width="20" height="20" fill="black" />
                              <rect x="65" y="40" width="8" height="8" fill="black" />
                              <rect x="80" y="40" width="12" height="8" fill="black" />

                              <rect x="35" y="70" width="12" height="8" fill="black" />
                              <rect x="55" y="70" width="8" height="12" fill="black" />
                              <rect x="70" y="65" width="12" height="12" fill="black" />
                              <rect x="85" y="80" width="10" height="15" fill="black" />
                            </svg>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="px-1.5 py-0.5 rounded bg-white font-bold text-[9px] text-primary shadow border border-gray-100">
                              UPI
                            </span>
                          </div>
                        </div>

                        {/* QR Instructions & Timer */}
                        <div className="flex-1 text-center sm:text-left space-y-2">
                          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-amber-500 text-xs font-semibold">
                            <Timer className="w-3.5 h-3.5" />
                            <span>QR expires in {formatTimer(upiTimer)}</span>
                          </div>
                          <h4 className="font-bold text-foreground text-sm">Scan QR using any UPI App</h4>
                          <p className="text-xs text-muted-foreground">
                            Scan with Google Pay, PhonePe, Paytm, BHIM, or any banking app to pay ₹{payableAmount.toLocaleString("en-IN")}.
                          </p>
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => executePayment("UPI_QR")}
                              disabled={submitting}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center sm:justify-start gap-2 shadow-sm transition-colors disabled:opacity-50"
                            >
                              {submitting ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Confirming Payment...</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>I Have Completed UPI Payment</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* 1-Click UPI Apps Row */}
                      <div>
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2.5">
                          Or Pay via 1-Click UPI Apps
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {[
                            { name: "Google Pay", color: "hover:border-blue-500", code: "GPay" },
                            { name: "PhonePe", color: "hover:border-purple-500", code: "PhonePe" },
                            { name: "Paytm UPI", color: "hover:border-cyan-500", code: "Paytm" },
                            { name: "BHIM UPI", color: "hover:border-amber-500", code: "BHIM" },
                          ].map((app) => (
                            <button
                              key={app.code}
                              type="button"
                              onClick={() => executePayment(`UPI_${app.code.toUpperCase()}`)}
                              disabled={submitting}
                              className={`p-3 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold flex items-center justify-center gap-2 transition-all ${app.color}`}
                            >
                              <Smartphone className="w-3.5 h-3.5 text-primary" />
                              <span>{app.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Enter UPI ID / VPA */}
                      <div className="pt-2 border-t border-border">
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                          Or Enter Virtual Payment Address (UPI ID)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. yourname@okhdfcbank"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="flex-1 px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => executePayment("UPI_COLLECT")}
                            disabled={submitting || !upiId.includes("@")}
                            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                            <span>Verify & Pay</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ================= TAB 2: CARDS ================= */}
                  {activeTab === "card" && (
                    <div className="space-y-6">
                      {/* Interactive Visual Card */}
                      <div className="w-full max-w-sm mx-auto h-44 rounded-2xl p-5 bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-800 text-white shadow-xl relative overflow-hidden border border-white/10">
                        <div className="flex justify-between items-center mb-6">
                          <div className="w-9 h-7 rounded bg-amber-400/80 shadow-inner flex items-center justify-center">
                            <div className="w-6 h-4 border border-amber-800/40 rounded-sm" />
                          </div>
                          <span className="font-mono text-xs font-bold tracking-widest text-slate-300">
                            {cardNumber.startsWith("4") ? "VISA" : cardNumber.startsWith("5") ? "MASTERCARD" : "RUPAY"}
                          </span>
                        </div>

                        <div className="font-mono text-lg tracking-wider font-bold mb-4">
                          {cardNumber || "•••• •••• •••• ••••"}
                        </div>

                        <div className="flex justify-between items-end text-[10px] text-slate-300 uppercase">
                          <div>
                            <span className="block text-[8px] text-slate-400">Card Holder</span>
                            <span className="font-medium tracking-wider">{cardHolder || "YOUR NAME"}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] text-slate-400">Expires</span>
                            <span className="font-medium tracking-wider">{cardExpiry || "MM/YY"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Form */}
                      <div className="space-y-3">
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                            Card Number
                          </label>
                          <input
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            maxLength={19}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                            Cardholder Name
                          </label>
                          <input
                            type="text"
                            placeholder="As printed on card"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                              Expiry (MM/YY)
                            </label>
                            <input
                              type="text"
                              placeholder="08/28"
                              value={cardExpiry}
                              onChange={handleExpiryChange}
                              maxLength={5}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                              CVV / CVC
                            </label>
                            <input
                              type="password"
                              placeholder="•••"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.slice(0, 4))}
                              maxLength={4}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                            />
                          </div>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={saveCard}
                            onChange={(e) => setSaveCard(e.target.checked)}
                            className="rounded border-border text-primary focus:ring-primary"
                          />
                          <span className="text-[11px] text-muted-foreground">
                            Securely tokenize card as per RBI guidelines
                          </span>
                        </label>

                        <button
                          type="button"
                          onClick={() => setShowOtpModal(true)}
                          disabled={submitting || cardNumber.length < 16 || cardExpiry.length < 4 || cardCvv.length < 3}
                          className="w-full mt-3 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Pay ₹{payableAmount.toLocaleString("en-IN")} via Card</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ================= TAB 3: NETBANKING ================= */}
                  {activeTab === "netbanking" && (
                    <div className="space-y-6">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                        Popular Indian Banks
                      </span>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                          { id: "HDFC", name: "HDFC Bank", initial: "HDFC" },
                          { id: "SBI", name: "State Bank of India", initial: "SBI" },
                          { id: "ICICI", name: "ICICI Bank", initial: "ICICI" },
                          { id: "AXIS", name: "Axis Bank", initial: "AXIS" },
                          { id: "KOTAK", name: "Kotak Mahindra", initial: "KOTAK" },
                          { id: "PNB", name: "Punjab National Bank", initial: "PNB" },
                        ].map((bank) => (
                          <button
                            key={bank.id}
                            type="button"
                            onClick={() => setSelectedBank(bank.id)}
                            className={`p-3.5 rounded-xl border text-left transition-all ${
                              selectedBank === bank.id
                                ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
                                : "border-border bg-background text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-bold text-xs text-primary mb-2">
                              {bank.initial.slice(0, 2)}
                            </div>
                            <p className="text-xs font-bold text-foreground">{bank.name}</p>
                            <p className="text-[10px] text-muted-foreground">Instant Login</p>
                          </button>
                        ))}
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                          Or Select Other Bank (50+ Supported)
                        </label>
                        <select
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="HDFC">HDFC Bank</option>
                          <option value="SBI">State Bank of India</option>
                          <option value="ICICI">ICICI Bank</option>
                          <option value="AXIS">Axis Bank</option>
                          <option value="KOTAK">Kotak Mahindra Bank</option>
                          <option value="PNB">Punjab National Bank</option>
                          <option value="BOB">Bank of Baroda</option>
                          <option value="CANARA">Canara Bank</option>
                          <option value="INDUSIND">IndusInd Bank</option>
                          <option value="YES">Yes Bank</option>
                          <option value="IDFC">IDFC FIRST Bank</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => executePayment(`NETBANKING_${selectedBank}`)}
                        disabled={submitting}
                        className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow"
                      >
                        {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                        <span>Continue to {selectedBank} NetBanking (₹{payableAmount.toLocaleString("en-IN")})</span>
                      </button>
                    </div>
                  )}

                  {/* ================= TAB 4: WALLETS ================= */}
                  {activeTab === "wallet" && (
                    <div className="space-y-4">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                        Select Digital Wallet / PayLater
                      </span>

                      {[
                        { id: "PAYTM_WALLET", name: "Paytm Wallet", desc: "Fast checkout using linked mobile" },
                        { id: "AMAZON_PAY", name: "Amazon Pay", desc: "Use Amazon balance & UPI" },
                        { id: "MOBIKWIK", name: "MobiKwik / ZIP", desc: "Pay instantly or use PayLater" },
                        { id: "LAZYPAY", name: "LazyPay", desc: "Instant credit checkout" },
                      ].map((wallet) => (
                        <div
                          key={wallet.id}
                          className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background hover:bg-muted/40 transition-colors"
                        >
                          <div>
                            <p className="text-xs font-bold text-foreground">{wallet.name}</p>
                            <p className="text-[11px] text-muted-foreground">{wallet.desc}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => executePayment(wallet.id)}
                            disabled={submitting}
                            className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors"
                          >
                            Pay
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Guarantee (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Accommodation Card */}
              <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted relative shrink-0">
                    <Image
                      src={property?.images?.[0]?.url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80"}
                      alt={property?.title || "Property Room"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                      {property?.roomType || "Standard Private Room"}
                    </span>
                    <h3 className="font-bold text-foreground text-sm line-clamp-1">
                      {property?.title || "Furnished Studio / Room"}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {property?.area ? `${property.area}, ${property.city}` : "Prime Location"}
                    </p>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-border pt-4 space-y-2.5 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Monthly Rent</span>
                    <span className="font-mono text-foreground font-medium">₹{rent.toLocaleString("en-IN")}</span>
                  </div>

                  {paymentType === "FULL_DEPOSIT" && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Security Deposit (Refundable)</span>
                      <span className="font-mono text-foreground font-medium">₹{deposit.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-muted-foreground">
                    <span>Maintenance Charges</span>
                    <span className="font-mono text-foreground font-medium">₹{maintenance.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="flex justify-between text-muted-foreground">
                    <span>Platform Verification Fee</span>
                    <span className="font-mono text-foreground font-medium">₹{platformFee}</span>
                  </div>

                  <div className="flex justify-between text-muted-foreground">
                    <span>GST (18% on platform fee)</span>
                    <span className="font-mono text-foreground font-medium">₹{taxes}</span>
                  </div>

                  <div className="border-t border-border pt-3 flex justify-between items-baseline font-bold">
                    <div>
                      <span className="text-foreground text-sm">Paying Now</span>
                      <span className="block text-[10px] font-normal text-muted-foreground">
                        {paymentType === "TOKEN_ADVANCE"
                          ? "Token Advance (Lock Room)"
                          : paymentType === "MONTHLY_RENT"
                          ? "Current Month's Rent"
                          : "Full First Month + Deposit"}
                      </span>
                    </div>
                    <span className="text-xl font-mono text-primary font-black">
                      ₹{payableAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {paymentType === "TOKEN_ADVANCE" && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-400 space-y-1">
                    <p className="font-semibold">⚡ Token Reservation Lock:</p>
                    <p>Paying ₹999 freezes this room for 48 hours so nobody else can take it. Balance ₹{(fullTotal - 999).toLocaleString("en-IN")} is payable upon physical move-in.</p>
                  </div>
                )}
              </div>

              {/* Security Badges */}
              <div className="p-4 rounded-xl bg-muted/20 border border-border/60 space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground text-[11px]">RoomFinder Escrow Safety</strong>
                    <p className="text-[11px] text-muted-foreground">
                      Money is held safely in escrow and only released to the owner after you inspect and accept keys.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <FileText className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground text-[11px]">Instant HRA Tax Receipt</strong>
                    <p className="text-[11px] text-muted-foreground">
                      Get an official rent receipt with landlord PAN eligible for Income Tax Section 10(13A) deductions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Simulated 3D Secure / Bank OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card text-card-foreground rounded-2xl border border-border shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-sm">3D Secure Bank Verification</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                Cancel
              </button>
            </div>

            <div className="text-xs text-muted-foreground space-y-2">
              <p>
                An OTP has been sent to your registered mobile ending in <strong className="text-foreground">•••89</strong> for transaction of <strong className="text-foreground">₹{payableAmount.toLocaleString("en-IN")}</strong>.
              </p>
              <div className="p-2.5 rounded-lg bg-muted/50 border border-border text-[11px] font-mono text-center">
                Demo OTP: <span className="font-bold text-primary">123456</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                Enter 6-digit OTP
              </label>
              <input
                type="text"
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.slice(0, 6))}
                className="w-full text-center tracking-[0.5em] text-lg font-mono px-3 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <button
              type="button"
              onClick={() => executePayment("CARD_3DS")}
              disabled={submitting || otpCode.length < 4}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              <span>Authenticate & Pay ₹{payableAmount.toLocaleString("en-IN")}</span>
            </button>
          </div>
        </div>
      )}

      {/* Official Rent Receipt Modal */}
      <RentReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        receipt={verifiedReceipt}
      />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
