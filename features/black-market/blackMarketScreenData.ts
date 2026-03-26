export type BlackMarketLaneId =
  | "wrath"
  | "gluttony"
  | "envy"
  | "lust"
  | "greed"
  | "pride"
  | "sloth";

export type BlackMarketLanePlaceholder = {
  id: BlackMarketLaneId;
  sin: string;
  lane: string;
  status: "live" | "placeholder";
  note: string;
};

export const blackMarketRoleSummary = {
  eyebrow: "Black Market / Neutral Citadel",
  title: "Black Market",
  subtitle:
    "A neutral survivor citadel between Bio, Mecha, and Pure. All seven sin lanes are marked on the hub map; Book 1 play is Gluttony / Feast Hall — the rest open as future services.",
} as const;

export const blackMarketLanePlaceholders: BlackMarketLanePlaceholder[] = [
  {
    id: "gluttony",
    sin: "Gluttony",
    lane: "Feast Hall",
    status: "live",
    note:
      "The first active lane. Feast Hall converts current resources into recovery and readiness for the next push into the Void.",
  },
  {
    id: "wrath",
    sin: "Wrath",
    lane: "Arena of Blood",
    status: "placeholder",
    note: "Reserved as a future Black Market lane. Not playable in this Book 1 slice.",
  },
  {
    id: "envy",
    sin: "Envy",
    lane: "Mirror House",
    status: "placeholder",
    note: "Reserved as a future Black Market lane. Not playable in this Book 1 slice.",
  },
  {
    id: "lust",
    sin: "Lust",
    lane: "Velvet Den",
    status: "placeholder",
    note: "Reserved as a future Black Market lane. Not playable in this Book 1 slice.",
  },
  {
    id: "greed",
    sin: "Greed",
    lane: "Golden Bazaar",
    status: "placeholder",
    note: "Reserved as a future Black Market lane. Not playable in this Book 1 slice.",
  },
  {
    id: "pride",
    sin: "Pride",
    lane: "Ivory Tower",
    status: "placeholder",
    note: "Reserved as a future Black Market lane. Not playable in this Book 1 slice.",
  },
  {
    id: "sloth",
    sin: "Sloth",
    lane: "Silent Garden",
    status: "placeholder",
    note: "Reserved as a future Black Market lane. Not playable in this Book 1 slice.",
  },
] as const;
