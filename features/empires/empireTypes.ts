/**
 * Empire types — the macro-political layer of the world.
 *
 * Canon (lore-canon/01 Master Canon/Empires/The Three Empires.md):
 * The three empires rise from the larger conflict of the schools and are
 * NOT just political bodies — they are civilizational expressions of
 * different evolutionary answers (body, mind, soul).
 *
 * Each empire is the parent of 2-3 schools (per docs/7-school-gameplay-spine.md).
 */

import type { SchoolId } from "@/features/schools/schoolTypes";

export type EmpireId = "bio" | "mecha" | "pure";

export type Empire = {
  id: EmpireId;
  /** Canonical display name. */
  name: string;
  /** Short evocative tagline. */
  tagline: string;
  /** One-sentence philosophy from the lore vault. */
  philosophy: string;
  /** Longer narrative paragraph for HQ pages. */
  longForm: string;
  /** Child school ids — empire is the parent. */
  schoolIds: SchoolId[];
  /** Accent color (hex) for theming HQ pages. */
  accentHex: string;
  /** Doctrine keyword surfaced in pressure UI. */
  doctrineWord: string;
  /** What this empire claims about humanity's future (the war they wage). */
  claim: string;
};
