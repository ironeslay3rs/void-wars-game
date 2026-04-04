import type {
  FactionAlignment,
  MissionReward,
  PlayerState,
  ResourceKey,
  RunArchetype,
} from "@/features/game/gameTypes";

export const RUN_INSTABILITY_MAX = 100;

export const RUN_INSTABILITY_DELTA_HUNT = 6;
export const RUN_INSTABILITY_DELTA_MISSION = 4;
export const RUN_INSTABILITY_DELTA_RAID = 8;
export const RUN_INSTABILITY_DELTA_GRAY_TRADE = 3;
export const RUN_INSTABILITY_DELTA_GUILD_CLAIM = 5;

/** Paid vent: credits + scrap → flat heat reduction (logged). */
export const VENT_RUN_INSTABILITY_CREDITS_COST = 150;
export const VENT_RUN_INSTABILITY_SCRAP_COST = 12;
export const VENT_RUN_INSTABILITY_REDUCE = 24;

/** Voluntary push: +heat now, one-shot payout mult on next settlement before heat tick. */
export const PUSH_RUN_INSTABILITY_HEAT_GAIN = 12;
export const PUSH_SETTLEMENT_REWARD_MULT = 1.12;
export const PUSH_BOOST_DURATION_MS = 18 * 60 * 1000;

/** Greed streak counts settlements ending at or above this run heat. */
export const GREED_STREAK_THRESHOLD = 40;

const LOG_CAP = 28;

export type RunInstabilityLogEntry = {
  at: number;
  message: string;
};

function clampRi(n: number): number {
  return Math.max(0, Math.min(RUN_INSTABILITY_MAX, Math.round(n)));
}

/** Highest threshold band currently reached (for crossing detection). */
export function runInstabilityBand(ri: number): 0 | 20 | 40 | 60 | 80 | 100 {
  const x = clampRi(ri);
  if (x >= 100) return 100;
  if (x >= 80) return 80;
  if (x >= 60) return 60;
  if (x >= 40) return 40;
  if (x >= 20) return 20;
  return 0;
}

function bandCrossMessages(prev: number, next: number): string[] {
  const a = runInstabilityBand(prev);
  const b = runInstabilityBand(next);
  if (b <= a) return [];
  const lines: string[] = [];
  const thresholds: Array<{ t: 20 | 40 | 60 | 80; msg: string }> = [
    {
      t: 20,
      msg: "Run heat crossed 20% — better scrap recovery, harder to stay quiet.",
    },
    {
      t: 40,
      msg: "Run heat crossed 40% — settlements roll worse; expect extra wear.",
    },
    {
      t: 60,
      msg: "Run heat crossed 60% — field resistance hardens; XP yield slips.",
    },
    {
      t: 80,
      msg: "Run heat critical (80%+) — extract or hub soon; backlash is close.",
    },
  ];
  for (const { t, msg } of thresholds) {
    if (b >= t && a < t) lines.push(msg);
  }
  return lines;
}

export function appendRunInstabilityLog(
  log: RunInstabilityLogEntry[] | undefined,
  message: string,
  at = Date.now(),
): RunInstabilityLogEntry[] {
  const next = [...(log ?? []), { at, message }];
  if (next.length <= LOG_CAP) return next;
  return next.slice(-LOG_CAP);
}

export function reduceRunInstability(
  player: PlayerState,
  amount: number,
  logLine: string,
): PlayerState {
  if (amount <= 0) return player;
  const prev = clampRi(player.runInstability ?? 0);
  const next = clampRi(prev - amount);
  return {
    ...player,
    runInstability: next,
    runInstabilityLog: appendRunInstabilityLog(player.runInstabilityLog, logLine),
  };
}

export function bumpRunInstability(
  player: PlayerState,
  delta: number,
  contextLine?: string,
): PlayerState {
  if (delta <= 0) return player;
  const prev = clampRi(player.runInstability ?? 0);
  const next = clampRi(prev + delta);
  let log = player.runInstabilityLog ?? [];
  for (const msg of bandCrossMessages(prev, next)) {
    log = appendRunInstabilityLog(log, msg);
  }
  if (contextLine) {
    log = appendRunInstabilityLog(log, contextLine);
  }
  return {
    ...player,
    runInstability: next,
    runInstabilityLog: log,
  };
}

