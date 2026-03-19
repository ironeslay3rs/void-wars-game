export const factionThemes = {
  bio: {
    border: "border-emerald-400/30",
    background:
      "bg-[linear-gradient(135deg,rgba(6,40,22,0.90),rgba(4,14,10,0.88))]",
    glow: "shadow-[0_0_22px_rgba(34,197,94,0.10)]",
    accentText: "text-emerald-200",
  },

  mecha: {
    border: "border-cyan-400/30",
    background:
      "bg-[linear-gradient(135deg,rgba(8,30,52,0.90),rgba(5,13,24,0.88))]",
    glow: "shadow-[0_0_22px_rgba(34,211,238,0.10)]",
    accentText: "text-cyan-200",
  },

  spirit: {
    border: "border-violet-400/30",
    background:
      "bg-[linear-gradient(135deg,rgba(40,10,58,0.90),rgba(16,8,26,0.88))]",
    glow: "shadow-[0_0_22px_rgba(168,85,247,0.10)]",
    accentText: "text-violet-200",
  },
} as const;