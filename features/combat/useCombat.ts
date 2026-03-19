import { runCombat } from "./combatEngine";
import type { CombatUnit } from "./combatTypes";

export function useCombat() {
  function simulateFight() {
    const player: CombatUnit = {
      id: "player",
      hp: 120,
      maxHp: 120,
      atk: 20,
      def: 10,
      spd: 12,
      crit: 15,
      critDamage: 1.5,
    };

    const enemy: CombatUnit = {
      id: "enemy",
      hp: 100,
      maxHp: 100,
      atk: 18,
      def: 8,
      spd: 10,
      crit: 10,
      critDamage: 1.4,
    };

    return runCombat(player, enemy);
  }

  return { simulateFight };
}