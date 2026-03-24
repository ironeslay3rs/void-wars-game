import type {
  FeastHallOfferId,
  ResourceKey,
} from "@/features/game/gameTypes";
import {
  STATUS_RECOVERY_AMOUNT,
  STATUS_RECOVERY_COOLDOWN_MS,
  STATUS_RECOVERY_COST,
} from "@/features/status/statusRecovery";

export type FeastHallOffer = {
  id: FeastHallOfferId;
  title: string;
  label: string;
  description: string;
  lore: string;
  cost: Partial<Record<ResourceKey, number>>;
  conditionGain: number;
  cooldownMs: number;
  riskNote: string;
  useCase: string;
};

export const feastHallOffers: FeastHallOffer[] = [
  {
    id: "scavenger-broth",
    title: "Scavenger Broth",
    label: "Stabilize",
    description:
      "A sanctioned trench meal that mirrors the citadel's standard recovery cycle and gets an operative back on their feet.",
    lore:
      "The Feast Hall salts salvage stock into a hot ration bowl and calls it mercy.",
    cost: {
      credits: STATUS_RECOVERY_COST,
    },
    conditionGain: STATUS_RECOVERY_AMOUNT,
    cooldownMs: STATUS_RECOVERY_COOLDOWN_MS,
    riskNote: "Low risk. Standard recovery output with the normal kitchen cooldown.",
    useCase: "Use when condition is strained and you only need a clean reset.",
  },
  {
    id: "sample-stew",
    title: "Sample Stew",
    label: "Render Samples",
    description:
      "Render captured biotech tissue into grim field rations and turn unused samples into immediate expedition recovery.",
    lore:
      "Nothing leaves the Feast Hall untouched. Even the wastes come back as supper.",
    cost: {
      bioSamples: 4,
    },
    conditionGain: 18,
    cooldownMs: 30000,
    riskNote: "Efficient. Consumes bioSamples instead of credits, but restores less condition than a full hall service.",
    useCase: "Use when credits are tight but salvage from the front is still fresh.",
  },
  {
    id: "mouth-of-inti",
    title: "Mouth of Inti Contract",
    label: "Overindulge",
    description:
      "A Gluttony lane feast contract from the Pure wing: devour a ceremonial spread now, pay with salvage, and accept a heavier recovery lockout.",
    lore:
      "Peru's Pure doctrine teaches that hunger is leverage. The contract ends when the table does.",
    cost: {
      credits: 20,
      bioSamples: 6,
    },
    conditionGain: 40,
    cooldownMs: 180000,
    riskNote: "High reward, real price. This is the best recovery burst in Book 1, but it locks the kitchen for much longer.",
    useCase: "Use before a difficult push when raw recovery matters more than short-term flexibility.",
  },
];

export function getFeastHallOfferById(offerId: FeastHallOfferId) {
  return feastHallOffers.find((offer) => offer.id === offerId) ?? null;
}
