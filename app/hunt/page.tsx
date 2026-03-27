"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ScreenHeader from "@/components/shared/ScreenHeader";
import HuntResult from "@/components/hunt/HuntResult";
import { useGame } from "@/features/game/gameContext";
import { voidZoneById, type VoidZoneId } from "@/features/void-maps/zoneData";
import { pickCreatureForZone } from "@/features/combat/creatureData";
import { resolveEncounter, type EncounterOutcome } from "@/features/combat/encounterEngine";
import type { ResourceKey, ResourcesState } from "@/features/game/gameTypes";

function barPct(current: number, max: number) {
  if (max <= 0) return 0;
  return Math.max(0, Math.min(100, (current / max) * 100));
}

export default function HuntPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const missionId = searchParams.get("missionId") ?? "hg-rustfang-prowl";
  const zoneParam = (searchParams.get("zone") ?? "howling-scar") as VoidZoneId;
  const returnHref = searchParams.get("return") ?? "/home";

  const zone = Object.prototype.hasOwnProperty.call(voidZoneById, zoneParam)
    ? voidZoneById[zoneParam]
    : voidZoneById["howling-scar"];

  const { state, dispatch } = useGame();

  const [seed] = useState(() => {
    return `${missionId}-${zone.id}-${state.player.playerName}-${Date.now()}`;
  });

  const creature = useMemo(() => {
    // cheap seed01
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    const seed01 = (h % 10_000) / 10_000;
    return pickCreatureForZone(zone.id, seed01);
  }, [seed, zone.id]);

  const [phase, setPhase] = useState<"intro" | "resolving" | "done">("intro");
  const [playerHp, setPlayerHp] = useState(() => Math.max(0, Math.min(100, state.player.condition)));
  const [creatureHp, setCreatureHp] = useState(() => creature.hp);
  const [outcome, setOutcome] = useState<EncounterOutcome>("retreat");
  const [loot, setLoot] = useState<Partial<ResourcesState>>({});
  const [rankXpEarned, setRankXpEarned] = useState(0);
  const [conditionCost, setConditionCost] = useState(0);
  const [narrative, setNarrative] = useState("");
  const [contractResources, setContractResources] = useState<Partial<ResourcesState>>({});
  const [contractConditionDelta, setContractConditionDelta] = useState(0);

  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      for (const id of timeoutsRef.current) {
        window.clearTimeout(id);
      }
      timeoutsRef.current = [];
    };
  }, []);

  function handleEngage() {
    if (phase !== "intro") return;
    setPhase("resolving");

    const r = resolveEncounter({ player: state.player, creature, seed });
    setOutcome(r.outcome);
    setLoot(r.loot);
    setRankXpEarned(r.rankXpEarned);
    setConditionCost(r.conditionCost);
    setNarrative(r.narrative);

    // Animate bars over ~2.5s, then apply state changes.
    setPlayerHp(r.playerHpStart);
    setCreatureHp(r.creatureHpStart);

    const t1 = window.setTimeout(() => {
      setCreatureHp(r.creatureHpEnd);
      setPlayerHp(r.playerHpEnd);
    }, 700);

    const t2 = window.setTimeout(() => {
      // Apply encounter deltas.
      if (r.conditionCost > 0) {
        dispatch({ type: "ADJUST_CONDITION", payload: -r.conditionCost });
      }

      if (r.outcome === "victory") {
        for (const [k, v] of Object.entries(r.loot)) {
          if (typeof v === "number" && v > 0) {
            dispatch({
              type: "ADD_FIELD_LOOT",
              payload: { key: k as ResourceKey, amount: v },
            });
          }
        }

        if (r.rankXpEarned > 0) {
          dispatch({ type: "GAIN_RANK_XP", payload: r.rankXpEarned });
        }

        dispatch({ type: "RESOLVE_HUNT", payload: { missionId } });

        const mission = state.missions.find((m) => m.id === missionId) ?? null;
        if (mission?.reward?.resources) {
          setContractResources(mission.reward.resources);
        }
        setContractConditionDelta(mission?.reward?.conditionDelta ?? 0);
      }

      setPhase("done");
    }, 2600);

    timeoutsRef.current = [t1, t2];
  }

  return (
    <main className={["min-h-screen px-6 py-10 text-white md:px-10", zone.backdropClassName].join(" ")}>
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <ScreenHeader
          backHref={returnHref}
          backLabel="Return"
          eyebrow="Hunt Encounter"
          title={zone.label}
          subtitle="Auto-resolving contact encounter. Victory yields loot; defeat costs condition."
        />

        <section className="rounded-2xl border border-white/12 bg-black/25 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">
                Creature encountered
              </div>
              <div className="mt-2 text-2xl font-black uppercase tracking-[0.05em] text-white">
                {creature.name}
              </div>
              <div className="mt-2 text-sm text-white/70">{creature.description}</div>
            </div>
            <div className="rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white/75">
              <div>HP {creature.hp}</div>
              <div>ATK {creature.attack}</div>
              <div>DEF {creature.defense}</div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                Operative condition
              </div>
              <div className="mt-2 text-sm font-semibold text-white">{playerHp}%</div>
              <div className="mt-3 h-3 overflow-hidden rounded-full border border-white/10 bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300 transition-[width] duration-700"
                  style={{ width: `${barPct(playerHp, 100)}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                Creature vitality
              </div>
              <div className="mt-2 text-sm font-semibold text-white">{creatureHp}/{creature.hp}</div>
              <div className="mt-3 h-3 overflow-hidden rounded-full border border-white/10 bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-400 to-amber-300 transition-[width] duration-700"
                  style={{ width: `${barPct(creatureHp, creature.hp)}%` }}
                />
              </div>
            </div>
          </div>

          {phase === "intro" ? (
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleEngage}
                className="rounded-xl border border-cyan-400/35 bg-cyan-500/12 px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-cyan-50 hover:border-cyan-300/55 hover:bg-cyan-500/18"
              >
                Engage
              </button>
              <button
                type="button"
                onClick={() => router.push(returnHref)}
                className="rounded-xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white/80 hover:border-white/25 hover:bg-white/10"
              >
                Retreat
              </button>
            </div>
          ) : null}

          {phase === "resolving" ? (
            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
              Resolving encounter…
            </div>
          ) : null}
        </section>

        {phase === "done" ? (
          <HuntResult
            creatureName={creature.name}
            outcome={outcome}
            narrative={narrative}
            loot={loot}
            rankXpEarned={rankXpEarned}
            conditionCost={conditionCost}
            conditionAfter={state.player.condition}
            contractResources={contractResources}
            contractConditionDelta={contractConditionDelta}
            returnHref={returnHref}
          />
        ) : null}
      </div>
    </main>
  );
}

