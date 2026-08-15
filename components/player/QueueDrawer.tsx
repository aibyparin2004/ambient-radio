"use client";

import React from "react";
import { X, ListMusic, Music, Play } from "lucide-react";

interface Song {
  id: string;
  title: string;
  artist?: string | null;
  thumbnail?: string | null;
  youtubeVideoId: string;
}

interface QueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  songs: Song[];
  currentIndex: number;
  onSelectSongIndex: (index: number) => void;
}

export const QueueDrawer: React.FC<QueueDrawerProps> = ({
  isOpen,
  onClose,
  songs,
  currentIndex,
  onSelectSongIndex,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-md transition-opacity animate-in fade-in duration-300">
      <div className="flex h-full w-full max-w-md flex-col bg-slate-900/90 border-l border-white/10 p-6 shadow-2xl backdrop-blur-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ListMusic className="h-5 w-5 text-sky-400" />
            <h3 className="text-lg font-serif text-white tracking-wide">Upcoming Queue</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Queue"
            className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Song List */}
        <div className="mt-6 flex-1 overflow-y-auto space-y-2 pr-1">
          {songs.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-slate-500 font-light">
              No tracks in current channel queue.
            </div>
          ) : (
            songs.map((song, idx) => {
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={song.id || idx}
                  onClick={() => {
                    onSelectSongIndex(idx);
                    onClose();
                  }}
                  className={`group flex w-full items-center gap-3.5 rounded-xl p-3 text-left transition-all duration-300 ${
                    isCurrent
                      ? "bg-sky-500/20 text-white font-medium border border-sky-500/30"
                      : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-transparent"
                  }`}
                >
                  <span className="w-5 text-center font-mono text-xs text-slate-500 group-hover:text-slate-300">
                    {String(idx + 1).padStart(2, "0")}
                  </span>

                  {/* Thumbnail */}
                  <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-slate-800 border border-white/10">
                    {song.thumbnail ? (
                      <img src={song.thumbnail} alt={song.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-500">
                        <Music className="h-4 w-4" />
                      </div>
                    )}
                    {isCurrent && (
                      <div className="absolute inset-0 bg-sky-900/60 flex items-center justify-center">
                        <Play className="h-4 w-4 text-sky-300 fill-sky-300" />
                      </div>
                    )}
                  </div>

                  {/* Song Info */}
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-medium truncate group-hover:text-sky-300 transition-colors">
                      {song.title}
                    </h5>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{song.artist}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
