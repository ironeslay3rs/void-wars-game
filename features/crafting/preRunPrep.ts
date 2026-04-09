import type { NextRunModifierDefinition } from "@/features/crafting-district/nextRunModifiersData";

/**
 * M1 prep layer — three district-primed kits that make the next void run feel prepared.
 * Costs use existing resources only; wired through the one-slot `nextRunModifiers` rail.
 */
export const preRunPrepNextRunDefinitions: NextRunModifierDefinition[] = [
  {
    id: "heat-sink-patch",
    title: "Heat Sink Patch",
    description:
      "Chrome-grade foil wicking: shunts attention spikes so the run’s heat climb softens when the contract closes.",
    cost: { credits: 18, scrapAlloy: 3 },
    modifiers: {
      id: "heat-sink-patch",
      effectKey: "HEAT_SINK_PATCH",
      title: "Heat Sink Patch",
      nextRunEffect:
        "−3 run heat on settlement — you padded the attention spike before it hit the bar.",
      applyOnSettlement: { runInstabilityGainReduction: 3 },
    },
  },
  {
    id: "salvage-rigging",
    title: "Salvage Rigging",
    description:
      "Coil-taught carry webbing and sample hooks: every orb pull and extract haul banks a little heavier.",
    cost: { credits: 22, bioSamples: 2 },
    modifiers: {
      id: "salvage-rigging",
      effectKey: "SALVAGE_RIGGING",
      title: "Salvage Rigging",
      nextRunEffect:
        "+12% salvage from field orbs and extraction pull — preparation shows in the bags.",
      applyInField: { fieldLootBonusPct: 12 },
    },
  },
  {
    id: "extract-balm",
    title: "Extract Balm",
    description:
      "Moss-bound salve over stressed seams: the next payout lands softer on the body.",
    cost: { credits: 16, mossRations: 1 },
    modifiers: {
      id: "extract-balm",
      effectKey: "EXTRACT_BALM",
      title: "Extract Balm",
      nextRunEffect:
        "−2 condition wear on payout + trims 1 tick of run heat — you greased the extract.",
      applyOnSettlement: {
        conditionDrainReduction: 2,
        runInstabilityGainReduction: 1,
      },
    },
  },
];
