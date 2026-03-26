/** Shared helpers for the void field UI layer (no gameplay rules). */

export const VOID_FIELD_SPAWN_HISTORY_LIMIT = 7;

export function voidFieldClamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function voidFieldHashStringToInt(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function voidFieldFormatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString();
}
