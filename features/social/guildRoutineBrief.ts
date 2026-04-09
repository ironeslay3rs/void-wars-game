export type GuildRoutineBrief = {
  title: string;
  detail: string;
};

/** Phase 8 — rotating collective habit (local save; canon-neutral logistics). */
const ROUTINES: GuildRoutineBrief[] = [
  {
    title: "Hot-sector relay",
    detail:
      "Pair two operatives on the contested lane this week—one on extract, one on broker cover—so the ledger never goes cold.",
  },
  {
    title: "Contract handoff",
    detail:
      "Screenshot or note your posted guild objective before rotation; officers reclaim stalled lines fast.",
  },
  {
    title: "Pledge alignment drill",
    detail:
      "When your guild pledge matches the theater school, push one extra hunt in-sector before restocking—Phase 8 pays pledge theater on the mercenary line.",
  },
  {
    title: "Rival shadowing",
    detail:
      "Check the local board after every payout run; overtakes under ~22 contribution are recoverable in one good cycle.",
  },
];

export function getGuildRoutineBriefForNow(nowMs: number): GuildRoutineBrief {
  const day = Math.floor(nowMs / 86_400_000);
  return ROUTINES[day % ROUTINES.length]!;
}
