/**
 * Sin institution types — the operating organization layer.
 *
 * Canon (lore-canon/01 Master Canon/Sins/Sin Institutions.md):
 * "Each sin should have a major institution. Each institution should feel
 * culturally, visually, and philosophically distinct."
 *
 * The institution sits BETWEEN the school (public training tradition) and
 * the lane (shadow Blackcity venue) as the organization that operates
 * both. One institution per sin, exactly. The institution is the answer
 * to "who runs the Bonehowl of Fenrir AND who profits when the Arena of
 * Blood takes a cut?"
 *
 * Canon-locked names: Bonehowl Syndicate (Wrath, from Puppy Vol.1).
 * Other six names are game-specific creative work guided by the canon's
 * "culturally distinct" directive — see VOID_WARS_CANON_GAPS.md.
 */

import type { SchoolId, BlackMarketLaneId, SinId } from "@/features/schools/schoolTypes";

export type InstitutionId =
  | "bonehowl-syndicate"
  | "inti-court"
  | "olympus-concord"
  | "astarte-veil"
  | "vishrava-ledger"
  | "pharos-conclave"
  | "mandate-bureau";

export type Institution = {
  id: InstitutionId;
  /** Display name. */
  name: string;
  /** Short name for tight UI chips. */
  shortName: string;
  /** Sin this institution embodies (one-to-one). */
  sin: SinId;
  /** School this institution operates as the public face. */
  schoolId: SchoolId;
  /** Black market lane this institution runs as the shadow face. */
  laneId: BlackMarketLaneId;
  /** What the institution stands for in one sentence. */
  tagline: string;
  /** How the institution operates — its method, not its philosophy. */
  methods: string;
  /** Who they recruit, who they distrust, and who they trade with. */
  socialStance: string;
  /** Accent color (hex) for chips and badges. */
  accentHex: string;
  /**
   * Canon source — `book` / `puppy-spinoff` / `game-specific`. Drives the
   * doc trail in `VOID_WARS_CANON_GAPS.md`.
   */
  canonSource: "book" | "puppy-spinoff" | "game-specific";
};
