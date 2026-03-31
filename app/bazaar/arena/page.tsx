"use client";

import Link from "next/link";
import {
  Swords,
  Trophy,
  Shield,
  Flame,
  Coins,
  Users,
} from "lucide-react";
import BazaarSubpageNav from "@/components/bazaar/BazaarSubpageNav";
import { useGame } from "@/features/game/gameContext";

const arenaPanels = [
  {
    title: "Ranked Queue",
    desc: "Compete for rating, seasonal rewards, and ladder placement.",
    icon: Trophy,
  },
  {
    title: "Duel Chamber",
    desc: "Challenge other players in direct 1v1 combat.",
    icon: Swords,
  },
  {
    title: "Defense Records",
    desc: "Review battle logs, counters, and defensive setups.",
    icon: Shield,
  },
  {
    title: "Combat Buffs",
    desc: "Temporary arena modifiers and prestige bonuses.",
    icon: Flame,
  },
  {
    title: "Wager Desk",
    desc: "Bet currency and resources on approved matches.",
    icon: Coins,
  },
  {
    title: "Spectator Hall",
    desc: "Watch top players and current featured battles.",
    icon: Users,
  },
];

export default function ArenaPage() {
  const { state, dispatch } = useGame();
  const m = state.player.mythicAscension;
  const canBuySigil = m.convergencePrimed && m.runeKnightValor >= 2;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(120,0,0,0.26),rgba(5,8,18,1)_55%)] px-6 py-8 text-white md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-red-300/70">
              Bazaar / District
            </div>
            <h1 className="mt-2 text-3xl font-black uppercase tracking-[0.04em]">
              Arena
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/70">
              The prestige engine of the Bazaar. Ranked combat, wagers,
              spectators, and faction pride all collide here.
            </p>
          </div>
        </div>

        <BazaarSubpageNav accentClassName="hover:border-red-400/40" />

        <section className="grid gap-3 md:grid-cols-[1fr_auto]">
          <div className="rounded-2xl border border-red-400/20 bg-red-950/20 p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-red-200/80">
              Ranked launch
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Link
                href="/arena/match?mode=ranked"
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-red-300/40 bg-red-500/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-red-100"
              >
                Enter ranked
              </Link>
              <Link
                href="/arena/match?mode=tournament"
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-amber-300/35 bg-amber-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-amber-100"
              >
                Enter tournament
              </Link>
              <Link
                href="/arena/match?mode=practice"
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white/75"
              >
                Practice
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-violet-400/25 bg-violet-950/20 p-4 md:min-w-[320px]">
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-200/80">
              Prestige spend
            </div>
            <p className="mt-2 text-sm text-white/75">
              Arena Edge Sigil spends 2 valor for one ranked/tournament match edge.
            </p>
            <p className="mt-1 text-xs text-white/50">
              Stored sigils: {m.arenaEdgeSigils} · Knight valor: {m.runeKnightValor}
            </p>
            <button
              type="button"
              disabled={!canBuySigil}
              onClick={() =>
                dispatch({
                  type: "REDEEM_RUNE_KNIGHT_VALOR",
                  payload: "arena-edge-sigil",
                })
              }
              className="mt-3 min-h-[44px] w-full rounded-lg border border-violet-300/40 bg-violet-500/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-violet-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {canBuySigil ? "Buy arena edge sigil" : "Need convergence + 2 valor"}
            </button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {arenaPanels.map((panel) => {
            const Icon = panel.icon;

            return (
              <div
                key={panel.title}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_25px_rgba(0,0,0,0.22)] transition hover:border-red-400/30 hover:bg-white/[0.06]"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                    <Icon className="h-5 w-5 text-red-300" />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-[0.08em]">
                      {panel.title}
                    </h2>
                    <p className="mt-2 text-sm text-white/65">{panel.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-white/10 bg-black/25 p-6">
            <div className="text-[11px] uppercase tracking-[0.22em] text-red-300/70">
              Current Season
            </div>
            <h2 className="mt-2 text-xl font-black uppercase">Ladder Snapshot</h2>

            <div className="mt-4 space-y-3 text-sm text-white/80">
              <div className="flex justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                <span>Bronze Division</span>
                <span>0 - 999</span>
              </div>
              <div className="flex justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                <span>Silver Division</span>
                <span>1000 - 1499</span>
              </div>
              <div className="flex justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                <span>Gold Division</span>
                <span>1500 - 1999</span>
              </div>
              <div className="flex justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                <span>Void Rank</span>
                <span>2000+</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/25 p-6">
            <div className="text-[11px] uppercase tracking-[0.22em] text-red-300/70">
              Rewards
            </div>
            <h2 className="mt-2 text-xl font-black uppercase">Season Rewards</h2>

            <div className="mt-4 space-y-3 text-sm text-white/75">
              <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                Ranked Currency Cache
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                Exclusive Arena Crest
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                Prestige Frame Upgrade
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                Seasonal Title Unlock
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
