import type { ResourceKey } from "@/features/game/gameTypes";

/** Cargo resources safe to offer quick discard for overload relief (matches inventory OverloadWarning). */
export const QUICK_DISCARD_CARGO_KEYS: Array<{ key: ResourceKey; label: string }> = [
  { key: "ironOre", label: "Iron Ore" },
  { key: "scrapAlloy", label: "Scrap Alloy" },
  { key: "runeDust", label: "Rune Dust" },
  { key: "bioSamples", label: "Bio Samples" },
];
