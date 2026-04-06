import type { FactionAlignment } from "@/features/game/gameTypes";

export const canonBazaar = {
  id: "bazaar",
  navLabel: "Black Market",
  routeLabel: "Black Market",
  headingLabel: "Black Market",
  districtPrefix: "Bazaar",
  tagline: "Neutral ground under Black Market law.",
  description:
    "The survivor citadel below the world: neutral ground for trade, recovery, and the bargains people make to stay alive one more night.",
  law:
    "Black Market law is simple: terms hold, neutral ground is respected, and panic buys no mercy.",
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
      "\"We are what survives.\" The Verdant Coil evolves through mutation, hunting, and DNA absorption — the body as weapon and crucible. Nations: Norway (Wrath), Greece (Envy), Lebanon (Lust). Embodiment: Body.",
    tagline: "Verdant Coil",
    themeKey: "bio",
  },
  mecha: {
    ...canonFactions.mecha,
    wingLabel: "Chrome Synod Wing",
    description:
      "\"Perfection is property — and we own it.\" The Chrome Synod forges evolution through cybernetic precision, mechanical divinity, and Ironheart-fueled aristocratic control. Nations: Egypt (Pride), China (Sloth). Embodiment: Mind.",
    tagline: "Chrome Synod",
    themeKey: "mecha",
  },
  pure: {
    ...canonFactions.pure,
    wingLabel: "Ember Vault Wing",
    description:
      "\"Fire remembers.\" The Ember Vault pursues evolution through rune-craft, memory, and the Seven Flames — the most human path, perfected in soul rather than form. Nations: Peru (Gluttony), India (Greed). Embodiment: Soul.",
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
