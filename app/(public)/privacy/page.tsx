import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans max-w-3xl mx-auto space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Music Room</span>
      </Link>

      <div className="space-y-3 pb-6 border-b border-slate-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h1 className="text-3xl font-serif text-white">Privacy Policy</h1>
        <p className="text-xs text-slate-400 font-mono">Last updated: August 2026</p>
      </div>

      <div className="space-y-6 text-sm text-slate-300 font-light leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-medium text-white">1. Data Collection</h2>
          <p>
            AURA Ambient Radio respects visitor privacy. We do not track, profile, fingerprint, or sell visitor data.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium text-white">2. Local Storage</h2>
          <p>
            We store non-sensitive playback settings (such as volume preference and reduced-motion mode) in your browser&apos;s local storage. No tracking identifiers or passwords are stored in local storage.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium text-white">3. Third-Party Embeds</h2>
          <p>
            Audio streams are rendered via official YouTube embedded players. Playing audio may involve interacting with YouTube/Google services subject to Google&apos;s Privacy Policy.
          </p>
        </section>
      </div>
    </div>
  );
}
