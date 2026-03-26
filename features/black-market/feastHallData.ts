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
  /** Visible cue for what this option changes next deployment. */
  nextRunEffect: string;
};

export const feastHallOffers: FeastHallOffer[] = [
  {
    id: "scavenger-broth",
    title: "Cheap Meal",
    label: "Cheap Meal",
    description:
      "A sanctioned trench ration: steady your condition now and keep you moving without spending salvage.",
    lore:
      "The Feast Hall simmers whatever survives the wastes into a clean bowl and calls it mercy.",
    cost: {
      credits: STATUS_RECOVERY_COST,
    },
    conditionGain: STATUS_RECOVERY_AMOUNT,
    hungerDelta: -6,
    cooldownMs: STATUS_RECOVERY_COOLDOWN_MS,
    riskNote:
      "Low risk, but not free. You pay in hunger, and it keeps biting between runs.",
    useCase:
      "Use when condition is strained and you only need a basic reset before the next expedition.",
    nextRunEffect: "Standard reset",
  },
  {
    id: "sample-stew",
    title: "Hunter’s Plate",
    label: "Hunter’s Plate",
    description:
      "Turn recovered biomass into a stronger plate. Better recovery now, lighter hunger pressure for the next step.",
    lore:
      "Nothing leaves the Feast Hall untouched. Even the wastes come back as supper.",
    cost: {
      bioSamples: 4,
    },
    conditionGain: 26,
    hungerDelta: -4,
    cooldownMs: 45000,
    riskNote:
      "Efficient, but it still costs. You trade bio-salvage for a steadier deployment window and less hunger pressure afterward.",
    useCase:
      "Use before a serious push when you want better condition at deployment without going full Gluttony spike.",
    nextRunEffect: "Stability deployment",
  },
  {
    id: "mouth-of-inti",
    title: "Forbidden Feast",
    label: "Forbidden Feast",
    description:
      "A Pure-wing Gluttony feast contract: high recovery at a steep hunger price and a longer kitchen lockout.",
    lore:
      "The Pure wing treats hunger as leverage. The contract ends when the table does.",
    cost: {
      credits: 20,
      bioSamples: 6,
    },
    conditionGain: 40,
    hungerDelta: -14,
    cooldownMs: 180000,
    riskNote:
      "High reward, real price. The feast restores the most condition but hits hunger hardest and locks the kitchen much longer.",
    useCase:
      "Use before a difficult push when raw recovery matters more than short-term flexibility—just know hunger pressure will be higher after.",
    nextRunEffect: "Hardened entry",
  },
];

export function getFeastHallOfferById(offerId: FeastHallOfferId) {
  return feastHallOffers.find((offer) => offer.id === offerId) ?? null;
}
