"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, Music, Radio } from "lucide-react";

interface RoomLoadingScreenProps {
  isLoading: boolean;
  siteName?: string;
  subtitle?: string;
}

export const RoomLoadingScreen: React.FC<RoomLoadingScreenProps> = ({
  isLoading,
  siteName = "AURA",
  subtitle = "URBAN GUJARATI AMBIENT RADIO • OPEN ALL HOURS",
}) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isLoading) {
      setIsMounted(true);
      setIsFadingOut(false);
      setProgress(0);

      // Smooth step increment towards 90% while APIs fetch
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 30) return prev + 5;
          if (prev < 70) return prev + 3;
          if (prev < 90) return prev + 1;
          return prev;
        });
      }, 100);

      return () => clearInterval(interval);
    } else {
      // Accelerate to 100% when APIs finish loading
      setProgress(100);

      timer = setTimeout(() => {
        setIsFadingOut(true);
        setTimeout(() => {
          setIsMounted(false);
        }, 700);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!isMounted) return null;

  const getStatusText = (val: number) => {
    if (val < 30) return "Initializing Ambient Atmosphere...";
    if (val < 65) return "Loading Audio Streams & Playlists...";
    if (val < 95) return "Preparing High-Quality Soundscape...";
    return "Entering Room... Enjoy Music!";
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-2xl transition-all duration-700 ease-out select-none ${
        isFadingOut ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Background Animated Glow Orb */}
      <div className="absolute h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px] animate-pulse" />
      <div className="absolute h-80 w-80 rounded-full bg-sky-500/10 blur-[100px] animate-pulse delay-700" />

      {/* Main Glassmorphic Card */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center p-8 rounded-3xl bg-slate-900/40 border border-white/10 shadow-2xl space-y-6 mx-4">
        {/* Animated Brand Icon */}
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-inner">
          <Sparkles className="h-10 w-10 text-emerald-300 animate-pulse" />
          <Radio className="absolute h-4 w-4 text-sky-300 -bottom-1 -right-1 animate-bounce" />
        </div>

        {/* Branding & Subtitle */}
        <div className="space-y-1">
          <h2 className="text-3xl font-light font-serif tracking-wide text-white sm:text-4xl">
            {siteName}
          </h2>
          <p className="text-[11px] font-mono text-emerald-300 uppercase tracking-widest">
            {subtitle}
          </p>
        </div>

        {/* Live Percentage Counter Display */}
        <div className="w-full space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Music className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
              <span>{getStatusText(progress)}</span>
            </span>
            <span className="font-bold text-emerald-400 text-sm tracking-wider">{progress}%</span>
          </div>

          {/* Progress Bar Container */}
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-950/80 p-0.5 border border-white/10 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-400 transition-all duration-300 ease-out shadow-[0_0_15px_rgba(16,185,129,0.7)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Soundwave Pulse Decorator */}
        <div className="flex items-center gap-1 pt-1">
          <div className="h-4 w-1 bg-emerald-400/80 rounded-full animate-bounce [animation-delay:-0.4s]" />
          <div className="h-6 w-1 bg-teal-400/80 rounded-full animate-bounce [animation-delay:-0.2s]" />
          <div className="h-8 w-1 bg-cyan-400/80 rounded-full animate-bounce" />
          <div className="h-5 w-1 bg-emerald-400/80 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="h-3 w-1 bg-sky-400/80 rounded-full animate-bounce [animation-delay:-0.1s]" />
        </div>
      </div>
    </div>
  );
};
