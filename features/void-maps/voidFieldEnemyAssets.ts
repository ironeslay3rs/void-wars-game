import { assets } from "@/lib/assets";
import type { EnemyFaction } from "@/features/void-maps/zoneEnemyMapping";

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
