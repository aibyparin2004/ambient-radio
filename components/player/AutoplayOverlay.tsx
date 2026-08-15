"use client";

import React from "react";
import { Play, Sparkles } from "lucide-react";

interface AutoplayOverlayProps {
  isVisible: boolean;
  onEnter: () => void;
  siteName?: string;
}

export const AutoplayOverlay: React.FC<AutoplayOverlayProps> = ({
  isVisible,
  onEnter,
  siteName = "AURA",
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-700">
      <div className="flex max-w-md flex-col items-center text-center p-8 rounded-3xl bg-slate-900/40 border border-white/15 shadow-2xl space-y-6 mx-4">
        {/* Subtle Branding Logo */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white border border-white/20 shadow-inner">
          <Sparkles className="h-8 w-8 text-sky-300 animate-pulse" />
        </div>

        {/* Ambient Welcome Headline */}
        <div className="space-y-2">
          <h2 className="text-2xl font-light font-serif tracking-wide text-white sm:text-3xl">
            Welcome to {siteName}
          </h2>
          <p className="text-sm font-light text-slate-300 max-w-xs leading-relaxed">
            A digital ambient music room designed to evolve with your local environment and time of day.
          </p>
        </div>

        {/* ENTER THE ROOM CTA */}
        <button
          onClick={onEnter}
          className="group relative flex items-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-semibold tracking-wider text-slate-950 shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-sky-50 active:scale-95 uppercase focus:outline-none focus:ring-2 focus:ring-sky-400"
        >
          <Play className="h-4 w-4 fill-slate-950 transition-transform group-hover:scale-110" />
          <span>ENTER THE ROOM</span>
        </button>

        <span className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">
          Press to unlock audio broadcast
        </span>
      </div>
    </div>
  );
};
