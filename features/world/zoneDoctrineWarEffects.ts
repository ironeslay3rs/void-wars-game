import type { DoctrinePressure } from "@/features/factions/factionWorldTypes";
import { dominantDoctrinePath } from "@/features/factions/factionWorldLogic";
import type {
  FactionAlignment,
  MissionReward,
  PlayerState,
  ResourcesState,
} from "@/features/game/gameTypes";
import { lootThemeToContestedSchool } from "@/features/world/contestedZone";
import {
  voidZoneById,
  type VoidZoneId,
} from "@/features/void-maps/zoneData";

export type DoctrineWarDominant = "bio" | "mecha" | "pure";

export type ZoneDoctrineWarPack = {
  dominant: DoctrineWarDominant;
  dominantPct: number;
  payoutMult: number;
  extraVoidInstability: number;
  /** Added to mission reward.conditionDelta (usually softens drain). */
  conditionDeltaBonus: number;
  /** One-line Vampire Wars–style consequence for this zone + pressure. */
  warConsequenceLine: string;
  /** Who is winning this sector right now (player-facing). */
  sectorWinnerLine: string;
  /** Why it matters mechanically (short). */
  mechanicalMeaningLine: string;
};

function sortedPressureTriplet(p: DoctrinePressure): [number, number, number] {
  const v = [p.bio, p.mecha, p.pure].sort((a, b) => b - a);
  return [v[0], v[1], v[2]];
}

function scaleResources(
  res: Partial<ResourcesState> | undefined,
  mult: number,
): Partial<ResourcesState> | undefined {
  if (!res || mult === 1) return res;
  const out: Partial<ResourcesState> = {};
  for (const [k, raw] of Object.entries(res)) {
    if (typeof raw === "number" && raw !== 0) {
      const key = k as keyof ResourcesState;
      out[key] = Math.max(0, Math.round(raw * mult));
    }
  }
  return out;
}

const DOM_LABEL: Record<DoctrineWarDominant, string> = {
  bio: "Verdant Coil",
  mecha: "Chrome Synod",
  pure: "Ember Vault",
};

/** Settlement + UI: doctrine pressure changes hunt payouts, condition wear, and void strain. */
export function getZoneDoctrineWarPack(
  zoneId: VoidZoneId,
  pressure: DoctrinePressure,
  factionAlignment: FactionAlignment,
): ZoneDoctrineWarPack {
  const zone = voidZoneById[zoneId];
  const native = lootThemeToContestedSchool(zone.lootTheme);
  const dominant = dominantDoctrinePath(pressure);
  const [top, mid] = sortedPressureTriplet(pressure);
  const margin = top - mid;
  const dominantPct = pressure[dominant];

  let payoutMult = 1;
  let extraVoidInstability = 0;
  let conditionDeltaBonus = 0;

  if (dominant === native && margin >= 6) {
    payoutMult += 0.05;
    conditionDeltaBonus += 2;
  }

  if (dominant !== native && top >= 38) {
    payoutMult -= 0.05;
    extraVoidInstability += 1;
  }

  if (
    factionAlignment !== "unbound" &&
    factionAlignment !== dominant &&
    margin >= 12
  ) {
    payoutMult -= 0.03;
    extraVoidInstability += 1;
  }

  payoutMult = Math.max(0.88, Math.min(1.12, payoutMult));
  extraVoidInstability = Math.max(0, Math.min(2, extraVoidInstability));

  const warConsequenceLine = buildWarConsequenceLine(
    zoneId,
    native,
    dominant,
    margin,
  );
  const sectorWinnerLine = `${DOM_LABEL[dominant]} leads this sector at ${dominantPct}% doctrine control.`;
  const mechanicalMeaningLine =
    payoutMult > 1.01
      ? "Right now: richer contract payout, lighter extraction wear — your side is taxing the lane."
      : payoutMult < 0.99
        ? "Right now: leaner payout and extra void strain on settlement — occupiers squeeze the strip."
        : "Right now: balanced pressure — payouts and strain stay close to baseline.";

  return {
    dominant,
    dominantPct,
    payoutMult,
    extraVoidInstability,
    conditionDeltaBonus,
    warConsequenceLine,
    sectorWinnerLine,
    mechanicalMeaningLine,
  };
}

