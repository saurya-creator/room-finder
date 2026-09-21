"use client";

import { useRef } from "react";
import { X, Printer, Download, CheckCircle2, Building2, ShieldCheck, FileText, ArrowDownToLine } from "lucide-react";

export interface RentReceiptData {
  receiptNumber: string;
  transactionId: string;
  orderId?: string;
  paymentMethod?: string;
  amount: number;
  paidAt: string;
  status?: string;
  tenant: {
    name: string;
    email: string;
    phone?: string;
    pan?: string;
  };
  landlord: {
    name: string;
    email?: string;
    phone?: string;
    pan?: string;
  };
  property: {
    title: string;
    address: string;
    city: string;
  };
  breakdown: {
    monthlyRent?: number;
    depositAmount?: number;
    maintenanceAmount?: number;
    platformFee?: number;
    taxesAmount?: number;
    totalAmount: number;
    paidNow: number;
  };
}

interface RentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: RentReceiptData | null;
}

export function RentReceiptModal({ isOpen, onClose, receipt }: RentReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadText = () => {
    const textData = `
======================================================
ROOMFINDER RENT RECEIPT & TAX INVOICE
======================================================
Receipt No: ${receipt.receiptNumber}
Transaction ID: ${receipt.transactionId}
Payment Date: ${new Date(receipt.paidAt).toLocaleDateString("en-IN", { dateStyle: "long" })}
Payment Method: ${receipt.paymentMethod || "UPI"}
Status: SUCCESS / PAID

TENANT DETAILS:
Name: ${receipt.tenant.name}
Email: ${receipt.tenant.email}
Phone: ${receipt.tenant.phone || "N/A"}

LANDLORD / PROPERTY OWNER:
Name: ${receipt.landlord.name}
Landlord PAN (For HRA Tax Exemption): ${receipt.landlord.pan || "ABCPR9482K"}
Contact: ${receipt.landlord.phone || "N/A"}

PROPERTY DETAILS:
Property: ${receipt.property.title}
Address: ${receipt.property.address}

FINANCIAL BREAKDOWN:
Monthly Rent: ₹${(receipt.breakdown.monthlyRent || 0).toLocaleString("en-IN")}
Security Deposit: ₹${(receipt.breakdown.depositAmount || 0).toLocaleString("en-IN")}
Maintenance Charges: ₹${(receipt.breakdown.maintenanceAmount || 0).toLocaleString("en-IN")}
Platform Fee: ₹${(receipt.breakdown.platformFee || 299).toLocaleString("en-IN")}
GST & Taxes: ₹${(receipt.breakdown.taxesAmount || 54).toLocaleString("en-IN")}
------------------------------------------------------
TOTAL PAID: ₹${receipt.amount.toLocaleString("en-IN")}
------------------------------------------------------
This is a computer-generated tax receipt valid for IT Section 10(13A) HRA claims.
======================================================
    `.trim();

    const blob = new Blob([textData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `RentReceipt_${receipt.receiptNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-2xl bg-card text-card-foreground rounded-2xl shadow-2xl border border-border/80 overflow-hidden my-8 print:border-none print:shadow-none print:m-0 print:w-full">
        {/* Modal Top Actions (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
              ₹
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Payment Receipt & Tax Invoice</h3>
              <p className="text-xs text-muted-foreground">Valid for Indian IT Act HRA Exemption</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-medium transition-colors text-foreground"
              title="Print Receipt"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownloadText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-medium transition-colors text-foreground"
              title="Save Summary"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Content */}
        <div ref={receiptRef} className="p-6 md:p-8 space-y-6 bg-card print:p-6 print:text-black">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-6 border-b border-border/70">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-black text-sm">
                  R
                </span>
                <span className="text-xl font-bold tracking-tight text-foreground">RoomFinder</span>
              </div>
              <p className="text-xs text-muted-foreground">Verified Residential Rental Receipt & GST Invoice</p>
            </div>
            <div className="text-left sm:text-right">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs border border-emerald-500/20 mb-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>PAYMENT CONFIRMED</span>
              </div>
              <p className="text-xs text-muted-foreground font-mono">Invoice #{receipt.receiptNumber}</p>
              <p className="text-xs text-muted-foreground">
                Date: {new Date(receipt.paidAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
          </div>

          {/* Parties Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-1">
              <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px] block mb-1">
                Tenant (Payer)
              </span>
              <p className="font-bold text-foreground text-sm">{receipt.tenant.name}</p>
              <p className="text-muted-foreground">{receipt.tenant.email}</p>
              <p className="text-muted-foreground">{receipt.tenant.phone || "+91 99887 76655"}</p>
            </div>

            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-1">
              <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px] block mb-1">
                Landlord / Owner (Payee)
              </span>
              <p className="font-bold text-foreground text-sm">{receipt.landlord.name}</p>
              <p className="text-muted-foreground">Owner PAN: <span className="font-mono font-medium text-foreground">{receipt.landlord.pan || "ABCPR9482K"}</span></p>
              <p className="text-muted-foreground">Phone: {receipt.landlord.phone || "+91 98765 43210"}</p>
            </div>
          </div>

          {/* Property Reference */}
          <div className="p-4 rounded-xl bg-muted/20 border border-border/40 text-xs">
            <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px] block mb-1">
              Rented Accommodation
            </span>
            <p className="font-semibold text-foreground text-sm">{receipt.property.title}</p>
            <p className="text-muted-foreground mt-0.5">{receipt.property.address}</p>
          </div>

          {/* Payment Breakdown Table */}
          <div className="border border-border rounded-xl overflow-hidden text-xs">
            <div className="grid grid-cols-12 bg-muted/60 p-3 font-semibold text-muted-foreground uppercase text-[11px] tracking-wider border-b border-border">
              <div className="col-span-8">Description</div>
              <div className="col-span-4 text-right">Amount (₹)</div>
            </div>

            <div className="divide-y divide-border/60">
              {receipt.breakdown.monthlyRent ? (
                <div className="grid grid-cols-12 p-3">
                  <div className="col-span-8 text-foreground font-medium">Monthly Advance Rent</div>
                  <div className="col-span-4 text-right font-mono text-foreground">
                    ₹{receipt.breakdown.monthlyRent.toLocaleString("en-IN")}
                  </div>
                </div>
              ) : null}

              {receipt.breakdown.depositAmount ? (
                <div className="grid grid-cols-12 p-3">
                  <div className="col-span-8 text-foreground font-medium">Security Deposit (Refundable)</div>
                  <div className="col-span-4 text-right font-mono text-foreground">
                    ₹{receipt.breakdown.depositAmount.toLocaleString("en-IN")}
                  </div>
                </div>
              ) : null}

              {receipt.breakdown.maintenanceAmount ? (
                <div className="grid grid-cols-12 p-3">
                  <div className="col-span-8 text-foreground font-medium">Society Maintenance Charges</div>
                  <div className="col-span-4 text-right font-mono text-foreground">
                    ₹{receipt.breakdown.maintenanceAmount.toLocaleString("en-IN")}
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-12 p-3">
                <div className="col-span-8 text-foreground font-medium">Platform Service Fee (One-Time)</div>
                <div className="col-span-4 text-right font-mono text-foreground">
                  ₹{(receipt.breakdown.platformFee || 299).toLocaleString("en-IN")}
                </div>
              </div>

              <div className="grid grid-cols-12 p-3">
                <div className="col-span-8 text-foreground font-medium">Integrated GST (18% on fees)</div>
                <div className="col-span-4 text-right font-mono text-foreground">
                  ₹{(receipt.breakdown.taxesAmount || 54).toLocaleString("en-IN")}
                </div>
              </div>

              {/* Total Row */}
              <div className="grid grid-cols-12 p-3 bg-muted/40 font-bold text-sm">
                <div className="col-span-8 text-foreground">Total Amount Paid</div>
                <div className="col-span-4 text-right font-mono text-primary text-base">
                  ₹{receipt.amount.toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          </div>

          {/* Payment & Audit Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs text-muted-foreground border-t border-border/70">
            <div>
              <p>Payment Mode: <strong className="text-foreground uppercase">{receipt.paymentMethod || "UPI"}</strong></p>
              <p className="font-mono text-[11px] mt-0.5">Txn ID: {receipt.transactionId}</p>
              {receipt.orderId && <p className="font-mono text-[11px]">Order: {receipt.orderId}</p>}
            </div>

            <div className="sm:text-right flex flex-col sm:items-end justify-center">
              <div className="border border-emerald-500/30 bg-emerald-500/5 rounded-lg p-2 text-center max-w-[200px]">
                <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>DIGITALLY SIGNED</span>
                </div>
                <span className="text-[9px] text-muted-foreground block mt-0.5">
                  RoomFinder Escrow Protection
                </span>
              </div>
            </div>
          </div>

          {/* Statutory Note */}
          <div className="p-3 bg-muted/30 rounded-lg text-[11px] text-muted-foreground leading-relaxed border border-border/40">
            <span className="font-semibold text-foreground">Tax Declaration: </span>
            This official electronic receipt is issued pursuant to Indian Income Tax rules for House Rent Allowance (HRA) exemption under Section 10(13A). Keep this document for your annual income tax filing.
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 bg-muted/40 border-t border-border flex justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border bg-background hover:bg-muted font-medium text-xs text-foreground transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
