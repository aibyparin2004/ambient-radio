"use client";

import React from "react";
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
} from "lucide-react";

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (e) {
      console.error("Logout error:", e);
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

      {/* External Link to Public Room & Logout */}
      <div className="space-y-2 pt-4 border-t border-slate-800">
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
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
