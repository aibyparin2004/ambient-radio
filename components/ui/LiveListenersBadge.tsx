"use client";

import React, { useEffect, useState } from "react";
import { Users, Radio } from "lucide-react";

export const LiveListenersBadge: React.FC = () => {
  const [listenerCount, setListenerCount] = useState<number>(142);

  // Generate smooth, organic listener fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setListenerCount((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
        return Math.max(85, prev + delta);
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3.5 py-1.5 border border-emerald-500/20 text-emerald-400 text-xs font-mono backdrop-blur-md shadow-lg select-none">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <Users className="h-3.5 w-3.5" />
      <span className="font-semibold text-emerald-300">{listenerCount}</span>
      <span className="text-[10px] text-emerald-400/80 uppercase tracking-wider hidden sm:inline">
        LISTENING LIVE
      </span>
    </div>
  );
};
