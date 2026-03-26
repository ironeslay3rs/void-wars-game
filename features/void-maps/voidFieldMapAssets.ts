import { assets } from "@/lib/assets";
import type { VoidZoneId } from "@/features/void-maps/zoneData";

/**
 * Biome identity for void-field presentation. Hooks for future: VFX, spawn bias, rewards.
 */
export type VoidFieldBiomeKey = "bio" | "mecha" | "spirit" | "infernal";

const ZONE_VOID_FIELD: Record<
  VoidZoneId,
  { biome: VoidFieldBiomeKey; plateSrc: string }
> = {
  "howling-scar": { biome: "bio", plateSrc: assets.voidField.howlingScar },
  "ash-relay": { biome: "mecha", plateSrc: assets.voidField.ashRelay },
  "echo-ruins": { biome: "spirit", plateSrc: assets.voidField.echoRuins },
  "rift-maw": { biome: "infernal", plateSrc: assets.voidField.riftMaw },
};

/** Full-screen field plate URL for the active zone. */
export function voidFieldMapSrcForZone(zoneId: VoidZoneId): string {
  return ZONE_VOID_FIELD[zoneId].plateSrc;
}

/** Biome key for the zone (visual / future systems; no gameplay yet). */
export function voidFieldBiomeForZone(zoneId: VoidZoneId): VoidFieldBiomeKey {
  return ZONE_VOID_FIELD[zoneId].biome;
}
