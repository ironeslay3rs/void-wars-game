/** Influence-tier copy for Phase 6 war-front pressure (no new ledger). */
export function getWarFrontContributionLine(influence: number): string {
  if (influence >= 400) {
    return "High influence — quartermasters flag your dossier; contested-lane brokers keep your paperwork warm.";
  }
  if (influence >= 150) {
    return "Rising footprint — clerks recognize your name on hot-sector manifests.";
  }
  return "Local contractor — theater pricing still treats you as standard clearance.";
}
