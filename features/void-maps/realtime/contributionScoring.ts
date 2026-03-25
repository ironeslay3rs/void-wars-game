import type { RealtimeFieldRole } from "@/features/game/gameTypes";

export type ContributionTotals = {
  totalDamage: number;
  totalHits: number;
  mobsContributedTo: number;
  mobsKilled: number;
};

const CONTRIBUTION_WEIGHTS = {
  damage: 1,
  hits: 8,
  mobsContributedTo: 10,
  mobsKilled: 40,
} as const;

export function computeContributionComponents(totals: ContributionTotals) {
  return {
    damageComponent: totals.totalDamage * CONTRIBUTION_WEIGHTS.damage,
    hitsComponent: totals.totalHits * CONTRIBUTION_WEIGHTS.hits,
    contributedComponent:
      totals.mobsContributedTo * CONTRIBUTION_WEIGHTS.mobsContributedTo,
    killedComponent: totals.mobsKilled * CONTRIBUTION_WEIGHTS.mobsKilled,
  };
}

export function computeContributionScore(totals: ContributionTotals) {
  const c = computeContributionComponents(totals);
  return c.damageComponent + c.hitsComponent + c.contributedComponent + c.killedComponent;
}

export function getContributionRole(
  totals: ContributionTotals,
): RealtimeFieldRole {
  const c = computeContributionComponents(totals);
  const max = Math.max(
    c.damageComponent,
    c.hitsComponent,
    c.contributedComponent,
    c.killedComponent,
  );

  // Tie-break order intentionally matches the current UI expectations.
  if (max === c.killedComponent) return "Executioner";
  if (max === c.damageComponent) return "Artillery";
  if (max === c.hitsComponent) return "Pressure Specialist";
  return "Spotter";
}

export function getContributionProfessionHint(totals: ContributionTotals) {
  const role = getContributionRole(totals);
  switch (role) {
    case "Executioner":
      return "Finisher (kill tempo)";
    case "Artillery":
      return "Artillery (damage bursts)";
    case "Pressure Specialist":
      return "Pressure Specialist (chip + uptime)";
    case "Spotter":
    default:
      return "Spotter (tag + coordinated pressure)";
  }
}

