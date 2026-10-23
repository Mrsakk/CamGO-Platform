import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Sun,
  CloudSun,
  CloudRain,
  CloudLightning,
  Wind,
  Droplets,
  Compass,
  Calendar,
  Sparkles
} from "lucide-react";

/**
 * Weather & Season Guide Widget
 * Fetches real-time weather using Open-Meteo with zero-API-key requirements,
 * with graceful offline seasonal fallback for Cambodian climate.
 */
export const WeatherWidget = ({
  latitude = 13.4125, // default to Siem Reap
  longitude = 103.8670,
  provinceName,
  bestTime,
  className = ""
}) => {
  const { t, i18n } = useTranslation();
  const km = i18n.language === "km";

  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const lat = latitude || 13.4125;
        const lon = longitude || 103.8670;
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`
        );
        if (!res.ok) throw new Error("Weather API error");
        const data = await res.json();
        if (isMounted && data.current) {
          setWeather({
            temp: Math.round(data.current.temperature_2m),
            humidity: data.current.relative_humidity_2m,
            windSpeed: Math.round(data.current.wind_speed_10m),
            weatherCode: data.current.weather_code,
            isLive: true
          });
        }
      } catch {
        // Fallback seasonal Cambodian climate
        const currentMonth = new Date().getMonth() + 1;
        const isDrySeason = currentMonth >= 11 || currentMonth <= 4;
        if (isMounted) {
          setWeather({
            temp: isDrySeason ? 31 : 29,
            humidity: isDrySeason ? 62 : 78,
            windSpeed: 10,
            weatherCode: isDrySeason ? 0 : 61,
            isLive: false
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchWeather();
    return () => {
      isMounted = false;
    };
  }, [latitude, longitude]);

  const getWeatherInfo = (code) => {
    if (code === 0) {
      return {
        label: km ? "មេឃស្រឡះ ល្អសម្រាប់ដើរកម្សាន្ត" : "Clear & Sunny",
        icon: Sun,
        iconColor: "text-amber-400"
      };
    }
    if (code >= 1 && code <= 3) {
      return {
        label: km ? "មានពពកតិចតួច មេឃត្រជាក់" : "Partly Cloudy",
        icon: CloudSun,
        iconColor: "text-amber-300"
      };
    }
    if (code >= 51 && code <= 67) {
      return {
        label: km ? "មានភ្លៀងរលឹមស្រាលៗ" : "Light Rain Showers",
        icon: CloudRain,
        iconColor: "text-cyan-400"
      };
    }
    if (code >= 80 && code <= 99) {
      return {
        label: km ? "មានភ្លៀងផ្គររន្ទះ" : "Thunderstorms Possible",
        icon: CloudLightning,
        iconColor: "text-yellow-400"
      };
    }
    return {
      label: km ? "អាកាសធាតុក្តៅឧណ្ហៗ" : "Tropical Warmth",
      icon: Sun,
      iconColor: "text-amber-400"
    };
  };

  const weatherInfo = getWeatherInfo(weather?.weatherCode ?? 0);
  const WeatherIcon = weatherInfo.icon;

  const defaultBestTime = km
    ? "ខែវិច្ឆិកា ដល់ ខែមីនា (រដូវត្រជាក់ មេឃស្រឡះ)"
    : "November to March (Cool, dry & sunny season)";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-br from-stone-900/90 via-stone-900/80 to-stone-950/90 dark:from-stone-950/95 dark:to-[#070B12] p-4 text-white shadow-xl backdrop-blur-md ${className}`}
    >
      {/* Decorative Gold Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-amber-400" />
          <span className="text-small font-bold text-amber-200 uppercase tracking-wide">
            {km ? "អាកាសធាតុ & រដូវកាលទេសចរណ៍" : "Live Weather & Season"}
          </span>
        </div>
        {provinceName && (
          <span className="text-caption px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold">
            {provinceName}
          </span>
        )}
      </div>

      {/* Current Live Weather */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <WeatherIcon className={`w-8 h-8 ${weatherInfo.iconColor} animate-pulse`} />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
                {loading ? "--" : `${weather?.temp ?? 30}°C`}
              </span>
              <span className="text-caption text-stone-400">
                {weather?.isLive ? (km ? "បច្ចុប្បន្ន" : "Live") : (km ? "តាមរដូវ" : "Seasonal")}
              </span>
            </div>
            <p className="text-small font-medium text-stone-300 line-clamp-1">
              {weatherInfo.label}
            </p>
          </div>
        </div>

        {/* Humidity & Wind */}
        <div className="space-y-1 text-right text-caption text-stone-300 font-mono">
          <div className="flex items-center justify-end gap-1">
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            <span>{weather?.humidity ?? 70}%</span>
          </div>
          <div className="flex items-center justify-end gap-1">
            <Wind className="w-3.5 h-3.5 text-stone-400" />
            <span>{weather?.windSpeed ?? 10} km/h</span>
          </div>
        </div>
      </div>

      {/* Best Season Recommendation */}
      <div className="mt-3.5 pt-3 border-t border-amber-500/15 flex items-start gap-2.5">
        <div className="p-1 rounded-md bg-amber-500/15 text-amber-400 mt-0.5 shrink-0">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <div className="text-caption">
          <span className="font-semibold text-amber-300 block">
            {km ? "រដូវកាលសមស្របបំផុតសម្រាប់ទស្សនា:" : "Best Time to Visit:"}
          </span>
          <p className="text-stone-300 leading-snug mt-0.5">
            {bestTime || defaultBestTime}
          </p>
        </div>
      </div>
    </div>
  );
};
export default WeatherWidget;
