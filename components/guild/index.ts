/**
 * Guild UI barrel — presentational components for Task 4.5.
 *
 * All components are props-in / callbacks-out. No useGame or dispatch
 * inside this directory. Host screens (routes under app/guild/) wire
 * these to features/guild/ actions.
 */

export { default as GuildOverviewCard } from "./GuildOverviewCard";
export type { GuildOverviewCardProps } from "./GuildOverviewCard";

export { default as GuildRosterPanel } from "./GuildRosterPanel";
export type { GuildRosterPanelProps } from "./GuildRosterPanel";

export { default as SharedContractsPanel } from "./SharedContractsPanel";
export type { SharedContractsPanelProps } from "./SharedContractsPanel";

export { default as ContractDetailModal } from "./ContractDetailModal";
export type { ContractDetailModalProps } from "./ContractDetailModal";
