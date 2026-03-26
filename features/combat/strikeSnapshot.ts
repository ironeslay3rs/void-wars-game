import type { PlayerState } from "@/features/game/gameTypes";
import type {
  FactionAlignment,
  FieldLoadoutProfile,
} from "@/features/game/gameTypes";
import type { PlayerPresence } from "@/features/void-maps/realtime/voidRealtimeProtocol";
import type { RuneSchool } from "@/features/mastery/runeMasteryTypes";
import { RUNE_SCHOOLS } from "@/features/mastery/runeMasteryTypes";
import { createInitialRuneMastery } from "@/features/mastery/runeMasteryLogic";

/** Minimal combat snapshot for M4 posture/strike math (client shell + WS server). */
export type StrikeSnapshot = {
  factionAlignment: FactionAlignment;
  fieldLoadoutProfile: FieldLoadoutProfile;
  depthBySchool: Record<RuneSchool, number>;
  minorCountBySchool: Record<RuneSchool, number>;
};

export function strikeSnapshotFromPlayer(player: PlayerState): StrikeSnapshot {
  return {
    factionAlignment: player.factionAlignment,
    fieldLoadoutProfile: player.fieldLoadoutProfile,
    depthBySchool: { ...player.runeMastery.depthBySchool },
    minorCountBySchool: { ...player.runeMastery.minorCountBySchool },
  };
}

/** Synthetic rune bag for tier/depth helpers that expect `PlayerRuneMasteryState`. */
export function syntheticRuneMasteryFromSnapshot(s: StrikeSnapshot) {
  const base = createInitialRuneMastery();
  return {
    ...base,
    depthBySchool: { ...s.depthBySchool },
    minorCountBySchool: { ...s.minorCountBySchool },
  };
}

export function defaultStrikeSnapshot(
  factionAlignment: FactionAlignment = "unbound",
): StrikeSnapshot {
  const base = createInitialRuneMastery();
  return {
    factionAlignment,
    fieldLoadoutProfile: "assault",
    depthBySchool: { ...base.depthBySchool },
    minorCountBySchool: { ...base.minorCountBySchool },
  };
}

export function strikeSnapshotFromJoinPayload(payload: {
  factionAlignment: FactionAlignment;
  fieldLoadoutProfile?: FieldLoadoutProfile | null;
  runeDepthBySchool?: Partial<Record<RuneSchool, number>> | null;
  runeMinorsBySchool?: Partial<Record<RuneSchool, number>> | null;
}): StrikeSnapshot {
  const base = defaultStrikeSnapshot(payload.factionAlignment);
  const profile =
    payload.fieldLoadoutProfile === "assault" ||
    payload.fieldLoadoutProfile === "support" ||
    payload.fieldLoadoutProfile === "breach"
      ? payload.fieldLoadoutProfile
      : "assault";

  const depthBySchool = { ...base.depthBySchool };
  const minorCountBySchool = { ...base.minorCountBySchool };

  if (payload.runeDepthBySchool) {
    for (const sch of RUNE_SCHOOLS) {
      const d = payload.runeDepthBySchool[sch];
      if (typeof d === "number" && Number.isFinite(d)) {
        depthBySchool[sch] = Math.max(1, Math.min(7, Math.floor(d)));
      }
    }
  }
  if (payload.runeMinorsBySchool) {
    for (const sch of RUNE_SCHOOLS) {
      const m = payload.runeMinorsBySchool[sch];
      if (typeof m === "number" && Number.isFinite(m)) {
        minorCountBySchool[sch] = Math.max(0, Math.min(99, Math.floor(m)));
      }
    }
  }

  return {
    factionAlignment: payload.factionAlignment,
    fieldLoadoutProfile: profile,
    depthBySchool,
    minorCountBySchool,
  };
}

export function strikeSnapshotFromPresence(p: PlayerPresence): StrikeSnapshot {
  return strikeSnapshotFromJoinPayload({
    factionAlignment: p.factionAlignment,
    fieldLoadoutProfile: p.fieldLoadoutProfile,
    runeDepthBySchool: p.runeDepthBySchool,
    runeMinorsBySchool: p.runeMinorsBySchool,
  });
}
