import { quoteVoidMarketBuy, quoteVoidMarketSell, VOID_MARKET_COMMODITIES } from "@/features/bazaar/voidMarketEconomy";
import { craftItem } from "@/features/crafting/craftActions";
import { getDistrictCraftingCost } from "@/features/crafting-district/craftingProfession";
import { getNextRunModifierDefinitionById } from "@/features/crafting-district/nextRunModifiersData";
import { craftRecipes } from "@/features/crafting/recipeData";
import {
  getCraftWorkOrderById,
  withCraftWorkOrderProgress,
} from "@/features/economy/craftWorkOrderData";
import { addPartialResources, clamp } from "@/features/game/gameMissionUtils";
import type { GameAction, GameState, ResourceKey } from "@/features/game/gameTypes";
import { getBrokerInteraction } from "@/features/lore/brokerInteractionData";
import { computeFactionHqStipend, FACTION_HQ_STIPEND_COOLDOWN_MS } from "@/features/factions/factionWorldLogic";
import { getVoidMarketWarAdjustments } from "@/features/factions/warEconomy";
import { applyMarketBuy, applyMarketSell } from "@/features/market/marketActions";
import {
  RUN_INSTABILITY_DELTA_GRAY_TRADE,
  bumpRunInstability,
} from "@/features/progression/runInstability";
import { enforcePickup } from "@/features/resources/inventoryLogic";
import {
  getStallArrearsPayoffTotal,
} from "@/features/economy/stallUpkeep";
import type { GameReducerResult } from "@/features/game/reducers/sharedReducerUtils";
import { updateSingleResource } from "@/features/game/reducers/sharedReducerUtils";

