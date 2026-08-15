"use client";

import React, { useEffect, useState, useRef } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Settings, Save, Upload, Sparkles, Image as ImageIcon, ShieldCheck, Key, Lock } from "lucide-react";

import { compressImageFile } from "@/lib/client-image-compressor";

interface SiteSettings {
  siteName: string;
  logoText: string;
  description: string;
  defaultPlaylistId?: string | null;
  defaultBgImage?: string | null;
  defaultTheme: string;
  autoScheduleActive: boolean;
  rainEnabled: boolean;
  rainIntensity: number;
  winterEnabled: boolean;
  snowIntensity: number;
  animationIntensity: number;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: "AURA — Ambient Radio",
    logoText: "AURA",
    description: "A living cinematic ambient music room that evolves with the time of day.",
    defaultPlaylistId: "",
    defaultBgImage: "",
    defaultTheme: "AUTO",
    autoScheduleActive: true,
    rainEnabled: false,
    rainIntensity: 0.5,
    winterEnabled: false,
    snowIntensity: 0.5,
    animationIntensity: 1.0,
  });
  const [playlists, setPlaylists] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRefDefaultBg = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [sRes, pRes] = await Promise.all([
          fetch("/api/settings"),
          fetch("/api/playlists?all=true"),
        ]);
        const sData = await sRes.json();
        const pData = await pRes.json();

        if (sData.settings) setSettings(sData.settings);
        if (pData.playlists) setPlaylists(pData.playlists);
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const originalFile = files[0];
      const file = await compressImageFile(originalFile);

      const uploadData = new FormData();
      uploadData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: uploadData,
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "File upload failed");
        return;
      }

      setSettings((prev) => ({
        ...prev,
        defaultBgImage: data.url,
      }));
    } catch (err) {
      console.error("Upload error:", err);
      alert("Network error while uploading file");
    } finally {
      setUploading(false);
    }
  };

  const [securityData, setSecurityData] = useState({
    newUsername: "admin",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        alert("Site settings & Master Default Background saved successfully!");
      } else {
        alert("Failed to save settings");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

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
        alert("✔ Success! Admin credentials updated. Please use your new login info next time.");
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
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-serif font-light text-white">Site Settings & Master Branding</h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Configure website branding, master default background visual (Option 3), and environmental conditions
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-xs font-semibold text-slate-950 hover:bg-sky-400 transition-colors shadow-lg shadow-sky-500/20 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? "Saving..." : "Save Site Settings"}</span>
          </button>
        </div>

        {/* Form Grid */}
        <form onSubmit={handleSave} className="max-w-2xl space-y-6 text-xs">
          {/* Section 1: Branding & Master Default Background (Option 3) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Settings className="h-4 w-4 text-sky-400" />
              <span>Branding & Master Default Visual (Option 3)</span>
            </h3>

            <div>
              <label className="text-slate-400 font-mono uppercase">Site Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-white focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 font-mono uppercase">Logo Text</label>
              <input
                type="text"
                value={settings.logoText}
                onChange={(e) => setSettings({ ...settings, logoText: e.target.value })}
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-white focus:border-sky-500 focus:outline-none"
              />
            </div>

            {/* Master Default Background Image (Option 3) */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-sky-500/30 space-y-3">
              <label className="text-sky-300 font-mono font-bold uppercase text-xs flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-sky-400" />
                <span>Master Default Background Image / Video (Option 3)</span>
              </label>
              <p className="text-[11px] text-slate-400">
                This master image/video is shown on initial page load to eliminate any default image flash!
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={settings.defaultBgImage || ""}
                  onChange={(e) => setSettings({ ...settings, defaultBgImage: e.target.value })}
                  placeholder="/uploads/... or https://..."
                  className="flex-1 rounded-xl bg-slate-900 border border-slate-700 p-3 text-white font-mono focus:border-sky-500 focus:outline-none"
                />
                <input
                  ref={fileInputRefDefaultBg}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRefDefaultBg.current?.click()}
                  className="flex items-center gap-1.5 rounded-xl bg-sky-500/20 text-sky-300 px-3.5 py-3 border border-sky-500/30 hover:bg-sky-500/30 font-semibold flex-shrink-0"
                >
                  <Upload className="h-4 w-4" />
                  <span>{uploading ? "Uploading..." : "📁 Choose File"}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-mono uppercase">Default Channel/Playlist</label>
              <select
                value={settings.defaultPlaylistId || ""}
                onChange={(e) => setSettings({ ...settings, defaultPlaylistId: e.target.value })}
                className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-white focus:border-sky-500 focus:outline-none"
              >
                {playlists.map((pl) => (
                  <option key={pl.id} value={pl.id}>
                    {pl.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: Atmosphere Engine Controls */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white border-b border-slate-800 pb-3">
              Atmosphere Engine Options
            </h3>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="autoScheduleActive"
                checked={settings.autoScheduleActive}
                onChange={(e) => setSettings({ ...settings, autoScheduleActive: e.target.checked })}
                className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-sky-500"
              />
              <label htmlFor="autoScheduleActive" className="text-slate-300 font-mono">
                Enable Automatic Time-Based Environment Engine
              </label>
            </div>

            {/* Rain Weather Effect */}
            <div className="pt-2 space-y-2 border-t border-slate-800/60">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="rainEnabled"
                  checked={settings.rainEnabled}
                  onChange={(e) => setSettings({ ...settings, rainEnabled: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-sky-500"
                />
                <label htmlFor="rainEnabled" className="text-slate-300 font-mono">
                  Enable Rain Atmospheric Condition
                </label>
              </div>
            </div>

            {/* Winter Weather Effect */}
            <div className="pt-2 space-y-2 border-t border-slate-800/60">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="winterEnabled"
                  checked={settings.winterEnabled}
                  onChange={(e) => setSettings({ ...settings, winterEnabled: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-sky-500"
                />
                <label htmlFor="winterEnabled" className="text-slate-300 font-mono">
                  Enable Winter / Snow Atmospheric Condition
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Admin Security & Password Manager */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">
                  Admin Security & Change Password
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                DATABASE ENCRYPTED (BCRYPT)
              </span>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 font-mono uppercase block mb-1">
                    Admin Username
                  </label>
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
                  <label className="text-slate-400 font-mono uppercase block mb-1">
                    Current Password (Required)
                  </label>
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
                  <label className="text-slate-400 font-mono uppercase block mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={securityData.newPassword}
                    onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                    placeholder="Enter new secure password (min 6 chars)"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-white focus:border-sky-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-mono uppercase block mb-1">
                    Confirm New Password
                  </label>
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
                  <Key className="h-4 w-4" />
                  <span>{updatingPassword ? "Updating Password..." : "Update Admin Password"}</span>
                </button>
              </div>
            </form>
          </div>
        </form>
      </main>
    </div>
  );
}
