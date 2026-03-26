"use client";

type MissionResultProps = {
  title: string;
  detail: string;
  rankXp: number;
  masteryProgress: number;
  influence: number;
  conditionDelta: number;
  resources: Array<[string, number]>;
  formatRewardLabel: (key: string) => string;
  onReturn?: () => void;
};

export default function MissionResult(props: MissionResultProps) {
  const {
    title,
    detail,
    rankXp,
    masteryProgress,
    influence,
    conditionDelta,
    resources,
    formatRewardLabel,
    onReturn,
  } = props;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4">
        <div className="text-[10px] uppercase tracking-[0.18em] text-emerald-200/70">
          Mission Result
        </div>
        <div className="mt-2 text-lg font-black uppercase tracking-[0.05em] text-white">
          {title}
        </div>
        <div className="mt-1 text-sm text-white/70">{detail}</div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/85">
            +{rankXp} XP
          </span>
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/85">
            +{masteryProgress} Mastery
          </span>
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/85">
            +{influence} Influence
          </span>
          <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs text-red-200">
            {conditionDelta} Condition
          </span>
          {resources.map(([key, value]) => (
            <span
              key={key}
              className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-100"
            >
              +{value} {formatRewardLabel(key)}
            </span>
          ))}
        </div>

        {onReturn ? (
          <button
            type="button"
            onClick={onReturn}
            className="mt-4 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/80 hover:border-white/25 hover:bg-white/10"
          >
            Back to board
          </button>
        ) : null}
      </div>
    </div>
  );
}

