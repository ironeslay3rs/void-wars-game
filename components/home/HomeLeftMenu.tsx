"use client";

import Link from "next/link";

const menuItems = [
  { label: "Continue", href: "#" },
  { label: "New Game", href: "#" },
  { label: "Career", href: "#" },
  { label: "Mastery", href: "#" },
  { label: "Professions", href: "#" },
  { label: "Market", href: "#" },
  { label: "Arena", href: "#" },
  { label: "Guild", href: "#" },
  { label: "Settings", href: "#" },
];

export default function HomeLeftMenu() {
  return (
    <div className="flex w-[240px] flex-col gap-2 rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-xl">
      
      {/* CTA */}
      <button className="mb-2 rounded-xl border border-red-500/40 bg-red-600/20 px-4 py-4 text-left text-sm font-bold uppercase tracking-[0.12em] text-red-200 transition hover:bg-red-600/30">
        Enter the Void
      </button>

      {/* MENU */}
      {menuItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="rounded-lg px-3 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}