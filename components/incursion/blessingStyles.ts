/**
 * Shared styling + label maps for incursion blessing components.
 * Pure data — kept out of the visual files so each stays under 300 lines.
 *
 * Canon copy: "Pure" (never "Spirit"); empire names in flavor.
 */
import type {
  BlessingFusionPair,
  BlessingSchool,
} from "@/features/incursion/blessingTypes";

export const SCHOOL_EMPIRE_LABEL: Record<BlessingSchool, string> = {
  bio: "Verdant Coil",
  mecha: "Chrome Synod",
  pure: "Ember Vault",
};

export const SCHOOL_SHORT_LABEL: Record<BlessingSchool, string> = {
  bio: "Bio",
  mecha: "Mecha",
  pure: "Pure",
};

export const FUSION_PAIR_LABEL: Record<BlessingFusionPair, string> = {
  "bio+mecha": "Coil / Synod",
  "mecha+pure": "Synod / Vault",
  "pure+bio": "Vault / Coil",
};

export type SchoolAccent = {
  border: string;
  bg: string;
  chip: string;
  btn: string;
  tint: string;
};

export const SCHOOL_ACCENT: Record<BlessingSchool, SchoolAccent> = {
  bio: {
    border: "border-emerald-500/40",
    bg: "bg-emerald-950/95",
    chip: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
    btn: "border-emerald-400/40 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30",
    tint: "text-emerald-200",
  },
  mecha: {
    border: "border-cyan-400/40",
    bg: "bg-slate-950/95",
    chip: "bg-cyan-500/15 text-cyan-200 border-cyan-400/30",
    btn: "border-cyan-400/40 bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30",
    tint: "text-cyan-200",
  },
  pure: {
    border: "border-amber-400/40",
    bg: "bg-amber-950/95",
    chip: "bg-amber-500/15 text-amber-100 border-amber-400/30",
    btn: "border-amber-400/40 bg-amber-500/20 text-amber-100 hover:bg-amber-500/30",
    tint: "text-amber-200",
  },
};

export const FUSION_ACCENT: SchoolAccent = {
  border: "border-fuchsia-500/50",
  bg: "bg-[#150a1b]/95",
  chip: "bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-400/40",
  btn: "border-fuchsia-400/40 bg-fuchsia-500/20 text-fuchsia-100 hover:bg-fuchsia-500/30",
  tint: "text-fuchsia-200",
};

export const CAPACITY_POOL_LABEL: Record<
  "blood" | "frame" | "resonance",
  string
> = {
  blood: "Blood",
  frame: "Frame",
  resonance: "Resonance",
};
