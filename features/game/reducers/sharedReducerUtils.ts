import type {
  GameState,
  ResourceKey,
  ResourcesState,
} from "@/features/game/gameTypes";

export type GameReducerResult = GameState | null;

export function updateSingleResource(
  resources: ResourcesState,
  key: ResourceKey,
  amount: number,
) {
  return {
    ...resources,
    [key]: Math.max(0, resources[key] + amount),
  };
}
