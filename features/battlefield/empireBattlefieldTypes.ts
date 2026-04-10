/**
 * Empire Battlefield — faction war zone where Bio/Mecha/Pure empires
 * fight for territorial control. Data seed for future development.
 *
 * Each battlefield zone has:
 *   - A controlling empire (shifts based on player activity)
 *   - A contested status that affects resource yields
 *   - Unique hazards tied to the dominant empire's pressure identity
 *   - Boss-level faction champions that spawn during war events
 *
 * This is the foundation scaffold. The actual battlefield route,
 * combat mechanics, and faction scoring system are future work.
 * What ships NOW is the data shape that the rest of the game can
 * reference when we build it.
 */

import type { EmpireId } from "@/features/empires/empireTypes";

export type BattlefieldZoneId =
  | "northern-front"   // Bio vs Mecha border
  | "eastern-rim"      // Mecha vs Pure border
  | "southern-basin";  // Pure vs Bio border

export type BattlefieldZoneStatus =
  | "peaceful"    // One empire holds clearly
  | "contested"   // Two empires fighting (bonus rewards, higher danger)
  | "warzone";    // All three empires active (max rewards, max danger)

export type BattlefieldZone = {
  id: BattlefieldZoneId;
  name: string;
  /** Which two empires naturally contest this border. */
  primaryContestants: [EmpireId, EmpireId];
  /** Current dominant controller (shifts via player activity). */
  controller: EmpireId | null;
  status: BattlefieldZoneStatus;
  /** Lore blurb for the zone selection screen. */
  description: string;
  /** Threat level 1-10 (higher than regular void field zones). */
  threatLevel: number;
  /** Minimum rank level to enter. */
  minRankLevel: number;
  /** Reward multiplier on top of normal field yields. */
  rewardMultiplier: number;
};

export type BattlefieldEvent = {
  id: string;
  name: string;
  description: string;
  /** Which zone this event fires in. */
  zoneId: BattlefieldZoneId;
  /** Duration in minutes. */
  durationMinutes: number;
  /** Extra reward multiplier during the event. */
  eventRewardMultiplier: number;
};
