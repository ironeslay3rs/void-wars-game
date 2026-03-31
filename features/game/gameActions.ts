import { initialGameState } from "@/features/game/initialGameState";
import { resolveCharacterCreated } from "@/features/player/characterCreatedGate";
import {
  applyPathAlignedMasteryBonus,
  computeVoidStrainFromFieldLootPickup,
  decayVoidInstabilityOnSurvivalTick,
  getExplorationInstabilitySurchargeCredits,
} from "@/features/progression/phase3Progression";
import { getFeastHallOfferById } from "@/features/black-market/feastHallData";
import { phase1ExplorationReward } from "@/features/exploration/explorationData";
import {
  applyActivityHungerCost,
  addPartialResources,
  applyMissionRewardWithVoidStrain,
  applyRankXp,
  buildMissionQueueEntry,
  canAccessMission,
  clamp,
  getMissionById,
  getResolvedConditionDelta,
  getRankName,
  getXpToNext,
  processMissionQueue,
  rebuildMissionQueueSchedule,
  syncMirroredHuntActiveProcess,
} from "@/features/game/gameMissionUtils";
import {
  FACTION_HQ_STIPEND_COOLDOWN_MS,
  appendGuildLedgerEntry,
  applyTheaterGuildBonusesToBase,
  computeFactionHqStipend,
  guildPointsFromIntensity,
  huntIntensityFromMissionRankReward,
  huntIntensityFromRealtimeTotals,
  normalizePlayerFactionWorldSlice,
  withWorldProgressAfterHunt,
} from "@/features/factions/factionWorldLogic";
import { voidZoneById, type VoidZoneId } from "@/features/void-maps/zoneData";
import {
  buildNavigationState,
  getAvailableRoutes,
} from "@/features/navigation/navigationUtils";
import {
  getStatusRecoveryAmount,
  STATUS_RECOVERY_COOLDOWN_MS,
  STATUS_RECOVERY_COST,
} from "@/features/status/statusRecovery";
import {
  EMERGENCY_RATION_CONDITION_RESTORE,
  EMERGENCY_RATION_COOLDOWN_MS,
  EMERGENCY_RATION_COST,
  HUNGER_CONDITION_PRESSURE_PER_TICK,
  HUNGER_DECAY_PER_TICK,
  HUNGER_PRESSURE_THRESHOLD,
  getHungerPressureEffects,
  MOSS_RATION_CONDITION_RESTORE,
  MOSS_RATION_HUNGER_RESTORE,
  MOSS_RATION_RECIPE_COST,
  SURVIVAL_TICK_INTERVAL_MS,
} from "@/features/status/survival";
import { getContributionRole } from "@/features/void-maps/realtime/contributionScoring";
import { getRoleSoftModifiers } from "@/features/player/playerIdentity";
import type {
  GameAction,
  GameState,
  PlayerState,
  ResourceKey,
  ResourcesState,
} from "@/features/game/gameTypes";
import { getNextRunModifierDefinitionById } from "@/features/crafting-district/nextRunModifiersData";
import { rollVoidFieldLoot } from "@/features/void-maps/rollVoidFieldLoot";
import { tryInstallMinorRune } from "@/features/mastery/runeMasteryLogic";
import { getDistrictCraftingCost } from "@/features/crafting-district/craftingProfession";
import {
  quoteVoidMarketBuy,
  quoteVoidMarketSell,
  VOID_MARKET_COMMODITIES,
} from "@/features/bazaar/voidMarketEconomy";
import { getVoidMarketWarAdjustments } from "@/features/factions/warEconomy";
import {
  canGrantRuneCrafterLicense,
  canPrimeConvergence,
  canUnlockL3RareRuneSet,
  normalizeMythicAscension,
} from "@/features/progression/mythicAscensionLogic";
import { getMasteryAlignedContractResourceMultiplier } from "@/features/mastery/masteryGameplayEffects";
import { getDoctrineQueueGate } from "@/features/progression/launchDoctrine";
import {
  isCanonBookMissionUnlocked,
} from "@/features/progression/canonBookGate";
import {
  addGuildMember,
  createGuild,
  getContractProgressPct,
  initialGuildRoster,
  joinGuildByCode,
  normalizeGuildContracts,
  normalizeGuildRoster,
  postGuildContract,
  removeGuildMember,
  setGuildPledge,
} from "@/features/social/guildLiveLogic";
import type { SharedGuildContract } from "@/features/social/guildLiveTypes";
import { enforceCapacity, enforcePickup } from "@/features/resources/inventoryLogic";
import {
  equipItem,
  sanitizeLoadoutForFaction,
  unequipItem,
} from "@/features/player/loadoutState";
import { applyMarketBuy, applyMarketSell } from "@/features/market/marketActions";
import { craftItem } from "@/features/crafting/craftActions";
import {
  getCraftWorkOrderById,
  normalizeCraftWorkOrderSlot,
  withCraftWorkOrderProgress,
} from "@/features/economy/craftWorkOrderData";
import { getPathAlignedContractResourceMultiplier } from "@/features/economy/pathGatheringYield";
import {
  getStallArrearsPayoffTotal,
  processStallRentCharges,
} from "@/features/economy/stallUpkeep";
import { craftRecipes } from "@/features/crafting/recipeData";

function updateSingleResource(
  resources: ResourcesState,
  key: ResourceKey,
  amount: number,
) {
  return {
    ...resources,
    [key]: Math.max(0, resources[key] + amount),
  };
}

function applySurvivalDecay(player: PlayerState, now: number): PlayerState {
  if (now <= player.lastConditionTickAt) {
    return player;
  }

  // Clear Feast Hall UI state once the kitchen lockout expires.
  // This keeps the "active effect" field easy to reason about/clear.
  if (
    player.activeFeastHallOfferId !== null &&
    player.conditionRecoveryAvailableAt <= now
  ) {
    player = {
      ...player,
      activeFeastHallOfferId: null,
    };
  }

  const elapsedMs = now - player.lastConditionTickAt;
  const ticks = Math.floor(elapsedMs / SURVIVAL_TICK_INTERVAL_MS);

  if (ticks <= 0) {
    return player;
  }

  const nextHunger = clamp(
    player.hunger - ticks * HUNGER_DECAY_PER_TICK,
    0,
    100,
  );
  const conditionPressurePerTick =
    nextHunger < HUNGER_PRESSURE_THRESHOLD
      ? HUNGER_CONDITION_PRESSURE_PER_TICK
      : 0;

  return processStallRentCharges(
    {
      ...player,
      hunger: nextHunger,
      condition: Math.max(0, player.condition - ticks * conditionPressurePerTick),
      lastConditionTickAt: now,
      voidInstability: decayVoidInstabilityOnSurvivalTick(player, ticks),
    },
    now,
  );
}

