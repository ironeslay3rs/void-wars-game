import type { GameState } from "@/features/game/gameTypes";
import { getCurrentAscensionStep } from "@/features/progression/ascensionStep";
import { getHungerPressureEffects } from "@/features/status/survival";
import { getNextRunModifierDefinitionById } from "@/features/crafting-district/nextRunModifiersData";

export function getFactionAlignment(state: GameState) {
  return state.player.factionAlignment;
}

export function hasChosenPath(state: GameState) {
  return state.player.factionAlignment !== "unbound";
}

export function hasUnlockedRoutes(state: GameState) {
  return state.player.unlockedRoutes.length > 0;
}

export function isTeleportGateOpen(state: GameState) {
  return state.player.districtState.gateStatus === "open";
}

export function canAccessTeleportGate(state: GameState) {
  return (
    state.player.unlockedRoutes.includes("/bazaar/teleport-gate") ||
    state.player.unlockedRoutes.includes("teleport-gate") ||
    state.player.districtState.gateStatus !== "standby" ||
    hasChosenPath(state)
  );
}

export function canContinueGame(state: GameState) {
  if (!state.player.characterCreated) {
    return false;
  }
  return (
    hasChosenPath(state) ||
    state.player.rankLevel > 1 ||
    state.player.influence > 0 ||
    state.player.knownRecipes.length > 0 ||
    hasUnlockedRoutes(state) ||
    state.player.districtState.gateStatus !== "standby" ||
    state.player.districtState.arenaStatus !== "locked"
  );
}

export function getContinueRoute(state: GameState) {
  if (canAccessTeleportGate(state)) {
    return "/bazaar/teleport-gate";
  }

  return "/";
}

export type ProgressionMeaningChip = {
  id:
    | "hunger-pressure"
    | "primed-modifier"
    | "next-unlock"
    | "ascension-tension";
  label: string;
};

export type ProgressionMeaning = {
  objectiveTitle: string;
  objectiveLine: string;
  whyTitle: string;
  whyLine: string;
  chips: ProgressionMeaningChip[]; // max 2
  huntResultEnablement: string[]; // 0..3
};

function pickMax2Chips(candidates: Array<ProgressionMeaningChip | null>) {
  const chips: ProgressionMeaningChip[] = [];
  for (const chip of candidates) {
    if (!chip) continue;
    if (chips.length >= 2) break;
    chips.push(chip);
  }
  return chips;
}

export function getProgressionMeaning(state: GameState): ProgressionMeaning {
  const { player } = state;
  const mythic = player.mythicAscension;
  const hungerEffects = getHungerPressureEffects(player.hunger);
  const hasHungerPressure = hungerEffects.tier !== "fed";

  const primed = player.nextRunModifiers;
  const primedChip: ProgressionMeaningChip | null = primed
    ? { id: "primed-modifier", label: `Primed: ${primed.effectKey}` }
    : null;

  const hungerChip: ProgressionMeaningChip | null = hasHungerPressure
    ? {
        id: "hunger-pressure",
        label: `Hunger Pressure: ${hungerEffects.label}`,
      }
    : null;

  const nextUnlockChip: ProgressionMeaningChip = {
    id: "next-unlock",
    label: mythic.convergencePrimed
      ? `Knight Valor: ${mythic.runeKnightValor}/99`
      : `Next Unlock: Rank ${player.rankLevel + 1}`,
  };

  const ascensionNear = getCurrentAscensionStep(state).nearBreakthroughLine;
  const ascensionTensionChip: ProgressionMeaningChip | null = ascensionNear
    ? { id: "ascension-tension", label: ascensionNear }
    : null;

  const chips = pickMax2Chips([
    ascensionTensionChip,
    hungerChip,
    primedChip,
    nextUnlockChip,
  ]);

  const enablement: string[] = [];
  const last = player.lastHuntResult;

  // If the player is hungry enough to take a payout penalty, call it out.
  if (hasHungerPressure) {
    enablement.push(
      "Current hunger pressure will reduce your next payout if ignored.",
    );
  }

  // If the run returned scrap/credits and the player can afford Scrap Kit, call it out.
  const scrapKit = getNextRunModifierDefinitionById("scrap-kit");
  const canAffordScrapKit =
    !!scrapKit &&
    Object.entries(scrapKit.cost).every(([k, amount]) => {
      const key = k as keyof typeof player.resources;
      const need = typeof amount === "number" ? amount : 0;
      return (player.resources[key] ?? 0) >= need;
    });
  const gainedScrapAlloy = (last?.resourcesGained?.scrapAlloy ?? 0) > 0;
  if (canAffordScrapKit && gainedScrapAlloy) {
    enablement.push("Enough Scrap Alloy for Scrap Kit.");
  }

  const gainedBioSamples = (last?.resourcesGained?.bioSamples ?? 0) > 0;
  if (gainedBioSamples) {
    enablement.push(
      "Bio Samples can stabilize hunger through Feast Hall or crafting.",
    );
  }

  // If a modifier is already primed, make that clear so the player doesn’t waste attention.
  if (primed) {
    enablement.unshift(`Primed kit ready: ${primed.effectKey}.`);
  }

  const objectiveLine = mythic.convergencePrimed
    ? mythic.runeKnightValor < 3
      ? "Win ranked or tournament arena rounds to bank Knight valor."
      : "Spend Knight valor on Mythic ladder boons or Arena Edge Sigils."
    : "Prime convergence on the Mythic ladder, then start banking Knight valor.";

  const whyLine = mythic.convergencePrimed
    ? "Valor spend converts prestige into immediate power and progression pressure."
    : "Convergence unlocks Phase 9 prestige loops and valor-backed spend decisions.";

  return {
    objectiveTitle: "Progression Objective",
    objectiveLine,
    whyTitle: "Why it matters",
    whyLine,
    chips,
    huntResultEnablement: enablement.slice(0, 3),
  };
}