import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { customMapIcon } from "@/lib/leaflet-icons";
import { Star, MapPin } from "lucide-react";

// Auto invalidate map size on container resize / mobile orientation change
const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    const handleResize = () => {
      map.invalidateSize();
    };
    handleResize();
    const timer = setTimeout(handleResize, 250);
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, [map]);
  return null;
};

// Smoothly re-center map if coordinates change
const MapRecenter = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && !isNaN(center[0]) && !isNaN(center[1])) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};

const LeafletMap = ({
  destinations = [],
  singleDestination,
  center,
  zoom,
  height = "450px",
  className = ""
}) => {
  const { i18n } = useTranslation();
  const defaultCenter = singleDestination ? [Number(singleDestination.latitude) || 12.5657, Number(singleDestination.longitude) || 104.991] : center || [12.5657, 104.991];
  const defaultZoom = singleDestination ? 14 : zoom || 8;
  const rawMarkers = singleDestination ? [singleDestination] : Array.isArray(destinations) ? destinations : Array.isArray(destinations?.items) ? destinations.items : Array.isArray(destinations?.data) ? destinations.data : [];
  const markers = Array.isArray(rawMarkers) ? rawMarkers : [];
  return <div
    style={{ height }}
    className={`relative w-full rounded-2xl overflow-hidden shadow-inner border border-stone-300 dark:border-stone-800 z-0 ${className}`}
  >
      <MapContainer
    center={defaultCenter}
    zoom={defaultZoom}
    scrollWheelZoom={false}
    className="w-full h-full"
  >
        <MapResizer />
        <MapRecenter center={defaultCenter} zoom={defaultZoom} />
        <TileLayer
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />

        {markers.map((dest) => {
    const lat = Number(dest.latitude);
    const lng = Number(dest.longitude);
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null;
    const name = i18n.language === "km" && dest.name_km ? dest.name_km : dest.name_en;
    const provinceName = dest.province ? i18n.language === "km" && dest.province.name_km ? dest.province.name_km : dest.province.name_en : "";
    return <Marker
      key={dest.id}
      position={[lat, lng]}
      icon={customMapIcon(!!dest.is_featured)}
    >
              <Popup className="custom-popup">
                <div className="w-56 p-1 text-stone-900 dark:text-stone-100">
                  {dest.cover_image && <img
      src={dest.cover_image}
      alt={name}
      className="w-full h-28 object-cover rounded-lg mb-2"
    />}
                  <h4 className="font-bold text-stone-900 dark:text-stone-100 text-small font-km leading-snug line-clamp-1 mb-1">
                    {name}
                  </h4>
                  {provinceName && <p className="text-small text-stone-500 dark:text-stone-400 flex items-center gap-1 mb-1 font-km">
                      <MapPin className="w-3.5 h-3.5 text-laterite-600 dark:text-laterite-400" />
                      {provinceName}
                    </p>}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100 dark:border-stone-800 text-small font-km">
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {Number(dest.rating_avg ?? dest.avg_rating ?? 0).toFixed(1)}
                    </span>
                    <Link
                      to={`/destinations/${dest.slug}`}
                      className="text-laterite-600 dark:text-laterite-400 font-semibold hover:underline"
                    >
                      View &rarr;
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>;
  })}
      </MapContainer>
    </div>;
};
export {
  LeafletMap
};
