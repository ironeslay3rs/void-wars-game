export type RegionalWarBrief = {
  title: string;
  detail: string;
};

const BRIEFS: RegionalWarBrief[] = [
  {
    title: "Void relay traffic",
    detail:
      "Extra rim convoys this cycle — broker windows feel tighter until logistics flips.",
  },
  {
    title: "Salvage audit sweep",
    detail:
      "Chrome crews are spot-checking alloy loads — mecha-line scrap quotes may wobble for a day.",
  },
  {
    title: "Forward medic staging",
    detail:
      "Verdant teams pushed toward the front — bio rations and samples draw speculative bids.",
  },
  {
    title: "Ember corridor watch",
    detail:
      "Vault pickets tightened signal lanes — pure-path dust and cores see nervous buyers.",
  },
];

/** Day-rotating headline for home / missions (canon-neutral logistics color). */
export function getRegionalWarBriefForNow(nowMs: number): RegionalWarBrief {
  const day = Math.floor(nowMs / 86_400_000);
  return BRIEFS[day % BRIEFS.length]!;
}
