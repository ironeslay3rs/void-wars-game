import type { FactionAlignment } from "@/features/game/gameTypes";
import type { ItemRankTier } from "@/features/inventory/itemRanks";

export type InventoryLoadoutItem = {
  id: string;
  name: string;
  type: string;
  itemType: "weapon" | "armor" | "rune-core" | "consumable";
  rankTier: ItemRankTier;
  rarity: string;
  slot: string;
  description: string;
};

type UtilityItem = InventoryLoadoutItem & {
  quantity: number;
};

export function getFactionStarterLoadout(
  faction: FactionAlignment,
): InventoryLoadoutItem[] {
  if (faction === "bio") {
    return [
      {
        id: "bio-sporeneedle-launcher",
        name: "Sporeneedle Launcher",
        type: "Primary Weapon",
        itemType: "weapon",
        rankTier: "T2",
        rarity: "Rare",
        slot: "Weapon Bay 01",
        description:
          "A living launcher that seeds corrosive pods into clustered targets.",
      },
      {
        id: "bio-mirefang-sidearm",
        name: "Mirefang Sidearm",
        type: "Secondary Weapon",
        itemType: "weapon",
        rankTier: "T1",
        rarity: "Uncommon",
        slot: "Weapon Bay 02",
        description:
          "Bone-framed sidearm tuned for quick follow-up shots while moving.",
      },
      {
        id: "bio-carapace-weave",
        name: "Carapace Weave",
        type: "Armor Core",
        itemType: "armor",
        rankTier: "T2",
        rarity: "Rare",
        slot: "Chest Frame",
        description:
          "Reactive plating woven from reclaimed shell fibers and biotech resin.",
      },
    ];
  }

  if (faction === "mecha") {
    return [
      {
        id: "mecha-synod-railcarbine",
        name: "Synod Railcarbine",
        type: "Primary Weapon",
        itemType: "weapon",
        rankTier: "T2",
        rarity: "Rare",
        slot: "Weapon Bay 01",
        description:
          "Precision coil rifle built from salvage-grade convoy parts.",
      },
      {
        id: "mecha-arc-welder-pistol",
        name: "Arc Welder Pistol",
        type: "Secondary Weapon",
        itemType: "weapon",
        rankTier: "T1",
        rarity: "Uncommon",
        slot: "Weapon Bay 02",
        description:
          "Compact sidearm that overloads damaged armor seams at close range.",
      },
      {
        id: "mecha-servo-shell-harness",
        name: "Servo Shell Harness",
        type: "Armor Core",
        itemType: "armor",
        rankTier: "T2",
        rarity: "Rare",
        slot: "Chest Frame",
        description:
          "Stabilized harness that reinforces mobility with mech-assisted joints.",
      },
    ];
  }

  if (faction === "pure") {
    return [
      {
        id: "pure-emberglass-pike",
        name: "Emberglass Pike",
        type: "Primary Weapon",
        itemType: "weapon",
        rankTier: "T2",
        rarity: "Rare",
        slot: "Weapon Bay 01",
        description:
          "Attuned polearm that stores heat from each strike for ritual bursts.",
      },
      {
        id: "pure-whisper-coil",
        name: "Whisper Coil",
        type: "Secondary Weapon",
        itemType: "weapon",
        rankTier: "T1",
        rarity: "Uncommon",
        slot: "Weapon Bay 02",
        description:
          "A resonant focus that lashes nearby enemies with tuned energy arcs.",
      },
      {
        id: "pure-ashen-mantle",
        name: "Ashen Mantle",
        type: "Armor Core",
        itemType: "armor",
        rankTier: "T2",
        rarity: "Rare",
        slot: "Chest Frame",
        description:
          "Layered ceremonial armor lined with ember-thread insulation.",
      },
    ];
  }

  return [
    {
      id: "unbound-rustline-carbine",
      name: "Rustline Carbine",
      type: "Primary Weapon",
      itemType: "weapon",
      rankTier: "T1",
      rarity: "Uncommon",
      slot: "Weapon Bay 01",
      description:
        "Reliable scavenger rifle rebuilt from district wall defense leftovers.",
    },
    {
      id: "unbound-scrapburst-repeater",
      name: "Scrapburst Repeater",
      type: "Secondary Weapon",
      itemType: "weapon",
      rankTier: "T1",
      rarity: "Common",
      slot: "Weapon Bay 02",
      description:
        "Short-range backup repeater designed for alley ambushes and retreats.",
    },
    {
      id: "unbound-patchwork-shell",
      name: "Patchwork Shell",
      type: "Armor Core",
      itemType: "armor",
      rankTier: "T1",
      rarity: "Uncommon",
      slot: "Chest Frame",
      description:
        "Layered field armor stitched together from salvaged plates and leather.",
    },
  ];
}

export function getUtilityItems(): UtilityItem[] {
  return [
    {
      id: "utility-field-med-patch",
      name: "Field Med Patch",
      type: "Consumable",
      itemType: "consumable",
      rankTier: "T1",
      rarity: "Common",
      slot: "Quick Slot",
      quantity: 3,
      description:
        "Emergency recovery strips for stabilizing condition loss between missions.",
    },
    {
      id: "utility-signal-flare",
      name: "Signal Flare",
      type: "Utility",
      itemType: "consumable",
      rankTier: "T1",
      rarity: "Common",
      slot: "Quick Slot",
      quantity: 2,
      description:
        "Used to mark salvage drops, extraction points, or squad rally calls.",
    },
    {
      id: "utility-field-toolkit",
      name: "Field Toolkit",
      type: "Utility",
      itemType: "consumable",
      rankTier: "T1",
      rarity: "Uncommon",
      slot: "Support Kit",
      quantity: 1,
      description:
        "Compact repair kit for patching armor, seals, and weapon housings.",
    },
  ];
}
