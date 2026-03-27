import type {
  FactionAlignment,
  LoadoutSlotId,
  LoadoutSlotsState,
} from "@/features/game/gameTypes";
import {
  getFactionStarterLoadout,
  type InventoryLoadoutItem,
} from "@/features/inventory/inventoryLoadoutData";
import { craftRecipes } from "@/features/crafting/recipeData";

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
  if (t.includes("rune")) return "runeSet";
  return "core";
}

function mapCraftedKindToSlot(kind: string): LoadoutSlotId | null {
  if (kind === "weapon") return "weapon";
  if (kind === "armor") return "armor";
  if (kind === "rune-core") return "runeSet";
  return null;
}

type CraftedItemShape = {
  id: string;
  name: string;
  kind: string;
  rarity: string;
  description?: string;
};

export function getOwnedLoadoutItems(
  faction: FactionAlignment,
  craftedInventory?: Record<string, number>,
): LoadoutItem[] {
  const factionItems = getFactionStarterLoadout(faction).map((item) => ({
    ...item,
    slotType: mapItemSlotType(item),
  }));

  if (!craftedInventory) return factionItems;

  const craftedItems: LoadoutItem[] = [];
  for (const [itemId, qty] of Object.entries(craftedInventory)) {
    if (qty <= 0) continue;
    const recipe = craftRecipes.find(
      (r) =>
        r.output.kind === "item" &&
        (r.output as { kind: "item"; item: CraftedItemShape }).item?.id === itemId,
    );
    if (!recipe || recipe.output.kind !== "item") continue;
    const craftedItem = (recipe.output as { kind: "item"; item: CraftedItemShape }).item;
    const slotType = mapCraftedKindToSlot(craftedItem.kind);
    if (!slotType) continue;
    craftedItems.push({
      id: craftedItem.id,
      name: craftedItem.name,
      type: craftedItem.kind,
      rarity: craftedItem.rarity,
      slot: slotType,
      description: craftedItem.description ?? `Crafted item (${qty} owned)`,
      slotType,
    });
  }

  return [...factionItems, ...craftedItems];
}

export function autoEquipStarterKit(
  slots: LoadoutSlotsState,
  faction: FactionAlignment,
): LoadoutSlotsState {
  const owned = getOwnedLoadoutItems(faction);
  const next: LoadoutSlotsState = { ...slots };
  const usedIds = new Set(
    Object.values(next).filter((v): v is string => typeof v === "string"),
  );
  for (const item of owned) {
    const slot = item.slotType;
    if (!next[slot] && !usedIds.has(item.id)) {
      next[slot] = item.id;
      usedIds.add(item.id);
    }
  }
  return next;
}

export function getEquippedItem(
  slots: LoadoutSlotsState,
  slot: LoadoutSlotId,
  faction: FactionAlignment,
  craftedInventory?: Record<string, number>,
): LoadoutItem | null {
  const id = slots[slot];
  if (!id) return null;
  return (
    getOwnedLoadoutItems(faction, craftedInventory).find(
      (item) => item.id === id,
    ) ?? null
  );
}

export function getAvailableItemsForSlot(
  slots: LoadoutSlotsState,
  slot: LoadoutSlotId,
  faction: FactionAlignment,
  craftedInventory?: Record<string, number>,
): LoadoutItem[] {
  const all = getOwnedLoadoutItems(faction, craftedInventory).filter(
    (item) => item.slotType === slot,
  );
  const equippedIds = new Set(
    Object.values(slots).filter(
      (value): value is string => typeof value === "string",
    ),
  );
  return all.filter(
    (item) => !equippedIds.has(item.id) || slots[slot] === item.id,
  );
}

export function equipItem(
  slots: LoadoutSlotsState,
  slot: LoadoutSlotId,
  itemId: string,
  faction: FactionAlignment,
  craftedInventory?: Record<string, number>,
): LoadoutSlotsState {
  const canEquip = getOwnedLoadoutItems(faction, craftedInventory).some(
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
