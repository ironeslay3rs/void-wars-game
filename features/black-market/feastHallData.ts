import type { FeastHallOfferId, ResourceKey } from "@/features/game/gameTypes";
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
  hungerDelta: number;
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
    hungerDelta: -2,
    cooldownMs: STATUS_RECOVERY_COOLDOWN_MS,
    riskNote:
      "Low risk, but not free. The broth steadies you now and still burns a little stored hunger afterward.",
    useCase: "Use when condition is strained and you only need a clean reset.",
  },
  {
    id: "sample-stew",
    title: "Sample Stew",
    label: "Render Samples",
    description:
      "Render recovered biomass into grim field rations and turn unused samples into immediate expedition recovery.",
    lore:
      "Nothing leaves the Feast Hall untouched. Even the wastes come back as supper.",
    cost: {
      bioSamples: 4,
    },
    conditionGain: 18,
    hungerDelta: -6,
    cooldownMs: 30000,
    riskNote:
      "Efficient, but gluttonous. You trade salvage for recovery and come out with lighter stores for the next push.",
    useCase:
      "Use when credits are tight but salvage from the front is still fresh.",
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
    hungerDelta: -12,
    cooldownMs: 180000,
    riskNote:
      "High reward, real price. The contract restores the most condition, but it hits hunger hardest and locks the kitchen much longer.",
    useCase:
      "Use before a difficult push when raw recovery matters more than short-term flexibility.",
  },
];

export function getFeastHallOfferById(offerId: FeastHallOfferId) {
  return feastHallOffers.find((offer) => offer.id === offerId) ?? null;
}
