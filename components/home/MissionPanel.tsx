"use client";

import Link from "next/link";
import { useGame } from "@/features/game/gameContext";

function getConditionColor(condition: number) {
  if (condition >= 65) return "bg-emerald-500";
  if (condition >= 40) return "bg-amber-400";
  return "bg-red-500";
}

function getConditionLabel(condition: number) {
  if (condition >= 85) return "Optimal";
  if (condition >= 65) return "Stable";
  if (condition >= 40) return "Strained";
  return "Critical";
}

function getFactionAccentChip(faction: string) {
  switch (faction) {
    case "bio":
      return "border-emerald-500/40 bg-emerald-500/12 text-emerald-100";
    case "mecha":
      return "border-cyan-400/40 bg-cyan-500/12 text-cyan-100";
    case "pure":
      return "border-fuchsia-400/40 bg-fuchsia-500/12 text-fuchsia-100";
    default:
      return "border-white/15 bg-white/5 text-white/75";
  }
}

function getFactionLabel(faction: string) {
  switch (faction) {
    case "bio": return "Bio · Verdant Coil";
    case "mecha": return "Mecha · Chrome Synod";
    case "pure": return "Pure · Ember Vault";
    default: return "Unbound";
  }
}

export default function MissionPanel() {
  const { state } = useGame();
  const { player } = state;
  const xpPct = player.rankXpToNext > 0
    ? Math.min(100, (player.rankXp / player.rankXpToNext) * 100)
    : 0;
  const condColor = getConditionColor(player.condition);
  const condLabel = getConditionLabel(player.condition);
  const factionChip = getFactionAccentChip(player.factionAlignment);

  return (
    <div className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(14,16,26,0.94),rgba(7,9,15,0.97))] p-4 text-white shadow-[0_12px_32px_rgba(0,0,0,0.3)] backdrop-blur-md">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
            Operative
          </div>
          <div className="mt-0.5 truncate text-base font-black uppercase tracking-[0.06em] text-white">
            {player.playerName}
          </div>
        </div>
        <span className={["shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]", factionChip].join(" ")}>
          {getFactionLabel(player.factionAlignment)}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-white/8 bg-white/[0.04] px-2 py-2 text-center">
          <div className="text-[9px] uppercase tracking-[0.18em] text-white/40">Rank</div>
          <div className="mt-0.5 text-sm font-black text-white">{player.rank}</div>
          <div className="text-[10px] text-white/50">Lv {player.rankLevel}</div>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/[0.04] px-2 py-2 text-center">
          <div className="text-[9px] uppercase tracking-[0.18em] text-white/40">Influence</div>
          <div className="mt-0.5 text-sm font-black text-white">{player.influence}</div>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/[0.04] px-2 py-2 text-center">
          <div className="text-[9px] uppercase tracking-[0.18em] text-white/40">Mastery</div>
          <div className="mt-0.5 text-sm font-black text-white">{player.masteryProgress}%</div>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <div>
          <div className="flex items-center justify-between text-[10px] text-white/45">
            <span className="uppercase tracking-[0.16em]">Condition</span>
            <span className="font-semibold text-white/70">{player.condition}% · {condLabel}</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className={["h-full rounded-full transition-[width] duration-300", condColor].join(" ")}
              style={{ width: `${player.condition}%` }} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-[10px] text-white/45">
            <span className="uppercase tracking-[0.16em]">Rank XP</span>
            <span className="tabular-nums text-white/60">{player.rankXp} / {player.rankXpToNext}</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-red-500 to-amber-400 transition-[width] duration-300"
              style={{ width: `${xpPct}%` }} />
          </div>
        </div>
      </div>

      {player.condition < 40 ? (
        <div className="mt-3 rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-[11px] text-red-100">
          Condition critical — recover before next run.
        </div>
      ) : null}

      <div className="mt-3 flex gap-2">
        <Link href="/status"
          className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] py-2 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-white/70 transition hover:border-white/20 hover:bg-white/[0.07] active:scale-[0.97]">
          Status
        </Link>
        <Link href="/missions"
          className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] py-2 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-white/70 transition hover:border-white/20 hover:bg-white/[0.07] active:scale-[0.97]">
          Missions
        </Link>
      </div>
    </div>
  );
}
