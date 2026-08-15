import { z } from "zod";

export const LoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const PlaylistSchema = z.object({
  name: z.string().min(1, "Playlist name is required"),
  description: z.string().optional().nullable(),
  youtubePlaylistId: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  centerText: z.string().optional().nullable(),
  centerSubtitle: z.string().optional().nullable(),
  bgImageDay: z.string().optional().nullable(),
  bgImageNoon: z.string().optional().nullable(),
  bgImageEvening: z.string().optional().nullable(),
  bgImageNight: z.string().optional().nullable(),
  bgVideoUrl: z.string().optional().nullable(),
  enabled: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const SongSchema = z.object({
  playlistId: z.string().min(1, "Playlist ID is required"),
  youtubeVideoId: z.string().min(1, "YouTube Video ID or URL is required"),
  title: z.string().min(1, "Track title is required"),
  artist: z.string().optional().nullable(),
  thumbnail: z.string().optional().nullable(),
  enabled: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const ThemeConfigSchema = z.object({
  name: z.enum(["DAY", "NOON", "EVENING", "NIGHT", "RAIN", "WINTER"]),
  backgroundType: z.enum(["gradient", "image", "video"]).default("gradient"),
  backgroundUrl: z.string().optional().nullable(),
  gradientCss: z.string().default("linear-gradient(135deg, #0f172a, #1e1b4b)"),
  overlayOpacity: z.number().min(0).max(1).default(0.4),
  blurAmount: z.number().min(0).max(50).default(0),
  brightness: z.number().min(0.2).max(2.0).default(1.0),
  particleType: z.enum(["none", "dust", "haze", "stars", "rain", "snow", "sunrays", "sunflare", "clouds"]).default("none"),
  particleCount: z.number().min(0).max(200).default(40),
  animationSpeed: z.number().min(0.1).max(5.0).default(1.0),
  accentColor: z.string().default("#e2e8f0"),
  enabled: z.boolean().default(true),
});

export const ScheduleSchema = z.array(
  z.object({
    themeName: z.enum(["DAY", "NOON", "EVENING", "NIGHT"]),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid HH:MM format"),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid HH:MM format"),
    enabled: z.boolean().default(true),
  })
);

export const SiteSettingsSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  logoText: z.string().min(1, "Logo text is required"),
  description: z.string().optional(),
  defaultPlaylistId: z.string().optional().nullable(),
  defaultBgImage: z.string().optional().nullable(),
  defaultTheme: z.string().default("AUTO"),
  autoScheduleActive: z.boolean().default(true),
  rainEnabled: z.boolean().default(false),
  rainIntensity: z.number().min(0).max(1).default(0.5),
  winterEnabled: z.boolean().default(false),
  snowIntensity: z.number().min(0).max(1).default(0.5),
  animationIntensity: z.number().min(0).max(2).default(1.0),
});
