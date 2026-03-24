"use client";

import { useGame } from "@/features/game/gameContext";
import { getFirstSessionGuidance } from "@/features/guidance/firstSessionGuidance";
import {
  FIELD_RATIONS_RESTORE,
  LOW_HUNGER_THRESHOLD,
  getHungerStateLabel,
} from "@/features/status/survival";
import { useRecoveryCooldown } from "@/features/status/useRecoveryCooldown";
import { STATUS_RECOVERY_COST } from "@/features/status/statusRecovery";

function formatFactionLabel(faction: string) {
  if (faction === "unbound") return "Unbound";
  if (faction === "bio") return "Bio";
  if (faction === "mecha") return "Mecha";
  if (faction === "spirit") return "Spirit";
  return faction;
}

function getConditionLabel(condition: number) {
  if (condition >= 85) return "Optimal";
  if (condition >= 65) return "Stable";
  if (condition >= 40) return "Strained";
  return "Critical";
}

function getProgressPercent(current: number, max: number) {
  if (max <= 0) return 0;
  return Math.max(0, Math.min(100, (current / max) * 100));
}

export default function StatusHeroCard() {
  const { state, dispatch } = useGame();
  const { player } = state;
  const guidance = getFirstSessionGuidance(state);
  const {
    recoveryCooldownRemainingSeconds,
    isRecoveryOnCooldown,
  } = useRecoveryCooldown(player.conditionRecoveryAvailableAt);
  const canAffordRecovery = player.resources.credits >= STATUS_RECOVERY_COST;
  const canRecoverCondition = canAffordRecovery && !isRecoveryOnCooldown;
  const canConsumeFieldRation =
    player.survival.fieldRations > 0 && player.survival.hunger < 100;
  const hungerLabel = getHungerStateLabel(player.survival.hunger);
  const hungerActionMessage =
    player.survival.fieldRations <= 0
      ? "No Field Rations packed. Craft more in the Bazaar before a longer run."
      : player.survival.hunger >= 100
        ? "Hunger is topped off. Save your next ration for a real drop."
        : player.survival.hunger <= LOW_HUNGER_THRESHOLD
          ? "Low hunger is now the only passive survival risk. Eat before the next outing to avoid condition bleed."
          : "Hunger is holding. One ration is enough to steady your next survival loop if needed.";
  const recoveryActionMessage = isRecoveryOnCooldown
    ? `Blocked. Recovery is cooling down for ${recoveryCooldownRemainingSeconds}s before another stabilization cycle can begin.`
    : !canAffordRecovery
      ? `Blocked. Recovery needs ${STATUS_RECOVERY_COST} credits before stabilization can begin.`
      : guidance.nextAction === "recover"
        ? "Recommended. Low condition is the main blocker before the next loop step."
        : "Ready. Condition is stable enough to continue, but recovery remains available if needed.";

  const rankProgress = getProgressPercent(
    player.rankXp,
    player.rankXpToNext,
  );

  function handleRecoverCondition() {
    if (!canRecoverCondition) return;

    dispatch({ type: "RECOVER_CONDITION" });
  }

  function handleConsumeFieldRation() {
    if (!canConsumeFieldRation) return;

    dispatch({ type: "CONSUME_FIELD_RATION" });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <div className="rounded-[24px] border border-white/10 p-5">
        <div className="text-xs uppercase text-white/50">
          {formatFactionLabel(player.factionAlignment)}
        </div>

        <div className="mt-4 text-2xl font-black">{player.playerName}</div>

        <div className="text-sm text-white/60">{player.rank}</div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-white/40">Level</div>
            <div className="text-xl font-bold">{player.rankLevel}</div>
          </div>

          <div>
            <div className="text-xs text-white/40">Influence</div>
            <div className="text-xl font-bold">{player.influence}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="rounded-xl border border-white/10 p-4">
          <div className="flex justify-between text-sm">
            <span>XP</span>
            <span>
              {player.rankXp}/{player.rankXpToNext}
            </span>
          </div>

          <div className="mt-2 h-2 rounded bg-white/10">
            <div
              className="h-full bg-white"
              style={{ width: `${rankProgress}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-white/10 p-4">
          <div className="flex justify-between text-sm">
            <span>Condition</span>
            <span>{player.condition}%</span>
          </div>

          <div className="mt-2 h-2 rounded bg-white/10">
            <div
              className="h-full bg-red-400"
              style={{ width: `${player.condition}%` }}
            />
          </div>

          <div className="mt-2 text-xs text-white/60">
            {getConditionLabel(player.condition)}
          </div>

          <div className="mt-2 text-xs text-white/45">
            Recovery Cost: {STATUS_RECOVERY_COST} Credits
          </div>

          <div className="mt-1 text-xs text-white/45">
            {isRecoveryOnCooldown
              ? `Recovery Cooldown: ${recoveryCooldownRemainingSeconds}s`
              : "Recovery Cooldown: Ready"}
          </div>

          <button
            type="button"
            onClick={handleRecoverCondition}
            disabled={!canRecoverCondition}
            className={[
              "mt-3 rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] transition",
              canRecoverCondition
                ? "border-white/15 bg-white/5 text-white/85 hover:border-white/25 hover:bg-white/10"
                : "cursor-not-allowed border-white/10 bg-white/[0.03] text-white/30",
            ].join(" ")}
          >
            {isRecoveryOnCooldown
              ? "Recovery Cooling Down"
              : canAffordRecovery
                ? "Recover Condition"
                : "Need 10 Credits"}
          </button>

          <div className="mt-3 text-xs text-white/55">
            {recoveryActionMessage}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 p-4">
          <div className="flex justify-between text-sm">
            <span>Hunger</span>
            <span>{player.survival.hunger}%</span>
          </div>

          <div className="mt-2 h-2 rounded bg-white/10">
            <div
              className="h-full bg-amber-300"
              style={{ width: `${player.survival.hunger}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-white/60">
            <span>{hungerLabel}</span>
            <span>{player.survival.fieldRations} Field Rations packed</span>
          </div>

          <button
            type="button"
            onClick={handleConsumeFieldRation}
            disabled={!canConsumeFieldRation}
            className={[
              "mt-3 rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] transition",
              canConsumeFieldRation
                ? "border-amber-300/40 bg-amber-400/10 text-amber-100 hover:bg-amber-400/20"
                : "cursor-not-allowed border-white/10 bg-white/[0.03] text-white/30",
            ].join(" ")}
          >
            Consume Field Ration
          </button>

          <div className="mt-2 text-xs text-white/45">
            Restores {FIELD_RATIONS_RESTORE}% hunger. Condition only starts
            slipping when hunger drops to {LOW_HUNGER_THRESHOLD}% or lower.
          </div>

          <div className="mt-3 text-xs text-white/55">{hungerActionMessage}</div>
        </div>

        <div className="rounded-xl border border-white/10 p-4">
          <div className="flex justify-between text-sm">
            <span>Mastery</span>
            <span>{player.masteryProgress}%</span>
          </div>

          <div className="mt-2 h-2 rounded bg-white/10">
            <div
              className="h-full bg-purple-400"
              style={{ width: `${player.masteryProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
