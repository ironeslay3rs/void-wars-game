"use client";

import Link from "next/link";
import { formatResourceLabel } from "@/features/game/gameFeedback";
import type { ResourceKey, ResourcesState } from "@/features/game/gameTypes";
import type { EncounterOutcome } from "@/features/combat/encounterEngine";

export default function HuntResult({
  creatureName,
  outcome,
  narrative,
  loot,
  rankXpEarned,
  conditionCost,
  contractResources,
  contractConditionDelta,
  returnHref,
}: {
  creatureName: string;
  outcome: EncounterOutcome;
  narrative: string;
  loot: Partial<ResourcesState>;
  rankXpEarned: number;
  conditionCost: number;
  contractResources: Partial<ResourcesState>;
  contractConditionDelta: number;
  returnHref: string;
}) {
  const lootEntries = Object.entries(loot).filter(([, v]) => typeof v === "number" && v > 0);
  const contractEntries = Object.entries(contractResources ?? {}).filter(
    ([, v]) => typeof v === "number" && v > 0,
  );

  const banner =
    outcome === "victory"
      ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-100"
      : outcome === "defeat"
        ? "border-red-400/25 bg-red-500/10 text-red-100"
        : "border-amber-300/25 bg-amber-500/10 text-amber-100";

  return (
    <div className="space-y-4">
      <div className={["rounded-2xl border p-5", banner].join(" ")}>
        <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/55">
          Encounter outcome
        </div>
        <div className="mt-2 text-2xl font-black uppercase tracking-[0.05em] text-white">
          {outcome === "victory" ? "Victory" : outcome === "defeat" ? "Defeat" : "Retreat"}
        </div>
        <div className="mt-1 text-sm text-white/75">
          {creatureName} — {narrative}
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {rankXpEarned > 0 ? (
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-white/85">
              +{rankXpEarned} XP
            </span>
          ) : null}
          {conditionCost > 0 ? (
            <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-red-100">
              -{conditionCost} Condition (combat)
            </span>
          ) : null}
          {contractConditionDelta !== 0 ? (
            <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-red-100">
              {contractConditionDelta} Condition (contract)
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/12 bg-black/25 p-5">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
            Loot breakdown
          </div>
          {lootEntries.length === 0 ? (
            <div className="mt-3 text-sm text-white/60">No loot recovered.</div>
          ) : (
            <div className="mt-3 space-y-2">
              {lootEntries.map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                >
                  <span className="text-white/70">
                    {formatResourceLabel(k as ResourceKey)}
                  </span>
                  <span className="font-bold text-white">+{v as number}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/12 bg-black/25 p-5">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
            Contract settlement
          </div>
          {contractEntries.length === 0 ? (
            <div className="mt-3 text-sm text-white/60">
              No contract payout applied.
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              {contractEntries.map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                >
                  <span className="text-white/70">
                    {formatResourceLabel(k as ResourceKey)}
                  </span>
                  <span className="font-bold text-white">+{v as number}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href={returnHref}
          className="inline-flex rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 transition hover:border-white/25 hover:bg-white/10"
        >
          Return
        </Link>
        <Link
          href="/home"
          className="inline-flex rounded-xl border border-cyan-400/25 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/40 hover:bg-cyan-500/16"
        >
          Command Deck (Home)
        </Link>
      </div>
    </div>
  );
}

