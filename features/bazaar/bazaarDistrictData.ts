import {
  canonFactionHqs,
  getFactionLabelList,
} from "@/features/canonRegistry";

export type BazaarDistrictId =
  | "biotech-labs"
  | "spirit-enclave"
  | "crafting-district"
  | "arena"
  | "mecha-foundry"
  | "mercenary-guild"
  | "faction-hqs"
  | "teleport-gate";

export type BazaarDistrictThemeKey =
  | "bio"
  | "spirit"
  | "forge"
  | "arena"
  | "mecha"
  | "guild"
  | "faction"
  | "travel";

export type BazaarDistrict = {
  id: BazaarDistrictId;
  title: string;
  subtitle: string;
  description: string;
  route: string;
  themeKey: BazaarDistrictThemeKey;
  positionClass: string;
  widthClass: string;
};

export const bazaarDistrictData: BazaarDistrict[] = [
  {
    id: "biotech-labs",
    title: "Biotech Labs",
    subtitle: "Ritual Sanctum",
    description:
      "Bio mutation research, flesh adaptation, and organic evolution systems.",
    route: "/bazaar/biotech-labs",
    themeKey: "bio",
    positionClass: "left-[4%] top-[14%]",
    widthClass: "w-[260px]",
  },
  {
    id: "spirit-enclave",
    title: "Spirit Enclave",
    subtitle: "Ritual Sanctum",
    description:
      "Soul rites, resonance chambers, and spirit-oriented progression paths.",
    route: "/bazaar/spirit-enclave",
    themeKey: "spirit",
    positionClass: "left-[8%] top-[40%]",
    widthClass: "w-[280px]",
  },
  {
    id: "crafting-district",
    title: "Crafting District",
    subtitle: "Smiths & Artisans",
    description:
      "Forge gear, refine materials, socket runes, and create high-value items.",
    route: "/bazaar/crafting-district",
    themeKey: "forge",
    positionClass: "left-[5%] top-[66%]",
    widthClass: "w-[300px]",
  },
  {
    id: "arena",
    title: "Arena",
    subtitle: "PvP Battlegrounds",
    description:
      "Competitive combat, ranked seasons, and prestige-driven duels.",
    route: "/bazaar/arena",
    themeKey: "arena",
    positionClass: "right-[6%] top-[12%]",
    widthClass: "w-[250px]",
  },
  {
    id: "mecha-foundry",
    title: "Mecha Foundry",
    subtitle: "Weapon Workshop",
    description:
      "Frame upgrades, weapon systems, precision tuning, and mech builds.",
    route: "/bazaar/mecha-foundry",
    themeKey: "mecha",
    positionClass: "right-[5%] top-[44%]",
    widthClass: "w-[290px]",
  },
  {
    id: "mercenary-guild",
    title: "Mercenary Guild",
    subtitle: "AFK Hunting Ground",
    description:
      "Queue repeatable timed hunt contracts, gather steady materials, and build city-wide influence.",
    route: "/bazaar/mercenary-guild",
    themeKey: "guild",
    positionClass: "right-[5%] top-[70%]",
    widthClass: "w-[320px]",
  },
  {
    id: canonFactionHqs.id,
    title: canonFactionHqs.title,
    subtitle: getFactionLabelList(),
    description:
      "Enter your aligned power center and deepen faction identity.",
    route: "/bazaar/faction-hqs",
    themeKey: "faction",
    positionClass: "left-[16%] bottom-[6%]",
    widthClass: "w-[320px]",
  },
  {
    id: "teleport-gate",
    title: "Teleport Gate",
    subtitle: "Travel & Expeditions",
    description:
      "Launch into danger zones, world maps, and expedition routes.",
    route: "/bazaar/teleport-gate",
    themeKey: "travel",
    positionClass: "right-[14%] bottom-[6%]",
    widthClass: "w-[300px]",
  },
];
