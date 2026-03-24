import { assets } from "@/lib/assets";

export const factionData = [
  {
    id: "bio",
    name: "Verdant Coil",
    description: "Mutation, predation, and adaptive evolution",
    icon: assets.factions.bio,
    themeKey: "bio",
    tagline: "The hunt remakes the weak",
  },
  {
    id: "mecha",
    name: "Chrome Synod",
    description: "Perfection, command hierarchy, and machine discipline",
    icon: assets.factions.mecha,
    themeKey: "mecha",
    tagline: "Perfection is property",
  },
  {
    id: "spirit",
    name: "Ember Vault",
    description: "Soul-fire, memory, and rune-forged transcendence",
    icon: assets.factions.spirit,
    themeKey: "spirit",
    tagline: "Fire remembers humanity",
  },
] as const;