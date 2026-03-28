import type { PlayerState } from "@/features/game/gameTypes";

export type CultivationStage = {
  id:
    | "scrap-body"
    | "iron-vein"
    | "rune-pulse"
    | "synod-core"
    | "ember-saint";
  label: string;
  threshold: number;
  doctrine: string;
};

const cultivationStages: CultivationStage[] = [
  {
    id: "scrap-body",
    label: "Scrap Body",
    threshold: 0,
    doctrine: "Survive first deployments and stabilize extraction rhythm.",
  },
  {
    id: "iron-vein",
    label: "Iron Vein",
    threshold: 55,
    doctrine: "Harden route discipline and convert salvage into loadout continuity.",
  },
  {
    id: "rune-pulse",
    label: "Rune Pulse",
    threshold: 110,
    doctrine: "Maintain mission cadence while preserving condition reserves.",
  },
  {
    id: "synod-core",
    label: "Synod Core",
    threshold: 165,
    doctrine: "Push multi-contract pressure with deliberate queue handoffs.",
  },
  {
    id: "ember-saint",
    label: "Ember Saint",
    threshold: 225,
    doctrine: "Carry costly progression through controlled warfront escalation.",
  },
];

export function getCultivationRead(player: PlayerState) {
  const score = player.rankLevel * 14 + player.masteryProgress;
  const stage =
    [...cultivationStages]
      .reverse()
      .find((entry) => score >= entry.threshold) ?? cultivationStages[0];

  const nextStage = cultivationStages.find((entry) => entry.threshold > score);
  const progressToNext = nextStage
    ? Math.min(
        100,
        Math.max(
          0,
          Math.round(
            ((score - stage.threshold) / (nextStage.threshold - stage.threshold)) *
              100,
          ),
        ),
      )
    : 100;

  return {
    score,
    stage,
    nextStage: nextStage ?? null,
    progressToNext,
  };
}

export function getAfkExpeditionRead(player: PlayerState, now: number) {
  const lastResolvedAt = player.lastHuntResult?.resolvedAt ?? 0;
  const anchor = Math.max(player.lastConditionTickAt, lastResolvedAt);
  const idleMinutes = Math.max(0, Math.floor((now - anchor) / 60000));
  const idleHours = idleMinutes / 60;
  const queueLoad = player.missionQueue.length;
  const rhythmMultiplier = player.factionAlignment === "unbound" ? 0.85 : 1;
  const estimatedCredits = Math.round(
    Math.min(280, idleHours * 52 * rhythmMultiplier + queueLoad * 16),
  );
  const estimatedMastery = Math.round(
    Math.min(22, idleHours * 4.8 * rhythmMultiplier + queueLoad * 1.2),
  );

  return {
    idleMinutes,
    estimatedCredits,
    estimatedMastery,
    queueLoad,
    rhythmLabel:
      queueLoad >= 2
        ? "Contract chain stable"
        : queueLoad === 1
          ? "Single contract in motion"
          : "No active chain",
  };
}

export function getFormationDoctrine(player: PlayerState) {
  if (player.fieldLoadoutProfile === "support") {
    return "Backline relay: extend squad uptime and secure attrition wins.";
  }

  if (player.fieldLoadoutProfile === "breach") {
    return "Breach doctrine: high pressure entries with higher condition risk.";
  }

  return "Assault doctrine: balanced frontline pressure for repeatable contracts.";
}

export type FusionContractModifiers = {
  rewardMultiplier: number;
  conditionDeltaOffset: number;
  pressureLabel: string;
  cadenceLabel: string;
};

export function getFusionContractModifiers(
  player: PlayerState,
  now: number,
  queueLoad: number,
): FusionContractModifiers {
  const cultivation = getCultivationRead(player);
  const afkRead = getAfkExpeditionRead(player, now);

  const stageRewardBonusPct = Math.min(
    14,
    Math.max(0, Math.floor(cultivation.score / 35)),
  );
  const cadenceRewardBonusPct = Math.min(
    12,
    queueLoad >= 3 ? 12 : queueLoad === 2 ? 8 : queueLoad === 1 ? 4 : 0,
  );
  const idlePenaltyPct = Math.min(10, Math.floor(afkRead.idleMinutes / 45));
  const netRewardBonusPct = Math.max(
    0,
    stageRewardBonusPct + cadenceRewardBonusPct - idlePenaltyPct,
  );

  const doctrineConditionOffset =
    player.fieldLoadoutProfile === "breach"
      ? -2
      : player.fieldLoadoutProfile === "support"
        ? 1
        : 0;
  const cadenceConditionOffset =
    queueLoad >= 3 ? -2 : queueLoad === 2 ? -1 : queueLoad === 0 ? 2 : 0;
  const idleConditionOffset =
    afkRead.idleMinutes >= 180 ? 2 : afkRead.idleMinutes >= 90 ? 1 : 0;

  const conditionDeltaOffset = clampInt(
    doctrineConditionOffset + cadenceConditionOffset + idleConditionOffset,
    -4,
    4,
  );

  return {
    rewardMultiplier: 1 + netRewardBonusPct / 100,
    conditionDeltaOffset,
    pressureLabel:
      conditionDeltaOffset < 0
        ? "Pressure discipline trimmed condition wear."
        : conditionDeltaOffset > 0
          ? "Route stress increased condition wear."
          : "Route stress held neutral.",
    cadenceLabel: afkRead.rhythmLabel,
  };
}

function clampInt(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
