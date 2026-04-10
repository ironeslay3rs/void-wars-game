/**
 * Loadout pressure compatibility — first explicit "your kit struggles
 * against this region's discipline" coupling between the loadout layer
 * and the school pressure identities (escalation / consumption /
 * comparison / temptation / hoarding / exposure / delay).
 *
 * Each loadout has TWO fragility pressures it doesn't handle well.
 * When a hunting-ground mission's deploy zone is held by a school whose
 * pressure type matches the player's fragility, the mission settle
 * applies a small extra void instability nudge — the kit "wears
 * faster" against the wrong pressure.
 *
 * Foundation slice: one effect (void instability surcharge), three
 * loadouts, two fragilities each. Future work can extend this to
 * combat math, encounter spawn rates, etc.
 *
 * Design rationale per loadout:
 *
 *   - **assault**: body-forward, no patience. Struggles against DELAY
 *     (Mandate of Heaven — out-waited) and EXPOSURE (Pharos — marked).
 *
 *   - **support**: tools-out, sustain-focused. Struggles against
 *     CONSUMPTION (Mouth of Inti — burns through supplies) and
 *     TEMPTATION (Crimson Altars — boons that backfire on the team).
 *
 *   - **breach**: bursty, in-and-out. Struggles against HOARDING
 *     (Vishrava — wealth carry punishment) and ESCALATION (Bonehowl —
 *     chained pursuit waves break the in-and-out rhythm).
 *
 * Note that ENVY/COMPARISON (Olympus) is the one pressure type no
 * loadout is fragile to in this baseline — it's the "neutral" pressure
 * that hits all kits equally. A future canon pass can revise.
 */

import type { FieldLoadoutProfile } from "@/features/game/gameTypes";
import type { PressureIdentity } from "@/features/schools/schoolTypes";

export const LOADOUT_FRAGILITIES: Record<
  FieldLoadoutProfile,
  ReadonlySet<PressureIdentity>
> = {
  assault: new Set<PressureIdentity>(["delay", "exposure"]),
  support: new Set<PressureIdentity>(["consumption", "temptation"]),
  breach: new Set<PressureIdentity>(["hoarding", "escalation"]),
};

/** Extra void instability points added on a fragility-matched hunt. */
export const PRESSURE_FRAGILITY_INSTABILITY_NUDGE = 4;

/**
 * True iff the loadout is fragile to the given pressure identity.
 */
export function isLoadoutFragileTo(
  profile: FieldLoadoutProfile,
  pressure: PressureIdentity,
): boolean {
  return LOADOUT_FRAGILITIES[profile].has(pressure);
}

/**
 * Returns the extra void instability to add on settlement when the
 * mission deploy zone's dominant pressure matches the loadout's
 * fragility, or 0 otherwise.
 */
export function getFragilityInstabilityNudge(
  profile: FieldLoadoutProfile,
  pressure: PressureIdentity | null,
): number {
  if (pressure === null) return 0;
  return isLoadoutFragileTo(profile, pressure)
    ? PRESSURE_FRAGILITY_INSTABILITY_NUDGE
    : 0;
}
