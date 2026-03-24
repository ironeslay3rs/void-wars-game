import { assets } from "@/lib/assets";

export const factionData = [
  {
    id: "bio",
    name: "Bio",
    description: "Predator growth and adaptation",
    icon: assets.factions.bio,
    themeKey: "bio",
    tagline: "Adaptive dominance",
  },
  {
    id: "mecha",
    name: "Mecha",
    description: "Precision, armor, and frame control",
    icon: assets.factions.mecha,
    themeKey: "mecha",
    tagline: "Engineered supremacy",
  },
  {
    id: "spirit",
    name: "Pure",
    description: "Attunement and ritual resonance",
    icon: assets.factions.spirit,
    themeKey: "spirit",
    tagline: "Pure ascension",
  },
] as const;