"use client";

import React from "react";
import { EnvironmentPreset } from "@/lib/environment-engine";
import { ThemeBackground } from "../environment/ThemeBackground";
import { Eye } from "lucide-react";

interface LiveThemePreviewProps {
  theme: EnvironmentPreset;
}

export const LiveThemePreview: React.FC<LiveThemePreviewProps> = ({ theme }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 z-10 relative">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-sky-400" />
          <h4 className="text-xs font-mono text-slate-300 uppercase tracking-widest">
            LIVE PREVIEW — {theme.name}
          </h4>
        </div>
        <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-mono text-sky-300 border border-sky-500/30">
          REALTIME SHADER
        </span>
      </div>

      {/* Embedded Live Theme Canvas Box */}
      <div className="relative mt-3 h-64 w-full overflow-hidden rounded-xl border border-white/10 bg-slate-900">
        <ThemeBackground theme={theme} />

        {/* Dummy Mock Room Overlay to visualize text contrast */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 pointer-events-none">
          <span className="text-[10px] font-mono tracking-widest text-slate-300 uppercase bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-md border border-white/10">
            {theme.name} ATMOSPHERE PREVIEW
          </span>
          <h3 className="text-xl font-serif text-white mt-3 shadow-sm">
            Ambient Radio Preview
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xs">
            Verify readability over background visuals and particle density.
          </p>
        </div>
      </div>
    </div>
  );
};
