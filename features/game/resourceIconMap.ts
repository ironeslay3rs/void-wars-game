import type { ResourceKey } from "@/features/game/gameTypes";
import { assets } from "@/lib/assets";

export const resourceIconMap: Record<ResourceKey, string> = {
  credits: assets.icons.generated.pureMaterials.sunSeal,
  // Black Marks — daily city trade currency. Reuses the Sun Seal icon
  // placeholder until a dedicated Black Marks asset is sliced.
  blackMarks: assets.icons.generated.pureMaterials.sunSeal,
  ironOre: assets.icons.generated.mechaMaterials.alloyShard,
  scrapAlloy: assets.icons.generated.mechaMaterials.alloySpike,
  runeDust: assets.icons.generated.pureMaterials.amethystShard,
  emberCore: assets.icons.generated.pureMaterials.solarOrb,
  bioSamples: assets.icons.generated.bioMaterials.sporeVial,
  mossRations: assets.icons.generated.bioConsumables.leafVial,
  coilboundLattice: assets.icons.generated.bioMaterials.carapaceRelic,
  ashSynodRelic: assets.icons.generated.mechaMaterials.arcReactor,
  vaultLatticeShard: assets.icons.generated.pureMaterials.prismFrame,
  ironHeart: assets.icons.generated.mechaMaterials.alloySpike,
};

export function getResourceIcon(
  resourceKey: string,
  fallback = assets.icons.generated.statusEffects.mutated,
) {
  return resourceIconMap[resourceKey as ResourceKey] ?? fallback;
}
