/**
 * Barrel — Task 4.4 Offline Dormancy Punishment UI.
 *
 * Pure presentational components. Feature screens compose them with
 * backend selectors from `features/dormancy/` (dormancyTiers,
 * dormancyEffects, dormancyRecovery).
 */

export { default as DormancyStatusCard } from "./DormancyStatusCard";
export type { DormancyStatusCardProps } from "./DormancyStatusCard";

export { default as DormancyReturnModal } from "./DormancyReturnModal";
export type { DormancyReturnModalProps } from "./DormancyReturnModal";
