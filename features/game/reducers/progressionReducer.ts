import type { GameAction, GameState } from "@/features/game/gameTypes";
import {
  applyRankXp,
  clamp,
  getRankName,
  getXpToNext,
} from "@/features/game/gameMissionUtils";
import {
  buildNavigationState,
  getAvailableRoutes,
} from "@/features/navigation/navigationUtils";
import {
  canGrantRuneCrafterLicense,
  canPrimeConvergence,
  canUnlockL3RareRuneSet,
} from "@/features/progression/mythicAscensionLogic";
import { tryInstallMinorRune } from "@/features/mastery/runeMasteryLogic";
import { getPrimaryRuneSchool } from "@/features/mastery/runeMasteryTypes";
import { applyCrossSchoolExposureToPlayer } from "@/features/convergence/convergenceSeed";
import { getPharosConclaveRegistryFee } from "@/features/institutions/institutionalPressure";
import {
  MANA_HYBRID_INSTALL_COST_BASE,
  MANA_HYBRID_INSTALL_COST_PURE,
} from "@/features/mana/manaTypes";
import type { GameReducerResult } from "@/features/game/reducers/sharedReducerUtils";
import { updateSingleResource } from "@/features/game/reducers/sharedReducerUtils";

function getManaHybridInstallCostForPlayer(
  faction: GameState["player"]["factionAlignment"],
): number {
  return faction === "pure"
    ? MANA_HYBRID_INSTALL_COST_PURE
    : MANA_HYBRID_INSTALL_COST_BASE;
}

