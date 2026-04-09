import type { ArenaAccent } from "@/features/arena/arenaTypes";
import type { ArenaMatchModeId } from "@/features/arena/arenaMatchModes";

export function formatFactionLabel(faction: string) {
  if (faction === "unbound") return "Unbound";
  if (faction === "bio") return "Bio";
  if (faction === "mecha") return "Mecha";
  if (faction === "pure") return "Pure";
  return faction;
}

export function getConditionLabel(condition: number) {
  if (condition >= 85) return "Combat Ready";
  if (condition >= 65) return "Stable";
  if (condition >= 40) return "Strained";
  return "Critical";
}

export function getArenaEligibility(condition: number) {
  if (condition >= 40) return "Eligible";
  return "Restricted";
}

/** Ranked/tournament queue requires condition; practice always queues. */
export function canEnterArenaQueue(modeId: ArenaMatchModeId, condition: number) {
  if (modeId === "practice") return true;
  return condition >= 40;
}

export function getFactionAccent(faction: string): ArenaAccent {
  if (faction === "bio") {
    return {
      ring: "border-emerald-500/30",
      glow: "shadow-[0_0_35px_rgba(16,185,129,0.16)]",
      chip: "border-emerald-500/30 bg-emerald-500/10 text-emerald-100",
      bar: "from-emerald-400 to-emerald-700",
    };
  }

  if (faction === "mecha") {
    return {
      ring: "border-cyan-500/30",
      glow: "shadow-[0_0_35px_rgba(34,211,238,0.16)]",
      chip: "border-cyan-500/30 bg-cyan-500/10 text-cyan-100",
      bar: "from-cyan-300 to-cyan-700",
    };
  }

  if (faction === "pure") {
    return {
      ring: "border-violet-500/30",
      glow: "shadow-[0_0_35px_rgba(168,85,247,0.16)]",
      chip: "border-violet-500/30 bg-violet-500/10 text-violet-100",
      bar: "from-violet-300 to-violet-700",
    };
  }

  return {
    ring: "border-white/15",
    glow: "shadow-[0_0_28px_rgba(255,255,255,0.05)]",
    chip: "border-white/15 bg-white/5 text-white/90",
    bar: "from-white/80 to-white/30",
  };
}
