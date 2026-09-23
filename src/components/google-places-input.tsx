"use client";

import React, { useEffect, useRef, useState } from "react";
import { loadGoogleMaps, GOOGLE_MAPS_API_KEY } from "@/lib/google-maps";
import { MapPin, Search, CheckCircle2 } from "lucide-react";

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
  placeholder = "Search area, building, or address on Google Maps...",
  defaultValue = "",
  className = "",
}: GooglePlacesInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState(defaultValue);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !inputRef.current) return;

    let isMounted = true;

    loadGoogleMaps(GOOGLE_MAPS_API_KEY)
      .then((google) => {
        if (!isMounted || !inputRef.current) return;

        try {
          if (!window.google?.maps?.places?.Autocomplete) {
            console.warn("Google Maps Places library not available for this key.");
            return;
          }

          // Initialize Places Autocomplete
          const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
            fields: ["address_components", "geometry", "formatted_address", "name"],
            componentRestrictions: { country: "in" }, // Focus on India, customizable
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
            onPlaceSelect(result);
          });

          autocompleteRef.current = autocomplete;
          setIsReady(true);
        } catch (err) {
          console.warn("Google Places Autocomplete initialization error:", err);
        }
      })
      .catch((err) => {
        console.warn("Google Places Autocomplete failed to initialize:", err);
      });

    return () => {
      isMounted = false;
      if (autocompleteRef.current && window.google?.maps?.event) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500">
        <Search className="w-4 h-4 text-brand-500" />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 amoled:border-zinc-800 bg-white dark:bg-slate-900 amoled:bg-zinc-900 text-xs font-semibold text-navy-900 dark:text-white amoled:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-sm"
      />
      {isReady && (
        <div
          title="Powered by Google Places"
          className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-slate-400 select-none"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Google</span>
        </div>
      )}
    </div>
  );
}
