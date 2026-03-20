export type CharacterFaction = "ember" | "bio" | "mecha" | "rune";

export type CharacterStats = {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
};

export type CharacterRecord = {
  id: string;
  name: string;
  faction: CharacterFaction;
  tier: number;
  image: string;
  role: string;
  description: string;
  stats?: CharacterStats;
};

export const charactersData: CharacterRecord[] = [
  {
    id: "ember-scholar",
    name: "Ember Scholar",
    faction: "ember",
    tier: 1,
    image: "/assets/characters/ember-scholar-alpha.png",
    role: "Rune Scholar",
    description:
      "A disciplined fire-channeler of the Ember path, focused on controlled rune study and battlefield support.",
    stats: {
      hp: 78,
      attack: 92,
      defense: 52,
      speed: 66,
    },
  },
  {
    id: "ember-knight",
    name: "Ember Knight",
    faction: "ember",
    tier: 2,
    image: "/assets/characters/ember-knight-alpha.png",
    role: "Frontline Knight",
    description:
      "A heavier ember-forged combatant built for pressure, presence, and direct engagement.",
    stats: {
      hp: 122,
      attack: 84,
      defense: 94,
      speed: 42,
    },
  },
  {
    id: "flesh-tracker",
    name: "Flesh Tracker",
    faction: "bio",
    tier: 1,
    image: "/assets/characters/flesh-tracker-alpha.png",
    role: "Hunter",
    description:
      "A Bio path predator adapted for pursuit, harvesting, and survival at close range.",
    stats: {
      hp: 88,
      attack: 86,
      defense: 58,
      speed: 91,
    },
  },
  {
    id: "iron-disciple",
    name: "Iron Disciple",
    faction: "mecha",
    tier: 1,
    image: "/assets/characters/iron-disciple-alpha.png",
    role: "Initiate",
    description:
      "An early Chrome-aligned operative with disciplined posture, engineered focus, and tactical endurance.",
    stats: {
      hp: 96,
      attack: 74,
      defense: 82,
      speed: 56,
    },
  },
  {
    id: "ashbound-novice",
    name: "Ashbound Novice",
    faction: "rune",
    tier: 1,
    image: "/assets/characters/ashbound-novice-alpha.png",
    role: "Novice",
    description:
      "A young rune-bound initiate carrying the first marks of ember memory and disciplined ascent.",
    stats: {
      hp: 72,
      attack: 70,
      defense: 61,
      speed: 63,
    },
  },
  {
    id: "ash-initiate",
    name: "Ash Initiate",
    faction: "rune",
    tier: 2,
    image: "/assets/characters/ash-initiate-alpha.png",
    role: "Initiate",
    description:
      "A more advanced rune walker whose form shows stronger control over ash, fire, and soul pressure.",
    stats: {
      hp: 90,
      attack: 88,
      defense: 76,
      speed: 72,
    },
  },
];

export const factionLabels: Record<CharacterFaction, string> = {
  ember: "Ember Vault",
  bio: "Verdant Coil",
  mecha: "Chrome Synod",
  rune: "Rune Tier",
};

export function getFactionAccentClasses(faction: CharacterFaction) {
  if (faction === "ember") {
    return {
      badge: "border-orange-500/40 bg-orange-500/10 text-orange-200",
      ring: "hover:border-orange-400/40",
    };
  }

  if (faction === "bio") {
    return {
      badge: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
      ring: "hover:border-emerald-400/40",
    };
  }

  if (faction === "mecha") {
    return {
      badge: "border-cyan-500/40 bg-cyan-500/10 text-cyan-200",
      ring: "hover:border-cyan-400/40",
    };
  }

  return {
    badge: "border-violet-500/40 bg-violet-500/10 text-violet-200",
    ring: "hover:border-violet-400/40",
  };
}
