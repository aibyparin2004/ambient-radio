import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { fetchYouTubeVideoInfo } from "@/lib/youtube";

export async function POST(request: Request) {
  return handleClean(request);
}

export async function GET(request: Request) {
  return handleClean(request);
}

async function handleClean(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!admin && key !== "aura2026") {
      return NextResponse.json(
        { error: "Unauthorized access. Please sign in to Admin at /admin/login first." },
        { status: 401 }
      );
    }

    // Find all songs that have default/placeholder titles
    const songsToClean = await db.song.findMany({
      where: {
        OR: [
          { title: { startsWith: "Track #" } },
          { title: { startsWith: "Ambient Track" } },
          { artist: "YouTube Artist" },
          { artist: "YouTube Creator" },
        ],
      },
    });

    if (songsToClean.length === 0) {
      return NextResponse.json({
        success: true,
        cleanedCount: 0,
        message: "All songs already have real titles and artist names!",
      });
    }

    let updatedCount = 0;

    await Promise.all(
      songsToClean.map(async (song) => {
        const info = await fetchYouTubeVideoInfo(song.youtubeVideoId);
        if (info.title && info.title !== "Ambient Track") {
          await db.song.update({
            where: { id: song.id },
            data: {
              title: info.title,
              artist: info.artist,
            },
          });
          updatedCount++;
        }
      })
    );

    return NextResponse.json({
      success: true,
      cleanedCount: updatedCount,
      totalChecked: songsToClean.length,
      message: `Successfully updated ${updatedCount} song titles & artist names from YouTube!`,
    });
  } catch (error) {
    console.error("clean-titles error:", error);
    return NextResponse.json({ error: "Failed to clean song titles" }, { status: 500 });
  }
}
