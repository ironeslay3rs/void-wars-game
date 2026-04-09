import PanelFrame from "@/components/shared/PanelFrame";
import { PathType } from "@/features/game/gameTypes";
import { getHungerLabel } from "@/features/status/survival";
import type { ProgressionMeaning } from "@/features/game/gameSelectors";
import Link from "next/link";

type ConditionWidgetProps = {
  path: PathType | null;
  rank: string;
  rankLevel: number;
  rankXp: number;
  rankXpToNext: number;
  condition: number;
  hunger: number;
  masteryProgress: number;
  loopStateLabel: string;
  /** One-line objective from first-session guidance (what the loop is asking for now). */
  loopObjective: string;
  nextStepLabel: string;
  /** Path rhythm (Bio / Mecha / Pure / unbound) — teaches the core cadence. */
  pathRhythmHint: string;
  progressionMeaning: ProgressionMeaning;
};

export default function ConditionWidget({
  path,
  rank,
  rankLevel,
  rankXp,
  rankXpToNext,
  condition,
  hunger,
  masteryProgress,
  loopStateLabel,
  loopObjective,
  nextStepLabel,
  pathRhythmHint,
  progressionMeaning,
}: ConditionWidgetProps) {
  const isCriticalSurvival = condition <= 0 || hunger <= 0;
  const conditionLabel =
    condition >= 80
      ? "System condition optimal."
      : condition >= 60
        ? "System condition stable."
        : condition >= 40
          ? "System condition strained."
          : "System condition critical.";

  const xpPercent =
    rankXpToNext > 0 ? Math.min(100, (rankXp / rankXpToNext) * 100) : 0;

  const masteryPercent = Math.min(100, Math.max(0, masteryProgress));
  const hungerStateLabel = getHungerLabel(hunger);
  const hungerLabel =
    hungerStateLabel === "Fed"
      ? "Stores are full."
      : hungerStateLabel === "Low"
        ? "Stores are thinning."
        : "Starvation pressure rising.";

  const pathLabel = path ? path.toUpperCase() : "UNBOUND";

  return (
    <PanelFrame className="space-y-4">
      <div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
          Status
        </div>
        <h3 className="mt-1 text-lg font-semibold text-white">
          Condition Matrix
        </h3>
        <p className="mt-1 text-sm text-white/60">
          Pressure, rank, and path alignment — what the loop is asking for right now.
        </p>
        {isCriticalSurvival ? (
          <div className="mt-3 rounded-xl border border-amber-300/30 bg-amber-500/10 px-3 py-2 text-[11px] leading-relaxed text-amber-100/90">
            Condition/Hunger depleted. Open <Link className="underline decoration-amber-300/40 underline-offset-2 hover:text-amber-50" href="/status">Status</Link> to recover.
          </div>
        ) : null}
      </div>

      <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/8 p-3">
        <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-200/70">
          Loop Readout
        </div>
        <div className="mt-2 text-sm font-semibold text-white">
          {loopStateLabel}
        </div>
        {loopObjective.trim().length > 0 ? (
          <p className="mt-2 text-xs leading-relaxed text-cyan-50/75">
            {loopObjective}
          </p>
        ) : null}
        <div className="mt-2 text-xs text-cyan-50/80">
          Next: {nextStepLabel}
        </div>
        {pathRhythmHint.trim().length > 0 ? (
          <p className="mt-3 border-t border-cyan-400/15 pt-3 text-[11px] leading-relaxed text-cyan-100/50">
            <span className="font-semibold uppercase tracking-[0.12em] text-cyan-200/55">
              Path rhythm ·{" "}
            </span>
            {pathRhythmHint}
          </p>
        ) : null}
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
        <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
          {progressionMeaning.objectiveTitle}
        </div>
        <div className="mt-2 text-sm font-semibold text-white">
          {progressionMeaning.objectiveLine}
        </div>

        <div className="mt-4 text-[10px] uppercase tracking-[0.18em] text-white/45">
          {progressionMeaning.whyTitle}
        </div>
        <div className="mt-2 text-xs leading-5 text-white/70">
          {progressionMeaning.whyLine}
        </div>

        {progressionMeaning.chips.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {progressionMeaning.chips.slice(0, 2).map((chip) => (
              <span
                key={chip.id}
                className="rounded-full border border-white/15 bg-black/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/80"
              >
                {chip.label}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid gap-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
            Alignment
          </div>
          <div className="mt-1 text-sm font-semibold text-white">
            {pathLabel}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                Rank
              </div>
              <div className="mt-1 text-sm font-semibold text-white">
                {rank} - Lv. {rankLevel}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                XP
              </div>
              <div className="mt-1 text-sm text-white/75">
                {rankXp} / {rankXpToNext}
              </div>
            </div>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-red-500 transition-all"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-white/55">
            Rank is earned through hunts, missions, and contracts.
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                Hunger
              </div>
              <div className="mt-1 text-sm font-semibold text-white">
                {hunger}%
              </div>
            </div>

            <div className="text-right text-xs text-white/55">
              {hungerLabel}
            </div>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-amber-400 transition-all"
              style={{ width: `${Math.max(0, Math.min(100, hunger))}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                Condition
              </div>
              <div className="mt-1 text-sm font-semibold text-white">
                {condition === 0 ? "Awaiting field data" : `${condition}%`}
              </div>
            </div>

            <div className="text-right text-xs text-white/55">
              {condition === 0 ? "—" : conditionLabel}
            </div>
          </div>

          {condition !== 0 ? (
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${Math.max(0, Math.min(100, condition))}%` }}
              />
            </div>
          ) : null}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                Mastery
              </div>
              <div className="mt-1 text-sm font-semibold text-white">
                {masteryProgress}%
              </div>
            </div>

            <div className="text-right text-xs text-white/55">
              Evolution progress
            </div>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-cyan-500 transition-all"
              style={{ width: `${masteryPercent}%` }}
            />
          </div>
        </div>
      </div>
    </PanelFrame>
  );
}
