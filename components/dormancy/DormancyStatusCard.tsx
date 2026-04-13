/**
 * DormancyStatusCard — Offline-punishment status summary.
 *
 * Fusion pillars:
 *   - AFK Journey clarity: next-step is obvious — the Stabilize CTA is the
 *     single action the player needs to reintegrate.
 *   - Darkest Dungeon readable punishment: every tier bites visibly; each
 *     bullet names the exact consequence in plain language.
 *
 * Canon:
 *   - Tier labels are canon from lore-canon/CLAUDE.md Offline Lifecycle:
 *     Stable → Strained → Dormant → Displaced. Used verbatim.
 *   - Flavor lines draw from `lore-canon/01 Master Canon/World Laws/The
 *     Void.md` — absence is erosion. Pure, never "Spirit".
 *
 * Presentational only: props-in, callbacks-out. No useGame/dispatch.
 * Callers must compute `elapsedHours` upstream — we do not touch
 * `Date.now()` inside the component body.
 */

import {
  DORMANCY_LABEL,
  DORMANCY_SEVERITY,
  DORMANCY_TIER_HOURS,
  classifyDormancy,
  hoursIntoTier,
  type DormancyTier,
} from "@/features/dormancy/dormancyTiers";
import {
  DORMANCY_EFFECTS,
  computeRecoveryCost,
} from "@/features/dormancy/dormancyEffects";

export type DormancyStatusCardProps = {
  /**
   * Offline hours since the player was last seen. Caller (host screen)
   * computes this from state + a `now: Date` it controls. Non-finite /
   * negative values clamp to 0.
   */
  elapsedHours: number;
  /**
   * Credits the player currently holds. Gates the Stabilize CTA —
   * if insufficient, button is disabled and a hint appears.
   */
  credits?: number;
  /**
   * Fires when the player taps Stabilize. Host dispatches the actual
   * recovery action. Disabled if tier is Stable or onRecover is absent.
   */
  onRecover?: (tier: DormancyTier, cost: number) => void;
};

const TIER_TONE: Record<
  DormancyTier,
  { badge: string; frame: string; accent: string }
> = {
  stable: {
    badge: "border-emerald-400/35 bg-emerald-500/12 text-emerald-100",
    frame: "border-emerald-400/20",
    accent: "text-emerald-200/80",
  },
  strained: {
    badge: "border-amber-400/40 bg-amber-500/14 text-amber-100",
    frame: "border-amber-400/25",
    accent: "text-amber-200/85",
  },
  dormant: {
    badge: "border-rose-400/45 bg-rose-500/15 text-rose-100",
    frame: "border-rose-400/30",
    accent: "text-rose-200/90",
  },
  displaced: {
    badge: "border-fuchsia-400/55 bg-fuchsia-500/18 text-fuchsia-100",
    frame: "border-fuchsia-400/40",
    accent: "text-fuchsia-200/95",
  },
};

// Canon flavor — absence is erosion. Pure voice.
const TIER_FLAVOR: Record<DormancyTier, string> = {
  stable:
    "The vessel holds its shape. The Void presses, but finds nothing loose.",
  strained:
    "The first gap widens. Flesh begins to forget its own grammar.",
  dormant:
    "The Void has moved in. What was yours is being rewritten, slowly, line by line.",
  displaced:
    "You are no longer where you left yourself. Reintegration will cost, and cost dearly.",
};

// Per-tier consequence bullets — readable, no math jargon.
function consequenceBullets(tier: DormancyTier): string[] {
  const fx = DORMANCY_EFFECTS[tier];
  if (tier === "stable") {
    return [
      "No condition drain.",
      "No corruption creep.",
      "Full rewards on return.",
    ];
  }
  const rewardPct = Math.round((1 - fx.rewardPenaltyMult) * 100);
  const costPct = Math.round((fx.recoveryCostMult - 1) * 100);
  return [
    `Condition drains ~${fx.conditionDrainPerDay} / day offline.`,
    `Corruption creeps +${fx.corruptionGainPerDay} / day offline.`,
    rewardPct > 0
      ? `Rewards shaved ${rewardPct}% while in tier.`
      : "Rewards unchanged while in tier.",
    costPct > 0
      ? `Reintegration costs +${costPct}% until stabilized.`
      : "Reintegration at base cost.",
  ];
}

