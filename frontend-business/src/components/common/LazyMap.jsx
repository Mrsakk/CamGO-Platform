import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import L from "leaflet";
import { getBusinessCover } from "@/lib/businessMedia";

const DEFAULT_CENTER = [12.5657, 104.991];
const EMPTY_BUSINESSES = [];

const getBusinessesKey = (businesses) =>
  businesses
    .map((business) =>
      [
        business.id,
        business.slug,
        business.lat,
        business.lng,
        business.name_km,
        business.name_en,
        getBusinessCover(business),
        business.category?.name_km,
        business.category?.name_en,
      ].join("~")
    )
    .join("|");

export const LazyMap = ({
  businesses = EMPTY_BUSINESSES,
  center = DEFAULT_CENTER,
  zoom = 7,
  height = "450px",
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const businessesRef = useRef(businesses);
  businessesRef.current = businesses;
  const { i18n } = useTranslation();
  const isKm = i18n.language === "km";
  const centerLat = Number(center?.[0] ?? DEFAULT_CENTER[0]);
  const centerLng = Number(center?.[1] ?? DEFAULT_CENTER[1]);
  const businessesKey = getBusinessesKey(businesses);

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    if (container._leaflet_id) {
      delete container._leaflet_id;
    }

    // Custom Icon
    const customIcon = L.divIcon({
      className: "custom-map-pin",
      html: `
        <div style="background-color: #C9972B; color: #18181B; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); border: 2px solid #FFFFFF;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    const map = L.map(container, {
      center: [centerLat, centerLng],
      zoom,
    });
    mapInstanceRef.current = map;

    // OpenStreetMap Tile Layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Add markers
    const validBusinesses = businessesRef.current.filter((b) => b.lat && b.lng);
    const bounds = [];

    validBusinesses.forEach((b) => {
      const lat = parseFloat(b.lat);
      const lng = parseFloat(b.lng);
      if (isNaN(lat) || isNaN(lng)) return;

      bounds.push([lat, lng]);
      const name = isKm ? b.name_km || b.name_en : b.name_en || b.name_km;
      const category = isKm ? b.category?.name_km : b.category?.name_en;

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      // Popup
      const popupContent = `
        <div style="font-family: inherit; min-width: 180px; max-width: 240px; padding: 4px;">
          <img src="${getBusinessCover(b, "url_400")}" alt="" style="width: 100%; height: 90px; object-fit: cover; border-radius: 8px; margin-bottom: 6px;" />
          <div style="font-size: 11px; color: #B88210; font-weight: 600; text-transform: uppercase;">${category || ""}</div>
          <div style="font-size: 13px; font-weight: 700; color: #18181B; margin: 2px 0 6px 0;">${name}</div>
          <a href="/b/${b.slug}" style="display: block; text-align: center; background-color: #C9972B; color: #0A0A0A; padding: 6px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; text-decoration: none;">
            ${isKm ? "មើលទិន្នន័យ & ទំនាក់ទំនង" : "View & Contact"}
          </a>
        </div>
      `;
      marker.bindPopup(popupContent);
    });

    // Auto-fit bounds if multiple points
    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 14);
    }

    return () => {
      if (mapInstanceRef.current === map) {
        mapInstanceRef.current = null;
      }
      map.remove();
    };
  }, [businessesKey, centerLat, centerLng, zoom, isKm]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height, width: "100%" }}
        className="z-0 overflow-hidden rounded-3xl border border-sage-deep dark:border-slate-800"
    />
  );
};
