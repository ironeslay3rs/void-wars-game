export type ItemRankTier = "T1" | "T2" | "T3" | "T4" | "T5";

export function itemRankToNumeric(tier: ItemRankTier): number {
  switch (tier) {
    case "T1":
      return 1;
    case "T2":
      return 2;
    case "T3":
      return 3;
    case "T4":
      return 4;
    case "T5":
      return 5;
  }
}

export function itemRankLabel(tier: ItemRankTier): string {
  return `Tier ${itemRankToNumeric(tier)}`;
}

