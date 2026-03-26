"use client";

import type { LoadoutSlotId } from "@/features/game/gameTypes";
import {
  LOADOUT_SLOT_LABELS,
  type LoadoutItem,
} from "@/features/player/loadoutState";

function getRarityClass(rarity: string) {
  if (rarity === "Rare") {
    return "border-cyan-400/30 bg-cyan-400/10 text-cyan-100";
  }
  if (rarity === "Uncommon") {
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-100";
  }
  return "border-white/10 bg-white/5 text-white/80";
}

export default function ItemPicker({
  slot,
  items,
  onEquip,
  onClose,
}: {
  slot: LoadoutSlotId;
  items: LoadoutItem[];
  onEquip: (itemId: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/70 p-4 md:items-center">
      <div className="w-full max-w-2xl rounded-2xl border border-white/12 bg-[linear-gradient(180deg,rgba(17,20,34,0.96),rgba(8,10,16,0.98))] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.5)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/45">
              Item Picker
            </div>
            <div className="mt-1 text-lg font-black uppercase tracking-[0.06em] text-white">
              Equip {LOADOUT_SLOT_LABELS[slot]}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-white/75 hover:border-white/30 hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <div className="mt-4 max-h-[52vh] space-y-2 overflow-y-auto pr-1">
          {items.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-4 text-sm text-white/60">
              No compatible inventory item available for this slot.
            </div>
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onEquip(item.id)}
                className="w-full rounded-xl border border-white/12 bg-black/25 px-4 py-3 text-left transition hover:border-cyan-300/45 hover:bg-cyan-500/10"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-black uppercase tracking-[0.05em] text-white">
                      {item.name}
                    </div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-white/45">
                      {item.type}
                    </div>
                  </div>
                  <div
                    className={[
                      "rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em]",
                      getRarityClass(item.rarity),
                    ].join(" ")}
                  >
                    {item.rarity}
                  </div>
                </div>
                <div className="mt-2 text-xs leading-relaxed text-white/65">
                  {item.description}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
