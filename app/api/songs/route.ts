import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { SongSchema } from "@/lib/validation";
import { extractYouTubeVideoId, getYouTubeThumbnailUrl } from "@/lib/youtube";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const playlistId = searchParams.get("playlistId");
    const admin = await getAuthenticatedAdmin();

    const songs = await db.song.findMany({
      where: {
        ...(playlistId ? { playlistId } : {}),
        ...(admin ? {} : { enabled: true }),
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ success: true, songs });
  } catch (error) {
    console.error("GET /api/songs error:", error);
    return NextResponse.json({ error: "Failed to fetch songs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = SongSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const cleanVideoId = extractYouTubeVideoId(data.youtubeVideoId);

    if (!cleanVideoId) {
      return NextResponse.json(
        { error: "Invalid YouTube Video URL or Video ID" },
        { status: 400 }
      );
    }

    const thumbnail = data.thumbnail || getYouTubeThumbnailUrl(cleanVideoId, "hq");

    const song = await db.song.create({
      data: {
        playlistId: data.playlistId,
        youtubeVideoId: cleanVideoId,
        title: data.title,
        artist: data.artist || "Unknown Artist",
        thumbnail: thumbnail,
        enabled: data.enabled,
        sortOrder: data.sortOrder,
      },
    });

    return NextResponse.json({ success: true, song });
  } catch (error) {
    console.error("POST /api/songs error:", error);
    return NextResponse.json({ error: "Failed to create song" }, { status: 500 });
  }
}
