"use client";

import Link from "next/link";
import { useGame } from "@/features/game/gameContext";
import {
  getEquippedItem,
  LOADOUT_SLOT_LABELS,
  LOADOUT_SLOT_ORDER,
} from "@/features/player/loadoutState";

export default function StatusLoadoutSnapshotCard() {
  const { state } = useGame();
  const { player } = state;

  const hasAnyEquipped = LOADOUT_SLOT_ORDER.some(
    (slot) => player.loadoutSlots[slot] !== null,
  );

  return (
    <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(16,20,34,0.82),rgba(7,9,16,0.94))] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.3)]">
      <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
        Field loadout
      </div>
      <h3 className="mt-2 text-lg font-black uppercase tracking-[0.08em] text-white">
        Deploy kit
      </h3>
      <p className="mt-1 text-sm leading-relaxed text-white/58">
        What you are wearing into the void shell. Tune strike, posture, and
        mitigation on the full loadout screen before you deploy.
      </p>

      {!hasAnyEquipped ? (
        <p className="mt-3 rounded-xl border border-amber-400/28 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-100/90">
          No kit locked — equip at least a{" "}
          <span className="font-semibold text-amber-50">weapon</span> before you
          lean on the field.
        </p>
      ) : null}

      <div className="mt-4 grid gap-2">
        {LOADOUT_SLOT_ORDER.map((slot) => {
          const item = getEquippedItem(
            player.loadoutSlots,
            slot,
            player.factionAlignment,
            player.craftedInventory,
          );
          return (
            <div
              key={slot}
              className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3"
            >
              <span className="shrink-0 text-xs uppercase tracking-[0.12em] text-white/50">
                {LOADOUT_SLOT_LABELS[slot]}
              </span>
              <span
                className={[
                  "min-w-0 truncate text-right text-sm",
                  item ? "font-semibold text-white" : "text-white/38",
                ].join(" ")}
              >
                {item ? item.name : "— Open —"}
              </span>
            </div>
          );
        })}
      </div>

      <Link
        href="/loadout"
        className="mt-4 flex min-h-[44px] w-full items-center justify-center rounded-xl border border-cyan-400/35 bg-cyan-500/10 text-xs font-bold uppercase tracking-[0.14em] text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-500/18"
      >
        Open loadout
      </Link>
    </div>
  );
}
