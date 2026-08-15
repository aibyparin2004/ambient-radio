"use client";

import React, { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Music, Plus, Edit2, Trash2, X, ExternalLink, FileText, Download, Sparkles } from "lucide-react";

interface Song {
  id: string;
  playlistId: string;
  youtubeVideoId: string;
  title: string;
  artist?: string | null;
  thumbnail?: string | null;
  enabled: boolean;
  sortOrder: number;
}

interface Playlist {
  id: string;
  name: string;
}

export default function AdminSongsPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);

  const [formData, setFormData] = useState({
    playlistId: "",
    youtubeVideoId: "",
    title: "",
    artist: "",
    thumbnail: "",
    enabled: true,
    sortOrder: 0,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [pRes, sRes] = await Promise.all([
        fetch("/api/playlists?all=true"),
        fetch("/api/songs"),
      ]);
      const pData = await pRes.json();
      const sData = await sRes.json();

      if (pData.playlists) {
        setPlaylists(pData.playlists);
        if (pData.playlists.length > 0 && !selectedPlaylistId) {
          setSelectedPlaylistId(pData.playlists[0].id);
        }
      }
      if (sData.songs) setSongs(sData.songs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredSongs = selectedPlaylistId
    ? songs.filter((s) => s.playlistId === selectedPlaylistId)
    : songs;

  const openCreateModal = () => {
    setEditingSong(null);
    setFormData({
      playlistId: selectedPlaylistId || (playlists[0]?.id || ""),
      youtubeVideoId: "",
      title: "",
      artist: "",
      thumbnail: "",
      enabled: true,
      sortOrder: filteredSongs.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (s: Song) => {
    setEditingSong(s);
    setFormData({
      playlistId: s.playlistId,
      youtubeVideoId: s.youtubeVideoId,
      title: s.title,
      artist: s.artist || "",
      thumbnail: s.thumbnail || "",
      enabled: s.enabled,
      sortOrder: s.sortOrder,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingSong ? `/api/songs/${editingSong.id}` : "/api/songs";
      const method = editingSong ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        loadData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save track");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this track?")) return;
    try {
      const res = await fetch(`/api/songs/${id}`, { method: "DELETE" });
      if (res.ok) loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkImporting, setBulkImporting] = useState(false);

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) return;
    setBulkImporting(true);
    try {
      const res = await fetch("/api/songs/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playlistId: selectedPlaylistId || playlists[0]?.id,
          bulkText,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`✔ Success! Imported ${data.countAdded} new tracks! Total tracks in playlist: ${data.totalSongs}`);
        setIsBulkModalOpen(false);
        setBulkText("");
        loadData();
      } else {
        alert(data.error || "Failed to bulk import songs");
      }
    } catch (err) {
      console.error("Bulk import error:", err);
      alert("Network error while bulk importing songs");
    } finally {
      setBulkImporting(false);
    }
  };

  const [cleaningTitles, setCleaningTitles] = useState(false);

  const handleCleanTitles = async () => {
    setCleaningTitles(true);
    try {
      const res = await fetch("/api/songs/clean-titles", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        alert(`✔ Success! ${data.message}`);
        loadData();
      } else {
        alert(data.error || "Failed to clean song titles");
      }
    } catch (e) {
      console.error(e);
      alert("Network error while cleaning song titles");
    } finally {
      setCleaningTitles(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-serif font-light text-white">Song Manager</h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Add and organize YouTube audio tracks in playlists
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCleanTitles}
              disabled={cleaningTitles}
              title="Fetch and replace all 'Track #...' with actual YouTube song titles & artists"
              className="flex items-center gap-2 rounded-xl bg-purple-500/20 px-4 py-2.5 text-xs font-semibold text-purple-300 hover:bg-purple-500/30 border border-purple-500/30 transition-colors disabled:opacity-50"
            >
              <Sparkles className={`h-4 w-4 ${cleaningTitles ? "animate-spin" : ""}`} />
              <span>{cleaningTitles ? "Fetching Real Titles..." : "🪄 Fetch Real Song Titles & Artists"}</span>
            </button>

            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-500/20 px-4 py-2.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>📥 Bulk Import 50+ YouTube Links</span>
            </button>

            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-xs font-semibold text-slate-950 hover:bg-sky-400 transition-colors shadow-lg shadow-sky-500/20"
            >
              <Plus className="h-4 w-4" />
              <span>Add YouTube Song</span>
            </button>
          </div>
        </div>

        {/* Playlist Filter Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {playlists.map((pl) => (
            <button
              key={pl.id}
              onClick={() => setSelectedPlaylistId(pl.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-mono transition-colors ${
                selectedPlaylistId === pl.id
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              {pl.name}
            </button>
          ))}
        </div>

        {/* Song List Table */}
        {loading ? (
          <div className="text-sm text-slate-500 font-mono py-12 text-center">Loading tracks...</div>
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase border-b border-slate-800">
                <tr>
                  <th className="p-4">#</th>
                  <th className="p-4">Track</th>
                  <th className="p-4">Artist</th>
                  <th className="p-4">YouTube ID</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredSongs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 font-light">
                      No songs in this playlist yet. Click "Add YouTube Song" above.
                    </td>
                  </tr>
                ) : (
                  filteredSongs.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-mono text-slate-500">{idx + 1}</td>
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={s.thumbnail || `https://img.youtube.com/vi/${s.youtubeVideoId}/hqdefault.jpg`}
                          alt={s.title}
                          className="h-10 w-10 rounded-lg object-cover bg-slate-800 border border-slate-700"
                        />
                        <span className="font-medium text-white line-clamp-1">{s.title}</span>
                      </td>
                      <td className="p-4 text-slate-300">{s.artist || "Unknown"}</td>
                      <td className="p-4 font-mono text-slate-400">
                        <a
                          href={`https://youtube.com/watch?v=${s.youtubeVideoId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-sky-400 flex items-center gap-1"
                        >
                          <span>{s.youtubeVideoId}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 font-mono text-[10px] ${
                            s.enabled
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {s.enabled ? "ACTIVE" : "OFF"}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(s)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
            <div className="w-full max-w-lg rounded-3xl bg-slate-900 p-6 border border-slate-800 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <h3 className="text-lg font-serif text-white">
                  {editingSong ? "Edit Song" : "Add YouTube Song"}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="rounded-full p-1 text-slate-400">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-400 font-mono uppercase">Playlist</label>
                  <select
                    value={formData.playlistId}
                    onChange={(e) => setFormData({ ...formData, playlistId: e.target.value })}
                    className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-white focus:border-sky-500 focus:outline-none"
                  >
                    {playlists.map((pl) => (
                      <option key={pl.id} value={pl.id}>
                        {pl.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-mono uppercase">
                    YouTube Video URL or ID
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.youtubeVideoId}
                    onChange={(e) => setFormData({ ...formData, youtubeVideoId: e.target.value })}
                    placeholder="e.g. https://www.youtube.com/watch?v=jfKfPfyJRdk or jfKfPfyJRdk"
                    className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-white focus:border-sky-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-mono uppercase">Song Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Track Title"
                    className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-mono uppercase">Artist Name</label>
                  <input
                    type="text"
                    value={formData.artist}
                    onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                    placeholder="Artist Name"
                    className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="songEnabled"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-sky-500"
                  />
                  <label htmlFor="songEnabled" className="text-slate-300 font-mono">
                    Enable Song in Queue
                  </label>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl px-4 py-2.5 bg-slate-800 text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl px-5 py-2.5 bg-sky-500 text-slate-950 font-semibold hover:bg-sky-400"
                  >
                    Save Track
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Bulk Import Songs Modal */}
        {isBulkModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
            <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-lg font-semibold text-white">Bulk Import 50+ YouTube Songs</h3>
                </div>
                <button onClick={() => setIsBulkModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleBulkImport} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-300 font-mono uppercase block mb-1">Select Target Playlist</label>
                  <select
                    value={selectedPlaylistId}
                    onChange={(e) => setSelectedPlaylistId(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-white font-mono focus:border-sky-500 focus:outline-none"
                  >
                    {playlists.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-mono uppercase block mb-1">
                    Paste YouTube Links / Playlist Text (Paste 50, 100+ Links)
                  </label>
                  <textarea
                    rows={8}
                    required
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    placeholder="Paste multiple YouTube video URLs, playlist page text, or video IDs here:&#10;https://www.youtube.com/watch?v=VIDEO_1&#10;https://www.youtube.com/watch?v=VIDEO_2&#10;https://youtu.be/VIDEO_3..."
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-white font-mono leading-relaxed focus:border-sky-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Tip: Our extractor automatically finds and imports ALL YouTube video IDs from any pasted links or text!
                  </p>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsBulkModalOpen(false)}
                    className="rounded-xl px-4 py-2.5 bg-slate-800 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bulkImporting}
                    className="flex items-center gap-2 rounded-xl px-5 py-2.5 bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" />
                    <span>{bulkImporting ? "Importing All Songs..." : "Import All Songs Now"}</span>
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
