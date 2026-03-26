export const AUTO_ATTACK_TICK_MS = 2000;
export const MANUAL_ATTACK_TICK_MS = 600;

export function nextAttackCooldownMs(autoAttackEnabled: boolean): number {
  return autoAttackEnabled ? AUTO_ATTACK_TICK_MS : MANUAL_ATTACK_TICK_MS;
}

