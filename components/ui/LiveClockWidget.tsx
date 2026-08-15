"use client";

import React, { useEffect, useState } from "react";
import { Clock, Sun, Moon, CloudSun, Thermometer } from "lucide-react";

interface LiveClockWidgetProps {
  activeThemeName?: string;
}

interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  city: string;
}

function parseWmoWeatherCode(code: number): { condition: string; icon: string } {
  if (code === 0) return { condition: "Clear Sky", icon: "☀️" };
  if (code === 1 || code === 2) return { condition: "Partly Cloudy", icon: "🌤️" };
  if (code === 3) return { condition: "Overcast", icon: "☁️" };
  if (code === 45 || code === 48) return { condition: "Fog & Mist", icon: "🌫️" };
  if (code >= 51 && code <= 55) return { condition: "Light Drizzle", icon: "🌧️" };
  if (code >= 61 && code <= 65) return { condition: "Rain", icon: "🌧️" };
  if (code >= 71 && code <= 77) return { condition: "Falling Snow", icon: "❄️" };
  if (code >= 80 && code <= 82) return { condition: "Rain Showers", icon: "🌦️" };
  if (code >= 95 && code <= 99) return { condition: "Thunderstorm", icon: "🌩️" };
  return { condition: "Clear Atmosphere", icon: "🌤️" };
}

export const LiveClockWidget: React.FC<LiveClockWidgetProps> = ({ activeThemeName }) => {
  const [timeStr, setTimeStr] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>("");
  const [timeOfDayPhase, setTimeOfDayPhase] = useState<string>("DAY");
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();

      setTimeStr(
        now.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );

      setDateStr(
        now.toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
      );

      // Determine local time of day phase
      if (hours >= 6 && hours < 12) {
        setTimeOfDayPhase("MORNING");
      } else if (hours >= 12 && hours < 17) {
        setTimeOfDayPhase("NOON");
      } else if (hours >= 17 && hours < 20) {
        setTimeOfDayPhase("EVENING");
      } else {
        setTimeOfDayPhase("NIGHT");
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Accurate Real-Time Local Weather via Open-Meteo & Location API
  useEffect(() => {
    async function fetchWeatherForCoords(lat: number, lon: number, cityName?: string) {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
        );
        const data = await res.json();
        if (data.current_weather) {
          const { temperature, weathercode } = data.current_weather;
          const parsed = parseWmoWeatherCode(weathercode);
          setWeather({
            temp: Math.round(temperature),
            condition: parsed.condition,
            icon: parsed.icon,
            city: cityName || "Local Area",
          });
        }
      } catch (e) {
        console.error("Weather fetch error:", e);
      }
    }

    // IP-based Geolocation first (Instant & background seamless)
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((ipData) => {
        if (ipData.latitude && ipData.longitude) {
          const cityStr = ipData.city
            ? `${ipData.city}${ipData.country_code ? `, ${ipData.country_code}` : ""}`
            : "Local Area";
          fetchWeatherForCoords(ipData.latitude, ipData.longitude, cityStr);
        }
      })
      .catch(() => {
        // Fallback Browser Geolocation
        if (typeof window !== "undefined" && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              fetchWeatherForCoords(pos.coords.latitude, pos.coords.longitude, "Local Weather");
            },
            () => {
              // Fallback Default Coordinates if location blocked
              fetchWeatherForCoords(21.1702, 72.8311, "Surat, IN");
            }
          );
        }
      });
  }, []);

  const displayPhase = activeThemeName || timeOfDayPhase;

  // Dynamic Phase Styling & Icons
  const getPhaseBadge = (phase: string) => {
    switch (phase.toUpperCase()) {
      case "DAY":
      case "MORNING":
        return {
          label: "☀️ MORNING",
          className: "bg-amber-500/20 text-amber-300 border-amber-500/40",
          icon: <Sun className="h-3 w-3 text-amber-400" />,
        };
      case "NOON":
        return {
          label: "🌤️ NOON",
          className: "bg-sky-500/20 text-sky-300 border-sky-500/40",
          icon: <Sun className="h-3 w-3 text-sky-400" />,
        };
      case "EVENING":
        return {
          label: "🌇 EVENING",
          className: "bg-rose-500/20 text-rose-300 border-rose-500/40",
          icon: <CloudSun className="h-3 w-3 text-rose-400" />,
        };
      case "NIGHT":
      default:
        return {
          label: "🌙 NIGHT",
          className: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
          icon: <Moon className="h-3 w-3 text-indigo-400" />,
        };
    }
  };

  const phaseConfig = getPhaseBadge(displayPhase);

  return (
    <div className="flex flex-col justify-center rounded-2xl bg-slate-950/60 px-4 py-2 border border-white/15 backdrop-blur-xl shadow-lg select-none">
      {/* Top Line: Time + Time-of-Day Phase Badge */}
      <div className="flex items-center gap-3">
        <Clock className="h-4 w-4 text-sky-400 animate-pulse flex-shrink-0" />
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold tracking-wider text-white">
            {timeStr || "00:00:00 AM"}
          </span>
          <span
            className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[9px] font-bold border tracking-wider ${phaseConfig.className}`}
          >
            <span>{phaseConfig.label}</span>
          </span>
        </div>
      </div>

      {/* Bottom Line: Date + Live Accurate Local Weather Indicator */}
      <div className="flex items-center justify-between gap-3 pt-1 mt-1 border-t border-white/10 text-[10px] font-mono text-slate-300">
        <span className="uppercase tracking-widest text-slate-400">
          {dateStr || "Local Date"}
        </span>

        {weather ? (
          <div className="flex items-center gap-1.5 text-slate-200">
            <span className="text-xs">{weather.icon}</span>
            <span className="font-bold text-white">{weather.temp}°C</span>
            <span className="text-slate-500">•</span>
            <span className="truncate max-w-[90px] text-slate-300 font-medium">{weather.condition}</span>
            {weather.city && (
              <>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400 text-[9px] truncate max-w-[80px]">{weather.city}</span>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[9px] text-slate-400 font-mono animate-pulse">
            <Thermometer className="h-3 w-3 text-sky-400" />
            <span>Fetching Local Weather...</span>
          </div>
        )}
      </div>
    </div>
  );
};
