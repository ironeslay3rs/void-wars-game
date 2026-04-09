/**
 * Mission origin tags — where the opportunity leaked from.
 * Every mission in the Black Market has a source:
 * distant wars, nation castoffs, local scams, or faction surpluses.
 *
 * Origin tags affect: loot flavor, capacity lean, flavor text, and
 * hidden faction influence shifts.
 *
 * CANON STATUS: GAME-SPECIFIC DESIGN
 * Origin tag names use game-specific nation seat titles (see nationData.ts).
 * The vault confirms 7 pantheons but specific nation naming is not finalized.
 * Capacity lean concepts (blood/frame/resonance) are consistent with vault
 * school descriptions.
 *
 * Phase 9 / Sin Institutions unlock 2: each sin-aligned origin tag also
 * carries an `institutionId` naming the operating org the contract leaked
 * from. The local catch-all (`black-market-local`) stays null.
 */

import type { InstitutionId } from "@/features/institutions/institutionTypes";

export type MissionOriginTagId =
  | "bonehowl-remnant"
  | "olympus-castoff"
  | "crimson-altar-contraband"
  | "pharos-surplus"
  | "mandate-salvage"
  | "mouth-of-inti-relic"
  | "thousand-hands-fragment"
  | "black-market-local";

export type MissionOriginTag = {
  id: MissionOriginTagId;
  label: string;
  /** Short nation/source label for badges. */
  badge: string;
  /** Capacity pool this origin's loot leans toward. */
  capacityLean: "blood" | "frame" | "resonance" | "mixed";
  /** Accent color class for the badge. */
  accentClass: string;
  /** One-line description of what kind of material comes from this source. */
  materialFlavor: string;
  /**
   * Phase 9: which operating org the contract leaked from. Null only for
   * `black-market-local`, which by design has no institutional source.
   */
  institutionId: InstitutionId | null;
};

export const missionOriginTags: Record<MissionOriginTagId, MissionOriginTag> = {
  "bonehowl-remnant": {
    id: "bonehowl-remnant",
    label: "Bonehowl Remnant",
    badge: "Bonehowl",
    capacityLean: "blood",
    accentClass: "border-red-500/30 bg-red-500/10 text-red-200/80",
    materialFlavor:
      "Wrath-fueled beast war remnants — predator marrow, Fenrir blood, hunting trophies.",
    institutionId: "bonehowl-syndicate",
  },
  "olympus-castoff": {
    id: "olympus-castoff",
    label: "Olympus Castoff",
    badge: "Olympus",
    capacityLean: "blood",
    accentClass: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200/80",
    materialFlavor:
      "Failed flesh throne experiments — tissue grafts, DNA mirrors, castoff mutations.",
    institutionId: "olympus-concord",
  },
  "crimson-altar-contraband": {
    id: "crimson-altar-contraband",
    label: "Crimson Altar Contraband",
    badge: "Crimson Altar",
    capacityLean: "blood",
    accentClass: "border-pink-400/30 bg-pink-400/10 text-pink-200/80",
    materialFlavor:
      "Forbidden desire-tech — pheromone catalysts, neural-bond tissue, pleasure-pain arrays.",
    institutionId: "astarte-veil",
  },
  "pharos-surplus": {
    id: "pharos-surplus",
    label: "Pharos Surplus",
    badge: "Pharos",
    capacityLean: "frame",
    accentClass: "border-amber-300/30 bg-amber-300/10 text-amber-200/80",
    materialFlavor:
      "Pristine Mecha components from Egypt's divine engineers. Every piece works perfectly.",
    institutionId: "pharos-conclave",
  },
  "mandate-salvage": {
    id: "mandate-salvage",
    label: "Mandate Salvage",
    badge: "Mandate",
    capacityLean: "frame",
    accentClass: "border-slate-400/30 bg-slate-400/10 text-slate-200/80",
    materialFlavor:
      "Patient, methodical tech from China's clockwork bureaucracy. Slow to arrive, impossible to break.",
    institutionId: "mandate-bureau",
  },
  "mouth-of-inti-relic": {
    id: "mouth-of-inti-relic",
    label: "Mouth of Inti Relic",
    badge: "Mouth of Inti",
    capacityLean: "resonance",
    accentClass: "border-orange-400/30 bg-orange-400/10 text-orange-200/80",
    materialFlavor:
      "Soul-forged memories and fire-touched relics. They consume what they touch.",
    institutionId: "inti-court",
  },
  "thousand-hands-fragment": {
    id: "thousand-hands-fragment",
    label: "Thousand Hands Fragment",
    badge: "Thousand Hands",
    capacityLean: "resonance",
    accentClass: "border-violet-400/30 bg-violet-400/10 text-violet-200/80",
    materialFlavor:
      "Greed-hoarded spiritual artifacts. Every piece was stolen from someone who needed it more.",
    institutionId: "vishrava-ledger",
  },
  "black-market-local": {
    id: "black-market-local",
    label: "Black Market Local",
    badge: "Local",
    capacityLean: "mixed",
    accentClass: "border-white/20 bg-white/5 text-white/70",
    materialFlavor:
      "Homegrown deals, scams, and survival jobs from the city itself.",
    institutionId: null,
  },
};

export function getOriginTag(id: MissionOriginTagId): MissionOriginTag {
  return missionOriginTags[id];
}
