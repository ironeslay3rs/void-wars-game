/**
 * Barrel — Task 4.2 Hollowfang Prestige Boss UI.
 *
 * Pure presentational components. Feature screens compose them with backend
 * selectors from `features/hollowfang/` (hollowfangProfile, prepRequirements,
 * encounterResolver, rewardTable).
 */

export { default as PrepCheckCard } from "./PrepCheckCard";
export { default as EncounterBriefCard } from "./EncounterBriefCard";
export { default as EngageConfirmModal } from "./EngageConfirmModal";
export { default as ResultSummaryCard } from "./ResultSummaryCard";

export type { PrepCheckCardProps } from "./PrepCheckCard";
export type { EncounterBriefCardProps } from "./EncounterBriefCard";
export type { EngageConfirmModalProps } from "./EngageConfirmModal";
export type { ResultSummaryCardProps } from "./ResultSummaryCard";
