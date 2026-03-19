import type { CombatUnit } from "./combatTypes";

export function calculateDamage(
  attacker: CombatUnit,
  defender: CombatUnit
) {
  const base = attacker.atk - defender.def * 0.5;
  const randomFactor = 0.9 + Math.random() * 0.2;

  let damage = Math.max(1, base * randomFactor);

  const isCrit = Math.random() < attacker.crit / 100;

  if (isCrit) {
    damage *= attacker.critDamage;
  }

  return {
    damage: Math.floor(damage),
    isCrit,
  };
}