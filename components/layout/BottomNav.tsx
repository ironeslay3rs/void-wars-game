"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getNavigationItemsByPlacement } from "@/features/navigation/navigationItems";

function getAccentClasses(
  accent: "red" | "green" | "blue" | "purple" | "gold" | "neutral" = "neutral",
  isActive: boolean,
) {
  const activeMap = {
    red: "border-red-500/70 bg-[linear-gradient(180deg,rgba(120,10,10,0.92),rgba(35,6,6,0.96))] text-red-50 shadow-[0_0_24px_rgba(220,38,38,0.28)]",
    green:
      "border-emerald-500/70 bg-[linear-gradient(180deg,rgba(16,90,50,0.92),rgba(6,28,18,0.96))] text-emerald-50 shadow-[0_0_24px_rgba(16,185,129,0.24)]",
    blue: "border-cyan-400/70 bg-[linear-gradient(180deg,rgba(14,64,108,0.92),rgba(5,18,32,0.96))] text-cyan-50 shadow-[0_0_24px_rgba(34,211,238,0.24)]",
    purple:
      "border-violet-500/70 bg-[linear-gradient(180deg,rgba(76,20,120,0.92),rgba(20,8,36,0.96))] text-violet-50 shadow-[0_0_24px_rgba(168,85,247,0.24)]",
    gold: "border-amber-400/70 bg-[linear-gradient(180deg,rgba(110,72,12,0.92),rgba(34,24,8,0.96))] text-amber-50 shadow-[0_0_24px_rgba(251,191,36,0.22)]",
    neutral:
      "border-white/15 bg-[linear-gradient(180deg,rgba(24,28,40,0.92),rgba(10,12,18,0.96))] text-white shadow-[0_0_18px_rgba(255,255,255,0.06)]",
  };

  const idleMap = {
    red: "border-white/10 bg-[linear-gradient(180deg,rgba(20,18,24,0.88),rgba(8,10,16,0.94))] text-white/80 hover:border-red-500/40 hover:text-red-100",
    green:
      "border-white/10 bg-[linear-gradient(180deg,rgba(20,18,24,0.88),rgba(8,10,16,0.94))] text-white/80 hover:border-emerald-500/40 hover:text-emerald-100",
    blue: "border-white/10 bg-[linear-gradient(180deg,rgba(20,18,24,0.88),rgba(8,10,16,0.94))] text-white/80 hover:border-cyan-400/40 hover:text-cyan-100",
    purple:
      "border-white/10 bg-[linear-gradient(180deg,rgba(20,18,24,0.88),rgba(8,10,16,0.94))] text-white/80 hover:border-violet-500/40 hover:text-violet-100",
    gold: "border-white/10 bg-[linear-gradient(180deg,rgba(20,18,24,0.88),rgba(8,10,16,0.94))] text-white/80 hover:border-amber-400/40 hover:text-amber-100",
    neutral:
      "border-white/10 bg-[linear-gradient(180deg,rgba(20,18,24,0.88),rgba(8,10,16,0.94))] text-white/80 hover:border-white/25 hover:text-white",
  };

  return isActive ? activeMap[accent] : idleMap[accent];
}

function isRouteActive(pathname: string, href: string) {
  if (pathname === href) return true;
  if (href === "/") return false;
  return pathname.startsWith(`${href}/`);
}

export default function BottomNav() {
  const pathname = usePathname();
  const items = getNavigationItemsByPlacement("bottom");

  return (
    <nav className="relative w-full">
      <div className="grid grid-cols-5 gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = isRouteActive(pathname, item.href);

          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={[
                "group relative flex min-h-[92px] flex-col items-center justify-center gap-2 overflow-hidden rounded-[18px] border px-3 py-3",
                "transition duration-200",
                "backdrop-blur-sm",
                getAccentClasses(item.accent, isActive),
              ].join(" ")}
            >
              <div className="absolute inset-x-4 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-70" />

              <div
                className={[
                  "absolute inset-0 opacity-0 transition duration-200 group-hover:opacity-100",
                  "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_58%)]",
                ].join(" ")}
              />

              <Icon
                className={[
                  "relative z-10 h-6 w-6 transition duration-200",
                  isActive ? "scale-110" : "group-hover:scale-105",
                ].join(" ")}
              />

              <span
                className={[
                  "relative z-10 text-center text-[13px] font-extrabold uppercase tracking-[0.08em]",
                  isActive ? "text-white" : "",
                ].join(" ")}
              >
                {item.label}
              </span>

              <div
                className={[
                  "absolute bottom-0 left-1/2 h-[3px] -translate-x-1/2 rounded-full transition-all duration-200",
                  isActive
                    ? "w-14 bg-white/80"
                    : "w-0 bg-white/0 group-hover:w-10 group-hover:bg-white/35",
                ].join(" ")}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}