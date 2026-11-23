"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { loadGoogleMaps, GOOGLE_MAPS_API_KEY } from "@/lib/google-maps";
import { MapPin, Search, LocateFixed, Loader2 } from "lucide-react";

export interface PlaceResult {
  formattedAddress: string;
  name: string;
  city: string;
  area: string;
  state: string;
  latitude: number;
  longitude: number;
}

interface GooglePlacesInputProps {
  onPlaceSelect: (place: PlaceResult) => void;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
}

export function GooglePlacesInput({
  onPlaceSelect,
  placeholder = "Search area, building, or address...",
  defaultValue = "",
  className = "",
}: GooglePlacesInputProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const [inputValue, setInputValue] = useState(defaultValue);
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Sync defaultValue if changed from parent
  useEffect(() => {
    if (defaultValue && defaultValue !== inputValue) {
      setInputValue(defaultValue);
    }
  }, [defaultValue]);

  // Try initializing Google Places Autocomplete if key is available
  useEffect(() => {
    if (typeof window === "undefined" || !inputRef.current) return;

    let isMounted = true;

    loadGoogleMaps(GOOGLE_MAPS_API_KEY)
      .then((google) => {
        if (!isMounted || !inputRef.current) return;

        try {
          if (!window.google?.maps?.places?.Autocomplete) return;

          const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
            fields: ["address_components", "geometry", "formatted_address", "name"],
            componentRestrictions: { country: "in" },
          });

          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (!place || !place.geometry || !place.geometry.location) return;

            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();

            let city = "";
            let area = "";
            let state = "";

            if (place.address_components) {
              for (const component of place.address_components) {
                const types = component.types;
                if (types.includes("locality")) {
                  city = component.long_name;
                } else if (!city && types.includes("administrative_area_level_2")) {
                  city = component.long_name;
                }

                if (types.includes("sublocality") || types.includes("sublocality_level_1")) {
                  area = component.long_name;
                } else if (!area && types.includes("neighborhood")) {
                  area = component.long_name;
                }

                if (types.includes("administrative_area_level_1")) {
                  state = component.long_name;
                }
              }
            }

            const result: PlaceResult = {
              formattedAddress: place.formatted_address || place.name || "",
              name: place.name || "",
              city: city || "Prayagraj",
              area: area || place.name || "",
              state: state || "Uttar Pradesh",
              latitude: lat,
              longitude: lng,
            };

            setInputValue(place.formatted_address || place.name || "");
            setShowDropdown(false);
            onPlaceSelect(result);
          });

          autocompleteRef.current = autocomplete;
          setIsGoogleReady(true);
        } catch {
          // Google Places not supported or billing not enabled; Nominatim fallback handles it
        }
      })
      .catch(() => {
        // Fallback to OpenStreetMap search
      });

    return () => {
      isMounted = false;
      if (autocompleteRef.current && window.google?.maps?.event) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onPlaceSelect]);

  // OpenStreetMap Nominatim Debounced Live Search
  useEffect(() => {
    // If Google autocomplete is active, it attaches its own pac-container dropdown
    if (isGoogleReady) return;

    if (!inputValue || inputValue.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const query = inputValue.trim();
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&countrycodes=in&addressdetails=1&limit=5`;

        const res = await fetch(url, {
          headers: {
            "Accept-Language": "en-IN,en;q=0.9",
          },
        });

        if (res.ok) {
          const data = await res.json();
          setSuggestions(Array.isArray(data) ? data : []);
          setShowDropdown(Array.isArray(data) && data.length > 0);
        }
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [inputValue, isGoogleReady]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Handle Nominatim Suggestion Selection
  const handleSelectNominatim = (item: any) => {
    const addr = item.address || {};
    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.county ||
      addr.state_district ||
      "Prayagraj";
    const area =
      addr.suburb ||
      addr.neighbourhood ||
      addr.residential ||
      addr.road ||
      item.name ||
      city;
    const state = addr.state || "Uttar Pradesh";
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);

    const result: PlaceResult = {
      formattedAddress: item.display_name,
      name: item.name || item.display_name.split(",")[0],
      city,
      area,
      state,
      latitude: lat,
      longitude: lng,
    };

    setInputValue(item.display_name);
    setShowDropdown(false);
    onPlaceSelect(result);
  };

  // Browser Geolocation / GPS Finder
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const city =
              addr.city ||
              addr.town ||
              addr.village ||
              addr.county ||
              addr.state_district ||
              "Prayagraj";
            const area =
              addr.suburb ||
              addr.neighbourhood ||
              addr.residential ||
              addr.road ||
              data.name ||
              city;
            const state = addr.state || "Uttar Pradesh";

            const result: PlaceResult = {
              formattedAddress: data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
              name: data.name || area,
              city,
              area,
              state,
              latitude: lat,
              longitude: lng,
            };

            setInputValue(data.display_name || `${area}, ${city}`);
            onPlaceSelect(result);
          } else {
            onPlaceSelect({
              formattedAddress: `GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
              name: "Current Location",
              city: "Prayagraj",
              area: "Near Current Location",
              state: "Uttar Pradesh",
              latitude: lat,
              longitude: lng,
            });
          }
        } catch {
          onPlaceSelect({
            formattedAddress: `GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
            name: "Current Location",
            city: "Prayagraj",
            area: "Near Current Location",
            state: "Uttar Pradesh",
            latitude: lat,
            longitude: lng,
          });
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        alert("Unable to retrieve your location. Please check location permissions.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500">
        <Search className="w-4 h-4 text-brand-500" />
      </div>

      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          if (!isGoogleReady) setShowDropdown(true);
        }}
        onFocus={() => {
          if (!isGoogleReady && suggestions.length > 0) setShowDropdown(true);
        }}
        placeholder={placeholder}
        className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 amoled:border-zinc-800 bg-white dark:bg-slate-900 amoled:bg-zinc-900 text-xs font-semibold text-navy-900 dark:text-white amoled:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-sm"
      />

      {/* Right Controls: Loading / GPS Auto-detect / Provider Badge */}
      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
        {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-500" />}

        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={isLocating}
          title="Use current GPS location"
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-brand-50 dark:bg-slate-800 amoled:bg-zinc-800 border border-brand-200/60 dark:border-slate-700 text-brand-600 dark:text-brand-400 hover:bg-brand-100 transition-colors text-[10px] font-bold"
        >
          <LocateFixed className={`w-3 h-3 ${isLocating ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">{isLocating ? "Locating..." : "GPS"}</span>
        </button>

        <div
          title={isGoogleReady ? "Powered by Google Maps" : "Powered by OpenStreetMap"}
          className="flex items-center gap-1 text-[10px] font-bold text-slate-400 select-none pl-0.5"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isGoogleReady ? "bg-emerald-500" : "bg-sky-500"
            }`}
          ></span>
          <span className="hidden md:inline">{isGoogleReady ? "Google" : "OSM"}</span>
        </div>
      </div>

      {/* OpenStreetMap Live Suggestions Dropdown */}
      {!isGoogleReady && showDropdown && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900 amoled:bg-zinc-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 amoled:border-zinc-800 overflow-hidden max-h-64 overflow-y-auto animate-fade-in divide-y divide-slate-100 dark:divide-slate-800/80">
          {suggestions.map((item, idx) => (
            <button
              key={`${item.place_id || idx}`}
              type="button"
              onClick={() => handleSelectNominatim(item)}
              className="w-full text-left px-3.5 py-2.5 flex items-start gap-2.5 hover:bg-brand-50/70 dark:hover:bg-slate-800/60 amoled:hover:bg-zinc-800 transition-colors group"
            >
              <MapPin className="w-4 h-4 text-brand-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-navy-900 dark:text-white truncate">
                  {item.name || item.display_name.split(",")[0]}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {item.display_name}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
