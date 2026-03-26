"use client";

import Link from "next/link";
import CharacterProfile from "@/components/character/CharacterProfile";

export default function CharacterPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070a12] px-4 py-8 text-white md:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(60,80,120,0.2),_transparent_50%)]" />

      <div className="relative mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            href="/home"
            className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300/90 hover:text-cyan-200"
          >
            ← Back
          </Link>
        </div>

        <CharacterProfile />
      </div>
    </main>
  );
}