export function resetRunInstability(player: PlayerState): PlayerState {
  const hadHeat = (player.runInstability ?? 0) > 0;
  const hadBoost = player.runHeatPushBoost != null;
  if (!hadHeat && !hadBoost) return player;
  return {
    ...player,
    runInstability: 0,
    runHeatPushBoost: null,
    instabilityStreakTurns: 0,
    runInstabilityLog: appendRunInstabilityLog(
      player.runInstabilityLog,
      "Run heat cleared — hub or extraction broke the trail.",
    ),
  };
}

export function stableHashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function scaleRewardProgress(reward: MissionReward, mult: number): MissionReward {
  const m = Math.max(0.5, mult);
  return {
    ...reward,
    rankXp: Math.max(0, Math.round(reward.rankXp * m)),
    masteryProgress: Math.max(0, Math.round(reward.masteryProgress * m)),
    influence:
      typeof reward.influence === "number"
        ? Math.round(reward.influence * m)
        : reward.influence,
    resources: reward.resources
      ? (Object.fromEntries(
          Object.entries(reward.resources).map(([k, v]) => [
            k,
            Math.max(0, Math.round(v * m)),
          ]),
        ) as MissionReward["resources"])
      : reward.resources,
  };
}

function mergeMissionResources(
  reward: MissionReward,
  extra: Partial<Record<ResourceKey, number>>,
): MissionReward {
  const merged: Partial<Record<ResourceKey, number>> = { ...(reward.resources ?? {}) };
  for (const [k, v] of Object.entries(extra)) {
    if (typeof v !== "number" || !Number.isFinite(v) || v <= 0) continue;
    const key = k as ResourceKey;
    merged[key] = (merged[key] ?? 0) + Math.floor(v);
  }
  return { ...reward, resources: merged };
}

export function nextInstabilityStreakTurns(
  preRi: number,
  postRi: number,
  prevStreak: number,
): number {
  if (postRi < GREED_STREAK_THRESHOLD) return 0;
  if (preRi >= GREED_STREAK_THRESHOLD) return prevStreak + 1;
  return 1;
}

function appendGreedStreakMilestones(
  log: RunInstabilityLogEntry[] | undefined,
  newStreak: number,
): RunInstabilityLogEntry[] {
  let out = log ?? [];
  if (newStreak === 3) {
    out = appendRunInstabilityLog(out, "You stayed too long.");
  }
  if (newStreak === 6) {
    out = appendRunInstabilityLog(out, "The run is slipping.");
  }
  if (newStreak === 10) {
    out = appendRunInstabilityLog(out, "Greed streak 10 — the run remembers every meter.");
  }
  return out;
}

export type RunInstabilitySettlementContext = {
  missionId: string;
  resolvedAt: number;
  isHuntingGround: boolean;
};

/**
 * Path tilt for run-heat settlement (Bio / Mecha / Pure / unbound baseline).
 * - Bio: richer heat yields, harsher condition + XP tax
 * - Pure: softer negatives, leaner heat bonus
 * - Mecha: damped bad rolls and XP trim, smaller heat bonus
 */
export type RunInstabilityPathProfile = {
  /** Scales the L20+ incremental reward bonus (>1 = more payout from heat). */
  heatYieldAmp: number;
  /** Scales condition loss from meltdown + 40+ wear proc. */
  conditionStrainAmp: number;
  /** Scales 40+ negative proc chance. */
  negativeEventChanceAmp: number;
  /** Scales L60+ XP / mastery trim severity (>1 = harsher). */
  highHeatXpTaxAmp: number;
};

export function runInstabilityPathProfile(
  alignment: FactionAlignment,
): RunInstabilityPathProfile {
  switch (alignment) {
    case "bio":
      return {
        heatYieldAmp: 1.28,
        conditionStrainAmp: 1.3,
        negativeEventChanceAmp: 1.06,
        highHeatXpTaxAmp: 1.16,
      };
    case "pure":
      return {
        heatYieldAmp: 0.88,
        conditionStrainAmp: 0.74,
        negativeEventChanceAmp: 0.62,
        highHeatXpTaxAmp: 0.8,
      };
    case "mecha":
      return {
        heatYieldAmp: 0.78,
        conditionStrainAmp: 0.78,
        negativeEventChanceAmp: 0.84,
        highHeatXpTaxAmp: 0.7,
      };
    default:
      return {
        heatYieldAmp: 1,
        conditionStrainAmp: 1,
        negativeEventChanceAmp: 1,
        highHeatXpTaxAmp: 1,
      };
  }
}

const MELTDOWN_CONDITION_BASE = 32;

