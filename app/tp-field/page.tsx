"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FieldHUD from "@/components/field/FieldHUD";
import {
  DEFAULT_FIELD_ZONE_ID,
  FIELD_HEIGHT_TILES,
  FIELD_ZONES,
  FIELD_TILE_SIZE_PX,
  FIELD_WIDTH_TILES,
  getFieldZone,
  isExtractionInZone,
  isObstacleInZone,
  type FieldZoneId,
} from "@/features/field/fieldMap";
import {
  createInitialFieldSession,
  nextPositionForInput,
  type FieldSessionState,
} from "@/features/field/fieldState";
import { useGame } from "@/features/game/gameContext";

const VIEWPORT_WIDTH_TILES = 20;
const VIEWPORT_HEIGHT_TILES = 14;

export default function TpFieldPage() {
  const router = useRouter();
  const { state } = useGame();
  const [selectedZoneId, setSelectedZoneId] =
    useState<FieldZoneId>(DEFAULT_FIELD_ZONE_ID);
  const [phase, setPhase] = useState<"menu" | "live">("menu");
  const [field, setField] = useState<FieldSessionState>(() =>
    createInitialFieldSession(DEFAULT_FIELD_ZONE_ID),
  );

  const zone = getFieldZone(field.zoneId);
  const selectedZone = getFieldZone(selectedZoneId);

  function handleDeploySelectedZone() {
    setField(createInitialFieldSession(selectedZoneId));
    setPhase("live");
  }

  useEffect(() => {
    if (phase !== "live") return;
    const timer = window.setInterval(() => {
      setField((prev) => {
        if (prev.fieldTimerSeconds <= 0) return prev;
        return { ...prev, fieldTimerSeconds: prev.fieldTimerSeconds - 1 };
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "live") return;
    if (field.fieldTimerSeconds <= 0) {
      router.push("/home");
    }
  }, [phase, field.fieldTimerSeconds, router]);

  useEffect(() => {
    if (phase !== "live") return;
    function onKeyDown(e: KeyboardEvent) {
      const next = nextPositionForInput(field.playerPosition, e.key, field.zoneId);
      if (next.x === field.playerPosition.x && next.y === field.playerPosition.y) return;
      setField((prev) => ({ ...prev, playerPosition: next }));
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase, field.playerPosition, field.zoneId]);

  useEffect(() => {
    if (phase !== "live") return;
    if (isExtractionInZone(zone, field.playerPosition.x, field.playerPosition.y)) {
      router.push("/home");
    }
  }, [phase, zone, field.playerPosition, router]);

  const cameraOffset = useMemo(() => {
    const centerX = Math.floor(VIEWPORT_WIDTH_TILES / 2);
    const centerY = Math.floor(VIEWPORT_HEIGHT_TILES / 2);
    const maxX = FIELD_WIDTH_TILES - VIEWPORT_WIDTH_TILES;
    const maxY = FIELD_HEIGHT_TILES - VIEWPORT_HEIGHT_TILES;
    const camX = Math.max(0, Math.min(maxX, field.playerPosition.x - centerX));
    const camY = Math.max(0, Math.min(maxY, field.playerPosition.y - centerY));
    return { x: camX, y: camY };
  }, [field.playerPosition]);

  if (phase === "menu") {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(70,35,100,0.22),rgba(5,8,16,1)_60%)] px-4 py-6 text-white md:px-6">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
          <Link
            href="/home"
            className="rounded-lg border border-white/20 bg-black/45 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/80 hover:border-white/40 hover:text-white"
          >
            Back to Home
          </Link>
          <span className="rounded-lg border border-fuchsia-300/35 bg-fuchsia-500/14 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-fuchsia-100">
            TP Layer · Step 11
          </span>
        </div>

        <section className="mx-auto mt-5 w-full max-w-5xl rounded-2xl border border-white/15 bg-black/55 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)] md:p-5">
          <h1 className="text-lg font-black uppercase tracking-[0.08em] text-white md:text-xl">
            TP Field Interaction Menu
          </h1>
          <p className="mt-2 text-sm text-white/65">
            Select a field and deploy. This TP layer is isolated from the Deploy
            Into the Void map flow.
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {(Object.values(FIELD_ZONES) as Array<(typeof FIELD_ZONES)[FieldZoneId]>).map(
              (entry) => {
                const selected = entry.id === selectedZoneId;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => setSelectedZoneId(entry.id)}
                    className={[
                      "rounded-xl border p-4 text-left transition",
                      selected
                        ? "border-fuchsia-300/55 bg-fuchsia-500/14"
                        : "border-white/15 bg-black/35 hover:border-white/30",
                    ].join(" ")}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/60">
                      {entry.tierLabel}
                    </div>
                    <div className="mt-1 text-base font-black text-white">
                      {entry.name}
                    </div>
                    <div className="mt-1 text-xs text-white/60">
                      {entry.encounters} encounters · {entry.timerSeconds}s timer
                    </div>
                  </button>
                );
              },
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleDeploySelectedZone}
              className="rounded-xl border border-fuchsia-300/50 bg-fuchsia-500/20 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-fuchsia-100 hover:border-fuchsia-200/70 hover:bg-fuchsia-500/28"
            >
              Deploy to {selectedZone.name}
            </button>
            <p className="text-xs text-white/55">
              Spawn {selectedZone.defaultSpawn.x},{selectedZone.defaultSpawn.y}
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(40,70,90,0.25),rgba(5,8,16,1)_60%)] text-white">
      <FieldHUD
        condition={state.player.condition}
        zoneName={field.currentZoneName}
        zoneTier={field.currentZoneTier}
        timerSeconds={field.fieldTimerSeconds}
        encountersRemaining={field.encountersRemaining}
        playerPosition={field.playerPosition}
      />

      <div className="flex min-h-screen items-center justify-center px-4 py-20">
        <div
          className="relative overflow-hidden rounded-2xl border border-white/15 bg-black/45 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
          style={{
            width: VIEWPORT_WIDTH_TILES * FIELD_TILE_SIZE_PX,
            height: VIEWPORT_HEIGHT_TILES * FIELD_TILE_SIZE_PX,
          }}
        >
          <div
            className="absolute left-0 top-0 transition-transform duration-100"
            style={{
              width: FIELD_WIDTH_TILES * FIELD_TILE_SIZE_PX,
              height: FIELD_HEIGHT_TILES * FIELD_TILE_SIZE_PX,
              transform: `translate(${-cameraOffset.x * FIELD_TILE_SIZE_PX}px, ${-cameraOffset.y * FIELD_TILE_SIZE_PX}px)`,
            }}
          >
            {Array.from({ length: FIELD_HEIGHT_TILES }).map((_, y) =>
              Array.from({ length: FIELD_WIDTH_TILES }).map((__, x) => {
                const obstacle = isObstacleInZone(zone, x, y);
                const extraction = isExtractionInZone(zone, x, y);
                const playerHere =
                  field.playerPosition.x === x && field.playerPosition.y === y;

                return (
                  <div
                    key={`${x}-${y}`}
                    className={[
                      "absolute border border-white/5",
                      obstacle
                        ? "bg-slate-700/70"
                        : extraction
                          ? "bg-emerald-500/35"
                          : "bg-slate-900/70",
                    ].join(" ")}
                    style={{
                      left: x * FIELD_TILE_SIZE_PX,
                      top: y * FIELD_TILE_SIZE_PX,
                      width: FIELD_TILE_SIZE_PX,
                      height: FIELD_TILE_SIZE_PX,
                    }}
                  >
                    {playerHere ? (
                      <div className="flex h-full w-full items-center justify-center">
                        <div className="h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
                      </div>
                    ) : null}
                  </div>
                );
              }),
            )}
          </div>
        </div>
      </div>

      <div className="pointer-events-auto absolute right-4 top-16 z-40 md:right-6">
        <button
          type="button"
          onClick={() => setPhase("menu")}
          className="rounded-lg border border-white/20 bg-black/45 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white/80 hover:border-white/40 hover:text-white"
        >
          Change Field
        </button>
      </div>
    </main>
  );
}
