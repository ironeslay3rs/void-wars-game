import type { FactionAlignment, PathType } from "@/features/game/gameTypes";

const trioDisplayLabels: Record<PathType, string> = {
  bio: "Bio",
  mecha: "Mecha",
  spirit: "Pure",
};

export function formatTrioDisplayLabel(path: PathType) {
  return trioDisplayLabels[path];
}

export function formatAffiliationLabel(alignment: FactionAlignment) {
  if (alignment === "unbound") {
    return "Unbound";
  }

  return formatTrioDisplayLabel(alignment);
}

export function formatMissionPathLabel(path: PathType | "neutral") {
  if (path === "neutral") {
    return "Neutral";
  }

  return formatTrioDisplayLabel(path);
}

export function formatDoctrineLabel(path: PathType) {
  return `${formatTrioDisplayLabel(path)} Doctrine`;
}