function hydratePlayerState(player: GameState["player"]): PlayerState {
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
            ...((player as { craftedInventory?: Record<string, number> }).craftedInventory ?? {}),
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
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "HYDRATE_STATE": {
      const now = Date.now();
      const hydratedPlayer = hydratePlayerState(action.payload.player);

      return {
        ...action.payload,
        player: applySurvivalDecay(hydratedPlayer, now),
      };
    }

    case "SET_VOID_REALTIME_BINDING":
      return {
        ...state,
        player: {
          ...state.player,
          voidRealtimeBinding: action.payload,
        },
      };

    case "SET_PLAYER_NAME":
      return {
        ...state,
        player: {
          ...state.player,
          playerName: action.payload,
        },
      };

    case "SET_CHARACTER_PORTRAIT_ID":
      return {
        ...state,
        player: {
          ...state.player,
          characterPortraitId: action.payload,
        },
      };

    case "SET_CAREER_FOCUS":
      return {
        ...state,
        player: {
          ...state.player,
          careerFocus: action.payload,
        },
      };

    case "SET_FIELD_LOADOUT_PROFILE":
      return {
        ...state,
        player: {
          ...state.player,
          fieldLoadoutProfile: action.payload,
        },
      };

    case "EQUIP_LOADOUT_ITEM":
      return {
        ...state,
        player: {
          ...state.player,
          loadoutSlots: equipItem(
            state.player.loadoutSlots,
            action.payload.slot,
            action.payload.itemId,
            state.player.factionAlignment,
          ),
        },
      };

    case "UNEQUIP_LOADOUT_ITEM":
      return {
        ...state,
        player: {
          ...state.player,
          loadoutSlots: unequipItem(state.player.loadoutSlots, action.payload.slot),
        },
      };

    case "SET_FACTION_ALIGNMENT":
      return {
        ...state,
        player: {
          ...state.player,
          factionAlignment: action.payload,
          loadoutSlots: sanitizeLoadoutForFaction(
            state.player.loadoutSlots,
            action.payload,
          ),
        },
      };

    case "ADD_RESOURCE": {
      const { key, amount } = action.payload;
      if (amount > 0) {
        const { accepted } = enforcePickup(state.player.resources, {
          [key]: amount,
        });
        const acceptedAmt = accepted[key] ?? 0;
        if (acceptedAmt <= 0) return state;
        return {
          ...state,
          player: {
            ...state.player,
            resources: updateSingleResource(
              state.player.resources,
              key,
              acceptedAmt,
            ),
          },
        };
      }
      return {
        ...state,
        player: {
          ...state.player,
          resources: updateSingleResource(
            state.player.resources,
            action.payload.key,
            action.payload.amount,
          ),
        },
      };
    }

    case "VOID_FIELD_ORB_COLLECTED": {
      const k = action.payload.key;
      const amt = Math.max(0, Math.floor(action.payload.amount));
      if (amt <= 0) return state;
      const cur = state.player.fieldLootGainedThisRun?.[k] ?? 0;
      return {
        ...state,
        player: {
          ...state.player,
          fieldLootGainedThisRun: {
            ...(state.player.fieldLootGainedThisRun ?? {}),
            [k]: cur + amt,
          },
        },
      };
    }

    case "ADD_FIELD_LOOT": {
      const { accepted } = enforcePickup(state.player.resources, {
        [action.payload.key]: action.payload.amount,
      });
      const acceptedAmount = accepted[action.payload.key] ?? 0;
      if (acceptedAmount <= 0) {
        return state;
      }
      const nextResources = updateSingleResource(
        state.player.resources,
        action.payload.key,
        acceptedAmount,
      );
      const skipLedger = action.payload.skipRunLedger === true;
      const prevFl = state.player.fieldLootGainedThisRun ?? {};
      const nextFieldLoot = skipLedger
        ? prevFl
        : {
            ...prevFl,
            [action.payload.key]:
              (prevFl[action.payload.key] ?? 0) + acceptedAmount,
          };
      const pickupStrain = computeVoidStrainFromFieldLootPickup(acceptedAmount);
      return {
        ...state,
        player: {
          ...state.player,
          resources: nextResources,
          fieldLootGainedThisRun: nextFieldLoot,
          voidInstability: clamp(
            state.player.voidInstability + pickupStrain,
            0,
            100,
          ),
        },
      };
    }

    case "SPEND_RESOURCE":
      return {
        ...state,
        player: {
          ...state.player,
          resources: updateSingleResource(
            state.player.resources,
            action.payload.key,
            -action.payload.amount,
          ),
        },
      };

    case "MARKET_BUY": {
      const result = applyMarketBuy(state, action.payload.listingId);
      return result.next;
    }

    case "MARKET_SELL": {
      const result = applyMarketSell(
        state,
        action.payload.key,
        action.payload.amount,
      );
      return result.next;
    }

    case "CRAFT_RECIPE": {
      const recipe = craftRecipes.find((r) => r.id === action.payload.recipeId) ?? null;
      if (!recipe) return state;
      const { player: craftedPlayer, result } = craftItem({
        player: state.player,
        recipe,
      });
      let player = craftedPlayer;
      if (result.ok && result.success) {
        player = withCraftWorkOrderProgress(player, {
          type: "recipe",
          recipeId: recipe.id,
        });
      }
      return {
        ...state,
        player,
      };
    }

    case "ACCEPT_CRAFT_WORK_ORDER": {
      if ((state.player.stallArrearsCount ?? 0) > 0) {
        return state;
      }
      const def = getCraftWorkOrderById(action.payload.definitionId);
      if (!def) return state;
      return {
        ...state,
        player: {
          ...state.player,
          craftWorkOrder: { definitionId: def.id, progress: 0 },
        },
      };
    }

    case "PAY_STALL_ARREARS": {
      const n = state.player.stallArrearsCount ?? 0;
      if (n <= 0) return state;
      const cost = getStallArrearsPayoffTotal(n);
      if (state.player.resources.credits < cost) return state;
      return {
        ...state,
        player: {
          ...state.player,
          stallArrearsCount: 0,
          resources: updateSingleResource(
            state.player.resources,
            "credits",
            -cost,
          ),
        },
      };
    }

    case "ABANDON_CRAFT_WORK_ORDER":
      if (state.player.craftWorkOrder === null) return state;
      return {
        ...state,
        player: {
          ...state.player,
          craftWorkOrder: null,
        },
      };

    case "CLAIM_CRAFT_WORK_ORDER": {
      const wo = state.player.craftWorkOrder;
      if (!wo) return state;
      const def = getCraftWorkOrderById(wo.definitionId);
      if (!def || wo.progress < def.targetCount) return state;
      let resources = updateSingleResource(
        state.player.resources,
        "credits",
        def.rewardCredits,
      );
      if (def.rewardResources) {
        resources = addPartialResources(resources, def.rewardResources);
      }
      return {
        ...state,
        player: {
          ...state.player,
          resources,
          craftWorkOrder: null,
        },
      };
    }

    case "VOID_MARKET_TRADE": {
      const { side, commodity, units } = action.payload;
      if (!(VOID_MARKET_COMMODITIES as readonly string[]).includes(commodity)) {
        return state;
      }
      const n = Math.floor(units);
      if (!Number.isFinite(n) || n < 1 || n > 9_999) {
        return state;
      }
      const player = state.player;
      if (side === "buy") {
        const quote = quoteVoidMarketBuy(n, commodity);
        const war = getVoidMarketWarAdjustments(player);
        const totalCredits = Math.ceil(quote.totalCredits * war.buyMult);
        if (player.resources.credits < totalCredits) {
          return state;
        }
        let res = updateSingleResource(
          player.resources,
          "credits",
          -totalCredits,
        );
        res = updateSingleResource(res, commodity, n);
        return {
          ...state,
          player: {
            ...player,
            resources: res,
          },
        };
      }
      if (player.resources[commodity] < n) {
        return state;
      }
      const { netCredits } = quoteVoidMarketSell(
        n,
        commodity,
        player.careerFocus,
      );
      let res = updateSingleResource(player.resources, commodity, -n);
      res = updateSingleResource(res, "credits", netCredits);
      return {
        ...state,
        player: {
          ...player,
          resources: res,
        },
      };
    }

    case "GAIN_RANK_XP": {
      const rankState = applyRankXp(
        state.player.rankLevel,
        state.player.rankXp,
        action.payload,
      );

      return {
        ...state,
        player: {
          ...state.player,
          ...rankState,
          navigation: buildNavigationState(
            rankState.rankLevel,
            state.player.unlockedRoutes,
            state.player.navigation.currentRoute,
          ),
        },
      };
    }

    case "SET_RANK_LEVEL": {
      const nextRankLevel = Math.max(1, action.payload);

      return {
        ...state,
        player: {
          ...state.player,
          rankLevel: nextRankLevel,
          rankXpToNext: getXpToNext(nextRankLevel),
          rank: getRankName(nextRankLevel),
          navigation: buildNavigationState(
            nextRankLevel,
            state.player.unlockedRoutes,
            state.player.navigation.currentRoute,
          ),
        },
      };
    }

    case "SET_RANK_NAME":
      return {
        ...state,
        player: {
          ...state.player,
          rank: action.payload,
        },
      };

    case "ADJUST_CONDITION":
      return {
        ...state,
        player: {
          ...state.player,
          condition: clamp(state.player.condition + action.payload, 0, 100),
        },
      };

    case "APPLY_ARENA_RANKED_SR_DELTA": {
      const delta = action.payload;
      if (!Number.isFinite(delta) || delta === 0) return state;
      const p = state.player;
      const sr = p.mythicAscension.arenaRankedSeason1Rating;
      const next = Math.max(600, Math.min(2800, Math.floor(sr + delta)));
      if (next === sr) return state;
      const mythic = p.mythicAscension;
      const nextValor =
        delta > 0 && mythic.convergencePrimed
          ? Math.min(99, mythic.runeKnightValor + 1)
          : mythic.runeKnightValor;
      return {
        ...state,
        player: {
          ...p,
          mythicAscension: {
            ...mythic,
            arenaRankedSeason1Rating: next,
            runeKnightValor: nextValor,
          },
        },
      };
    }

    case "ADJUST_HUNGER":
      return {
        ...state,
        player: {
          ...state.player,
          hunger: clamp(state.player.hunger + action.payload, 0, 100),
        },
      };

    case "APPLY_VOID_INSTABILITY_DELTA": {
      const delta = action.payload;
      if (!Number.isFinite(delta) || delta === 0) {
        return state;
      }
      return {
        ...state,
        player: {
          ...state.player,
          voidInstability: clamp(
            state.player.voidInstability + delta,
            0,
            100,
          ),
        },
      };
    }

    case "RECOVER_CONDITION": {
      const now = Date.now();
      const player = applySurvivalDecay(state.player, now);
      const recoveryAmount = getStatusRecoveryAmount(player.knownRecipes);

      if (player.conditionRecoveryAvailableAt > now) {
        return {
          ...state,
          player,
        };
      }

      if (player.resources.credits < STATUS_RECOVERY_COST) {
        return {
          ...state,
          player,
        };
      }

      return {
        ...state,
        player: {
          ...player,
          condition: clamp(player.condition + recoveryAmount, 0, 100),
          conditionRecoveryAvailableAt: now + STATUS_RECOVERY_COOLDOWN_MS,
          activeFeastHallOfferId: null,
          voidInstability: Math.max(0, player.voidInstability - 6),
          resources: updateSingleResource(
            player.resources,
            "credits",
            -STATUS_RECOVERY_COST,
          ),
        },
      };
    }

    case "CRAFT_MOSS_RATION": {
      const player = state.player;
      const mossCost = getDistrictCraftingCost(player, MOSS_RATION_RECIPE_COST);
      const needBio =
        mossCost.bioSamples ?? MOSS_RATION_RECIPE_COST.bioSamples;
      const needIron =
        mossCost.ironOre ?? MOSS_RATION_RECIPE_COST.ironOre;

      if (
        player.resources.bioSamples < needBio ||
        player.resources.ironOre < needIron ||
        needBio < 1 ||
        needIron < 1
      ) {
        return state;
      }

      const spentSamples = updateSingleResource(
        player.resources,
        "bioSamples",
        -needBio,
      );
      const spentOre = updateSingleResource(
        spentSamples,
        "ironOre",
        -needIron,
      );

      let nextPlayer = {
        ...player,
        resources: updateSingleResource(spentOre, "mossRations", 1),
      };
      nextPlayer = withCraftWorkOrderProgress(nextPlayer, { type: "moss-bind" });

      return {
        ...state,
        player: nextPlayer,
      };
    }

    case "USE_EMERGENCY_RATION": {
      const now = Date.now();
      const player = applySurvivalDecay(state.player, now);

      if (player.emergencyRationAvailableAt > now) {
        return {
          ...state,
          player,
        };
      }

      if (player.resources.credits < EMERGENCY_RATION_COST) {
        return {
          ...state,
          player,
        };
      }

      if (player.condition >= 100) {
        return {
          ...state,
          player,
        };
      }

      return {
        ...state,
        player: {
          ...player,
          condition: clamp(
            player.condition + EMERGENCY_RATION_CONDITION_RESTORE,
            0,
            100,
          ),
          emergencyRationAvailableAt: now + EMERGENCY_RATION_COOLDOWN_MS,
          activeFeastHallOfferId: null,
          voidInstability: Math.max(0, player.voidInstability - 3),
          resources: updateSingleResource(
            player.resources,
            "credits",
            -EMERGENCY_RATION_COST,
          ),
        },
      };
    }

    case "CONSUME_MOSS_RATION": {
      const now = Date.now();
      const player = applySurvivalDecay(state.player, now);

      if (player.resources.mossRations < 1) {
        return {
          ...state,
          player,
        };
      }

      return {
        ...state,
        player: {
          ...player,
          hunger: clamp(player.hunger + MOSS_RATION_HUNGER_RESTORE, 0, 100),
          condition: clamp(
            player.condition + MOSS_RATION_CONDITION_RESTORE,
            0,
            100,
          ),
          voidInstability: Math.max(0, player.voidInstability - 2),
          resources: updateSingleResource(player.resources, "mossRations", -1),
        },
      };
    }

    case "CRAFT_NEXT_RUN_MODIFIER": {
      const player = state.player;
      const def = getNextRunModifierDefinitionById(action.payload.modifierId);
      if (!def) return state;

      const cost = getDistrictCraftingCost(player, def.cost);
      const costEntries = Object.entries(cost).filter(
        (entry): entry is [ResourceKey, number] => typeof entry[1] === "number",
      );
      const canAfford = costEntries.every(
        ([key, amount]) => player.resources[key] >= amount,
      );
      if (!canAfford) return state;

      let nextResources = player.resources;
      for (const [key, amount] of costEntries) {
        nextResources = updateSingleResource(nextResources, key, -amount);
      }

      return {
        ...state,
        player: {
          ...player,
          resources: nextResources,
          // One-slot, non-stacking: crafting replaces any previously primed kit.
          nextRunModifiers: def.modifiers,
          nextRunModifiersAppliedForProcessId: null,
        },
      };
    }

    case "USE_FEAST_HALL_OFFER": {
      const now = Date.now();
      const player = applySurvivalDecay(state.player, now);
      const offer = getFeastHallOfferById(action.payload.offerId);

      if (!offer) {
        return {
          ...state,
          player,
        };
      }

      if (player.condition >= 100 || player.conditionRecoveryAvailableAt > now) {
        return {
          ...state,
          player,
        };
      }

      const offerCostEntries = Object.entries(offer.cost).filter(
        (entry): entry is [ResourceKey, number] => typeof entry[1] === "number",
      );

      const canAffordOffer = offerCostEntries.every(
        ([resourceKey, amount]) => player.resources[resourceKey] >= amount,
      );

      if (!canAffordOffer) {
        return {
          ...state,
          player,
        };
      }

      let nextResources = player.resources;

      offerCostEntries.forEach(([resourceKey, amount]) => {
        nextResources = updateSingleResource(nextResources, resourceKey, -amount);
      });

      return {
        ...state,
        player: {
          ...player,
          condition: clamp(player.condition + offer.conditionGain, 0, 100),
          hunger: clamp(player.hunger + offer.hungerDelta, 0, 100),
          conditionRecoveryAvailableAt: now + offer.cooldownMs,
          activeFeastHallOfferId: offer.id,
          resources: nextResources,
        },
      };
    }

    case "RESOLVE_HUNT": {
      const now = action.payload.resolvedAt ?? Date.now();
      const player = applySurvivalDecay(state.player, now);
      const mission = getMissionById(state.missions, action.payload.missionId);

      if (!mission) {
        return {
          ...state,
          player,
        };
      }

      const selectedPath =
        player.factionAlignment === "unbound"
          ? "unbound"
          : player.factionAlignment;

      if (!canAccessMission(mission, selectedPath)) {
        return {
          ...state,
          player,
        };
      }

      if (
        mission.id === "bio-hunt-specimen" &&
        !player.hasBiotechSpecimenLead
      ) {
        return {
          ...state,
          player,
        };
      }

      const resolvedAt = action.payload.resolvedAt ?? now;
      const hungerEffects = getHungerPressureEffects(player.hunger);

      const nextRunMods = player.nextRunModifiers;
      const settlementMods = nextRunMods?.applyOnSettlement ?? null;
      const nextRunRewardMultiplier =
        settlementMods && typeof settlementMods.rewardBonusPct === "number"
          ? 1 + settlementMods.rewardBonusPct / 100
          : 1;
      const nextRunConditionDeltaOffset =
        (settlementMods?.conditionDrainReduction ?? 0) -
        (settlementMods?.conditionDrainPenalty ?? 0);

      const rewardForResolution =
        hungerEffects.rewardPenaltyPct === 0
          ? mission.reward
          : {
              ...mission.reward,
              conditionDelta:
                mission.reward.conditionDelta -
                hungerEffects.conditionDrainPenalty,
              rankXp: Math.round(
                mission.reward.rankXp * hungerEffects.rewardMultiplier,
              ),
              masteryProgress: Math.round(
                mission.reward.masteryProgress * hungerEffects.rewardMultiplier,
              ),
              influence:
                typeof mission.reward.influence === "number"
                  ? Math.round(
                      mission.reward.influence * hungerEffects.rewardMultiplier,
                    )
                  : undefined,
              resources: mission.reward.resources
                ? (Object.fromEntries(
                    Object.entries(mission.reward.resources).map(
                      ([key, value]) => [
                        key,
                        Math.round(value * hungerEffects.rewardMultiplier),
                      ],
                    ),
                  ) as typeof mission.reward.resources)
                : undefined,
            };

      const rewardWithNextRunMods =
        nextRunRewardMultiplier === 1 && nextRunConditionDeltaOffset === 0
          ? rewardForResolution
          : {
              ...rewardForResolution,
              conditionDelta: rewardForResolution.conditionDelta + nextRunConditionDeltaOffset,
              rankXp: Math.round(rewardForResolution.rankXp * nextRunRewardMultiplier),
              masteryProgress: Math.round(
                rewardForResolution.masteryProgress * nextRunRewardMultiplier,
              ),
              influence:
                typeof rewardForResolution.influence === "number"
                  ? Math.round(rewardForResolution.influence * nextRunRewardMultiplier)
                  : undefined,
              resources: rewardForResolution.resources
                ? (Object.fromEntries(
                    Object.entries(rewardForResolution.resources).map(
                      ([key, value]) => [
                        key,
                        Math.round(value * nextRunRewardMultiplier),
                      ],
                    ),
                  ) as typeof rewardForResolution.resources)
                : undefined,
            };

      const rewardWithPathMastery = applyPathAlignedMasteryBonus(
        rewardWithNextRunMods,
        mission.path,
        player.factionAlignment,
      );
      const resolvedConditionDelta = getResolvedConditionDelta(
        player,
        rewardWithPathMastery,
      );
      const nextPlayer = applyActivityHungerCost(
        applyMissionRewardWithVoidStrain(
          player,
          rewardWithPathMastery,
          mission.path,
        ),
        "hunt",
      );

      let resolvedPlayer: PlayerState = {
        ...nextPlayer,
        hasBiotechSpecimenLead:
          mission.id === "bio-hunt-specimen"
            ? false
            : player.hasBiotechSpecimenLead,
        fieldLootGainedThisRun: {},
        lastHuntResult: {
          missionId: mission.id,
          huntTitle: mission.title,
          resolvedAt,
          conditionDelta: resolvedConditionDelta,
          conditionAfter: nextPlayer.condition,
          rankXpGained: rewardWithPathMastery.rankXp,
          masteryProgressGained: rewardWithPathMastery.masteryProgress,
          influenceGained: rewardWithPathMastery.influence ?? 0,
          resourcesGained: rewardWithPathMastery.resources ?? {},
          fieldLootGained: state.player.fieldLootGainedThisRun ?? {},
          hungerPressureLabel: hungerEffects.label,
          hungerRewardPenaltyPct: hungerEffects.rewardPenaltyPct,
          hungerConditionDrainPenalty: hungerEffects.conditionDrainPenalty,

          baseRankXpGained: rewardWithPathMastery.rankXp,
          baseMasteryProgressGained: rewardWithPathMastery.masteryProgress,
          baseInfluenceGained: rewardWithPathMastery.influence ?? 0,
          baseResourcesGained: rewardWithPathMastery.resources ?? {},

          realtimeContributionBonusMultiplier: null,
          realtimeContributionAppliedForResolvedAt: null,
          realtimeRankXpBonusGained: 0,
          realtimeMasteryProgressBonusGained: 0,
          realtimeInfluenceBonusGained: 0,
          realtimeResourcesBonusGained: {},

          realtimeTotalDamageDealt: 0,
          realtimeTotalHitsLanded: 0,
          realtimeMobsContributedTo: 0,
          realtimeMobsKilled: 0,
          realtimeExposedKills: 0,
        },
      };

      if (
        mission.category === "hunting-ground" &&
        mission.deployZoneId
      ) {
        resolvedPlayer = withWorldProgressAfterHunt(resolvedPlayer, {
          zoneId: mission.deployZoneId,
          intensity: huntIntensityFromMissionRankReward(
            rewardWithNextRunMods.rankXp,
            rewardWithNextRunMods.influence ?? 0,
          ),
          reason: `Contract — ${mission.title}`,
          nowMs: resolvedAt,
        });
      }

      return {
        ...state,
        player: resolvedPlayer,
      };
    }

    case "APPLY_REALTIME_HUNT_BONUS": {
      const {
        resolvedAt,
        bonusMultiplier,
        zoneId,
        totalDamageDealt,
        totalHitsLanded,
        mobsContributedTo,
        mobsKilled,
        exposedKills,
        bossDefeated,
        bossDropResourcesBase,
        zoneThreatLevel,
      } = action.payload;
      const latest = state.player.lastHuntResult;
      if (!latest) return state;

      // Idempotency: never apply twice for the same resolvedAt.
      if (latest.realtimeContributionAppliedForResolvedAt === resolvedAt) {
        return state;
      }

      const mission = getMissionById(state.missions, latest.missionId);
      if (!mission || mission.category !== "hunting-ground") return state;

      if (latest.resolvedAt !== resolvedAt) return state;

      const baseCappedMultiplier = clamp(bonusMultiplier, 0, 0.35);

      // Zone streak: update on run completion and apply a small resource-only yield bonus.
      const prevLastCompletedZoneId = state.player.lastCompletedZoneId;
      const prevZoneRunStreak = state.player.zoneRunStreak ?? 0;

      const nextZoneRunStreak =
        prevLastCompletedZoneId !== null && prevLastCompletedZoneId === zoneId
          ? prevZoneRunStreak + 1
          : 1;
      const nextLastCompletedZoneId = zoneId;

      const streakBonusPct =
        nextZoneRunStreak >= 5 ? 0.1 : nextZoneRunStreak >= 3 ? 0.05 : 0;
      const streakYieldMultiplier = 1 + streakBonusPct;

      // Identity memory: accumulate per-hunt role trend based on realtime contribution totals.
      // Idempotency is already handled above by `realtimeContributionAppliedForResolvedAt`.
      const totalDamageForIdentity =
        totalDamageDealt ?? latest.realtimeTotalDamageDealt ?? 0;
      const totalHitsForIdentity =
        totalHitsLanded ?? latest.realtimeTotalHitsLanded ?? 0;
      const mobsContributedToForIdentity =
        mobsContributedTo ?? latest.realtimeMobsContributedTo ?? 0;
      const mobsKilledForIdentity =
        mobsKilled ?? latest.realtimeMobsKilled ?? 0;

      const huntRole = getContributionRole({
        totalDamage: totalDamageForIdentity,
        totalHits: totalHitsForIdentity,
        mobsContributedTo: mobsContributedToForIdentity,
        mobsKilled: mobsKilledForIdentity,
      });

      const prevBehaviorStats = state.player.behaviorStats;
      const nextRoleCounts = {
        ...prevBehaviorStats.roleCounts,
        [huntRole]:
          (prevBehaviorStats.roleCounts[huntRole] ?? 0) + 1,
      };

      const nextBehaviorStats = {
        ...prevBehaviorStats,
        totalRealtimeHuntsWithContribution:
          prevBehaviorStats.totalRealtimeHuntsWithContribution + 1,
        roleCounts: nextRoleCounts,
        lastRealtimeRole: huntRole,
      };

      const softModifiers = getRoleSoftModifiers(nextBehaviorStats);
      const zoneThreatMultiplier =
        typeof zoneThreatLevel === "number"
          ? 1 + Math.max(0, zoneThreatLevel - 1) * 0.04
          : 1;
      const effectiveBonusMultiplier = clamp(
        baseCappedMultiplier *
          (1 + softModifiers.rewardBiasMultiplier) *
          zoneThreatMultiplier,
        0,
        0.35,
      );

      // Zone mastery benefits:
      // - resourceEfficiencyFactor scales realtime bonus resources (not XP)
      // - bossDropMasteryFactor scales boss drop amounts (before realtime multiplier)
      const prevZoneMastery = state.player.zoneMastery ?? {};
      const zoneMasteryLevel =
        zoneId in prevZoneMastery ? prevZoneMastery[zoneId] : 0;
      const resourceEfficiencyFactor = clamp(
        1 + zoneMasteryLevel * 0.01,
        1,
        1.2,
      );
      const bossDropMasteryFactor = clamp(
        1 + zoneMasteryLevel * 0.03,
        1,
        1.25,
      );

      const zoneForMastery = Object.prototype.hasOwnProperty.call(
        voidZoneById,
        zoneId,
      )
        ? voidZoneById[zoneId as VoidZoneId]
        : null;
      const masteryResourceYieldMult = zoneForMastery
        ? getMasteryAlignedContractResourceMultiplier(
            state.player.runeMastery,
            zoneForMastery.lootTheme,
          )
        : 1;
      const pathResourceMult = zoneForMastery
        ? getPathAlignedContractResourceMultiplier(
            state.player.factionAlignment,
            zoneForMastery.lootTheme,
          )
        : 1;

      const nextZoneMastery = {
        ...prevZoneMastery,
        [zoneId]: (prevZoneMastery[zoneId] ?? 0) + 1,
      };

      const baseRankXpGained =
        latest.baseRankXpGained ?? latest.rankXpGained ?? 0;
      const baseMasteryProgressGained =
        latest.baseMasteryProgressGained ?? latest.masteryProgressGained ?? 0;
      const baseInfluenceGained =
        latest.baseInfluenceGained ?? latest.influenceGained ?? 0;
      const baseResourcesGained =
        latest.baseResourcesGained ?? latest.resourcesGained ?? {};

      const realtimeRankXpBonusGained = Math.round(
        baseRankXpGained * effectiveBonusMultiplier,
      );
      const realtimeMasteryProgressBonusGained = Math.round(
        baseMasteryProgressGained * effectiveBonusMultiplier,
      );
      const realtimeInfluenceBonusGained = Math.round(
        baseInfluenceGained * effectiveBonusMultiplier,
      );

      const realtimeResourcesBonusGained: Partial<ResourcesState> = {};
      const nextResourcesGained: Partial<ResourcesState> = {
        ...latest.resourcesGained,
      };

      (Object.entries(baseResourcesGained) as Array<[ResourceKey, number]>).forEach(
        ([key, baseAmount]) => {
          if (!baseAmount || baseAmount <= 0) return;
          const bonusAmount = Math.floor(
            baseAmount *
              effectiveBonusMultiplier *
              resourceEfficiencyFactor *
              streakYieldMultiplier *
              masteryResourceYieldMult *
              pathResourceMult,
          );
          if (bonusAmount <= 0) return;
          realtimeResourcesBonusGained[key] =
            (realtimeResourcesBonusGained[key] ?? 0) + bonusAmount;
          nextResourcesGained[key] = (nextResourcesGained[key] ?? 0) + bonusAmount;
        },
      );

      const bossBaseResourcesGained = bossDropResourcesBase ?? {};
      (Object.entries(
        bossBaseResourcesGained,
      ) as Array<[ResourceKey, number]>).forEach(([key, baseAmount]) => {
        if (!baseAmount || baseAmount <= 0) return;
        const adjustedBaseAmount = Math.floor(baseAmount * bossDropMasteryFactor);
        const bonusAmount = Math.floor(
          adjustedBaseAmount *
            effectiveBonusMultiplier *
            streakYieldMultiplier *
            masteryResourceYieldMult *
            pathResourceMult,
        );
        if (bonusAmount <= 0) return;
        realtimeResourcesBonusGained[key] =
          (realtimeResourcesBonusGained[key] ?? 0) + bonusAmount;
        nextResourcesGained[key] = (nextResourcesGained[key] ?? 0) + bonusAmount;
      });

      // Alpha-safe: if the session reports a boss defeat, add a themed boss loot spike
      // using the same field loot tables (existing resources only).
      if (bossDefeated) {
        if (!Object.prototype.hasOwnProperty.call(voidZoneById, zoneId)) {
          // Unknown zone id: skip themed boss spike safely.
          // (Keeps alpha behavior stable under mismatched server payloads.)
        } else {
          const zone = voidZoneById[zoneId as VoidZoneId];
        const rolledBossLoot = rollVoidFieldLoot({
          zoneLootTheme: zone.lootTheme,
          mobId: "realtime-boss",
          isBoss: true,
          seed: `rt-boss-${zoneId}-${resolvedAt}`,
        });
        rolledBossLoot.forEach((line) => {
          const amt = Math.floor(
            line.amount * masteryResourceYieldMult * pathResourceMult,
          );
          if (amt <= 0) return;
          realtimeResourcesBonusGained[line.resource] =
            (realtimeResourcesBonusGained[line.resource] ?? 0) + amt;
          nextResourcesGained[line.resource] =
            (nextResourcesGained[line.resource] ?? 0) + amt;
        });
        }
      }

      const rankState = applyRankXp(
        state.player.rankLevel,
        state.player.rankXp,
        realtimeRankXpBonusGained,
      );

      const nextPlayerAfterBonus = {
        ...state.player,
        ...rankState,
        masteryProgress: clamp(
          state.player.masteryProgress +
            realtimeMasteryProgressBonusGained,
          0,
          100,
        ),
        influence: Math.max(
          0,
          state.player.influence + realtimeInfluenceBonusGained,
        ),
        resources: addPartialResources(
          state.player.resources,
          realtimeResourcesBonusGained,
        ),
        behaviorStats: nextBehaviorStats,
        zoneMastery: nextZoneMastery,
        lastCompletedZoneId: nextLastCompletedZoneId,
        zoneRunStreak: nextZoneRunStreak,
        // Bonus is fully applied; tear down shard binding so the global WS can close.
        voidRealtimeBinding: null,
        navigation: buildNavigationState(
          rankState.rankLevel,
          state.player.unlockedRoutes,
          state.player.navigation.currentRoute,
        ),
        lastHuntResult: {
          ...latest,
          bossDefeated: bossDefeated ?? latest.bossDefeated ?? false,
          kills: mobsKilledForIdentity,
          damage: totalDamageForIdentity,
          realtimeContributionBonusMultiplier: effectiveBonusMultiplier,
          realtimeContributionAppliedForResolvedAt: resolvedAt,
          realtimeRankXpBonusGained,
          realtimeMasteryProgressBonusGained,
          realtimeInfluenceBonusGained,
          realtimeResourcesBonusGained,
          realtimeTotalDamageDealt:
            totalDamageDealt ?? latest.realtimeTotalDamageDealt ?? 0,
          realtimeTotalHitsLanded:
            totalHitsLanded ?? latest.realtimeTotalHitsLanded ?? 0,
          realtimeMobsContributedTo:
            mobsContributedTo ?? latest.realtimeMobsContributedTo ?? 0,
          realtimeMobsKilled: mobsKilled ?? latest.realtimeMobsKilled ?? 0,
          realtimeExposedKills: exposedKills ?? latest.realtimeExposedKills ?? 0,
          rankXpGained: baseRankXpGained + realtimeRankXpBonusGained,
          masteryProgressGained:
            baseMasteryProgressGained + realtimeMasteryProgressBonusGained,
          influenceGained: baseInfluenceGained + realtimeInfluenceBonusGained,
          resourcesGained: nextResourcesGained,
        },
      };

      const rtGuildIntensity = huntIntensityFromRealtimeTotals({
        totalDamageDealt: totalDamageForIdentity,
        mobsKilled: mobsKilledForIdentity,
        exposedKills: exposedKills ?? latest.realtimeExposedKills ?? 0,
      });
      const supplementalBase = clamp(
        Math.floor(guildPointsFromIntensity(rtGuildIntensity) * 0.5),
        2,
        10,
      );
      const { delta: supplementalGuild, reasonTags: rtGuildTags } =
        applyTheaterGuildBonusesToBase(
          state.player,
          zoneId,
          supplementalBase,
          resolvedAt,
        );
      const rtGuildReason =
        rtGuildTags.length > 0
          ? `Realtime void field · ${rtGuildTags.join(", ")}`
          : "Realtime void field";
      const playerAfterRealtimeGuild =
        supplementalGuild > 0
          ? appendGuildLedgerEntry(nextPlayerAfterBonus, {
              amount: supplementalGuild,
              reason: rtGuildReason,
              at: resolvedAt,
            })
          : nextPlayerAfterBonus;

      return {
        ...state,
        player: playerAfterRealtimeGuild,
      };
    }

    case "START_EXPLORATION_PROCESS": {
      if (state.player.activeProcess !== null) {
        return state;
      }

      const startedAt = action.payload.startedAt ?? Date.now();

      if (action.payload.endsAt <= startedAt) {
        return state;
      }

      const processKind = action.payload.kind ?? "exploration";
      const explorationSurcharge =
        processKind === "exploration"
          ? getExplorationInstabilitySurchargeCredits(
              state.player.voidInstability,
            )
          : 0;

      if (
        explorationSurcharge > 0 &&
        state.player.resources.credits < explorationSurcharge
      ) {
        return state;
      }

      const resourcesAfterTithe =
        explorationSurcharge > 0
          ? updateSingleResource(
              state.player.resources,
              "credits",
              -explorationSurcharge,
            )
          : state.player.resources;

      return {
        ...state,
        player: {
          ...state.player,
          resources: resourcesAfterTithe,
          activeProcess: {
            id: action.payload.id,
            kind: processKind,
            status: "running",
            title: action.payload.title,
            sourceId: action.payload.sourceId ?? null,
            startedAt,
            endsAt: action.payload.endsAt,
          },
          fieldLootGainedThisRun:
            processKind === "hunt" ? {} : state.player.fieldLootGainedThisRun,
        },
      };
    }

    case "RESOLVE_ACTIVE_PROCESS": {
      const now = action.payload?.now ?? Date.now();
      const player = applySurvivalDecay(state.player, now);
      const activeProcess = player.activeProcess;

      if (!activeProcess || activeProcess.status === "complete") {
        return {
          ...state,
          player,
        };
      }

      if (now < activeProcess.endsAt) {
        return {
          ...state,
          player,
        };
      }

      return {
        ...state,
        player: {
          ...player,
          activeProcess: {
            ...activeProcess,
            status: "complete",
          },
        },
      };
    }

    case "CLAIM_EXPLORATION_REWARD": {
      const now = Date.now();
      const player = applySurvivalDecay(state.player, now);
      const activeProcess = player.activeProcess;

      if (
        !activeProcess ||
        activeProcess.kind !== "exploration" ||
        activeProcess.status !== "complete"
      ) {
        return {
          ...state,
          player,
        };
      }

      const nextPlayer = applyActivityHungerCost(
        applyMissionRewardWithVoidStrain(
          player,
          phase1ExplorationReward,
          "neutral",
        ),
        "exploration",
      );

      return {
        ...state,
        player: {
          ...nextPlayer,
          activeProcess: null,
          hasBiotechSpecimenLead: true,
        },
      };
    }

    case "CLEAR_ACTIVE_PROCESS":
      if (state.player.activeProcess === null) {
        return state;
      }

      return {
        ...state,
        player: {
          ...state.player,
          activeProcess: null,
        },
      };

    case "SET_MASTERY_PROGRESS":
      return {
        ...state,
        player: {
          ...state.player,
          masteryProgress: clamp(action.payload, 0, 100),
        },
      };

    case "QUEUE_MISSION": {
      const missionQueue = Array.isArray(state.player.missionQueue)
        ? state.player.missionQueue
        : [];

      const queuedAt = action.payload.queuedAt ?? Date.now();
      const queueGate = getDoctrineQueueGate(state.player, queuedAt);
      if (!queueGate.canQueue) {
        return state;
      }

      const mission = getMissionById(state.missions, action.payload.missionId);
      if (!mission) return state;

      const selectedPath =
        state.player.factionAlignment === "unbound"
          ? "unbound"
          : state.player.factionAlignment;

      if (!canAccessMission(mission, selectedPath)) {
        return state;
      }

      if (!isCanonBookMissionUnlocked(mission.canonBook)) {
        return state;
      }

      const lastEntry = missionQueue[missionQueue.length - 1] ?? null;
      const anchorTime = lastEntry
        ? Math.max(queuedAt, lastEntry.endsAt)
        : queuedAt;

      const nextEntry = buildMissionQueueEntry({
        mission,
        queuedAt,
        anchorTime,
        player: state.player,
      });

      const queuedPlayer: PlayerState = {
        ...state.player,
        missionQueue: [...missionQueue, nextEntry],
      };

      return {
        ...state,
        player: syncMirroredHuntActiveProcess(
          queuedPlayer,
          queuedPlayer.missionQueue,
          state.missions,
          queuedAt,
        ),
      };
    }

    case "REMOVE_QUEUED_MISSION": {
      const missionQueue = Array.isArray(state.player.missionQueue)
        ? state.player.missionQueue
        : [];

      const removedAt = action.payload.removedAt ?? Date.now();

      const filteredQueue = missionQueue.filter(
        (entry) => entry.queueId !== action.payload.queueId,
      );

      if (filteredQueue.length === missionQueue.length) {
        return state;
      }

      const rebuiltQueue = rebuildMissionQueueSchedule({
        queue: filteredQueue,
        missions: state.missions,
        now: removedAt,
        player: state.player,
      });

      const removedPlayer: PlayerState = {
        ...state.player,
        missionQueue: rebuiltQueue,
      };

      return {
        ...state,
        player: syncMirroredHuntActiveProcess(
          removedPlayer,
          removedPlayer.missionQueue,
          state.missions,
          removedAt,
        ),
      };
    }

    case "PROCESS_MISSION_QUEUE":
      return processMissionQueue(state, action.payload.now);

    case "CLAIM_MISSION": {
      const missionQueue = Array.isArray(state.player.missionQueue)
        ? state.player.missionQueue
        : [];

      const claimIndex = missionQueue.findIndex(
        (entry) => entry.queueId === action.payload.queueId,
      );

      if (claimIndex === -1) {
        return state;
      }

      const entry = missionQueue[claimIndex];

      if (entry.completedAt === null) {
        return state;
      }

      const mission = getMissionById(state.missions, entry.missionId);
      if (!mission) {
        return {
          ...state,
          player: {
            ...state.player,
            missionQueue: missionQueue.filter(
              (queueEntry) => queueEntry.queueId !== entry.queueId,
            ),
          },
        };
      }

      const rewardWithPathMastery = applyPathAlignedMasteryBonus(
        mission.reward,
        mission.path,
        state.player.factionAlignment,
      );
      const nextPlayer = applyActivityHungerCost(
        applyMissionRewardWithVoidStrain(
          state.player,
          rewardWithPathMastery,
          mission.path,
        ),
        mission.category === "hunting-ground" ? "hunt" : "mission",
      );
      const nextQueue = missionQueue.filter(
        (queueEntry) => queueEntry.queueId !== entry.queueId,
      );

      return {
        ...state,
        player: {
          ...nextPlayer,
          missionQueue: nextQueue,
        },
      };
    }

    case "ADD_RECIPE":
      if (state.player.knownRecipes.includes(action.payload)) return state;

      return {
        ...state,
        player: {
          ...state.player,
          knownRecipes: [...state.player.knownRecipes, action.payload],
        },
      };

    case "INSTALL_MINOR_RUNE": {
      const r = tryInstallMinorRune(state.player, action.payload.school);
      if (!r.ok) return state;
      return { ...state, player: r.player };
    }

    case "UNLOCK_ROUTE": {
      if (state.player.unlockedRoutes.includes(action.payload)) return state;

      const nextUnlockedRoutes = [
        ...state.player.unlockedRoutes,
        action.payload,
      ];

      return {
        ...state,
        player: {
          ...state.player,
          unlockedRoutes: nextUnlockedRoutes,
          navigation: buildNavigationState(
            state.player.rankLevel,
            nextUnlockedRoutes,
            state.player.navigation.currentRoute,
          ),
        },
      };
    }

    case "SET_CURRENT_ROUTE": {
      const availableRoutes = getAvailableRoutes(
        state.player.rankLevel,
        state.player.unlockedRoutes,
      );

      if (!availableRoutes.includes(action.payload)) {
        return state;
      }

      return {
        ...state,
        player: {
          ...state.player,
          navigation: {
            ...state.player.navigation,
            currentRoute: action.payload,
            availableRoutes,
          },
        },
      };
    }

    case "REFRESH_AVAILABLE_ROUTES":
      return {
        ...state,
        player: {
          ...state.player,
          navigation: buildNavigationState(
            state.player.rankLevel,
            state.player.unlockedRoutes,
            state.player.navigation.currentRoute,
          ),
        },
      };

    case "ADD_INFLUENCE":
      return {
        ...state,
        player: {
          ...state.player,
          influence: Math.max(0, state.player.influence + action.payload),
        },
      };

    case "ATTEMPT_MYTHIC_UNLOCK": {
      const p = state.player;
      if (action.payload === "l3-rare-rune-set") {
        if (!canUnlockL3RareRuneSet(p)) return state;
        let res = updateSingleResource(p.resources, "ironHeart", -1);
        res = updateSingleResource(res, "runeDust", -30);
        return {
          ...state,
          player: {
            ...p,
            resources: res,
            mythicAscension: {
              ...p.mythicAscension,
              l3RareRuneSetUnlocked: true,
            },
          },
        };
      }
      if (action.payload === "rune-crafter-license") {
        if (!canGrantRuneCrafterLicense(p)) return state;
        const res = updateSingleResource(p.resources, "ironHeart", -2);
        return {
          ...state,
          player: {
            ...p,
            resources: res,
            mythicAscension: {
              ...p.mythicAscension,
              runeCrafterLicense: true,
            },
          },
        };
      }
      if (action.payload === "convergence-prime") {
        if (!canPrimeConvergence(p)) return state;
        return {
          ...state,
          player: {
            ...p,
            mythicAscension: {
              ...p.mythicAscension,
              convergencePrimed: true,
            },
          },
        };
      }
      return state;
    }

    case "REDEEM_RUNE_KNIGHT_VALOR": {
      const p = state.player;
      const m = p.mythicAscension;
      if (!m.convergencePrimed) return state;

      if (action.payload === "mastery-boon") {
        const cost = 5;
        if (m.runeKnightValor < cost) return state;
        return {
          ...state,
          player: {
            ...p,
            masteryProgress: p.masteryProgress + 12,
            mythicAscension: {
              ...m,
              runeKnightValor: m.runeKnightValor - cost,
            },
          },
        };
      }

      if (action.payload === "influence-seal") {
        const cost = 3;
        if (m.runeKnightValor < cost) return state;
        return {
          ...state,
          player: {
            ...p,
            influence: Math.max(0, p.influence + 2),
            mythicAscension: {
              ...m,
              runeKnightValor: m.runeKnightValor - cost,
            },
          },
        };
      }

      if (action.payload === "ivory-prestige-rite") {
        const valorCost = 4;
        const creditsCost = 120;
        if (m.runeKnightValor < valorCost) return state;
        if ((p.resources.credits ?? 0) < creditsCost) return state;
        return {
          ...state,
          player: {
            ...p,
            resources: updateSingleResource(p.resources, "credits", -creditsCost),
            condition: clamp(p.condition + 15, 0, 100),
            mythicAscension: {
              ...m,
              runeKnightValor: m.runeKnightValor - valorCost,
            },
          },
        };
      }

      if (action.payload === "arena-edge-sigil") {
        const cost = 2;
        if (m.runeKnightValor < cost) return state;
        return {
          ...state,
          player: {
            ...p,
            mythicAscension: {
              ...m,
              runeKnightValor: m.runeKnightValor - cost,
              arenaEdgeSigils: Math.min(12, m.arenaEdgeSigils + 1),
            },
          },
        };
      }

      return state;
    }

    case "CONSUME_ARENA_EDGE_SIGIL": {
      const p = state.player;
      const m = p.mythicAscension;
      if (m.arenaEdgeSigils <= 0) return state;
      return {
        ...state,
        player: {
          ...p,
          mythicAscension: {
            ...m,
            arenaEdgeSigils: m.arenaEdgeSigils - 1,
          },
        },
      };
    }

    case "CLAIM_FACTION_HQ_STIPEND": {
      const now = Date.now();
      const p = state.player;
      if (p.factionAlignment === "unbound") return state;
      if (now - p.lastFactionHqStipendAt < FACTION_HQ_STIPEND_COOLDOWN_MS) {
        return state;
      }
      const { credits, influence: infGain } = computeFactionHqStipend(p);
      return {
        ...state,
        player: {
          ...p,
          lastFactionHqStipendAt: now,
          resources: addPartialResources(p.resources, { credits }),
          influence: Math.max(0, p.influence + infGain),
        },
      };
    }

    case "GUILD_CREATE": {
      const p = state.player;
      if (p.guild.kind === "inGuild") return state;
      return {
        ...state,
        player: {
          ...p,
          guild: createGuild(p, action.payload.guildName),
          guildContracts: [],
        },
      };
    }

    case "GUILD_JOIN": {
      const p = state.player;
      if (p.guild.kind === "inGuild") return state;
      const roster = joinGuildByCode(p, action.payload.guildCode);
      if (!roster) return state;
      return {
        ...state,
        player: {
          ...p,
          guild: roster,
          guildContracts: [],
        },
      };
    }

    case "GUILD_LEAVE": {
      const p = state.player;
      if (p.guild.kind !== "inGuild") return state;
      return {
        ...state,
        player: {
          ...p,
          guild: initialGuildRoster(),
          guildContracts: [],
        },
      };
    }

    case "GUILD_SET_PLEDGE": {
      const p = state.player;
      if (p.guild.kind !== "inGuild") return state;
      const pledge =
        action.payload.pledge === "bio" ||
        action.payload.pledge === "mecha" ||
        action.payload.pledge === "pure"
          ? action.payload.pledge
          : "unbound";
      return {
        ...state,
        player: {
          ...p,
          guild: setGuildPledge(p.guild, pledge),
        },
      };
    }

    case "GUILD_ADD_MEMBER": {
      const p = state.player;
      if (p.guild.kind !== "inGuild") return state;
      return {
        ...state,
        player: {
          ...p,
          guild: addGuildMember(p.guild, action.payload.callsign),
        },
      };
    }

    case "GUILD_REMOVE_MEMBER": {
      const p = state.player;
      if (p.guild.kind !== "inGuild") return state;
      return {
        ...state,
        player: {
          ...p,
          guild: removeGuildMember(p.guild, action.payload.memberId),
        },
      };
    }

    case "GUILD_POST_CONTRACT": {
      const p = state.player;
      const contract = postGuildContract(p, action.payload.templateId);
      if (!contract) return state;
      const existingActive = (p.guildContracts ?? []).some(
        (c) => c.status === "active",
      );
      if (existingActive) return state;
      return {
        ...state,
        player: {
          ...p,
          guildContracts: [contract],
        },
      };
    }

    case "GUILD_CLAIM_CONTRACT": {
      const p = state.player;
      const contracts = p.guildContracts ?? [];
      const idx = contracts.findIndex((c) => c.id === action.payload.contractId);
      if (idx < 0) return state;
      const c = contracts[idx];
      if (c.status === "claimed") return state;
      const pct = getContractProgressPct(p, c);
      if (pct < 100) return state;
      const nextContracts: SharedGuildContract[] = contracts.map((x) =>
        x.id === c.id ? { ...x, status: "claimed" } : x,
      );
      const { accepted } = enforceCapacity(p.resources, c.reward);
      return {
        ...state,
        player: {
          ...p,
          resources: addPartialResources(p.resources, accepted),
          guildContracts: nextContracts,
        },
      };
    }

    case "SET_FORGE_STATUS":
      return {
        ...state,
        player: {
          ...state.player,
          districtState: {
            ...state.player.districtState,
            forgeStatus: action.payload,
          },
        },
      };

    case "SET_ARENA_STATUS":
      return {
        ...state,
        player: {
          ...state.player,
          districtState: {
            ...state.player.districtState,
            arenaStatus: action.payload,
          },
        },
      };

    case "SET_MECHA_STATUS":
      return {
        ...state,
        player: {
          ...state.player,
          districtState: {
            ...state.player.districtState,
            mechaStatus: action.payload,
          },
        },
      };

    case "SET_MUTATION_STATE":
      return {
        ...state,
        player: {
          ...state.player,
          districtState: {
            ...state.player.districtState,
            mutationState: action.payload,
          },
        },
      };

    case "SET_ATTUNEMENT_STATE":
      return {
        ...state,
        player: {
          ...state.player,
          districtState: {
            ...state.player.districtState,
            attunementState: action.payload,
          },
        },
      };

    case "SET_GATE_STATUS":
      return {
        ...state,
        player: {
          ...state.player,
          districtState: {
            ...state.player.districtState,
            gateStatus: action.payload,
          },
        },
      };

    case "RESET_GAME":
      return initialGameState;

    default:
      return state;
  }
}
