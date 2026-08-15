import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsPage() {
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
          <FileText className="h-5 w-5" />
        </div>
        <h1 className="text-3xl font-serif text-white">Terms of Use & Copyright</h1>
        <p className="text-xs text-slate-400 font-mono">Last updated: August 2026</p>
      </div>

      <div className="space-y-6 text-sm text-slate-300 font-light leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-medium text-white">1. Audio Content & Attribution</h2>
          <p>
            All music played on AURA is hosted directly by YouTube. AURA does not host, download, convert, or distribute copyrighted media files.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-medium text-white">2. Intellectual Property</h2>
          <p>
            All audio rights belong to their respective creators and artists on YouTube. For copyright queries or DMCA notices, rights holders may contact the platform administration.
          </p>
        </section>
      </div>
    </div>
  );
}
