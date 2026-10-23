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
    className: "custom-leaflet-marker !bg-transparent !border-0",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -32]
  });
};

export const explorerPinIcon = (isActive = false) => {
  const width = isActive ? 36 : 28;
  const height = Math.round(width * 1.3);
  const fill = isActive ? "#C2410C" : "#EA580C";
  const ring = isActive ? "#FEF08A" : "#FFFFFF";
  const glow = isActive
    ? "filter: drop-shadow(0 4px 12px rgba(194, 65, 12, 0.65)); transform: scale(1.15) translateY(-3px);"
    : "filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.35));";

  const svg = `
    <div style="position: relative; width: ${width}px; height: ${height}px; display: flex; align-items: flex-end; justify-content: center;">
      ${
        isActive
          ? `<div style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 18px; height: 18px; border-radius: 9999px; background: rgba(194, 65, 12, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
          : ""
      }
      <div style="cursor: pointer; transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); ${glow}">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="${width}" height="${height}">
          <!-- Pin Body -->
          <path d="M16 1C7.72 1 1 7.72 1 16c0 10.8 13.8 23.6 14.38 24.13a1 1 0 0 0 1.24 0C17.2 39.6 31 26.8 31 16 31 7.72 24.28 1 16 1z" fill="${fill}" stroke="${ring}" stroke-width="2" />
          <!-- Inner White Ring -->
          <circle cx="16" cy="15" r="7.5" fill="#FFFFFF" />
          <!-- Inner Core Dot -->
          <circle cx="16" cy="15" r="4" fill="${fill}" />
        </svg>
      </div>
    </div>
  `;
  return L.divIcon({
    html: svg,
    className: "custom-explorer-marker !bg-transparent !border-0",
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
    popupAnchor: [0, -height + 4]
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
    className: "custom-user-location-marker !bg-transparent !border-0",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};
