import type { ResourceKey, ResourcesState } from "@/features/game/gameTypes";
import { formatResourceLabel } from "@/features/game/gameFeedback";

/** One line listing each resource still missing for a deal (M1 clarity). */
export function resourceCostShortfall(
  cost: Partial<Record<ResourceKey, number>>,
  resources: ResourcesState,
): string | null {
  const parts: string[] = [];
  for (const key of Object.keys(cost) as ResourceKey[]) {
    const need = cost[key];
    if (typeof need !== "number" || need <= 0) continue;
    const have = resources[key] ?? 0;
    if (have < need) {
      parts.push(
        `${formatResourceLabel(key)}: need ${need}, have ${have}`,
      );
    }
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}