function formatHours(h: number): string {
  if (h < 1) return `${Math.max(0, Math.round(h * 60))}m`;
  if (h < 24) return `${Math.round(h)}h`;
  const days = h / 24;
  return `${days.toFixed(1)}d`;
}

function tierCapHours(tier: DormancyTier): number | null {
  switch (tier) {
    case "stable":
      return DORMANCY_TIER_HOURS.stable;
    case "strained":
      return DORMANCY_TIER_HOURS.strained - DORMANCY_TIER_HOURS.stable;
    case "dormant":
      return DORMANCY_TIER_HOURS.dormant - DORMANCY_TIER_HOURS.strained;
    case "displaced":
      return null; // open-ended
  }
}

export default function DormancyStatusCard({
  elapsedHours,
  credits,
  onRecover,
}: DormancyStatusCardProps) {
  const safeHours =
    Number.isFinite(elapsedHours) && elapsedHours > 0 ? elapsedHours : 0;
  const tier = classifyDormancy(safeHours);
  const into = hoursIntoTier(safeHours);
  const tone = TIER_TONE[tier];
  const severity = DORMANCY_SEVERITY[tier];
  const cost = computeRecoveryCost(tier);
  const bullets = consequenceBullets(tier);
  const cap = tierCapHours(tier);

  const canRecover =
    tier !== "stable" &&
    typeof onRecover === "function" &&
    (credits === undefined || credits >= cost);
  const insufficient =
    tier !== "stable" &&
    typeof credits === "number" &&
    credits < cost;

  const progressPct =
    cap === null
      ? 100
      : Math.max(0, Math.min(100, (into / cap) * 100));

  return (
    <div
      className={`rounded-[22px] border ${tone.frame} bg-[linear-gradient(135deg,rgba(30,12,36,0.45),rgba(8,10,18,0.92))] p-5 backdrop-blur`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-white/45">
            Offline Dormancy
          </div>
          <div className="mt-1 text-lg font-black uppercase tracking-[0.1em] text-white">
            {DORMANCY_LABEL[tier]}
          </div>
          <p className={`mt-1 text-[11px] uppercase tracking-[0.14em] ${tone.accent}`}>
            Severity {severity} / 3 · absence is erosion
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${tone.badge}`}
        >
          {DORMANCY_LABEL[tier]}
        </span>
      </div>

      <p className="mt-4 text-sm italic leading-relaxed text-violet-100/70">
        {TIER_FLAVOR[tier]}
      </p>

      <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-3">
        <div className="flex items-baseline justify-between">
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">
            Time in tier
          </div>
          <div className="tabular-nums text-xs font-semibold text-white/80">
            {formatHours(into)}
            {cap !== null ? (
              <span className="text-white/40"> / {formatHours(cap)}</span>
            ) : (
              <span className="text-white/40"> · open</span>
            )}
          </div>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/50">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500/70 to-fuchsia-500/70 transition-[width] duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <ul className="mt-4 space-y-1.5 text-xs leading-relaxed text-white/80">
        {bullets.map((b) => (
          <li key={b} className="flex gap-2">
            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-white/40" />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
        <div>
          <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
            Stabilize cost
          </div>
          <div className="mt-0.5 text-sm font-black tabular-nums text-white">
            {cost > 0 ? `${cost} cr` : "—"}
          </div>
          {insufficient ? (
            <div className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-rose-300/80">
              Need {cost - (credits ?? 0)} more credits
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => onRecover?.(tier, cost)}
          disabled={!canRecover}
          className="rounded-xl border border-white/25 bg-white/[0.12] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:border-white/40 hover:bg-white/[0.18] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {tier === "stable" ? "Stable" : "Stabilize"}
        </button>
      </div>
    </div>
  );
}
