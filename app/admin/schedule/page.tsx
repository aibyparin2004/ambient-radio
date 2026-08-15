"use client";

import React, { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ScheduleItem, DEFAULT_SCHEDULE, ThemeName } from "@/lib/environment-engine";
import { Clock, Save, Info } from "lucide-react";

export default function AdminSchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>(DEFAULT_SCHEDULE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/schedule");
      const data = await res.json();
      if (data.schedule && data.schedule.length > 0) {
        setSchedule(data.schedule);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, []);

  const handleChange = (themeName: ThemeName, field: keyof ScheduleItem, value: any) => {
    setSchedule((prev) =>
      prev.map((item) => (item.themeName === themeName ? { ...item, [field]: value } : item))
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schedule),
      });

      if (res.ok) {
        alert("Time schedule updated successfully!");
      } else {
        alert("Failed to update schedule");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-serif font-light text-white">Environment Schedule</h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Customize automatic time boundaries for local visitor atmospheres
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-xs font-semibold text-slate-950 hover:bg-sky-400 transition-colors shadow-lg shadow-sky-500/20 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? "Saving..." : "Save Time Schedules"}</span>
          </button>
        </div>

        {/* Info Banner */}
        <div className="flex items-center gap-3 rounded-2xl bg-sky-950/40 p-4 border border-sky-800/40 text-xs text-sky-200">
          <Info className="h-5 w-5 text-sky-400 flex-shrink-0" />
          <span>
            The site checks visitors' local time (`new Date()`) against these ranges to seamlessly evolve the room's atmosphere throughout the day.
          </span>
        </div>

        {/* Schedule List */}
        <div className="space-y-4 max-w-3xl">
          {schedule.map((item) => (
            <div
              key={item.themeName}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-slate-900/60 p-5 border border-slate-800"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-sky-400 font-mono font-semibold">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white font-mono">{item.themeName}</h3>
                  <span className="text-xs text-slate-400 font-light">Automatic Time Window</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-mono">FROM</span>
                  <input
                    type="time"
                    value={item.startTime}
                    onChange={(e) => handleChange(item.themeName, "startTime", e.target.value)}
                    className="rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-mono">TO</span>
                  <input
                    type="time"
                    value={item.endTime}
                    onChange={(e) => handleChange(item.themeName, "endTime", e.target.value)}
                    className="rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
