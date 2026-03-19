import { calculateDamage } from "./combatFormulas";
import type { CombatAction, CombatResult, CombatUnit } from "./combatTypes";

export function runCombat(
  unitA: CombatUnit,
  unitB: CombatUnit
): CombatResult {
  const log: CombatAction[] = [];

  const fighterA = { ...unitA };
  const fighterB = { ...unitB };

  let attacker = fighterA.spd >= fighterB.spd ? fighterA : fighterB;
  let defender = attacker === fighterA ? fighterB : fighterA;

  while (fighterA.hp > 0 && fighterB.hp > 0) {
    const { damage, isCrit } = calculateDamage(attacker, defender);

    defender.hp -= damage;

    log.push({
      attackerId: attacker.id,
      defenderId: defender.id,
      damage,
      isCrit,
    });

    if (defender.hp <= 0) break;

    [attacker, defender] = [defender, attacker];
  }

  return {
    log,
    winnerId: fighterA.hp > 0 ? fighterA.id : fighterB.id,
  };
}