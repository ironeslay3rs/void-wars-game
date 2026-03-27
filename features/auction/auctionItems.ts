import type { PlayerState } from "@/features/game/gameTypes";
import { getOwnedLoadoutItems } from "@/features/player/loadoutState";

export function getAuctionPostableItems(player: PlayerState) {
  return getOwnedLoadoutItems(
    player.factionAlignment,
    player.craftedInventory,
  ).filter(
    (item) =>
      item.itemType !== "consumable" &&
      (player.craftedInventory[item.id] ?? 0) > 0,
  );
}

