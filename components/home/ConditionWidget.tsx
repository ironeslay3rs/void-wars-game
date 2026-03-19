import SectionTitle from "@/components/shared/SectionTitle";
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
  activeMissionId: string | null;
};

export default function ConditionWidget({
  path,
  rank,
  rankLevel,
  rankXp,
  rankXpToNext,
  condition,
  masteryProgress,
  activeMissionId,
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

  return (
    <PanelFrame>
      <SectionTitle title="Condition" />

      <div className="mt-5 flex items-center gap-4">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-cyan-400/70 text-[28px] font-black text-white shadow-[0_0_24px_rgba(34,211,238,0.18)]">
          <div className="absolute inset-2 rounded-full border border-white/10" />
          <span className="relative z-10">{condition}%</span>
        </div>

        <div className="flex-1">
          <div className="h-[8px] overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,rgba(0,180,255,0.95),rgba(35,211,238,0.95))]"
              style={{ width: `${condition}%` }}
            />
          </div>

          <p className="mt-3 text-[13px] font-medium text-slate-300">
            {conditionLabel}
          </p>

          <div className="mt-3 space-y-1 text-[11px] uppercase tracking-[0.16em] text-white/45">
            <p>Path: {path ?? "Unassigned"}</p>
            <p>
              Rank: {rank} Lv.{rankLevel}
            </p>
            <p>Mastery: {masteryProgress}%</p>
            <p>Mission: {activeMissionId ?? "None"}</p>
          </div>

          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
              <span>Rank XP</span>
              <span>
                {rankXp} / {rankXpToNext}
              </span>
            </div>

            <div className="h-[6px] overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,rgba(168,85,247,0.95),rgba(59,130,246,0.95))]"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </PanelFrame>
  );
}