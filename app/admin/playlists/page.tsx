"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Disc3, Plus, Edit2, Trash2, Music, X, Sparkles, Image as ImageIcon, Upload } from "lucide-react";

import { compressImageFile } from "@/lib/client-image-compressor";

interface Playlist {
  id: string;
  name: string;
  description?: string | null;
  youtubePlaylistId?: string | null;
  coverImage?: string | null;
  centerText?: string | null;
  centerSubtitle?: string | null;
  bgImageDay?: string | null;
  bgImageNoon?: string | null;
  bgImageEvening?: string | null;
  bgImageNight?: string | null;
  bgVideoUrl?: string | null;
  enabled: boolean;
  sortOrder: number;
  songs?: any[];
}

export default function AdminPlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);

  // Quick Add Track Modal State
  const [isSongModalOpen, setIsSongModalOpen] = useState(false);
  const [selectedPlaylistForSong, setSelectedPlaylistForSong] = useState<string>("");
  const [songData, setSongData] = useState({
    youtubeVideoId: "",
    title: "",
    artist: "",
  });

  // Playlist Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    youtubePlaylistId: "",
    coverImage: "",
    centerText: "અર્બન ગુજરાતી",
    centerSubtitle: "URBAN GUJARATI AMBIENT RADIO • OPEN ALL HOURS",
    bgImageDay: "",
    bgImageNoon: "",
    bgImageEvening: "",
    bgImageNight: "",
    bgVideoUrl: "",
    enabled: true,
    sortOrder: 0,
  });

  const fileInputRefCover = useRef<HTMLInputElement | null>(null);
  const fileInputRefDay = useRef<HTMLInputElement | null>(null);
  const fileInputRefNoon = useRef<HTMLInputElement | null>(null);
  const fileInputRefEvening = useRef<HTMLInputElement | null>(null);
  const fileInputRefNight = useRef<HTMLInputElement | null>(null);

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/playlists?all=true");
      const data = await res.json();
      if (data.playlists) setPlaylists(data.playlists);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaylists();
  }, []);

  const openCreateModal = () => {
    setEditingPlaylist(null);
    setFormData({
      name: "",
      description: "",
      youtubePlaylistId: "",
      coverImage: "",
      centerText: "અર્બન ગુજરાતી",
      centerSubtitle: "URBAN GUJARATI AMBIENT RADIO • OPEN ALL HOURS",
      bgImageDay: "",
      bgImageNoon: "",
      bgImageEvening: "",
      bgImageNight: "",
      bgVideoUrl: "",
      enabled: true,
      sortOrder: playlists.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (pl: Playlist) => {
    setEditingPlaylist(pl);
    setFormData({
      name: pl.name,
      description: pl.description || "",
      youtubePlaylistId: pl.youtubePlaylistId || "",
      coverImage: pl.coverImage || "",
      centerText: pl.centerText || "અર્બન ગુજરાતી",
      centerSubtitle: pl.centerSubtitle || "URBAN GUJARATI AMBIENT RADIO • OPEN ALL HOURS",
      bgImageDay: pl.bgImageDay || "",
      bgImageNoon: pl.bgImageNoon || "",
      bgImageEvening: pl.bgImageEvening || "",
      bgImageNight: pl.bgImageNight || "",
      bgVideoUrl: pl.bgVideoUrl || "",
      enabled: pl.enabled,
      sortOrder: pl.sortOrder,
    });
    setIsModalOpen(true);
  };

  // Upload Local File for specific field from system with automatic canvas compression
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingField(fieldName);

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

      setFormData((prev) => ({
        ...prev,
        [fieldName]: data.url,
      }));
    } catch (err) {
      console.error("Upload error:", err);
      alert("Network error while uploading file");
    } finally {
      setUploadingField(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingPlaylist ? `/api/playlists/${editingPlaylist.id}` : "/api/playlists";
      const method = editingPlaylist ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setIsModalOpen(false);
        await loadPlaylists();
      } else {
        alert(data.error || data.message || "Failed to save playlist. Image size might be too large.");
      }
    } catch (e) {
      console.error(e);
      alert("Network error while saving playlist.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this playlist?")) return;
    try {
      const res = await fetch(`/api/playlists/${id}`, { method: "DELETE" });
      if (res.ok) loadPlaylists();
    } catch (e) {
      console.error(e);
    }
  };

  // Quick Add Track Handler
  const handleQuickAddSong = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playlistId: selectedPlaylistForSong,
          youtubeVideoId: songData.youtubeVideoId,
          title: songData.title,
          artist: songData.artist,
          enabled: true,
        }),
      });

      if (res.ok) {
        setIsSongModalOpen(false);
        setSongData({ youtubeVideoId: "", title: "", artist: "" });
        loadPlaylists();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to add song");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-serif font-light text-white">Playlist Manager & Backgrounds</h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Set custom background schedules and centerpiece text per playlist
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-xs font-semibold text-slate-950 hover:bg-sky-400 transition-colors shadow-lg shadow-sky-500/20"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Playlist</span>
          </button>
        </div>

        {/* Playlist Cards */}
        {loading ? (
          <div className="text-sm text-slate-500 font-mono py-12 text-center">Loading playlists...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {playlists.map((pl) => (
              <div
                key={pl.id}
                className="flex flex-col justify-between rounded-2xl bg-slate-900/60 p-5 border border-slate-800 space-y-4 shadow-xl"
              >
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded-xl bg-slate-800 border border-slate-700 flex-shrink-0">
                    {pl.coverImage ? (
                      <img src={pl.coverImage} alt={pl.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-500">
                        <Disc3 className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white truncate">{pl.name}</h3>
                    <p className="text-xs text-amber-300 font-serif line-clamp-1 mt-0.5 font-bold">
                      Center Title: {pl.centerText || "અર્બન ગુજરાતી"}
                    </p>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {pl.description || "No description provided"}
                    </p>
                    <span className="inline-block text-[11px] font-mono text-sky-400 mt-1">
                      {pl.songs?.length || 0} tracks
                    </span>
                  </div>
                </div>

                {/* Quick Track Action Bar */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/40">
                  <button
                    onClick={() => {
                      setSelectedPlaylistForSong(pl.id);
                      setIsSongModalOpen(true);
                    }}
                    className="flex items-center gap-1 text-[11px] font-medium text-sky-400 hover:text-sky-300 bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/20"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Track</span>
                  </button>

                  <Link
                    href={`/admin/songs`}
                    className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-white bg-slate-800 px-2.5 py-1 rounded-lg"
                  >
                    <Music className="h-3 w-3" />
                    <span>Manage Tracks ({pl.songs?.length || 0})</span>
                  </Link>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px] ${
                      pl.enabled
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }`}
                  >
                    {pl.enabled ? "ACTIVE" : "DISABLED"}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(pl)}
                      className="flex items-center gap-1 text-[11px] bg-slate-800 px-2.5 py-1 rounded-lg text-slate-300 hover:text-white transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span>Edit & Backgrounds</span>
                    </button>
                    <button
                      onClick={() => handleDelete(pl.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Playlist Modal Form with Backgrounds & System File Pickers */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 p-6 border border-slate-800 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <h3 className="text-lg font-serif text-white">
                  {editingPlaylist ? `Edit Playlist: ${editingPlaylist.name}` : "Create New Playlist"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full p-1 text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-6 text-xs">
                {/* 1. Basic Info */}
                <div className="space-y-4 rounded-2xl bg-slate-950 p-4 border border-slate-800">
                  <h4 className="text-xs font-mono text-sky-400 uppercase tracking-wider font-semibold">
                    1. Basic Playlist Info
                  </h4>

                  <div>
                    <label className="text-slate-400 font-mono uppercase">Playlist Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Urban Gujarati Beats"
                      className="mt-1 w-full rounded-xl bg-slate-900 border border-slate-800 p-3 text-white focus:border-sky-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-mono uppercase">YouTube Playlist URL or ID (Optional)</label>
                    <input
                      type="text"
                      value={formData.youtubePlaylistId}
                      onChange={(e) => setFormData({ ...formData, youtubePlaylistId: e.target.value })}
                      placeholder="e.g. https://www.youtube.com/playlist?list=PL..."
                      className="mt-1 w-full rounded-xl bg-slate-900 border border-slate-800 p-3 text-white focus:border-sky-500 focus:outline-none font-mono"
                    />
                  </div>

                  {/* Playlist Cover Image with System File Upload */}
                  <div>
                    <label className="text-slate-400 font-mono uppercase">Playlist Cover Image</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        value={formData.coverImage}
                        onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                        placeholder="/uploads/... or https://..."
                        className="flex-1 rounded-xl bg-slate-900 border border-slate-800 p-3 text-white focus:border-sky-500 focus:outline-none font-mono"
                      />
                      <input
                        ref={fileInputRefCover}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "coverImage")}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRefCover.current?.click()}
                        className="flex items-center gap-1.5 rounded-xl bg-sky-500/20 text-sky-300 px-3.5 py-3 border border-sky-500/30 hover:bg-sky-500/30 font-semibold flex-shrink-0"
                      >
                        <Upload className="h-4 w-4" />
                        <span>{uploadingField === "coverImage" ? "Uploading..." : "📁 Choose File from System"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Custom Centerpiece Title & Subtitle */}
                <div className="space-y-4 rounded-2xl bg-slate-950 p-4 border border-slate-800">
                  <h4 className="text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span>2. Centerpiece Text (Shown when visitor selects this playlist)</span>
                  </h4>

                  <div>
                    <label className="text-slate-400 font-mono uppercase">Centerpiece Title Text</label>
                    <input
                      type="text"
                      value={formData.centerText}
                      onChange={(e) => setFormData({ ...formData, centerText: e.target.value })}
                      placeholder="e.g. અર્બન ગુજરાતી"
                      className="mt-1 w-full rounded-xl bg-slate-900 border border-slate-800 p-3 text-white font-serif text-lg focus:border-sky-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-mono uppercase">Centerpiece Subtitle</label>
                    <input
                      type="text"
                      value={formData.centerSubtitle}
                      onChange={(e) => setFormData({ ...formData, centerSubtitle: e.target.value })}
                      placeholder="e.g. URBAN GUJARATI AMBIENT RADIO • OPEN ALL HOURS"
                      className="mt-1 w-full rounded-xl bg-slate-900 border border-slate-800 p-3 text-white font-mono focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* 3. Schedule Backgrounds for THIS Playlist with 📁 Choose File from System buttons */}
                <div className="space-y-4 rounded-2xl bg-slate-950 p-4 border border-slate-800">
                  <h4 className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-semibold flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-emerald-400" />
                    <span>3. Schedule Background Images for THIS Playlist</span>
                  </h4>

                  {/* Day Background */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <label className="text-slate-300 font-mono text-[11px] uppercase block">
                      ☀️ DAY Schedule Background Image/Video
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={formData.bgImageDay}
                        onChange={(e) => setFormData({ ...formData, bgImageDay: e.target.value })}
                        placeholder="/uploads/... or https://..."
                        className="flex-1 rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-white font-mono"
                      />
                      <input
                        ref={fileInputRefDay}
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => handleFileUpload(e, "bgImageDay")}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRefDay.current?.click()}
                        className="flex items-center gap-1.5 rounded-xl bg-sky-500/20 text-sky-300 px-3.5 py-2.5 border border-sky-500/30 hover:bg-sky-500/30 font-semibold"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>{uploadingField === "bgImageDay" ? "Uploading..." : "📁 Choose File from System"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Noon Background */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <label className="text-slate-300 font-mono text-[11px] uppercase block">
                      🌤️ NOON Schedule Background Image/Video
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={formData.bgImageNoon}
                        onChange={(e) => setFormData({ ...formData, bgImageNoon: e.target.value })}
                        placeholder="/uploads/... or https://..."
                        className="flex-1 rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-white font-mono"
                      />
                      <input
                        ref={fileInputRefNoon}
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => handleFileUpload(e, "bgImageNoon")}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRefNoon.current?.click()}
                        className="flex items-center gap-1.5 rounded-xl bg-sky-500/20 text-sky-300 px-3.5 py-2.5 border border-sky-500/30 hover:bg-sky-500/30 font-semibold"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>{uploadingField === "bgImageNoon" ? "Uploading..." : "📁 Choose File from System"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Evening Background */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <label className="text-slate-300 font-mono text-[11px] uppercase block">
                      ... EVENING Schedule Background Image/Video
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={formData.bgImageEvening}
                        onChange={(e) => setFormData({ ...formData, bgImageEvening: e.target.value })}
                        placeholder="/uploads/... or https://..."
                        className="flex-1 rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-white font-mono"
                      />
                      <input
                        ref={fileInputRefEvening}
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => handleFileUpload(e, "bgImageEvening")}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRefEvening.current?.click()}
                        className="flex items-center gap-1.5 rounded-xl bg-sky-500/20 text-sky-300 px-3.5 py-2.5 border border-sky-500/30 hover:bg-sky-500/30 font-semibold"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>{uploadingField === "bgImageEvening" ? "Uploading..." : "📁 Choose File from System"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Night Background */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <label className="text-slate-300 font-mono text-[11px] uppercase block">
                      🌙 NIGHT Schedule Background Image/Video
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={formData.bgImageNight}
                        onChange={(e) => setFormData({ ...formData, bgImageNight: e.target.value })}
                        placeholder="/uploads/... or https://..."
                        className="flex-1 rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-white font-mono"
                      />
                      <input
                        ref={fileInputRefNight}
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => handleFileUpload(e, "bgImageNight")}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRefNight.current?.click()}
                        className="flex items-center gap-1.5 rounded-xl bg-sky-500/20 text-sky-300 px-3.5 py-2.5 border border-sky-500/30 hover:bg-sky-500/30 font-semibold"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>{uploadingField === "bgImageNight" ? "Uploading..." : "📁 Choose File from System"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="enabled"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-sky-500"
                  />
                  <label htmlFor="enabled" className="text-slate-300 font-mono">
                    Enable Playlist (Visible to visitors)
                  </label>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl px-4 py-2.5 bg-slate-800 text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl px-5 py-2.5 bg-sky-500 text-slate-950 font-semibold hover:bg-sky-400 disabled:opacity-50"
                  >
                    {saving ? "Saving Playlist & Backgrounds..." : "Save Playlist & Backgrounds"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Quick Add Song Modal */}
        {isSongModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
            <div className="w-full max-w-md rounded-3xl bg-slate-900 p-6 border border-slate-800 shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-serif text-white">Add Track to Playlist</h3>
                <button onClick={() => setIsSongModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleQuickAddSong} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-400 font-mono uppercase">YouTube Video URL or ID</label>
                  <input
                    type="text"
                    required
                    value={songData.youtubeVideoId}
                    onChange={(e) => setSongData({ ...songData, youtubeVideoId: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-white focus:border-sky-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-mono uppercase">Song Title</label>
                  <input
                    type="text"
                    required
                    value={songData.title}
                    onChange={(e) => setSongData({ ...songData, title: e.target.value })}
                    placeholder="Title"
                    className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-mono uppercase">Artist Name</label>
                  <input
                    type="text"
                    value={songData.artist}
                    onChange={(e) => setSongData({ ...songData, artist: e.target.value })}
                    placeholder="Artist"
                    className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSongModalOpen(false)}
                    className="rounded-xl px-4 py-2 bg-slate-800 text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl px-5 py-2 bg-sky-500 text-slate-950 font-semibold hover:bg-sky-400"
                  >
                    Add Track
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
