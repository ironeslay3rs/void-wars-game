import type { PlayerState } from "@/features/game/gameTypes";
import type { VoidZone } from "@/features/void-maps/zoneData";
import { lootThemeToRuneSchool } from "@/features/mastery/masteryGameplayEffects";
import {
  getExecutionalTier,
  maxRuneDepthAcrossSchools,
} from "@/features/mastery/runeMasteryLogic";

export function playerMeetsZoneRuneGate(
  player: PlayerState,
  zone: VoidZone,
): boolean {
  const minDepth = zone.minRuneDepth;
  if (minDepth === undefined) return true;
  return maxRuneDepthAcrossSchools(player.runeMastery) >= minDepth;
}

export function playerMeetsZoneExecutionalGate(
  player: PlayerState,
  zone: VoidZone,
): boolean {
  const need = zone.minExecutionalTier;
  if (need === undefined) return true;
  const school = lootThemeToRuneSchool(zone.lootTheme);
  return getExecutionalTier(player.runeMastery, school) >= need;
}

export function playerMeetsAllZoneMasteryGates(
  player: PlayerState,
  zone: VoidZone,
): boolean {
  return (
    playerMeetsZoneRuneGate(player, zone) &&
    playerMeetsZoneExecutionalGate(player, zone)
  );
}

export function getZoneMasteryGateFailureLines(
  player: PlayerState,
  zone: VoidZone,
): string[] {
  const lines: string[] = [];
  if (
    zone.minRuneDepth !== undefined &&
    !playerMeetsZoneRuneGate(player, zone)
  ) {
    lines.push(`Rune depth ${zone.minRuneDepth}+ (deepest school).`);
  }
  if (
    zone.minExecutionalTier !== undefined &&
    !playerMeetsZoneExecutionalGate(player, zone)
  ) {
    const school = lootThemeToRuneSchool(zone.lootTheme);
    lines.push(
      `Executional tier ${zone.minExecutionalTier}+ on ${school} path (matches zone theme).`,
    );
  }
  return lines;
}

/** @deprecated Use getZoneMasteryGateFailureLines */
export function getZoneRuneGateHint(zone: VoidZone): string | null {
  if (zone.minRuneDepth === undefined) return null;
  return `Requires rune depth ${zone.minRuneDepth}+ (deepest school).`;
}
