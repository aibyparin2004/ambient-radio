"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Disc3,
  Music,
  Image as ImageIcon,
  Palette,
  Clock,
  Settings,
  Shield,
  LogOut,
  ExternalLink,
  Key,
  X,
  Lock,
  UserCheck,
} from "lucide-react";

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [securityData, setSecurityData] = useState({
    newUsername: "admin",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!securityData.currentPassword) {
      alert("Please enter your current password.");
      return;
    }
    if (securityData.newPassword && securityData.newPassword !== securityData.confirmPassword) {
      alert("New password and confirm password do not match.");
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await fetch("/api/admin/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: securityData.currentPassword,
          newUsername: securityData.newUsername,
          newPassword: securityData.newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("✔ Success! Admin credentials updated. Please use your new login credentials next time.");
        setIsPasswordModalOpen(false);
        setSecurityData({
          newUsername: data.username || securityData.newUsername,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        alert(data.error || "Failed to update admin credentials.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error while updating credentials.");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const navItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Playlists", href: "/admin/playlists", icon: Disc3 },
    { name: "Songs", href: "/admin/songs", icon: Music },
    { name: "Backgrounds", href: "/admin/backgrounds", icon: ImageIcon },
    { name: "Themes", href: "/admin/themes", icon: Palette },
    { name: "Schedule", href: "/admin/schedule", icon: Clock },
    { name: "Settings", href: "/admin/settings", icon: Settings },
    { name: "Security & Password", href: "/admin/security", icon: Key },
  ];

  return (
    <>
      <aside className="flex h-screen w-64 flex-col border-r border-slate-800 bg-slate-950 p-4 text-slate-300 select-none flex-shrink-0">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-4 border-b border-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-wide">AURA Admin</h2>
            <p className="text-[11px] text-slate-500 font-mono">Control Center</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sky-500/15 text-sky-400 border border-sky-500/30 font-semibold"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Actions & Change Password */}
        <div className="space-y-2 pt-4 border-t border-slate-800">
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
          >
            <Key className="h-4 w-4" />
            <span>🔑 Change Password</span>
          </button>

          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between rounded-xl px-3.5 py-2 text-xs font-medium text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              View Public Room
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Global Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-emerald-400" />
                <h3 className="text-lg font-semibold text-white">Change Admin Password</h3>
              </div>
              <button onClick={() => setIsPasswordModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
              <div className="space-y-3">
                <div>
                  <label className="text-slate-300 font-mono uppercase block mb-1 flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-sky-400" />
                    <span>Admin Username</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={securityData.newUsername}
                    onChange={(e) => setSecurityData({ ...securityData, newUsername: e.target.value })}
                    placeholder="e.g. admin"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-white focus:border-sky-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-mono uppercase block mb-1 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-amber-400" />
                    <span>Current Password (Required)</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={securityData.currentPassword}
                    onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-white focus:border-sky-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-mono uppercase block mb-1 flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5 text-emerald-400" />
                    <span>New Password</span>
                  </label>
                  <input
                    type="password"
                    value={securityData.newPassword}
                    onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                    placeholder="Enter new password (min 6 chars)"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-white focus:border-sky-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-mono uppercase block mb-1 flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Confirm New Password</span>
                  </label>
                  <input
                    type="password"
                    value={securityData.confirmPassword}
                    onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-white focus:border-sky-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="flex items-center gap-2 rounded-xl px-5 py-2.5 bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  <Key className="h-4 w-4" />
                  <span>{updatingPassword ? "Updating..." : "Save Password"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