function buildWarConsequenceLine(
  zoneId: VoidZoneId,
  native: DoctrineWarDominant,
  dominant: DoctrineWarDominant,
  margin: number,
): string {
  const contested = dominant !== native && margin >= 6;
  if (zoneId === "howling-scar") {
    if (dominant === "bio")
      return contested
        ? "Verdant Coil pushes foreign scar tissue — body-drop pressure surges; bio tithes fight for every meter."
        : "Verdant Coil dominance deepens the rot — bio payouts swell, extraction chews harder.";
    if (dominant === "mecha")
      return "Chrome Synod presence stabilizes extraction lanes but taxes salvage off the growth floor.";
    return "Ember Vault flux pools in the scar — void strain climbs; pure-tithe routes pay cleaner.";
  }
  if (zoneId === "ash-relay") {
    if (dominant === "mecha")
      return contested
        ? "Chrome Synod holds contested relay spines — mecha salvage thickens, rival schools bleed condition on pull-out."
        : "Chrome Synod dominance runs the relay — mecha payouts edge up, extract stays disciplined.";
    if (dominant === "bio")
      return "Verdant Coil creep invades the relay — rot swarms pressure increases, scrap lines thin.";
    return "Ember Vault resonance rides the ash stacks — strain ticks faster, core trades favor the faithful.";
  }
  if (zoneId === "echo-ruins") {
    if (dominant === "pure")
      return contested
        ? "Ember Vault claws echo-ruins memory — flux spikes strain; pure channels pay if you survive filing."
        : "Ember Vault ascendancy bottles the echo — pure payouts lift, resonance tax follows you out.";
    if (dominant === "bio")
      return "Verdant Coil roots crack the echo bed — bio rot pressure climbs; salvage frays.";
    return "Chrome Synod frames shore the ruins — extraction steadies, mecha tithe gets a rail discount.";
  }
  /* rift-maw */
  if (dominant === "pure")
    return "Ember Vault threads the Maw breach — boss spillover sharpens flux; cores trade meaner.";
  if (dominant === "mecha")
    return "Chrome Synod siege lines the Maw — mecha salvage stabilizes, but rival pulls cost condition.";
  return "Verdant Coil hunger widens the Maw mouth — body stacks surge; bio drops fatten under teeth.";
}

/** Apply doctrine war to an already-modded mission reward (hunger/fusion/path). */
export function applyDoctrineWarToMissionReward(
  reward: MissionReward,
  zoneId: VoidZoneId,
  pressure: DoctrinePressure,
  factionAlignment: FactionAlignment,
): { reward: MissionReward; extraVoidInstability: number } {
  const pack = getZoneDoctrineWarPack(zoneId, pressure, factionAlignment);
  const m = pack.payoutMult;
  if (
    m === 1 &&
    pack.conditionDeltaBonus === 0 &&
    pack.extraVoidInstability === 0
  ) {
    return { reward, extraVoidInstability: 0 };
  }

  return {
    reward: {
      ...reward,
      rankXp: Math.max(0, Math.round(reward.rankXp * m)),
      masteryProgress: Math.max(0, Math.round(reward.masteryProgress * m)),
      conditionDelta: reward.conditionDelta + pack.conditionDeltaBonus,
      influence:
        typeof reward.influence === "number"
          ? Math.max(0, Math.round(reward.influence * m))
          : reward.influence,
      resources: scaleResources(reward.resources, m),
    },
    extraVoidInstability: pack.extraVoidInstability,
  };
}

/** UI preview for a deployable void sector (hunting grounds / expedition). */
export function getZoneDoctrineWarUiPack(
  player: PlayerState,
  zoneId: VoidZoneId | undefined,
): ZoneDoctrineWarPack | null {
  if (!zoneId) return null;
  const p = player.zoneDoctrinePressure[zoneId];
  if (!p) return null;
  return getZoneDoctrineWarPack(zoneId, p, player.factionAlignment);
}
