import type { FactionAlignment } from "@/features/game/gameTypes";

/**
 * Canonical "character exists" flag (set true only via New Game completion).
 * Legacy saves without the field are inferred so existing players are not trapped.
 */
export function resolveCharacterCreated(params: {
  stored: boolean | undefined;
  playerName: string;
  factionAlignment: FactionAlignment;
}): boolean {
  if (typeof params.stored === "boolean") {
    return params.stored;
  }

  const name = params.playerName.trim();
  if (name === "" || name === "Void Walker") {
    return false;
  }

  const faction = params.factionAlignment;
  if (faction === "bio" || faction === "mecha" || faction === "pure") {
    return true;
  }

  if (name === "Iron") {
    return false;
  }

  return name.length >= 2;
}
