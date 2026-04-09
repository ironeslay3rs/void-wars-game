import { initialGameState } from "@/features/game/initialGameState";
import { isRunArchetype } from "@/features/game/runArchetypeLogic";
import type {
  GameAction,
  GameState,
  PlayerState,
} from "@/features/game/gameTypes";
import { resolveCharacterCreated } from "@/features/player/characterCreatedGate";
import { normalizePlayerFactionWorldSlice } from "@/features/factions/factionWorldLogic";
import { clamp } from "@/features/game/gameMissionUtils";
import { normalizeMythicAscension } from "@/features/progression/mythicAscensionLogic";
import { normalizeGuildContracts, normalizeGuildRoster } from "@/features/social/guildLiveLogic";
import { normalizeCraftWorkOrderSlot } from "@/features/economy/craftWorkOrderData";
import { applySurvivalDecay } from "@/features/game/reducers/survivalReducer";
import type { GameReducerResult } from "@/features/game/reducers/sharedReducerUtils";

export function hydratePlayerState(player: GameState["player"]): PlayerState {
  return {
    ...initialGameState.player,
    ...player,
    characterPortraitId:
      player.characterPortraitId ?? initialGameState.player.characterPortraitId,
    hunger: player.hunger ?? initialGameState.player.hunger,
    emergencyRationAvailableAt:
      player.emergencyRationAvailableAt ??
      initialGameState.player.emergencyRationAvailableAt,
    voidRealtimeBinding:
      player.voidRealtimeBinding !== undefined
        ? player.voidRealtimeBinding
        : initialGameState.player.voidRealtimeBinding,
    resources: {
      ...initialGameState.player.resources,
      ...player.resources,
    },
    market:
      typeof (player as { market?: unknown }).market === "object" &&
      (player as { market?: unknown }).market !== null
        ? {
            ...initialGameState.player.market,
            ...(player as { market?: Partial<PlayerState["market"]> }).market,
            stockByListingId: {
              ...initialGameState.player.market.stockByListingId,
              ...((player as { market?: { stockByListingId?: Record<string, number> } })
                .market?.stockByListingId ?? {}),
            },
          }
        : initialGameState.player.market,
    craftedInventory:
      typeof (player as { craftedInventory?: unknown }).craftedInventory === "object" &&
      (player as { craftedInventory?: unknown }).craftedInventory !== null
        ? {
            ...initialGameState.player.craftedInventory,
            ...((player as { craftedInventory?: Record<string, number> }).craftedInventory ??
              {}),
          }
        : initialGameState.player.craftedInventory,
    knownRecipes: player.knownRecipes ?? initialGameState.player.knownRecipes,
    unlockedRoutes:
      player.unlockedRoutes ?? initialGameState.player.unlockedRoutes,
    missionQueue: player.missionQueue ?? initialGameState.player.missionQueue,
    runeMastery:
      player.runeMastery ?? initialGameState.player.runeMastery,
    fieldLoadoutProfile:
      player.fieldLoadoutProfile === "assault" ||
      player.fieldLoadoutProfile === "support" ||
      player.fieldLoadoutProfile === "breach"
        ? player.fieldLoadoutProfile
        : initialGameState.player.fieldLoadoutProfile,
    loadoutSlots:
      typeof player.loadoutSlots === "object" && player.loadoutSlots !== null
        ? {
            ...initialGameState.player.loadoutSlots,
            ...player.loadoutSlots,
          }
        : initialGameState.player.loadoutSlots,

    ...normalizePlayerFactionWorldSlice(player),

    guild: normalizeGuildRoster((player as { guild?: unknown }).guild),
    guildContracts: normalizeGuildContracts(
      (player as { guildContracts?: unknown }).guildContracts,
    ),

    mythicAscension: normalizeMythicAscension(
      (player as { mythicAscension?: unknown }).mythicAscension,
    ),

    voidInstability:
      typeof (player as { voidInstability?: unknown }).voidInstability ===
        "number" &&
      Number.isFinite((player as { voidInstability: number }).voidInstability)
        ? clamp((player as { voidInstability: number }).voidInstability, 0, 100)
        : initialGameState.player.voidInstability,

    runInstability:
      typeof (player as { runInstability?: unknown }).runInstability ===
        "number" &&
      Number.isFinite((player as { runInstability: number }).runInstability)
        ? clamp((player as { runInstability: number }).runInstability, 0, 100)
        : initialGameState.player.runInstability,

    runInstabilityLog: Array.isArray(
      (player as { runInstabilityLog?: unknown }).runInstabilityLog,
    )
      ? (player as { runInstabilityLog: PlayerState["runInstabilityLog"] })
          .runInstabilityLog
      : initialGameState.player.runInstabilityLog,

    runHeatPushBoost: (() => {
      const raw = (player as { runHeatPushBoost?: unknown }).runHeatPushBoost;
      if (!raw || typeof raw !== "object") return initialGameState.player.runHeatPushBoost;
      const o = raw as Record<string, unknown>;
      const rewardMult =
        typeof o.rewardMult === "number" && o.rewardMult > 1 ? o.rewardMult : null;
      const expiresAt =
        typeof o.expiresAt === "number" && Number.isFinite(o.expiresAt)
          ? o.expiresAt
          : null;
      if (rewardMult === null || expiresAt === null) {
        return initialGameState.player.runHeatPushBoost;
      }
      return { rewardMult, expiresAt };
    })(),

    instabilityStreakTurns: (() => {
      const v = (player as { instabilityStreakTurns?: unknown }).instabilityStreakTurns;
      return typeof v === "number" && Number.isFinite(v)
        ? Math.max(0, Math.min(999, Math.floor(v)))
        : initialGameState.player.instabilityStreakTurns;
    })(),

    runArchetype: isRunArchetype(
      (player as { runArchetype?: unknown }).runArchetype,
    )
      ? (player as { runArchetype: typeof initialGameState.player.runArchetype })
          .runArchetype
      : initialGameState.player.runArchetype,
    runStyleRiSamples: Array.isArray(
      (player as { runStyleRiSamples?: unknown }).runStyleRiSamples,
    )
      ? (player as { runStyleRiSamples: unknown[] }).runStyleRiSamples
          .filter((x): x is number => typeof x === "number" && Number.isFinite(x))
          .map((x) => clamp(Math.round(x), 0, 100))
          .slice(-12)
      : initialGameState.player.runStyleRiSamples,
    runStyleVentCount: (() => {
      const v = (player as { runStyleVentCount?: unknown }).runStyleVentCount;
      return typeof v === "number" && Number.isFinite(v)
        ? Math.max(0, Math.min(9999, Math.floor(v)))
        : initialGameState.player.runStyleVentCount;
    })(),
    runStylePushCount: (() => {
      const v = (player as { runStylePushCount?: unknown }).runStylePushCount;
      return typeof v === "number" && Number.isFinite(v)
        ? Math.max(0, Math.min(9999, Math.floor(v)))
        : initialGameState.player.runStylePushCount;
    })(),

    expeditionReadyStabilityPending:
      typeof (player as { expeditionReadyStabilityPending?: unknown })
        .expeditionReadyStabilityPending === "boolean"
        ? (player as { expeditionReadyStabilityPending: boolean })
            .expeditionReadyStabilityPending
        : initialGameState.player.expeditionReadyStabilityPending,

    craftWorkOrder: normalizeCraftWorkOrderSlot(
      (player as { craftWorkOrder?: unknown }).craftWorkOrder,
    ),

    characterCreated: resolveCharacterCreated({
      stored:
        typeof (player as { characterCreated?: unknown }).characterCreated ===
        "boolean"
          ? (player as { characterCreated: boolean }).characterCreated
          : undefined,
      playerName:
        typeof player.playerName === "string" ? player.playerName : "",
      factionAlignment:
        player.factionAlignment === "unbound" ||
        player.factionAlignment === "bio" ||
        player.factionAlignment === "mecha" ||
        player.factionAlignment === "pure"
          ? player.factionAlignment
          : player.factionAlignment === "spirit"
            ? "pure"
            : "unbound",
    }),

    lastCraftOutcome: null,
    lastRuneInstallOutcome: null,
  };
}

export function handleHydrationAction(
  state: GameState,
  action: GameAction,
): GameReducerResult {
  switch (action.type) {
    case "HYDRATE_STATE": {
      const now = Date.now();
      const hydratedPlayer = hydratePlayerState(action.payload.player);

      return {
        ...action.payload,
        player: applySurvivalDecay(hydratedPlayer, now),
      };
    }

    default:
      return null;
  }
}
