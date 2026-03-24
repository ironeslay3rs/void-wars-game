export type ResourceKey =
  | "credits"
  | "ironOre"
  | "scrapAlloy"
  | "runeDust"
  | "emberCore"
  | "bioSamples"
  | "mossRations";

export type ResourceMeta = {
  id: ResourceKey;
  label: string;
  icon: string;
  iconAlt: string;
};

export const resourceData: ResourceMeta[] = [
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
  {
    id: "mossRations",
    label: "Moss Rations",
    icon: "/icons/resources/resource-credits.png",
    iconAlt: "Moss Rations",
  },
];
