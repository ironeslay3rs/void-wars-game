export type FeastCourse = {
  id: "coil-broth" | "synod-skewers" | "vault-ashcake";
  title: string;
  supplier: string;
  taste: string;
  laneNote: string;
  aftertaste: string;
  accentClass: string;
};

export const feastHallScreenData = {
  eyebrow: "Black Market / Feast Hall",
  title: "Feast Hall",
  subtitle:
    "The Black Market now anchors a neutral survivor citadel. Book 1 opens with one live Gluttony lane: take a seat, buy one course, and see which power fed the table.",
  statusCards: [
    {
      label: "Citadel Status",
      value: "Neutral",
      hint: "Black Market stays outside Bio, Mecha, and Pure control even while all three supply the hall.",
    },
    {
      label: "Open Lane",
      value: "Gluttony / 01",
      hint: "Only the Feast Hall lane is live in this slice.",
    },
    {
      label: "Book 1 Scope",
      value: "Load-Bearing",
      hint: "This is the smallest real lane: one room, three suppliers, one finished plate.",
    },
  ],
} as const;

export const feastCourses: FeastCourse[] = [
  {
    id: "coil-broth",
    title: "Verdant Coil Broth",
    supplier: "Verdant Coil",
    taste: "Living greens, marrow salt, and a pulse of borrowed stamina.",
    laneNote:
      "Bio crews use this broth to prove the Black Market can feed survivors faster than any clean district ration line.",
    aftertaste:
      "Your hands stop shaking. The room tags you as someone the Coil can keep alive for a price.",
    accentClass: "border-emerald-400/30 bg-emerald-500/10",
  },
  {
    id: "synod-skewers",
    title: "Chrome Synod Skewers",
    supplier: "Chrome Synod",
    taste: "Charred protein, conductive glaze, and machine-cut precision.",
    laneNote:
      "Mecha brokers serve measured portions to show that discipline can still look like abundance when the plating is sharp enough.",
    aftertaste:
      "Your jaw hums with static. Synod spotters mark you as a body worth upgrading instead of burying.",
    accentClass: "border-cyan-400/30 bg-cyan-500/10",
  },
  {
    id: "vault-ashcake",
    title: "Ember Vault Ashcake",
    supplier: "Ember Vault",
    taste: "Smoked grain, ember syrup, and a slow furnace heat under the tongue.",
    laneNote:
      "Pure pilgrims pass these cakes through the hall to remind the desperate that hunger can still become ritual, not collapse.",
    aftertaste:
      "Your chest warms like banked coals. The Vault reads you as someone who might endure the next lean week.",
    accentClass: "border-amber-400/30 bg-amber-500/10",
  },
];
