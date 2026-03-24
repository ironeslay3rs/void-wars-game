import type { FactionAlignment } from "@/features/game/gameTypes";

export const canonBazaar = {
  id: "bazaar",
  navLabel: "Black Market",
  routeLabel: "Black Market",
  headingLabel: "The Black Market",
  districtPrefix: "Bazaar",
} as const;

export const canonFactionHqs = {
  id: "faction-hqs",
  label: "Affiliation Concourse",
  eyebrow: `${canonBazaar.districtPrefix} / Affiliation Concourse`,
  title: "Affiliation Concourse",
} as const;

export const canonFactionOrder = ["bio", "mecha", "pure"] as const;

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
  pure: {
    id: "pure",
    label: "Pure",
  },
};

export const canonPathFactions: Record<
  CanonPathFactionId,
  CanonPathFactionEntry
> = {
  bio: {
    ...canonFactions.bio,
    wingLabel: "Verdant Coil Wing",
    description:
      "Verdant Coil body doctrine of adaptation, mutation, and survival hunts.",
    tagline: "Verdant Coil",
    themeKey: "bio",
  },
  mecha: {
    ...canonFactions.mecha,
    wingLabel: "Chrome Synod Wing",
    description:
      "Chrome Synod mind doctrine of precision, hierarchy, and machine perfection.",
    tagline: "Chrome Synod",
    themeKey: "mecha",
  },
  pure: {
    ...canonFactions.pure,
    wingLabel: "Ember Vault Wing",
    description:
      "Ember Vault soul doctrine of fire, memory, saintcraft, and rune discipline.",
    tagline: "Ember Vault",
    themeKey: "pure",
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
    label: "Affiliations",
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