export function handleEconomyAction(
  state: GameState,
  action: GameAction,
): GameReducerResult {
  switch (action.type) {
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

    case "STRIKE_BLACK_MARKET_DEAL": {
      // Atomic Black Market deal — single dispatch replaces the
      // hand-wired ADD_RESOURCE / ADJUST_CONDITION / ADJUST_HUNGER
      // chains the 4 district lanes (Ivory / Mirror / Silent / Velvet)
      // used to ship before. Costs and grants are EXPECTED to be
      // post-institutional-mult (the screen is the policy layer).
      //
      // Reducer responsibilities:
      //   1. Verify the player can afford every cost key (fail-soft).
      //   2. Subtract costs and add grants in one state update.
      //   3. Apply condition / hunger deltas with clamps to [0,100].
      //   4. No-op if costs are invalid (negative, fractional after floor).
      const { costs, resourceGains, conditionGain, hungerGain } =
        action.payload;

      // Affordability gate
      for (const [key, amount] of Object.entries(costs) as Array<
        [ResourceKey, number | undefined]
      >) {
        if (typeof amount !== "number" || amount <= 0) continue;
        if ((state.player.resources[key] ?? 0) < amount) {
          return state;
        }
      }

      let nextResources = { ...state.player.resources };
      // Subtract costs
      for (const [key, amount] of Object.entries(costs) as Array<
        [ResourceKey, number | undefined]
      >) {
        if (typeof amount !== "number" || amount <= 0) continue;
        nextResources = updateSingleResource(nextResources, key, -amount);
      }
      // Add grants
      if (resourceGains) {
        for (const [key, amount] of Object.entries(resourceGains) as Array<
          [ResourceKey, number | undefined]
        >) {
          if (typeof amount !== "number" || amount <= 0) continue;
          nextResources = updateSingleResource(nextResources, key, amount);
        }
      }

      const nextCondition =
        typeof conditionGain === "number" && conditionGain !== 0
          ? clamp(state.player.condition + conditionGain, 0, 100)
          : state.player.condition;
      const nextHunger =
        typeof hungerGain === "number" && hungerGain !== 0
          ? clamp(state.player.hunger + hungerGain, 0, 100)
          : state.player.hunger;

      return {
        ...state,
        player: {
          ...state.player,
          resources: nextResources,
          condition: nextCondition,
          hunger: nextHunger,
        },
      };
    }

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
      const lastCraftOutcome =
        result.ok === false
          ? {
              at: Date.now(),
              recipeId: result.recipeId,
              recipeName: result.recipeName,
              ok: false,
              success: null,
              detail: result.reason,
            }
          : {
              at: Date.now(),
              recipeId: result.recipeId,
              recipeName: result.recipeName,
              ok: true,
              success: result.success,
              detail: result.message,
            };
      return {
        ...state,
        player: {
          ...player,
          lastCraftOutcome,
        },
      };
    }

    case "CLEAR_LAST_CRAFT_OUTCOME":
      return {
        ...state,
        player: {
          ...state.player,
          lastCraftOutcome: null,
        },
      };

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
          nextRunModifiers: def.modifiers,
          nextRunModifiersAppliedForProcessId: null,
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
          player: bumpRunInstability(
            {
              ...player,
              resources: res,
            },
            RUN_INSTABILITY_DELTA_GRAY_TRADE,
            "Void market buy — brokers log the lane.",
          ),
        };
      }
      if (player.resources[commodity] < n) {
        return state;
      }
      const sellQ = quoteVoidMarketSell(
        n,
        commodity,
        player.careerFocus,
      );
      const warSell = getVoidMarketWarAdjustments(player);
      const netCredits = Math.floor(sellQ.netCredits * warSell.sellMult);
      let res = updateSingleResource(player.resources, commodity, -n);
      res = updateSingleResource(res, "credits", netCredits);
      return {
        ...state,
        player: bumpRunInstability(
          {
            ...player,
            resources: res,
          },
          RUN_INSTABILITY_DELTA_GRAY_TRADE,
          "Void market sell — salvage flagged on the rim.",
        ),
      };
    }

    case "ADD_INFLUENCE":
      return {
        ...state,
        player: {
          ...state.player,
          influence: Math.max(0, state.player.influence + action.payload),
        },
      };

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

    case "ADJUST_BROKER_RAPPORT": {
      const { brokerId, delta } = action.payload;
      if (!delta) return state;
      const current = state.player.brokerRapport[brokerId] ?? 0;
      const next = Math.max(0, Math.min(100, current + delta));
      // Always advance lastContactAt on engagement — the player
      // touching the broker in any way counts as contact for decay.
      return {
        ...state,
        player: {
          ...state.player,
          brokerRapport:
            next === current
              ? state.player.brokerRapport
              : {
                  ...state.player.brokerRapport,
                  [brokerId]: next,
                },
          brokerLastContactAt: {
            ...state.player.brokerLastContactAt,
            [brokerId]: Date.now(),
          },
        },
      };
    }

    case "GRANT_BROKER_DIALOGUE_UNLOCK": {
      const { brokerId, unlockKey } = action.payload;
      const existing = state.player.brokerDialogueUnlocks[brokerId] ?? [];
      if (existing.includes(unlockKey)) return state;
      return {
        ...state,
        player: {
          ...state.player,
          brokerDialogueUnlocks: {
            ...state.player.brokerDialogueUnlocks,
            [brokerId]: [...existing, unlockKey],
          },
          brokerLastContactAt: {
            ...state.player.brokerLastContactAt,
            [brokerId]: Date.now(),
          },
        },
      };
    }

    case "BROKER_INTERACT": {
      const brokerId = action.payload.brokerId;
      const interaction = getBrokerInteraction(brokerId);
      if (!interaction) return state;
      const p = state.player;
      if (p.resources.credits < interaction.cost) return state;
      const now = Date.now();
      const lastUsed = p.brokerCooldowns[brokerId] ?? 0;
      if (interaction.cooldownMs > 0 && now - lastUsed < interaction.cooldownMs) return state;
      let nextResources = { ...p.resources, credits: p.resources.credits - interaction.cost };
      let nextCondition = p.condition;
      let nextInstability = p.runInstability;
      const eff = interaction.effect;
      if (eff.kind === "grant_resource") {
        nextResources = { ...nextResources, [eff.resourceKey]: (nextResources[eff.resourceKey] ?? 0) + eff.amount };
      } else if (eff.kind === "restore_condition") {
        nextCondition = Math.min(100, p.condition + eff.amount);
      } else if (eff.kind === "reduce_instability") {
        nextInstability = Math.max(0, p.runInstability - eff.amount);
      }
      // "show_tip" effect has no state change — tip is selected in the UI
      return {
        ...state,
        player: {
          ...p,
          resources: nextResources,
          condition: nextCondition,
          runInstability: nextInstability,
          brokerCooldowns: { ...p.brokerCooldowns, [brokerId]: now },
          brokerLastContactAt: {
            ...p.brokerLastContactAt,
            [brokerId]: now,
          },
        },
      };
    }

    default:
      return null;
  }
}
