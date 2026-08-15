"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { ThemeBackground } from "@/components/environment/ThemeBackground";
import { YouTubePlayer } from "@/components/player/YouTubePlayer";
import { PlayerControls } from "@/components/player/PlayerControls";
import { PlaylistDrawer } from "@/components/player/PlaylistDrawer";
import { QueueDrawer } from "@/components/player/QueueDrawer";
import { AutoplayOverlay } from "@/components/player/AutoplayOverlay";
import { LiveClockWidget } from "@/components/ui/LiveClockWidget";
import { LiveListenersBadge } from "@/components/ui/LiveListenersBadge";

import {
  EnvironmentPreset,
  DEFAULT_THEME_PRESETS,
  DEFAULT_SCHEDULE,
  ScheduleItem,
  calculateCurrentTheme,
  ThemeName,
} from "@/lib/environment-engine";

import { Sparkles, EyeOff } from "lucide-react";

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

interface Song {
  id: string;
  playlistId: string;
  youtubeVideoId: string;
  title: string;
  artist?: string | null;
  thumbnail?: string | null;
}

interface Playlist {
  id: string;
  name: string;
  description?: string | null;
  coverImage?: string | null;
  centerText?: string | null;
  centerSubtitle?: string | null;
  bgImageDay?: string | null;
  bgImageNoon?: string | null;
  bgImageEvening?: string | null;
  bgImageNight?: string | null;
  bgVideoUrl?: string | null;
  songs?: Song[];
}

