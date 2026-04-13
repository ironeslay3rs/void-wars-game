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
  /**
   * Optional unlock key. When present, this interaction only appears
   * if the player has the matching entry in `brokerDialogueUnlocks[brokerId]`.
   * Lets dialogue trees gate a broker's deeper/better offers on
   * narrative progress (Block 2).
   */
  requiresUnlock?: string;
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
  // Block 2 — unlocked by Lars's trusted-path dialogue. Canon Puppy Vol.1 line.
  {
    brokerId: "discount-lars",
    type: "trade",
    actionLabel: "Moon-Blessed Vial",
    cost: 40,
    effect: { kind: "grant_resource", resourceKey: "bioSamples", amount: 3 },
    cooldownMs: ONE_DAY,
    resultToast:
      "Lars pulls the moon-silver vial out. \"Pure Lycan Strain. Uncut. This one's the real thing.\"",
    confirmText:
      "Buy 3 Ichor (Moon-Blessed grade) from Lars for 40 Sinful Coin? Bonehowl labs-fresh.",
    requiresUnlock: "lars-premium-stock",
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
  // Block 2 unlock — Mama Sol's "second bowl" for regulars.
  {
    brokerId: "mama-sol",
    type: "service",
    actionLabel: "Take the second bowl",
    cost: 18,
    effect: { kind: "restore_condition", amount: 50 },
    cooldownMs: ONE_DAY,
    resultToast:
      "Mama Sol sets the second bowl in front of you without a word. It's twice the size and somehow warmer.",
    confirmText:
      "Eat the second bowl for 18 Sinful Coin? Restores 50 condition — for regulars only.",
    requiresUnlock: "mama-sol-second-bowl",
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
  // Block 2 unlock — Kessler-9's mother's tuning fork.
  {
    brokerId: "kessler-9",
    type: "service",
    actionLabel: "Precision tuning",
    cost: 35,
    effect: { kind: "reduce_instability", amount: 35 },
    cooldownMs: ONE_DAY,
    resultToast:
      "Kessler-9 uses the hand-made tool. The frame hums on-key for the first time in a long time. Reduces heat by 35.",
    confirmText:
      "Precision tuning from Kessler-9 for 35 Sinful Coin? Deeper heat relief — uses her mother's fork.",
    requiresUnlock: "kessler-precision-tuning",
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
  // Block 2 unlock — Glass's ash-bound ledger.
  {
    brokerId: "glass",
    type: "info",
    actionLabel: "Deep intel line",
    cost: 65,
    effect: {
      kind: "show_tip",
      tipPool: [
        "Glass reads from the ash-bound ledger: \"A Bonehowl enforcer sold your location to someone who's still watching. Check your back trail next time you extract.\"",
        "Glass reads from the ash-bound ledger: \"The Ivory Tower is quietly buying Pharos chassis-plates before the quarterly forge cycle. Prices will spike in two days.\"",
        "Glass reads from the ash-bound ledger: \"The Inti Court placed a standing bounty on off-path rune dust sellers. Hazel has been warned. You should be too.\"",
        "Glass reads from the ash-bound ledger: \"A faction I can't name is stockpiling Rune Dust against a run none of the schools have authorized. Ask Ashveil who's paying.\"",
        "Glass reads from the ash-bound ledger: \"The Warden has been watching the upper brackets. Not the lower. Something is going to happen at the top of the arena cycle.\"",
      ],
    },
    cooldownMs: ONE_DAY,
    resultToast: "",
    confirmText: "Buy deep intel from Glass for 65 Sinful Coin? Longer-horizon observations — not for browsers.",
    requiresUnlock: "glass-deep-intel",
  },
  // Block 2 — Hazel gains a base offer (she was passive in V1).
  {
    brokerId: "hazel",
    type: "trade",
    actionLabel: "Buy a scattered vial",
    cost: 25,
    effect: { kind: "grant_resource", resourceKey: "runeDust", amount: 1 },
    cooldownMs: ONE_DAY,
    resultToast:
      "Hazel hands over a vial. She starts to say something about the maker, then doesn't finish.",
    confirmText:
      "Buy 1 Rune Dust from Hazel for 25 Sinful Coin? Provenance is fragmented — like her.",
  },
  // Block 2 unlock — Hazel's memory-true fragment.
  {
    brokerId: "hazel",
    type: "trade",
    actionLabel: "Buy the true fragment",
    cost: 55,
    effect: { kind: "grant_resource", resourceKey: "runeDust", amount: 3 },
    cooldownMs: ONE_DAY,
    resultToast:
      "Hazel hands over the handwritten-label vial. \"Mayari would've wanted someone to use it.\"",
    confirmText:
      "Buy 3 Rune Dust (memory-true grade) from Hazel for 55 Sinful Coin? From her dig. Never sold before.",
    requiresUnlock: "hazel-true-fragment",
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
  // Block 2 unlock — Ashveil's personal piece.
  {
    brokerId: "ashveil",
    type: "trade",
    actionLabel: "Buy the personal piece",
    cost: 90,
    effect: { kind: "grant_resource", resourceKey: "emberCore", amount: 1 },
    cooldownMs: ONE_DAY,
    resultToast:
      "Ashveil unwraps the silk. A single ember-core rests inside. \"Keep it whole.\"",
    confirmText:
      "Buy 1 Ember Core from Ashveil for 90 Sinful Coin? The silk-wrapped piece. Never before sold.",
    requiresUnlock: "ashveil-personal-piece",
  },
  // Block 2 batch 3 — Sable (Velvet Den).
  {
    brokerId: "sable",
    type: "trade",
    actionLabel: "Buy an introduction",
    cost: 35,
    effect: { kind: "grant_resource", resourceKey: "runeDust", amount: 1 },
    cooldownMs: ONE_DAY,
    resultToast:
      "Sable writes a name and a time. \"Tell them I sent you. Don't lie about anything else.\"",
    confirmText:
      "Buy an introduction from Sable for 35 Sinful Coin? Trades as 1 Rune Dust — social leverage in material form.",
  },
  {
    brokerId: "sable",
    type: "trade",
    actionLabel: "Buy the bond catalyst",
    cost: 70,
    effect: { kind: "grant_resource", resourceKey: "bioSamples", amount: 2 },
    cooldownMs: ONE_DAY,
    resultToast:
      "Sable hands you the middle vial. \"Sparingly. With consent. I'll know.\"",
    confirmText:
      "Buy 2 Ichor (bond-catalyst grade) from Sable for 70 Sinful Coin?",
    requiresUnlock: "sable-bond-catalyst",
  },
  // Block 2 batch 3 — Old Ivory (Ivory Tower).
  {
    brokerId: "old-ivory",
    type: "trade",
    actionLabel: "Buy a minor mark",
    cost: 30,
    effect: { kind: "grant_resource", resourceKey: "scrapAlloy", amount: 4 },
    cooldownMs: ONE_DAY,
    resultToast:
      "Old Ivory polishes the mark one more time before handing it over. The gleam sells it.",
    confirmText:
      "Buy a minor Pharos mark from Old Ivory for 30 Sinful Coin? Trades as 4 Scrap Alloy (provenance premium).",
  },
  {
    brokerId: "old-ivory",
    type: "trade",
    actionLabel: "Buy the prestige mark",
    cost: 75,
    effect: { kind: "grant_resource", resourceKey: "scrapAlloy", amount: 10 },
    cooldownMs: ONE_DAY,
    resultToast:
      "Old Ivory hands over the real mark. \"People who see it pay attention. Earn it.\"",
    confirmText:
      "Buy the functional Prestige Mark from Old Ivory for 75 Sinful Coin? 10 Scrap Alloy equivalent — the real thing.",
    requiresUnlock: "old-ivory-prestige-mark",
  },
  // Block 2 batch 3 — Tomo Wrench (Crafting District).
  {
    brokerId: "tomo-wrench",
    type: "trade",
    actionLabel: "Buy standard alloy",
    cost: 20,
    effect: { kind: "grant_resource", resourceKey: "scrapAlloy", amount: 3 },
    cooldownMs: ONE_DAY,
    resultToast:
      "Tomo hands over the alloy wrapped in oiled cloth. Each fold of the cloth is precise.",
    confirmText:
      "Buy 3 Scrap Alloy from Tomo Wrench for 20 Sinful Coin? Mandate-grade, slow and clean.",
  },
  {
    brokerId: "tomo-wrench",
    type: "trade",
    actionLabel: "Buy bespoke alloy",
    cost: 50,
    effect: { kind: "grant_resource", resourceKey: "scrapAlloy", amount: 8 },
    cooldownMs: ONE_DAY,
    resultToast:
      "Tomo hands over the bespoke pour. \"Yours. Don't ask for it twice in one cycle.\"",
    confirmText:
      "Buy 8 Scrap Alloy (bespoke) from Tomo Wrench for 50 Sinful Coin? Shell-grade, one pour at a time.",
    requiresUnlock: "tomo-bespoke-alloy",
  },
  // Block 2 batch 3 — Iron Jaw (Mercenary Guild).
  {
    brokerId: "iron-jaw",
    type: "service",
    actionLabel: "Post a hunt",
    cost: 25,
    effect: { kind: "grant_resource", resourceKey: "credits", amount: 60 },
    cooldownMs: ONE_DAY,
    resultToast:
      "Iron Jaw stamps the contract. The bounty pays out on completion — you get advance on Guild standing.",
    confirmText:
      "Take a standard Guild contract from Iron Jaw for 25 Sinful Coin? Pays 60 credits on settlement.",
  },
  {
    brokerId: "iron-jaw",
    type: "service",
    actionLabel: "Take a priority contract",
    cost: 50,
    effect: { kind: "grant_resource", resourceKey: "credits", amount: 160 },
    cooldownMs: ONE_DAY,
    resultToast:
      "Iron Jaw hands over the leather-bound folder. \"You qualify. Don't make me wrong.\"",
    confirmText:
      "Take a Priority contract from Iron Jaw for 50 Sinful Coin? Pays 160 credits on settlement.",
    requiresUnlock: "iron-jaw-priority-contracts",
  },
];

const interactionsByBroker = brokerInteractions.reduce<
  Record<string, BrokerInteraction[]>
>((acc, i) => {
  (acc[i.brokerId] ??= []).push(i);
  return acc;
}, {});

/**
 * Returns the base (no-unlock) interaction for a broker.
 *
 * Keeps the legacy shape — existing call sites don't need to change
 * their behavior. For the new unlock-gated picker, use
 * `getBestUnlockedBrokerInteraction`.
 */
export function getBrokerInteraction(
  brokerId: string,
): BrokerInteraction | undefined {
  const list = interactionsByBroker[brokerId];
  if (!list) return undefined;
  return list.find((i) => !i.requiresUnlock);
}

/**
 * Returns the best interaction a broker will offer the player right now.
 * Prefers an unlocked deeper offer (via `requiresUnlock`) if the player
 * has the matching key; otherwise falls back to the base offer.
 *
 * This is how Block 2's dialogue-gated premium stock actually hits the
 * transaction layer.
 */
export function getBestUnlockedBrokerInteraction(
  brokerId: string,
  unlocks: string[],
): BrokerInteraction | undefined {
  const list = interactionsByBroker[brokerId];
  if (!list) return undefined;
  const unlockedOffer = list.find(
    (i) => i.requiresUnlock && unlocks.includes(i.requiresUnlock),
  );
  if (unlockedOffer) return unlockedOffer;
  return list.find((i) => !i.requiresUnlock);
}

/** Passive brokers — have a card but no gameplay interaction. */
export const PASSIVE_BROKER_IDS = new Set(["root", "nails"]);

/** The Warden — silence IS the character. No interaction at all. */
export const SILENT_BROKER_IDS = new Set(["the-warden"]);
