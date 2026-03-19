import { assets } from "@/lib/assets";

export const resourceData = [
  {
    id: "credits",
    label: "Credits",
    value: "12,450",
    icon: assets.resources.credits,
    accent: "gold",
  },
  {
    id: "void-crystals",
    label: "Void Crystals",
    value: "350",
    icon: assets.resources.voidCrystals,
    accent: "violet",
  },
  {
    id: "bio-essence",
    label: "Bio Essence",
    value: "1,180",
    icon: assets.resources.bioEssence,
    accent: "green",
  },
] as const;