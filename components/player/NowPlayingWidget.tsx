"use client";

import React from "react";
import { Disc3, Radio } from "lucide-react";

interface Song {
  id: string;
  title: string;
  artist?: string | null;
  thumbnail?: string | null;
  youtubeVideoId: string;
}

interface NowPlayingWidgetProps {
  currentSong?: Song | null;
  playlistName?: string;
  isPlaying: boolean;
  activeThemeName?: string;
}

export const NowPlayingWidget: React.FC<NowPlayingWidgetProps> = ({
  currentSong,
  playlistName,
  isPlaying,
  activeThemeName = "NIGHT",
}) => {
  return (
    <div className="flex flex-col items-center text-center sm:flex-row sm:text-left gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl bg-slate-950/20 border border-white/15 backdrop-blur-xl shadow-2xl transition-all duration-500 max-w-md w-full">
      {/* Track Thumbnail / Cover Artwork */}
      <div className="relative group flex-shrink-0">
        <div
          className={`h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-xl border border-white/20 bg-slate-900/60 shadow-xl transition-all duration-500 ${
            isPlaying ? "shadow-sky-500/20 scale-102" : "opacity-90"
          }`}
        >
          {currentSong?.thumbnail ? (
            <img
              src={currentSong.thumbnail}
              alt={currentSong.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-900/80 text-slate-500">
              <Disc3 className="h-8 w-8 animate-spin-slow text-sky-400" />
            </div>
          )}
        </div>

        {/* Live Pulse Indicator Badge */}
        {isPlaying && currentSong && (
          <div className="absolute -top-1.5 -right-1.5 flex items-center gap-1 rounded-full bg-sky-500 px-2 py-0.5 text-[9px] font-semibold tracking-wider text-slate-950 shadow-md uppercase">
            <Radio className="h-2.5 w-2.5 animate-pulse" />
            <span>ON AIR</span>
          </div>
        )}
      </div>

      {/* Track Metadata */}
      <div className="flex flex-col min-w-0 flex-1 space-y-1">
        {/* Playlist & Theme Badges */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-medium text-sky-300 backdrop-blur-md border border-white/10">
            <Disc3 className="h-3 w-3 text-sky-400" />
            {playlistName || "Ambient Stream"}
          </span>
          <span className="inline-flex items-center rounded-full bg-white/5 px-2 py-0.5 text-[9px] font-mono tracking-widest text-slate-300 uppercase border border-white/10">
            {activeThemeName}
          </span>
        </div>

        {/* Song Title */}
        <h2 className="text-lg sm:text-xl font-light tracking-tight text-white line-clamp-1 font-serif drop-shadow-md">
          {currentSong?.title || "No tracks in channel"}
        </h2>

        {/* Artist Name */}
        <p className="text-xs font-normal text-slate-300 line-clamp-1">
          {currentSong?.artist || "Add tracks via Admin Portal"}
        </p>
      </div>
    </div>
  );
};
