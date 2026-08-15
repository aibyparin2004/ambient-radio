import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { PlaylistSchema } from "@/lib/validation";
import { extractYouTubePlaylistId, fetchYouTubePlaylistTracks } from "@/lib/youtube";

export async function GET(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    const { searchParams } = new URL(request.url);
    const includeDisabled = searchParams.get("all") === "true" && Boolean(admin);

    const playlists = await db.playlist.findMany({
      where: includeDisabled ? {} : { enabled: true },
      orderBy: { sortOrder: "asc" },
      include: {
        songs: {
          where: includeDisabled ? {} : { enabled: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json({ success: true, playlists });
  } catch (error) {
    console.error("GET /api/playlists error:", error);
    return NextResponse.json({ error: "Failed to fetch playlists" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = PlaylistSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const cleanPlaylistId = data.youtubePlaylistId
      ? extractYouTubePlaylistId(data.youtubePlaylistId)
      : null;

    const playlist = await db.playlist.create({
      data: {
        name: data.name,
        description: data.description,
        youtubePlaylistId: cleanPlaylistId || data.youtubePlaylistId,
        coverImage: data.coverImage,
        centerText: data.centerText,
        centerSubtitle: data.centerSubtitle,
        bgImageDay: data.bgImageDay,
        bgImageNoon: data.bgImageNoon,
        bgImageEvening: data.bgImageEvening,
        bgImageNight: data.bgImageNight,
        bgVideoUrl: data.bgVideoUrl,
        enabled: data.enabled,
        sortOrder: data.sortOrder,
      },
    });

    // Automatically import tracks if YouTube Playlist ID/URL is provided
    const targetPlaylistId = cleanPlaylistId || data.youtubePlaylistId;
    if (targetPlaylistId) {
      try {
        const fetchedTracks = await fetchYouTubePlaylistTracks(targetPlaylistId);
        if (fetchedTracks.length > 0) {
          await db.song.createMany({
            data: fetchedTracks.map((tr, idx) => ({
              playlistId: playlist.id,
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

    return NextResponse.json({ success: true, playlist });
  } catch (error) {
    console.error("POST /api/playlists error:", error);
    return NextResponse.json({ error: "Failed to create playlist" }, { status: 500 });
  }
}
