import type {
  FactionAlignment,
  LoadoutSlotId,
  LoadoutSlotsState,
} from "@/features/game/gameTypes";
import {
  getFactionStarterLoadout,
  type InventoryLoadoutItem,
} from "@/features/inventory/inventoryLoadoutData";

export type LoadoutItem = InventoryLoadoutItem & {
  slotType: LoadoutSlotId;
};

export const LOADOUT_SLOT_ORDER: LoadoutSlotId[] = [
  "weapon",
  "armor",
  "core",
  "runeSet",
  "professionBind",
];

export const LOADOUT_SLOT_LABELS: Record<LoadoutSlotId, string> = {
  weapon: "Weapon",
  armor: "Armor",
  core: "Core",
  runeSet: "Rune Set",
  professionBind: "Profession Bind",
};

export function createInitialLoadoutSlots(): LoadoutSlotsState {
  return {
    weapon: null,
    armor: null,
    core: null,
    runeSet: null,
    professionBind: null,
  };
}

function mapItemSlotType(item: InventoryLoadoutItem): LoadoutSlotId {
  const t = item.type.toLowerCase();
  if (t.includes("weapon")) return "weapon";
  if (t.includes("armor")) return "armor";
  return "core";
}

export function getOwnedLoadoutItems(faction: FactionAlignment): LoadoutItem[] {
  return getFactionStarterLoadout(faction).map((item) => ({
    ...item,
    slotType: mapItemSlotType(item),
  }));
}

export function getEquippedItem(
  slots: LoadoutSlotsState,
  slot: LoadoutSlotId,
  faction: FactionAlignment,
): LoadoutItem | null {
  const id = slots[slot];
  if (!id) return null;
  return getOwnedLoadoutItems(faction).find((item) => item.id === id) ?? null;
}

export function getAvailableItemsForSlot(
  slots: LoadoutSlotsState,
  slot: LoadoutSlotId,
  faction: FactionAlignment,
): LoadoutItem[] {
  const all = getOwnedLoadoutItems(faction).filter((item) => item.slotType === slot);
  const equippedIds = new Set(
    Object.values(slots).filter((value): value is string => typeof value === "string"),
  );
  return all.filter((item) => !equippedIds.has(item.id) || slots[slot] === item.id);
}

export function equipItem(
  slots: LoadoutSlotsState,
  slot: LoadoutSlotId,
  itemId: string,
  faction: FactionAlignment,
): LoadoutSlotsState {
  const canEquip = getOwnedLoadoutItems(faction).some(
    (item) => item.id === itemId && item.slotType === slot,
  );
  if (!canEquip) return slots;

  const next: LoadoutSlotsState = { ...slots };
  for (const key of LOADOUT_SLOT_ORDER) {
    if (next[key] === itemId) {
      next[key] = null;
    }
  }
  next[slot] = itemId;
  return next;
}

export function unequipItem(
  slots: LoadoutSlotsState,
  slot: LoadoutSlotId,
): LoadoutSlotsState {
  return {
    ...slots,
    [slot]: null,
  };
}

export function sanitizeLoadoutForFaction(
  slots: LoadoutSlotsState,
  faction: FactionAlignment,
): LoadoutSlotsState {
  const owned = new Set(getOwnedLoadoutItems(faction).map((item) => item.id));
  const next: LoadoutSlotsState = { ...slots };
  for (const key of LOADOUT_SLOT_ORDER) {
    if (next[key] && !owned.has(next[key])) {
      next[key] = null;
    }
  }
  return next;
}
