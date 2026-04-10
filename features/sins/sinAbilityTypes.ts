/**
 * Sin ability tree — data scaffold for the per-sin player ability layer.
 *
 * Canon: each of the 7 capital sins is already a "pressure of growth"
 * with a school, a lane, an institution, and a pantheon. This module
 * adds the final axis: a sin-specific player ability that the school
 * teaches and the lane sells.
 *
 * Foundation scaffold only — no reducer, no UI. Ships the TYPE + DATA
 * table so the combat engine + mastery system have somewhere to pull
 * from when the ability layer wires in M3+.
 */

import type { SinId } from "@/features/schools/schoolTypes";
import type { PressureIdentity } from "@/features/schools/schoolTypes";

export type SinAbilityId =
  | "wolf-leap"      // wrath
  | "sun-drain"      // gluttony
  | "mirror-swap"    // envy
  | "boon-contract"  // lust
  | "hoard-shield"   // greed
  | "mark-pulse"     // pride
  | "slow-field";    // sloth

export type SinAbilityDefinition = {
  id: SinAbilityId;
  sin: SinId;
  name: string;
  /** School-pressure this ability counters or leverages. */
  pressure: PressureIdentity;
  /** Short tooltip for the ability card. */
  description: string;
  /** Long-form lore for the ability detail panel. */
  longForm: string;
  /**
   * Foundation scaffold — no mana cost, duration, or damage values yet.
   * These will be added when the combat engine integration lands.
   */
  placeholder: true;
};

export const SIN_ABILITIES: Record<SinAbilityId, SinAbilityDefinition> = {
  "wolf-leap": {
    id: "wolf-leap",
    sin: "wrath",
    name: "Wolf-Leap",
    pressure: "escalation",
    description:
      "A pursuit-break charge that turns escalation pressure into movement. The Bonehowl discipline: motion is the only honest survival.",
    longForm:
      "The wolf-leap is the Bonehowl's answer to escalation — when the " +
      "pressure is rising and retreat is fatal, the pack commits forward " +
      "and trades proximity for initiative. The ability channels wrath " +
      "into a single burst-disengage: the operative strikes through the " +
      "pursuit line and lands behind it. Costs are steep, windows are " +
      "narrow, and mistiming is lethal.",
    placeholder: true,
  },
  "sun-drain": {
    id: "sun-drain",
    sin: "gluttony",
    name: "Sun-Drain",
    pressure: "consumption",
    description:
      "A tribute-cycle that converts consumption pressure into sustain. The Mouth of Inti discipline: hunger is the metabolism of power.",
    longForm:
      "Sun-drain inverts the gluttony equation: instead of eating your " +
      "own supplies, you eat the zone's ambient pressure. The operative " +
      "opens a tributary channel and lets the consumption force flow through " +
      "them rather than against them. The result is a heal-on-hit effect " +
      "that scales with the zone's consumption intensity.",
    placeholder: true,
  },
  "mirror-swap": {
    id: "mirror-swap",
    sin: "envy",
    name: "Mirror-Swap",
    pressure: "comparison",
    description:
      "A form-copy that turns comparison pressure into a loadout scramble. The Flesh Thrones discipline: envy is a measurement, not a weakness.",
    longForm:
      "Mirror-swap reads the target's current loadout profile and borrows " +
      "its strongest stat for a brief window. The operative becomes a " +
      "temporary copy — not a clone, but a comparison engine that improves " +
      "by the measurement. The target's advantage becomes yours, and the " +
      "Concord's intel network records the exchange.",
    placeholder: true,
  },
  "boon-contract": {
    id: "boon-contract",
    sin: "lust",
    name: "Boon-Contract",
    pressure: "temptation",
    description:
      "A forbidden-boon cycle that grants a powerful buff with a deferred corruption cost. The Crimson Altars discipline: take the boon, walk away clean.",
    longForm:
      "Boon-contract is the Astarte Veil's signature play: accept a " +
      "temptation-sourced buff that strengthens the operative immediately " +
      "but starts a corruption timer. If the buff expires naturally, the " +
      "corruption settles and costs condition. If the operative cleanses " +
      "before the timer runs out (via the Veil's cleansing rite or by " +
      "burning mana), they keep the buff and escape clean.",
    placeholder: true,
  },
  "hoard-shield": {
    id: "hoard-shield",
    sin: "greed",
    name: "Hoard-Shield",
    pressure: "hoarding",
    description:
      "A wealth-barrier that converts stored resources into a temporary damage shield. The Vishrava discipline: greed only corrupts when it's careless.",
    longForm:
      "Hoard-shield borrows a fraction of the operative's current resource " +
      "stockpile and crystallizes it into a temporary barrier. The more " +
      "you carry, the harder the shield hits — but the cost is real: the " +
      "resources are spent whether the shield absorbs or not. The Ledger " +
      "calls this the patience premium: the disciplined hoarder survives " +
      "what the careless spender does not.",
    placeholder: true,
  },
  "mark-pulse": {
    id: "mark-pulse",
    sin: "pride",
    name: "Mark-Pulse",
    pressure: "exposure",
    description:
      "A visibility burst that marks all enemies in range, turning exposure pressure into targeting data. The Divine Pharos discipline: anything visible is also owned.",
    longForm:
      "Mark-pulse floods the zone with a brief lighthouse-strength " +
      "visibility pulse. Every enemy in range is tagged for a short " +
      "window — tagged targets take more damage from all sources. The " +
      "Pharos Conclave teaches that pride is not vanity; it's the " +
      "discipline of forcing everything into the light, where it can " +
      "be cataloged, measured, and destroyed.",
    placeholder: true,
  },
  "slow-field": {
    id: "slow-field",
    sin: "sloth",
    name: "Slow-Field",
    pressure: "delay",
    description:
      "A temporal zone that inflicts delay pressure on enemies inside its radius. The Clockwork Mandate discipline: the patient body outlasts.",
    longForm:
      "Slow-field deploys a localized time-compression artifact that " +
      "stretches the subjective duration of every enemy action inside " +
      "its radius. The targets don't stop moving — they just move later, " +
      "which is the same as not moving at all when the operative is " +
      "already gone. The Mandate Bureau sells this exact technology in " +
      "the Silent Garden for civilian use.",
    placeholder: true,
  },
};

export const SIN_ABILITY_ORDER: SinAbilityId[] = [
  "wolf-leap",
  "sun-drain",
  "mirror-swap",
  "boon-contract",
  "hoard-shield",
  "mark-pulse",
  "slow-field",
];
