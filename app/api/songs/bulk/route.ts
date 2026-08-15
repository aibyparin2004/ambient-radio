import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { extractAllVideoIdsFromText, getYouTubeThumbnailUrl, fetchYouTubeVideoInfo } from "@/lib/youtube";

export async function POST(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { playlistId, bulkText } = await request.json();

    if (!playlistId) {
      return NextResponse.json({ error: "Playlist ID is required" }, { status: 400 });
    }

    if (!bulkText || typeof bulkText !== "string") {
      return NextResponse.json({ error: "Bulk text or links required" }, { status: 400 });
    }

    const extractedVideoIds = extractAllVideoIdsFromText(bulkText);

    if (extractedVideoIds.length === 0) {
      return NextResponse.json(
        { error: "No valid YouTube video links or video IDs found in text" },
        { status: 400 }
      );
    }

    const playlist = await db.playlist.findUnique({
      where: { id: playlistId },
      include: { songs: true },
    });

    if (!playlist) {
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
    }

    const existingVideoIds = new Set(playlist.songs.map((s) => s.youtubeVideoId));
    const newVideoIds = extractedVideoIds.filter((vId) => !existingVideoIds.has(vId));

    if (newVideoIds.length === 0) {
      return NextResponse.json({
        success: true,
        countAdded: 0,
        message: "All tracks in text are already present in this playlist.",
        totalSongs: playlist.songs.length,
      });
    }

    let currentMaxOrder = playlist.songs.reduce((max, s) => Math.max(max, s.sortOrder), 0);

    // Fetch REAL actual song titles & artist names for ALL tracks (no truncation limit!)
    const songsToInsert = await Promise.all(
      newVideoIds.map(async (vId) => {
        const info = await fetchYouTubeVideoInfo(vId);
        currentMaxOrder++;
        return {
          playlistId: playlist.id,
          youtubeVideoId: vId,
          title: info.title,
          artist: info.artist,
          thumbnail: getYouTubeThumbnailUrl(vId, "hq"),
          enabled: true,
          sortOrder: currentMaxOrder,
        };
      })
    );

    await db.song.createMany({
      data: songsToInsert,
    });

    const updatedPlaylist = await db.playlist.findUnique({
      where: { id: playlistId },
      include: { songs: { orderBy: { sortOrder: "asc" } } },
    });

    return NextResponse.json({
      success: true,
      countAdded: songsToInsert.length,
      totalSongs: updatedPlaylist?.songs.length || 0,
      playlist: updatedPlaylist,
    });
  } catch (error) {
    console.error("POST /api/songs/bulk error:", error);
    return NextResponse.json({ error: "Failed to bulk import songs" }, { status: 500 });
  }
}
