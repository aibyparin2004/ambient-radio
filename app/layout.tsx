import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AURA — Premium Ambient YouTube Music Room",
  description:
    "A living cinematic ambient music room that evolves automatically with your local environment and time of day.",
  openGraph: {
    title: "AURA — Premium Ambient YouTube Music Room",
    description:
      "A living cinematic ambient music room that evolves automatically with your local environment and time of day.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AURA — Premium Ambient YouTube Music Room",
    description:
      "A living cinematic ambient music room that evolves automatically with your local environment and time of day.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-950 text-slate-100 antialiased">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-sky-500/30 selection:text-sky-200">
        {children}
      </body>
    </html>
  );
}
