"use client";

import React, { useEffect, useState, useRef } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { EnvironmentPreset, DEFAULT_THEME_PRESETS, ThemeName } from "@/lib/environment-engine";
import { EnvironmentCanvas } from "@/components/environment/EnvironmentCanvas";
import { Image as ImageIcon, Save, Sparkles, Upload, FileUp, Check, Sliders } from "lucide-react";

const UNSPLASH_PRESETS: Record<ThemeName, { label: string; url: string }[]> = {
  DAY: [
    {
      label: "Morning Sunburst",
      url: "https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?q=80&w=1920&auto=format&fit=crop",
    },
    {
      label: "Peaceful Forest Haze",
      url: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1920&auto=format&fit=crop",
    },
  ],
  NOON: [
    {
      label: "Azure Horizon",
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1920&auto=format&fit=crop",
    },
    {
      label: "Sunlit Clouds",
      url: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=1920&auto=format&fit=crop",
    },
  ],
  EVENING: [
    {
      label: "Golden Hour Ocean",
      url: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?q=80&w=1920&auto=format&fit=crop",
    },
    {
      label: "Purple Sunset Dusk",
      url: "https://images.unsplash.com/photo-1507499739999-097706ad8914?q=80&w=1920&auto=format&fit=crop",
    },
  ],
  NIGHT: [
    {
      label: "Cosmic Starry Night",
      url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1920&auto=format&fit=crop",
    },
    {
      label: "Deep Midnight Aurora",
      url: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=1920&auto=format&fit=crop",
    },
  ],
  RAIN: [
    {
      label: "Rain Drops on Glass",
      url: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=1920&auto=format&fit=crop",
    },
    {
      label: "Stormy Misty Street",
      url: "https://images.unsplash.com/photo-1519692933481-e162a57d6721?q=80&w=1920&auto=format&fit=crop",
    },
  ],
  WINTER: [
    {
      label: "Snowy Pine Forest",
      url: "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?q=80&w=1920&auto=format&fit=crop",
    },
    {
      label: "Cold Mountain Mist",
      url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1920&auto=format&fit=crop",
    },
  ],
};

