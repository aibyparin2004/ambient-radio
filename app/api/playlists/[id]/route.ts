import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { PlaylistSchema } from "@/lib/validation";
import { extractYouTubePlaylistId, fetchYouTubePlaylistTracks } from "@/lib/youtube";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = PlaylistSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    let cleanPlaylistId = data.youtubePlaylistId;
    if (cleanPlaylistId) {
      cleanPlaylistId = extractYouTubePlaylistId(cleanPlaylistId) || cleanPlaylistId;
    }

    const updated = await db.playlist.update({
      where: { id },
      data: {
        ...data,
        ...(cleanPlaylistId !== undefined ? { youtubePlaylistId: cleanPlaylistId } : {}),
      },
      include: { songs: true },
    });

    const targetPlaylistId = cleanPlaylistId || data.youtubePlaylistId;
    if (targetPlaylistId && updated.songs.length === 0) {
      try {
        const fetchedTracks = await fetchYouTubePlaylistTracks(targetPlaylistId);
        if (fetchedTracks.length > 0) {
          await db.song.createMany({
            data: fetchedTracks.map((tr, idx) => ({
              playlistId: updated.id,
              youtubeVideoId: tr.youtubeVideoId,
              title: tr.title,
              artist: tr.artist,
              thumbnail: tr.thumbnail,
              enabled: true,
              sortOrder: idx + 1,
            })),
          });
        }
      } catch (err) {
        console.warn("YouTube Playlist tracks import warning:", err);
      }
    }

    return NextResponse.json({ success: true, playlist: updated });
  } catch (error) {
    console.error("PUT /api/playlists/[id] error:", error);
    return NextResponse.json({ error: "Failed to update playlist" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;
    await db.playlist.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Playlist deleted" });
  } catch (error) {
    console.error("DELETE /api/playlists/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete playlist" }, { status: 500 });
  }
}
