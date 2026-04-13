/**
 * Event Registry — timed offer events surfaced on the home HUD.
 *
 * Pure data. Each definition is canon-flavored (Verdant Coil, Chrome Synod,
 * Ember Vault) and keyed to a `kind` that drives the reward resolver.
 */

import type { ResourceKey } from "@/features/game/gameTypes";

export type EventKind = "bounty" | "sale" | "loot-boost" | "incursion";

export type EventRewardHint =
  | {
      kind: "resource";
      key: ResourceKey;
      amount: number;
    }
  | {
      kind: "multiplier";
      /** Applied to void-field / mission loot while the window is open. */
      lootMultiplier: number;
    }
  | {
      kind: "discount";
      /** 0..1 fraction off broker prices while open. */
      discountPct: number;
    }
  | {
      kind: "bounty-pool";
      /** Paid on claim, split across these resources. */
      pool: Partial<Record<ResourceKey, number>>;
    };

export type EventDefinition = {
  id: string;
  kind: EventKind;
  title: string;
  flavor: string;
  /** Minutes the window stays open once triggered. */
  durationMinutes: number;
  reward: EventRewardHint;
};

/** Canon factions: Verdant Coil (Bio), Chrome Synod (Ash/Mecha), Ember Vault (Ember). */
export const eventRegistry: readonly EventDefinition[] = [
  {
    id: "bounty.verdant-poacher",
    kind: "bounty",
    title: "Verdant Coil Poacher Bounty",
    flavor:
      "The Verdant Coil posts a contract — a rogue bio-harvester prowls the moss lanes.",
    durationMinutes: 60,
    reward: {
      kind: "bounty-pool",
      pool: { credits: 120, bioSamples: 4 },
    },
  },
  {
    id: "bounty.synod-defector",
    kind: "bounty",
    title: "Chrome Synod Defector Bounty",
    flavor:
      "A Synod engineer has gone dark. Chrome relay pings a live trace.",
    durationMinutes: 60,
    reward: {
      kind: "bounty-pool",
      pool: { credits: 140, scrapAlloy: 3 },
    },
  },
  {
    id: "bounty.ember-heretic",
    kind: "bounty",
    title: "Ember Vault Heretic Bounty",
    flavor: "Ember Vault marks a heretic forge-thief for silencing.",
    durationMinutes: 60,
    reward: {
      kind: "bounty-pool",
      pool: { credits: 150, emberCore: 2 },
    },
  },
  {
    id: "sale.broker-flash",
    kind: "sale",
    title: "Broker Flash Sale",
    flavor: "A broker dumps inventory ahead of a manifest audit.",
    durationMinutes: 30,
    reward: { kind: "discount", discountPct: 0.2 },
  },
  {
    id: "sale.blackcity-fence",
    kind: "sale",
    title: "Blackcity Fence Window",
    flavor: "Cross-school fence opens a short window on discount scrap.",
    durationMinutes: 45,
    reward: { kind: "discount", discountPct: 0.15 },
  },
  {
    id: "loot.double-drop",
    kind: "loot-boost",
    title: "Double Loot Window",
    flavor: "Void-field residue crests — drops double for anyone fielding.",
    durationMinutes: 30,
    reward: { kind: "multiplier", lootMultiplier: 2 },
  },
  {
    id: "loot.rune-surge",
    kind: "loot-boost",
    title: "Rune Surge",
    flavor: "A rune surge tilts the field — dust yields spike.",
    durationMinutes: 45,
    reward: { kind: "multiplier", lootMultiplier: 1.5 },
  },
  {
    id: "incursion.verdant",
    kind: "incursion",
    title: "Verdant Coil Incursion",
    flavor: "Coil warbands push through a torn lane — clear them for scrip.",
    durationMinutes: 40,
    reward: {
      kind: "bounty-pool",
      pool: { credits: 80, bioSamples: 6, runeDust: 4 },
    },
  },
  {
    id: "incursion.synod",
    kind: "incursion",
    title: "Chrome Synod Incursion",
    flavor: "Synod drone column breaches — salvage bounty on confirmed kills.",
    durationMinutes: 40,
    reward: {
      kind: "bounty-pool",
      pool: { credits: 90, scrapAlloy: 5, runeDust: 4 },
    },
  },
  {
    id: "incursion.ember",
    kind: "incursion",
    title: "Ember Vault Incursion",
    flavor: "Ember zealots ride the thermal — shear their line.",
    durationMinutes: 40,
    reward: {
      kind: "bounty-pool",
      pool: { credits: 100, emberCore: 3, runeDust: 4 },
    },
  },
];

export function getEventDefinition(id: string): EventDefinition | null {
  return eventRegistry.find((e) => e.id === id) ?? null;
}

export function eventsByKind(kind: EventKind): EventDefinition[] {
  return eventRegistry.filter((e) => e.kind === kind);
}