export function handleProgressionAction(
  state: GameState,
  action: GameAction,
): GameReducerResult {
  switch (action.type) {
    case "SET_CAREER_FOCUS":
      return {
        ...state,
        player: {
          ...state.player,
          careerFocus: action.payload,
        },
      };

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

    case "SET_MASTERY_PROGRESS":
      return {
        ...state,
        player: {
          ...state.player,
          masteryProgress: clamp(action.payload, 0, 100),
        },
      };

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
      const school = action.payload.school;
      const r = tryInstallMinorRune(state.player, school);
      const at = Date.now();
      if (!r.ok) {
        return {
          ...state,
          player: {
            ...state.player,
            lastRuneInstallOutcome: { at, school, ok: false, reason: r.reason },
          },
        };
      }
      const newDepth = r.player.runeMastery.depthBySchool[school];
      const nextState: GameState = {
        ...state,
        player: {
          ...r.player,
          lastRuneInstallOutcome: { at, school, ok: true, newDepth },
        },
      };
      // Silent convergence seed: track cross-school rune installs.
      nextState.player = applyCrossSchoolExposureToPlayer(nextState, school);
      return nextState;
    }

    case "MANA_INSTALL_MINOR_RUNE": {
      // Mana-funded rune install — pays the standard capacity cost AND a
      // mana surcharge, in exchange for absorbing the hybrid drain stack
      // bump that off-primary installs would normally incur. Pure-aligned
      // operatives pay the cheapest mana rate (canonical "memory" school).
      const school = action.payload.school;
      const at = Date.now();
      const manaCost = getManaHybridInstallCostForPlayer(
        state.player.factionAlignment,
      );

      // Affordance check first — fail-soft if mana is short.
      if (state.player.mana < manaCost) {
        return {
          ...state,
          player: {
            ...state.player,
            lastRuneInstallOutcome: {
              at,
              school,
              ok: false,
              reason: `Need ${manaCost} mana to soak the hybrid drain.`,
            },
          },
        };
      }

      // Snapshot pre-install hybrid drain stacks so we can detect whether
      // the install would have bumped them.
      const drainBefore = state.player.runeMastery.hybridDrainStacks;
      const primary = getPrimaryRuneSchool(state.player.factionAlignment);
      const isHybridInstall = primary !== null && school !== primary;

      const r = tryInstallMinorRune(state.player, school);
      if (!r.ok) {
        return {
          ...state,
          player: {
            ...state.player,
            lastRuneInstallOutcome: { at, school, ok: false, reason: r.reason },
          },
        };
      }

      // Install succeeded. Spend the mana surcharge and roll back the
      // hybrid drain bump if this was an off-primary install.
      const drainAfter = r.player.runeMastery.hybridDrainStacks;
      const drainSoak =
        isHybridInstall && drainAfter > drainBefore
          ? {
              ...r.player.runeMastery,
              hybridDrainStacks: drainBefore,
            }
          : r.player.runeMastery;

      const newDepth = r.player.runeMastery.depthBySchool[school];
      const nextState: GameState = {
        ...state,
        player: {
          ...r.player,
          mana: state.player.mana - manaCost,
          runeMastery: drainSoak,
          lastRuneInstallOutcome: { at, school, ok: true, newDepth },
        },
      };
      // Silent convergence seed still fires for cross-school installs.
      nextState.player = applyCrossSchoolExposureToPlayer(nextState, school);
      return nextState;
    }

    case "RECORD_CROSS_SCHOOL_EVENT": {
      const nextPlayer = applyCrossSchoolExposureToPlayer(
        state,
        action.payload.school,
      );
      if (nextPlayer === state.player) return state;
      return { ...state, player: nextPlayer };
    }

    case "CLEAR_LAST_RUNE_INSTALL_OUTCOME":
      return {
        ...state,
        player: {
          ...state.player,
          lastRuneInstallOutcome: null,
        },
      };

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

    case "ATTEMPT_MYTHIC_UNLOCK": {
      const p = state.player;
      const now = Date.now();
      if (action.payload === "l3-rare-rune-set") {
        if (!canUnlockL3RareRuneSet(p)) return state;
        let res = updateSingleResource(p.resources, "ironHeart", -1);
        res = updateSingleResource(res, "runeDust", -30);
        return {
          ...state,
          player: {
            ...p,
            resources: res,
            masteryProgress: p.masteryProgress + 10,
            mythicAscension: {
              ...p.mythicAscension,
              l3RareRuneSetUnlocked: true,
            },
            lastMythicGateBreakthrough: {
              at: now,
              gate: "l3-rare-rune-set",
              headline: "OBSIDIAN LATTICE ACCEPTED — L3 RARE RUNE CYCLE UNLOCKED.",
              detail:
                "The forge reads your tithe. +10 mastery progress — restricted recipes and the Crafter path are now in play.",
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
            masteryProgress: p.masteryProgress + 12,
            influence: Math.max(0, p.influence + 1),
            mythicAscension: {
              ...p.mythicAscension,
              runeCrafterLicense: true,
            },
            lastMythicGateBreakthrough: {
              at: now,
              gate: "rune-crafter-license",
              headline:
                "RUNE CRAFTER LICENSE STAMPED — CENTRAL COMMAND RECOGNISES YOUR BINDINGS.",
              detail:
                "+12 mastery progress, +1 influence — hybrid filings and convergence prep unlock.",
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
            masteryProgress: p.masteryProgress + 20,
            mythicAscension: {
              ...p.mythicAscension,
              convergencePrimed: true,
            },
            lastMythicGateBreakthrough: {
              at: now,
              gate: "convergence-prime",
              headline: "CONVERGENCE FILED — HYBRID RESONANCE ON YOUR REGISTRY ROW.",
              detail:
                "+20 mastery progress — field loot posture improves; Knight valor and prestige spends go live.",
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
        // Pharos Conclave registry surcharge — flat fee on top of the
        // base 120 credit prestige price. Mecha-aligned operatives pay
        // the cheapest registry fee (the Conclave is their institution).
        const baseCreditsCost = 120;
        const conclaveRegistryFee = getPharosConclaveRegistryFee(
          p.factionAlignment,
        );
        const creditsCost = baseCreditsCost + conclaveRegistryFee;
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

    default:
      return null;
  }
}
