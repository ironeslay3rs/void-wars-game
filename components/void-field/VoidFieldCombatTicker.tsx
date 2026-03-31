"use client";

import { useMemo } from "react";

export default function VoidFieldCombatTicker({
  events,
  selfClientId,
  playerNameById,
  mobLabelById,
}: {
  events: Array<{
    mobEntityId: string;
    attackerClientId: string;
    damage: number;
    isCrit: boolean;
    ts: number;
  }>;
  selfClientId: string;
  playerNameById: Map<string, string>;
  mobLabelById: Map<string, string>;
}) {
  const rows = useMemo(() => events.slice(0, 3), [events]);
  if (rows.length === 0) return null;

  return (
    <div className="pointer-events-none absolute bottom-[calc(6.75rem+env(safe-area-inset-bottom,0px))] left-[max(0.75rem,env(safe-area-inset-left,0px))] z-20 max-w-[min(280px,calc(100vw-1.5rem))] rounded-lg border border-white/12 bg-black/55 px-3 py-2 text-[11px] text-white/80 backdrop-blur-sm md:bottom-28 md:left-4">
      <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/45">
        Impacts
      </div>
      <ul className="mt-1 space-y-1">
        {rows.map((ev) => {
          const who =
            ev.attackerClientId === selfClientId
              ? "You"
              : (playerNameById.get(ev.attackerClientId) ?? "Op");
          const mob =
            mobLabelById.get(ev.mobEntityId) ?? ev.mobEntityId.slice(0, 6);
          return (
            <li key={`${ev.ts}-${ev.mobEntityId}-${ev.attackerClientId}`}>
              {who} → {mob}{" "}
              <span className="font-semibold text-cyan-200/90">
                {ev.damage}
                {ev.isCrit ? "!" : ""}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
