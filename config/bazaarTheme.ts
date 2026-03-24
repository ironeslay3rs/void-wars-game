export const bazaarDistrictThemes = {
  bio: {
    border: "border-emerald-400/35",
    glow: "shadow-[0_0_34px_rgba(16,185,129,0.16)]",
    overlay: "from-emerald-500/55 to-cyan-500/20",
  },
  pure: {
    border: "border-cyan-400/35",
    glow: "shadow-[0_0_34px_rgba(34,211,238,0.16)]",
    overlay: "from-cyan-500/50 to-blue-600/20",
  },
  forge: {
    border: "border-amber-400/35",
    glow: "shadow-[0_0_34px_rgba(245,158,11,0.14)]",
    overlay: "from-amber-500/55 to-orange-500/20",
  },
  arena: {
    border: "border-orange-400/35",
    glow: "shadow-[0_0_34px_rgba(249,115,22,0.16)]",
    overlay: "from-orange-500/55 to-red-500/20",
  },
  mecha: {
    border: "border-slate-300/30",
    glow: "shadow-[0_0_34px_rgba(148,163,184,0.13)]",
    overlay: "from-slate-300/40 to-orange-500/20",
  },
  guild: {
    border: "border-fuchsia-300/30",
    glow: "shadow-[0_0_34px_rgba(217,70,239,0.12)]",
    overlay: "from-fuchsia-500/40 to-orange-500/20",
  },
  faction: {
    border: "border-lime-300/25",
    glow: "shadow-[0_0_34px_rgba(163,230,53,0.10)]",
    overlay: "from-lime-400/35 via-orange-400/15 to-violet-500/25",
  },
  travel: {
    border: "border-emerald-300/30",
    glow: "shadow-[0_0_34px_rgba(52,211,153,0.12)]",
    overlay: "from-emerald-400/45 to-cyan-500/20",
  },
} as const;

export const bazaarHubThemes = {
  market: {
    border: "border-amber-300/25",
    glow: "shadow-[0_24px_70px_rgba(0,0,0,0.42),0_0_40px_rgba(251,146,60,0.12)]",
    overlay:
      "bg-[linear-gradient(135deg,rgba(245,158,11,0.18),rgba(120,53,15,0.08),rgba(168,85,247,0.10))]",
  },
  blackMarket: {
    border: "border-orange-400/18",
    glow: "shadow-[0_24px_70px_rgba(0,0,0,0.42)]",
    overlay:
      "bg-[linear-gradient(135deg,rgba(120,20,10,0.18),rgba(40,10,8,0.10),rgba(245,158,11,0.07))]",
  },
} as const;