export default function AdminBackgroundsPage() {
  const [themes, setThemes] = useState<Record<string, EnvironmentPreset>>(DEFAULT_THEME_PRESETS);
  const [activeTab, setActiveTab] = useState<ThemeName>("DAY");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const currentTheme = themes[activeTab] || DEFAULT_THEME_PRESETS[activeTab];

  const handleUpdate = (field: keyof EnvironmentPreset, value: any) => {
    setThemes((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [field]: value,
      },
    }));
  };

  // Upload Background Image/Video File from Computer / Device
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setUploadSuccess(null);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "File upload failed");
        return;
      }

      handleUpdate("backgroundUrl", data.url);
      handleUpdate("backgroundType", data.fileType === "video" ? "video" : "image");
      setUploadSuccess(`Successfully uploaded "${data.fileName}"! Click Save Background to publish.`);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Network error occurred while uploading file.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
        alert(`Background & particle settings for ${activeTab} saved! Visitors will now see this image and particles during the ${activeTab} schedule.`);
        setUploadSuccess(null);
      } else {
        alert("Failed to save background settings.");
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
            <h1 className="text-2xl font-serif font-light text-white">Background & Particle Manager</h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Upload background visuals and customize particle density (dust, sunrays, stars) per schedule
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-xs font-semibold text-slate-950 hover:bg-sky-400 transition-colors shadow-lg shadow-sky-500/20 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? "Saving..." : `Save ${activeTab} Background & Particles`}</span>
          </button>
        </div>

        {/* Time Schedule Selector Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-800">
          {allThemeNames.map((tName) => (
            <button
              key={tName}
              onClick={() => {
                setActiveTab(tName);
                setUploadSuccess(null);
              }}
              className={`rounded-xl px-5 py-2.5 text-xs font-mono tracking-wider transition-all ${
                activeTab === tName
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-lg font-semibold"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              {tName} SCHEDULE
            </button>
          ))}
        </div>

        {/* Upload Success Alert */}
        {uploadSuccess && (
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-500/10 p-4 border border-emerald-500/20 text-emerald-300 text-xs">
            <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls Form */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-sky-400" />
                <span>Background Configuration for {activeTab}</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400 uppercase">
                Active in {activeTab} Schedule
              </span>
            </div>

            {/* Upload File from Device Section */}
            <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-3">
              <label className="text-slate-300 font-mono text-xs uppercase flex items-center gap-2 font-semibold">
                <FileUp className="h-4 w-4 text-sky-400" />
                <span>Option A: Upload Image/Video from Computer</span>
              </label>
              <p className="text-[11px] text-slate-400 font-light">
                Select a local background image (JPG, PNG, WEBP) or video loop (MP4, WEBM) from your system.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-sky-500/15 p-3 text-xs font-semibold text-sky-300 border border-sky-500/30 hover:bg-sky-500/25 transition-all shadow-md disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                <span>{uploading ? "Uploading File from System..." : "📁 Choose File from Computer"}</span>
              </button>
            </div>

            {/* Canvas Particle Shader Dropdown */}
            <div className="space-y-2 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <label className="text-sky-300 font-mono font-bold uppercase text-xs flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-sky-400" />
                <span>Canvas Particle Shader Type</span>
              </label>
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

            {/* Particle Count Density Slider */}
            <div className="space-y-2 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-sky-300 font-bold uppercase flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-sky-400" />
                  <span>Particle Density Slider</span>
                </span>
                <span className="text-sky-400 font-bold text-xs bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
                  {currentTheme.particleCount || 40} Particles
                </span>
              </div>
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

            {/* Custom Image or Video URL */}
            {currentTheme.backgroundType !== "gradient" && (
              <div className="space-y-2">
                <label className="text-slate-400 font-mono uppercase">
                  {currentTheme.backgroundType === "image" ? "Image Path / URL" : "Video Path / URL"}
                </label>
                <input
                  type="text"
                  value={currentTheme.backgroundUrl || ""}
                  onChange={(e) => handleUpdate("backgroundUrl", e.target.value)}
                  placeholder="/uploads/... or https://..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-white font-mono focus:border-sky-500 focus:outline-none"
                />

                {/* Quick Presets for Images */}
                {currentTheme.backgroundType === "image" && UNSPLASH_PRESETS[activeTab] && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                      Or Choose 1-Click Curated Presets:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {UNSPLASH_PRESETS[activeTab].map((preset) => (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() => {
                            handleUpdate("backgroundUrl", preset.url);
                          }}
                          className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-[11px] text-slate-300 hover:bg-sky-500/20 hover:text-sky-300 transition-colors border border-slate-700"
                        >
                          <Sparkles className="h-3 w-3 text-sky-400" />
                          <span>{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Dark Overlay Opacity */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-400 font-mono">
                <span>DARK OVERLAY OPACITY</span>
                <span>{Math.round(currentTheme.overlayOpacity * 100)}%</span>
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
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-400 font-mono">
                <span>BRIGHTNESS</span>
                <span>{Math.round(currentTheme.brightness * 100)}%</span>
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

          {/* Live Preview Panel with Live Particle Canvas Overlay */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-3">
              <h4 className="text-xs font-mono text-slate-300 uppercase tracking-widest flex items-center justify-between">
                <span>VISITOR VIEW — {activeTab} BACKGROUND</span>
                <span className="text-sky-400 font-bold">REALTIME PARTICLES</span>
              </h4>

              <div className="relative h-80 w-full overflow-hidden rounded-xl border border-white/10 bg-slate-950 flex items-center justify-center">
                {currentTheme.backgroundType === "image" && currentTheme.backgroundUrl ? (
                  <img
                    src={currentTheme.backgroundUrl}
                    alt="Background Preview"
                    className="absolute inset-0 h-full w-full object-cover transition-all duration-500"
                    style={{
                      filter: `blur(${currentTheme.blurAmount}px) brightness(${currentTheme.brightness})`,
                    }}
                  />
                ) : currentTheme.backgroundType === "video" && currentTheme.backgroundUrl ? (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{
                      filter: `blur(${currentTheme.blurAmount}px) brightness(${currentTheme.brightness})`,
                    }}
                  >
                    <source src={currentTheme.backgroundUrl} />
                  </video>
                ) : (
                  <div
                    className="absolute inset-0 h-full w-full"
                    style={{
                      background: currentTheme.gradientCss,
                      filter: `blur(${currentTheme.blurAmount}px) brightness(${currentTheme.brightness})`,
                    }}
                  />
                )}

                {/* Dark Vignette Overlay */}
                <div
                  className="absolute inset-0 z-10"
                  style={{ backgroundColor: `rgba(2, 6, 23, ${currentTheme.overlayOpacity})` }}
                />

                {/* Real-time Motion Shader Canvas Overlay */}
                <EnvironmentCanvas
                  particleType={currentTheme.particleType}
                  particleCount={currentTheme.particleCount}
                  animationSpeed={currentTheme.animationSpeed}
                  accentColor={currentTheme.accentColor}
                />

                {/* Dummy Mock Overlay to check contrast */}
                <div className="relative z-20 p-6 text-center text-white space-y-2 pointer-events-none">
                  <span className="text-[10px] font-mono tracking-widest text-slate-300 uppercase bg-slate-950/60 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                    {activeTab} TIME SCHEDULE ACTIVE
                  </span>
                  <h3 className="text-xl font-serif">Ambient Music Room</h3>
                  <p className="text-xs text-slate-300 font-light max-w-xs">
                    This background image and particle shader will be shown during {activeTab}.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
