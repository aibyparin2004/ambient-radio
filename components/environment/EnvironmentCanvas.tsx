"use client";

import React, { useEffect, useRef } from "react";

interface EnvironmentCanvasProps {
  particleType: "none" | "dust" | "haze" | "stars" | "rain" | "snow" | "sunrays" | "sunflare" | "clouds";
  particleCount?: number;
  animationSpeed?: number;
  accentColor?: string;
  reduceMotion?: boolean;
}

interface WaterDrop {
  x: number;
  y: number;
  r: number;
  speedY: number;
  trail: { y: number; r: number }[];
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  speedX: number;
  speedY: number;
  opacity: number;
  maxOpacity: number;
  flickerSpeed: number;
  length?: number;
}

export const EnvironmentCanvas: React.FC<EnvironmentCanvasProps> = ({
  particleType,
  particleCount = 50,
  animationSpeed = 1.0,
  accentColor = "#ffffff",
  reduceMotion = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || particleType === "none" || reduceMotion) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    let time = 0;
    const count = Math.min(Math.max(particleCount, 30), 150);

    const particles: Particle[] = [];
    const waterDrops: WaterDrop[] = [];

    if (particleType === "rain") {
      for (let i = 0; i < 30; i++) {
        waterDrops.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 3.5 + 2,
          speedY: (Math.random() * 2.5 + 1.2) * animationSpeed,
          trail: [],
        });
      }
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.2 + 0.6,
          length: Math.random() * 35 + 20,
          speedX: -2.0 * animationSpeed,
          speedY: (Math.random() * 14 + 16) * animationSpeed,
          opacity: Math.random() * 0.5 + 0.3,
          maxOpacity: 0.7,
          flickerSpeed: 0,
        });
      }
    } else {
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius:
            particleType === "sunrays"
              ? Math.random() * 2.5 + 1.5
              : particleType === "clouds"
              ? Math.random() * 60 + 30
              : Math.random() * 3.0 + 1.2,
          speedX:
            particleType === "clouds"
              ? (Math.random() * 0.5 + 0.15) * animationSpeed
              : (Math.random() - 0.5) * 0.6 * animationSpeed,
          speedY:
            particleType === "snow"
              ? (Math.random() * 1.8 + 0.9) * animationSpeed
              : particleType === "clouds"
              ? (Math.random() - 0.5) * 0.08
              : (Math.random() - 0.5) * 0.5 * animationSpeed - 0.1,
          opacity: Math.random() * 0.7 + 0.3,
          maxOpacity: 0.9,
          flickerSpeed: Math.random() * 0.02 + 0.008,
        });
      }
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.015 * animationSpeed;

      // ----------------------------------------------------
      // 1. DAWN: Soft Morning Mist & Haze Waves
      // ----------------------------------------------------
      if (particleType === "haze") {
        const numWaves = 4;
        for (let i = 0; i < numWaves; i++) {
          const mistY = height * (0.35 + i * 0.15) + Math.sin(time * 0.8 + i) * 20;
          const mistGrad = ctx.createLinearGradient(0, mistY - 60, 0, mistY + 60);
          const opacity = (Math.sin(time * 0.5 + i) * 0.08 + 0.20).toFixed(3);

          mistGrad.addColorStop(0, "rgba(244, 114, 182, 0)");
          mistGrad.addColorStop(0.5, `rgba(224, 231, 255, ${opacity})`);
          mistGrad.addColorStop(1, "rgba(244, 114, 182, 0)");

          ctx.fillStyle = mistGrad;
          ctx.fillRect(0, mistY - 60, width, 120);
        }
      }

      // ----------------------------------------------------
      // 2. DAY: Sweeping Golden Sun Rays Shaders
      // ----------------------------------------------------
      if (particleType === "sunrays") {
        const sunX = width * 0.15;
        const sunY = -40;
        const numRays = 12;

        for (let i = 0; i < numRays; i++) {
          const angle = (i / numRays) * (Math.PI / 2.0) + Math.sin(time * 0.4 + i) * 0.04;
          const rayWidth = 0.09 + Math.sin(time * 1.2 + i * 2) * 0.025;

          const grad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, Math.max(width, height) * 1.4);
          const rayOpacity = (Math.sin(time * 0.8 + i) * 0.15 + 0.30).toFixed(3);

          grad.addColorStop(0, `rgba(254, 240, 138, ${rayOpacity})`);
          grad.addColorStop(0.4, `rgba(253, 224, 71, ${parseFloat(rayOpacity) * 0.65})`);
          grad.addColorStop(1, "rgba(253, 224, 71, 0)");

          ctx.beginPath();
          ctx.moveTo(sunX, sunY);
          ctx.arc(sunX, sunY, Math.max(width, height) * 1.4, angle - rayWidth, angle + rayWidth);
          ctx.closePath();
          ctx.fillStyle = grad;
          ctx.fill();
        }
      }

      // ----------------------------------------------------
      // 3. NOON: Sunlight Lens Flares & Radiant Halos
      // ----------------------------------------------------
      if (particleType === "sunflare") {
        const sunX = width * 0.5;
        const sunY = -30;

        const haloGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, width * 0.65);
        const haloOpacity = 0.25 + Math.sin(time * 1.5) * 0.08;
        haloGrad.addColorStop(0, `rgba(255, 255, 255, ${haloOpacity})`);
        haloGrad.addColorStop(0.45, `rgba(186, 230, 253, ${haloOpacity * 0.55})`);
        haloGrad.addColorStop(1, "rgba(186, 230, 253, 0)");

        ctx.fillStyle = haloGrad;
        ctx.fillRect(0, 0, width, height);

        const flareCount = 5;
        for (let i = 1; i <= flareCount; i++) {
          const fx = sunX + (width * 0.35 * i) / flareCount;
          const fy = sunY + (height * 0.65 * i) / flareCount;
          const fr = 18 + i * 14 + Math.sin(time * 2.5 + i) * 6;

          ctx.beginPath();
          ctx.arc(fx, fy, fr, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${0.16 - i * 0.025})`;
          ctx.fill();
        }
      }

      // ----------------------------------------------------
      // 4. RAIN: Sliding Glass Drops + Falling Rain
      // ----------------------------------------------------
      if (particleType === "rain") {
        for (let i = 0; i < waterDrops.length; i++) {
          const drop = waterDrops[i];
          drop.y += drop.speedY;

          if (Math.random() < 0.35) {
            drop.trail.push({ y: drop.y, r: drop.r * 0.55 });
            if (drop.trail.length > 10) drop.trail.shift();
          }

          if (drop.y > height) {
            drop.y = -20;
            drop.x = Math.random() * width;
            drop.trail = [];
          }

          for (const tPoint of drop.trail) {
            ctx.beginPath();
            ctx.arc(drop.x, tPoint.y, tPoint.r, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(191, 219, 254, 0.35)";
            ctx.fill();
          }

          ctx.beginPath();
          ctx.arc(drop.x, drop.y, drop.r, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(224, 242, 254, 0.75)";
          ctx.fill();
        }
      }

      // ----------------------------------------------------
      // 5. Standard Floating Particles (Dust, Stars, Snow, Clouds)
      // ----------------------------------------------------
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.speedX;
        p.y += p.speedY;

        if (particleType === "snow") {
          p.x += Math.sin(time + i) * 0.7;
        }

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();

        if (particleType === "stars") {
          p.opacity += p.flickerSpeed;
          if (p.opacity > p.maxOpacity || p.opacity < 0.15) {
            p.flickerSpeed = -p.flickerSpeed;
          }
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, p.opacity)})`;
          ctx.fill();
        } else if (particleType === "rain") {
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.speedX * 2, p.y + (p.length || 25));
          ctx.strokeStyle = `rgba(147, 197, 253, ${p.opacity})`;
          ctx.lineWidth = p.radius;
          ctx.stroke();
        } else if (particleType === "snow") {
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(240, 249, 255, ${p.opacity})`;
          ctx.fill();
        } else if (particleType === "clouds") {
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(244, 114, 182, ${p.opacity * 0.2})`;
          ctx.fill();
        } else {
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = accentColor.startsWith("#")
            ? `${accentColor}${Math.floor(p.opacity * 255).toString(16).padStart(2, "0")}`
            : `rgba(255, 255, 255, ${p.opacity})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [particleType, particleCount, animationSpeed, accentColor, reduceMotion]);

  if (particleType === "none" || reduceMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-10 h-full w-full opacity-90 transition-opacity duration-1000"
    />
  );
};
