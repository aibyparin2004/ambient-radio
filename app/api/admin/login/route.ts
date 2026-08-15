import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, createSessionToken, setAuthCookieHeader } from "@/lib/auth";
import { LoginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid credentials format", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { username, password } = parsed.data;

    const admin = await db.adminUser.findUnique({
      where: { username },
    });

    if (!admin) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const passwordValid = await verifyPassword(password, admin.passwordHash);
    if (!passwordValid) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const token = await createSessionToken({
      userId: admin.id,
      username: admin.username,
    });

    const response = NextResponse.json({
      success: true,
      user: { id: admin.id, username: admin.username },
    });

    response.headers.set("Set-Cookie", setAuthCookieHeader(token));
    return response;
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
