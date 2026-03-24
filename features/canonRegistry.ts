import type { FactionAlignment } from "@/features/game/gameTypes";

export const canonBazaar = {
  id: "bazaar",
  navLabel: "Bazaar",
  routeLabel: "Nexus Bazaar",
  headingLabel: "The Nexus Bazaar",
  districtPrefix: "Bazaar",
} as const;

export const canonFactionHqs = {
  id: "faction-hqs",
  label: "Faction HQs",
  eyebrow: `${canonBazaar.districtPrefix} / Faction HQs`,
  title: "Faction HQs",
} as const;

export const canonFactionOrder = ["bio", "mecha", "spirit"] as const;

export type CanonFactionId = FactionAlignment;
export type CanonPathFactionId = (typeof canonFactionOrder)[number];

type CanonFactionEntry = {
  id: CanonFactionId;
  label: string;
};

type CanonPathFactionEntry = CanonFactionEntry & {
  wingLabel: string;
  description: string;
  tagline: string;
  themeKey: CanonPathFactionId;
};

export const canonFactions: Record<CanonFactionId, CanonFactionEntry> = {
  unbound: {
    id: "unbound",
    label: "Unbound",
  },
  bio: {
    id: "bio",
    label: "Bio",
  },
  mecha: {
    id: "mecha",
    label: "Mecha",
  },
  spirit: {
    id: "spirit",
    label: "Spirit",
  },
};

export const canonPathFactions: Record<
  CanonPathFactionId,
  CanonPathFactionEntry
> = {
  bio: {
    ...canonFactions.bio,
    wingLabel: "Bio Wing",
    description: "Predator growth and adaptation",
    tagline: "Adaptive dominance",
    themeKey: "bio",
  },
  mecha: {
    ...canonFactions.mecha,
    wingLabel: "Mecha Wing",
    description: "Precision, armor, and frame control",
    tagline: "Engineered supremacy",
    themeKey: "mecha",
  },
  spirit: {
    ...canonFactions.spirit,
    wingLabel: "Spirit Wing",
    description: "Soul force and ritual resonance",
    tagline: "Ritual ascension",
    themeKey: "spirit",
  },
};

export function getFactionLabel(faction: CanonFactionId) {
  return canonFactions[faction].label;
}

export function getFactionWingLabel(faction: CanonPathFactionId) {
  return canonPathFactions[faction].wingLabel;
}

export function getFactionLabelList(
  factions: readonly CanonPathFactionId[] = canonFactionOrder,
) {
  return factions.map((faction) => getFactionLabel(faction)).join(" | ");
}

export const canonNavigationItems = {
  inventory: {
    id: "inventory",
    label: "Inventory",
    href: "/inventory",
  },
  status: {
    id: "status",
    label: "Status",
    href: "/status",
  },
  missions: {
    id: "missions",
    label: "Missions",
    href: "/missions",
  },
  factions: {
    id: "factions",
    label: "Factions",
    href: "/factions",
  },
  bazaar: {
    id: canonBazaar.id,
    label: canonBazaar.navLabel,
    href: "/bazaar",
  },
  arena: {
    id: "arena",
    label: "Arena",
    href: "/arena",
  },
  guild: {
    id: "guild",
    label: "Guild",
    href: "/guild",
  },
  settings: {
    id: "settings",
    label: "Settings",
    href: "/settings",
  },
} as const;
