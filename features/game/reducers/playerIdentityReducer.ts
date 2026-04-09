import type { GameAction, GameState } from "@/features/game/gameTypes";
import {
  equipItem,
  sanitizeLoadoutForFaction,
  unequipItem,
} from "@/features/player/loadoutState";
import type { GameReducerResult } from "@/features/game/reducers/sharedReducerUtils";

export function handlePlayerIdentityAction(
  state: GameState,
  action: GameAction,
): GameReducerResult {
  switch (action.type) {
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
          // Switching empires invalidates the old school affinity. The player
          // must re-pick a school within their new empire.
          affinitySchoolId: null,
          loadoutSlots: sanitizeLoadoutForFaction(
            state.player.loadoutSlots,
            action.payload,
          ),
        },
      };

    case "SET_AFFINITY_SCHOOL":
      return {
        ...state,
        player: {
          ...state.player,
          affinitySchoolId: action.payload.schoolId,
        },
      };

    default:
      return null;
  }
}
