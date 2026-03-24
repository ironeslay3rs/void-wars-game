import { canonFactionOrder, canonPathFactions } from "@/features/canonRegistry";
import { assets } from "@/lib/assets";

export const factionData = canonFactionOrder.map((factionId) => ({
  id: factionId,
  name: canonPathFactions[factionId].label,
  description: canonPathFactions[factionId].description,
  icon: assets.factions[factionId],
  themeKey: canonPathFactions[factionId].themeKey,
  tagline: canonPathFactions[factionId].tagline,
}));
