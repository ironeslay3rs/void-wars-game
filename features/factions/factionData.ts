import { assets } from "@/lib/assets";

export const factionData = [
  {
    id: "bio",
    name: "Bio",
    description: "Verdant Coil body doctrine of adaptation, mutation, and survival hunts.",
    icon: assets.factions.bio,
    themeKey: "bio",
    tagline: "Verdant Coil",
  },
  {
    id: "mecha",
    name: "Mecha",
    description: "Chrome Synod mind doctrine of precision, hierarchy, and machine perfection.",
    icon: assets.factions.mecha,
    themeKey: "mecha",
    tagline: "Chrome Synod",
  },
  {
    id: "pure",
    name: "Pure",
    description: "Ember Vault soul doctrine of fire, memory, saintcraft, and rune discipline.",
    icon: assets.factions.pure,
    themeKey: "pure",
    tagline: "Ember Vault",
  },
] as const;
