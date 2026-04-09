"use client";

import Link from "next/link";

import type { FactionAlignment } from "@/features/game/gameTypes";
import type { DoctrinePressure } from "@/features/factions/factionWorldTypes";
import {
  aggregateRegionalPressureKind,
  dominantDoctrinePath,
  getSchoolPressureKind,
} from "@/features/factions/factionWorldLogic";
import { regionalWarStakesByZone } from "@/features/factions/regionalWarStakes";
import {
  voidZones,
  type VoidZoneId,
} from "@/features/void-maps/zoneData";
import { getEmpireById } from "@/features/empires/empireSelectors";
import {
  getEmpireRoute,
  getSchoolRoute,
  getSchoolsByEmpire,
} from "@/features/schools/schoolSelectors";

function barColor(path: "bio" | "mecha" | "pure") {
  if (path === "bio") return "bg-emerald-400/90";
  if (path === "mecha") return "bg-cyan-400/90";
  return "bg-violet-400/90";
}

function pathLabel(path: "bio" | "mecha" | "pure") {
  if (path === "bio") return "Bio";
  if (path === "mecha") return "Mecha";
  return "Pure";
}

function pressureTone(kind: ReturnType<typeof getSchoolPressureKind>) {
  if (kind === "reinforced") return "text-emerald-200/90";
  if (kind === "contested") return "text-rose-200/90";
  return "text-white/60";
}

export function ZoneDoctrinePressurePanel({
  zoneDoctrinePressure,
  factionAlignment,
}: {
  zoneDoctrinePressure: Record<VoidZoneId, DoctrinePressure>;
  factionAlignment: FactionAlignment;
}) {
  const globalKind = aggregateRegionalPressureKind({
    factionAlignment,
    byZone: zoneDoctrinePressure,
  });

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/70">
        <p className="text-xs uppercase tracking-[0.18em] text-white/40">
          School pressure (your path)
        </p>
        <p className={`mt-2 font-medium ${pressureTone(globalKind)}`}>
          {factionAlignment === "unbound"
            ? "Unbound — pressure reads neutral until you align with a doctrine wing."
            : globalKind === "reinforced"
              ? "Reinforced in hard-line theatres: dominant zones favor your alignment."
              : globalKind === "contested"
                ? "Contested: rival doctrine holds several regions; expect tighter Black Market salvage lanes."
                : "Balanced — no single bloc owns the void ring yet."}
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {voidZones.map((zone) => {
          const p = zoneDoctrinePressure[zone.id];
          const dom = dominantDoctrinePath(p);
          const localKind = getSchoolPressureKind({
            factionAlignment,
            pressure: p,
          });
          return (
            <div
              key={zone.id}
              className="rounded-xl border border-white/10 bg-black/25 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-white">
                    {zone.label}
                  </h3>
                  <p className="mt-1 text-xs text-white/50">
                    Held by{" "}
                    <Link
                      href={getEmpireRoute(dom)}
                      className="text-white/85 underline-offset-2 hover:underline"
                      style={{ color: getEmpireById(dom).accentHex }}
                    >
                      the {getEmpireById(dom).name}
                    </Link>
                    {factionAlignment !== "unbound" ? (
                      <span className={` ml-2 ${pressureTone(localKind)}`}>
                        ·{" "}
                        {localKind === "reinforced"
                          ? "aligned pressure"
                          : localKind === "contested"
                            ? "opposed pressure"
                            : "mixed"}
                      </span>
                    ) : null}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {getSchoolsByEmpire(dom).map((s) => (
                      <Link
                        key={s.id}
                        href={getSchoolRoute(s.id)}
                        className="rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white/85 transition hover:bg-white/10"
                        style={{
                          borderColor: `${s.accentHex}55`,
                          color: s.accentHex,
                        }}
                        title={`${s.name} — ${s.nation} (${s.pantheon})`}
                      >
                        {s.shortName}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {(["bio", "mecha", "pure"] as const).map((k) => (
                  <div key={k} className="flex items-center gap-2">
                    <span className="w-14 text-[10px] uppercase tracking-[0.14em] text-white/45">
                      {pathLabel(k)}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full transition-[width] ${barColor(k)}`}
                        style={{ width: `${p[k]}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-xs tabular-nums text-white/55">
                      {p[k]}
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-3 border-t border-white/5 pt-3 text-xs leading-relaxed text-white/45">
                {regionalWarStakesByZone[zone.id]}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
