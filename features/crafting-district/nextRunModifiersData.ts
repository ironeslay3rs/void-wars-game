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
      nextRunEffect: "+15 condition restored at the start of the next run.",
      applyOnStart: { conditionGain: 15 },
    },
  },
  {
    id: "ember-stim",
    title: "Ember Stim",
    description:
      "Pure-aligned stimulant charge: harder hits in the field, but it burns hunger stores on deployment.",
    cost: { credits: 15, emberCore: 1 },
    modifiers: {
      id: "ember-stim",
      effectKey: "EMBER_STIM",
      title: "Ember Stim",
      nextRunEffect: "+25% damage output · −8 hunger cost at deployment.",
      applyOnStart: { hungerDelta: -8 },
      applyInField: { shellDamageBoostPct: 25, floatDamageBoostPct: 25 },
    },
  },
  {
    id: "frost-stabilizer",
    title: "Frost Stabilizer",
    description:
      "Mecha-grade cooling brace: reduces condition wear on the next run, keeping the body stable under pressure.",
    cost: { credits: 25, runeDust: 2, scrapAlloy: 2 },
    modifiers: {
      id: "frost-stabilizer",
      effectKey: "FROST_STABILIZER",
      title: "Frost Stabilizer",
      nextRunEffect: "−3 condition drain during the next run.",
      applyOnSettlement: { conditionDrainReduction: 3 },
    },
  },
  {
    id: "void-extract",
    title: "Void Extract",
    description:
      "Concentrated void residue vial: pushes reward output, but the run lands harder on the body.",
    cost: { credits: 30, runeDust: 3, bioSamples: 3 },
    modifiers: {
      id: "void-extract",
      effectKey: "VOID_EXTRACT",
      title: "Void Extract",
      nextRunEffect: "+15% reward payout · +4 condition drain (instability cost).",
      applyOnSettlement: { rewardBonusPct: 15, conditionDrainPenalty: 4 },
    },
  },
];

export function getNextRunModifierDefinitionById(id: NextRunModifierId) {
  return nextRunModifierDefinitions.find((d) => d.id === id) ?? null;
}
