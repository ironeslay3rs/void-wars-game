/**
 * Empire battlefield data — 3 war zones at empire borders.
 *
 * Each zone sits at the border between two empires. The third empire
 * can intervene, escalating the zone from "contested" to "warzone".
 *
 * Zone design follows the empire map:
 *   - Northern Front: Bio (Scandinavia) vs Mecha (Nile/East)
 *     → cold industrial corridors, predator packs vs drone swarms
 *   - Eastern Rim: Mecha (East Asia) vs Pure (India)
 *     → clockwork fields vs hoarding vaults, patience vs precision
 *   - Southern Basin: Pure (Andes/India) vs Bio (Levant/Greece)
 *     → sun-drain deserts vs mutation forests, tribute vs hunger
 */

import type {
  BattlefieldEvent,
  BattlefieldZone,
  BattlefieldZoneId,
} from "@/features/battlefield/empireBattlefieldTypes";

export const BATTLEFIELD_ZONES: Record<BattlefieldZoneId, BattlefieldZone> = {
  "northern-front": {
    id: "northern-front",
    name: "The Northern Front",
    primaryContestants: ["bio", "mecha"],
    controller: null,
    status: "contested",
    description:
      "Where the Bonehowl's predator storms meet the Pharos Conclave's " +
      "lighthouse arrays. Cold iron corridors and drone graveyards. " +
      "Bio operatives move faster here; Mecha operatives hit harder.",
    threatLevel: 6,
    minRankLevel: 3,
    rewardMultiplier: 1.25,
  },
  "eastern-rim": {
    id: "eastern-rim",
    name: "The Eastern Rim",
    primaryContestants: ["mecha", "pure"],
    controller: null,
    status: "contested",
    description:
      "The Mandate Bureau's clockwork tribunals border the Vishrava " +
      "Ledger's hoard-vaults. Slow fields and patience traps. " +
      "Mecha operatives resist the delay; Pure operatives hoard more.",
    threatLevel: 7,
    minRankLevel: 4,
    rewardMultiplier: 1.35,
  },
  "southern-basin": {
    id: "southern-basin",
    name: "The Southern Basin",
    primaryContestants: ["pure", "bio"],
    controller: null,
    status: "contested",
    description:
      "Where the Mouth of Inti's sun-drain fields meet the Flesh " +
      "Thrones' mutation forests. Hunger and growth in equal measure. " +
      "Pure operatives sustain longer; Bio operatives regenerate faster.",
    threatLevel: 8,
    minRankLevel: 5,
    rewardMultiplier: 1.50,
  },
};

export const BATTLEFIELD_ZONE_ORDER: BattlefieldZoneId[] = [
  "northern-front",
  "eastern-rim",
  "southern-basin",
];

/**
 * Seed events — these are data templates for timed war events that
 * can fire in each zone. The actual scheduling system is future work;
 * these define what CAN happen.
 */
export const BATTLEFIELD_EVENTS: BattlefieldEvent[] = [
  {
    id: "northern-push",
    name: "Bonehowl Push",
    description:
      "The Bio Empire's northern packs are surging. Extra bio samples " +
      "and condition recovery for Bio operatives in the Northern Front.",
    zoneId: "northern-front",
    durationMinutes: 30,
    eventRewardMultiplier: 1.5,
  },
  {
    id: "eastern-lockdown",
    name: "Mandate Lockdown",
    description:
      "The Mecha Empire has activated cycle-lock protocols on the " +
      "Eastern Rim. Slower mob respawns but double scrap/alloy yields.",
    zoneId: "eastern-rim",
    durationMinutes: 20,
    eventRewardMultiplier: 2.0,
  },
  {
    id: "southern-harvest",
    name: "Sun-Mouth Harvest",
    description:
      "The Pure Empire's tribute season opens in the Southern Basin. " +
      "Rune dust and ember core yields spike for all factions.",
    zoneId: "southern-basin",
    durationMinutes: 25,
    eventRewardMultiplier: 1.75,
  },
  {
    id: "three-way-war",
    name: "Convergence War",
    description:
      "All three empires have deployed champions to a single zone. " +
      "Maximum danger, maximum rewards. The converged benefit most.",
    zoneId: "northern-front",
    durationMinutes: 15,
    eventRewardMultiplier: 3.0,
  },
];
