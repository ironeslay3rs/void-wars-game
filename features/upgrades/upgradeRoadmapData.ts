import type {
  FutureUpgradeBeat,
  UpgradeDesignPillar,
  UpgradeHorizon,
} from "./upgradeTypes";

export const upgradeHorizonLabels: Record<UpgradeHorizon, string> = {
  near: "Near term",
  mid: "Mid term",
  late: "Later",
};

/**
 * Void Wars progression design — roadmap layer.
 *
 * Pacing model (loops):
 * - **Tight** (minutes): vitals, vent heat, quick crafts — keeps the session readable.
 * - **Session** (one sit): rank XP, partial recipe gathers, one mastery move.
 * - **Arc** (days): mythic gates, tri-school identity, named materials.
 *
 * This file is the handoff surface for future mechanics: add a `FutureUpgradeBeat` when
 * the fantasy is agreed, then implement `UpgradeOption` rows in `upgradeSelectors.ts`
 * when state + reducers exist. Stable ids preserve analytics and copy diffs.
 */

export const upgradeDesignPillarCopy: Record<
  UpgradeDesignPillar,
  { label: string; blurb: string }
> = {
  pressure: {
    label: "Pressure economy",
    blurb:
      "Heat, hunger, and recovery define risk. Future work tightens feedback between " +
      "pushing runs and paying stabilizers.",
  },
  economy: {
    label: "Material throughput",
    blurb:
      "Credits and named mats gate power spikes. Expansions should add sinks that feel " +
      "fair, not grindy — new recipes before new currencies.",
  },
  identity: {
    label: "Path & mythic identity",
    blurb:
      "Runes and ascension beats are the character sheet. New tiers should change verbs " +
      "(what you can file, forge, or deploy), not only numbers.",
  },
  field: {
    label: "Field presence",
    blurb:
      "Deploy and hunt loops reward preparation. Roadmap items here should change " +
      "encounter texture or contract stakes, not only loot tables.",
  },
  social: {
    label: "Crew & market",
    blurb:
      "Guild and bazaar layers spread risk across players. Future upgrades should offer " +
      "coordination payoffs, not mandatory grouping.",
  },
};

/**
 * Ordered near → late for UI. Ids must stay unique (see test).
 */
export const futureUpgradeBeats: FutureUpgradeBeat[] = [
  {
    id: "roadmap-ember-vault-tiers",
    horizon: "near",
    headline: "Ember vault clearance tiers",
    teaser:
      "Stacked withdrawal limits and hazard rebates keyed to rank and mythic filing — " +
      "rewards storing cores instead of cashing out early.",
    pillar: "economy",
    previewHref: "/bazaar/ember-vault",
  },
  {
    id: "roadmap-settlement-streak-modifiers",
    horizon: "near",
    headline: "Settlement streak modifiers",
    teaser:
      "Track consecutive contract closes to unlock one-shot kit discounts or heat trims — " +
      "pays out disciplined pacing without a new currency.",
    pillar: "pressure",
    previewHref: "/home",
  },
  {
    id: "roadmap-valor-ladder-extensions",
    horizon: "mid",
    headline: "Knight valor ladder extensions",
    teaser:
      "Post–Convergence Prime beats that trade valor for doctrine encounters and " +
      "faction-visible titles — mythic progression that shows in the world.",
    pillar: "identity",
    previewHref: "/mastery",
  },
  {
    id: "roadmap-expedition-contract-tags",
    horizon: "mid",
    headline: "Expedition contract tags",
    teaser:
      "Hunt rows gain optional tags (storm, salvage, boss-adjacent) that reweight loot " +
      "and heat — player-chosen risk knobs on the same map.",
    pillar: "field",
    previewHref: "/hunt",
  },
  {
    id: "roadmap-guild-war-chest",
    horizon: "mid",
    headline: "Guild war chest & surcharges",
    teaser:
      "Pooled scrap and credits fund squad-wide vent windows or market fee cuts — " +
      "coordination sinks with clear UI on who paid what.",
    pillar: "social",
    previewHref: "/guild",
  },
  {
    id: "roadmap-black-market-favor",
    horizon: "late",
    headline: "Black market favor tracks",
    teaser:
      "District-specific reputation unlocks broker cards, feast rotations, and " +
      "mirror-house stakes — narrative progression inside the bazaar layer.",
    pillar: "social",
    previewHref: "/bazaar/black-market",
  },
];

export const upgradeRoadmapScreenCopy = {
  eyebrow: "Pipeline",
  title: "Future upgrades",
  subtitle:
    "Confirmed design directions — not yet wired into live progression. When a beat ships, " +
    "it graduates from this list into the main upgrade feed above.",
} as const;
