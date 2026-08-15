"use client";

import React, { useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Disc3,
  ListMusic,
} from "lucide-react";

interface Song {
  id: string;
  title: string;
  artist?: string | null;
  thumbnail?: string | null;
  youtubeVideoId: string;
}

interface PlayerControlsProps {
  currentSong?: Song | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPrevSong: () => void;
  onNextSong: () => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenPlaylistDrawer: () => void;
  onOpenQueueDrawer: () => void;
  activePlaylistName?: string;
  currentTime?: number;
  duration?: number;
  onSeek?: (seconds: number) => void;
}

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  currentSong,
  isPlaying,
  onTogglePlay,
  onPrevSong,
  onNextSong,
  volume,
  onVolumeChange,
  isMuted,
  onToggleMute,
  onOpenPlaylistDrawer,
  onOpenQueueDrawer,
  activePlaylistName,
  currentTime = 0,
  duration = 0,
  onSeek,
}) => {
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekVal, setSeekVal] = useState(0);

  const activeTime = isSeeking ? seekVal : currentTime;
  const progressPercent = duration > 0 ? (activeTime / duration) * 100 : 0;

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSeekVal(Number(e.target.value));
  };

  const handleSeekCommit = (targetVal?: number) => {
    setIsSeeking(false);
    const targetSeconds = targetVal !== undefined ? targetVal : seekVal;
    onSeek?.(targetSeconds);
    if (!isPlaying) {
      onTogglePlay();
    }
  };

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration || duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const clickRatio = Math.max(0, Math.min(1, clickX / width));
    const targetSeconds = clickRatio * duration;
    setSeekVal(targetSeconds);
    handleSeekCommit(targetSeconds);
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-4 rounded-3xl bg-slate-950/70 border border-white/20 backdrop-blur-2xl shadow-2xl w-full select-none">
      {/* Left: Integrated Track Info Pill Badge + Live Emerald Pulse + Seek Bar */}
      <div className="flex items-center gap-4 min-w-0 flex-1 w-full md:w-auto">
        {/* Track Thumbnail or Spinning Disc */}
        <div className="relative h-12 w-12 flex-shrink-0 rounded-2xl overflow-hidden border border-white/20 shadow-lg bg-slate-900">
          {currentSong?.thumbnail ? (
            <img
              src={currentSong.thumbnail}
              alt={currentSong.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-900 text-sky-400">
              <Disc3 className="h-6 w-6 animate-spin-slow" />
            </div>
          )}
        </div>

        {/* Integrated Song Pill Badge with Pulsing Emerald Dot */}
        <div className="flex flex-col min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Live Pulsing Emerald Green Indicator Dot */}
            <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>

            <h3 className="text-sm font-bold text-white truncate leading-snug tracking-wide">
              {currentSong?.title || "Urban Gujarati Radio"}
            </h3>
          </div>

          <p className="text-xs text-slate-300 font-mono font-light truncate pl-5">
            {currentSong?.artist
              ? currentSong.artist
              : activePlaylistName
              ? `Playlist • ${activePlaylistName}`
              : "Ambient YouTube Music Room"}
          </p>

          {/* Interactive Scrubbable Seek Progress Bar */}
          <div className="flex items-center gap-3 pt-1 w-full max-w-md">
            <div
              onClick={handleBarClick}
              className="relative flex-1 h-2 flex items-center group cursor-pointer py-1"
            >
              {/* Background Track */}
              <div className="w-full h-1 bg-white/20 group-hover:bg-white/30 rounded-full transition-colors relative overflow-hidden">
                {/* Active Progress Fill */}
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-sky-400 rounded-full transition-all duration-75"
                  style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                />
              </div>

              {/* Range Input Overlay for Dragging */}
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={activeTime}
                onMouseDown={() => {
                  setIsSeeking(true);
                  setSeekVal(currentTime);
                }}
                onChange={handleSeekChange}
                onMouseUp={() => handleSeekCommit()}
                onTouchEnd={() => handleSeekCommit()}
                aria-label="Seek track position"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            {/* Time Stamp */}
            <span className="font-mono text-[10px] text-slate-300 flex-shrink-0 font-medium">
              {formatTime(activeTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>

      {/* Right Controls: Prev, Big Circular Play/Pause, Next, Volume, Drawers */}
      <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
        {/* Previous Track */}
        <button
          onClick={onPrevSong}
          aria-label="Previous Track"
          className="p-2 text-slate-200 hover:text-white transition-colors rounded-full hover:bg-white/10"
        >
          <SkipBack className="h-5 w-5" />
        </button>

        {/* Big Circular Cream Play/Pause Button */}
        <button
          onClick={onTogglePlay}
          aria-label={isPlaying ? "Pause Music" : "Play Music"}
          className={`flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-950 shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 ${
            isPlaying ? "shadow-emerald-500/20" : ""
          }`}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5 fill-current text-slate-950" />
          ) : (
            <Play className="ml-0.5 h-5 w-5 fill-current text-slate-950" />
          )}
        </button>

        {/* Next Track */}
        <button
          onClick={onNextSong}
          aria-label="Next Track"
          className="p-2 text-slate-200 hover:text-white transition-colors rounded-full hover:bg-white/10"
        >
          <SkipForward className="h-5 w-5" />
        </button>

        {/* Volume Control */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/15">
          <button
            onClick={onToggleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
            className="p-1.5 text-slate-200 hover:text-white transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4 text-rose-400" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            aria-label="Volume Slider"
            className="w-16 h-1 accent-emerald-400 bg-white/25 rounded-full cursor-pointer hidden sm:block"
          />
        </div>

        {/* Drawers: Playlist & Queue */}
        <div className="flex items-center gap-1 pl-2 border-l border-white/15">
          <button
            onClick={onOpenPlaylistDrawer}
            title="Open Playlists"
            className="p-2 text-slate-200 hover:text-white transition-colors rounded-full hover:bg-white/10"
          >
            <Disc3 className="h-4.5 w-4.5 text-sky-400 animate-spin-slow" />
          </button>
          <button
            onClick={onOpenQueueDrawer}
            title="Open Track Queue"
            className="p-2 text-slate-200 hover:text-white transition-colors rounded-full hover:bg-white/10"
          >
            <ListMusic className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
