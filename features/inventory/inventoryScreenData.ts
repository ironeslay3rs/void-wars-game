export type StatCard = {
  label: string;
  value: string;
  hint: string;
};

export type InventorySection = {
  title: string;
  description: string;
  body?: string;
  items?: string[];
};

export type InventoryScreenData = {
  eyebrow: string;
  title: string;
  subtitle: string;
  cards: StatCard[];
  sections: InventorySection[];
};

export const inventoryScreenData: InventoryScreenData = {
  eyebrow: "Void Wars / Inventory Protocol",
  title: "Inventory Systems",
  subtitle:
    "Everything you are carrying counts toward cargo pressure — sell, craft, or discard before overload taxes your missions and the field.",

  cards: [
    {
      label: "Tabs",
      value: "03",
      hint: "Gear, materials, and consumables — scan by category.",
    },
    {
      label: "Cap",
      value: "100%",
      hint: "Overload slows missions and field movement — stay under the line.",
    },
    {
      label: "Status",
      value: "Live",
      hint: "Stores reflect your real haul; War Exchange is your relief valve.",
    },
  ],

  sections: [
    {
      title: "Inventory Categories",
      description:
        "Gear you wear, materials you bank, consumables you burn — each bucket feeds crafting and survival pressure differently.",
      items: ["Gear", "Materials", "Consumables"],
    },
    {
      title: "Carry pressure",
      description:
        "Cargo infusion is not cosmetic — near-cap warns you early; overload stacks penalties on timers and movement.",
      body: "Use category chips to find weight fast, then dump surplus at War Exchange or craft it into something useful.",
    },
  ],
};