/**
 * Run identity — small settlement-only tweaks (about 5–10%), applied inside heat settlement.
 * Uses archetype from the *previous* settlements (updated after this tick).
 */
type RunArchetypeSettlementMods = {
  /** Final XP / mastery / influence / resource payout multiplier. */
  rewardMult: number;
  /** Multiplies run-heat-driven condition hits (meltdown + 40% wear); below 1 = safer. */
  conditionStrainMult: number;
  /** Extra meltdown condition multiplier (greedy). */
  meltdownAmp: number;
  /** Scales 40+ negative proc roll threshold. */
  negativeProcChanceMult: number;
  /** Extra wear on proc + meltdown spike (volatile). */
  spikeMult: number;
  /** Heat gained this settlement (volatile: slightly higher). */
  heatDeltaMult: number;
};

const ARCH_SAFE_REWARD_MULT = 0.93;
const ARCH_SAFE_CONDITION_MULT = 0.92;

const ARCH_GREEDY_REWARD_MULT = 1.08;
const ARCH_GREEDY_MELTDOWN_MULT = 1.08;

const ARCH_VOLATILE_PROC_MULT = 1.1;
const ARCH_VOLATILE_SPIKE_MULT = 1.08;
const ARCH_VOLATILE_HEAT_MULT = 1.08;

function runArchetypeSettlementMods(
  archetype: RunArchetype | undefined,
): RunArchetypeSettlementMods {
  const neutral: RunArchetypeSettlementMods = {
    rewardMult: 1,
    conditionStrainMult: 1,
    meltdownAmp: 1,
    negativeProcChanceMult: 1,
    spikeMult: 1,
    heatDeltaMult: 1,
  };
  switch (archetype) {
    case "safe":
      return {
        ...neutral,
        rewardMult: ARCH_SAFE_REWARD_MULT,
        conditionStrainMult: ARCH_SAFE_CONDITION_MULT,
      };
    case "greedy":
      return {
        ...neutral,
        rewardMult: ARCH_GREEDY_REWARD_MULT,
        meltdownAmp: ARCH_GREEDY_MELTDOWN_MULT,
      };
    case "volatile":
      return {
        ...neutral,
        negativeProcChanceMult: ARCH_VOLATILE_PROC_MULT,
        spikeMult: ARCH_VOLATILE_SPIKE_MULT,
        heatDeltaMult: ARCH_VOLATILE_HEAT_MULT,
      };
    default:
      return neutral;
  }
}

function pathFlavorAfterHeatYield(alignment: FactionAlignment): string | null {
  switch (alignment) {
    case "bio":
      return "Verdant Coil: the hunger turned heat into a fatter take.";
    case "pure":
      return "Ember Vault: resonance bled some glare — leaner bonus, gentler scrape.";
    case "mecha":
      return "Chrome Synod: tolerances shaved the heat bonus to spec.";
    default:
      return null;
  }
}

function pathFlavorAfterWear(
  alignment: FactionAlignment,
  extra: number,
): string | null {
  switch (alignment) {
    case "bio":
      return `Bio tax: tissues paid ${extra} harder under heat.`;
    case "pure":
      return `Pure bleed-through: only ${extra} wear made it past the lattice.`;
    case "mecha":
      return `Mecha gasket: shock trimmed to ${extra} after damping.`;
    default:
      return null;
  }
}

function pathFlavorAfterXpTrim(alignment: FactionAlignment): string | null {
  switch (alignment) {
    case "bio":
      return "Biological debt: aptitude curdled faster in the red.";
    case "pure":
      return "Vault focus: aptitude slip stayed narrower than raw heat.";
    case "mecha":
      return "Synod stress curves: XP bleed stayed inside rated bands.";
    default:
      return null;
  }
}

function pathMeltdownMessage(alignment: FactionAlignment, hit: number): string {
  switch (alignment) {
    case "bio":
      return `Run heat maxed — biological backlash tore ${hit} condition through the Coil. Heat purged.`;
    case "pure":
      return `Run heat maxed — vault lattice cracked for ${hit} wear, less than the raw math. Heat purged.`;
    case "mecha":
      return `Run heat maxed — frame safeties vented ${hit} damage; Synod bleed contained. Heat purged.`;
    default:
      return `Run heat maxed — void backlash tore your condition (${hit}). Heat purged; extract earlier next time.`;
  }
}

