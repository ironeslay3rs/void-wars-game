import type { PlayerState } from "@/features/game/gameTypes";
import { getVoidMarketWarAdjustments } from "@/features/factions/warEconomy";
import { aggregateRegionalPressureKind } from "@/features/factions/factionWorldLogic";
import { getContestedZoneMeta } from "@/features/world/contestedZone";
import { voidZoneById } from "@/features/void-maps/zoneData";

/** Home / Missions — contested sector + doctrine ledger + void commodity read (M6–M9 surfacing). */
export function getDoctrinePressureStrip(player: PlayerState, nowMs: number) {
  const contested = getContestedZoneMeta(nowMs);
  const zoneLabel =
    voidZoneById[contested.zoneId]?.label ?? contested.zoneId;
  const schoolLabel =
    contested.school === "bio"
      ? "Bio"
      : contested.school === "mecha"
        ? "Mecha"
        : "Pure";

  const kind = aggregateRegionalPressureKind({
    factionAlignment: player.factionAlignment,
    byZone: player.zoneDoctrinePressure,
  });
  const pressureLine =
    kind === "contested"
      ? "Ledger: contested theatres — your path is trading paint on multiple void maps."
      : kind === "reinforced"
        ? "Ledger: reinforced lanes — your bloc is holding ground on the rim."
        : player.factionAlignment === "unbound"
          ? "Ledger: unbound — rim pressure still moves commodity nerves."
          : "Ledger: balanced rim — no dominant theatre flag this sweep.";

  const war = getVoidMarketWarAdjustments(player);

  return {
    title: "Regional war front",
    contestedLine: `Contested void sector: ${zoneLabel} · ${schoolLabel} logistics line`,
    pressureLine,
    commodityLine: war.label,
  };
}
