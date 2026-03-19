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
    "Track equipment, materials, and carried assets across combat, crafting, and gathering loops.",

  cards: [
    {
      label: "Tabs",
      value: "03",
      hint: "Gear / Materials / Consumables",
    },
    {
      label: "Slots",
      value: "24",
      hint: "Planned starter storage grid",
    },
    {
      label: "Status",
      value: "Alpha",
      hint: "First-pass inventory shell",
    },
  ],

  sections: [
    {
      title: "Inventory Categories",
      description:
        "Core storage groups that organize player items and carried resources.",
      items: ["Gear", "Materials", "Consumables"],
    },
    {
      title: "Capacity Console",
      description:
        "Reserved for slot usage, weight logic, and storage expansion systems.",
      body: "Reserved for inventory limits, sorting controls, stack rules, and bag expansion progression.",
    },
  ],
};