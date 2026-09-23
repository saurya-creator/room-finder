/**
 * Google Maps API Helper & Loader
 * Supports Places library, custom modern styling (light & dark), and resilient loading.
 */

export const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao";

let googleMapsPromise: Promise<typeof google> | null = null;

export function loadGoogleMaps(apiKey: string = GOOGLE_MAPS_API_KEY): Promise<typeof google> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only be loaded in the browser"));
  }

  // Already loaded
  if (window.google && window.google.maps) {
    return Promise.resolve(window.google);
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    // Check if script element already exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        if (window.google && window.google.maps) {
          resolve(window.google);
        } else {
          reject(new Error("Google Maps script loaded but window.google.maps is undefined"));
        }
      });
      existingScript.addEventListener("error", (err) => reject(err));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey
    )}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google && window.google.maps) {
        resolve(window.google);
      } else {
        reject(new Error("Google Maps API loaded but objects missing"));
      }
    };

    script.onerror = (err) => {
      googleMapsPromise = null;
      reject(new Error("Failed to load Google Maps API script"));
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

/**
 * Modern UrbanNest Light Theme for Google Maps
 */
export const MAP_LIGHT_STYLES: google.maps.MapTypeStyle[] = [
  {
    featureType: "administrative",
    elementType: "labels.text.fill",
    stylers: [{ color: "#475569" }],
  },
  {
    featureType: "landscape",
    elementType: "all",
    stylers: [{ color: "#f8fafc" }],
  },
  {
    featureType: "poi",
    elementType: "all",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#e2f1e8" }, { visibility: "on" }],
  },
  {
    featureType: "road",
    elementType: "all",
    stylers: [{ saturation: -100 }, { lightness: 45 }],
  },
  {
    featureType: "road.highway",
    elementType: "all",
    stylers: [{ visibility: "simplified" }],
  },
  {
    featureType: "road.arterial",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    elementType: "all",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "water",
    elementType: "all",
    stylers: [{ color: "#dbeafe" }, { visibility: "on" }],
  },
];

/**
 * Modern Dark / Amoled Theme for Google Maps
 */
export const MAP_DARK_STYLES: google.maps.MapTypeStyle[] = [
  {
    elementType: "geometry",
    stylers: [{ color: "#1e293b" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#0f172a" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#94a3b8" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#cbd5e1" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#064e3b" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#334155" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1e293b" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#475569" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0f172a" }],
  },
];
