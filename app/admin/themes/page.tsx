"use client";

import React, { useEffect, useState, useRef } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { LiveThemePreview } from "@/components/admin/LiveThemePreview";
import { ThemeBackground } from "@/components/environment/ThemeBackground";
import { EnvironmentPreset, DEFAULT_THEME_PRESETS, ThemeName } from "@/lib/environment-engine";
import { compressImageFile } from "@/lib/client-image-compressor";
import { Palette, Save, Upload, Sun, Moon, CloudSun, CloudRain, Snowflake, Sparkles, Sliders, Eye } from "lucide-react";

const THEME_ICONS: Record<ThemeName, React.ReactNode> = {
  DAY: <Sun className="h-4 w-4 text-amber-400" />,
  NOON: <Sun className="h-4 w-4 text-sky-400" />,
  EVENING: <CloudSun className="h-4 w-4 text-rose-400" />,
  NIGHT: <Moon className="h-4 w-4 text-indigo-400" />,
  RAIN: <CloudRain className="h-4 w-4 text-blue-400" />,
  WINTER: <Snowflake className="h-4 w-4 text-teal-300" />,
};

export default function AdminThemesPage() {
  const [themes, setThemes] = useState<Record<string, EnvironmentPreset>>(DEFAULT_THEME_PRESETS);
  const [activeTab, setActiveTab] = useState<ThemeName>("DAY");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentTheme = themes[activeTab] || DEFAULT_THEME_PRESETS[activeTab];

  const loadThemes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/themes");
      const data = await res.json();
      if (data.themes && data.themes.length > 0) {
        const themeMap: Record<string, EnvironmentPreset> = { ...DEFAULT_THEME_PRESETS };
        data.themes.forEach((t: EnvironmentPreset) => {
          themeMap[t.name] = t;
        });
        setThemes(themeMap);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThemes();
  }, []);

  const handleUpdate = (field: keyof EnvironmentPreset, value: any) => {
    setThemes((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [field]: value,
      },
    }));
  };

  // Upload Local File from System
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

      const isVideo = file.type.startsWith("video/");
      setThemes((prev) => ({
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          backgroundType: isVideo ? "video" : "image",
          backgroundUrl: data.url,
        },
      }));
    } catch (err) {
      console.error("Upload error:", err);
      alert("Network error while uploading file");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/themes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentTheme),
      });

      if (res.ok) {
        alert(`${activeTab} theme & particle settings saved successfully!`);
      } else {
        alert("Failed to save theme preset");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const allThemeNames: ThemeName[] = ["DAY", "NOON", "EVENING", "NIGHT", "RAIN", "WINTER"];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-serif font-light text-white">
              Particle Shader & Theme Manager
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Customize particle count, floating dust motes, sunbeams, stars & background visuals per schedule
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-xs font-semibold text-slate-950 hover:bg-sky-400 transition-colors shadow-lg shadow-sky-500/20 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? "Saving..." : `Save ${activeTab} Theme & Particles`}</span>
          </button>
        </div>

        {/* Schedule Selector Tabs (Very Prominent at Top) */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-800">
          {allThemeNames.map((tName) => (
            <button
              key={tName}
              onClick={() => setActiveTab(tName)}
              className={`flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-mono tracking-wider transition-all flex-shrink-0 ${
                activeTab === tName
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/50 shadow-lg font-bold ring-2 ring-sky-500/20"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800"
              }`}
            >
              {THEME_ICONS[tName]}
              <span>{tName} SCHEDULE</span>
            </button>
          ))}
        </div>

        {/* 2-Column Grid: Controls (Left) + Interactive Live Preview Box (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls Form */}
          <div className="rounded-2xl border border-sky-500/30 bg-slate-900/80 p-6 space-y-5 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-sky-400" />
                <h3 className="text-sm font-semibold text-white">
                  Editing Theme — <span className="font-mono text-sky-400 font-bold uppercase">{activeTab}</span>
                </h3>
              </div>
              <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
                ACTIVE SELECTION
              </span>
            </div>

            {/* 1. Canvas Particle Shader Selection */}
            <div className="space-y-2 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <label className="text-sky-300 font-mono font-bold uppercase text-xs flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-sky-400" />
                <span>1. Canvas Particle Shader</span>
              </label>
              <p className="text-[11px] text-slate-400">
                Select real-time canvas particle effects for {activeTab}:
              </p>
              <select
                value={currentTheme.particleType}
                onChange={(e) => handleUpdate("particleType", e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 p-3 text-white focus:border-sky-500 focus:outline-none font-mono font-semibold"
              >
                <option value="dust">✨ Floating Ambient Dust Motes (dust)</option>
                <option value="sunrays">☀️ Sweeping Sunbeams (sunrays)</option>
                <option value="sunflare">🌤️ Sunlight Lens Flares (sunflare)</option>
                <option value="clouds">🌆 Twilight Dusk Clouds (clouds)</option>
                <option value="stars">🌙 Twinkling Cosmic Stars (stars)</option>
                <option value="rain">🌧️ Glass Water Drops & Rain Streaks (rain)</option>
                <option value="snow">❄️ Cold Falling Snowflakes (snow)</option>
                <option value="none">🚫 None (Static Background)</option>
              </select>
            </div>

            {/* 2. Particle Count Density Slider */}
            <div className="space-y-2 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-sky-300 font-bold uppercase flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-sky-400" />
                  <span>2. Particle Density Slider</span>
                </span>
                <span className="text-sky-400 font-bold text-xs bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
                  {currentTheme.particleCount || 40} Particles
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Drag slider to add more or fewer particles over background (10 - 150):
              </p>
              <input
                type="range"
                min="10"
                max="150"
                step="5"
                value={currentTheme.particleCount || 40}
                onChange={(e) => handleUpdate("particleCount", parseInt(e.target.value))}
                className="w-full accent-sky-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* 3. Background Asset Mode & System Upload */}
            <div className="space-y-2 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <label className="text-sky-300 font-mono font-bold uppercase text-xs flex items-center gap-2">
                <Palette className="h-4 w-4 text-sky-400" />
                <span>3. Background Asset / System Upload</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={currentTheme.backgroundUrl || ""}
                  onChange={(e) => handleUpdate("backgroundUrl", e.target.value)}
                  placeholder="/uploads/... or https://..."
                  className="flex-1 rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-white font-mono"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 rounded-xl bg-sky-500/20 text-sky-300 px-3 py-2.5 border border-sky-500/30 hover:bg-sky-500/30 font-semibold flex-shrink-0"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>{uploading ? "Uploading..." : "📁 Choose File from System"}</span>
                </button>
              </div>
            </div>

            {/* Dark Overlay Opacity */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="flex justify-between text-slate-300 font-mono">
                <span>DARK OVERLAY OPACITY</span>
                <span className="text-sky-400 font-bold">{Math.round(currentTheme.overlayOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.9"
                step="0.05"
                value={currentTheme.overlayOpacity}
                onChange={(e) => handleUpdate("overlayOpacity", parseFloat(e.target.value))}
                className="w-full accent-sky-400"
              />
            </div>

            {/* Brightness */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="flex justify-between text-slate-300 font-mono">
                <span>BRIGHTNESS</span>
                <span className="text-sky-400 font-bold">{Math.round(currentTheme.brightness * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
                value={currentTheme.brightness}
                onChange={(e) => handleUpdate("brightness", parseFloat(e.target.value))}
                className="w-full accent-sky-400"
              />
            </div>
          </div>

          {/* Live Interactive Preview Box (Right Column) */}
          <div>
            <LiveThemePreview theme={currentTheme} />
          </div>
        </div>

        {/* Live Multi-Card Overview Grid of All 6 Core Themes */}
        <div className="space-y-3 pt-6 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase text-slate-400 tracking-wider">
              Overview of All 6 Core Environment Presets (Click any card to edit)
            </h2>
            <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
              6 REALTIME CANVASES ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {allThemeNames.map((tName) => {
              const th = themes[tName] || DEFAULT_THEME_PRESETS[tName];
              const isSelected = activeTab === tName;
              return (
                <div
                  key={tName}
                  onClick={() => setActiveTab(tName)}
                  className={`cursor-pointer flex flex-col justify-between p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? "bg-slate-900 border-sky-500 ring-2 ring-sky-500/40 shadow-2xl scale-[1.02]"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90"
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      {THEME_ICONS[tName]}
                      <span className="font-mono text-xs font-bold text-white">{tName}</span>
                    </div>
                    {isSelected ? (
                      <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[9px] font-mono text-sky-300 border border-sky-500/30">
                        EDITING
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400 capitalize">
                        {th.particleType || "standard"}
                      </span>
                    )}
                  </div>

                  {/* Embedded Live Theme Canvas & Background Preview Box */}
                  <div className="relative mt-3 h-32 w-full overflow-hidden rounded-xl border border-white/10 bg-slate-950">
                    <ThemeBackground theme={th} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center z-20 pointer-events-none">
                      <span className="text-[9px] font-mono text-white bg-slate-950/75 px-2 py-0.5 rounded-full backdrop-blur-md border border-white/15 shadow-md">
                        {tName} PREVIEW
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800/40">
                    <span>{th.particleCount || 40} Particles</span>
                    <span>{Math.round(th.brightness * 100)}% Br</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
