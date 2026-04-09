import type { DoctrinePressure } from "@/features/factions/factionWorldTypes";
import { dominantDoctrinePath } from "@/features/factions/factionWorldLogic";
import type { FactionAlignment, PlayerState } from "@/features/game/gameTypes";
import { lootThemeToContestedSchool } from "@/features/world/contestedZone";
import {
  getZoneDoctrineWarPack,
  type DoctrineWarDominant,
} from "@/features/world/zoneDoctrineWarEffects";
import {
  voidZoneById,
  type VoidZoneId,
} from "@/features/void-maps/zoneData";

export type WarFrontEmpire = "bio" | "mecha" | "pure";

/** Compact readout for one void strip — Vampire Wars tone, M1 scope. */
export type WarFrontSnapshot = {
  zoneId: string;
  leadingEmpire: WarFrontEmpire | null;
  pressureMargin: number;
  consequenceHeadline: string;
  mechanicalEffectLine: string;
  recommendedResponseLine: string;
};

const EMPIRE: Record<WarFrontEmpire, string> = {
  bio: "Verdant Coil",
  mecha: "Chrome Synod",
  pure: "Ember Vault",
};

function sortedTopMid(p: DoctrinePressure): { top: number; mid: number } {
  const v = [p.bio, p.mecha, p.pure].sort((a, b) => b - a);
  return { top: v[0], mid: v[1] };
}

/** Exported for tests / tooling — margin between first and second doctrine share (0–100 scale). */
export function getDoctrinePressureMargin(pressure: DoctrinePressure): number {
  const { top, mid } = sortedTopMid(pressure);
  return Math.max(0, top - mid);
}

function leadingEmpireFromPressure(
  pressure: DoctrinePressure,
  margin: number,
): WarFrontEmpire | null {
  if (margin < 4) return null;
  return dominantDoctrinePath(pressure) as WarFrontEmpire;
}

function mechanicalLineFromPack(
  pack: ReturnType<typeof getZoneDoctrineWarPack>,
): string {
  const pct = Math.round(pack.payoutMult * 100);
  const strain =
    pack.extraVoidInstability > 0
      ? `+${pack.extraVoidInstability} void strain on settlement`
      : "no extra void strain from doctrine alone";
  const wear =
    pack.conditionDeltaBonus !== 0
      ? ` · extract wear ${pack.conditionDeltaBonus > 0 ? "+" : ""}${pack.conditionDeltaBonus} vs table`
      : "";
  return `Settlement math: contracts pay ≈${pct}% of table · ${strain}${wear}.`;
}

function buildRecommendedResponseLine(params: {
  alignment: FactionAlignment;
  dominant: DoctrineWarDominant;
  native: DoctrineWarDominant;
  margin: number;
}): string {
  const { alignment, dominant, native, margin } = params;

  if (alignment === "unbound") {
    return margin >= 12
      ? "Unbound merc: auction your violence to whoever bids highest here — or swear Coil, Synod, or Vault so the rim stops taxing you blind."
      : "Unbound skim: thrones still trade paint on this ledger — pick an empire when you want brokers to read your receipts kindly.";
  }

  const you = alignment as WarFrontEmpire;
  const youName = EMPIRE[you];
  const domName = EMPIRE[dominant];

  if (you === dominant) {
    return `${youName} holds the crown on this strip — keep filing contracts; mercy is logistics with cleaner paperwork.`;
  }

  if (dominant === native && you !== native) {
    return `${youName} boots on ${domName} native ground — bruise the heir here or rotate to a theater your registry actually owns.`;
  }

  if (margin >= 14) {
    return `${domName} regs run this lane hot — bleed their tithe lines down, or drag the fight to a ${youName} map before payouts hollow out.`;
  }

  return `${domName} edges the ledger here — counter-hunt, swap theaters, or let the Exchange arbitrate your salvage while blades cool.`;
}

/**
 * Single-zone war front snapshot for missions, deploy, and Exchange doctrine panels.
 */
export function getWarFrontSnapshot(
  player: PlayerState,
  zoneId: VoidZoneId,
): WarFrontSnapshot | null {
  const pressure = player.zoneDoctrinePressure[zoneId];
  if (!pressure) return null;

  const zone = voidZoneById[zoneId];
  const native = lootThemeToContestedSchool(zone.lootTheme);
  const margin = getDoctrinePressureMargin(pressure);
  const leading = leadingEmpireFromPressure(pressure, margin);
  const pack = getZoneDoctrineWarPack(zoneId, pressure, player.factionAlignment);

  return {
    zoneId,
    leadingEmpire: leading,
    pressureMargin: margin,
    consequenceHeadline: pack.warConsequenceLine,
    mechanicalEffectLine: mechanicalLineFromPack(pack),
    recommendedResponseLine: buildRecommendedResponseLine({
      alignment: player.factionAlignment,
      dominant: pack.dominant,
      native,
      margin,
    }),
  };
}

const ALL_ZONES: VoidZoneId[] = [
  "howling-scar",
  "ash-relay",
  "echo-ruins",
  "rift-maw",
];

export function getAllWarFrontSnapshots(
  player: PlayerState,
): WarFrontSnapshot[] {
  const out: WarFrontSnapshot[] = [];
  for (const id of ALL_ZONES) {
    const s = getWarFrontSnapshot(player, id);
    if (s) out.push(s);
  }
  return out;
}