/**
 * Apply per-run heat bump + payout modifiers for mission/hunt settlement.
 * Call before `applyMissionRewardWithVoidStrain` / condition resolution.
 */
export function applyRunInstabilityMissionSettlement(
  player: PlayerState,
  reward: MissionReward,
  ctx: RunInstabilitySettlementContext,
): { player: PlayerState; reward: MissionReward } {
  let p = player;
  let r = { ...reward };
  const path = runInstabilityPathProfile(p.factionAlignment);
  const arch = runArchetypeSettlementMods(p.runArchetype);
  const preRi = clampRi(p.runInstability);
  const prevStreak = Math.max(0, Math.floor(p.instabilityStreakTurns ?? 0));

  if (p.runHeatPushBoost && ctx.resolvedAt >= p.runHeatPushBoost.expiresAt) {
    p = { ...p, runHeatPushBoost: null };
  }

  const boost = p.runHeatPushBoost;
  if (boost && ctx.resolvedAt < boost.expiresAt && boost.rewardMult > 1) {
    r = scaleRewardProgress(r, boost.rewardMult);
    p = {
      ...p,
      runHeatPushBoost: null,
      runInstabilityLog: appendRunInstabilityLog(
        p.runInstabilityLog,
        `Push cashed: +${Math.round((boost.rewardMult - 1) * 100)}% on this payout (applied before heat tick).`,
      ),
    };
  }

  const baseDelta = ctx.isHuntingGround
    ? RUN_INSTABILITY_DELTA_HUNT
    : RUN_INSTABILITY_DELTA_MISSION;
  const delta =
    arch.heatDeltaMult > 1
      ? Math.max(baseDelta, Math.ceil(baseDelta * arch.heatDeltaMult))
      : baseDelta;
  const ctxLine = ctx.isHuntingGround
    ? "Hunt closed — run heat climbed."
    : "Mission logged — attention ticked up.";

  p = bumpRunInstability(p, delta, ctxLine);
  const ri = clampRi(p.runInstability);

  if (ri >= 100) {
    const greedyMeltdownTurns =
      preRi >= GREED_STREAK_THRESHOLD ? prevStreak + 1 : prevStreak;
    let meltdownHit = Math.max(
      18,
      Math.round(
        MELTDOWN_CONDITION_BASE *
          path.conditionStrainAmp *
          (1 + Math.min(0.58, greedyMeltdownTurns * 0.052)),
      ),
    );
    meltdownHit = Math.max(
      18,
      Math.round(
        meltdownHit * arch.meltdownAmp * arch.conditionStrainMult * arch.spikeMult,
      ),
    );
    r = {
      ...r,
      conditionDelta: r.conditionDelta - meltdownHit,
    };
    p = {
      ...p,
      runInstability: 0,
      runHeatPushBoost: null,
      instabilityStreakTurns: 0,
      runInstabilityLog: appendRunInstabilityLog(
        p.runInstabilityLog,
        pathMeltdownMessage(p.factionAlignment, meltdownHit),
      ),
    };
    if (greedyMeltdownTurns >= 3) {
      p = {
        ...p,
        runInstabilityLog: appendRunInstabilityLog(
          p.runInstabilityLog,
          `Greed fed the backlash (${greedyMeltdownTurns} hot contracts deep).`,
        ),
      };
    }
    if (arch.rewardMult !== 1) {
      r = scaleRewardProgress(r, arch.rewardMult);
    }
    return { player: p, reward: r };
  }

  const newStreak = nextInstabilityStreakTurns(preRi, ri, prevStreak);
  p = {
    ...p,
    instabilityStreakTurns: newStreak,
    runInstabilityLog: appendGreedStreakMilestones(p.runInstabilityLog, newStreak),
  };

  if (ri >= 20) {
    const baseInc = Math.min(0.08, (ri - 20) * 0.0011);
    const mult = 1 + baseInc * path.heatYieldAmp;
    r = scaleRewardProgress(r, mult);
    const flavor = pathFlavorAfterHeatYield(p.factionAlignment);
    if (flavor) {
      p = {
        ...p,
        runInstabilityLog: appendRunInstabilityLog(p.runInstabilityLog, flavor),
      };
    }
  }

  if (newStreak >= 1) {
    const streakMult = 1 + Math.min(0.24, newStreak * 0.017);
    r = scaleRewardProgress(r, streakMult);
  }

  if (ri >= 40) {
    const roll = stableHashSeed(`${ctx.missionId}:${ctx.resolvedAt}`) % 100;
    const baseProc = Math.min(0.72, (ri - 40) / 70) * path.negativeEventChanceAmp;
    const streakBacklash = Math.min(0.14, newStreak * 0.011);
    const procChance = Math.min(
      0.9,
      (baseProc + streakBacklash) * arch.negativeProcChanceMult,
    );
    const procPct = Math.min(95, Math.round(procChance * 100));
    if (roll < procPct) {
      const extraBase = 3 + Math.floor((ri - 40) / 15);
      const extra = Math.max(
        1,
        Math.round(
          extraBase *
            path.conditionStrainAmp *
            arch.conditionStrainMult *
            arch.spikeMult,
        ),
      );
      r = { ...r, conditionDelta: r.conditionDelta - extra };
      let log = appendRunInstabilityLog(
        p.runInstabilityLog,
        `Run heat ${ri}% — extra wear (${extra}) on this payout.`,
      );
      const wearFlavor = pathFlavorAfterWear(p.factionAlignment, extra);
      if (wearFlavor) {
        log = appendRunInstabilityLog(log, wearFlavor);
      }
      p = { ...p, runInstabilityLog: log };
    }
  }

  if (newStreak >= 2) {
    const rareChanceBase = Math.min(44, 8 + newStreak * 4);
    const rareChance =
      arch.negativeProcChanceMult > 1
        ? Math.min(50, Math.ceil(rareChanceBase * arch.negativeProcChanceMult))
        : rareChanceBase;
    const rareRoll =
      stableHashSeed(`greed-rare-${ctx.missionId}-${ctx.resolvedAt}-${newStreak}`) %
      100;
    if (rareRoll < rareChance) {
      const dust = newStreak >= 8 ? 3 : newStreak >= 5 ? 2 : 1;
      const creds = newStreak >= 7 ? 35 : newStreak >= 4 ? 18 : 0;
      const bonus: Partial<Record<ResourceKey, number>> = { runeDust: dust };
      if (creds > 0) bonus.credits = creds;
      r = mergeMissionResources(r, bonus);
      p = {
        ...p,
        runInstabilityLog: appendRunInstabilityLog(
          p.runInstabilityLog,
          "Greed streak surfaced a rare cut — extra dust hit the ledger.",
        ),
      };
    }
  }

  if (ri >= 60) {
    const baseEff = Math.max(0.76, 1 - (ri - 60) * 0.0055);
    const stress = 1 - baseEff;
    const floorEff =
      p.factionAlignment === "bio"
        ? 0.66
        : p.factionAlignment === "pure"
          ? 0.78
          : p.factionAlignment === "mecha"
            ? 0.8
            : 0.76;
    const eff = Math.max(floorEff, 1 - stress * path.highHeatXpTaxAmp);
    r = {
      ...r,
      rankXp: Math.max(0, Math.round(r.rankXp * eff)),
      masteryProgress: Math.max(0, Math.round(r.masteryProgress * eff)),
    };
    const xpFlavor = pathFlavorAfterXpTrim(p.factionAlignment);
    if (xpFlavor) {
      p = {
        ...p,
        runInstabilityLog: appendRunInstabilityLog(p.runInstabilityLog, xpFlavor),
      };
    }
  }

  if (arch.rewardMult !== 1) {
    r = scaleRewardProgress(r, arch.rewardMult);
  }

  return { player: p, reward: r };
}

