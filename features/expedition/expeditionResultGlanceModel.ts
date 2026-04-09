import type {
  LatestHuntResult,
  MissionDefinition,
  ResourceKey,
  VoidFieldExtractionLedgerResult,
} from "@/features/game/gameTypes";
import { voidZoneById } from "@/features/void-maps/zoneData";
import type { AfkFieldRunFeedback } from "@/features/hunting-ground/afkRunFeedback";
import {
  HUNGER_PRESSURE_THRESHOLD,
  getHungerLabel,
} from "@/features/status/survival";
import { formatResourceLabel } from "@/features/game/gameFeedback";

export type ExpeditionGlanceStatusTone = "complete" | "partial" | "strained";

export type ExpeditionResultGlanceModel = {
  eyebrow: string;
  headline: string;
  statusTone: ExpeditionGlanceStatusTone;
  statusChip: string;
  targetSummary: string;
  extractionSummary: string;
  whatHappened: string[];
  gains: { label: string; detail?: string; emphasis?: boolean }[];
  costs: { label: string; detail?: string }[];
  brokerLines: string[];
  nextSteps: { href: string; label: string; primary?: boolean }[];
};

export type HuntResultGlanceBuildInput = {
  latest: LatestHuntResult;
  mission: MissionDefinition | null;
  isFieldContract: boolean;
  fieldRunFeedback: AfkFieldRunFeedback | null;
  isRealtimeBonusApplied: boolean;
  resourceEntries: Array<[ResourceKey, number]>;
  fieldLootEntries: Array<[ResourceKey, number]>;
  finalCredits: number;
  finalRankXp: number;
  finalMastery: number;
  finalInfluence: number;
  playerCondition: number;
  playerHunger: number;
  playerVoidStrain: number;
  carryPressureSummary?: string;
  warExchangeSellPressureLines?: string[];
  nextStepHref: string;
  nextStepLabel: string;
  secondaryFieldStep: { href: string; label: string } | null;
  shouldRouteToFeastHall: boolean;
};

function pushUnique(arr: string[], line: string) {
  if (!line || arr.includes(line)) return;
  arr.push(line);
}

