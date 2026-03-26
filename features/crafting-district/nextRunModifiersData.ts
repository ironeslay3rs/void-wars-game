import type { NextRunModifierId, NextRunModifiers, ResourceKey } from "@/features/game/gameTypes";

export type NextRunModifierDefinition = {
  id: NextRunModifierId;
  title: string;
  description: string;
  cost: Partial<Record<ResourceKey, number>>;
  modifiers: NextRunModifiers;
};

export const nextRunModifierDefinitions: NextRunModifierDefinition[] = [
  {
    id: "scrap-kit",
    title: "Scrap Kit",
    description:
      "A quick field patch kit: restore condition at deployment, paid in scrap and credits.",
    cost: { credits: 20, scrapAlloy: 4 },
    modifiers: {
      id: "scrap-kit",
      effectKey: "SCRAP_KIT",
      title: "Scrap Kit",
      nextRunEffect: "+15 condition at deployment",
      applyOnStart: { conditionGain: 15 },
    },
  },
  {
    id: "ember-stim",
    title: "Ember Stim",
    description:
      "Pure-aligned stimulant charge: harder hits in the field, but it burns stores.",
    cost: { credits: 15, emberCore: 1 },
    modifiers: {
      id: "ember-stim",
      effectKey: "EMBER_STIM",
      title: "Ember Stim",
      nextRunEffect: "EMBER_STIM: +25% visible damage output · -8 hunger at deployment",
      applyOnStart: { hungerDelta: -8 },
      applyInField: { shellDamageBoostPct: 25, floatDamageBoostPct: 25 },
    },
  },
  {
    id: "frost-stabilizer",
    title: "Frost Stabilizer",
    description:
      "Mecha-grade cooling brace: reduces condition wear on the next run.",
    cost: { credits: 25, runeDust: 2, scrapAlloy: 2 },
    modifiers: {
      id: "frost-stabilizer",
      effectKey: "FROST_STABILIZER",
      title: "Frost Stabilizer",
      nextRunEffect: "FROST_STABILIZER: reduce condition drain by 3 during the run",
      applyOnSettlement: { conditionDrainReduction: 3 },
    },
  },
  {
    id: "void-extract",
    title: "Void Extract",
    description:
      "Concentrated residue vial: increases payout, but the run lands harder.",
    cost: { credits: 30, runeDust: 3, bioSamples: 3 },
    modifiers: {
      id: "void-extract",
      effectKey: "VOID_EXTRACT",
      title: "Void Extract",
      nextRunEffect: "VOID_EXTRACT: +15% rewards · instability (+4 condition drain)",
      applyOnSettlement: { rewardBonusPct: 15, conditionDrainPenalty: 4 },
    },
  },
];

export function getNextRunModifierDefinitionById(id: NextRunModifierId) {
  return nextRunModifierDefinitions.find((d) => d.id === id) ?? null;
}

