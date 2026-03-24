import type { FactionAlignment } from "@/features/game/gameTypes";

type InventoryLoadoutItem = {
  name: string;
  type: string;
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
        name: "Sporeneedle Launcher",
        type: "Primary Weapon",
        rarity: "Rare",
        slot: "Weapon Bay 01",
        description:
          "A living launcher that seeds corrosive pods into clustered targets.",
      },
      {
        name: "Mirefang Sidearm",
        type: "Secondary Weapon",
        rarity: "Uncommon",
        slot: "Weapon Bay 02",
        description:
          "Bone-framed sidearm tuned for quick follow-up shots while moving.",
      },
      {
        name: "Carapace Weave",
        type: "Armor Core",
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
        name: "Synod Railcarbine",
        type: "Primary Weapon",
        rarity: "Rare",
        slot: "Weapon Bay 01",
        description:
          "Precision coil rifle built from salvage-grade convoy parts.",
      },
      {
        name: "Arc Welder Pistol",
        type: "Secondary Weapon",
        rarity: "Uncommon",
        slot: "Weapon Bay 02",
        description:
          "Compact sidearm that overloads damaged armor seams at close range.",
      },
      {
        name: "Servo Shell Harness",
        type: "Armor Core",
        rarity: "Rare",
        slot: "Chest Frame",
        description:
          "Stabilized harness that reinforces mobility with mech-assisted joints.",
      },
    ];
  }

  if (faction === "spirit") {
    return [
      {
        name: "Emberglass Pike",
        type: "Primary Weapon",
        rarity: "Rare",
        slot: "Weapon Bay 01",
        description:
          "Attuned polearm that stores heat from each strike for ritual bursts.",
      },
      {
        name: "Whisper Coil",
        type: "Secondary Weapon",
        rarity: "Uncommon",
        slot: "Weapon Bay 02",
        description:
          "A resonant focus that lashes nearby enemies with tuned energy arcs.",
      },
      {
        name: "Ashen Mantle",
        type: "Armor Core",
        rarity: "Rare",
        slot: "Chest Frame",
        description:
          "Layered ceremonial armor lined with ember-thread insulation.",
      },
    ];
  }

  return [
    {
      name: "Rustline Carbine",
      type: "Primary Weapon",
      rarity: "Uncommon",
      slot: "Weapon Bay 01",
      description:
        "Reliable scavenger rifle rebuilt from district wall defense leftovers.",
    },
    {
      name: "Scrapburst Repeater",
      type: "Secondary Weapon",
      rarity: "Common",
      slot: "Weapon Bay 02",
      description:
        "Short-range backup repeater designed for alley ambushes and retreats.",
    },
    {
      name: "Patchwork Shell",
      type: "Armor Core",
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
      name: "Field Med Patch",
      type: "Consumable",
      rarity: "Common",
      slot: "Quick Slot",
      quantity: 3,
      description:
        "Emergency recovery strips for stabilizing condition loss between missions.",
    },
    {
      name: "Signal Flare",
      type: "Utility",
      rarity: "Common",
      slot: "Quick Slot",
      quantity: 2,
      description:
        "Used to mark salvage drops, extraction points, or squad rally calls.",
    },
    {
      name: "Field Toolkit",
      type: "Utility",
      rarity: "Uncommon",
      slot: "Support Kit",
      quantity: 1,
      description:
        "Compact repair kit for patching armor, seals, and weapon housings.",
    },
  ];
}
