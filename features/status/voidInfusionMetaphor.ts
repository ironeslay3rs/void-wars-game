/**
 * Player-facing umbrella for survival penalties (Darkest-Dungeon-style pressure,
 * AFK-Journey-style clarity). Internal state remains `voidInstability` + cargo math.
 */
export const VOID_INFUSION_HEADING = "Void infusion";

export const CARGO_INFUSION_HEADING = "Cargo infusion";

/** Short line for chips / HUD when instability is elevated. */
export function voidInfusionHudLine(voidInstability: number): string | null {
  if (voidInstability < 18) return null;
  return `${VOID_INFUSION_HEADING} ${Math.round(voidInstability)}`;
}

/** Recovery + consequence framing (pairs with tier `hint` from phase3). */
export const voidInfusionBodyExplainer =
  "Paid recovery, emergency rations, and moss rations shave the meter; staying fed and stable lets it decay. Heavy values add contract wear and can charge prep tithes when opening field sweeps.";

/** Cargo side of the same metaphor (over-cap hold). */
export const cargoInfusionBodyExplainer =
  "Cargo infusion means your hold is over capacity. The queue still runs, but timelines stretch, field movement drags, and mission pay thins until you sell or discard.";
