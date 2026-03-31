"use client";

import { useMemo, useState } from "react";
import {
  Hammer,
  Package,
  Shield,
  Wrench,
  Flame,
} from "lucide-react";
import CraftWorkOrderPanel from "@/components/crafting/CraftWorkOrderPanel";
import RuneHierarchyDistrictCallout from "@/components/crafting/RuneHierarchyDistrictCallout";
import StallArrearsCallout from "@/components/shared/StallArrearsCallout";
import BazaarSubpageNav from "@/components/bazaar/BazaarSubpageNav";
import { useGame } from "@/features/game/gameContext";
import { getCraftingDistrictScreenData } from "@/features/crafting-district/craftingDistrictScreenData";
import { nextRunModifierDefinitions } from "@/features/crafting-district/nextRunModifiersData";
import {
  hasStabilizationSigil,
  RUNE_CRAFTER_STABILIZATION_SIGIL,
  RUNE_CRAFTER_STABILIZATION_SIGIL_BONUS,
  RUNE_CRAFTER_STABILIZATION_SIGIL_COST,
} from "@/features/status/statusRecovery";
import {
  CRAFT_GATE_VOID_EXTRACT,
  getRecipeRuneRequirementHint,
  meetsRecipeRuneDepth,
} from "@/features/mastery/runeMasteryRecipeGates";
import { MOSS_RATION_RECIPE_COST } from "@/features/status/survival";
import type { ResourceKey } from "@/features/game/gameTypes";
import { formatCareerFocusCraftingHint } from "@/features/player/careerFocusModifiers";
import {
  formatCraftingProfessionHint,
  getCraftingProfessionTier,
  getDistrictCraftingCost,
} from "@/features/crafting-district/craftingProfession";
import { craftRecipes, craftingCategoryLabels, type CraftingCategory } from "@/features/crafting/recipeData";
import { itemRankLabel } from "@/features/inventory/itemRanks";
import {
  getRecipeMythicGateHint,
  meetsRecipeMythicGate,
} from "@/features/progression/mythicAscensionLogic";

type BossRelicKey = "coil" | "ash" | "vault";

const BOSS_RELIC_REFINES: Record<
  BossRelicKey,
  {
    title: string;
    blurb: string;
    cost: Partial<Record<ResourceKey, number>>;
    grant: Partial<Record<ResourceKey, number>>;
  }
> = {
  coil: {
    title: "Coilbound distill",
    blurb: "Liquefy a Verdant boss lattice into biomass and dust.",
    cost: { credits: 15, coilboundLattice: 1 },
    grant: { bioSamples: 5, runeDust: 3 },
  },
  ash: {
    title: "Synod break‑down",
    blurb: "Strip an Ash Synod relic into alloy and dust.",
    cost: { credits: 15, ashSynodRelic: 1 },
    grant: { scrapAlloy: 6, runeDust: 2 },
  },
  vault: {
    title: "Vault fuse",
    blurb: "Stabilize a Pure lattice shard into cores and dust.",
    cost: { credits: 15, vaultLatticeShard: 1 },
    grant: { emberCore: 2, runeDust: 5 },
  },
};

const craftingStations = [
  {
    title: "Weapon Forge",
    desc: "Craft blades, guns, and combat gear.",
    icon: Hammer,
  },
  {
    title: "Armor Bench",
    desc: "Reinforce armor, shields, and plating.",
    icon: Shield,
  },
  {
    title: "Rune Socketing",
    desc: "Insert runes and enhance item effects.",
    icon: Flame,
  },
  {
    title: "Material Storage",
    desc: "Manage ore, scraps, cores, and reagents.",
    icon: Package,
  },
  {
    title: "Repair Bay",
    desc: "Restore durability and rebuild damaged gear.",
    icon: Wrench,
  },
];

function formatResource(key: string) {
  switch (key) {
    case "credits":
      return "Credits";
    case "ironOre":
      return "Iron Ore";
    case "scrapAlloy":
      return "Scrap Alloy";
    case "runeDust":
      return "Rune Dust";
    case "emberCore":
      return "Ember Core";
    case "bioSamples":
      return "Bio Samples";
    case "mossRations":
      return "Moss Rations";
    default:
      return key;
  }
}

