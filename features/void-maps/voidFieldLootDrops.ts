import { voidFieldHashStringToInt } from "@/features/void-maps/voidFieldUtils";
import type { ResourceKey } from "@/features/game/gameTypes";
import { formatResourceLabel } from "@/features/game/gameFeedback";
import { getResourceIcon } from "@/features/game/resourceIconMap";

export type VoidFieldLootDropVfx = {
  id: string;
  xPct: number;
  yPct: number;
  resource: ResourceKey;
  amount: number;
  label: string;
  /** Short cue tying field pickup to contract settlement (no inventory). */
  subtitle: string;
  iconSrc: string;
  /** Vertical nudge so stacked labels read instead of stacking on one line. */
  labelNudgeYpx: number;
  /** Horizontal nudge when multiple drops spawn near each other. */
  labelNudgeXpx: number;
};

function resourceSubtitle(resource: ResourceKey): string {
  switch (resource) {
    case "credits":
      return "Credits · banked immediately";
    case "scrapAlloy":
    case "ironOre":
      return "Mecha salvage · banked immediately";
    case "bioSamples":
    case "mossRations":
      return "Bio salvage · banked immediately";
    case "runeDust":
    case "emberCore":
      return "Pure residue · banked immediately";
    default:
      return "Recovered · banked immediately";
  }
}

export function createVoidFieldLootDropVfx(
  xPct: number,
  yPct: number,
  resource: ResourceKey,
  amount: number,
  seed: string,
): VoidFieldLootDropVfx {
  const hy = voidFieldHashStringToInt(`${seed}-lbl`);
  const hx = voidFieldHashStringToInt(`${seed}-lbx`);
  const labelNudgeYpx = ((hy % 5) - 2) * 6;
  const labelNudgeXpx = ((hx % 5) - 2) * 5;
  return {
    id: `loot-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${voidFieldHashStringToInt(seed)}`}`,
    xPct,
    yPct,
    resource,
    amount,
    label: `+${amount} ${formatResourceLabel(resource)}`,
    subtitle: resourceSubtitle(resource),
    iconSrc: getResourceIcon(resource),
    labelNudgeYpx,
    labelNudgeXpx,
  };
}
