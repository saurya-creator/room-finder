"use client";

import React, { useEffect, useRef } from "react";
import { PropertyItem } from "@/types";
import { formatCurrency } from "@/lib/utils";

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
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let map = mapInstanceRef.current;

    // Dynamically require leaflet on client
    import("leaflet").then((L) => {
      if (!map) {
        // Initialize Map
        map = L.map(mapContainerRef.current!, {
          center: initialCenter,
          zoom: initialZoom,
          zoomControl: false,
        });

        // Add subtle modern OpenStreetMap tiles
        L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
          maxZoom: 19,
        }).addTo(map);

        // Zoom control placed neatly at top right
        L.control.zoom({ position: "topright" }).addTo(map);

        mapInstanceRef.current = map;
      }

      // Clear old markers
      Object.values(markersRef.current).forEach((m: any) => m.remove());
      markersRef.current = {};

      if (!properties || properties.length === 0) return;

      const bounds = L.latLngBounds([]);

      properties.forEach((prop) => {
        if (!prop.latitude || !prop.longitude) return;

        const isHovered = prop.id === hoveredPropertyId;
        const priceLabel = prop.rentMonthly >= 1000 ? `₹${(prop.rentMonthly / 1000).toFixed(1)}k` : `₹${prop.rentMonthly}`;

        const customIcon = L.divIcon({
          className: "leaflet-custom-div-icon",
          html: `<div class="custom-map-pin ${isHovered ? "active" : ""}" id="pin-${prop.id}">
                  ${priceLabel}
                 </div>`,
          iconSize: [60, 30],
          iconAnchor: [30, 15],
        });

        const marker = L.marker([prop.latitude, prop.longitude], { icon: customIcon }).addTo(map);

        // Popup with rich card preview
        const firstImg = prop.images?.[0]?.url || "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=500";
        const popupContent = `
          <div style="width: 220px; font-family: system-ui, -apple-system, sans-serif;">
            <a href="/property/${prop.id}" style="text-decoration: none; color: inherit;">
              <img src="${firstImg}" style="width: 100%; height: 120px; object-fit: cover; display: block;" />
              <div style="padding: 10px;">
                <div style="font-size: 11px; font-weight: 700; color: #10b981; text-transform: uppercase;">${prop.roomType} • ${prop.area}</div>
                <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${prop.title}</div>
                <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 4px;">${formatCurrency(prop.rentMonthly)}<span style="font-size: 10px; font-weight: normal; color: #64748b;">/mo</span></div>
              </div>
            </a>
          </div>
        `;

        marker.bindPopup(popupContent, { maxWidth: 240, closeButton: false });

        marker.on("click", () => {
          if (onPropertySelect) onPropertySelect(prop);
        });

        markersRef.current[prop.id] = marker;
        bounds.extend([prop.latitude, prop.longitude]);
      });

      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      }
    });

    return () => {
      // Map cleanup if container is unmounted
    };
  }, [properties]);

  // Update active marker styling when hoveredPropertyId changes
  useEffect(() => {
    if (!markersRef.current) return;
    Object.entries(markersRef.current).forEach(([id, marker]: [string, any]) => {
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
  }, [hoveredPropertyId]);

  return (
    <div className={`relative rounded-3xl overflow-hidden border border-slate-200/90 shadow-soft ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full min-h-[450px]" />
    </div>
  );
}
