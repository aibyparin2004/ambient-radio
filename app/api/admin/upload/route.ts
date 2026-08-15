import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "video/mp4",
  "video/webm",
]);

const MAX_FILE_SIZE = 4.5 * 1024 * 1024; // 4.5 MB Optimal limit for Serverless & Base64

export async function POST(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 4.5MB limit. Please compress image or paste image/video URL." },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Only JPG, PNG, WEBP, AVIF, MP4, WEBM allowed." },
        { status: 400 }
      );
    }

    // Determine extension
    const extParts = file.name.split(".");
    const originalExt = extParts.length > 1 ? extParts.pop()?.toLowerCase() : "jpg";
    const safeExt = ["jpg", "jpeg", "png", "webp", "avif", "mp4", "webm"].includes(originalExt || "")
      ? originalExt
      : "jpg";

    const randomName = `${Date.now()}_${crypto.randomBytes(6).toString("hex")}.${safeExt}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let publicUrl = "";

    // 1. Try local filesystem write (Works in Local Dev)
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, randomName);
      await writeFile(filePath, buffer);
      publicUrl = `/uploads/${randomName}`;
    } catch (fsErr) {
      // 2. Netlify / Vercel Serverless Read-Only Disk Fallback: Convert to Base64 Data URL
      console.warn("Serverless read-only disk detected (Netlify). Falling back to Base64 Data URL encoding.");
      const base64Str = buffer.toString("base64");
      publicUrl = `data:${file.type};base64,${base64Str}`;
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: file.name,
      fileType: file.type.startsWith("video/") ? "video" : "image",
    });
  } catch (error) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }
}
