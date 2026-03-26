import { RUNE_DEPTH_MAX } from "@/features/mastery/runeMasteryLogic";
import type { RuneSchool } from "@/features/mastery/runeMasteryTypes";

/** Horizontal seven-step ladder — one track per school (mastery “tree” spine). */
export function SevenfoldDepthTrack({
  depth,
  school,
}: {
  depth: number;
  school: RuneSchool;
}) {
  const accent =
    school === "bio"
      ? "bg-emerald-400/85"
      : school === "mecha"
        ? "bg-amber-400/85"
        : "bg-violet-400/85";

  return (
    <div className="mt-3 w-full">
      <div className="flex h-2 gap-1">
        {Array.from({ length: RUNE_DEPTH_MAX }, (_, i) => {
          const lv = i + 1;
          const filled = lv <= depth;
          return (
            <div
              key={lv}
              title={`Depth L${lv}`}
              className={[
                "min-w-0 flex-1 rounded-sm transition-colors",
                filled ? accent : "bg-white/[0.08]",
              ].join(" ")}
            />
          );
        })}
      </div>
      <div className="mt-1.5 flex justify-between text-[9px] font-bold uppercase tracking-[0.12em] text-white/35">
        <span>L1</span>
        <span className="text-white/45">Sevenfold</span>
        <span>L{RUNE_DEPTH_MAX}</span>
      </div>
    </div>
  );
}
