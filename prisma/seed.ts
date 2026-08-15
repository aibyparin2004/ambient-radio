import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { fetchYouTubePlaylistTracks } from "../lib/youtube";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Ambient Radio Database...");

  // 1. Admin User
  const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || "adminpassword123";
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  await prisma.adminUser.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash: passwordHash,
    },
  });
  console.log("✔ Admin user created (username: admin)");

  // 2. Playlists & Songs
  const playlistsData = [
    {
      name: "Urban Gujarati Hits",
      youtubePlaylistId: "PLxDvyCZDEb1OZEchuNWH9Q4odT6ld2XzK",
      description: "Modern & melodic urban Gujarati songs.",
      coverImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop",
      sortOrder: 1,
    },
    {
      name: "Highway Nights",
      youtubePlaylistId: null,
      description: "Late night cinematic ambient and synth-driven atmospheres.",
      coverImage: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?q=80&w=800&auto=format&fit=crop",
      sortOrder: 2,
      songs: [
        {
          youtubeVideoId: "jfKfPfyJRdk",
          title: "lofi hip hop radio 📚 - beats to relax/study to",
          artist: "Lofi Girl",
          sortOrder: 1,
        },
        {
          youtubeVideoId: "4xDzrJKXOOY",
          title: "synthwave radio 🌌 - chill synth / retro beats",
          artist: "Lofi Girl",
          sortOrder: 2,
        },
      ],
    },
    {
      name: "Rainy Memories",
      youtubePlaylistId: null,
      description: "Soft piano, ambient drones and gentle rain sounds for deep relaxation.",
      coverImage: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=800&auto=format&fit=crop",
      sortOrder: 3,
      songs: [
        {
          youtubeVideoId: "mPZkdNFkNps",
          title: "Ambient Space Music for Sleep & Deep Relaxation",
          artist: "Celestial Spheres",
          sortOrder: 1,
        },
      ],
    },
  ];

  let firstPlaylistId: string | null = null;

  for (const pl of playlistsData) {
    let initialSongs = pl.songs || [];

    if (pl.youtubePlaylistId) {
      try {
        const fetched = await fetchYouTubePlaylistTracks(pl.youtubePlaylistId);
        if (fetched.length > 0) {
          initialSongs = fetched.map((tr, idx) => ({
            youtubeVideoId: tr.youtubeVideoId,
            title: tr.title,
            artist: tr.artist,
            sortOrder: idx + 1,
          }));
        }
      } catch (err) {
        console.warn("Failed to fetch RSS playlist tracks:", err);
      }
    }

    const createdPl = await prisma.playlist.create({
      data: {
        name: pl.name,
        description: pl.description,
        youtubePlaylistId: pl.youtubePlaylistId,
        coverImage: pl.coverImage,
        sortOrder: pl.sortOrder,
        songs: {
          create: initialSongs.map((s) => ({
            youtubeVideoId: s.youtubeVideoId,
            title: s.title,
            artist: s.artist,
            thumbnail: `https://img.youtube.com/vi/${s.youtubeVideoId}/hqdefault.jpg`,
            sortOrder: s.sortOrder,
          })),
        },
      },
    });
    if (!firstPlaylistId) firstPlaylistId = createdPl.id;
  }
  console.log("✔ Default playlists and songs created (including Urban Gujarati Hits)");

  // 3. Theme Presets
  const themesData = [
    {
      name: "DAY",
      backgroundType: "gradient",
      gradientCss: "radial-gradient(ellipse at top left, #1e3a8a 0%, #0f172a 50%, #020617 100%)",
      overlayOpacity: 0.25,
      blurAmount: 0,
      brightness: 1.05,
      particleType: "dust",
      particleCount: 35,
      animationSpeed: 0.8,
      accentColor: "#38bdf8",
    },
    {
      name: "NOON",
      backgroundType: "gradient",
      gradientCss: "radial-gradient(ellipse at top, #0284c7 0%, #0f172a 60%, #020617 100%)",
      overlayOpacity: 0.2,
      blurAmount: 0,
      brightness: 1.1,
      particleType: "haze",
      particleCount: 25,
      animationSpeed: 0.7,
      accentColor: "#7dd3fc",
    },
    {
      name: "EVENING",
      backgroundType: "gradient",
      gradientCss: "radial-gradient(ellipse at top right, #4c1d95 0%, #831843 35%, #1e1b4b 70%, #020617 100%)",
      overlayOpacity: 0.35,
      blurAmount: 0,
      brightness: 0.95,
      particleType: "dust",
      particleCount: 45,
      animationSpeed: 0.9,
      accentColor: "#f472b6",
    },
    {
      name: "NIGHT",
      backgroundType: "gradient",
      gradientCss: "radial-gradient(ellipse at bottom, #090d16 0%, #020617 60%, #000000 100%)",
      overlayOpacity: 0.45,
      blurAmount: 0,
      brightness: 0.85,
      particleType: "stars",
      particleCount: 70,
      animationSpeed: 0.6,
      accentColor: "#818cf8",
    },
    {
      name: "RAIN",
      backgroundType: "gradient",
      gradientCss: "radial-gradient(circle at center, #0f172a 0%, #1e293b 50%, #020617 100%)",
      overlayOpacity: 0.5,
      blurAmount: 2,
      brightness: 0.8,
      particleType: "rain",
      particleCount: 90,
      animationSpeed: 1.5,
      accentColor: "#60a5fa",
    },
    {
      name: "WINTER",
      backgroundType: "gradient",
      gradientCss: "radial-gradient(ellipse at top, #1e293b 0%, #0f172a 50%, #020617 100%)",
      overlayOpacity: 0.4,
      blurAmount: 1,
      brightness: 0.9,
      particleType: "snow",
      particleCount: 75,
      animationSpeed: 1.0,
      accentColor: "#93c5fd",
    },
  ];

  for (const t of themesData) {
    await prisma.themeConfig.upsert({
      where: { name: t.name },
      update: t,
      create: t,
    });
  }
  console.log("✔ Default themes created");

  // 4. Theme Schedule
  const schedulesData = [
    { themeName: "DAY", startTime: "06:00", endTime: "11:59" },
    { themeName: "NOON", startTime: "12:00", endTime: "16:59" },
    { themeName: "EVENING", startTime: "17:00", endTime: "19:59" },
    { themeName: "NIGHT", startTime: "20:00", endTime: "05:59" },
  ];

  for (const s of schedulesData) {
    await prisma.themeSchedule.upsert({
      where: { themeName: s.themeName },
      update: s,
      create: s,
    });
  }
  console.log("✔ Default theme schedule created");

  // 5. Site Settings
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {
      defaultPlaylistId: firstPlaylistId,
    },
    create: {
      id: "default",
      siteName: "AURA — Ambient Radio",
      logoText: "AURA",
      description: "A living cinematic ambient music room that evolves with the time of day.",
      defaultPlaylistId: firstPlaylistId,
      defaultTheme: "AUTO",
      autoScheduleActive: true,
    },
  });
  console.log("✔ Site settings initialized");

  console.log("Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
