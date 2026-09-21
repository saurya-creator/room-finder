import React from "react";
import Link from "next/link";
import { Building2, Heart, ShieldCheck, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-navy-950 dark:bg-slate-950 amoled:bg-black text-slate-400 pt-16 pb-12 border-t border-slate-800 amoled:border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80 amoled:border-zinc-900">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-glow">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-white">
                Urban<span className="text-brand-500">Nest</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Find a place that feels like home. Discover verified rooms, student PGs, apartments, and shared stays with zero brokerage and instant owner booking.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-navy-900 dark:bg-slate-900 amoled:bg-zinc-950 border border-slate-800 amoled:border-zinc-800 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                100% Verified Owners
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-navy-900 dark:bg-slate-900 amoled:bg-zinc-950 border border-slate-800 amoled:border-zinc-800 text-amber-400">
                <Heart className="w-4 h-4" />
                Zero Brokerage
              </div>
            </div>
          </div>

          {/* Popular Cities */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Popular Cities</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/rooms?city=Prayagraj" className="hover:text-brand-400 transition-colors">
                  Rooms in Prayagraj
                </Link>
              </li>
              <li>
                <Link href="/rooms?city=Bengaluru" className="hover:text-brand-400 transition-colors">
                  Stays in Bengaluru
                </Link>
              </li>
              <li>
                <Link href="/rooms?city=Pune" className="hover:text-brand-400 transition-colors">
                  Flats & PGs in Pune
                </Link>
              </li>
              <li>
                <Link href="/rooms?city=Delhi NCR" className="hover:text-brand-400 transition-colors">
                  Rooms in Delhi NCR
                </Link>
              </li>
              <li>
                <Link href="/rooms?city=Hyderabad" className="hover:text-brand-400 transition-colors">
                  Coliving in Hyderabad
                </Link>
              </li>
              <li>
                <Link href="/rooms?city=Mumbai" className="hover:text-brand-400 transition-colors">
                  Rooms in Mumbai
                </Link>
              </li>
            </ul>
          </div>

          {/* Stay Types */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Accommodations</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/rooms?roomType=Single" className="hover:text-brand-400 transition-colors">
                  Single Private Rooms
                </Link>
              </li>
              <li>
                <Link href="/rooms?roomType=Double" className="hover:text-brand-400 transition-colors">
                  Shared PG Rooms
                </Link>
              </li>
              <li>
                <Link href="/rooms?roomType=Studio" className="hover:text-brand-400 transition-colors">
                  Luxury Studios
                </Link>
              </li>
              <li>
                <Link href="/rooms?roomType=1BHK" className="hover:text-brand-400 transition-colors">
                  1BHK Independent Flats
                </Link>
              </li>
              <li>
                <Link href="/rooms?tenantPreference=Students" className="hover:text-brand-400 transition-colors">
                  Student Accommodations
                </Link>
              </li>
              <li>
                <Link href="/owner/properties/new" className="text-brand-400 font-semibold hover:underline">
                  List Your Room / PG
                </Link>
              </li>
            </ul>
          </div>

          {/* Safety & Legal */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Support & Trust</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/help" className="hover:text-brand-400 transition-colors">
                  Help Center & FAQs
                </Link>
              </li>
              <li>
                <Link href="/safety" className="hover:text-brand-400 transition-colors">
                  Safety & Verification
                </Link>
              </li>
              <li>
                <Link href="/cancellation" className="hover:text-brand-400 transition-colors">
                  Cancellation & Refund
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-brand-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-brand-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-400 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} UrbanNest Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Made with care for tenants and owners across India</span>
            <span>INR (₹)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
