import PanelFrame from "@/components/shared/PanelFrame";
import { PathType } from "@/features/game/gameTypes";

type ConditionWidgetProps = {
  path: PathType | null;
  rank: string;
  rankLevel: number;
  rankXp: number;
  rankXpToNext: number;
  condition: number;
  masteryProgress: number;
};

export default function ConditionWidget({
  path,
  rank,
  rankLevel,
  rankXp,
  rankXpToNext,
  condition,
  masteryProgress,
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

  const pathLabel = path === "spirit" ? "PURE" : path ? path.toUpperCase() : "UNBOUND";

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
          Live status of rank, mastery, and current alignment.
        </p>
      </div>

      <div className="grid gap-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
            Doctrine
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
                {rank} · Lv. {rankLevel}
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