/** Player shell damage multiplier vs mobs (60+ run heat = heavier field). */
export function runInstabilityShellDamageMultiplier(runInstability: number): number {
  const ri = clampRi(runInstability);
  if (ri < 60) return 1;
  const t = (ri - 60) / 40;
  return Math.max(0.72, 1 - t * 0.2);
}

export function runInstabilityBarTone(
  ri: number,
): "calm" | "warm" | "hot" | "critical" {
  const x = clampRi(ri);
  if (x >= 80) return "critical";
  if (x >= 40) return "hot";
  if (x >= 20) return "warm";
  return "calm";
}

export function formatRunInstabilityChip(ri: number): string {
  const x = clampRi(ri);
  const tone =
    x >= 80 ? "CRITICAL" : x >= 60 ? "HIGH" : x >= 40 ? "ELEVATED" : x >= 20 ? "WARM" : "LOW";
  return `Run heat ${x}% · ${tone}`;
}

export function formatVentCostLabel(): string {
  return `${VENT_RUN_INSTABILITY_CREDITS_COST} cr · ${VENT_RUN_INSTABILITY_SCRAP_COST} scrap → −${VENT_RUN_INSTABILITY_REDUCE}% heat`;
}

export function formatPushSummary(nowMs: number, boost: PlayerState["runHeatPushBoost"]): string {
  if (!boost || nowMs >= boost.expiresAt) {
    return `+${PUSH_RUN_INSTABILITY_HEAT_GAIN}% heat · next payout +${Math.round((PUSH_SETTLEMENT_REWARD_MULT - 1) * 100)}% (${Math.round(PUSH_BOOST_DURATION_MS / 60000)}m window)`;
  }
  const left = Math.max(0, Math.ceil((boost.expiresAt - nowMs) / 60000));
  return `Boost live +${Math.round((boost.rewardMult - 1) * 100)}% · ~${left}m left`;
}

