import type { FactionAlignment, GameState } from "@/features/game/gameTypes";
import { aggregateRegionalPressureKind } from "@/features/factions/factionWorldLogic";
import { maxRuneDepthAcrossSchools } from "@/features/mastery/runeMasteryLogic";
import { countRuneSchoolsAtLeastDepth } from "@/features/progression/mythicAscensionLogic";
import { getCurrentAscensionStep } from "@/features/progression/ascensionStep";
import { formatRunStyleLabel } from "@/features/game/runArchetypeLogic";

export type PlayerNextGuidanceUrgency = "low" | "medium" | "high";

/**
 * Single readable “what next” object for Home — combines ascension gate, run posture,
 * alignment, and the highest-signal bottleneck without new progression systems.
 */
export type PlayerNextGuidance = {
  headline: string;
  reason: string;
  recommendedActionLabel: string;
  recommendedRoute: string;
  rewardPreview: string;
  urgency: PlayerNextGuidanceUrgency;
};

function alignmentClause(alignment: FactionAlignment): string {
  switch (alignment) {
    case "bio":
      return "Verdant Coil alignment";
    case "mecha":
      return "Chrome Synod alignment";
    case "pure":
      return "Ember Vault alignment";
    default:
      return "Unbound registry";
  }
}

function postureLine(archetype: GameState["player"]["runArchetype"]): string {
  return formatRunStyleLabel(archetype);
}

function suffix(
  alignment: FactionAlignment,
  archetype: GameState["player"]["runArchetype"],
): string {
  return `${alignmentClause(alignment)} · ${postureLine(archetype)}`;
}

/**
 * Priority: breakthrough (claim / near) → run heat → concrete resource/rank/depth gaps
 * for the active mythic gate → territory squeeze → soft mastery lag → ascension default.
 */
