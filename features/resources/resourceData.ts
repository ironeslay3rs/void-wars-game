export type ResourceKey = "credits" | "voidCrystals" | "bioEssence";

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
    id: "voidCrystals",
    label: "Void Crystals",
    icon: "/icons/resources/resource-void-crystals.png",
    iconAlt: "Void Crystals",
  },
  {
    id: "bioEssence",
    label: "Bio Essence",
    icon: "/icons/resources/resource-bio-essence.png",
    iconAlt: "Bio Essence",
  },
];