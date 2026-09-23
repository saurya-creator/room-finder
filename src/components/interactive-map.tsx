"use client";

import React, { useEffect, useRef, useState } from "react";
import { PropertyItem } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  loadGoogleMaps,
  MAP_LIGHT_STYLES,
  MAP_DARK_STYLES,
  GOOGLE_MAPS_API_KEY,
} from "@/lib/google-maps";
import { MapPin, Layers, X, ExternalLink, AlertCircle, RefreshCw } from "lucide-react";

interface InteractiveMapProps {
  properties: PropertyItem[];
  hoveredPropertyId?: string | null;
  onPropertySelect?: (property: PropertyItem) => void;
  className?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
}

export function InteractiveMap({
  properties,
  hoveredPropertyId,
  onPropertySelect,
  className = "w-full h-full min-h-[400px]",
  initialCenter = [25.4526, 81.8349], // Default Prayagraj
  initialZoom = 13,
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const overlaysRef = useRef<any[]>([]);
  const leafletMapRef = useRef<any>(null);
  const leafletMarkersRef = useRef<Record<string, any>>({});

  // Preferred engine; falls back automatically if Google Maps auth fails
  const [mapEngine, setMapEngine] = useState<"google" | "leaflet">("google");
  const [authError, setAuthError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<PropertyItem | null>(null);
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap");

  // Sync selectedProperty if hoveredPropertyId changes externally
  useEffect(() => {
    if (hoveredPropertyId) {
      const match = properties.find((p) => p.id === hoveredPropertyId);
      if (match) setSelectedProperty(match);
    }
  }, [hoveredPropertyId, properties]);

  // Handle Google Maps global auth failure hook
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Google Maps invokes window.gm_authFailure when key/billing/API activation fails
    const originalAuthFailure = (window as any).gm_authFailure;
    (window as any).gm_authFailure = () => {
      console.warn(
        "Google Maps Authentication Failure: The API key may need 'Maps JavaScript API' enabled or billing configured in Google Cloud Console. Falling back to OpenStreetMap."
      );
      setAuthError("Google Maps key requires 'Maps JavaScript API' activation in Google Cloud Console.");
      setMapEngine("leaflet");
      if (originalAuthFailure) originalAuthFailure();
    };

    return () => {
      (window as any).gm_authFailure = originalAuthFailure;
    };
  }, []);

  // Map Initialization Effect
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;
    const container = mapContainerRef.current;

    const isDarkMode =
      document.documentElement.classList.contains("dark") ||
      document.documentElement.classList.contains("amoled");

    // If Google Maps is chosen and hasn't failed auth
    if (mapEngine === "google" && !authError) {
      // Destroy any Leaflet instance if present
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        leafletMarkersRef.current = {};
      }
      container.innerHTML = "";

      loadGoogleMaps(GOOGLE_MAPS_API_KEY)
        .then((google) => {
          if (!isMounted || !mapContainerRef.current) return;

          const map = new google.maps.Map(mapContainerRef.current, {
            center: { lat: initialCenter[0], lng: initialCenter[1] },
            zoom: initialZoom,
            styles: isDarkMode ? MAP_DARK_STYLES : MAP_LIGHT_STYLES,
            mapTypeId: mapType === "satellite" ? google.maps.MapTypeId.HYBRID : google.maps.MapTypeId.ROADMAP,
            disableDefaultUI: true,
            zoomControl: true,
            zoomControlOptions: {
              position: google.maps.ControlPosition.RIGHT_TOP,
            },
            gestureHandling: "greedy",
          });

          googleMapRef.current = map;

          // Clear existing overlays
          overlaysRef.current.forEach((o) => o.setMap(null));
          overlaysRef.current = [];

          if (!properties || properties.length === 0) return;

          const bounds = new google.maps.LatLngBounds();

          class PriceOverlay extends google.maps.OverlayView {
            private prop: PropertyItem;
            private div: HTMLDivElement | null = null;
            private clickHandler: () => void;

            constructor(prop: PropertyItem, onClick: () => void) {
              super();
              this.prop = prop;
              this.clickHandler = onClick;
            }

            onAdd() {
              const div = document.createElement("div");
              const isHovered = this.prop.id === hoveredPropertyId;
              div.className = `custom-map-pin ${isHovered ? "active" : ""}`;
              div.id = `gpin-${this.prop.id}`;
              div.style.position = "absolute";
              div.style.cursor = "pointer";
              div.style.transform = "translate(-50%, -50%)";

              const price =
                this.prop.rentMonthly >= 1000
                  ? `₹${(this.prop.rentMonthly / 1000).toFixed(1)}k`
                  : `₹${this.prop.rentMonthly}`;
              div.innerHTML = price;

              div.addEventListener("click", (e) => {
                e.stopPropagation();
                this.clickHandler();
              });

              this.div = div;
              const panes = this.getPanes();
              panes?.overlayMouseTarget.appendChild(div);
            }

            draw() {
              if (!this.div) return;
              const projection = this.getProjection();
              if (!projection) return;
              const point = projection.fromLatLngToDivPixel(
                new google.maps.LatLng(this.prop.latitude, this.prop.longitude)
              );
              if (point) {
                this.div.style.left = point.x + "px";
                this.div.style.top = point.y + "px";
              }
            }

            onRemove() {
              if (this.div && this.div.parentNode) {
                this.div.parentNode.removeChild(this.div);
                this.div = null;
              }
            }

            updateState(active: boolean) {
              if (!this.div) return;
              if (active) {
                this.div.classList.add("active");
                this.div.style.zIndex = "1000";
              } else {
                this.div.classList.remove("active");
                this.div.style.zIndex = "1";
              }
            }
          }

          properties.forEach((prop) => {
            if (!prop.latitude || !prop.longitude) return;

            const overlay = new PriceOverlay(prop, () => {
              setSelectedProperty(prop);
              if (onPropertySelect) onPropertySelect(prop);
            });

            overlay.setMap(map);
            overlaysRef.current.push(overlay);
            bounds.extend(new google.maps.LatLng(prop.latitude, prop.longitude));
          });

          if (properties.length > 1) {
            map.fitBounds(bounds, 40);
          } else if (properties.length === 1) {
            map.setCenter({ lat: properties[0].latitude, lng: properties[0].longitude });
            map.setZoom(initialZoom);
          }
        })
        .catch((err) => {
          console.warn("Failed to load Google Maps script, switching to Leaflet:", err);
          setAuthError("Failed to load Google Maps API script.");
          setMapEngine("leaflet");
        });
    } else {
      // Leaflet / OpenStreetMap Mode
      if (googleMapRef.current) {
        googleMapRef.current = null;
        overlaysRef.current = [];
      }
      container.innerHTML = "";

      import("leaflet").then((L) => {
        if (!isMounted || !mapContainerRef.current) return;

        const map = L.map(mapContainerRef.current, {
          center: initialCenter,
          zoom: initialZoom,
          zoomControl: false,
        });

        // Crisp OpenStreetMap / Carto tiles
        const tileUrl = isDarkMode
          ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

        L.tileLayer(tileUrl, {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
          maxZoom: 19,
        }).addTo(map);

        L.control.zoom({ position: "topright" }).addTo(map);
        leafletMapRef.current = map;
        leafletMarkersRef.current = {};

        if (!properties || properties.length === 0) return;

        const bounds = L.latLngBounds([]);

        properties.forEach((prop) => {
          if (!prop.latitude || !prop.longitude) return;

          const isHovered = prop.id === hoveredPropertyId;
          const priceLabel =
            prop.rentMonthly >= 1000
              ? `₹${(prop.rentMonthly / 1000).toFixed(1)}k`
              : `₹${prop.rentMonthly}`;

          const customIcon = L.divIcon({
            className: "leaflet-custom-div-icon",
            html: `<div class="custom-map-pin ${isHovered ? "active" : ""}" id="pin-${prop.id}">
                    ${priceLabel}
                   </div>`,
            iconSize: [60, 30],
            iconAnchor: [30, 15],
          });

          const marker = L.marker([prop.latitude, prop.longitude], { icon: customIcon }).addTo(map);

          marker.on("click", () => {
            setSelectedProperty(prop);
            if (onPropertySelect) onPropertySelect(prop);
          });

          leafletMarkersRef.current[prop.id] = marker;
          bounds.extend([prop.latitude, prop.longitude]);
        });

        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [properties, mapEngine, authError]);

  // Update active marker styling when hoveredPropertyId changes
  useEffect(() => {
    if (mapEngine === "google") {
      overlaysRef.current.forEach((overlay: any) => {
        if (overlay.updateState && overlay.prop) {
          overlay.updateState(overlay.prop.id === hoveredPropertyId);
        }
      });
    } else {
      if (!leafletMarkersRef.current) return;
      Object.entries(leafletMarkersRef.current).forEach(([id, marker]: [string, any]) => {
        const el = document.getElementById(`pin-${id}`);
        if (el) {
          if (id === hoveredPropertyId) {
            el.classList.add("active");
            marker.setZIndexOffset(1000);
          } else {
            el.classList.remove("active");
            marker.setZIndexOffset(0);
          }
        }
      });
    }
  }, [hoveredPropertyId, mapEngine]);

  const toggleMapType = () => {
    const next = mapType === "roadmap" ? "satellite" : "roadmap";
    setMapType(next);
    if (googleMapRef.current && window.google?.maps) {
      googleMapRef.current.setMapTypeId(
        next === "satellite" ? window.google.maps.MapTypeId.HYBRID : window.google.maps.MapTypeId.ROADMAP
      );
    }
  };

  return (
    <div
      className={`relative rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 amoled:border-zinc-850 shadow-soft ${className}`}
    >
      {/* Map DOM target */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[450px]" />

      {/* Top Left Badge: Engine Switcher & Status */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2 max-w-[90%]">
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/95 dark:bg-slate-900/95 amoled:bg-zinc-900/95 backdrop-blur-md shadow-md border border-slate-200/70 dark:border-slate-700/70 amoled:border-zinc-800 text-[11px] font-semibold text-navy-900 dark:text-white amoled:text-white">
          <button
            onClick={() => {
              setAuthError(null);
              setMapEngine("google");
            }}
            className={`px-2.5 py-1 rounded-full transition-all ${
              mapEngine === "google"
                ? "bg-brand-500 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:text-navy-900"
            }`}
          >
            Google Maps
          </button>
          <button
            onClick={() => setMapEngine("leaflet")}
            className={`px-2.5 py-1 rounded-full transition-all ${
              mapEngine === "leaflet"
                ? "bg-slate-800 dark:bg-slate-700 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:text-navy-900"
            }`}
          >
            OpenStreetMap
          </button>
        </div>

        {mapEngine === "google" && !authError && (
          <button
            onClick={toggleMapType}
            title="Toggle Satellite / Street View"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 amoled:bg-zinc-900/95 backdrop-blur-md shadow-md border border-slate-200/70 dark:border-slate-700/70 amoled:border-zinc-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 amoled:text-zinc-200 hover:text-brand-600 transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="capitalize">{mapType}</span>
          </button>
        )}
      </div>

      {/* Auth Warning Notice with Google Cloud Console instructions */}
      {authError && (
        <div className="absolute top-14 left-3 right-3 sm:right-auto sm:max-w-md z-10 bg-amber-500/95 text-white backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-lg border border-amber-400 text-xs flex items-start gap-2.5 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold">Google Cloud Notice</div>
            <div className="text-[11px] text-amber-100 mt-0.5 leading-relaxed">
              Google Maps requires enabling <strong>Maps JavaScript API</strong> in Google Cloud Console. We have automatically switched to <strong>OpenStreetMap</strong> so your rooms remain fully visible!
            </div>
          </div>
          <button
            onClick={() => setAuthError(null)}
            className="text-amber-200 hover:text-white p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Bottom Popup Card for Selected Property */}
      {selectedProperty && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-20 animate-fade-in">
          <div className="relative bg-white dark:bg-slate-900 amoled:bg-zinc-900 rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-700 amoled:border-zinc-800 overflow-hidden flex flex-col p-3">
            <button
              onClick={() => setSelectedProperty(null)}
              className="absolute top-4 right-4 z-10 p-1 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <a href={`/property/${selectedProperty.id}`} className="block group">
              <div className="relative h-32 rounded-xl overflow-hidden mb-2.5">
                <img
                  src={
                    selectedProperty.images?.[0]?.url ||
                    "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=500"
                  }
                  alt={selectedProperty.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[10px] font-bold text-white uppercase tracking-wider">
                  {selectedProperty.roomType} • {selectedProperty.area}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-navy-900 dark:text-white amoled:text-white truncate group-hover:text-brand-500 transition-colors">
                  {selectedProperty.title}
                </h4>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-extrabold text-navy-900 dark:text-white amoled:text-white">
                    {formatCurrency(selectedProperty.rentMonthly)}
                    <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">
                      /month
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 dark:text-brand-400">
                    View Room <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
