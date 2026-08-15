import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { ThemeConfigSchema } from "@/lib/validation";
import { DEFAULT_THEME_PRESETS } from "@/lib/environment-engine";

export async function GET() {
  try {
    let themes = await db.themeConfig.findMany();

    // If empty in database, seed default theme presets automatically
    if (!themes || themes.length === 0) {
      const presets = Object.values(DEFAULT_THEME_PRESETS);
      await Promise.all(
        presets.map((preset) =>
          db.themeConfig.create({
            data: preset,
          })
        )
      );
      themes = await db.themeConfig.findMany();
    }

    return NextResponse.json({ success: true, themes });
  } catch (error) {
    console.error("GET /api/themes error:", error);
    return NextResponse.json({ error: "Failed to fetch themes" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = ThemeConfigSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const updated = await db.themeConfig.upsert({
      where: { name: data.name },
      update: data,
      create: data,
    });

    return NextResponse.json({ success: true, theme: updated });
  } catch (error) {
    console.error("PUT /api/themes error:", error);
    return NextResponse.json({ error: "Failed to update theme config" }, { status: 500 });
  }
}