export function getVentRunInstabilityBlocker(player: PlayerState): string | null {
  if (clampRi(player.runInstability ?? 0) <= 0) {
    return "No heat to vent";
  }
  if (player.resources.credits < VENT_RUN_INSTABILITY_CREDITS_COST) {
    return `Need ${VENT_RUN_INSTABILITY_CREDITS_COST} credits`;
  }
  if (player.resources.scrapAlloy < VENT_RUN_INSTABILITY_SCRAP_COST) {
    return `Need ${VENT_RUN_INSTABILITY_SCRAP_COST} scrap`;
  }
  return null;
}

export function getPushRunInstabilityBlocker(
  player: PlayerState,
  nowMs: number,
): string | null {
  if (clampRi(player.runInstability ?? 0) >= RUN_INSTABILITY_MAX) {
    return "Heat already maxed";
  }
  if (player.runHeatPushBoost && nowMs < player.runHeatPushBoost.expiresAt) {
    return "Boost already primed";
  }
  return null;
}

export function attemptVentRunInstability(
  player: PlayerState,
): { ok: true; player: PlayerState } | { ok: false; reason: string } {
  const blocker = getVentRunInstabilityBlocker(player);
  if (blocker) return { ok: false, reason: blocker };

  const ri = clampRi(player.runInstability ?? 0);
  const reduced = Math.min(VENT_RUN_INSTABILITY_REDUCE, ri);
  const nextResources = {
    ...player.resources,
    credits: player.resources.credits - VENT_RUN_INSTABILITY_CREDITS_COST,
    scrapAlloy: player.resources.scrapAlloy - VENT_RUN_INSTABILITY_SCRAP_COST,
  };

  let p = reduceRunInstability(
    { ...player, resources: nextResources },
    VENT_RUN_INSTABILITY_REDUCE,
    `Vent scrub: −${reduced}% heat · paid ${VENT_RUN_INSTABILITY_CREDITS_COST} credits + ${VENT_RUN_INSTABILITY_SCRAP_COST} scrap.`,
  );
  const postRi = clampRi(p.runInstability);
  if (postRi < GREED_STREAK_THRESHOLD) {
    const hadStreak = (player.instabilityStreakTurns ?? 0) > 0;
    p = {
      ...p,
      instabilityStreakTurns: 0,
      runInstabilityLog: hadStreak
        ? appendRunInstabilityLog(
            p.runInstabilityLog,
            "Greed streak broken — heat fell below 40%.",
          )
        : p.runInstabilityLog,
    };
  }
  return { ok: true, player: p };
}

export function attemptPushRunInstability(
  player: PlayerState,
  nowMs: number,
): { ok: true; player: PlayerState } | { ok: false; reason: string } {
  const blocker = getPushRunInstabilityBlocker(player, nowMs);
  if (blocker) return { ok: false, reason: blocker };

  let p = bumpRunInstability(
    player,
    PUSH_RUN_INSTABILITY_HEAT_GAIN,
    "Run heat pushed — you chose the extra glare.",
  );
  p = {
    ...p,
    runHeatPushBoost: {
      rewardMult: PUSH_SETTLEMENT_REWARD_MULT,
      expiresAt: nowMs + PUSH_BOOST_DURATION_MS,
    },
  };
  p = {
    ...p,
    runInstabilityLog: appendRunInstabilityLog(
      p.runInstabilityLog,
      `Push primed: +${Math.round((PUSH_SETTLEMENT_REWARD_MULT - 1) * 100)}% XP / loot on next settlement within ${Math.round(PUSH_BOOST_DURATION_MS / 60000)}m.`,
    ),
  };
  return { ok: true, player: p };
}