export function getPlayerNextGuidance(state: GameState): PlayerNextGuidance {
  const p = state.player;
  const step = getCurrentAscensionStep(state);
  const ri = Math.max(0, Math.min(100, Math.round(p.runInstability ?? 0)));
  const align = p.factionAlignment;
  const tail = suffix(align, p.runArchetype);
  const depth = maxRuneDepthAcrossSchools(p.runeMastery);
  const m = p.mythicAscension;
  const dust = p.resources.runeDust ?? 0;
  const iron = p.resources.ironHeart ?? 0;
  const credits = p.resources.credits ?? 0;

  if (step.claimReady) {
    return {
      headline: `Breakthrough ready — ${step.gateName}`,
      reason: `${step.nextRequirement} (${tail}).`,
      recommendedActionLabel: step.ctaLabel,
      recommendedRoute: step.href,
      rewardPreview: step.gateRewardLine,
      urgency: "high",
    };
  }

  if (step.nearBreakthroughLine) {
    return {
      headline: "Next breakthrough is within reach",
      reason: `${step.nearBreakthroughLine} Next: ${step.nextRequirement} · ${tail}.`,
      recommendedActionLabel: step.ctaLabel,
      recommendedRoute: step.href,
      rewardPreview: step.gateRewardLine,
      urgency: "high",
    };
  }

  if (ri >= 80) {
    return {
      headline: "Run heat critical — reset the trail",
      reason: `Heat is ${ri}%. Meltdown on settlement can erase a huge chunk of condition. ${postureLine(p.runArchetype)}.`,
      recommendedActionLabel: "Return home (clears heat)",
      recommendedRoute: "/home",
      rewardPreview:
        "Hub return breaks run heat; then vent, prep kits, or redeploy clean.",
      urgency: "high",
    };
  }

  if (ri >= 60) {
    return {
      headline: "Run heat is running hot",
      reason: `At ${ri}% heat, wear and strain spike on payouts. Cool down before chaining contracts. ${postureLine(p.runArchetype)}.`,
      recommendedActionLabel: "Go to Home strip",
      recommendedRoute: "/home",
      rewardPreview: "Use Vent/Push on the resource strip, or extract and hub to clear.",
      urgency: "medium",
    };
  }

  if (credits < 80 && p.rankLevel <= 2) {
    return {
      headline: "Credits thin — run a fast payout",
      reason: `You have ${credits} cr. Short operations fund staples and Feast Hall pressure. ${tail}.`,
      recommendedActionLabel: "Open contracts",
      recommendedRoute: "/missions",
      rewardPreview: "Voidfield prowl and outer wastes scavenge pay quick credits.",
      urgency: "medium",
    };
  }

  if (!m.l3RareRuneSetUnlocked) {
    if (p.rankLevel < 4) {
      return {
        headline: `Rank ${p.rankLevel} — need 4+ for L3 lattice`,
        reason: `Mythic ladder stays locked until rank catches up. ${tail}.`,
        recommendedActionLabel: "Run operations & hunts",
        recommendedRoute: "/missions",
        rewardPreview: "Rank XP from contracts is the straightest line to the gate.",
        urgency: "medium",
      };
    }
    if (depth < 4) {
      return {
        headline: `Rune depth ${depth} — need 4+ on the ladder`,
        reason: `Deepen schools on Mastery; the lattice reads your binding depth. ${tail}.`,
        recommendedActionLabel: "Open Mastery",
        recommendedRoute: "/mastery",
        rewardPreview: step.gateRewardLine,
        urgency: "medium",
      };
    }
    if (iron < 1) {
      return {
        headline: "Ironheart tithe missing",
        reason: `Hold 1× Ironheart for the L3 filing. Exchange rotators and elite hunts stock it. ${tail}.`,
        recommendedActionLabel: "War Exchange",
        recommendedRoute: "/bazaar/war-exchange",
        rewardPreview: "Tithe + met rank/depth lets you claim the L3 cycle on Mastery.",
        urgency: "medium",
      };
    }
    if (dust < 30) {
      return {
        headline: "Rune Dust tithe unfinished",
        reason: `Need 30+ dust (have ${dust}). Hunts and residue-heavy contracts feed the tithe. ${tail}.`,
        recommendedActionLabel: "Contracts & void hunts",
        recommendedRoute: "/missions",
        rewardPreview: "Close the dust gap, then file the lattice on Mastery.",
        urgency: "medium",
      };
    }
  }

  if (m.l3RareRuneSetUnlocked && !m.runeCrafterLicense) {
    if (p.rankLevel < 5) {
      return {
        headline: `Rank ${p.rankLevel} — Crafter seal wants 5+`,
        reason: `${step.nextRequirement} ${tail}.`,
        recommendedActionLabel: "Run contracts",
        recommendedRoute: "/missions",
        rewardPreview: step.gateRewardLine,
        urgency: "medium",
      };
    }
    if (iron < 2) {
      return {
        headline: "Crafter tithe: need 2× Ironheart",
        reason: `Have ${iron}. Source from War Exchange, guild theatres, and heavy hunts. ${tail}.`,
        recommendedActionLabel: "War Exchange",
        recommendedRoute: "/bazaar/war-exchange",
        rewardPreview: step.gateRewardLine,
        urgency: "medium",
      };
    }
  }

  if (m.runeCrafterLicense && !m.convergencePrimed) {
    const schools = countRuneSchoolsAtLeastDepth(p, 3);
    if (schools < 2 || p.rankLevel < 5) {
      return {
        headline: "Convergence filing still open",
        reason: `${step.nextRequirement} ${tail}.`,
        recommendedActionLabel: step.ctaLabel,
        recommendedRoute: step.href,
        rewardPreview: step.gateRewardLine,
        urgency: "medium",
      };
    }
  }

  if (align !== "unbound") {
    const theatre = aggregateRegionalPressureKind({
      factionAlignment: align,
      byZone: p.zoneDoctrinePressure,
    });
    if (theatre === "contested") {
      return {
        headline: "Doctrine war is taxing your payouts",
        reason:
          "Contested lanes lean contracts and add void strain on settlement. War Exchange quotes and guild theatres help you read the map.",
        recommendedActionLabel: "War Exchange",
        recommendedRoute: "/bazaar/war-exchange",
        rewardPreview: "Better sell/buy posture while your bloc fights for strips.",
        urgency: "medium",
      };
    }
  }

  if (p.masteryProgress < 35 && p.rankLevel >= 3) {
    return {
      headline: "Mastery is behind your rank",
      reason: `Mastery ${p.masteryProgress}% vs rank ${p.rankLevel}. Path-aligned hunts lift it fastest. ${tail}.`,
      recommendedActionLabel: "Pick a hunt",
      recommendedRoute: "/missions",
      rewardPreview: "Higher mastery keeps fusion reads and kits honest.",
      urgency: "low",
    };
  }

  if (m.convergencePrimed && m.runeKnightValor < 3) {
    return {
      headline: "Bank Knight valor next",
      reason: `Valor ${m.runeKnightValor}/3+ for first ladder spends. Ranked or tournament arena rounds credit valor. ${tail}.`,
      recommendedActionLabel: "Open Arena",
      recommendedRoute: "/bazaar/arena",
      rewardPreview: "Spend valor on Mythic boons and Edge Sigils once banked.",
      urgency: "low",
    };
  }

  return {
    headline: step.title,
    reason: `${step.detail} (${tail}).`,
    recommendedActionLabel: step.ctaLabel,
    recommendedRoute: step.href,
    rewardPreview: step.gateRewardLine,
    urgency: "low",
  };
}
