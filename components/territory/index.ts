/**
 * Barrel for components/territory — Task 4.6 Territory War System UI.
 *
 * Presentational only. All callbacks flow out (onSkirmish, onResolveTick,
 * onRaid, onDismiss). No useGame / dispatch inside any component.
 *
 * Canon: Pure (never Spirit). Territory names surface verbatim from
 * features/territory/territoryRegistry.
 */

export { default as TerritoryMapPanel } from "./TerritoryMapPanel";
export type { TerritoryMapPanelProps } from "./TerritoryMapPanel";

export { default as WarStatusBanner } from "./WarStatusBanner";
export type { WarStatusBannerProps } from "./WarStatusBanner";

export { default as SiegeConsoleModal } from "./SiegeConsoleModal";
export type { SiegeConsoleModalProps } from "./SiegeConsoleModal";

export { default as EconomyPressureReadout } from "./EconomyPressureReadout";
export type { EconomyPressureReadoutProps } from "./EconomyPressureReadout";

export { default as RaidResultSummary } from "./RaidResultSummary";
export type { RaidResultSummaryProps } from "./RaidResultSummary";
