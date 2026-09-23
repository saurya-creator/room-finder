import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { MobileNav } from "@/components/mobile-nav";
import { RoleSwitcherBanner } from "@/components/role-switcher-banner";
import { AdminFloatingBar } from "@/components/admin-floating-bar";

export const metadata: Metadata = {
  title: "UrbanNest | Find a Place That Feels Like Home",
  description:
    "Discover verified rooms, student PGs, luxury apartments, and shared stays across Prayagraj, Bengaluru, Pune, Delhi NCR, and major cities with zero brokerage.",
  keywords: [
    "rooms for rent",
    "PG near me",
    "flats for rent",
    "student accommodation",
    "coliving",
    "Prayagraj rooms",
    "Bangalore PGs",
    "no brokerage",
  ],
  openGraph: {
    title: "UrbanNest | Verified Rooms, PGs and Shared Stays",
    description: "Discover verified rooms and flats with zero brokerage and instant owner booking.",
    url: "https://urbannest.in",
    siteName: "UrbanNest",
    locale: "en_IN",
    type: "website",
  },
};

import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('urbannest_theme');
                  var root = document.documentElement;
                  if (saved === 'dark') {
                    root.classList.add('dark');
                  } else if (saved === 'amoled') {
                    root.classList.add('dark', 'amoled');
                  } else if (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    root.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] dark:bg-slate-950 dark:text-slate-100 amoled:bg-black amoled:text-white transition-colors duration-200 pb-16 md:pb-0">
        <ThemeProvider>
          <Navbar />
          <AdminFloatingBar />
          <main className="flex-1">{children}</main>
          <MobileNav />
          <RoleSwitcherBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}
