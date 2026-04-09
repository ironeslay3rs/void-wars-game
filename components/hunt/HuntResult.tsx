"use client";

import Link from "next/link";
import { formatResourceLabel } from "@/features/game/gameFeedback";
import type { MissionOriginTagId, ResourceKey, ResourcesState } from "@/features/game/gameTypes";
import type { EncounterOutcome } from "@/features/combat/encounterEngine";
import SettlementLoreOverlay from "@/components/settlement/SettlementLoreOverlay";

function getConditionLabel(condition: number) {
  if (condition >= 85) return "Optimal";
  if (condition >= 65) return "Stable";
  if (condition >= 40) return "Strained";
  return "Critical";
}

function getConditionConsequence(condition: number, outcome: EncounterOutcome) {
  if (outcome === "defeat") {
    if (condition < 40) {
      return "Condition is critical. Ranked arena is locked and the next hunt will start at a severe deficit. Recover before pushing again.";
    }
    return "Defeat costs condition but the body held. Stabilize if needed, then decide whether to push again or recover first.";
  }
  if (condition < 40) {
    return "Victory, but the cost was steep. Condition is now critical — ranked arena locked, next run will suffer heavy penalties. Recovery is not optional.";
  }
  if (condition < 65) {
    return "Body is strained from the engagement. The loop can continue, but condition pressure will compound if you push without stabilizing.";
  }
  return "Field state is still solid. The loop can continue without recovery.";
}

function getConditionColor(condition: number) {
  if (condition >= 65) return "text-emerald-200";
  if (condition >= 40) return "text-amber-200";
  return "text-red-200";
}

function getConditionBarColor(condition: number) {
  if (condition >= 65) return "from-emerald-400 to-emerald-600";
  if (condition >= 40) return "from-amber-400 to-amber-600";
  return "from-red-400 to-red-600";
}

export default function HuntResult({
  creatureName,
  outcome,
  narrative,
  loot,
  rankXpEarned,
  conditionCost,
  conditionAfter,
  contractResources,
  contractConditionDelta,
  returnHref,
  originTag,
  resolvedAt,
}: {
  creatureName: string;
  outcome: EncounterOutcome;
  narrative: string;
  loot: Partial<ResourcesState>;
  rankXpEarned: number;
  conditionCost: number;
  conditionAfter: number;
  contractResources: Partial<ResourcesState>;
  contractConditionDelta: number;
  returnHref: string;
  originTag?: MissionOriginTagId;
  resolvedAt?: number;
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

  const condLabel = getConditionLabel(conditionAfter);
  const condColor = getConditionColor(conditionAfter);
  const condBar = getConditionBarColor(conditionAfter);
  const condConsequence = getConditionConsequence(conditionAfter, outcome);
  const needsRecovery = conditionAfter < 65;

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
              {contractConditionDelta > 0 ? "+" : ""}{contractConditionDelta} Condition (contract)
            </span>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-white/12 bg-black/25 p-5">
        <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
          Field state after run
        </div>
        <div className="mt-3 flex items-center justify-between gap-4">
          <div>
            <span className={["text-xl font-black", condColor].join(" ")}>{conditionAfter}%</span>
            <span className={["ml-2 text-sm font-semibold", condColor].join(" ")}>{condLabel}</span>
          </div>
          {conditionAfter < 40 ? (
            <span className="rounded-full border border-red-400/30 bg-red-500/12 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-red-200">
              Ranked Locked
            </span>
          ) : null}
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/8">
          <div
            className={["h-full rounded-full bg-gradient-to-r transition-[width]", condBar].join(" ")}
            style={{ width: `${conditionAfter}%` }}
          />
        </div>
        <p className="mt-3 text-xs leading-5 text-white/60">{condConsequence}</p>
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

      <SettlementLoreOverlay originTag={originTag} resolvedAt={resolvedAt} />

      <div className="flex flex-wrap gap-3">
        {needsRecovery ? (
          <Link
            href="/status"
            className="inline-flex rounded-xl border border-amber-400/30 bg-amber-500/12 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:border-amber-300/45 hover:bg-amber-500/18"
          >
            Recover — Status
          </Link>
        ) : null}
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
          Command Deck
        </Link>
      </div>
    </div>
  );
}
