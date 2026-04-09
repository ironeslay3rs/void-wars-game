import type { ArenaMode } from "@/features/arena/arenaTypes";

type QueueState = "idle" | "searching" | "matched";

type ArenaConsoleCardProps = {
  condition: number;
  barClassName: string;
  selectedMode: ArenaMode;
  canQueueSelectedMode: boolean;
  queueState: QueueState;
  onQueue: () => void;
  onCancelQueue: () => void;
  onEnterMatch: () => void;
};

export default function ArenaConsoleCard({
  condition,
  barClassName,
  selectedMode,
  canQueueSelectedMode,
  queueState,
  onQueue,
  onCancelQueue,
  onEnterMatch,
}: ArenaConsoleCardProps) {
  const isPractice = selectedMode.id === "practice";
  const gateLabel = isPractice
    ? "Practice lane"
    : canQueueSelectedMode
      ? "Eligible"
      : "Ranked locked";

  const gatePositive = isPractice || canQueueSelectedMode;

  const headline = isPractice
    ? "Sparring lane — no SR / condition swing"
    : canQueueSelectedMode
      ? "Combat systems nominal"
      : "Condition too low for this mode";

  return (
    <div className="space-y-4">
      <div className="rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(24,16,24,0.92),rgba(10,10,16,0.96))] p-4">
        <div className="flex items-center justify-between">
          <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
            Queue State
          </div>

          <div
            className={[
              "rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]",
              gatePositive
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
                : "border-red-500/30 bg-red-500/10 text-red-100",
            ].join(" ")}
          >
            {gateLabel}
          </div>
        </div>

        <div className="mt-3 text-lg font-black uppercase tracking-[0.04em] text-white">
          {headline}
        </div>

        <div className="mt-3 h-3 overflow-hidden rounded-full border border-white/10 bg-white/5">
          <div
            className={[
              "h-full rounded-full bg-gradient-to-r",
              barClassName,
            ].join(" ")}
            style={{ width: `${condition}%` }}
          />
        </div>

        <p className="mt-3 text-sm text-white/60">
          Current condition: {condition}%.
          {isPractice
            ? " Practice ignores the 40% ranked gate — payouts are reduced in-match."
            : " Ranked & tournament require 40% or above to queue."}
        </p>
      </div>

      <div className="rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,16,24,0.92),rgba(10,10,16,0.96))] p-4">
        <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
          Selected Mode
        </div>

        <div className="mt-3 text-lg font-black uppercase tracking-[0.04em] text-white">
          {selectedMode.title}
        </div>

        <div className="mt-1 text-sm text-white/75">
          {selectedMode.subtitle}
        </div>

        <p className="mt-3 text-sm leading-6 text-white/60">
          {selectedMode.body}
        </p>
      </div>

      <div className="rounded-[20px] border border-dashed border-white/10 bg-white/[0.02] p-4">
        <div className="space-y-4">
          {queueState === "idle" && (
            <>
              <div className="text-sm text-white/50">
                Ready to enter matchmaking for the selected arena mode.
              </div>

              <button
                type="button"
                onClick={onQueue}
                disabled={!canQueueSelectedMode}
                className={[
                  "w-full rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-[0.1em] transition",
                  canQueueSelectedMode
                    ? "bg-white text-black hover:brightness-110"
                    : "cursor-not-allowed bg-white/10 text-white/30",
                ].join(" ")}
              >
                Enter {selectedMode.title} Queue
              </button>
            </>
          )}

          {queueState === "searching" && (
            <div className="space-y-3">
              <div className="text-center text-sm font-semibold uppercase tracking-[0.12em] text-cyan-200">
                Searching for opponent...
              </div>

              <div className="h-2 overflow-hidden rounded-full border border-white/10 bg-white/5">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-cyan-300 to-violet-400" />
              </div>

              <div className="text-center text-sm text-white/50">
                Linking combat channel for {selectedMode.title}.
              </div>

              <button
                type="button"
                onClick={onCancelQueue}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold uppercase tracking-[0.1em] text-white/85 transition hover:border-white/25 hover:bg-white/10"
              >
                Cancel Queue
              </button>
            </div>
          )}

          {queueState === "matched" && (
            <div className="space-y-3">
              <div className="text-center text-sm font-semibold uppercase tracking-[0.12em] text-emerald-300">
                Match Found
              </div>

              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-100">
                Preparing combat link for {selectedMode.title}.
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={onEnterMatch}
                  className="rounded-xl bg-emerald-300 px-4 py-3 text-sm font-bold uppercase tracking-[0.1em] text-black transition hover:brightness-110"
                >
                  Enter Match
                </button>

                <button
                  type="button"
                  onClick={onCancelQueue}
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold uppercase tracking-[0.1em] text-white/85 transition hover:border-white/25 hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}