"use client";

import Link from "next/link";
import { useGame } from "@/features/game/gameContext";
import { getFirstSessionGuidance } from "@/features/guidance/firstSessionGuidance";

function getPathAccent(path: string) {
  switch (path) {
    case "bio":
      return {
        chip: "border-emerald-400/35 bg-emerald-500/12 text-emerald-100",
        bar: "from-emerald-400 to-emerald-600",
        ring: "border-emerald-400/20",
        hint: "text-emerald-200/80",
      };
    case "mecha":
      return {
        chip: "border-cyan-400/35 bg-cyan-500/12 text-cyan-100",
        bar: "from-cyan-300 to-cyan-600",
        ring: "border-cyan-400/20",
        hint: "text-cyan-200/80",
      };
    case "pure":
      return {
        chip: "border-fuchsia-400/35 bg-fuchsia-500/12 text-fuchsia-100",
        bar: "from-fuchsia-400 to-fuchsia-700",
        ring: "border-fuchsia-400/20",
        hint: "text-fuchsia-200/80",
      };
    default:
      return {
        chip: "border-white/15 bg-white/5 text-white/75",
        bar: "from-white/60 to-white/25",
        ring: "border-white/12",
        hint: "text-white/55",
      };
  }
}

function getPathTagline(path: string): string {
  switch (path) {
    case "bio":
      return "Verdant Coil";
    case "mecha":
      return "Chrome Synod";
    case "pure":
      return "Ember Vault";
    default:
      return "Unbound";
  }
}

function getCareerLabel(focus: string | null): string {
  switch (focus) {
    case "combat":
      return "Combat";
    case "gathering":
      return "Gatherer";
    case "crafting":
      return "Crafter";
    default:
      return "No focus set";
  }
}

function getProgressionHint(rankLevel: number, path: string): string {
  if (rankLevel <= 1) {
    return "Hour 0–3: Survive. Run your first loop, bank your first haul, make it back.";
  }
  if (rankLevel <= 3) {
    return "Hour 3–10: Become someone. Build a loadout, set a doctrine, find your first repeatable loop.";
  }
  if (rankLevel <= 6) {
    return "Hour 10–20: Choose what shapes you. Deepen your profession, push district access, pick your faction role.";
  }
  return "Hour 20+: Define your place in the war. Guild, faction pressure, and mastery depth are the next frontier.";
}

function getNextGoal(rankLevel: number): string {
  if (rankLevel < 4)
    return `Reach Vanguard (Level 4) — unlocks deeper district access and contract tiers.`;
  if (rankLevel < 7)
    return `Reach Elite (Level 7) — unlocks faction HQ influence and rare mission contracts.`;
  if (rankLevel < 10)
    return `Reach Ascendant (Level 10) — mythic ascension gate opens.`;
  return "Mythic tier — the loop deepens from here.";
}

export default function HomeProgressionPanel() {
  const { state } = useGame();
  const { player } = state;
  const guidance = getFirstSessionGuidance(state);
  const accent = getPathAccent(player.factionAlignment);
  const tagline = getPathTagline(player.factionAlignment);
  const careerLabel = getCareerLabel(player.careerFocus);
  const progressPct =
    player.rankXpToNext > 0
      ? Math.max(0, Math.min(100, (player.rankXp / player.rankXpToNext) * 100))
      : 0;

  return (
    <section
      className={[
        "rounded-2xl border bg-[linear-gradient(180deg,rgba(10,14,24,0.90),rgba(5,8,14,0.96))] px-5 py-4 text-white shadow-[0_14px_36px_rgba(0,0,0,0.28)] backdrop-blur-md",
        accent.ring,
      ].join(" ")}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={[
              "rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]",
              accent.chip,
            ].join(" ")}
          >
            {player.factionAlignment === "unbound"
              ? "Unbound"
              : `${player.factionAlignment.charAt(0).toUpperCase()}${player.factionAlignment.slice(1)}`}{" "}
            · {tagline}
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55">
            {careerLabel}
          </span>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">
            {player.rank}
          </div>
          <div className="text-xs font-semibold text-white/70">
            Lv {player.rankLevel} · {player.rankXp}/{player.rankXpToNext} XP
          </div>
        </div>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
        <div
          className={[
            "h-full rounded-full bg-gradient-to-r transition-[width] duration-500",
            accent.bar,
          ].join(" ")}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
            Where you are
          </div>
          <p className="mt-1 text-xs leading-5 text-white/65">
            {getProgressionHint(player.rankLevel, player.factionAlignment)}
          </p>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
            Next milestone
          </div>
          <p className="mt-1 text-xs leading-5 text-white/65">
            {getNextGoal(player.rankLevel)}
          </p>
        </div>
      </div>

      <div
        className={[
          "mt-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 text-[11px]",
          accent.hint,
        ].join(" ")}
      >
        {guidance.schoolHint}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href="/status"
          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold text-white/70 transition hover:border-white/20 hover:bg-white/[0.07]"
        >
          Status
        </Link>
        <Link
          href="/career"
          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold text-white/70 transition hover:border-white/20 hover:bg-white/[0.07]"
        >
          Career
        </Link>
        <Link
          href="/mastery"
          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold text-white/70 transition hover:border-white/20 hover:bg-white/[0.07]"
        >
          Mastery
        </Link>
      </div>
    </section>
  );
}
