"use client";

import React from "react";
import { X, Disc3, Music, Check } from "lucide-react";

interface Playlist {
  id: string;
  name: string;
  description?: string | null;
  coverImage?: string | null;
  songs?: any[];
}

interface PlaylistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  playlists: Playlist[];
  activePlaylistId: string;
  onSelectPlaylist: (playlist: Playlist) => void;
}

export const PlaylistDrawer: React.FC<PlaylistDrawerProps> = ({
  isOpen,
  onClose,
  playlists,
  activePlaylistId,
  onSelectPlaylist,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-md transition-opacity animate-in fade-in duration-300">
      <div className="flex h-full w-full max-w-md flex-col bg-slate-900/90 border-l border-white/10 p-6 shadow-2xl backdrop-blur-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Disc3 className="h-5 w-5 text-sky-400 animate-spin-slow" />
            <h3 className="text-lg font-serif text-white tracking-wide">Ambient Channels</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Playlists"
            className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Playlist Items */}
        <div className="mt-6 flex-1 overflow-y-auto space-y-3 pr-1">
          {playlists.map((pl) => {
            const isActive = pl.id === activePlaylistId;
            return (
              <button
                key={pl.id}
                onClick={() => {
                  onSelectPlaylist(pl);
                  onClose();
                }}
                className={`group flex w-full items-center gap-4 rounded-2xl p-3.5 text-left transition-all duration-300 border ${
                  isActive
                    ? "bg-sky-500/15 border-sky-500/40 text-white shadow-lg"
                    : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:border-white/15"
                }`}
              >
                {/* Cover Image */}
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-slate-800 border border-white/10">
                  {pl.coverImage ? (
                    <img
                      src={pl.coverImage}
                      alt={pl.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-500">
                      <Music className="h-6 w-6" />
                    </div>
                  )}
                  {isActive && (
                    <div className="absolute inset-0 bg-sky-900/60 flex items-center justify-center">
                      <Check className="h-6 w-6 text-sky-300" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-medium text-white truncate group-hover:text-sky-300 transition-colors">
                    {pl.name}
                  </h4>
                  {pl.description && (
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5 font-light">
                      {pl.description}
                    </p>
                  )}
                  <span className="inline-block text-[11px] text-slate-500 mt-1 font-mono">
                    {pl.songs?.length || 0} tracks
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
