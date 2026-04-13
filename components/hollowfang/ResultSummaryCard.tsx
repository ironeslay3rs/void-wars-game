/**
 * ResultSummaryCard — post-encounter outcome for Hollowfang.
 *
 * Shows victory/partial/wipe, phases cleared, damage suffered, rewards rolled
 * (including any Phase 2 named materials), and the condition/corruption tax.
 * Presentational — feature screens wire the `onDismiss` callback.
 */

import type {
  EncounterResult,
  EncounterOutcome,
} from "@/features/hollowfang/encounterResolver";
import type { HollowfangRewardBundle } from "@/features/hollowfang/rewardTable";
import type { ResourceKey } from "@/features/game/gameTypes";

export type ResultSummaryCardProps = {
  result: EncounterResult;
  reward: HollowfangRewardBundle;
  onDismiss?: () => void;
  className?: string;
};

const OUTCOME_TONE: Record<
  EncounterOutcome,
  { label: string; flavor: string; frame: string; chip: string }
> = {
  victory: {
    label: "Victory",
    flavor: "The Hollowfang falls.",
    frame: "border-emerald-400/40",
    chip: "border-emerald-400/40 bg-emerald-500/15 text-emerald-100",
  },
  partial: {
    label: "Partial",
    flavor: "You broke it, but it broke you too.",
    frame: "border-amber-400/35",
    chip: "border-amber-400/40 bg-amber-500/15 text-amber-100",
  },
  wipe: {
    label: "Wipe",
    flavor: "It ate the attempt.",
    frame: "border-rose-500/50",
    chip: "border-rose-400/45 bg-rose-500/15 text-rose-100",
  },
};

const RESOURCE_LABEL: Partial<Record<ResourceKey, string>> = {
  bloodvein: "Bloodvein",
  ashveil: "Ashveil",
  ironHeart: "Ironheart",
  runeDust: "Rune Dust",
  emberCore: "Ember Core",
  scrapAlloy: "Scrap Alloy",
  credits: "Credits",
};

function resourceLabel(k: ResourceKey): string {
  return RESOURCE_LABEL[k] ?? k;
}

export default function ResultSummaryCard({
  result,
  reward,
  onDismiss,
  className,
}: ResultSummaryCardProps) {
  const tone = OUTCOME_TONE[result.outcome];
  const phases = result.phasesCleared;
  const readinessPct = Math.max(0, Math.min(100, Math.round(result.readiness * 100)));

  return (
    <section
      aria-label={`Hollowfang outcome · ${tone.label}`}
      className={`rounded-[22px] border ${tone.frame} bg-[linear-gradient(180deg,rgba(14,16,26,0.94),rgba(7,9,15,0.97))] p-5 text-white shadow-[0_12px_32px_rgba(0,0,0,0.35)] backdrop-blur ${className ?? ""}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/45">
            Hollowfang · Result
          </div>
          <div className="mt-1 text-xl font-black uppercase tracking-[0.08em] text-white">
            {tone.label}
          </div>
          <p className="mt-1 text-[12px] italic text-violet-100/70">
            {reward.flavor || tone.flavor}
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${tone.chip}`}
        >
          Phases {phases} / 3
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <StatCell label="Damage Suffered" value={`${result.damageSuffered}`} />
        <StatCell label="Readiness" value={`${readinessPct} / 100`} />
        <StatCell label="Reward Tier" value={result.rewardTier} upper />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-black/30 p-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
            Rewards
          </div>
          {reward.resources.length === 0 ? (
            <p className="mt-2 text-[12px] text-white/55">
              No resources rolled.
            </p>
          ) : (
            <ul className="mt-2 space-y-1 text-[12px]" role="list">
              {reward.resources.map((r) => (
                <li
                  key={r.key}
                  className="flex items-baseline justify-between border-b border-white/5 pb-1 last:border-0"
                >
                  <span className="text-white/75">{resourceLabel(r.key)}</span>
                  <span className="font-bold tabular-nums text-emerald-200">
                    +{r.amount}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {reward.namedMaterials.length > 0 ? (
            <div className="mt-3 space-y-1">
              <div className="text-[9px] uppercase tracking-[0.16em] text-amber-200/70">
                Named Materials
              </div>
              {reward.namedMaterials.map((n) => (
                <div
                  key={n.id}
                  className="rounded-lg border border-amber-400/25 bg-amber-500/8 px-2 py-1 text-[11px] text-amber-100"
                >
                  {n.label}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="rounded-xl border border-rose-400/25 bg-rose-500/8 p-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-rose-200/75">
            Losses
          </div>
          <ul className="mt-2 space-y-1 text-[12px]" role="list">
            <li className="flex items-baseline justify-between">
              <span className="text-white/75">Condition cost</span>
              <span className="font-bold tabular-nums text-rose-200">
                -{result.conditionCost}
              </span>
            </li>
            <li className="flex items-baseline justify-between">
              <span className="text-white/75">Corruption gain</span>
              <span className="font-bold tabular-nums text-fuchsia-200">
                +{result.corruptionGain}
              </span>
            </li>
          </ul>
          <p className="mt-2 text-[10px] text-white/45">
            Flesh and soul tax. Rest or vent before the next attempt.
          </p>
        </div>
      </div>

      {result.phaseTrace.length > 0 ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
            Phase Trace
          </div>
          <ul className="mt-2 space-y-1 text-[11px]" role="list">
            {result.phaseTrace.map((t) => (
              <li
                key={t.phaseId}
                className="flex items-baseline justify-between gap-2"
              >
                <span className="text-white/75">
                  P{t.order} · {t.phaseId}
                </span>
                <span className="tabular-nums text-white/60">
                  {t.turnsUsed}t · {t.cleared ? "cleared" : "timeout"} ·{" "}
                  tells {t.tellsCountered}/{t.tellsLanded + t.tellsCountered}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="mt-4 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white/80 transition hover:bg-white/10"
        >
          Dismiss
        </button>
      ) : null}
    </section>
  );
}

function StatCell({
  label,
  value,
  upper,
}: {
  label: string;
  value: string;
  upper?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-3">
      <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
        {label}
      </div>
      <div
        className={`mt-0.5 text-sm font-bold tabular-nums text-white ${upper ? "uppercase tracking-[0.08em]" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}
