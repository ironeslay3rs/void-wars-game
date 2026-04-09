"use client";

import WarFrontSnapshotCallout from "@/components/shared/WarFrontSnapshotCallout";
import type { PlayerState } from "@/features/game/gameTypes";
import { regionalWarStakesByZone } from "@/features/factions/regionalWarStakes";
import { getContestedZoneMeta } from "@/features/world/contestedZone";
import { voidZoneById } from "@/features/void-maps/zoneData";
import { getDoctrinePressureStrip } from "@/features/world/missionDoctrineStrip";
import { getWarFrontSnapshot } from "@/features/world/warFrontSnapshot";

type Props = {
  player: PlayerState;
  nowMs: number;
};

function barClass(kind: "bio" | "mecha" | "pure") {
  if (kind === "bio") return "bg-emerald-500/85";
  if (kind === "mecha") return "bg-cyan-500/85";
  return "bg-fuchsia-500/85";
}

export default function TerritorialDoctrinePanel({ player, nowMs }: Props) {
  const meta = getContestedZoneMeta(nowMs);
  const zoneLabel = voidZoneById[meta.zoneId]?.label ?? meta.zoneId;
  const stakes = regionalWarStakesByZone[meta.zoneId];
  const d = player.zoneDoctrinePressure[meta.zoneId];
  const strip = getDoctrinePressureStrip(player, nowMs);
  const snap = getWarFrontSnapshot(player, meta.zoneId);

  if (!d) return null;

  const rows: Array<{ key: "bio" | "mecha" | "pure"; label: string; pct: number }> = [
    { key: "bio", label: "Verdant Coil · Bio", pct: d.bio },
    { key: "mecha", label: "Chrome Synod · Mecha", pct: d.mecha },
    { key: "pure", label: "Ember Vault · Pure", pct: d.pure },
  ];

  return (
    <div className="rounded-2xl border border-indigo-400/28 bg-indigo-950/25 px-4 py-3 text-sm text-indigo-50/92">
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
        Empire theaters · doctrine readout
      </div>
      <p className="mt-2 text-[11px] font-semibold text-white/90">
        Contested sector: <span className="text-indigo-100">{zoneLabel}</span>
      </p>
      <p className="mt-1 text-xs leading-relaxed text-indigo-100/78">{stakes}</p>
      {snap ? (
        <div className="mt-3">
          <WarFrontSnapshotCallout
            snapshot={snap}
            showZoneTitle={false}
            className="border-amber-400/22 bg-amber-950/20"
          />
        </div>
      ) : null}
      <div className="mt-3 space-y-2">
        {rows.map((row) => (
          <div key={row.key}>
            <div className="flex justify-between text-[10px] font-semibold uppercase tracking-[0.12em] text-white/55">
              <span>{row.label}</span>
              <span className="tabular-nums text-white/75">{row.pct}%</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/40">
              <div
                className={["h-full rounded-full transition-[width]", barClass(row.key)].join(" ")}
                style={{ width: `${Math.max(0, Math.min(100, row.pct))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-white/58">{strip.pressureLine}</p>
      {strip.commodityLine ? (
        <p className="mt-1 text-[11px] leading-relaxed text-amber-200/85">
          {strip.commodityLine}
        </p>
      ) : null}
    </div>
  );
}