export function buildHuntResultGlanceModel(
  input: HuntResultGlanceBuildInput,
): ExpeditionResultGlanceModel {
  const {
    latest,
    mission,
    isFieldContract,
    fieldRunFeedback,
    isRealtimeBonusApplied,
    resourceEntries,
    fieldLootEntries,
    finalCredits,
    finalRankXp,
    finalMastery,
    finalInfluence,
    playerCondition,
    playerHunger,
    playerVoidStrain,
    carryPressureSummary,
    warExchangeSellPressureLines,
    nextStepHref,
    nextStepLabel,
    secondaryFieldStep,
    shouldRouteToFeastHall,
  } = input;

  const hungerPenalty = latest.hungerRewardPenaltyPct ?? 0;
  const fusionMult = latest.fusionRewardMultiplier;

  let statusTone: ExpeditionGlanceStatusTone = "complete";
  if (playerCondition < 50 || playerHunger < HUNGER_PRESSURE_THRESHOLD) {
    statusTone = "strained";
  } else if (
    hungerPenalty > 0 ||
    (typeof fusionMult === "number" && fusionMult < 0.995)
  ) {
    statusTone = "partial";
  }

  const statusChip =
    statusTone === "strained"
      ? "Body thin — recover before you stack another op"
      : statusTone === "partial"
        ? "Contract paid under stores / cadence pressure"
        : isFieldContract
          ? "Timer contract closed — ledger final"
          : "Hunt closed — ledger final";

  const zoneLabel =
    mission?.deployZoneId && voidZoneById[mission.deployZoneId]
      ? voidZoneById[mission.deployZoneId].label
      : null;

  const targetSummary = mission
    ? zoneLabel
      ? `${mission.title} · ${zoneLabel}`
      : mission.title
    : latest.huntTitle;

  const extractionSummary = isFieldContract
    ? fieldRunFeedback?.extractionLabel ??
      "Void sector haul and contract timer both closed on this settlement."
    : "Specimen lane closed on this readout.";

  const whatHappened: string[] = [];
  pushUnique(
    whatHappened,
    isFieldContract
      ? "Hunting-ground contract timer settled; payout hit your stock."
      : "Biotech specimen run resolved once — no hidden second pass.",
  );
  if (isFieldContract && isRealtimeBonusApplied) {
    pushUnique(
      whatHappened,
      "Realtime void contribution is already folded into the totals below.",
    );
  } else if (isFieldContract) {
    pushUnique(
      whatHappened,
      "If you fought on the live field, bonus lines can still tick in — refresh this readout once.",
    );
  }
  if (fieldLootEntries.length > 0) {
    pushUnique(
      whatHappened,
      "Salvage picked up in the Void is banked with this contract row.",
    );
  }

  const gains: ExpeditionResultGlanceModel["gains"] = [
    {
      label: "Credits",
      detail: `+${finalCredits}`,
      emphasis: true,
    },
    {
      label: "Rank XP",
      detail: `+${finalRankXp}`,
      emphasis: true,
    },
    {
      label: "Mastery",
      detail: `+${finalMastery}`,
    },
    {
      label: "Influence (Black Market standing)",
      detail: `+${finalInfluence}`,
    },
  ];

  for (const [key, value] of resourceEntries.slice(0, 8)) {
    if (key === "credits") continue;
    gains.push({
      label: formatResourceLabel(key),
      detail: `+${value}`,
    });
  }

  for (const [key, value] of fieldLootEntries.slice(0, 6)) {
    gains.push({
      label: `${formatResourceLabel(key)} (field pickup)`,
      detail: `+${value}`,
    });
  }

  const costs: ExpeditionResultGlanceModel["costs"] = [
    {
      label: "Contract wear (condition)",
      detail:
        latest.conditionDelta > 0
          ? `+${latest.conditionDelta} (recovery)`
          : `${latest.conditionDelta}`,
    },
    {
      label: "Condition after close",
      detail: `${latest.conditionAfter}% field-ready`,
    },
    {
      label: "Stores / hunger",
      detail: `${playerHunger}% · ${getHungerLabel(playerHunger)}`,
    },
  ];

  if (hungerPenalty > 0) {
    costs.push({
      label: "Hunger pressure on this payout",
      detail: `−${hungerPenalty}% payout quality · +${latest.hungerConditionDrainPenalty ?? 0} wear from stores`,
    });
  }

  costs.push({
    label: "Void strain (infusion index)",
    detail: `${playerVoidStrain}/100 after settlement`,
  });

  if (carryPressureSummary) {
    costs.push({
      label: "Citadel carry",
      detail: carryPressureSummary,
    });
  }

  const brokerLines =
    warExchangeSellPressureLines && warExchangeSellPressureLines.length > 0
      ? warExchangeSellPressureLines
      : [
          "War lane quotes shift at the Golden Bazaar — open War Exchange when you move materials.",
        ];

  const nextSteps: ExpeditionResultGlanceModel["nextSteps"] = [
    { href: nextStepHref, label: nextStepLabel, primary: true },
  ];
  if (secondaryFieldStep) {
    nextSteps.push({
      href: secondaryFieldStep.href,
      label: secondaryFieldStep.label,
    });
  }
  if (shouldRouteToFeastHall) {
    nextSteps.push({
      href: "/bazaar/black-market/feast-hall",
      label: "Recover — Feast Hall",
    });
  }
  if (carryPressureSummary?.toLowerCase().includes("overload")) {
    nextSteps.push({
      href: "/bazaar/war-exchange",
      label: "Lighten pack — War Exchange",
    });
  }
  if (isFieldContract) {
    nextSteps.push({
      href: "/deploy-into-void",
      label: "Re-enter — Void Expedition",
    });
    nextSteps.push({
      href: "/bazaar/mercenary-guild",
      label: "Queue next — Mercenary Guild",
    });
  }
  nextSteps.push({
    href: "/bazaar/crafting-district",
    label: "Prep kits — Crafting District",
  });
  if (playerCondition < 72) {
    nextSteps.push({
      href: "/home",
      label: "Check Status — Command Deck",
    });
  }

  return {
    eyebrow: isFieldContract ? "Field ops readout" : "Biotech readout",
    headline: isFieldContract ? "Contract settlement" : "Hunt settlement",
    statusTone,
    statusChip,
    targetSummary,
    extractionSummary,
    whatHappened,
    gains,
    costs,
    brokerLines,
    nextSteps,
  };
}

export type ExtractionGlancePlayerSnapshot = {
  condition: number;
  hunger: number;
};

