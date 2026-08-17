"use client";

import React from "react";
import { EnvironmentPreset, DEFAULT_THEME_PRESETS, ThemeName } from "@/lib/environment-engine";
import { EnvironmentCanvas } from "./EnvironmentCanvas";

interface ThemeBackgroundProps {
  theme: EnvironmentPreset;
  reduceMotion?: boolean;
}

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export const ThemeBackground: React.FC<ThemeBackgroundProps> = ({
  theme,
  reduceMotion = false,
}) => {
  const bgUrl = theme.backgroundUrl || "";
  const ytId = extractYouTubeId(bgUrl);

  const isDirectVideo =
    theme.backgroundType === "video" ||
    bgUrl.includes(".mp4") ||
    bgUrl.includes(".webm") ||
    bgUrl.startsWith("data:video/");

  const isImage = !ytId && !isDirectVideo && (theme.backgroundType === "image" || Boolean(bgUrl));

  const defaultShaderMap: Record<ThemeName, EnvironmentPreset["particleType"]> = {
    DAY: "sunrays",
    NOON: "sunflare",
    EVENING: "clouds",
    NIGHT: "stars",
    RAIN: "rain",
    WINTER: "snow",
  };

  const defaultParticle = defaultShaderMap[theme.name] || DEFAULT_THEME_PRESETS[theme.name]?.particleType || "stars";
  const activeParticleType =
    !theme.particleType || theme.particleType === "none"
      ? defaultParticle
      : theme.particleType;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
      {/* 1. Base Layer (z-0): Custom Background Image / YouTube Video / Direct MP4 Video / Dynamic Gradient */}
      <div
        className="absolute inset-0 h-full w-full transition-all duration-1000 ease-in-out z-0"
        style={{
          background: theme.gradientCss,
          filter: `blur(${theme.blurAmount}px) brightness(${theme.brightness})`,
        }}
      >
        {/* YouTube Video Background Embed */}
        {ytId && (
          <div className="absolute inset-0 h-full w-full overflow-hidden pointer-events-none scale-125">
            <iframe
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&showinfo=0&rel=0&iv_load_policy=3&enablejsapi=1`}
              className="h-full w-full object-cover border-0 pointer-events-none"
              allow="autoplay; encrypted-media"
            />
          </div>
        )}

        {/* Direct MP4 / WebM / Data URL Video Background */}
        {!ytId && isDirectVideo && (
          <video
            autoPlay
            loop
            muted
            playsInline
            src={bgUrl}
            className="h-full w-full object-cover transition-opacity duration-1000"
          />
        )}

        {/* Static Background Image */}
        {!ytId && !isDirectVideo && isImage && (
          <img
            src={bgUrl}
            alt="Environment Atmosphere"
            className="h-full w-full object-cover transition-opacity duration-1000"
          />
        )}
      </div>

      {/* 2. Color Grading & Vignette Overlay (z-10) */}
      <div
        className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-1000"
        style={{
          backgroundColor: `rgba(2, 6, 23, ${theme.overlayOpacity})`,
          backgroundImage:
            "radial-gradient(circle at center, transparent 30%, rgba(2, 6, 23, 0.75) 100%)",
        }}
      />

      {/* 3. Atmospheric Canvas Motion Shaders (z-20) */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <EnvironmentCanvas
          particleType={activeParticleType}
          particleCount={theme.particleCount && theme.particleCount > 0 ? theme.particleCount : 50}
          animationSpeed={theme.animationSpeed || 1.0}
          accentColor={theme.accentColor || "#ffffff"}
          reduceMotion={reduceMotion}
        />
      </div>
    </div>
  );
};
