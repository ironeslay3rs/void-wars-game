export const FIELD_TILE_SIZE_PX = 24;
export const FIELD_WIDTH_TILES = 32;
export const FIELD_HEIGHT_TILES = 32;

export type FieldZoneId =
  | "howling-scar"
  | "ash-relay"
  | "echo-ruins"
  | "rift-maw";

export type FieldZoneDefinition = {
  id: FieldZoneId;
  name: string;
  tierLabel: string;
  width: number;
  height: number;
  defaultSpawn: { x: number; y: number };
  extractionTiles: Array<{ x: number; y: number }>;
  obstacleTiles: Array<{ x: number; y: number }>;
  timerSeconds: number;
  encounters: number;
};

export const FIELD_ZONES: Record<FieldZoneId, FieldZoneDefinition> = {
  "howling-scar": {
    id: "howling-scar",
    name: "Howling Scar",
    tierLabel: "Tier 1",
    width: FIELD_WIDTH_TILES,
    height: FIELD_HEIGHT_TILES,
    defaultSpawn: { x: 16, y: 28 },
    timerSeconds: 180,
    encounters: 3,
    extractionTiles: [
      { x: 15, y: 0 },
      { x: 16, y: 0 },
    ],
    obstacleTiles: [
      { x: 6, y: 8 },
      { x: 7, y: 8 },
      { x: 8, y: 8 },
      { x: 18, y: 12 },
      { x: 19, y: 12 },
      { x: 20, y: 12 },
      { x: 10, y: 20 },
      { x: 11, y: 20 },
      { x: 22, y: 24 },
      { x: 23, y: 24 },
    ],
  },
  "ash-relay": {
    id: "ash-relay",
    name: "Ash Relay",
    tierLabel: "Tier 2",
    width: FIELD_WIDTH_TILES,
    height: FIELD_HEIGHT_TILES,
    defaultSpawn: { x: 3, y: 26 },
    timerSeconds: 165,
    encounters: 4,
    extractionTiles: [
      { x: 30, y: 2 },
      { x: 31, y: 2 },
    ],
    obstacleTiles: [
      { x: 12, y: 9 },
      { x: 13, y: 9 },
      { x: 14, y: 9 },
      { x: 15, y: 9 },
      { x: 18, y: 17 },
      { x: 19, y: 17 },
      { x: 20, y: 17 },
      { x: 8, y: 22 },
      { x: 9, y: 22 },
      { x: 10, y: 22 },
    ],
  },
  "echo-ruins": {
    id: "echo-ruins",
    name: "Echo Ruins",
    tierLabel: "Tier 3",
    width: FIELD_WIDTH_TILES,
    height: FIELD_HEIGHT_TILES,
    defaultSpawn: { x: 28, y: 28 },
    timerSeconds: 150,
    encounters: 5,
    extractionTiles: [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
    obstacleTiles: [
      { x: 21, y: 6 },
      { x: 22, y: 6 },
      { x: 23, y: 6 },
      { x: 7, y: 14 },
      { x: 8, y: 14 },
      { x: 9, y: 14 },
      { x: 10, y: 14 },
      { x: 15, y: 23 },
      { x: 16, y: 23 },
      { x: 17, y: 23 },
    ],
  },
  "rift-maw": {
    id: "rift-maw",
    name: "Rift Maw",
    tierLabel: "Tier 4",
    width: FIELD_WIDTH_TILES,
    height: FIELD_HEIGHT_TILES,
    defaultSpawn: { x: 16, y: 30 },
    timerSeconds: 140,
    encounters: 6,
    extractionTiles: [
      { x: 16, y: 1 },
      { x: 17, y: 1 },
    ],
    obstacleTiles: [
      { x: 4, y: 6 },
      { x: 5, y: 6 },
      { x: 6, y: 6 },
      { x: 24, y: 11 },
      { x: 25, y: 11 },
      { x: 26, y: 11 },
      { x: 12, y: 16 },
      { x: 13, y: 16 },
      { x: 14, y: 16 },
      { x: 15, y: 16 },
      { x: 20, y: 24 },
      { x: 21, y: 24 },
    ],
  },
};

export const DEFAULT_FIELD_ZONE_ID: FieldZoneId = "howling-scar";
export const OUTER_WASTES_ZONE = FIELD_ZONES[DEFAULT_FIELD_ZONE_ID];

export function getFieldZone(zoneId: FieldZoneId): FieldZoneDefinition {
  return FIELD_ZONES[zoneId];
}

export function isObstacleInZone(
  zone: FieldZoneDefinition,
  x: number,
  y: number,
) {
  return zone.obstacleTiles.some((t) => t.x === x && t.y === y);
}

export function isExtractionInZone(
  zone: FieldZoneDefinition,
  x: number,
  y: number,
) {
  return zone.extractionTiles.some((t) => t.x === x && t.y === y);
}

export function isObstacle(x: number, y: number) {
  return isObstacleInZone(OUTER_WASTES_ZONE, x, y);
}

export function isExtraction(x: number, y: number) {
  return isExtractionInZone(OUTER_WASTES_ZONE, x, y);
}

