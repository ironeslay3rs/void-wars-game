/**
 * Formatters shared across blessing cards — pure string helpers.
 * Kept separate so visual components stay lean and below 300 lines.
 */
import type {
  Blessing,
  BlessingCost,
  BlessingEffect,
  FusionBlessing,
} from "@/features/incursion/blessingTypes";
import { CAPACITY_POOL_LABEL } from "./blessingStyles";

/** Turn a (sparse) BlessingEffect into a short list of "+X% Damage" lines. */
export function effectLines(effect: BlessingEffect): readonly string[] {
  const out: string[] = [];
  if (effect.damagePct) out.push(`+${effect.damagePct}% Damage`);
  if (effect.regenPerSec)
    out.push(`+${effect.regenPerSec.toFixed(1)}/s Regen`);
  if (effect.shieldPct) out.push(`+${effect.shieldPct}% Shield`);
  if (effect.precisionPct) out.push(`+${effect.precisionPct}% Precision`);
  if (effect.rangePct) out.push(`+${effect.rangePct}% Range`);
  if (effect.manaBonus) out.push(`+${effect.manaBonus} Mana`);
  if (effect.lootPct) out.push(`+${effect.lootPct}% Loot`);
  if (effect.dodgePct) out.push(`+${effect.dodgePct}% Dodge`);
  if (effect.foresightCharges)
    out.push(
      `+${effect.foresightCharges} Foresight charge${
        effect.foresightCharges === 1 ? "" : "s"
      }`,
    );
  if (effect.mismatchReductionPct)
    out.push(`-${effect.mismatchReductionPct}% Mismatch Penalty`);
  return out;
}

export function costLine(cost: BlessingCost): string {
  if (cost.kind === "corruption") return `+${cost.amount} Corruption`;
  if (cost.kind === "condition") return `-${cost.amount} Condition`;
  return `+${cost.amount} ${CAPACITY_POOL_LABEL[cost.pool]} Stress`;
}

export function costsFor(
  b: Blessing | FusionBlessing,
): readonly BlessingCost[] {
  return b.rarity === "fusion" ? b.costs : [b.cost];
}

export function rarityLabel(b: Blessing | FusionBlessing): string {
  if (b.rarity === "fusion") return "Black City Fusion";
  if (b.rarity === "rare") return "Rare";
  return "Common";
}
