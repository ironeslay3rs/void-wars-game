import PanelFrame from "@/components/shared/PanelFrame";
import { PathType } from "@/features/game/gameTypes";
import { getHungerLabel } from "@/features/status/survival";

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
  nextStepLabel: string;
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
  nextStepLabel,
}: ConditionWidgetProps) {
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
  const pressureState =
    condition < 40
      ? "Recovery urgent."
      : hungerStateLabel === "Starving"
        ? "Hunger pressure active."
        : "Field state stable.";

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
          Live readout for survival pressure, rank, and current alignment.
        </p>
      </div>

      <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/8 p-3">
        <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-200/70">
          Loop Readout
        </div>
        <div className="mt-2 text-sm font-semibold text-white">
          {loopStateLabel}
        </div>
        <div className="mt-1 text-xs text-cyan-50/80">
          Next: {nextStepLabel}
        </div>
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
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                Pressure
              </div>
              <div className="mt-1 text-sm font-semibold text-white">
                {pressureState}
              </div>
            </div>

            <div className="text-right text-xs text-white/55">
              Survival Readout
            </div>
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
                {condition}%
              </div>
            </div>

            <div className="text-right text-xs text-white/55">
              {conditionLabel}
            </div>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${Math.max(0, Math.min(100, condition))}%` }}
            />
          </div>
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
