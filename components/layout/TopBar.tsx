"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Power, TrendingUp, UserCircle2, Users } from "lucide-react";
import IconBadge from "@/components/shared/IconBadge";
import CharacterPortraitImage from "@/components/character/CharacterPortraitImage";
import { homeSceneData } from "@/features/home/homeSceneData";
import { useGame } from "@/features/game/gameContext";
import { useAuth } from "@/features/auth/useAuth";
import type { FactionAlignment } from "@/features/game/gameTypes";

function shortFactionLabel(alignment: FactionAlignment): string {
  switch (alignment) {
    case "bio":
      return "Bio";
    case "mecha":
      return "Mecha";
    case "pure":
      return "Pure";
    default:
      return "Unbound";
  }
}

export default function TopBar() {
  const pathname = usePathname();
  const { state } = useGame();
  const { signOut } = useAuth();
  const p = state.player;
  const conditionPct = Math.max(0, Math.min(100, p.condition));
  const onHome = pathname === "/home" || pathname === "/";
  const vitalsCritical = p.condition < 40 || p.hunger < 40;

  return (
    <header className="absolute inset-x-0 top-0 z-30 px-4 pt-[max(0.75rem,env(safe-area-inset-top,0px))] sm:px-6">
      <div className="relative mx-auto flex h-20 max-w-[1700px] items-start justify-between gap-3 sm:h-24 sm:gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-2 pt-1 sm:gap-3">
          <Link
            href="/character"
            className="group flex min-w-0 max-w-[min(100%,220px)] items-center gap-2.5 rounded-xl border border-transparent py-0.5 pr-2 transition-colors hover:border-white/10 hover:bg-black/25 sm:max-w-[260px] sm:gap-3"
            title="Character profile"
          >
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-white/20 bg-black/55 shadow-[0_0_16px_rgba(0,0,0,0.5)] sm:h-12 sm:w-12">
              <CharacterPortraitImage
                portraitId={p.characterPortraitId}
                className="absolute inset-0"
                sizes="48px"
              />
            </div>
            <div className="min-w-0 flex-1 flex-col gap-1">
              <span className="hidden truncate text-[11px] font-black uppercase tracking-[0.12em] text-white/95 sm:block">
                {p.playerName}
              </span>
              <span className="hidden text-[9px] font-bold uppercase tracking-[0.18em] text-white/50 sm:block">
                {shortFactionLabel(p.factionAlignment)}
              </span>
              <div
                className="mt-0.5 h-1.5 w-full max-w-[140px] overflow-hidden rounded-full bg-black/55 ring-1 ring-white/10 sm:max-w-[160px]"
                role="progressbar"
                aria-valuenow={Math.round(conditionPct)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Condition"
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-600/95 via-teal-500/90 to-cyan-500/85 transition-[width] duration-300"
                  style={{ width: `${conditionPct}%` }}
                />
              </div>
              <span className="text-[8px] font-bold tabular-nums text-white/40 sm:hidden">
                {Math.round(conditionPct)}%
              </span>
            </div>
          </Link>

          <IconBadge>
            <Link
              href="/missions"
              className="flex h-full w-full items-center justify-center text-slate-200"
              aria-label="Mission alerts"
            >
              <Bell className="h-4 w-4" />
            </Link>
          </IconBadge>
          <IconBadge>
            <Link
              href="/upgrades"
              className="flex h-full w-full items-center justify-center text-slate-200"
              aria-label="Upgrade hub"
            >
              <TrendingUp className="h-4 w-4" />
            </Link>
          </IconBadge>
        </div>

        <div className="pointer-events-none absolute left-1/2 top-0 hidden -translate-x-1/2 lg:block">
          <div className="relative min-w-[560px] px-16 pt-1 text-center">
            <div className="absolute left-0 right-0 top-3 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="absolute left-0 top-5 h-px w-36 bg-gradient-to-r from-transparent to-white/20" />
            <div className="absolute right-0 top-5 h-px w-36 bg-gradient-to-l from-transparent to-white/20" />

            <div className="absolute left-8 top-2 h-8 w-8 border-l border-t border-white/15" />
            <div className="absolute right-8 top-2 h-8 w-8 border-r border-t border-white/15" />

            <div className="absolute left-14 top-10 h-px w-20 bg-gradient-to-r from-white/10 to-transparent" />
            <div className="absolute right-14 top-10 h-px w-20 bg-gradient-to-l from-white/10 to-transparent" />

            <h1 className="text-[54px] font-black uppercase leading-none tracking-[0.12em] text-slate-100 drop-shadow-[0_8px_22px_rgba(0,0,0,0.4)]">
              {homeSceneData.title}
            </h1>

            <p className="mt-1 text-[11px] font-black uppercase tracking-[0.7em] text-slate-300">
              {homeSceneData.subtitle}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 pt-1">
          <IconBadge>
            <Link
              href="/character"
              className="flex h-full w-full items-center justify-center text-slate-200"
              aria-label="Character profile"
            >
              <UserCircle2 className="h-4 w-4" />
            </Link>
          </IconBadge>
          <IconBadge>
            <Link
              href="/social"
              className="flex h-full w-full items-center justify-center text-slate-200"
              aria-label="Social hub"
            >
              <Users className="h-4 w-4" />
            </Link>
          </IconBadge>
          <IconBadge>
            <button
              type="button"
              onClick={() => {
                void signOut();
              }}
              className="flex h-full w-full items-center justify-center"
              aria-label="Sign out"
            >
              <Power className="h-4 w-4 text-red-400" />
            </button>
          </IconBadge>
        </div>
      </div>

      {onHome && vitalsCritical ? (
        <div
          className="relative mx-auto mt-1 max-w-[1700px] px-0 sm:px-0"
          role="status"
          aria-live="polite"
        >
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-amber-400/35 bg-amber-950/55 px-3 py-2 text-center shadow-[0_8px_28px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:justify-between sm:text-left">
            <p className="min-w-0 flex-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-100/95">
              Vitals in the danger band — recover before you queue or deploy.
            </p>
            <div className="flex shrink-0 flex-wrap items-center justify-center gap-2">
              <Link
                href="/bazaar/black-market"
                className="rounded-lg border border-amber-300/45 bg-amber-500/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-50 hover:border-amber-200/60 hover:bg-amber-500/22"
              >
                Black Market
              </Link>
              <Link
                href="/status"
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/85 hover:border-white/25 hover:bg-white/10"
              >
                Status
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
