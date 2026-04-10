/**
 * Pantheon data — the 7 cultural / mythological remnants, one per school.
 *
 * Canon (`lore-canon/01 Master Canon/Pantheons/Pantheon Structure.md`) names
 * the seven cultural traditions and frames each as a "shattered remnant of
 * an older divine civilization" but does not name specific gods or define
 * inter-pantheon relationships. Each entry below stays inside that frame:
 *
 *   - Region + era are factual cultural anchors.
 *   - Domain summary uses abstract phrasing (no Odin, no Inti the figure,
 *     etc.); the school's own name already carries the canonical proper
 *     noun where canon supplied one.
 *   - Remnant + longForm describe what the surviving practice remembers,
 *     which is the actual gameplay-relevant axis.
 *
 * `canonSource: "game-specific"` is set on every entry — these are
 * cultural framings the game wrote to populate the pantheon layer. A
 * future canon pass can revise without touching the structure.
 *
 * Order matches `SCHOOL_ORDER` from `schoolData.ts` so empire grouping is
 * stable when the UI iterates.
 */

import type { Pantheon, PantheonId } from "@/features/pantheons/pantheonTypes";

export const PANTHEONS: Record<PantheonId, Pantheon> = {
  norse: {
    id: "norse",
    name: "Norse",
    schoolId: "bonehowl-of-fenrir",
    region: "Northern Europe (Scandinavia, Iceland, North Atlantic)",
    era: "Iron Age through the late medieval skaldic period",
    domain: "Frost, motion, the wolf-pack, and the discipline of survival",
    remnant:
      "The Bonehowl carry the predator philosophy of the old north — that motion is the only honest survival, that hesitation is death.",
    longForm:
      "The Norse pantheon sat at the edge of the habitable world and built its " +
      "divine civilization out of cold, motion, and the truth that pack " +
      "hierarchy is the difference between eating and being eaten. When the " +
      "old gods fell, what survived in the bones of Northern Europe was the " +
      "discipline itself: the predator's economy of breath and stride. The " +
      "Bonehowl of Fenrir inherited that economy and turned it into the " +
      "school that holds the Bio Empire's northern fronts. Their initiates " +
      "do not pray to the dead names — they run the routes the dead names " +
      "ran, and that is enough.",
    accentHex: "#9c2b2b",
    canonSource: "game-specific",
  },

  inca: {
    id: "inca",
    name: "Inca",
    schoolId: "mouth-of-inti",
    region: "Andean highlands (Peru, Bolivia, Ecuador)",
    era: "Pre-Columbian high empire through the post-conquest survival period",
    domain: "Sun, tribute, devouring, and ration politics",
    remnant:
      "The Mouth of Inti remembers the sun-mouth's hunger — that gluttony, properly disciplined, is the metabolism of an empire, not its corruption.",
    longForm:
      "The Inca pantheon ran the Andes on a tribute economy that the " +
      "conquerors never fully erased. Its surviving wisdom is the math of " +
      "feeding — who eats first, who eats last, what the sun-mouth demands " +
      "and what it returns. The Mouth of Inti school carries that math into " +
      "the Pure Empire's territory and into the Feast Hall of Blackcity. " +
      "Every plate served is a vote for which body the empire will grow next, " +
      "and every fast is a sacrifice the priest-rationers still record.",
    accentHex: "#c89530",
    canonSource: "game-specific",
  },

  greek: {
    id: "greek",
    name: "Greek",
    schoolId: "flesh-thrones-of-olympus",
    region: "Aegean basin (mainland Greece, Crete, Ionia)",
    era: "Mycenaean / Archaic / Classical period through the Roman absorption",
    domain: "Comparison, mimicry, rivalry, and the discipline of becoming",
    remnant:
      "The Flesh Thrones remember Olympus as a comparison engine — gods who measured each other and grew by the measurement.",
    longForm:
      "The Greek pantheon was the first divine civilization to make rivalry " +
      "the engine of growth. Its gods watched each other, copied each other, " +
      "and improved by the watching — and when the cult-fires went out the " +
      "method survived. The Flesh Thrones of Olympus inherited the comparison " +
      "discipline and turned it into a school of envy, where mutation through " +
      "imitation is the only path forward. Their initiates do not envy as a " +
      "weakness; they envy as a measurement, and they win by becoming the " +
      "thing they measured.",
    accentHex: "#b87d3a",
    canonSource: "game-specific",
  },

  canaanite: {
    id: "canaanite",
    name: "Canaanite",
    schoolId: "crimson-altars-of-astarte",
    region: "Eastern Mediterranean coast (Lebanon, coastal Syria, Cyprus)",
    era: "Late Bronze through the Phoenician trade era",
    domain: "Desire, contract, blood-offer, and the price of forbidden boons",
    remnant:
      "The Crimson Altars remember the Levantine temple-economy — that every pleasure is also a contract, and every contract has a settlement clause written in blood.",
    longForm:
      "The Canaanite pantheon ran the Levantine coast on temple-banks where " +
      "desire was both currency and collateral. Its gods sold seduction the " +
      "way other pantheons sold harvest: at fixed terms, with the cleansing " +
      "rite priced separately. When the cities fell the temple-economy " +
      "survived in fragments, and the Crimson Altars of Astarte carry those " +
      "fragments forward as the discipline of taking a forbidden boon and " +
      "walking away clean. Their initiates learn to cash a temptation out " +
      "before the corruption settles. The contract is the lesson.",
    accentHex: "#a4324c",
    canonSource: "game-specific",
  },

  hindu: {
    id: "hindu",
    name: "Hindu",
    schoolId: "thousand-hands-of-vishrava",
    region: "Indian subcontinent",
    era: "Vedic through the classical Puranic era and beyond",
    domain: "Hoarding, patience, the long ledger, and the discipline of holding",
    remnant:
      "The Thousand Hands remember the subcontinent's tax lattices — that greed only becomes corruption when it forgets to be patient.",
    longForm:
      "The Hindu pantheon was the first divine civilization to formalize the " +
      "long ledger — to treat wealth as a measurement of patience, not " +
      "appetite. Its surviving wisdom is the cursed cache: the hoard you " +
      "cannot spend until the right cycle, the patient hand that outlasts " +
      "every careless one. The Thousand Hands of Vishrava run that wisdom as " +
      "a school of greed inside the Pure Empire and as the Golden Bazaar in " +
      "the shadow citadel. Every trade in the bazaar is also a measurement " +
      "of how long the trader is willing to wait.",
    accentHex: "#c7a02b",
    canonSource: "game-specific",
  },

  egyptian: {
    id: "egyptian",
    name: "Egyptian",
    schoolId: "divine-pharos-of-ra",
    region: "Nile valley (Upper and Lower Egypt, the Delta)",
    era: "Old Kingdom through the Ptolemaic and Roman provincial period",
    domain: "Visibility, marking, prestige, and the discipline of being seen",
    remnant:
      "The Divine Pharos remember the Nile's lighthouse-fortresses — that anything visible is also marked, and anything marked is also owned.",
    longForm:
      "The Egyptian pantheon built its divine civilization around the line " +
      "between what could be seen and what could not. Its gods cataloged " +
      "everything: every grain, every name, every soul. When the dynasties " +
      "fell, the cataloging discipline survived as the lighthouse-fortresses " +
      "still anchoring the Nile. The Divine Pharos of Ra inherited that " +
      "discipline as a school of pride — taught that visibility itself is " +
      "the highest weapon, and that prestige well-managed is the same as " +
      "ownership. Their Ivory Tower negotiations in Blackcity are the same " +
      "discipline at smaller scale.",
    accentHex: "#c79a3a",
    canonSource: "game-specific",
  },

  chinese: {
    id: "chinese",
    name: "Chinese",
    schoolId: "clockwork-mandate-of-heaven",
    region: "East Asia (mainland China, Korea, Japan)",
    era: "Bronze Age dynasties through the imperial mandate period",
    domain: "Time, cycles, automation, and the discipline of outlasting",
    remnant:
      "The Clockwork Mandate remember the imperial cycle — that the body that outlasts is the body that decides what was just, after the fact.",
    longForm:
      "The Chinese pantheon built its civilization around the cycle and the " +
      "calendar — gods of dynasties that rose and fell on schedules longer " +
      "than any one mortal life. Its surviving wisdom is the slow weapon: " +
      "the trap that takes three cycles to spring, the patience that turns " +
      "into inevitability. The Clockwork Mandate of Heaven runs that wisdom " +
      "as a school of sloth inside the Mecha Empire's eastern frontier. " +
      "Their initiates do not move quickly; they move correctly, and the " +
      "Silent Garden in Blackcity sells the same patience as a service.",
    accentHex: "#5e7a8a",
    canonSource: "game-specific",
  },
};

/** Display order — matches the canonical SCHOOL_ORDER. */
export const PANTHEON_ORDER: PantheonId[] = [
  "norse",
  "greek",
  "canaanite",
  "inca",
  "hindu",
  "egyptian",
  "chinese",
];
