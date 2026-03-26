import type {
  FieldLoadoutProfile,
  PlayerState,
} from "@/features/game/gameTypes";

export type { FieldLoadoutProfile };

export const FIELD_LOADOUT_PROFILES: {
  id: FieldLoadoutProfile;
  label: string;
  line: string;
}[] = [
  {
    id: "assault",
    label: "Assault rig",
    line: "+8% strike damage — raw pressure on HP.",
  },
  {
    id: "support",
    label: "Breacher rig",
    line: "+25% posture fill — break guard and expose targets faster.",
  },
  {
    id: "breach",
    label: "Execution rig",
    line: "+15% damage while target is exposed (after a full posture break).",
  },
];

export function getFieldLoadoutStrikeMult(profile: FieldLoadoutProfile): number {
  return profile === "assault" ? 1.08 : 1;
}

export function getFieldLoadoutPostureFillMult(
  profile: FieldLoadoutProfile,
): number {
  return profile === "support" ? 1.25 : 1;
}

export function getFieldLoadoutExposeDamageMult(
  profile: FieldLoadoutProfile,
): number {
  if (profile === "breach") return 1.5;
  return 1.35;
}

export function normalizeFieldLoadoutProfile(
  value: unknown,
): FieldLoadoutProfile {
  if (value === "assault" || value === "support" || value === "breach") {
    return value;
  }
  return "assault";
}

export function fieldLoadoutLineForPlayer(player: PlayerState): string {
  const p = player.fieldLoadoutProfile;
  return FIELD_LOADOUT_PROFILES.find((x) => x.id === p)?.line ?? "";
}
