"use client";

/**
 * DailyRewardLadder — S/A/B/C tier preview strip for the daily hunt.
 * Presentational only. Consumes tier thresholds + a sample `DailyHunt` and
 * renders the payout the player would bank at each tier.
 *
 * Canon copy: Pure (NEVER "Spirit").
 */

import type { ResourceKey } from "@/features/game/gameTypes";
import type { DailyHunt } from "@/features/daily/huntRotation";
import type { BossWindow } from "@/features/daily/bossSchedule";
import {
  DAILY_TIER_THRESHOLDS,
  gradeDailyHunt,
  type DailyRewardTier,
} from "@/features/daily/rewardTiers";

const TIER_ACCENT: Record<DailyRewardTier, string> = {
  S: "border-amber-400/45 bg-amber-500/12 text-amber-100",
  A: "border-cyan-400/35 bg-cyan-500/12 text-cyan-100",
  B: "border-emerald-400/30 bg-emerald-500/10 text-emerald-100",
  C: "border-white/18 bg-white/[0.04] text-white/70",
};

const TIER_BLURB: Record<DailyRewardTier, string> = {
  S: "Flawless — full quota, boss down, inside par.",
  A: "Strong — quota and boss, slight pace slip allowed.",
  B: "Clean — quota cleared, partial bonus objectives.",
  C: "Partial — ran the clock, banked scraps.",
};

const RESOURCE_LABEL: Partial<Record<ResourceKey, string>> = {
  credits: "Credits",
  scrapAlloy: "Scrap",
  emberCore: "Ember",
  runeDust: "Rune Dust",
  bioSamples: "Bio",
};

function resourceLabel(key: ResourceKey): string {
  return RESOURCE_LABEL[key] ?? key;
}

/** Fabricate a representative performance snapshot at the tier floor. */
function performanceForTier(
  tier: DailyRewardTier,
  hunt: DailyHunt,
  scheduledWindow?: BossWindow | null,
) {
  const par = 600; // 10-minute par baseline, matches rewardTiers docs
  switch (tier) {
    case "S":
      return {
        mobsCleared: hunt.clearQuota,
        bossDefeated: true,
        elapsedSeconds: Math.round(par * 0.85),
        parSeconds: par,
        scheduledWindow: scheduledWindow ?? null,
      };
    case "A":
      return {
        mobsCleared: hunt.clearQuota,
        bossDefeated: true,
        elapsedSeconds: Math.round(par * 1.25),
        parSeconds: par,
        scheduledWindow: scheduledWindow ?? null,
      };
    case "B":
      return {
        mobsCleared: Math.max(1, Math.round(hunt.clearQuota * 0.85)),
        bossDefeated: false,
        elapsedSeconds: Math.round(par * 1.3),
        parSeconds: par,
        scheduledWindow: scheduledWindow ?? null,
      };
    case "C":
      return {
        mobsCleared: Math.max(1, Math.round(hunt.clearQuota * 0.55)),
        bossDefeated: false,
        elapsedSeconds: Math.round(par * 1.9),
        parSeconds: par,
        scheduledWindow: scheduledWindow ?? null,
      };
  }
}

function formatPayout(
  payouts: Partial<Record<ResourceKey, number>>,
): Array<{ key: ResourceKey; label: string; amount: number }> {
  const out: Array<{ key: ResourceKey; label: string; amount: number }> = [];
  for (const key of Object.keys(payouts) as ResourceKey[]) {
    const v = payouts[key];
    if (typeof v === "number" && v > 0) {
      out.push({ key, label: resourceLabel(key), amount: v });
    }
  }
  return out;
}

export type DailyRewardLadderProps = {
  hunt: DailyHunt;
  /** If provided, preview uses the window's bonus multiplier. */
  scheduledWindow?: BossWindow | null;
  className?: string;
};

export default function DailyRewardLadder({
  hunt,
  scheduledWindow,
  className,
}: DailyRewardLadderProps) {
  const rows = DAILY_TIER_THRESHOLDS.map(({ tier, minScore }) => {
    const perf = performanceForTier(tier, hunt, scheduledWindow);
    const reward = gradeDailyHunt(hunt, perf);
    return {
      tier,
      minScore,
      payouts: formatPayout(reward.payouts),
      multiplier: reward.rewardMultiplier,
    };
  });

  return (
    <section
      aria-label="Daily hunt reward ladder"
      className={`rounded-2xl border border-white/10 bg-white/[0.03] p-4 ${className ?? ""}`}
    >
      <div className="mb-3 flex items-baseline justify-between">
        <div className="text-xs font-black uppercase tracking-[0.18em] text-white/55">
          Reward ladder
        </div>
        <div className="text-[10px] uppercase tracking-[0.16em] text-white/35">
          Grade S · A · B · C
        </div>
      </div>
      <ul className="space-y-2">
        {rows.map((row) => (
          <li
            key={row.tier}
            className={`rounded-xl border px-3 py-2 ${TIER_ACCENT[row.tier]}`}
            aria-label={`Tier ${row.tier}: ${TIER_BLURB[row.tier]}`}
          >
            <div className="flex items-baseline justify-between gap-3">
              <div className="flex items-baseline gap-2">
                <span className="text-base font-black tabular-nums">{row.tier}</span>
                <span className="text-[10px] uppercase tracking-[0.14em] text-white/55">
                  {row.minScore}+ score
                </span>
              </div>
              <span className="text-[10px] uppercase tracking-[0.14em] text-white/50">
                x{row.multiplier.toFixed(2)}
              </span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-white/70">
              {TIER_BLURB[row.tier]}
            </p>
            {row.payouts.length > 0 ? (
              <ul
                className="mt-1.5 flex flex-wrap gap-1.5"
                aria-label={`Tier ${row.tier} payout preview`}
              >
                {row.payouts.map((p) => (
                  <li
                    key={p.key}
                    className="rounded-md border border-white/15 bg-black/25 px-2 py-0.5 text-[10px] font-semibold tracking-[0.04em] text-white/80"
                  >
                    {p.label} +{p.amount}
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
      {scheduledWindow ? (
        <p className="mt-3 text-[10px] leading-relaxed text-white/40">
          Payouts shown include the {scheduledWindow.tier === "apex" ? "apex" : "standard"} boss-window bonus.
        </p>
      ) : null}
    </section>
  );
}
