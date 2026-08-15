import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { fetchYouTubePlaylistTracks } from "@/lib/youtube";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;
    const playlist = await db.playlist.findUnique({
      where: { id },
      include: { songs: true },
    });

    if (!playlist) {
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
    }

    if (!playlist.youtubePlaylistId) {
      return NextResponse.json(
        { error: "No YouTube Playlist ID associated with this playlist" },
        { status: 400 }
      );
    }

    const fetchedTracks = await fetchYouTubePlaylistTracks(playlist.youtubePlaylistId);

    if (fetchedTracks.length === 0) {
      return NextResponse.json(
        { error: "Could not fetch tracks from YouTube playlist. Make sure the playlist is public." },
        { status: 400 }
      );
    }

    // Get existing YouTube Video IDs in playlist to prevent duplicates
    const existingVideoIds = new Set(playlist.songs.map((s) => s.youtubeVideoId));
    const newTracksToInsert = fetchedTracks.filter((tr) => !existingVideoIds.has(tr.youtubeVideoId));

    let currentMaxOrder = playlist.songs.reduce((max, s) => Math.max(max, s.sortOrder), 0);

    if (newTracksToInsert.length > 0) {
      await db.song.createMany({
        data: newTracksToInsert.map((tr) => {
          currentMaxOrder++;
          return {
            playlistId: playlist.id,
            youtubeVideoId: tr.youtubeVideoId,
            title: tr.title,
            artist: tr.artist,
            thumbnail: tr.thumbnail,
            enabled: true,
            sortOrder: currentMaxOrder,
          };
        }),
      });
    }

    const updatedPlaylist = await db.playlist.findUnique({
      where: { id },
      include: { songs: { orderBy: { sortOrder: "asc" } } },
    });

    return NextResponse.json({
      success: true,
      countAdded: newTracksToInsert.length,
      totalSongs: updatedPlaylist?.songs.length || 0,
      playlist: updatedPlaylist,
    });
  } catch (error) {
    console.error("POST /api/playlists/[id]/sync error:", error);
    return NextResponse.json({ error: "Failed to sync YouTube playlist tracks" }, { status: 500 });
  }
}
