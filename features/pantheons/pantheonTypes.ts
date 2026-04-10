/**
 * Pantheon types — the cultural / mythological layer.
 *
 * Canon (`lore-canon/01 Master Canon/Pantheons/Pantheon Structure.md`):
 *   "Pantheons are shattered remnants of older divine civilizations. They
 *   should not feel like random mythology references — every pantheon
 *   tracks how gods fell, survived, or transformed; which figures became
 *   demons; which remain active powers in hidden form."
 *
 * Canon depth on pantheons is intentionally shallow at this point — the
 * master canon names the seven cultural traditions but does NOT name
 * specific gods, define inter-pantheon relationships, or expose any
 * gameplay mechanic tied to pantheon choice. The data layer here mirrors
 * that shallowness on purpose: 7 pantheons, one per school (1:1 join via
 * `schoolId`), each carrying a region, an era frame, a domain summary,
 * and a "what the remnants remember" line. No gameplay mechanic — pure
 * walkable lore that feeds the school HQ pages and a future pantheon hub.
 *
 * The seven canonical pantheon ids match the seven schools 1:1:
 *
 *   norse        → Bonehowl of Fenrir          (Wrath / Norway)
 *   inca         → Mouth of Inti               (Gluttony / Peru)
 *   greek        → Flesh Thrones of Olympus    (Envy / Greece)
 *   canaanite    → Crimson Altars of Astarte   (Lust / Lebanon)
 *   hindu        → Thousand Hands of Vishrava  (Greed / India)
 *   egyptian     → Divine Pharos of Ra         (Pride / Egypt)
 *   chinese      → Clockwork Mandate of Heaven (Sloth / China)
 *
 * Game-specific creative work flagged via `canonSource` so a future canon
 * pass can revise the lore notes without touching the structure.
 */

import type { SchoolId } from "@/features/schools/schoolTypes";

export type PantheonId =
  | "norse"
  | "inca"
  | "greek"
  | "canaanite"
  | "hindu"
  | "egyptian"
  | "chinese";

export type Pantheon = {
  id: PantheonId;
  /** Display name (e.g. "Norse"). */
  name: string;
  /** The school whose open-face institution descends from this pantheon. */
  schoolId: SchoolId;
  /** Geographic anchor of the original tradition. */
  region: string;
  /** Broad temporal frame canon implies for the surviving practice. */
  era: string;
  /**
   * One-line summary of the divine domain. Deliberately abstract — no
   * specific god names appear here because canon has not yet named any
   * celestial figure. The school name itself carries the canonical proper
   * noun (e.g. "Inti", "Astarte"); the pantheon entry talks in domains.
   */
  domain: string;
  /**
   * "What the remnants remember" — the surviving aspect canon describes as
   * a "shattered remnant of an older divine civilization." One sentence,
   * conservative wording.
   */
  remnant: string;
  /**
   * Long-form blurb for the pantheon HQ page — extends the remnant line
   * into a full lore beat. Still avoids naming specific gods.
   */
  longForm: string;
  /** Accent color (mirrors the linked school). */
  accentHex: string;
  /**
   * Canon source — `book` (named in master canon files) /
   * `puppy-spinoff` / `game-specific` (cultural framing extrapolated for
   * the game-side data layer).
   */
  canonSource: "book" | "puppy-spinoff" | "game-specific";
};
