import {
  canonFactionHqs,
  getFactionLabelList,
} from "@/features/canonRegistry";
import { VOID_EXPEDITION_PATH } from "@/features/void-maps/voidRoutes";

export type BazaarDistrictId =
  | "void-market-desk"
  | "biotech-labs"
  | "pure-enclave"
  | "crafting-district"
  | "arena"
  | "mecha-foundry"
  | "mercenary-guild"
  | "void-expedition"
  | "faction-hqs"
  | "teleport-gate";

export type BazaarDistrictThemeKey =
  | "bio"
  | "pure"
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
    id: "void-market-desk",
    title: "Void Market",
    subtitle: "Legal commodity desk",
    description:
      "Taxed buys and listing-fee sells on scrap, ember, dust, and bio samples — complements the central War Exchange.",
    route: "/bazaar/void-market",
    themeKey: "forge",
    positionClass: "left-[22%] top-[52%] md:left-[24%] md:top-[50%]",
    widthClass: "w-[270px]",
  },
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
    id: "pure-enclave",
    title: "Ember Vault",
    subtitle: "Ritual Sanctum",
    description:
      "Pure-path soul rites, resonance chambers, and Ember Vault progression.",
    route: "/bazaar/pure-enclave",
    themeKey: "pure",
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
    title: "Hunting Ground",
    subtitle: "Contract board & AFK deploy",
    description:
      "Queue repeatable timed hunt contracts, gather steady materials, and build city-wide influence.",
    route: "/bazaar/mercenary-guild",
    themeKey: "guild",
    positionClass: "right-[5%] top-[70%]",
    widthClass: "w-[320px]",
  },
  {
    id: "void-expedition",
    title: "Void Expedition",
    subtitle: "Realm path · live field",
    description:
      "Pick threat band and zone order, then deploy into the shared void field with the same hunt queue as the board.",
    route: VOID_EXPEDITION_PATH,
    themeKey: "travel",
    positionClass: "right-[4%] top-[84%] md:right-[6%] md:top-[83%]",
    widthClass: "w-[300px]",
  },
  {
    id: canonFactionHqs.id,
    title: canonFactionHqs.title,
    subtitle: getFactionLabelList(),
    description:
      "Enter your aligned power center and deepen doctrine affiliation across Verdant Coil, Chrome Synod, and Ember Vault.",
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
      "Jump to Void Expedition, the Hunting Ground board, hunt results, or Home without crossing the full bazaar map.",
    route: "/bazaar/teleport-gate",
    themeKey: "travel",
    positionClass: "right-[14%] bottom-[6%]",
    widthClass: "w-[300px]",
  },
];
