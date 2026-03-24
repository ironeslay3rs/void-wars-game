import { assets } from "@/lib/assets";

export const factionData = [
  {
    id: "bio",
    name: "Bio / Verdant Coil",
    description:
      "Body evolution, genetic hunts, and adaptive monstrosity shaped by the sin of Wrath.",
    icon: assets.factions.bio,
    themeKey: "verdant-coil",
    tagline: "Bonehowl of Fenrir • flesh as weapon",
  },
  {
    id: "mecha",
    name: "Mecha / Chrome Synod",
    description:
      "Mind, precision, Ironheart, and aristocratic control forged through Pride and Sloth.",
    icon: assets.factions.mecha,
    themeKey: "chrome-synod",
    tagline: "Divine Pharos • Clockwork Mandate",
  },
  {
    id: "spirit",
    name: "Pure / Ember Vault",
    description:
      "Soul-fire, memory, runes, and saintcraft pursuing the fusion needed to escape the Void.",
    icon: assets.factions.spirit,
    themeKey: "ember-vault",
    tagline: "Mouth of Inti • Thousand Hands",
  },
] as const;
