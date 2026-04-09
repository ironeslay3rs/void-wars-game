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
  const convergence = player.mythicAscension.convergencePrimed;
  if (player.factionAlignment === "unbound") {
    return convergence
      ? {
          buyMult: 1,
          sellMult: 1.02,
          label:
            "Convergence seal: neutral brokers still read your registry — Golden Bazaar sells net +2% (empire-scale paperwork).",
        }
      : { buyMult: 1, sellMult: 1, label: null };
  }
  const kind = aggregateRegionalPressureKind({
    factionAlignment: player.factionAlignment,
    byZone: player.zoneDoctrinePressure,
  });
  if (kind === "contested") {
    const sellMult = convergence ? 0.98 : 0.96;
    return {
      buyMult: 1.06,
      sellMult,
      label: convergence
        ? "War levy: contested theatres (+6% buy). Convergence filing softens sell pinch (−2% net vs −4%)."
        : "War levy: contested theatres tighten supply (+6% buy, −4% sell net).",
    };
  }
  if (kind === "reinforced") {
    const sellMult = convergence ? 1.05 : 1.03;
    return {
      buyMult: 0.99,
      sellMult,
      label: convergence
        ? "Doctrine advantage: reinforced lanes (−1% buy, +5% sell with convergence broker stamp)."
        : "Doctrine advantage: your bloc holds ground (−1% buy, +3% sell net).",
    };
  }
  return convergence
    ? {
        buyMult: 1,
        sellMult: 1.02,
        label:
          "Convergence seal: rim quotes calm, but your filed hybrid lane still nets +2% on Black Market sells.",
      }
    : { buyMult: 1, sellMult: 1, label: null };
}
