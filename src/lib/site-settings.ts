export interface FeaturedCityConfig {
  id: string;
  name: string;
  state: string;
  image: string;
  areas: string;
  staysCount: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  announcementText: string;
  showAnnouncement: boolean;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroSearchPlaceholder: string;
  supportPhone: string;
  supportEmail: string;
  whatsappNumber: string;
  officeAddress: string;
  platformFee: number;
  featuredCities: FeaturedCityConfig[];
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: "UrbanNest",
  tagline: "Find a Place That Feels Like Home",
  announcementText: "⚡ ZERO BROKERAGE ON ALL VERIFIED FLATS & ROOMS ACROSS INDIA",
  showAnnouncement: true,
  heroBadge: "⚡ ZERO BROKERAGE VERIFIED STAYS",
  heroTitle: "Find a Room That Truly Feels Like Home",
  heroSubtitle:
    "Discover verified rooms, student PGs, luxury apartments, and shared stays across Prayagraj, Bengaluru, Pune, Delhi NCR, and major cities with zero brokerage.",
  heroSearchPlaceholder: "Search city, area or landmark (e.g. Civil Lines, Koramangala)...",
  supportPhone: "+91 98765 43210",
  supportEmail: "support@urbannest.com",
  whatsappNumber: "+91 98765 43210",
  officeAddress: "Civil Lines, Prayagraj & Koramangala, Bengaluru",
  platformFee: 299,
  featuredCities: [
    {
      id: "city-1",
      name: "Prayagraj",
      state: "Uttar Pradesh",
      image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600&auto=format&fit=crop&q=80",
      areas: "Civil Lines, Katra, Georgetown, Ashok Nagar",
      staysCount: "120+ Stays",
    },
    {
      id: "city-2",
      name: "Bengaluru",
      state: "Karnataka",
      image: "https://images.unsplash.com/photo-1502005229762-ee1b2da9730f?w=600&auto=format&fit=crop&q=80",
      areas: "Koramangala, HSR, Indiranagar, Whitefield",
      staysCount: "450+ Stays",
    },
    {
      id: "city-3",
      name: "Pune",
      state: "Maharashtra",
      image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&auto=format&fit=crop&q=80",
      areas: "Viman Nagar, Hinjewadi, Baner, Kothrud",
      staysCount: "310+ Stays",
    },
    {
      id: "city-4",
      name: "Delhi NCR",
      state: "Delhi & Haryana",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&auto=format&fit=crop&q=80",
      areas: "Hauz Khas, Gurgaon Cyber City, Noida Sector 62",
      staysCount: "520+ Stays",
    },
    {
      id: "city-5",
      name: "Hyderabad",
      state: "Telangana",
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop&q=80",
      areas: "Hitec City, Gachibowli, Madhapur, Kondapur",
      staysCount: "280+ Stays",
    },
    {
      id: "city-6",
      name: "Mumbai",
      state: "Maharashtra",
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&auto=format&fit=crop&q=80",
      areas: "Andheri West, Bandra, Powai, Thane",
      staysCount: "390+ Stays",
    },
  ],
};
