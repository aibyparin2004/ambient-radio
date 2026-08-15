"use client";

import React from "react";
import { Play, Sparkles, Volume2 } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="flex max-w-md flex-col items-center text-center p-8 sm:p-10 rounded-3xl bg-slate-900/60 border border-white/20 shadow-2xl space-y-6 mx-4">
        {/* Subtle Branding Logo */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-inner">
          <Sparkles className="h-8 w-8 text-emerald-300 animate-pulse" />
        </div>

        {/* Ambient Welcome Headline */}
        <div className="space-y-2">
          <h2 className="text-2xl font-light font-serif tracking-wide text-white sm:text-3xl">
            Welcome to {siteName}
          </h2>
          <p className="text-xs font-light text-slate-300 max-w-xs leading-relaxed font-mono">
            URBAN GUJARATI AMBIENT RADIO • OPEN ALL HOURS
          </p>
        </div>

        {/* ENTER THE ROOM CTA */}
        <button
          onClick={onEnter}
          className="group relative flex items-center gap-3 rounded-full bg-emerald-400 px-9 py-4 text-sm font-bold tracking-wider text-slate-950 shadow-2xl shadow-emerald-500/30 transition-all duration-300 hover:scale-105 hover:bg-emerald-300 active:scale-95 uppercase focus:outline-none focus:ring-2 focus:ring-emerald-400 animate-bounce"
        >
          <Play className="h-4 w-4 fill-slate-950 transition-transform group-hover:scale-110" />
          <span>ENTER THE ROOM</span>
        </button>

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400/90 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          <Volume2 className="h-3.5 w-3.5" />
          <span>Tap to unlock radio playback</span>
        </div>
      </div>
    </div>
  );
};
