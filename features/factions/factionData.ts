import { canonPathFactions } from "@/features/canonRegistry";
import type { PathType } from "@/features/game/gameTypes";
import { assets } from "@/lib/assets";

export type StableFactionId = PathType;

export type FactionDisplayData = {
  name: string;
  description: string;
  tagline: string;
};

export const stableFactionOrder: StableFactionId[] = ["bio", "mecha", "pure"];

export const factionData = stableFactionOrder.map((factionId) => {
  const display: FactionDisplayData = {
    name: canonPathFactions[factionId].label,
    description: canonPathFactions[factionId].description,
    tagline: canonPathFactions[factionId].tagline,
  };

  return {
    id: factionId,
    ...display,
    icon: assets.factions[factionId],
    themeKey: factionId,
  };
});
