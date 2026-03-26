import type { FactionAlignment, ResourceKey } from "@/features/game/gameTypes";
import type { VoidZoneId } from "@/features/void-maps/zoneData";

export type GuildRole = "Founder" | "Officer" | "Member";

export type GuildMember = {
  id: string;
  callsign: string;
  role: GuildRole;
  joinedAt: number;
};

export type GuildPledge = Exclude<FactionAlignment, "unbound"> | "unbound";

export type GuildRosterState =
  | { kind: "none" }
  | {
      kind: "inGuild";
      guildId: string;
      guildCode: string;
      guildName: string;
      pledge: GuildPledge;
      rivalGuildId: string | null;
      members: GuildMember[];
    };

export type GuildContractStatus = "active" | "claimed";

export type SharedGuildContract = {
  id: string;
  templateId: string;
  zoneId: VoidZoneId;
  title: string;
  description: string;
  postedAt: number;
  /** Progress is derived from mercenary contribution deltas. */
  startContribution: number;
  targetContributionDelta: number;
  status: GuildContractStatus;
  reward: Partial<Record<ResourceKey, number>>;
};

export type LocalGuildRivalSnapshot = {
  guildId: string;
  guildName: string;
  pledge: GuildPledge;
  contribution: number;
};

