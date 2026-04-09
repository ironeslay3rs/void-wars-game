import type { FactionAlignment } from "@/features/game/gameTypes";

/**
 * Path-voiced condition/hunger/heat warnings.
 * The player's school speaks to them through these lines.
 *
 * Bio = instinct (the body speaks)
 * Mecha = comprehension (the system reports)
 * Pure = wisdom (the soul whispers)
 * Unbound = neutral survival voice
 *
 * CANON STATUS: GAME-SPECIFIC CREATIVE WORK
 * School voice patterns consistent with vault descriptions:
 * Bio=body/adaptation, Mecha=precision/control, Pure=memory/soul.
 */

export type PressureKind = "condition" | "hunger" | "heat";
export type PressureSeverity = "warning" | "critical";

type PressureVoiceLine = {
  line: string;
  /** Short compact version for tight UI strips. */
  compact: string;
};

type PressureVoiceSet = Record<
  PressureKind,
  Record<PressureSeverity, PressureVoiceLine>
>;

const bioVoice: PressureVoiceSet = {
  condition: {
    warning: {
      line: "The flesh is fraying. Your body knows the toll before your mind does.",
      compact: "Flesh fraying",
    },
    critical: {
      line: "The body is failing. The Coil does not forgive those who ignore the wound.",
      compact: "Body failing",
    },
  },
  hunger: {
    warning: {
      line: "Hunger gnaws. The predator inside you is getting desperate.",
      compact: "Hunger gnaws",
    },
    critical: {
      line: "Starvation pressure rising. The beast eats itself when it cannot hunt.",
      compact: "Starving",
    },
  },
  heat: {
    warning: {
      line: "The blood is running hot. Another push and the instinct takes over.",
      compact: "Blood runs hot",
    },
    critical: {
      line: "Mutation surge imminent. The body does not ask permission to change.",
      compact: "Mutation surge",
    },
  },
};

const mechaVoice: PressureVoiceSet = {
  condition: {
    warning: {
      line: "Structural integrity compromised. Diagnostics recommend immediate maintenance.",
      compact: "Integrity compromised",
    },
    critical: {
      line: "Critical system failure pending. Frame architecture cannot sustain further operations.",
      compact: "System failure pending",
    },
  },
  hunger: {
    warning: {
      line: "Power reserves depleted. Operational efficiency degrading across all subsystems.",
      compact: "Power depleted",
    },
    critical: {
      line: "Emergency power protocol. Non-essential functions suspended. Resupply mandatory.",
      compact: "Emergency power",
    },
  },
  heat: {
    warning: {
      line: "Thermal load exceeding parameters. Coolant cycle recommended before next deployment.",
      compact: "Thermal overload",
    },
    critical: {
      line: "Overload imminent. Frame meltdown will trigger catastrophic component reset.",
      compact: "Meltdown imminent",
    },
  },
};

const pureVoice: PressureVoiceSet = {
  condition: {
    warning: {
      line: "Rune resonance destabilizing. The soul-path dims when the vessel cracks.",
      compact: "Resonance unstable",
    },
    critical: {
      line: "The ember is guttering. Press further and the memory burns out — not the enemy's. Yours.",
      compact: "Ember guttering",
    },
  },
  hunger: {
    warning: {
      line: "The ember dims. A starving soul cannot hold rune weight.",
      compact: "Ember dims",
    },
    critical: {
      line: "Soul sustenance depleted. The fire forgets what it learned when there is nothing left to burn.",
      compact: "Soul depleted",
    },
  },
  heat: {
    warning: {
      line: "Resonance fracture building. The runes are singing too loud — one more push and they crack.",
      compact: "Fracture building",
    },
    critical: {
      line: "Backlash imminent. The soul cannot absorb another surge without permanent scarring.",
      compact: "Backlash imminent",
    },
  },
};

const unboundVoice: PressureVoiceSet = {
  condition: {
    warning: {
      line: "Condition strained. The next run starts from a deficit if you don't recover.",
      compact: "Condition strained",
    },
    critical: {
      line: "Condition critical. Recovery is not optional — push now and you break.",
      compact: "Condition critical",
    },
  },
  hunger: {
    warning: {
      line: "Stores thinning. Hunger pressure will reduce your next payout.",
      compact: "Stores thinning",
    },
    critical: {
      line: "Starvation. Every system suffers. Feed first, fight second.",
      compact: "Starving",
    },
  },
  heat: {
    warning: {
      line: "Run heat climbing. Cool down or the next settlement will cost more than it pays.",
      compact: "Heat climbing",
    },
    critical: {
      line: "Meltdown territory. One more push and you lose a chunk of condition for nothing.",
      compact: "Meltdown risk",
    },
  },
};

const voiceMap: Record<FactionAlignment, PressureVoiceSet> = {
  bio: bioVoice,
  mecha: mechaVoice,
  pure: pureVoice,
  unbound: unboundVoice,
};

export function getPressureVoice(
  alignment: FactionAlignment,
  kind: PressureKind,
  severity: PressureSeverity,
): PressureVoiceLine {
  return voiceMap[alignment][kind][severity];
}

/**
 * Derive the most urgent pressure warning from current player state.
 * Returns null if no pressure is active (all vitals healthy).
 */
export function getActiveSettlementPressure(params: {
  alignment: FactionAlignment;
  condition: number;
  hunger: number;
  runInstability: number;
}): { kind: PressureKind; severity: PressureSeverity; voice: PressureVoiceLine } | null {
  const { alignment, condition, hunger, runInstability } = params;

  // Priority: critical condition > critical hunger > critical heat > warning condition > warning hunger > warning heat
  if (condition < 30) return { kind: "condition", severity: "critical", voice: getPressureVoice(alignment, "condition", "critical") };
  if (hunger < 25) return { kind: "hunger", severity: "critical", voice: getPressureVoice(alignment, "hunger", "critical") };
  if (runInstability >= 80) return { kind: "heat", severity: "critical", voice: getPressureVoice(alignment, "heat", "critical") };
  if (condition < 60) return { kind: "condition", severity: "warning", voice: getPressureVoice(alignment, "condition", "warning") };
  if (hunger < 50) return { kind: "hunger", severity: "warning", voice: getPressureVoice(alignment, "hunger", "warning") };
  if (runInstability >= 50) return { kind: "heat", severity: "warning", voice: getPressureVoice(alignment, "heat", "warning") };

  return null;
}
