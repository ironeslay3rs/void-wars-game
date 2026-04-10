import { assets } from "@/lib/assets";
import type { EnemyFaction } from "@/features/void-maps/zoneEnemyMapping";
import type { MobEntity } from "@/features/void-maps/realtime/voidRealtimeProtocol";
import { creatures } from "@/features/combat/creatureData";

export function voidFieldEnemySpriteSrc(faction: EnemyFaction): string {
  switch (faction) {
    case "bio":
      return assets.enemies.bio.wolf;
    case "mecha":
      return assets.enemies.mecha.scorpion;
    case "spirit":
      return assets.enemies.spirit.wraith;
    case "infernal":
      return assets.enemies.infernal.titan;
  }
}

/** Creature ID → sprite cache. */
const creatureSpriteMap = new Map<string, string>();
for (const c of creatures) {
  if (c.sprite) creatureSpriteMap.set(c.id, c.sprite);
}

/**
 * Resolve a mob's sprite — creature-specific if the mob carries a
 * creatureId that maps to a known sprite, otherwise the generic
 * faction fallback. This lets each mob on the field look different.
 */
export function getMobSpriteSrc(
  mob: MobEntity,
  factionFallback: EnemyFaction,
): string {
  if (mob.creatureId) {
    const sprite = creatureSpriteMap.get(mob.creatureId);
    if (sprite) return sprite;
  }
  return voidFieldEnemySpriteSrc(factionFallback);
}
