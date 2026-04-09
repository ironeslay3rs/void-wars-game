import type { PathType } from "@/features/game/gameTypes";
import {
  voidZones,
  type VoidZone,
  type VoidZoneId,
  type VoidZoneLootTheme,
} from "@/features/void-maps/zoneData";

/** Wall-clock rotation for which void sector is “contested” (Phase 6 war front). */
export const CONTESTED_ZONE_ROTATION_MS = 7 * 24 * 60 * 60 * 1000;

export function lootThemeToContestedSchool(theme: VoidZoneLootTheme): PathType {
  if (theme === "bio_rot") return "bio";
  if (theme === "ash_mecha") return "mecha";
  return "pure";
}

export function getContestedVoidZoneForNow(nowMs: number): VoidZone {
  if (!Number.isFinite(nowMs) || nowMs <= 0) {
    return voidZones[0];
  }
  const epoch = Math.floor(nowMs / CONTESTED_ZONE_ROTATION_MS);
  return voidZones[epoch % voidZones.length] ?? voidZones[0];
}

export type ContestedZoneMeta = {
  zoneId: VoidZoneId;
  label: string;
  school: PathType;
  rotationEndsAt: number;
};

export function getContestedZoneMeta(nowMs: number): ContestedZoneMeta {
  const z = getContestedVoidZoneForNow(nowMs);
  const epochStart =
    Math.floor(nowMs / CONTESTED_ZONE_ROTATION_MS) * CONTESTED_ZONE_ROTATION_MS;
  return {
    zoneId: z.id,
    label: z.label,
    school: lootThemeToContestedSchool(z.lootTheme),
    rotationEndsAt: epochStart + CONTESTED_ZONE_ROTATION_MS,
  };
}
