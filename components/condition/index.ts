/**
 * Barrel — Task 3.6 Corruption & Condition Consequences UI.
 *
 * These are pure presentational components. Feature screens compose them
 * with backend selectors from `features/condition/` (corruptionEngine,
 * consequenceTable, mismatchSystem).
 */

export { default as CorruptionGauge } from "./CorruptionGauge";
export { default as ConsequenceSummaryCard } from "./ConsequenceSummaryCard";
export { default as MismatchWarningBanner } from "./MismatchWarningBanner";
