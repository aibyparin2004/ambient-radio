"use client";

import React, { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ShieldCheck, Key, Lock, UserCheck } from "lucide-react";

export default function AdminSecurityPage() {
  const [securityData, setSecurityData] = useState({
    newUsername: "admin",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);

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

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans select-none">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-serif font-light text-white">Admin Security & Credentials</h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Change your Admin Username and Password securely stored in Neon PostgreSQL
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3.5 py-2 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <ShieldCheck className="h-4 w-4" />
            <span>BCRYPT HASH ENCRYPTED</span>
          </div>
        </div>

        {/* Password Form Card */}
        <div className="max-w-2xl rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Update Admin Credentials</h3>
              <p className="text-xs text-slate-400 font-mono">Enter your current password to authorize changes</p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 font-mono uppercase block mb-1.5 flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-sky-400" />
                  <span>Admin Username</span>
                </label>
                <input
                  type="text"
                  required
                  value={securityData.newUsername}
                  onChange={(e) => setSecurityData({ ...securityData, newUsername: e.target.value })}
                  placeholder="e.g. admin"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-white focus:border-sky-500 focus:outline-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="text-slate-300 font-mono uppercase block mb-1.5 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-amber-400" />
                  <span>Current Password (Required)</span>
                </label>
                <input
                  type="password"
                  required
                  value={securityData.currentPassword}
                  onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-white focus:border-sky-500 focus:outline-none font-mono text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
              <div>
                <label className="text-slate-300 font-mono uppercase block mb-1.5 flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-emerald-400" />
                  <span>New Password</span>
                </label>
                <input
                  type="password"
                  value={securityData.newPassword}
                  onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                  placeholder="Enter new password (min 6 chars)"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-white focus:border-sky-500 focus:outline-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="text-slate-300 font-mono uppercase block mb-1.5 flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Confirm New Password</span>
                </label>
                <input
                  type="password"
                  value={securityData.confirmPassword}
                  onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-white focus:border-sky-500 focus:outline-none font-mono text-sm"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={updatingPassword}
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                <Key className="h-4 w-4" />
                <span>{updatingPassword ? "Saving Changes..." : "Save New Admin Credentials"}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
