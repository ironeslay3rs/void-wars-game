/**
 * ConsequenceSummaryCard — presents the current condition + corruption tier,
 * active combat/crafting debuffs, and a canon flavor line.
 *
 * Props-in only. Consumers pass a ConsequenceSnapshot from
 * `getConsequenceSnapshot(player)` plus the raw scalars.
 */

import type {
  ConsequenceSnapshot,
  ConsequenceTier,
} from "@/features/condition/consequenceTable";

type ConsequenceSummaryCardProps = {
  /** Current condition scalar (0–100, HIGH = healthy). */
  condition: number;
  /** Current corruption scalar (0–100, HIGH = tainted). */
  corruption: number;
  snapshot: ConsequenceSnapshot;
};

const TIER_LABEL: Record<ConsequenceTier, string> = {
  none: "Clear",
  wear: "Wear",
  strain: "Strain",
  danger: "Danger",
  critical: "Critical",
};

const TIER_TONE: Record<ConsequenceTier, string> = {
  none: "text-emerald-200/80 border-emerald-400/30 bg-emerald-500/10",
  wear: "text-amber-100/85 border-amber-400/30 bg-amber-500/10",
  strain: "text-orange-100/85 border-orange-400/35 bg-orange-500/10",
  danger: "text-rose-100/90 border-rose-400/40 bg-rose-500/10",
  critical: "text-fuchsia-100 border-fuchsia-400/50 bg-fuchsia-500/15",
};

// Canon flavor — The Void forces adaptation; mana is the positive release valve.
const FLAVOR_BY_TIER: Record<ConsequenceTier, string> = {
  none:
    "The vessel holds. The Void presses; the vessel answers in kind.",
  wear:
    "First bite. The Void has noticed you, and the body has begun to translate.",
  strain:
    "Sustained exposure. Flesh and resonance trade notes they were never meant to share.",
  danger:
    "The vessel is negotiating with the prison-realm. Every craft wobbles; every swing carries less weight.",
  critical:
    "Translation failure imminent. Vent mana or find a cleanse — the Void is rewriting you, line by line.",
};

function fmtMult(mult: number): string {
  // Show as percentage delta, e.g. 0.85 → "-15%"
  const pct = Math.round((mult - 1) * 100);
  if (pct === 0) return "—";
  return `${pct > 0 ? "+" : ""}${pct}%`;
}

function fmtFlat(x: number): string {
  const pct = Math.round(x * 100);
  if (pct === 0) return "—";
  return `-${pct}%`;
}

export default function ConsequenceSummaryCard({
  condition,
  corruption,
  snapshot,
}: ConsequenceSummaryCardProps) {
  const { conditionTier, corruptionTier, combat, crafting } = snapshot;
  const worst: ConsequenceTier =
    tierRank(conditionTier) >= tierRank(corruptionTier) ? conditionTier : corruptionTier;
  const flavor = FLAVOR_BY_TIER[worst];

  const combatReasons = combat.reasons;
  const craftingReasons = crafting.reasons;

  return (
    <div className="rounded-[22px] border border-white/10 bg-black/30 p-5 backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-white/45">
            Consequences
          </div>
          <div className="mt-1 text-lg font-black uppercase tracking-[0.1em] text-white">
            Active pressures
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${TIER_TONE[conditionTier]}`}
          >
            Condition · {TIER_LABEL[conditionTier]} · {Math.round(condition)}%
          </span>
          <span
            className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${TIER_TONE[corruptionTier]}`}
          >
            Corruption · {TIER_LABEL[corruptionTier]} · {Math.round(corruption)}%
          </span>
        </div>
      </div>

      <p className="mt-4 text-sm italic leading-relaxed text-violet-100/70">
        {flavor}
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-rose-400/20 bg-rose-500/5 p-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-rose-200/70">
            Combat
          </div>
          <ul className="mt-2 space-y-1 text-xs leading-relaxed text-white/75">
            <li>Outgoing dmg: <span className="tabular-nums font-semibold">{fmtMult(combat.dmgMult)}</span></li>
            <li>Hit chance: <span className="tabular-nums font-semibold">{fmtMult(combat.hitMult)}</span></li>
            <li>Incoming dmg: <span className="tabular-nums font-semibold">{fmtMult(combat.takeMult)}</span></li>
            <li>Crit chance: <span className="tabular-nums font-semibold">{fmtFlat(combat.critChancePenalty)}</span></li>
          </ul>
          {combatReasons.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {combatReasons.map((r) => (
                <span
                  key={r}
                  className="rounded-full border border-white/15 bg-black/25 px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-white/70"
                >
                  {r}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-[11px] text-emerald-200/70">No combat penalties.</p>
          )}
        </div>

        <div className="rounded-xl border border-amber-400/20 bg-amber-500/5 p-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-amber-200/70">
            Crafting
          </div>
          <ul className="mt-2 space-y-1 text-xs leading-relaxed text-white/75">
            <li>Success mult: <span className="tabular-nums font-semibold">{fmtMult(crafting.successMult)}</span></li>
            <li>Misfire weight: <span className="tabular-nums font-semibold">{Math.round(crafting.sideEffectWeight * 100)}%</span></li>
            <li>Can misfire: <span className="font-semibold">{crafting.canMisfire ? "yes" : "no"}</span></li>
          </ul>
          {craftingReasons.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {craftingReasons.map((r) => (
                <span
                  key={r}
                  className="rounded-full border border-white/15 bg-black/25 px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-white/70"
                >
                  {r}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-[11px] text-emerald-200/70">No crafting penalties.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function tierRank(t: ConsequenceTier): number {
  switch (t) {
    case "none":
      return 0;
    case "wear":
      return 1;
    case "strain":
      return 2;
    case "danger":
      return 3;
    case "critical":
      return 4;
  }
}
