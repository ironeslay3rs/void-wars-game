import type { PathType } from "@/features/game/gameTypes";
import type { RankEntry, RankTier } from "@/features/arena/rankingSystem";

export type LadderEntry = {
  rank: number;
  handle: string;
  school: PathType;
  rating: number;
  tier: RankTier;
  wins: number;
  losses: number;
  winStreak: number;
};

export type ArenaRankingLadderProps = {
  seasonLabel: string;
  /** Sorted top leaderboard entries (rank 1..N). */
  topEntries: LadderEntry[];
  /** The viewing player's current rank entry. */
  playerEntry: RankEntry;
  /** Optional rank number (global placement) for the player. */
  playerRank?: number | null;
  /** Display handle for the player row. */
  playerHandle: string;
  /** Player's school — used for empire identity label. */
  playerSchool: PathType;
  onViewEntry?: (entry: LadderEntry) => void;
};

const EMPIRE_LABEL: Record<PathType, string> = {
  bio: "Verdant Coil",
  mecha: "Chrome Synod",
  pure: "Ember Vault",
};

const TIER_CLASS: Record<RankTier, string> = {
  unranked: "border-white/15 bg-white/5 text-white/60",
  iron: "border-zinc-500/30 bg-zinc-500/10 text-zinc-100",
  bronze: "border-amber-700/40 bg-amber-700/10 text-amber-100",
  silver: "border-slate-300/30 bg-slate-300/10 text-slate-100",
  gold: "border-yellow-400/30 bg-yellow-400/10 text-yellow-100",
  platinum: "border-teal-300/30 bg-teal-300/10 text-teal-100",
  diamond: "border-sky-300/30 bg-sky-300/10 text-sky-100",
  void: "border-violet-400/40 bg-violet-500/15 text-violet-100",
};

function formatTier(tier: RankTier): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

function TierChip({ tier }: { tier: RankTier }) {
  return (
    <span
      className={[
        "rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em]",
        TIER_CLASS[tier],
      ].join(" ")}
    >
      {formatTier(tier)}
    </span>
  );
}

export default function ArenaRankingLadder({
  seasonLabel,
  topEntries,
  playerEntry,
  playerRank,
  playerHandle,
  playerSchool,
  onViewEntry,
}: ArenaRankingLadderProps) {
  const playerGames = playerEntry.wins + playerEntry.losses;
  const winRate =
    playerGames > 0 ? Math.round((playerEntry.wins / playerGames) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(24,16,24,0.92),rgba(10,10,16,0.96))] p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
              Your Standing
            </div>
            <div className="mt-1 text-lg font-black uppercase tracking-[0.04em] text-white">
              {playerHandle}
            </div>
            <div className="text-sm text-white/60">
              {EMPIRE_LABEL[playerSchool]} · {seasonLabel}
            </div>
          </div>
          <TierChip tier={playerEntry.tier} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
              SR
            </div>
            <div className="mt-1 font-semibold text-white/85">
              {playerEntry.rating}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
              Rank
            </div>
            <div className="mt-1 font-semibold text-white/85">
              {playerRank ? `#${playerRank}` : "—"}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
              W/L
            </div>
            <div className="mt-1 font-semibold text-white/85">
              {playerEntry.wins}/{playerEntry.losses}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
              Winrate
            </div>
            <div className="mt-1 font-semibold text-white/85">
              {winRate}% · {playerEntry.winStreak}W streak
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,16,24,0.92),rgba(10,10,16,0.96))] p-4">
        <div className="flex items-center justify-between">
          <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
            Top Ladder — {seasonLabel}
          </div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
            {topEntries.length} shown
          </div>
        </div>

        <ol className="mt-3 space-y-2">
          {topEntries.map((entry) => (
            <li key={`${entry.rank}-${entry.handle}`}>
              <button
                type="button"
                onClick={() => onViewEntry?.(entry)}
                className="block w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left transition hover:border-white/20 hover:bg-white/[0.06]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 text-center text-sm font-black text-white/85">
                      {entry.rank}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-white/90">
                        {entry.handle}
                      </div>
                      <div className="text-xs text-white/50">
                        {EMPIRE_LABEL[entry.school]}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <TierChip tier={entry.tier} />
                    <div className="text-right text-sm">
                      <div className="font-semibold text-white/85">
                        SR {entry.rating}
                      </div>
                      <div className="text-xs text-white/50">
                        {entry.wins}W / {entry.losses}L
                        {entry.winStreak > 0 ? ` · ${entry.winStreak}W streak` : ""}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ol>

        {topEntries.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-center text-sm text-white/50">
            Ladder empty — season {seasonLabel} awaits its first duel.
          </div>
        ) : null}
      </div>
    </div>
  );
}
