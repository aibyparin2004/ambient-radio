"use client";

import React, { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Disc3, Music, Palette, Clock, CheckCircle2, Radio, Sparkles } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    playlistsCount: 0,
    songsCount: 0,
    activeTheme: "NIGHT",
    autoScheduleActive: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOverview() {
      try {
        const [plRes, songRes, settingsRes] = await Promise.all([
          fetch("/api/playlists?all=true"),
          fetch("/api/songs"),
          fetch("/api/settings"),
        ]);

        const plData = await plRes.json();
        const songData = await songRes.json();
        const settingsData = await settingsRes.json();

        setStats({
          playlistsCount: plData.playlists?.length || 0,
          songsCount: songData.songs?.length || 0,
          activeTheme: settingsData.settings?.defaultTheme || "AUTO",
          autoScheduleActive: settingsData.settings?.autoScheduleActive ?? true,
        });
      } catch (e) {
        console.error("Dashboard load error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadOverview();
  }, []);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-serif font-light text-white">System Overview</h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              AURA Ambient Radio Control Hub
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3.5 py-1.5 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <CheckCircle2 className="h-4 w-4" />
            <span>SYSTEM ONLINE</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Playlists */}
          <div className="rounded-2xl bg-slate-900/60 p-6 border border-slate-800 backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase">Active Playlists</span>
              <Disc3 className="h-5 w-5 text-sky-400" />
            </div>
            <div className="text-3xl font-light text-white font-mono">
              {loading ? "..." : stats.playlistsCount}
            </div>
            <Link
              href="/admin/playlists"
              className="inline-block text-xs font-medium text-sky-400 hover:underline"
            >
              Manage Playlists &rarr;
            </Link>
          </div>

          {/* Card 2: Total Tracks */}
          <div className="rounded-2xl bg-slate-900/60 p-6 border border-slate-800 backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase">Total Songs</span>
              <Music className="h-5 w-5 text-indigo-400" />
            </div>
            <div className="text-3xl font-light text-white font-mono">
              {loading ? "..." : stats.songsCount}
            </div>
            <Link
              href="/admin/songs"
              className="inline-block text-xs font-medium text-indigo-400 hover:underline"
            >
              Manage Tracks &rarr;
            </Link>
          </div>

          {/* Card 3: Theme Engine */}
          <div className="rounded-2xl bg-slate-900/60 p-6 border border-slate-800 backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase">Environment Mode</span>
              <Palette className="h-5 w-5 text-fuchsia-400" />
            </div>
            <div className="text-xl font-light text-white font-mono uppercase">
              {stats.autoScheduleActive ? "AUTO SCHEDULE" : stats.activeTheme}
            </div>
            <Link
              href="/admin/themes"
              className="inline-block text-xs font-medium text-fuchsia-400 hover:underline"
            >
              Configure Themes &rarr;
            </Link>
          </div>

          {/* Card 4: Broadcast Status */}
          <div className="rounded-2xl bg-slate-900/60 p-6 border border-slate-800 backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase">Broadcast Mode</span>
              <Radio className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="text-lg font-light text-emerald-300 font-mono">
              YouTube IFrame API
            </div>
            <span className="text-xs text-slate-500 font-mono">Client-side embed system</span>
          </div>
        </div>

        {/* Quick Management Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-sky-950/40 via-indigo-950/40 to-slate-900/60 p-6 border border-sky-800/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-serif text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-sky-400" />
              <span>Environmental State Engine Active</span>
            </h3>
            <p className="text-xs text-slate-300 max-w-xl">
              Visitors automatically experience DAY, NOON, EVENING, or NIGHT based on their local time. You can edit schedules and visual background presets at any time.
            </p>
          </div>
          <Link
            href="/admin/schedule"
            className="flex-shrink-0 rounded-xl bg-sky-500 px-5 py-2.5 text-xs font-semibold text-slate-950 hover:bg-sky-400 transition-colors shadow-lg shadow-sky-500/20"
          >
            Edit Time Schedules
          </Link>
        </div>
      </main>
    </div>
  );
}
