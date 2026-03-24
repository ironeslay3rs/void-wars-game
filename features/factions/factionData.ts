import { assets } from "@/lib/assets";
import {
  canonPathFactions,
  type StableFactionId,
} from "@/features/factions/canonRegistry";

export type FactionDisplayData = {
  id: StableFactionId;
  name: string;
  description: string;
  icon: string;
  themeKey: StableFactionId;
  tagline: string;
};

export const stableFactionOrder: StableFactionId[] = ["bio", "mecha", "spirit"];

export const factionData: FactionDisplayData[] = stableFactionOrder.map(
  (factionId) => ({
    id: factionId,
    name: canonPathFactions[factionId].name,
    description: canonPathFactions[factionId].description,
    icon: assets.factions[factionId],
    themeKey: factionId,
    tagline: canonPathFactions[factionId].tagline,
  }),
);
