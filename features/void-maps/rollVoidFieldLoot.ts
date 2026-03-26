import type { ResourceKey } from "@/features/game/gameTypes";
import type { VoidZoneLootTheme } from "@/features/void-maps/zoneData";
import { voidFieldHashStringToInt } from "@/features/void-maps/voidFieldUtils";
import {
  getVoidFieldLootProfileIdFromMobId,
  type LootRarity,
  type VoidFieldLootEntry,
  voidFieldLootTablesByTheme,
} from "@/features/void-maps/voidFieldLootTables";

export type RolledLoot = {
  resource: ResourceKey;
  amount: number;
  rarity: LootRarity;
};

type SeededRng = {
  next01: () => number;
  nextInt: (minInclusive: number, maxInclusive: number) => number;
};

function createSeededRng(seed: string): SeededRng {
  let i = 0;
  return {
    next01() {
      const h = voidFieldHashStringToInt(`${seed}-${i++}`);
      return (h % 10_000) / 10_000;
    },
    nextInt(minInclusive: number, maxInclusive: number) {
      const min = Math.ceil(minInclusive);
      const max = Math.floor(maxInclusive);
      if (max <= min) return min;
      return min + Math.floor(this.next01() * (max - min + 1));
    },
  };
}

function pickWeighted(rng: SeededRng, entries: VoidFieldLootEntry[]): VoidFieldLootEntry {
  const total = entries.reduce((sum, e) => sum + Math.max(0, e.weight), 0);
  const safeTotal = total > 0 ? total : entries.length;
  let roll = rng.next01() * safeTotal;
  for (const e of entries) {
    const w = total > 0 ? Math.max(0, e.weight) : 1;
    roll -= w;
    if (roll <= 0) return e;
  }
  return entries[entries.length - 1];
}

function entriesByRarity(
  entries: VoidFieldLootEntry[],
  rarity: LootRarity,
) {
  return entries.filter((e) => e.rarity === rarity);
}

function rollOneEntry(
  rng: SeededRng,
  entries: VoidFieldLootEntry[],
  rarity: LootRarity,
) {
  const pool = entriesByRarity(entries, rarity);
  if (pool.length === 0) return null;
  const e = pickWeighted(rng, pool);
  const amount = rng.nextInt(e.min, e.max);
  if (amount <= 0) return null;
  return { resource: e.resource, amount, rarity: e.rarity } as RolledLoot;
}

function mergeLoot(lines: RolledLoot[]): RolledLoot[] {
  const map = new Map<string, RolledLoot>();
  for (const l of lines) {
    const key = `${l.resource}-${l.rarity}`;
    const cur = map.get(key);
    if (!cur) map.set(key, { ...l });
    else cur.amount += l.amount;
  }
  return [...map.values()];
}

export function rollVoidFieldLoot(params: {
  zoneLootTheme: VoidZoneLootTheme;
  mobId: string;
  isBoss: boolean;
  seed: string;
}): RolledLoot[] {
  const rng = createSeededRng(params.seed);
  const profileId = getVoidFieldLootProfileIdFromMobId(params.mobId);
  // profileId reserved for future per-mob table overrides; for alpha we key by theme.
  void profileId;

  const table = voidFieldLootTablesByTheme[params.zoneLootTheme];
  const normal = table.normal;
  const bossBonus = table.bossBonus ?? normal;

  if (!params.isBoss) {
    // Normal mobs sustain the loop:
    // - 1 common roll (70–80% of “what you see”)
    // - 25% chance at 1 uncommon
    // - 6% chance at 1 rare
    const out: RolledLoot[] = [];
    const common = rollOneEntry(rng, normal, "common");
    if (common) out.push(common);
    if (rng.next01() < 0.25) {
      const u = rollOneEntry(rng, normal, "uncommon");
      if (u) out.push(u);
    }
    if (rng.next01() < 0.06) {
      const r = rollOneEntry(rng, normal, "rare");
      if (r) out.push(r);
    }
    return mergeLoot(out);
  }

  // Bosses spike the loop:
  // - guaranteed common bundle
  // - guaranteed themed uncommon
  // - boosted rare chance
  // - extra roll from bonus pool
  const out: RolledLoot[] = [];

  const commonA = rollOneEntry(rng, normal, "common");
  const commonB = rollOneEntry(rng, normal, "common");
  if (commonA) out.push(commonA);
  if (commonB) out.push(commonB);

  const uncommon = rollOneEntry(rng, bossBonus, "uncommon");
  if (uncommon) out.push(uncommon);

  if (rng.next01() < 0.28) {
    const rare = rollOneEntry(rng, bossBonus, "rare");
    if (rare) out.push(rare);
  }

  // Extra bonus roll (can be uncommon or rare).
  if (rng.next01() < 0.55) {
    const u2 = rollOneEntry(rng, bossBonus, "uncommon");
    if (u2) out.push(u2);
  } else if (rng.next01() < 0.35) {
    const r2 = rollOneEntry(rng, bossBonus, "rare");
    if (r2) out.push(r2);
  }

  const named = table.bossNamedMaterials;
  if (named && named.length > 0 && rng.next01() < 0.38) {
    const n = pickWeighted(rng, named);
    const amt = rng.nextInt(n.min, n.max);
    if (amt > 0) {
      out.push({
        resource: n.resource,
        amount: amt,
        rarity: n.rarity,
      });
    }
  }

  return mergeLoot(out);
}

