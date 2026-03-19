import FactionPathPanel from "@/components/home/FactionPathPanel";
import type { FactionAlignment, GameState } from "@/features/game/gameTypes";

type PathSelection = Exclude<FactionAlignment, "unbound">;

type MainMenuRightRailProps = {
  selectedPath: PathSelection | null;
  onSelectPath: (path: PathSelection) => void;
  state: GameState;
};

function getConditionLabel(condition: number) {
  if (condition >= 80) return "System condition optimal.";
  if (condition >= 60) return "System condition stable.";
  if (condition >= 40) return "System condition strained.";
  return "System condition critical.";
}

export default function MainMenuRightRail({
  selectedPath,
  onSelectPath,
  state,
}: MainMenuRightRailProps) {
  const condition = state.player.condition;
  const mastery = state.player.masteryProgress;
  const alignment =
    state.player.factionAlignment === "unbound"
      ? "UNBOUND"
      : state.player.factionAlignment.toUpperCase();

  return (
    <div className="space-y-4">
      <FactionPathPanel
        selectedPath={selectedPath}
        onSelectPath={onSelectPath}
      />

      <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(16,12,22,0.86),rgba(8,8,14,0.94))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-md">
        <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">
          Condition
        </div>

        <div className="mt-4 flex items-end justify-between gap-4">
          <div className="text-[52px] font-black leading-none text-white">
            {condition}%
          </div>

          <div className="pb-1 text-right text-xs uppercase tracking-[0.24em] text-cyan-300/80">
            Vital Monitor
          </div>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,rgba(255,70,70,0.9),rgba(0,220,255,0.92))]"
            style={{ width: `${Math.max(0, Math.min(100, condition))}%` }}
          />
        </div>

        <div className="mt-3 text-sm text-white/65">
          {getConditionLabel(condition)}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-[18px] border border-white/10 bg-black/25 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/38">
              Alignment
            </div>
            <div className="mt-2 text-lg font-black uppercase text-white">
              {alignment}
            </div>
          </div>

          <div className="rounded-[18px] border border-white/10 bg-black/25 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/38">
              Mastery
            </div>
            <div className="mt-2 text-lg font-black uppercase text-white">
              {mastery}%
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}