export default function PublicMusicRoomPage() {
  // Environment State
  const [themes, setThemes] = useState<Record<string, EnvironmentPreset>>(DEFAULT_THEME_PRESETS);
  const [schedule, setSchedule] = useState<ScheduleItem[]>(DEFAULT_SCHEDULE);
  const [activeThemeName, setActiveThemeName] = useState<ThemeName>("NIGHT");
  const [reduceMotion, setReduceMotion] = useState(false);

  // Instant Master Default Background Resolution (Read from localStorage on frame 0)
  const [masterDefaultBg, setMasterDefaultBg] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("aura_master_default_bg");
    }
    return null;
  });

  // Playback & Playlist State
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seekToTime, setSeekToTime] = useState<number | null>(null);

  // UI State
  const [showAutoplayOverlay, setShowAutoplayOverlay] = useState(true);
  const [isPlaylistDrawerOpen, setIsPlaylistDrawerOpen] = useState(false);
  const [isQueueDrawerOpen, setIsQueueDrawerOpen] = useState(false);
  const [siteName, setSiteName] = useState("AURA");

  // 1. Load Initial Data (Playlists, Themes, Schedule, Site Settings)
  useEffect(() => {
    async function initRoom() {
      try {
        const [plRes, thRes, scRes, stRes] = await Promise.all([
          fetch("/api/playlists"),
          fetch("/api/themes"),
          fetch("/api/schedule"),
          fetch("/api/settings"),
        ]);

        const plData = await plRes.json();
        const thData = await thRes.json();
        const scData = await scRes.json();
        const stData = await stRes.json();

        if (stData.settings?.siteName) {
          setSiteName(stData.settings.siteName.split("—")[0].trim());
        }

        if (stData.settings?.defaultBgImage) {
          setMasterDefaultBg(stData.settings.defaultBgImage);
          try {
            localStorage.setItem("aura_master_default_bg", stData.settings.defaultBgImage);
          } catch (e) {}
        } else {
          try {
            localStorage.removeItem("aura_master_default_bg");
          } catch (e) {}
        }

        if (thData.themes && thData.themes.length > 0) {
          const map: Record<string, EnvironmentPreset> = { ...DEFAULT_THEME_PRESETS };
          thData.themes.forEach((t: EnvironmentPreset) => {
            map[t.name] = t;
          });
          setThemes(map);
        }

        if (scData.schedule && scData.schedule.length > 0) {
          setSchedule(scData.schedule);
          const nowTheme = calculateCurrentTheme(new Date(), scData.schedule);
          setActiveThemeName(nowTheme);
        }

        if (plData.playlists && plData.playlists.length > 0) {
          setPlaylists(plData.playlists);
          const defaultId = stData.settings?.defaultPlaylistId;
          const initialPl = plData.playlists.find((p: Playlist) => p.id === defaultId) || plData.playlists[0];
          setActivePlaylist(initialPl);
        }
      } catch (e) {
        console.error("Room init error:", e);
      }
    }

    initRoom();
  }, []);

  // 2. Automatic Time-Based Environment Engine
  const evaluateEnvironment = useCallback(() => {
    const calculatedName = calculateCurrentTheme(new Date(), schedule);
    setActiveThemeName(calculatedName);
  }, [schedule]);

  useEffect(() => {
    evaluateEnvironment();

    const interval = setInterval(evaluateEnvironment, 60000);
    const handleFocus = () => evaluateEnvironment();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") evaluateEnvironment();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [evaluateEnvironment]);

  // Active Song
  const currentSongs = activePlaylist?.songs || [];
  const currentSong = currentSongs[currentSongIndex] || null;

  // 3. Dynamic Per-Playlist Background Schedule Resolution & Option 3 Master Default Image
  const activePlaylistBg = useMemo(() => {
    if (!activePlaylist) return null;
    if (activeThemeName === "DAY" && activePlaylist.bgImageDay) return activePlaylist.bgImageDay;
    if (activeThemeName === "NOON" && activePlaylist.bgImageNoon) return activePlaylist.bgImageNoon;
    if (activeThemeName === "EVENING" && activePlaylist.bgImageEvening) return activePlaylist.bgImageEvening;
    if (activeThemeName === "NIGHT" && activePlaylist.bgImageNight) return activePlaylist.bgImageNight;
    return activePlaylist.bgVideoUrl || null;
  }, [activePlaylist, activeThemeName]);

  const resolvedThemePreset = useMemo(() => {
    const baseTheme = themes[activeThemeName] || DEFAULT_THEME_PRESETS[activeThemeName];
    // Master default background takes priority over default Unsplash theme fallbacks
    const activeBg = activePlaylistBg || masterDefaultBg || baseTheme.backgroundUrl;

    if (activeBg) {
      const isVideo = activeBg.endsWith(".mp4") || activeBg.endsWith(".webm");
      return {
        ...baseTheme,
        backgroundType: isVideo ? ("video" as const) : ("image" as const),
        backgroundUrl: activeBg,
      };
    }
    return baseTheme;
  }, [themes, activeThemeName, activePlaylistBg, masterDefaultBg]);

  // Handlers
  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleNextSong = () => {
    if (currentSongs.length === 0) return;
    setCurrentSongIndex((prev) => (prev + 1) % currentSongs.length);
  };

  const handlePrevSong = () => {
    if (currentSongs.length === 0) return;
    setCurrentSongIndex((prev) => (prev - 1 + currentSongs.length) % currentSongs.length);
  };

  const handleSelectPlaylist = (pl: Playlist) => {
    setActivePlaylist(pl);
    setCurrentSongIndex(0);
    setIsPlaying(true);
  };

  const handleSelectSongFromQueue = (index: number) => {
    setCurrentSongIndex(index);
    setIsPlaying(true);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      {/* 1. Dynamic Real-time Background Shader & Atmosphere Canvas */}
      <ThemeBackground theme={resolvedThemePreset} reduceMotion={reduceMotion} />

      {/* 2. Hidden Audio Player */}
      {currentSong && (
        <YouTubePlayer
          videoId={currentSong.youtubeVideoId}
          isPlaying={isPlaying}
          volume={volume}
          isMuted={isMuted}
          seekToTime={seekToTime}
          onStateChange={(state) => {
            if (state === 0) handleNextSong();
          }}
          onProgress={(cur, dur) => {
            setCurrentTime(cur);
            setDuration(dur);
          }}
        />
      )}

      {/* 3. Main Ambient Layout Container */}
      <div className="relative z-10 flex min-h-screen flex-col justify-between p-6 md:p-10">
        {/* Top Bar: Brand, Live Clock & Active Listeners */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950/60 border border-amber-500/30 backdrop-blur-md shadow-lg">
              <Sparkles className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-lg font-serif font-light text-white tracking-wide">{siteName}</h1>
              <p className="text-[10px] font-mono text-amber-300 uppercase tracking-widest">
                {resolvedThemePreset.name} ATMOSPHERE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LiveClockWidget activeThemeName={resolvedThemePreset.name} />
            <LiveListenersBadge />

            {/* Reduce Motion Toggle */}
            <button
              onClick={() => setReduceMotion((prev) => !prev)}
              className={`hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono backdrop-blur-md border transition-all ${
                reduceMotion
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-slate-950/60 text-slate-300 border-white/10 hover:text-white"
              }`}
              title="Toggle Atmospheric Animations"
            >
              <EyeOff className="h-3.5 w-3.5" />
              <span>{reduceMotion ? "Motion Off" : "Motion On"}</span>
            </button>
          </div>
        </header>

        {/* Center Room Display: Gujarati Center Title */}
        <main className="my-auto flex flex-col items-center justify-center text-center px-4 py-12 space-y-4">
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-serif text-white tracking-tight drop-shadow-2xl font-normal leading-tight">
              {activePlaylist?.centerText || "અર્બન ગુજરાતી"}
            </h2>
            <p className="text-xs md:text-sm font-mono text-slate-300 tracking-widest uppercase drop-shadow-md">
              {activePlaylist?.centerSubtitle || "URBAN GUJARATI AMBIENT RADIO • OPEN ALL HOURS"}
            </p>
          </div>
        </main>

        {/* Bottom Floating Glass Player Dock with Integrated Song Pill & Scrubbable Seek Bar */}
        <footer className="w-full max-w-4xl mx-auto space-y-3">
          <PlayerControls
            currentSong={currentSong}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onNextSong={handleNextSong}
            onPrevSong={handlePrevSong}
            volume={volume}
            onVolumeChange={(v) => {
              setVolume(v);
              if (v > 0 && isMuted) setIsMuted(false);
            }}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted((prev) => !prev)}
            onOpenPlaylistDrawer={() => setIsPlaylistDrawerOpen(true)}
            onOpenQueueDrawer={() => setIsQueueDrawerOpen(true)}
            activePlaylistName={activePlaylist?.name}
            currentTime={currentTime}
            duration={duration}
            onSeek={(t) => setSeekToTime(t)}
          />

          {/* Minimal Footer Links with Built By Instagram Pill Badge */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-light text-slate-300 px-4 drop-shadow-md">
            <span>&copy; {new Date().getFullYear()} {siteName}. All audio rights belong to YouTube creators.</span>
            <div className="flex flex-wrap items-center gap-3">
              {/* Made With Instagram Handle Pill Badge */}
              <a
                href="https://www.instagram.com/ai.byparin?igsh=aGR1dWVqeTljeG1k"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/60 hover:bg-slate-950/80 px-3.5 py-1 text-xs font-mono text-amber-300 hover:text-amber-200 border border-amber-500/30 hover:border-amber-500/50 backdrop-blur-md shadow-lg transition-all"
                title="Visit Instagram Profile @ai.byparin"
              >
                <span className="text-slate-300 font-sans font-medium">Made With ❤️ by</span>
                <InstagramIcon className="h-3.5 w-3.5 text-amber-400" />
                <span className="font-semibold">@ai.byparin</span>
              </a>
              <span className="text-slate-600">•</span>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </footer>

        {/* Drawers & Autoplay Overlay */}
        <PlaylistDrawer
          isOpen={isPlaylistDrawerOpen}
          playlists={playlists}
          activePlaylistId={activePlaylist?.id || ""}
          onClose={() => setIsPlaylistDrawerOpen(false)}
          onSelectPlaylist={handleSelectPlaylist}
        />

        <QueueDrawer
          isOpen={isQueueDrawerOpen}
          songs={currentSongs}
          currentIndex={currentSongIndex}
          onClose={() => setIsQueueDrawerOpen(false)}
          onSelectSongIndex={handleSelectSongFromQueue}
        />

        <AutoplayOverlay
          isVisible={showAutoplayOverlay}
          onEnter={() => {
            setShowAutoplayOverlay(false);
            setIsPlaying(true);
          }}
          siteName={siteName}
        />
      </div>
    </div>
  );
}
