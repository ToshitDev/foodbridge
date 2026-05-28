"use client";

import { useEffect, useRef, useState } from "react";
import { Donation } from "@/lib/types";
import type { Map as LeafletMap, Marker } from "leaflet";

interface Props {
  donations: Donation[];
  onPinClick?: (donation: Donation) => void;
}

// Leaflet stamps _leaflet_id on the container element when a map is attached
type LeafletContainer = HTMLDivElement & { _leaflet_id?: number };

export default function DonationMap({ donations, onPinClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Ref for synchronous access in cleanup; state boolean to trigger markers effect
  const mapRef = useRef<LeafletMap | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const markersRef = useRef<Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // cancelled flag stops the IIFE from creating a map after unmount
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;

      // Bail if unmounted while importing, or if Leaflet already owns this container
      if (cancelled || !containerRef.current) return;
      if ((containerRef.current as LeafletContainer)._leaflet_id) return;

      const map = L.map(containerRef.current, {
        center: [17.385, 78.4867],
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      mapRef.current = map;
      setMapReady(true);
    })();

    return () => {
      cancelled = true;
      // mapRef.current is synchronously readable here — no React batching delay
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setMapReady(false);
      }
    };
  }, []); // run once on mount only

  // Redraw markers whenever donations change or the map first becomes ready
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    (async () => {
      const L = (await import("leaflet")).default;

      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      donations.forEach((d) => {
        const isAvailable = d.status === "available";
        const color = isAvailable ? "#16a34a" : "#9ca3af";
        const border = isAvailable ? "#15803d" : "#6b7280";

        const icon = L.divIcon({
          className: "",
          html: `<div style="
            width:22px;height:22px;
            background:${color};
            border:3px solid ${border};
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            box-shadow:0 2px 6px rgba(0,0,0,0.3);
          "></div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 22],
          popupAnchor: [0, -24],
        });

        const marker = L.marker([d.lat, d.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:sans-serif;min-width:160px">
              <p style="font-weight:700;margin:0 0 4px">${d.foodItem}</p>
              <p style="margin:0 0 2px;color:#555;font-size:12px">${d.restaurantName}</p>
              <p style="margin:0 0 2px;font-size:12px">📦 ${d.quantity}</p>
              <p style="margin:0 0 6px;font-size:12px">🕐 ${d.pickupWindow}</p>
              <span style="
                background:${isAvailable ? "#dcfce7" : "#f3f4f6"};
                color:${isAvailable ? "#166534" : "#6b7280"};
                padding:2px 8px;border-radius:99px;font-size:11px;font-weight:600;
              ">${d.status}</span>
            </div>
          `);

        if (onPinClick) marker.on("click", () => onPinClick(d));
        markersRef.current.push(marker);
      });
    })();
  }, [mapReady, donations, onPinClick]);

  return <div ref={containerRef} className="absolute inset-0" />;
}
