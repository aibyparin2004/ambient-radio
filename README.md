# AURA — Premium Ambient YouTube Music Website

A minimal, cinematic ambient music website and digital music room inspired by online ambient radio experiences, featuring an **Automatic Time-Based Environment Engine**, **YouTube Player Integration**, and a **Secure Private Admin Dashboard**.

---

## 🌟 Key Features

1. **Automatic Time-Based Environment Engine**:
   - Calculates atmospheric phase (`DAY`, `NOON`, `EVENING`, `NIGHT`) using visitor local time (`new Date()`).
   - Renders performance-optimized HTML5 Canvas atmospheric shaders (dust, haze, stars, rain, snow).
   - Smooth cinematic crossfade transitions (300ms–1500ms).

2. **Ambient YouTube Music Player**:
   - Full Play, Pause, Next, Previous, Volume, Mute, and Queue controls.
   - Autoplay fallback handling with a sleek "ENTER THE ROOM" glassmorphic overlay.
   - Slide-out drawers for ambient channels and upcoming track queues.
   - Non-interactive for visual environment (User controls ONLY music; Environment changes automatically).

3. **Secure Private Admin Portal (`/admin`)**:
   - Protected routes with HTTP-only JWT authentication.
   - Playlist & Song CRUD managers.
   - **Live Theme Customizer** (preview blur, brightness, overlay opacity, and particle density in realtime).
   - Custom Environment Schedule Editor.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ & npm

### 2. Installation
```bash
npm install
```

### 3. Database Setup & Seeding
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### 4. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Admin Access

- **URL**: `http://localhost:3000/admin`
- **Default Username**: `admin`
- **Default Password**: `adminpassword123` *(Change in `.env` for production)*

---

## 📄 Documentation & Security
- See `SECURITY.md` for threat model, security policies, and secret management guidelines.
