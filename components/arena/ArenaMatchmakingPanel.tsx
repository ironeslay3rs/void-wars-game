import type { PathType } from "@/features/game/gameTypes";
import type { BehaviorProfile } from "@/features/arena/behaviorProfile";
import type { CombatLoadout } from "@/features/arena/combatResolver";
import type { RankTier } from "@/features/arena/rankingSystem";

export type MatchmakingStatus = "idle" | "searching" | "found" | "locked";

export type OpponentPreview = {
  handle: string;
  school: PathType;
  rating: number;
  tier: RankTier;
  winStreak: number;
  profile: BehaviorProfile;
  loadout: CombatLoadout;
};

export type ArenaMatchmakingPanelProps = {
  status: MatchmakingStatus;
  /** Player-side rating for expected-score preview. */
  playerRating: number;
  playerTier: RankTier;
  /** 0..1 expected score against opponent (Elo). Shown as %. */
  expected?: number;
  opponent?: OpponentPreview | null;
  onQueueMatch: () => void;
  onCancel: () => void;
  onLockIn: () => void;
};

const EMPIRE_LABEL: Record<PathType, string> = {
  bio: "Verdant Coil",
  mecha: "Chrome Synod",
  pure: "Ember Vault",
};

function formatTier(tier: RankTier): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
        {label}
      </span>
      <span className="font-semibold text-white/85">{value}</span>
    </div>
  );
}

export default function ArenaMatchmakingPanel({
  status,
  playerRating,
  playerTier,
  expected,
  opponent,
  onQueueMatch,
  onCancel,
  onLockIn,
}: ArenaMatchmakingPanelProps) {
  const expectedPct =
    typeof expected === "number" ? Math.round(expected * 100) : null;

  return (
    <div className="space-y-4">
      <div className="rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(24,16,24,0.92),rgba(10,10,16,0.96))] p-4">
        <div className="flex items-center justify-between">
          <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
            Matchmaker
          </div>
          <div
            className={[
              "rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]",
              status === "found" || status === "locked"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
                : status === "searching"
                  ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-100"
                  : "border-white/15 bg-white/5 text-white/60",
            ].join(" ")}
          >
            {status === "idle" && "Standby"}
            {status === "searching" && "Scanning"}
            {status === "found" && "Opponent Found"}
            {status === "locked" && "Locked"}
          </div>
        </div>

        <div className="mt-3 grid gap-2">
          <StatRow label="Your Rating" value={`SR ${playerRating}`} />
          <StatRow label="Your Tier" value={formatTier(playerTier)} />
        </div>
      </div>

      {status === "searching" && !opponent ? (
        <div className="rounded-[20px] border border-dashed border-white/10 bg-white/[0.02] p-4">
          <div className="text-center text-sm font-semibold uppercase tracking-[0.12em] text-cyan-200">
            Pairing ranked combatant...
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full border border-white/10 bg-white/5">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-cyan-300 to-violet-400" />
          </div>
        </div>
      ) : null}

      {opponent ? (
        <div className="rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,16,24,0.92),rgba(10,10,16,0.96))] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                Opponent Preview
              </div>
              <h3 className="mt-1 text-lg font-black uppercase tracking-[0.04em] text-white">
                {opponent.handle}
              </h3>
              <div className="text-sm text-white/60">
                {EMPIRE_LABEL[opponent.school]} &middot;{" "}
                {formatTier(opponent.tier)}
              </div>
            </div>
            <div className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">
              SR {opponent.rating}
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            <StatRow label="Loadout" value={opponent.loadout.label} />
            <StatRow label="Max HP" value={opponent.loadout.maxHp} />
            <StatRow
              label="Dmg Range"
              value={`${opponent.loadout.minDamage}–${opponent.loadout.maxDamage}`}
            />
            <StatRow
              label="Crit"
              value={`${Math.round(opponent.loadout.critChance * 100)}% x${opponent.loadout.critMultiplier.toFixed(2)}`}
            />
            <StatRow label="Streak" value={`${opponent.winStreak}W`} />
            {expectedPct !== null ? (
              <StatRow label="Win Odds" value={`${expectedPct}%`} />
            ) : null}
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
              Temperament
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-white/70">
              <span>Aggression {opponent.profile.temperament.aggression.toFixed(2)}</span>
              <span>Caution {opponent.profile.temperament.caution.toFixed(2)}</span>
              <span>Patience {opponent.profile.temperament.patience.toFixed(2)}</span>
              <span>Focus {opponent.profile.temperament.focus.toFixed(2)}</span>
              <span>Adapt {opponent.profile.temperament.adaptability.toFixed(2)}</span>
            </div>
          </div>
        </div>
      ) : null}

      <div className="rounded-[20px] border border-dashed border-white/10 bg-white/[0.02] p-4">
        {status === "idle" && (
          <button
            type="button"
            onClick={onQueueMatch}
            className="w-full rounded-xl bg-white px-4 py-3 text-sm font-bold uppercase tracking-[0.1em] text-black transition hover:brightness-110"
          >
            Queue Ranked Match
          </button>
        )}

        {status === "searching" && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold uppercase tracking-[0.1em] text-white/85 transition hover:border-white/25 hover:bg-white/10"
          >
            Cancel Search
          </button>
        )}

        {status === "found" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onLockIn}
              className="rounded-xl bg-emerald-300 px-4 py-3 text-sm font-bold uppercase tracking-[0.1em] text-black transition hover:brightness-110"
            >
              Lock In
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold uppercase tracking-[0.1em] text-white/85 transition hover:border-white/25 hover:bg-white/10"
            >
              Decline
            </button>
          </div>
        )}

        {status === "locked" && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-100">
            Combat link sealed. Awaiting arena dispatch.
          </div>
        )}
      </div>
    </div>
  );
}
