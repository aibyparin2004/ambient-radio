import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { SongSchema } from "@/lib/validation";
import { extractYouTubeVideoId, getYouTubeThumbnailUrl } from "@/lib/youtube";

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
    const parsed = SongSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    let cleanVideoId = data.youtubeVideoId;
    let thumbnail = data.thumbnail;

    if (cleanVideoId) {
      const extracted = extractYouTubeVideoId(cleanVideoId);
      if (extracted) {
        cleanVideoId = extracted;
        if (!thumbnail) thumbnail = getYouTubeThumbnailUrl(extracted, "hq");
      }
    }

    const updated = await db.song.update({
      where: { id },
      data: {
        ...data,
        ...(cleanVideoId ? { youtubeVideoId: cleanVideoId } : {}),
        ...(thumbnail ? { thumbnail } : {}),
      },
    });

    return NextResponse.json({ success: true, song: updated });
  } catch (error) {
    console.error("PUT /api/songs/[id] error:", error);
    return NextResponse.json({ error: "Failed to update song" }, { status: 500 });
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
    await db.song.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Song deleted" });
  } catch (error) {
    console.error("DELETE /api/songs/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete song" }, { status: 500 });
  }
}