export function buildVoidFieldExtractionGlanceModel(
  ledger: VoidFieldExtractionLedgerResult,
  player?: ExtractionGlancePlayerSnapshot,
): ExpeditionResultGlanceModel {
  const rejected = Object.entries(ledger.resourcesRejected).filter(
    ([, v]) => (v ?? 0) > 0,
  );
  const hasTrim = rejected.length > 0;

  let statusTone: ExpeditionGlanceStatusTone = "complete";
  if (ledger.carryAfter.isOverloaded || hasTrim) {
    statusTone = hasTrim ? "partial" : "strained";
  }
  if (
    player &&
    (player.condition < 50 || player.hunger < HUNGER_PRESSURE_THRESHOLD)
  ) {
    statusTone = "strained";
  }

  const statusChip = hasTrim
    ? "Partial gate bank — salvage trimmed by carry rules"
    : ledger.carryAfter.isOverloaded
      ? "Pack still overloaded after bank"
      : "Extraction gate closed clean";

  const whatHappened: string[] = [
    "You hit the citadel extraction marker; haul moved through the single ledger path.",
    ledger.kills > 0
      ? `Drill work logged ${ledger.kills} kill${ledger.kills === 1 ? "" : "s"} on the sortie.`
      : "No kill tally on this extract — strain came from wear and cargo class only.",
  ];
  if (hasTrim) {
    pushUnique(
      whatHappened,
      "Some boosted salvage could not fit Black Market haul limits and stayed at the gate.",
    );
  }

  const gains: ExpeditionResultGlanceModel["gains"] = [];
  for (const [key, amt] of Object.entries(ledger.resourcesBanked)) {
    if (!amt || amt <= 0) continue;
    gains.push({
      label: formatResourceLabel(key as ResourceKey),
      detail: `+${amt}`,
      emphasis: key === "credits",
    });
  }
  if (gains.length === 0) {
    gains.push({
      label: "No bulk banked",
      detail: "Timer / contract payout still lives on the Hunt Result row.",
    });
  }
  gains.push(
    {
      label: "Drill rank XP",
      detail: `+${ledger.rankXpGained}`,
      emphasis: true,
    },
    {
      label: "Condition spent (drill)",
      detail: `−${ledger.conditionSpent}`,
    },
  );

  const costs: ExpeditionResultGlanceModel["costs"] = [
    {
      label: "Void strain from banking",
      detail: `+${ledger.pickupStrainFromBanking} infusion`,
    },
    {
      label: "Void strain from extract load",
      detail: `+${ledger.extractionStrainDelta} infusion`,
    },
    {
      label: "Carry before / after",
      detail: `${ledger.carryBefore.used}/${ledger.carryBefore.max} → ${ledger.carryAfter.used}/${ledger.carryAfter.max}`,
    },
  ];
  if (ledger.overloadWhy) {
    costs.push({ label: "Overload / trim", detail: ledger.overloadWhy });
  }

  const nextSteps: ExpeditionResultGlanceModel["nextSteps"] = [
    { href: "/home", label: "Next — Command Deck", primary: true },
  ];
  if (
    ledger.carryAfter.isOverloaded ||
    hasTrim ||
    (ledger.overloadWhy && ledger.overloadWhy.length > 0)
  ) {
    nextSteps.push({
      href: "/bazaar/war-exchange",
      label: "Sell down — War Exchange",
    });
  }
  if (
    player &&
    (player.condition < 65 || player.hunger < HUNGER_PRESSURE_THRESHOLD)
  ) {
    nextSteps.push({
      href: "/bazaar/black-market/feast-hall",
      label: "Stabilize — Feast Hall",
    });
  }
  nextSteps.push({
    href: "/deploy-into-void",
    label: "Re-deploy — Void Expedition",
  });
  nextSteps.push({
    href: "/bazaar/crafting-district",
    label: "Prep next kit — Crafting District",
  });
  nextSteps.push({
    href: "/bazaar/biotech-labs/result",
    label: "Full Hunt Result (timer payout)",
  });

  return {
    eyebrow: "Void field · extraction",
    headline: ledger.zoneName,
    statusTone,
    statusChip,
    targetSummary: ledger.zoneName,
    extractionSummary: hasTrim
      ? "Gate accepted what fit; the rest is written off at the perimeter."
      : "Gate accepted the full run ledger into citadel stock.",
    whatHappened,
    gains,
    costs,
    brokerLines:
      ledger.warExchangeSellPressureLines.length > 0
        ? ledger.warExchangeSellPressureLines
        : [
            "Open War Exchange when you are ready to move materials — quotes shift with front-line demand.",
          ],
    nextSteps,
  };
}
