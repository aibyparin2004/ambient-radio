export type ThemeName = "DAY" | "NOON" | "EVENING" | "NIGHT" | "RAIN" | "WINTER";

export interface ScheduleItem {
  themeName: ThemeName;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  enabled: boolean;
}

export interface EnvironmentPreset {
  name: ThemeName;
  backgroundType: "gradient" | "image" | "video";
  backgroundUrl?: string | null;
  gradientCss: string;
  overlayOpacity: number;
  blurAmount: number;
  brightness: number;
  particleType: "none" | "dust" | "haze" | "stars" | "rain" | "snow" | "sunrays" | "sunflare" | "clouds";
  particleCount: number;
  animationSpeed: number;
  accentColor: string;
  enabled: boolean;
}

export const DEFAULT_SCHEDULE: ScheduleItem[] = [
  { themeName: "DAY", startTime: "06:00", endTime: "11:59", enabled: true },
  { themeName: "NOON", startTime: "12:00", endTime: "16:59", enabled: true },
  { themeName: "EVENING", startTime: "17:00", endTime: "19:59", enabled: true },
  { themeName: "NIGHT", startTime: "20:00", endTime: "05:59", enabled: true },
];

export const DEFAULT_THEME_PRESETS: Record<ThemeName, EnvironmentPreset> = {
  DAY: {
    name: "DAY",
    backgroundType: "gradient",
    backgroundUrl: null,
    gradientCss: "radial-gradient(ellipse at top left, #0f2027 0%, #203a43 50%, #020617 100%)",
    overlayOpacity: 0.25,
    blurAmount: 0,
    brightness: 1.0,
    particleType: "dust",
    particleCount: 30,
    animationSpeed: 0.8,
    accentColor: "#38bdf8",
    enabled: true,
  },
  NOON: {
    name: "NOON",
    backgroundType: "gradient",
    backgroundUrl: null,
    gradientCss: "radial-gradient(ellipse at top, #0f172a 0%, #1e293b 60%, #020617 100%)",
    overlayOpacity: 0.2,
    blurAmount: 0,
    brightness: 1.0,
    particleType: "dust",
    particleCount: 25,
    animationSpeed: 0.7,
    accentColor: "#7dd3fc",
    enabled: true,
  },
  EVENING: {
    name: "EVENING",
    backgroundType: "gradient",
    backgroundUrl: null,
    gradientCss: "radial-gradient(ellipse at top right, #1e1b4b 0%, #0f172a 60%, #020617 100%)",
    overlayOpacity: 0.35,
    blurAmount: 0,
    brightness: 0.95,
    particleType: "clouds",
    particleCount: 35,
    animationSpeed: 0.9,
    accentColor: "#f472b6",
    enabled: true,
  },
  NIGHT: {
    name: "NIGHT",
    backgroundType: "gradient",
    backgroundUrl: null,
    gradientCss: "radial-gradient(ellipse at bottom, #090d16 0%, #020617 60%, #000000 100%)",
    overlayOpacity: 0.45,
    blurAmount: 0,
    brightness: 0.85,
    particleType: "stars",
    particleCount: 50,
    animationSpeed: 0.6,
    accentColor: "#818cf8",
    enabled: true,
  },
  RAIN: {
    name: "RAIN",
    backgroundType: "gradient",
    backgroundUrl: null,
    gradientCss: "radial-gradient(circle at center, #0f172a 0%, #1e293b 50%, #020617 100%)",
    overlayOpacity: 0.5,
    blurAmount: 2,
    brightness: 0.8,
    particleType: "rain",
    particleCount: 75,
    animationSpeed: 1.5,
    accentColor: "#60a5fa",
    enabled: true,
  },
  WINTER: {
    name: "WINTER",
    backgroundType: "gradient",
    backgroundUrl: null,
    gradientCss: "radial-gradient(ellipse at top, #1e293b 0%, #0f172a 50%, #020617 100%)",
    overlayOpacity: 0.4,
    blurAmount: 1,
    brightness: 0.9,
    particleType: "snow",
    particleCount: 60,
    animationSpeed: 1.0,
    accentColor: "#93c5fd",
    enabled: true,
  },
};

function parseTimeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Calculates active theme name based on current date/time and schedule definitions.
 */
export function calculateCurrentTheme(date: Date, schedule: ScheduleItem[] = DEFAULT_SCHEDULE): ThemeName {
  const currentMinutes = date.getHours() * 60 + date.getMinutes();

  for (const item of schedule) {
    if (!item.enabled) continue;
    const startM = parseTimeToMinutes(item.startTime);
    const endM = parseTimeToMinutes(item.endTime);

    if (startM <= endM) {
      if (currentMinutes >= startM && currentMinutes <= endM) {
        return item.themeName;
      }
    } else {
      if (currentMinutes >= startM || currentMinutes <= endM) {
        return item.themeName;
      }
    }
  }

  return "NIGHT";
}
