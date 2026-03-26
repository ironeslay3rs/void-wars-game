export function toggleTarget(
  currentTargetId: string | null,
  clickedMobId: string,
): string | null {
  return currentTargetId === clickedMobId ? null : clickedMobId;
}

export function clearTarget(): null {
  return null;
}

