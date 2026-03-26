import type { VoidZoneId } from "@/features/void-maps/zoneData";

/**
 * Void Field enemy identity per zone (visual + thematic).
 * Mirrors zone fantasy: Howling Scar bio, Ash Relay mecha, Echo Ruins spirit (Pure-adjacent),
 * Rift Maw infernal pressure.
 */
export type EnemyFaction = "bio" | "mecha" | "spirit" | "infernal";

export function voidZoneEnemyFaction(zoneId: VoidZoneId): EnemyFaction {
  switch (zoneId) {
    case "howling-scar":
      return "bio";
    case "ash-relay":
      return "mecha";
    case "echo-ruins":
      return "spirit";
    case "rift-maw":
      return "infernal";
  }
}