function CraftingConsole() {
  const { state, dispatch } = useGame();
  const [tab, setTab] = useState<CraftingCategory>("organic");
  const [toast, setToast] = useState<string | null>(null);

  const recipes = craftRecipes.filter((r) => r.category === tab);

  return (
    <div className="mt-4 space-y-4">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(craftingCategoryLabels) as CraftingCategory[]).map((key) => {
          const active = tab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={[
                "rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] transition",
                active
                  ? "border-cyan-400/40 bg-cyan-500/10 text-cyan-100"
                  : "border-white/12 bg-white/5 text-white/70 hover:border-white/25",
              ].join(" ")}
            >
              {craftingCategoryLabels[key]}
            </button>
          );
        })}
      </div>

      {toast ? (
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-50/90">
          {toast}
        </div>
      ) : null}

      {tab === "refining" ? (
        <p className="rounded-xl border border-violet-300/25 bg-violet-950/20 px-4 py-3 text-xs leading-relaxed text-violet-100/85">
          Refining is your cargo sink: trades volume for tighter stock. Risk firewalls still
          apply — failures burn the material line like other crafts.
        </p>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        {recipes.map((recipe) => {
          const canAfford = Object.entries(recipe.materials).every(([k, v]) => {
            const key = k as ResourceKey;
            const need = typeof v === "number" ? v : 0;
            if (need <= 0) return true;
            return (state.player.resources[key] ?? 0) >= need;
          });
          const mythicOk = meetsRecipeMythicGate(state.player, recipe.mythicGate);
          const craftEnabled = canAfford && mythicOk;

          return (
            <div
              key={recipe.id}
              className="rounded-2xl border border-white/12 bg-black/25 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-black uppercase tracking-[0.05em] text-white">
                    {recipe.name}
                  </div>
                  <div className="mt-1 text-xs text-white/60">
                    Success {Math.round(recipe.successChance * 100)}% · {recipe.craftTimeSeconds}s
                  </div>
                </div>
                <div className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/75">
                  {craftingCategoryLabels[recipe.category]}
                </div>
              </div>

              <div className="mt-3 space-y-1 text-xs text-white/65">
                {Object.entries(recipe.materials).map(([k, v]) => {
                  const key = k as ResourceKey;
                  const need = typeof v === "number" ? v : 0;
                  const have = state.player.resources[key] ?? 0;
                  const ok = have >= need;
                  return (
                    <div key={k} className="flex items-center justify-between gap-3">
                      <span>{formatResource(k)}</span>
                      <span className={ok ? "text-white/80" : "text-red-200"}>
                        {have}/{need}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 text-xs text-white/65">
                Output:{" "}
                {recipe.output.kind === "resources"
                  ? Object.entries(recipe.output.grant)
                      .map(([k, v]) => `+${v} ${formatResource(k)}`)
                      .join(", ")
                  : `${recipe.output.item.name} (${itemRankLabel(recipe.output.item.rankTier)})`}
              </div>

              {recipe.mythicGate && !mythicOk ? (
                <p className="mt-3 rounded-lg border border-amber-400/25 bg-amber-950/25 px-3 py-2 text-[11px] leading-relaxed text-amber-100/85">
                  {getRecipeMythicGateHint(recipe.mythicGate)}
                </p>
              ) : null}
              {recipe.id === "obsidian-cycle-core" && mythicOk ? (
                <p className="mt-2 text-[10px] leading-relaxed text-rose-200/70">
                  Unstable bind: failure still consumes mats and adds void strain—recover
                  before chaining.
                </p>
              ) : null}
              {recipe.id === "crafter-lattice-channel" && mythicOk ? (
                <p className="mt-2 text-[10px] leading-relaxed text-rose-200/65">
                  Lattice channel backlash on fail is lighter than obsidian, but still
                  spikes strain.
                </p>
              ) : null}

              <button
                type="button"
                onClick={() => {
                  dispatch({ type: "CRAFT_RECIPE", payload: { recipeId: recipe.id } });
                  const outputDesc =
                    recipe.output.kind === "resources"
                      ? Object.entries(recipe.output.grant)
                          .map(([k, v]) => `+${v} ${formatResource(k)}`)
                          .join(", ")
                      : recipe.output.item.name;
                  setToast(`Crafted: ${recipe.name} → ${outputDesc}`);
                  window.setTimeout(() => setToast(null), 3500);
                }}
                disabled={!craftEnabled}
                className="mt-4 w-full rounded-xl border border-cyan-400/25 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/45 hover:bg-cyan-500/16 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Craft
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CraftingDistrictPage() {
  const { state, dispatch } = useGame();
  const screenData = getCraftingDistrictScreenData(state);
  const [refineResult, setRefineResult] = useState<string | null>(null);
  const [sigilResult, setSigilResult] = useState<string | null>(null);
  const [rationResult, setRationResult] = useState<string | null>(null);
  const [bossRelicResult, setBossRelicResult] = useState<string | null>(null);

  const { ironOre, scrapAlloy, runeDust, emberCore, bioSamples, mossRations } =
    state.player.resources;
  const canRefineScrapAlloy = ironOre >= 3;
  const stabilizationSigilCrafted = hasStabilizationSigil(
    state.player.knownRecipes,
  );
  const sigilRuneOk = meetsRecipeRuneDepth(
    state.player,
    RUNE_CRAFTER_STABILIZATION_SIGIL,
  );

  const mossRecipeCost = useMemo(
    () => getDistrictCraftingCost(state.player, MOSS_RATION_RECIPE_COST),
    [state.player],
  );
  const needMossBio =
    mossRecipeCost.bioSamples ?? MOSS_RATION_RECIPE_COST.bioSamples;
  const needMossOre =
    mossRecipeCost.ironOre ?? MOSS_RATION_RECIPE_COST.ironOre;

  const sigilCost = useMemo(
    () =>
      getDistrictCraftingCost(state.player, {
        credits: RUNE_CRAFTER_STABILIZATION_SIGIL_COST.credits,
        runeDust: RUNE_CRAFTER_STABILIZATION_SIGIL_COST.runeDust,
        emberCore: RUNE_CRAFTER_STABILIZATION_SIGIL_COST.emberCore,
      }),
    [state.player],
  );
  const needSigilCredits =
    sigilCost.credits ?? RUNE_CRAFTER_STABILIZATION_SIGIL_COST.credits;
  const needSigilDust =
    sigilCost.runeDust ?? RUNE_CRAFTER_STABILIZATION_SIGIL_COST.runeDust;
  const needSigilEmber =
    sigilCost.emberCore ?? RUNE_CRAFTER_STABILIZATION_SIGIL_COST.emberCore;

  const canCraftStabilizationSigil =
    !stabilizationSigilCrafted &&
    sigilRuneOk &&
    state.player.resources.credits >= needSigilCredits &&
    runeDust >= needSigilDust &&
    emberCore >= needSigilEmber;
  const canCraftMossRation =
    ironOre >= needMossOre && bioSamples >= needMossBio;

  const careerCraftingHint = formatCareerFocusCraftingHint(
    state.player.careerFocus,
  );
  const craftingProfessionHint = formatCraftingProfessionHint(state.player);
  const craftingProfessionTier = getCraftingProfessionTier(state.player);

  function refineScrapAlloy() {
    if (!canRefineScrapAlloy) {
      setRefineResult("Need 3 Iron Ore to refine 1 Scrap Alloy.");
      return;
    }

    dispatch({
      type: "SPEND_RESOURCE",
      payload: { key: "ironOre", amount: 3 },
    });
    dispatch({
      type: "ADD_RESOURCE",
      payload: { key: "scrapAlloy", amount: 1 },
    });
    setRefineResult("Refinement complete. 3 Iron Ore became 1 Scrap Alloy.");
  }

  function craftStabilizationSigil() {
    if (stabilizationSigilCrafted) {
      setSigilResult(
        "Stabilization Sigil already inscribed. Recovery routines are permanently reinforced.",
      );
      return;
    }

    if (!sigilRuneOk) {
      setSigilResult(
        getRecipeRuneRequirementHint(RUNE_CRAFTER_STABILIZATION_SIGIL) ??
          "Rune depth too shallow for this inscription.",
      );
      return;
    }

    if (!canCraftStabilizationSigil) {
      setSigilResult(
        `Need ${needSigilCredits} Credits, ${needSigilDust} Rune Dust, and ${needSigilEmber} Ember Core.`,
      );
      return;
    }

    dispatch({
      type: "SPEND_RESOURCE",
      payload: {
        key: "credits",
        amount: needSigilCredits,
      },
    });
    dispatch({
      type: "SPEND_RESOURCE",
      payload: {
        key: "runeDust",
        amount: needSigilDust,
      },
    });
    dispatch({
      type: "SPEND_RESOURCE",
      payload: {
        key: "emberCore",
        amount: needSigilEmber,
      },
    });
    dispatch({
      type: "ADD_RECIPE",
      payload: RUNE_CRAFTER_STABILIZATION_SIGIL,
    });
    setSigilResult(
      `Sigil bound. All future recovery actions now restore +${RUNE_CRAFTER_STABILIZATION_SIGIL_BONUS} extra condition.`,
    );
  }

  function craftMossRation() {
    if (!canCraftMossRation) {
      setRationResult(
        `Need ${needMossBio} Bio Samples and ${needMossOre} Iron Ore to bind 1 Moss Ration.`,
      );
      return;
    }

    dispatch({ type: "CRAFT_MOSS_RATION" });
    setRationResult("Binding complete. 1 Moss Ration sealed for survival use.");
  }

  function refineBossRelic(recipeKey: BossRelicKey) {
    const recipe = BOSS_RELIC_REFINES[recipeKey];
    const cost = getDistrictCraftingCost(state.player, recipe.cost);
    const spendLines = Object.entries(cost).filter(
      (e): e is [ResourceKey, number] =>
        typeof e[1] === "number" && e[1] > 0,
    );
    const affordable = spendLines.every(
      ([key, amount]) => state.player.resources[key] >= amount,
    );
    if (!affordable) {
      setBossRelicResult("Insufficient materials for this refinement.");
      return;
    }
    for (const [key, amount] of spendLines) {
      dispatch({
        type: "SPEND_RESOURCE",
        payload: { key, amount },
      });
    }
    for (const [key, amount] of Object.entries(recipe.grant)) {
      if (typeof amount === "number" && amount > 0) {
        dispatch({
          type: "ADD_RESOURCE",
          payload: { key: key as ResourceKey, amount },
        });
      }
    }
    setBossRelicResult(`${recipe.title} complete. Salvage routed to stock.`);
  }

  function craftNextRunModifier(
    modifierId: (typeof nextRunModifierDefinitions)[number]["id"],
  ) {
    if (
      modifierId === "void-extract" &&
      !meetsRecipeRuneDepth(state.player, CRAFT_GATE_VOID_EXTRACT)
    ) {
      setRationResult(
        getRecipeRuneRequirementHint(CRAFT_GATE_VOID_EXTRACT) ??
          "Rune depth too shallow for Void Extract.",
      );
      return;
    }
    dispatch({ type: "CRAFT_NEXT_RUN_MODIFIER", payload: { modifierId } });
    setRationResult(
      "Kit primed. Next run will apply the modifier once, then clear.",
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(120,30,10,0.22),rgba(5,8,18,1)_55%)] px-6 py-8 text-white md:px-10">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-orange-300/70">
              Bazaar / District
            </div>
            <h1 className="mt-2 text-3xl font-black uppercase tracking-[0.04em]">
              Crafting District
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/70">
              A utility stop inside the current loop. Bring back salvage, bind
              one practical survival item, then return to recovery pressure,
              contracts, or the field.
            </p>
            {careerCraftingHint ? (
              <p className="mt-3 max-w-2xl rounded-xl border border-cyan-400/25 bg-cyan-950/35 px-4 py-3 text-sm text-cyan-100/90">
                {careerCraftingHint}
              </p>
            ) : null}
            <p className="mt-3 max-w-2xl rounded-xl border border-orange-400/25 bg-orange-950/25 px-4 py-3 text-sm text-orange-100/90">
              <span className="font-bold text-orange-200/95">
                Profession tier {craftingProfessionTier}
              </span>
              {" — "}
              {craftingProfessionHint}
            </p>
          </div>
        </div>

        <BazaarSubpageNav accentClassName="hover:border-orange-400/40" />

        <StallArrearsCallout />

        <div className="grid gap-6 md:grid-cols-3">
          {screenData.cards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_25px_rgba(0,0,0,0.22)]"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/45">
                  {card.label}
                </div>
                <div className="text-sm font-bold text-orange-300">
                  {card.value}
                </div>
              </div>
              <p className="mt-3 text-sm text-white/65">{card.hint}</p>
            </div>
          ))}
        </div>

        <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/8 p-6">
            <div className="text-[11px] uppercase tracking-[0.22em] text-emerald-300/70">
              Active Utility
            </div>
            <h2 className="mt-2 text-xl font-black uppercase">Moss Binder</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/72">
              This is the one clear M1 action here: turn recovered Bio Samples
              and Iron Ore into a Moss Ration so hunger pressure does not break
              the next loop step.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/25 p-6">
            <div className="text-[11px] uppercase tracking-[0.22em] text-orange-300/70">
              Loop Fit
            </div>
            <div className="mt-3 space-y-3 text-sm text-white/72">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                Hunt or contract for salvage.
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                Bind one ration when stores are slipping.
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                Recover, stabilize, and return to the next run.
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {craftingStations.map((station) => {
            const Icon = station.icon;

            return (
              <div
                key={station.title}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_25px_rgba(0,0,0,0.22)] transition hover:border-orange-400/30 hover:bg-white/[0.06]"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                    <Icon className="h-5 w-5 text-orange-300" />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-[0.08em]">
                      {station.title}
                    </h2>
                    <p className="mt-2 text-sm text-white/65">{station.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="grid gap-4">
            <div className="rounded-2xl border border-white/10 bg-black/25 p-6">
              <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-300/70">
                Crafting Console
              </div>
              <h2 className="mt-2 text-xl font-black uppercase">Working recipes</h2>
              <p className="mt-2 text-sm text-white/65">
                {craftRecipes.length} recipes are live in this build. Tabs group them by discipline.
                Crafting spends materials immediately and outputs either resources or a crafted
                item entry.
              </p>
              <p className="mt-2 rounded-xl border border-amber-300/22 bg-amber-950/15 px-4 py-3 text-xs leading-relaxed text-amber-100/88">
                Phase 4 (start) — Refining tab turns bulk ore, scrap, and biomass into alloy,
                cores, and dust. On success, Bio / Mecha / Pure operatives recover +1 of their
                path&apos;s staple reagent (samples, alloy, or dust).
              </p>
              <p className="mt-2 rounded-xl border border-cyan-300/20 bg-cyan-950/25 px-4 py-3 text-xs leading-relaxed text-cyan-100/85">
                Item rank rules: T1 is entry gear, T2 is combat-ready, T3 is rare war-grade,
                T4 is obsidian-cycle war metal (mythic ladder).
                Upgrade recipes consume more refined materials and boss relic stock.
              </p>

              <div className="mt-4">
                <RuneHierarchyDistrictCallout />
              </div>

              <CraftingConsole />
            </div>

            <CraftWorkOrderPanel />

            <div className="rounded-2xl border border-white/10 bg-black/25 p-6">
              <div className="text-[11px] uppercase tracking-[0.22em] text-emerald-300/70">
                Primary M1 Action
              </div>
              <h2 className="mt-2 text-xl font-black uppercase">Bind Moss Ration</h2>
              <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-500/8 p-4">
                <div className="text-sm font-semibold text-white">
                  Convert recovered biomass into one immediate survival buffer.
                </div>
                <div className="mt-2 text-sm text-white/65">
                  Current utility proof: bind {needMossBio} Bio Samples and{" "}
                  {needMossOre} Iron Ore into 1 Moss Ration.
                </div>
                <div className="mt-3 rounded-xl border border-cyan-400/20 bg-cyan-400/8 px-4 py-3 text-sm text-cyan-50/88">
                  Next Step: bind a ration when hunger is becoming the next blocker, then return to Feast Hall, contracts, or the field.
                </div>

                <button
                  type="button"
                  onClick={craftMossRation}
                  disabled={!canCraftMossRation}
                  className="mt-4 w-full rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-left text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Bind Moss Ration
                  <div className="mt-1 text-xs text-white/60">
                    Costs {needMossBio} Bio Samples + {needMossOre} Iron Ore / Produces
                    1 Moss Ration
                  </div>
                </button>

                <div className="mt-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75">
                  {rationResult ??
                    "Binder idle. Use this when hunger pressure threatens to turn the next run into a bad trade."}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 p-6">
              <div className="text-[11px] uppercase tracking-[0.22em] text-orange-300/70">
                Material Refining
              </div>
              <h2 className="mt-2 text-xl font-black uppercase">Refinery Bay</h2>

              <div className="mt-4 grid gap-3">
                <div className="rounded-xl border border-orange-400/20 bg-orange-500/8 p-4">
                  <div className="mt-2 text-sm font-semibold text-white">
                    Convert raw ore into usable alloy plating.
                  </div>
                  <div className="mt-2 text-sm text-white/65">
                    Immediate district function for M1: refine 3 Iron Ore into 1
                    Scrap Alloy.
                  </div>

                  <button
                    type="button"
                    onClick={refineScrapAlloy}
                    disabled={!canRefineScrapAlloy}
                    className="mt-4 w-full rounded-xl border border-orange-400/30 bg-orange-500/10 px-4 py-3 text-left text-sm font-semibold text-orange-100 transition hover:bg-orange-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Refine Scrap Alloy
                    <div className="mt-1 text-xs text-white/60">
                      Costs 3 Iron Ore / Produces 1 Scrap Alloy
                    </div>
                  </button>

                  <div className="mt-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75">
                    {refineResult ??
                      "Refinery idle. Process raw ore whenever you need alloy."}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 p-6">
              <div className="text-[11px] uppercase tracking-[0.22em] text-violet-300/70">
                Boss relic refinement
              </div>
              <h2 className="mt-2 text-xl font-black uppercase">
                Phase‑2 mat sinks
              </h2>
              <p className="mt-2 text-sm text-white/65">
                Void boss pulls only. Break them down when you need working
                stock—not hoard dead weight.
              </p>
              <div className="mt-4 grid gap-3">
                {(
                  Object.keys(BOSS_RELIC_REFINES) as BossRelicKey[]
                ).map((key) => {
                  const recipe = BOSS_RELIC_REFINES[key];
                  const cost = getDistrictCraftingCost(state.player, recipe.cost);
                  const lines = Object.entries(cost).filter(
                    (e): e is [ResourceKey, number] =>
                      typeof e[1] === "number" && e[1] > 0,
                  );
                  const canAffordBoss = lines.every(
                    ([k, amt]) => state.player.resources[k] >= amt,
                  );
                  return (
                    <div
                      key={key}
                      className="rounded-xl border border-violet-400/20 bg-violet-950/20 p-4"
                    >
                      <div className="text-sm font-semibold text-white">
                        {recipe.title}
                      </div>
                      <p className="mt-1 text-xs text-white/55">{recipe.blurb}</p>
                      <div className="mt-2 text-xs text-white/70">
                        <span className="font-semibold text-white/90">
                          Pay:
                        </span>{" "}
                        {lines.map(([k, v]) => `${v} ${k}`).join(" · ")}
                      </div>
                      <div className="mt-1 text-xs text-white/70">
                        <span className="font-semibold text-white/90">
                          Receive:
                        </span>{" "}
                        {Object.entries(recipe.grant)
                          .filter(
                            (e): e is [string, number] =>
                              typeof e[1] === "number",
                          )
                          .map(([k, v]) => `${v} ${k}`)
                          .join(" · ")}
                      </div>
                      <button
                        type="button"
                        onClick={() => refineBossRelic(key)}
                        disabled={!canAffordBoss}
                        className="mt-3 w-full rounded-xl border border-violet-400/35 bg-violet-600/15 px-4 py-3 text-left text-sm font-semibold text-violet-100 transition hover:bg-violet-600/22 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Refine
                      </button>
                    </div>
                  );
                })}
              </div>
              {bossRelicResult ? (
                <div className="mt-3 rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/80">
                  {bossRelicResult}
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 p-6">
              <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-300/70">
                Next Run Modifiers
              </div>
              <h2 className="mt-2 text-xl font-black uppercase">
                Prime One Kit
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/70">
                No inventory layer: pick one kit, pay the cost, and it applies on the next run only.
              </p>
              <div className="mt-4 grid gap-3">
                {nextRunModifierDefinitions.map((def) => {
                  const effectiveCost = getDistrictCraftingCost(
                    state.player,
                    def.cost,
                  );
                  const costEntries = Object.entries(effectiveCost).filter(
                    (e): e is [ResourceKey, number] =>
                      typeof e[1] === "number",
                  );
                  const voidExtractRuneOk =
                    def.id !== "void-extract" ||
                    meetsRecipeRuneDepth(state.player, CRAFT_GATE_VOID_EXTRACT);
                  const canAfford =
                    voidExtractRuneOk &&
                    costEntries.every(([key, amount]) => {
                      const resourceKey =
                        key as keyof typeof state.player.resources;
                      return (
                        (state.player.resources[resourceKey] ?? 0) >= amount
                      );
                    });

                  return (
                    <div
                      key={def.id}
                      className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-white">
                            {def.title}
                          </div>
                          <div className="mt-1 text-xs text-white/60">
                            {def.description}
                          </div>
                        </div>
                        {state.player.nextRunModifiers?.id === def.id ? (
                          <span className="shrink-0 rounded-full border border-cyan-300/30 bg-cyan-300/12 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-50">
                            Primed
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-3 grid gap-2 text-xs text-white/70">
                        <div>
                          <span className="font-semibold text-white">Cost:</span>{" "}
                          {costEntries.map(([k, v]) => `${v} ${k}`).join(" · ")}
                        </div>
                        <div>
                          <span className="font-semibold text-white">
                            Next Run Effect:
                          </span>{" "}
                          {def.modifiers.nextRunEffect}
                        </div>
                      </div>

                      {def.id === "void-extract" && !voidExtractRuneOk ? (
                        <div className="mt-3 rounded-xl border border-violet-400/25 bg-violet-950/40 px-4 py-3 text-xs text-violet-100/90">
                          {getRecipeRuneRequirementHint(CRAFT_GATE_VOID_EXTRACT)}
                        </div>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => craftNextRunModifier(def.id)}
                        disabled={!canAfford}
                        className="mt-3 w-full rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-left text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/18 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Prime {def.title}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-2xl border border-white/10 bg-black/25 p-6">
              <div className="text-[11px] uppercase tracking-[0.22em] text-orange-300/70">
                Rune Crafter Output
              </div>
              <h2 className="mt-2 text-xl font-black uppercase">
                Stabilization Sigil
              </h2>
              <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-500/8 p-4">
                <div className="text-sm font-semibold text-white">
                  Inscribe a permanent recovery ward into your field kit.
                </div>
                <div className="mt-2 text-sm text-white/65">
                  This is the first live profession output: Rune Crafter work
                  that directly strengthens the recovery step after exploration
                  and missions drain condition.
                </div>
                <div className="mt-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70">
                  Use this after the basic loop already makes sense. Moss Binder is still the clearest first-session utility action.
                </div>

                {!stabilizationSigilCrafted && !sigilRuneOk ? (
                  <div className="mt-3 rounded-xl border border-violet-400/25 bg-violet-950/40 px-4 py-3 text-sm text-violet-100/85">
                    {getRecipeRuneRequirementHint(RUNE_CRAFTER_STABILIZATION_SIGIL)}
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={craftStabilizationSigil}
                  disabled={!canCraftStabilizationSigil}
                  className="mt-4 w-full rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-left text-sm font-semibold text-amber-100 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {stabilizationSigilCrafted
                    ? "Stabilization Sigil Inscribed"
                    : "Craft Stabilization Sigil"}
                  <div className="mt-1 text-xs text-white/60">
                    Costs {needSigilCredits} Credits / {needSigilDust} Rune Dust /{" "}
                    {needSigilEmber} Ember Core
                  </div>
                </button>

                <div className="mt-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75">
                  {sigilResult ??
                    (stabilizationSigilCrafted
                      ? `Active. Recovery actions now restore +${RUNE_CRAFTER_STABILIZATION_SIGIL_BONUS} extra condition.`
                      : "Inactive. Craft the sigil to turn Rune Crafter output into a real recovery advantage.")}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 p-6">
              <div className="text-[11px] uppercase tracking-[0.22em] text-orange-300/70">
                Resources
              </div>
              <h2 className="mt-2 text-xl font-black uppercase">Material Stock</h2>
              <div className="mt-4 space-y-3 text-sm text-white/75">
                <div className="flex justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                  <span>Iron Ore</span>
                  <span>{ironOre}</span>
                </div>
                <div className="flex justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                  <span>Scrap Alloy</span>
                  <span>{scrapAlloy}</span>
                </div>
                <div className="flex justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                  <span>Rune Dust</span>
                  <span>{runeDust}</span>
                </div>
                <div className="flex justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                  <span>Ember Core</span>
                  <span>{emberCore}</span>
                </div>
                <div className="flex justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                  <span>Bio Samples</span>
                  <span>{bioSamples}</span>
                </div>
                <div className="flex justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                  <span>Moss Rations</span>
                  <span>{mossRations}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
