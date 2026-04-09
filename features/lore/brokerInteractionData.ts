import type { ResourceKey } from "@/features/game/gameTypes";

/**
 * Broker interaction configs — what each NPC does when the player engages.
 * Brokers should feel like people with limited time, not vending machines.
 * Cooldowns enforce this: one interaction per day.
 */

export type BrokerInteractionEffect =
  | { kind: "grant_resource"; resourceKey: ResourceKey; amount: number }
  | { kind: "restore_condition"; amount: number }
  | { kind: "reduce_instability"; amount: number }
  | { kind: "show_tip"; tipPool: string[] };

export type BrokerInteraction = {
  brokerId: string;
  type: "trade" | "service" | "info" | "passive";
  actionLabel: string;
  cost: number;
  effect: BrokerInteractionEffect;
  cooldownMs: number;
  resultToast: string;
  confirmText: string;
};

const ONE_DAY = 86_400_000;

export const brokerInteractions: BrokerInteraction[] = [
  // CANON SOURCE: Evolution Puppy Vol.1 — Discount Lars, Bonehowl Syndicate
  {
    brokerId: "discount-lars",
    type: "trade",
    actionLabel: "Buy Lars's Special",
    cost: 15,
    effect: { kind: "grant_resource", resourceKey: "bioSamples", amount: 1 },
    cooldownMs: ONE_DAY,
    resultToast: "Lars slides the vial across. \"It's probably fine.\"",
    confirmText: "Buy 1 Ichor from Lars for 15 Sinful Coin? Quality not guaranteed.",
  },
  // CANON PARALLEL: The Cook / Mama Sol
  {
    brokerId: "mama-sol",
    type: "service",
    actionLabel: "Take a meal",
    cost: 10,
    effect: { kind: "restore_condition", amount: 25 },
    cooldownMs: ONE_DAY,
    resultToast: "Mama Sol doesn't ask what happened. She never does. The meal is warm.",
    confirmText: "Eat at Mama Sol's table for 10 Sinful Coin? Restores 25 condition.",
  },
  {
    brokerId: "kessler-9",
    type: "service",
    actionLabel: "Run diagnostic",
    cost: 20,
    effect: { kind: "reduce_instability", amount: 15 },
    cooldownMs: ONE_DAY,
    resultToast: "Kessler-9 runs the diagnostic without speaking. The frame settles. The numbers improve.",
    confirmText: "Frame diagnostic from Kessler-9 for 20 Sinful Coin? Reduces heat by 15.",
  },
  {
    brokerId: "glass",
    type: "info",
    actionLabel: "Buy intel",
    cost: 30,
    effect: {
      kind: "show_tip",
      tipPool: [
        "Glass slides a note: \"The Feast Hall is restocking Bonehowl-grade tissue tomorrow. Prices will drop.\"",
        "Glass says: \"Someone's been asking about your hunt records. Not a school — a broker. Be careful who you sell to.\"",
        "Glass whispers: \"The War Exchange is sitting on a surplus of Pharos Scrap. Sell before the price drops.\"",
        "Glass looks at you: \"The arena cycle resets in two days. The Warden has been watching the lower brackets.\"",
        "Glass folds the note: \"A Mandate shipment is overdue. When it arrives, Iron Ore floods the market. Buy now or wait.\"",
      ],
    },
    cooldownMs: ONE_DAY,
    resultToast: "", // Overridden by the random tip
    confirmText: "Buy intel from Glass for 30 Sinful Coin? You'll get one piece of market intelligence.",
  },
  {
    brokerId: "ashveil",
    type: "trade",
    actionLabel: "Buy a relic",
    cost: 50,
    effect: { kind: "grant_resource", resourceKey: "runeDust", amount: 1 },
    cooldownMs: ONE_DAY,
    resultToast: "Ashveil wraps it in ash-cloth without looking up. She knows what it's worth.",
    confirmText: "Buy 1 Soul Crystal from Ashveil for 50 Sinful Coin? Vault-grade, guaranteed.",
  },
];

const interactionMap = new Map(
  brokerInteractions.map((i) => [i.brokerId, i]),
);

export function getBrokerInteraction(
  brokerId: string,
): BrokerInteraction | undefined {
  return interactionMap.get(brokerId);
}

/** Passive brokers — have a card but no gameplay interaction. */
export const PASSIVE_BROKER_IDS = new Set([
  "sable",
  "old-ivory",
  "root",
  "nails",
  "tomo-wrench",
  "hazel",
  "iron-jaw",
]);

/** The Warden — silence IS the character. No interaction at all. */
export const SILENT_BROKER_IDS = new Set(["the-warden"]);
