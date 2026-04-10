import { getFeastHallOfferById } from "@/features/black-market/feastHallData";
import { getDistrictCraftingCost } from "@/features/crafting-district/craftingProfession";
import { withCraftWorkOrderProgress } from "@/features/economy/craftWorkOrderData";
import type { GameAction, GameState, PlayerState, ResourceKey } from "@/features/game/gameTypes";
import { clamp } from "@/features/game/gameMissionUtils";
import { decayVoidInstabilityOnSurvivalTick } from "@/features/progression/phase3Progression";
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
  MOSS_RATION_CONDITION_RESTORE,
  MOSS_RATION_HUNGER_RESTORE,
  MOSS_RATION_RECIPE_COST,
  SURVIVAL_TICK_INTERVAL_MS,
} from "@/features/status/survival";
import { processStallRentCharges } from "@/features/economy/stallUpkeep";
import { MANA_PER_FEAST_HALL_OFFER } from "@/features/mana/manaTypes";
import type { GameReducerResult } from "@/features/game/reducers/sharedReducerUtils";
import { updateSingleResource } from "@/features/game/reducers/sharedReducerUtils";

export function applySurvivalDecay(player: PlayerState, now: number): PlayerState {
  if (now <= player.lastConditionTickAt) {
    return player;
  }

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

export function handleSurvivalAction(
  state: GameState,
  action: GameAction,
): GameReducerResult {
  switch (action.type) {
    case "ADJUST_CONDITION":
      return {
        ...state,
        player: {
          ...state.player,
          condition: clamp(state.player.condition + action.payload, 0, 100),
        },
      };

    case "ADJUST_HUNGER":
      return {
        ...state,
        player: {
          ...state.player,
          hunger: clamp(state.player.hunger + action.payload, 0, 100),
        },
      };

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
          // Foundation mana grant: every Feast Hall plate restores a small
          // amount of mana on top of the condition gain. Caps at manaMax.
          mana: clamp(
            player.mana + MANA_PER_FEAST_HALL_OFFER,
            0,
            player.manaMax,
          ),
        },
      };
    }

    default:
      return null;
  }
}
