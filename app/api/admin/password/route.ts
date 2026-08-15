import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PUT(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { currentPassword, newUsername, newPassword } = await request.json();

    if (!currentPassword) {
      return NextResponse.json({ error: "Current password is required" }, { status: 400 });
    }

    // Find admin user record
    const user = await db.adminUser.findUnique({
      where: { username: admin.username },
    });

    if (!user) {
      return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
    }

    // Prepare update data
    const updateData: { username?: string; passwordHash?: string } = {};

    if (newUsername && newUsername.trim() !== "" && newUsername !== user.username) {
      const existingUser = await db.adminUser.findUnique({
        where: { username: newUsername.trim() },
      });
      if (existingUser && existingUser.id !== user.id) {
        return NextResponse.json({ error: "Username is already in use" }, { status: 400 });
      }
      updateData.username = newUsername.trim();
    }

    if (newPassword && newPassword.trim() !== "") {
      if (newPassword.length < 6) {
        return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
      }
      updateData.passwordHash = await bcrypt.hash(newPassword.trim(), 10);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No changes provided" }, { status: 400 });
    }

    await db.adminUser.update({
      where: { id: user.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Admin credentials updated successfully! Please use your new login credentials next time.",
      username: updateData.username || user.username,
    });
  } catch (error) {
    console.error("PUT /api/admin/password error:", error);
    return NextResponse.json({ error: "Failed to update admin credentials" }, { status: 500 });
  }
}
