import type { CombatResult, CombatRound } from "@/features/arena/combatResolver";

export type ArenaReplaySummaryProps = {
  result: CombatResult;
  /** Side A display label (usually the player). */
  sideALabel: string;
  /** Side B display label (usually the opponent). */
  sideBLabel: string;
  /** Optional ranking delta to show next to the verdict. */
  ratingDelta?: number;
  /** Called when the viewer scrubs to a specific round (0-indexed). */
  onReplayRound?: (roundIndex: number) => void;
  /** Highlighted round (e.g. driven by a scrubber). */
  activeRoundIndex?: number | null;
};

function actionLabel(action: CombatRound["action"]): string {
  if (action === "strike") return "Strike";
  if (action === "burst") return "Burst";
  if (action === "guard") return "Guard";
  return "Stall";
}

function priorityLabel(priority: CombatRound["priority"]): string {
  return priority
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

function actionChipClasses(action: CombatRound["action"]): string {
  if (action === "burst") return "border-red-500/30 bg-red-500/10 text-red-100";
  if (action === "guard")
    return "border-cyan-500/30 bg-cyan-500/10 text-cyan-100";
  if (action === "stall")
    return "border-amber-500/30 bg-amber-500/10 text-amber-100";
  return "border-white/15 bg-white/5 text-white/80";
}

export default function ArenaReplaySummary({
  result,
  sideALabel,
  sideBLabel,
  ratingDelta,
  onReplayRound,
  activeRoundIndex,
}: ArenaReplaySummaryProps) {
  const winnerLabel = result.winnerIdx === 0 ? sideALabel : sideBLabel;
  const deltaText =
    typeof ratingDelta === "number"
      ? `${ratingDelta >= 0 ? "+" : ""}${ratingDelta} SR`
      : null;

  return (
    <div className="space-y-4">
      <div className="rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(24,16,24,0.92),rgba(10,10,16,0.96))] p-4">
        <div className="flex items-center justify-between">
          <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
            Verdict
          </div>
          {deltaText ? (
            <div
              className={[
                "rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]",
                (ratingDelta ?? 0) >= 0
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
                  : "border-red-500/30 bg-red-500/10 text-red-100",
              ].join(" ")}
            >
              {deltaText}
            </div>
          ) : null}
        </div>

        <div className="mt-3 text-lg font-black uppercase tracking-[0.04em] text-white">
          {winnerLabel} wins
          {result.cappedOut ? " (time)" : ""}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
              {sideALabel}
            </div>
            <div className="mt-1 text-white/85">
              HP {result.finalHp[0]} · DMG {result.damageDealt[0]}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
              {sideBLabel}
            </div>
            <div className="mt-1 text-white/85">
              HP {result.finalHp[1]} · DMG {result.damageDealt[1]}
            </div>
          </div>
        </div>

        <p className="mt-3 text-xs text-white/50">
          Seed {result.seed} · {result.turns} turns resolved
        </p>
      </div>

      <div className="rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,16,24,0.92),rgba(10,10,16,0.96))] p-4">
        <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
          Round-by-round
        </div>

        <ol className="mt-3 max-h-[420px] space-y-2 overflow-y-auto pr-1">
          {result.rounds.map((round, idx) => {
            const attackerLabel =
              round.attackerIdx === 0 ? sideALabel : sideBLabel;
            const isActive = activeRoundIndex === idx;
            return (
              <li key={`${round.turn}-${idx}`}>
                <button
                  type="button"
                  onClick={() => onReplayRound?.(idx)}
                  className={[
                    "block w-full rounded-xl border px-3 py-2 text-left text-sm transition",
                    isActive
                      ? "border-white/30 bg-white/10"
                      : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-8 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                        T{round.turn}
                      </span>
                      <span
                        className={[
                          "rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em]",
                          actionChipClasses(round.action),
                        ].join(" ")}
                      >
                        {actionLabel(round.action)}
                      </span>
                      <span className="text-white/80">{attackerLabel}</span>
                    </div>
                    <div className="text-right text-white/70">
                      {round.damage > 0 ? `-${round.damage}` : "—"}
                      {round.crit ? (
                        <span className="ml-1 text-amber-300">CRIT</span>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-white/45">
                    <span>{priorityLabel(round.priority)}</span>
                    <span>
                      HP {round.attackerHpAfter} / {round.defenderHpAfter}
                    </span>
                  </div>
                  {round.firedTriggers.length > 0 ? (
                    <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/40">
                      {round.firedTriggers.map((t) => t.id).join(" · ")}
                    </div>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
