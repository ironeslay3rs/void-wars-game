export type BlackMarketLaneId =
  | "wrath"
  | "gluttony"
  | "envy"
  | "lust"
  | "greed"
  | "pride"
  | "sloth";

/** How the lane shows up in the live client — not “content done,” but player-facing role. */
export type BlackMarketLaneKind = "primary" | "district" | "arena" | "commodity";

export type BlackMarketLaneMeta = {
  id: BlackMarketLaneId;
  sin: string;
  lane: string;
  kind: BlackMarketLaneKind;
  /** Diegetic one-liner for hub copy and tooltips */
  note: string;
};

/**
 * Seven sin lanes — canon naming from AGENTS.md. Routes exist for districts;
 * Wrath routes through Arena; Greed uses the commodity desk + auction experiment.
 */
export const blackMarketLanes: BlackMarketLaneMeta[] = [
  {
    id: "gluttony",
    sin: "Gluttony",
    lane: "Feast Hall",
    kind: "primary",
    note:
      "Book 1 recovery spine — convert stores into posture and readiness before the next void push.",
  },
  {
    id: "wrath",
    sin: "Wrath",
    lane: "Arena of Blood",
    kind: "arena",
    note:
      "Combat pressure lives in the Arena — this map hit routes there, not a separate shop shell.",
  },
  {
    id: "envy",
    sin: "Envy",
    lane: "Mirror House",
    kind: "district",
    note:
      "Identity and illusion services — district page is live; depth grows with Book 1 pacing.",
  },
  {
    id: "lust",
    sin: "Lust",
    lane: "Velvet Den",
    kind: "district",
    note:
      "Desire-binding floor — visit the district; systems tighten as the slice hardens.",
  },
  {
    id: "greed",
    sin: "Greed",
    lane: "Golden Bazaar",
    kind: "commodity",
    note:
      "Citadel commodity desk for taxed trades; player listings split to Auction House.",
  },
  {
    id: "pride",
    sin: "Pride",
    lane: "Ivory Tower",
    kind: "district",
    note:
      "Relics and prestige — district open; stock and stakes deepen with progression.",
  },
  {
    id: "sloth",
    sin: "Sloth",
    lane: "Silent Garden",
    kind: "district",
    note:
      "Stillness and vision aids — district open; treat it as pressure relief, not a skip button.",
  },
];

/** Map art hit targets (`BlackMarketMap` zone `id`) → compact registry chip under the sin label. */
export const blackMarketZoneRegistry: Record<
  string,
  { chip: string; kind: BlackMarketLaneKind }
> = {
  "feast-hall": { chip: "Primary · recovery", kind: "primary" },
  "arena-of-blood": { chip: "Wrath · arena", kind: "arena" },
  "mirror-house": { chip: "District · open", kind: "district" },
  "velvet-den": { chip: "District · open", kind: "district" },
  "golden-bazaar": { chip: "Greed · desk", kind: "commodity" },
  "ivory-tower": { chip: "District · open", kind: "district" },
  "silent-garden": { chip: "District · open", kind: "district" },
};

export const blackMarketRoleSummary = {
  eyebrow: "Black Market / Neutral Citadel",
  title: "Black Market",
  subtitle:
    "A neutral survivor hub between Bio, Mecha, and Pure. Seven sin lanes ring the map — each storefront answers a different hunger; Feast Hall carries recovery in Book 1.",
} as const;

/** Hub header strip — matches live routes (districts + arena + commodity desk). */
export const blackMarketM1LoopGuide =
  "Feast Hall anchors recovery. District floors run service deals when you can pay. Golden Bazaar is the taxed commodity desk; Wrath routes to the Arena.";
