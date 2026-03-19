export type CombatUnit = {
  id: string;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  spd: number;
  crit: number;
  critDamage: number;
};

export type CombatAction = {
  attackerId: string;
  defenderId: string;
  damage: number;
  isCrit: boolean;
};

export type CombatResult = {
  log: CombatAction[];
  winnerId: string | null;
};