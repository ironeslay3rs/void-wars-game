import type { VoidZoneId } from "@/features/void-maps/zoneData";

/**
 * Percentage-based hit polygons over the expedition map (same box as the full-bleed image).
 * Selection only — not gameplay traversal geometry.
 */
export type ExpeditionZoneRegion = {
  /** CSS clip-path polygon(...) in % of the map layer */
  hitPolygon: string;
  /** Zone badge / label anchor (percent of map) */
  labelPosition: { left: string; top: string };
};

export const voidExpeditionZoneLayout: Record<VoidZoneId, ExpeditionZoneRegion> =
  {
    "howling-scar": {
      hitPolygon: "polygon(3% 6%, 36% 4%, 40% 46%, 6% 50%)",
      labelPosition: { left: "10%", top: "18%" },
    },
    "ash-relay": {
      hitPolygon: "polygon(28% 32%, 52% 28%, 55% 58%, 26% 62%)",
      labelPosition: { left: "34%", top: "38%" },
    },
    "echo-ruins": {
      hitPolygon: "polygon(48% 18%, 78% 14%, 82% 52%, 50% 56%)",
      labelPosition: { left: "58%", top: "28%" },
    },
    "rift-maw": {
      hitPolygon: "polygon(62% 48%, 97% 44%, 98% 96%, 58% 94%)",
      labelPosition: { left: "72%", top: "62%" },
    },
  };
