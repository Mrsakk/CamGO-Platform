import L from "leaflet";

export const customMapIcon = (isFeatured = false) => {
  const color = isFeatured ? "#D4A017" : "#0F766E";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36">
      <path fill="${color}" stroke="#FFFFFF" stroke-width="2" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="2.8" fill="#FFFFFF"/>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: "custom-leaflet-marker",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -32]
  });
};

export const explorerPinIcon = (isActive = false) => {
  const size = isActive ? 40 : 32;
  const fill = isActive ? "#E54800" : "#EA580C";
  const ring = isActive ? "#FDE68A" : "#FFFFFF";
  const glow = isActive
    ? "filter: drop-shadow(0 0 12px rgba(229, 72, 0, 0.85)); transform: scale(1.15);"
    : "filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.35));";
  const svg = `
    <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;">
      ${
        isActive
          ? `<div style="position: absolute; inset: -8px; border-radius: 9999px; background: rgba(229, 72, 0, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
          : ""
      }
      <div style="cursor: pointer; transition: all 0.25s ease; ${glow}">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="${size}" height="${size}">
          <circle cx="18" cy="18" r="16" fill="${fill}" stroke="${ring}" stroke-width="2.5" />
          <path d="M18 9 L25 25 L18 21 L11 25 Z" fill="#FFFFFF" />
        </svg>
      </div>
    </div>
  `;
  return L.divIcon({
    html: svg,
    className: "custom-explorer-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
};

export const userLocationIcon = () => {
  const svg = `
    <div style="position: relative; width: 24px; height: 24px;">
      <div style="position: absolute; inset: -4px; background: rgba(59, 130, 246, 0.35); border-radius: 9999px; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position: absolute; inset: 2px; background: #2563EB; border: 2.5px solid #FFFFFF; border-radius: 9999px; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"></div>
    </div>
  `;
  return L.divIcon({
    html: svg,
    className: "custom-user-location-marker",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};
