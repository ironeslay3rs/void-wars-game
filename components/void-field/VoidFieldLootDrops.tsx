"use client";

import Image from "next/image";
import { useEffect, useState, type MutableRefObject } from "react";
import { playSound } from "@/features/audio/soundEngine";
import type { VoidFieldLootDropVfx } from "@/features/void-maps/voidFieldLootDrops";

const HOLD_MS = 420;
const HOME_MS = 760;
/** Loot only homes when the player is within this % of the drop.
 *  Creates a "go get it" loop — you have to walk near loot to pick it
 *  up, which adds positioning gameplay. */
const PICKUP_RADIUS_PCT = 18;

function LootDropItem({
  drop,
  playerPctRef,
  onConsumed,
}: {
  drop: VoidFieldLootDropVfx;
  playerPctRef: MutableRefObject<{ x: number; y: number }>;
  onConsumed: (id: string) => void;
}) {
  const [phase, setPhase] = useState<"hold" | "waiting" | "home">("hold");
  const [x, setX] = useState(drop.xPct);
  const [y, setY] = useState(drop.yPct);
  const [opacity, setOpacity] = useState(1);

  // After the hold phase, check proximity before homing.
  // If the player is too far, the drop waits on the ground.
  useEffect(() => {
    const t = window.setTimeout(() => setPhase("waiting"), HOLD_MS);
    return () => window.clearTimeout(t);
  }, []);

  // Proximity check: poll every 200ms until player is close enough.
  useEffect(() => {
    if (phase !== "waiting") return;
    const id = window.setInterval(() => {
      const p = playerPctRef.current;
      const dx = p.x - drop.xPct;
      const dy = p.y - drop.yPct;
      if (Math.hypot(dx, dy) <= PICKUP_RADIUS_PCT) {
        setPhase("home");
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [phase, drop.xPct, drop.yPct, playerPctRef]);

  useEffect(() => {
    if (phase !== "home") return;

    const fromX = drop.xPct;
    const fromY = drop.yPct;
    const t0 = performance.now();
    let raf = 0;

    const easeOut = (u: number) => 1 - (1 - u) * (1 - u);

    const tick = (now: number) => {
      const u = Math.min(1, (now - t0) / HOME_MS);
      const e = easeOut(u);
      const to = playerPctRef.current;
      setX(fromX + (to.x - fromX) * e);
      setY(fromY + (to.y - fromY) * e);
      /** Full read until late homing; sharp fade only in final ~16%. */
      if (u < 0.84) setOpacity(1);
      else setOpacity(1 - (u - 0.84) / 0.16);

      if (u < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        playSound("loot");
        onConsumed(drop.id);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, drop.id, drop.xPct, drop.yPct, onConsumed, playerPctRef]);

  return (
    <div
      className="pointer-events-none absolute z-[22] will-change-[opacity,transform]"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        opacity,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div
        className={`flex flex-col items-center gap-1 ${
          phase === "hold"
            ? "void-field-loot-pop"
            : phase === "waiting"
              ? "void-field-loot-waiting"
              : ""
        }`}
      >
        <div className="relative h-11 w-11 md:h-12 md:w-12">
          <span
            className="void-field-loot-spawn-pulse pointer-events-none absolute left-1/2 top-1/2 z-0 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyan-200/50 bg-cyan-400/15 md:h-16 md:w-16"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute inset-[-14px] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.55),rgba(34,211,238,0.22)_35%,transparent_72%)] blur-[3px] md:inset-[-16px]"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute inset-[-6px] rounded-full bg-[radial-gradient(circle,rgba(250,250,250,0.2),transparent_62%)]"
            aria-hidden
          />
          <Image
            src={drop.iconSrc}
            alt=""
            width={48}
            height={48}
            className="relative z-[1] h-11 w-11 object-contain object-center drop-shadow-[0_0_18px_rgba(34,211,238,0.75),0_0_32px_rgba(6,182,212,0.35),0_3px_10px_rgba(0,0,0,0.9)] md:h-12 md:w-12"
            draggable={false}
          />
        </div>
        <div
          className="flex max-w-[min(200px,42vw)] flex-col items-center gap-0.5 text-center"
          style={{
            transform: `translate(${drop.labelNudgeXpx}px, ${drop.labelNudgeYpx}px)`,
          }}
        >
          <span className="text-[9px] font-bold leading-snug tracking-wide text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.98),0_0_10px_rgba(0,0,0,0.55)] md:text-[10px]">
            {drop.label}
          </span>
          <span className="text-[8px] font-medium leading-snug tracking-wide text-emerald-100/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] md:text-[9px]">
            {drop.subtitle}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function VoidFieldLootDrops({
  drops,
  playerPctRef,
  onConsumed,
}: {
  drops: VoidFieldLootDropVfx[];
  playerPctRef: MutableRefObject<{ x: number; y: number }>;
  onConsumed: (id: string) => void;
}) {
  if (drops.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible">
      {drops.map((d) => (
        <LootDropItem
          key={d.id}
          drop={d}
          playerPctRef={playerPctRef}
          onConsumed={onConsumed}
        />
      ))}
    </div>
  );
}
