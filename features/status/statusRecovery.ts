export const STATUS_RECOVERY_COST = 10;
export const STATUS_RECOVERY_AMOUNT = 20;
export const STATUS_RECOVERY_COOLDOWN_MS = 60000;

export const CONDITION_PRESSURE_THRESHOLD = 60;
export const CONDITION_PRESSURE_PENALTY = 4;

export const RUNE_CRAFTER_STABILIZATION_SIGIL =
  "rune-crafter-stabilization-sigil";
export const RUNE_CRAFTER_STABILIZATION_SIGIL_COST = {
  credits: 40,
  runeDust: 8,
  emberCore: 1,
} as const;
export const RUNE_CRAFTER_STABILIZATION_SIGIL_BONUS = 10;

export function hasStabilizationSigil(knownRecipes: string[]) {
  return knownRecipes.includes(RUNE_CRAFTER_STABILIZATION_SIGIL);
}

export function getStatusRecoveryAmount(knownRecipes: string[]) {
  return hasStabilizationSigil(knownRecipes)
    ? STATUS_RECOVERY_AMOUNT + RUNE_CRAFTER_STABILIZATION_SIGIL_BONUS
    : STATUS_RECOVERY_AMOUNT;
}

export function getConditionPressurePenalty(condition: number) {
  return condition < CONDITION_PRESSURE_THRESHOLD
    ? CONDITION_PRESSURE_PENALTY
    : 0;
}

export function getPressureAdjustedConditionDelta(
  condition: number,
  baseConditionDelta: number,
) {
  return baseConditionDelta - getConditionPressurePenalty(condition);
}
