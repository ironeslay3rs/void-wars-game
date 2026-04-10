"use client";

import Link from "next/link";
import { useGame } from "@/features/game/gameContext";
import {
  canSpendMana,
  getManaDisplay,
  getManaPercent,
} from "@/features/mana/manaSelectors";
import { VENT_MANA_COST } from "@/features/mana/manaTypes";

/**
 * Compact home-deck mana surface.
 *
 * Foundation slice: a passive readout of the player's positive-pressure pool
 * (school-flavored name) plus a one-line hint pointing to the Status screen
 * vent button when both the cost is affordable and there is void instability
 * to bleed off. No actions wired here — the spend lives on Status — so the
 * home rail stays an at-a-glance summary, not another action surface.
 */
export default function ManaChip() {
  const { state } = useGame();
  const { player } = state;
  const display = getManaDisplay(player.factionAlignment);
  const percent = getManaPercent(player);
  const ventReady =
    canSpendMana(player, VENT_MANA_COST) && player.voidInstability > 0;

  return (
    <div className="rounded-2xl border border-sky-400/22 bg-[linear-gradient(165deg,rgba(8,26,42,0.92),rgba(6,12,22,0.96))] px-4 py-3 text-white">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-sky-200/70">
            {display.longName}
          </div>
          <div className="mt-1 text-lg font-black tabular-nums text-white">
            {player.mana}
            <span className="ml-1 text-sm font-semibold text-white/45">
              / {player.manaMax}
            </span>
          </div>
        </div>
        <div className="rounded-full border border-sky-300/25 bg-sky-500/12 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-sky-100">
          {percent}%
        </div>
      </div>

      <div className="mt-3 h-2 rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,rgba(56,189,248,0.7),rgba(14,165,233,1))]"
          style={{ width: `${percent}%` }}
        />
      </div>

      {ventReady ? (
        <p className="mt-2 text-[11px] leading-snug text-sky-100/80">
          Vent ready —{" "}
          <Link
            href="/status"
            className="font-semibold text-sky-50 underline decoration-sky-300/45 underline-offset-2 hover:text-white"
          >
            Status
          </Link>{" "}
          can spend {VENT_MANA_COST} {display.shortName} to bleed void
          instability.
        </p>
      ) : (
        <p className="mt-2 text-[11px] leading-snug text-white/45">
          {player.mana >= VENT_MANA_COST
            ? "No void instability to bleed — your run is clean."
            : `Earn ${VENT_MANA_COST - player.mana} more from missions or the Feast Hall before you can vent.`}
        </p>
      )}
    </div>
  );
}
