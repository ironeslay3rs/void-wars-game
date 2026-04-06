import { addPartialResources } from "@/features/game/gameMissionUtils";
import type { GameAction, GameState } from "@/features/game/gameTypes";
import {
  addGuildMember,
  createGuild,
  getContractProgressPct,
  initialGuildRoster,
  joinGuildByCode,
  postGuildContract,
  removeGuildMember,
  setGuildPledge,
} from "@/features/social/guildLiveLogic";
import type { SharedGuildContract } from "@/features/social/guildLiveTypes";
import { enforceCapacity } from "@/features/resources/inventoryLogic";
import {
  RUN_INSTABILITY_DELTA_GUILD_CLAIM,
  bumpRunInstability,
} from "@/features/progression/runInstability";
import type { GameReducerResult } from "@/features/game/reducers/sharedReducerUtils";

export function handleSocialAction(
  state: GameState,
  action: GameAction,
): GameReducerResult {
  switch (action.type) {
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
        player: bumpRunInstability(
          {
            ...p,
            resources: addPartialResources(p.resources, accepted),
            guildContracts: nextContracts,
          },
          RUN_INSTABILITY_DELTA_GUILD_CLAIM,
          "Guild contract paid out — collective heat rises.",
        ),
      };
    }

    default:
      return null;
  }
}
