import { assets } from "@/lib/assets";

export type StableFactionId = "bio" | "mecha" | "spirit";

export type FactionDisplayData = {
  id: StableFactionId;
  name: string;
  description: string;
  icon: string;
  themeKey: StableFactionId;
  tagline: string;
};

export const factionData: FactionDisplayData[] = [
  {
    id: "bio",
    name: "Verdant Coil",
    description: "Bio doctrine of adaptive growth, grafting, and predatory evolution",
    icon: assets.factions.bio,
    themeKey: "bio",
    tagline: "Bio supremacy through adaptation",
  },
  {
    id: "mecha",
    name: "Chrome Synod",
    description:
      "Mecha doctrine of frame precision, hardened armor, and engineered control",
    icon: assets.factions.mecha,
    themeKey: "mecha",
    tagline: "Mecha order through machinery",
  },
  {
    id: "spirit",
    name: "Ember Vault",
    description:
      "Pure doctrine of ember rites, soul resonance, and ritual refinement",
    icon: assets.factions.spirit,
    themeKey: "spirit",
    tagline: "Pure ascent through ember rites",
  },
];
