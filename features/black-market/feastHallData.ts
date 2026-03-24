import type { ResourceKey, ResourcesState } from "@/features/game/gameTypes";

export type FeastHallOfferId =
  | "frontline-broth"
  | "citadel-hotplate"
  | "gluttons-compact";

export type FeastHallOffer = {
  id: FeastHallOfferId;
  title: string;
  tagline: string;
  description: string;
  cost: Partial<Record<ResourceKey, number>>;
  conditionRecovery: number;
  nextExpeditionMitigation: number;
  appetiteNote: string;
};

export const feastHallScreenData = {
  eyebrow: "Black Market / Feast Hall",
  title: "Feast Hall",
  subtitle:
    "Secure survival rations, buy back your edge, and leave the citadel with one sanctioned indulgence prepared for the next push into the Void.",
  law: "The Feast Hall honors Black Market law: payment is final, the kitchen is neutral, and broken terms cost more than death.",
  doctrine:
    "Its tables serve all three powers without conversion rites — Verdant Coil stockpots, Chrome Synod field kitchens, and Ember Vault distillates are all reduced to survival value.",
};

export const feastHallOffers: FeastHallOffer[] = [
  {
    id: "frontline-broth",
    title: "Frontline Broth",
    tagline: "Cheap trench fuel for a short return to readiness.",
    description:
      "A salted ration bowl sold to hunters who need to steady their hands before re-entering the line.",
    cost: {
      credits: 25,
    },
    conditionRecovery: 12,
    nextExpeditionMitigation: 4,
    appetiteNote:
      "Low cost, low commitment. Useful when credits are thin but the next deployment cannot wait.",
  },
  {
    id: "citadel-hotplate",
    title: "Citadel Hotplate",
    tagline: "A heavier meal reserved for crews expecting a hard extraction.",
    description:
      "The hall braises salvage-grade protein with sanctioned Pure ash-spice to keep bodies stable on the march.",
    cost: {
      credits: 55,
    },
    conditionRecovery: 22,
    nextExpeditionMitigation: 8,
    appetiteNote:
      "A straightforward readiness buy: spend more credits now to preserve condition deeper into the next run.",
  },
  {
    id: "gluttons-compact",
    title: "Glutton's Compact",
    tagline: "The lane's Book 1 gamble: consume scarce stock now for stronger protection outside the wall.",
    description:
      "Rendered from recovered tissue and sealed under Black Market oath, this contract trades rare matter for a deeper reserve against expedition strain.",
    cost: {
      credits: 40,
      bioSamples: 3,
    },
    conditionRecovery: 18,
    nextExpeditionMitigation: 12,
    appetiteNote:
      "Strongest prep, but it burns bio samples that could have been banked elsewhere. That scarcity trade is the Gluttony choice.",
  },
];

export function canAffordFeastOffer(
  offerCost: FeastHallOffer["cost"],
  resources: ResourcesState,
) {
  return Object.entries(offerCost).every(([resourceKey, amount]) => {
    const safeAmount = amount ?? 0;

    return resources[resourceKey as ResourceKey] >= safeAmount;
  });
}

export function formatFeastCost(cost: FeastHallOffer["cost"]) {
  return Object.entries(cost)
    .map(
      ([resourceKey, amount]) =>
        `${amount} ${formatResourceLabel(resourceKey as ResourceKey)}`,
    )
    .join(" • ");
}

function formatResourceLabel(resourceKey: ResourceKey) {
  const labels: Record<ResourceKey, string> = {
    credits: "Credits",
    ironOre: "Iron Ore",
    scrapAlloy: "Scrap Alloy",
    runeDust: "Rune Dust",
    emberCore: "Ember Core",
    bioSamples: "Bio Samples",
  };

  return labels[resourceKey];
}
