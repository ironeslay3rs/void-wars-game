export type ResourceKey =
  | "fieldRations"
  | "credits"
  | "ironOre"
  | "scrapAlloy"
  | "runeDust"
  | "emberCore"
  | "bioSamples";

export type ResourceMeta = {
  id: ResourceKey;
  label: string;
  icon: string;
  iconAlt: string;
};

export const resourceData: ResourceMeta[] = [
  {
    id: "fieldRations",
    label: "Field Rations",
    icon: "/icons/resources/resource-credits.png",
    iconAlt: "Field Rations",
  },
  {
    id: "credits",
    label: "Credits",
    icon: "/icons/resources/resource-credits.png",
    iconAlt: "Credits",
  },
  {
    id: "ironOre",
    label: "Iron Ore",
    icon: "/icons/resources/resource-credits.png",
    iconAlt: "Iron Ore",
  },
  {
    id: "scrapAlloy",
    label: "Scrap Alloy",
    icon: "/icons/resources/resource-credits.png",
    iconAlt: "Scrap Alloy",
  },
  {
    id: "runeDust",
    label: "Rune Dust",
    icon: "/icons/resources/resource-credits.png",
    iconAlt: "Rune Dust",
  },
  {
    id: "emberCore",
    label: "Ember Core",
    icon: "/icons/resources/resource-credits.png",
    iconAlt: "Ember Core",
  },
  {
    id: "bioSamples",
    label: "Bio Samples",
    icon: "/icons/resources/resource-credits.png",
    iconAlt: "Bio Samples",
  },
];
