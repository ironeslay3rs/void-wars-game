"use client";

import Link from "next/link";
import { formatResourceLabel } from "@/features/game/gameFeedback";
import type { ResourceKey } from "@/features/game/gameTypes";
import type { BossFightResult } from "@/features/combat/bossEngine";

export default function BossResult({
  result,
  returnHref,
}: {
  result: BossFightResult;
  returnHref: string;
}) {
  const payout = Object.entries(result.resourcePayout).filter(([, v]) => (v ?? 0) > 0);
  const losses = Object.entries(result.lootLost).filter(([, v]) => (v ?? 0) > 0);

  return (
    <section className="rounded-2xl border border-white/12 bg-black/35 p-5">
      <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">
        Boss Encounter Result
      </div>
      <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.05em] text-white">
        {result.outcome === "victory" ? "Hollowfang Defeated" : "Hollowfang Repelled You"}
      </h2>
      <p className="mt-2 text-sm text-white/70">{result.narrative}</p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {result.rankXp > 0 ? (
          <span className="rounded-full border border-cyan-300/25 bg-cyan-500/10 px-3 py-1 text-cyan-100">
            +{result.rankXp} XP
          </span>
        ) : null}
        {result.influenceGain > 0 ? (
          <span className="rounded-full border border-fuchsia-300/25 bg-fuchsia-500/10 px-3 py-1 text-fuchsia-100">
            +{result.influenceGain} Influence
          </span>
        ) : null}
        {result.conditionLoss > 0 ? (
          <span className="rounded-full border border-red-300/25 bg-red-500/10 px-3 py-1 text-red-100">
            -{result.conditionLoss} Condition
          </span>
        ) : null}
      </div>

      {result.outcome === "victory" ? (
        <div className="mt-5 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
            Prestige Loot
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {result.lootDrops.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/60">
                No table drop rolled this run.
              </div>
            ) : (
              result.lootDrops.map((drop) => (
                <div
                  key={drop.id}
                  className="rounded-xl border border-amber-300/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-100"
                >
                  <span className="font-semibold">{drop.name}</span>
                  <span className="ml-2 text-[11px] uppercase tracking-[0.12em] text-amber-100/70">
                    {drop.rarity}
                  </span>
                </div>
              ))
            )}
          </div>
          {payout.length > 0 ? (
            <div className="grid gap-2 md:grid-cols-2">
              {payout.map(([key, amount]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                >
                  <span className="text-white/70">{formatResourceLabel(key as ResourceKey)}</span>
                  <span className="font-semibold text-white">+{amount as number}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-5">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
            Salvage Loss
          </div>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            {losses.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/60">
                No carried loot was lost.
              </div>
            ) : (
              losses.map(([key, amount]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-xl border border-red-300/20 bg-red-500/10 px-3 py-2 text-sm"
                >
                  <span className="text-red-100/85">{formatResourceLabel(key as ResourceKey)}</span>
                  <span className="font-semibold text-red-100">-{amount as number}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={returnHref}
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:border-white/25 hover:bg-white/10"
        >
          Return
        </Link>
        <Link
          href="/home"
          className="rounded-xl border border-cyan-400/25 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100 hover:border-cyan-300/40 hover:bg-cyan-500/16"
        >
          Command Deck
        </Link>
      </div>
    </section>
  );
}

