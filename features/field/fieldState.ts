import {
  DEFAULT_FIELD_ZONE_ID,
  getFieldZone,
  isObstacleInZone,
  type FieldZoneId,
} from "@/features/field/fieldMap";

export type FieldSessionState = {
  zoneId: FieldZoneId;
  playerPosition: { x: number; y: number };
  currentZoneName: string;
  currentZoneTier: string;
  fieldTimerSeconds: number;
  encountersRemaining: number;
};

export function createInitialFieldSession(
  zoneId: FieldZoneId = DEFAULT_FIELD_ZONE_ID,
): FieldSessionState {
  const zone = getFieldZone(zoneId);
  return {
    zoneId,
    playerPosition: zone.defaultSpawn,
    currentZoneName: zone.name,
    currentZoneTier: zone.tierLabel,
    fieldTimerSeconds: zone.timerSeconds,
    encountersRemaining: zone.encounters,
  };
}

export function nextPositionForInput(
  pos: { x: number; y: number },
  key: string,
  zoneId: FieldZoneId = DEFAULT_FIELD_ZONE_ID,
): { x: number; y: number } {
  const zone = getFieldZone(zoneId);
  const lower = key.toLowerCase();
  let dx = 0;
  let dy = 0;

  if (lower === "w" || key === "ArrowUp") dy = -1;
  if (lower === "s" || key === "ArrowDown") dy = 1;
  if (lower === "a" || key === "ArrowLeft") dx = -1;
  if (lower === "d" || key === "ArrowRight") dx = 1;

  if (dx === 0 && dy === 0) return pos;

  const next = {
    x: Math.max(0, Math.min(zone.width - 1, pos.x + dx)),
    y: Math.max(0, Math.min(zone.height - 1, pos.y + dy)),
  };

  if (isObstacleInZone(zone, next.x, next.y)) {
    return pos;
  }

  return next;
}

