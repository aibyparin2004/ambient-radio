"use client";

import React from "react";
import { EnvironmentPreset, DEFAULT_THEME_PRESETS, ThemeName } from "@/lib/environment-engine";
import { EnvironmentCanvas } from "./EnvironmentCanvas";

interface ThemeBackgroundProps {
  theme: EnvironmentPreset;
  reduceMotion?: boolean;
}

export const ThemeBackground: React.FC<ThemeBackgroundProps> = ({
  theme,
  reduceMotion = false,
}) => {
  const isVideo = theme.backgroundType === "video" && theme.backgroundUrl;
  const isImage = theme.backgroundType === "image" && theme.backgroundUrl;

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
      {/* 1. Base Layer (z-0): Custom Background Image / Video / Dynamic Gradient */}
      <div
        className="absolute inset-0 h-full w-full transition-all duration-1000 ease-in-out z-0"
        style={{
          background: theme.gradientCss,
          filter: `blur(${theme.blurAmount}px) brightness(${theme.brightness})`,
        }}
      >
        {isImage && (
          <img
            src={theme.backgroundUrl!}
            alt="Environment Atmosphere"
            className="h-full w-full object-cover transition-opacity duration-1000"
          />
        )}
        {isVideo && (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover transition-opacity duration-1000"
          >
            <source src={theme.backgroundUrl!} />
          </video>
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

      {/* 3. Atmospheric Canvas Motion Shaders (z-20 — Vividly visible on top of custom background & vignette) */}
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
