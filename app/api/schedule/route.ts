import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { ScheduleSchema } from "@/lib/validation";

export async function GET() {
  try {
    const schedule = await db.themeSchedule.findMany();
    return NextResponse.json({ success: true, schedule });
  } catch (error) {
    console.error("GET /api/schedule error:", error);
    return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = ScheduleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const scheduleItems = parsed.data;

    const results = [];
    for (const item of scheduleItems) {
      const updated = await db.themeSchedule.upsert({
        where: { themeName: item.themeName },
        update: {
          startTime: item.startTime,
          endTime: item.endTime,
          enabled: item.enabled,
        },
        create: {
          themeName: item.themeName,
          startTime: item.startTime,
          endTime: item.endTime,
          enabled: item.enabled,
        },
      });
      results.push(updated);
    }

    return NextResponse.json({ success: true, schedule: results });
  } catch (error) {
    console.error("PUT /api/schedule error:", error);
    return NextResponse.json({ error: "Failed to update schedule" }, { status: 500 });
  }
}
