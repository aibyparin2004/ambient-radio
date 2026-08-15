"use client";

import React, { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Disc3, Music, Palette, Clock, CheckCircle2, Radio, Sparkles, Key, X } from "lucide-react";
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

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

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
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-500/20 px-4 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 shadow-lg shadow-emerald-500/10 transition-all animate-pulse"
            >
              <span>🔐 CHANGE ADMIN PASSWORD</span>
            </button>

            <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3.5 py-1.5 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              <CheckCircle2 className="h-4 w-4" />
              <span>SYSTEM ONLINE</span>
            </div>
          </div>
        </div>

        {/* Prominent Security Notice Banner */}
        <div className="rounded-2xl bg-emerald-950/40 border border-emerald-500/30 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex-shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Admin Credentials & Security Control</h4>
              <p className="text-xs text-slate-300 font-mono">Update your admin username and password stored in Neon Cloud Database</p>
            </div>
          </div>
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="flex-shrink-0 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
          >
            Change Password Now &rarr;
          </button>
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

        {/* Change Admin Password Card */}
        <AdminSecurityCard />

        {/* Global Change Password Popup Modal */}
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
            <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-lg font-semibold text-white">Change Admin Password</h3>
                </div>
                <button onClick={() => setIsPasswordModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <AdminSecurityCard />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function AdminSecurityCard() {
  const [securityData, setSecurityData] = useState({
    newUsername: "admin",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!securityData.currentPassword) {
      alert("Please enter your current password.");
      return;
    }
    if (securityData.newPassword && securityData.newPassword !== securityData.confirmPassword) {
      alert("New password and confirm password do not match.");
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await fetch("/api/admin/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: securityData.currentPassword,
          newUsername: securityData.newUsername,
          newPassword: securityData.newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("✔ Success! Admin credentials updated. Please use your new login credentials next time.");
        setSecurityData({
          newUsername: data.username || securityData.newUsername,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        alert(data.error || "Failed to update admin credentials.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error while updating credentials.");
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-semibold text-white">🔒 Change Admin Password & Security</h3>
          <p className="text-xs text-slate-400 font-mono">Update your Admin login credentials stored in Neon Cloud Database</p>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          ENCRYPTED (BCRYPT)
        </span>
      </div>

      <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-slate-400 font-mono uppercase block mb-1">Admin Username</label>
            <input
              type="text"
              required
              value={securityData.newUsername}
              onChange={(e) => setSecurityData({ ...securityData, newUsername: e.target.value })}
              placeholder="e.g. admin"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-white focus:border-sky-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 font-mono uppercase block mb-1">Current Password (Required)</label>
            <input
              type="password"
              required
              value={securityData.currentPassword}
              onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
              placeholder="Enter current password"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-white focus:border-sky-500 focus:outline-none font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="text-slate-400 font-mono uppercase block mb-1">New Password</label>
            <input
              type="password"
              value={securityData.newPassword}
              onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
              placeholder="Enter new password (min 6 chars)"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-white focus:border-sky-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 font-mono uppercase block mb-1">Confirm New Password</label>
            <input
              type="password"
              value={securityData.confirmPassword}
              onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
              placeholder="Confirm new password"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-white focus:border-sky-500 focus:outline-none font-mono"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={updatingPassword}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            <span>{updatingPassword ? "Updating..." : "Update Admin Password"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
