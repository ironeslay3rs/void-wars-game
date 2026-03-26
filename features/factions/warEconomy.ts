import type { PlayerState } from "@/features/game/gameTypes";
import { aggregateRegionalPressureKind } from "@/features/factions/factionWorldLogic";

/**
 * M6 slice: doctrine war pressure nudges legal commodity quotes (Void Market).
 */
export function getVoidMarketWarAdjustments(player: PlayerState): {
  buyMult: number;
  sellMult: number;
  label: string | null;
} {
  if (player.factionAlignment === "unbound") {
    return { buyMult: 1, sellMult: 1, label: null };
  }
  const kind = aggregateRegionalPressureKind({
    factionAlignment: player.factionAlignment,
    byZone: player.zoneDoctrinePressure,
  });
  if (kind === "contested") {
    return {
      buyMult: 1.06,
      sellMult: 0.96,
      label: "War levy: contested theatres tighten supply (+6% buy, −4% sell net).",
    };
  }
  if (kind === "reinforced") {
    return {
      buyMult: 0.99,
      sellMult: 1.03,
      label: "Doctrine advantage: your bloc holds ground (−1% buy, +3% sell net).",
    };
  }
  return { buyMult: 1, sellMult: 1, label: null };
}
