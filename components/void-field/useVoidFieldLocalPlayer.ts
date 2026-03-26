"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type PointerEvent,
} from "react";

const INITIAL_X = 0.5;
const INITIAL_Y = 0.82;
const CLAMP_MIN = 0.02;
const CLAMP_MAX = 0.98;
/** Normalized units per second toward click target (~28% of field per second). */
const MOVE_SPEED = 0.245;
const ARRIVE_EPS = 0.007;
// Within this distance, we slow down to reduce "sliding" and make approach feel deliberate.
const ARRIVE_SLOW_DIST = 0.085;
const SYNC_INTERVAL_MS = 110;
const SYNC_DIST_MIN_PCT = 0.75;

export type NormalizedVec2 = { x: number; y: number };

function clampNorm(n: number) {
  return Math.min(CLAMP_MAX, Math.max(CLAMP_MIN, n));
}

/**
 * Local 0–1 field position, click-to-move with rAF interpolation.
 * `movementEnabled` gates pointer → move (M1: keep true on field).
 * `serverSyncEnabled` gates throttled `syncMove` (realtime + running hunt).
 */
export function useVoidFieldLocalPlayer({
  movementEnabled,
  serverSyncEnabled,
  selfPositionPctRef,
  syncMove,
}: {
  movementEnabled: boolean;
  serverSyncEnabled: boolean;
  selfPositionPctRef: MutableRefObject<{ x: number; y: number }>;
  syncMove: (xPct: number, yPct: number) => void;
}) {
  const [positionNorm, setPositionNorm] = useState<NormalizedVec2>({
    x: INITIAL_X,
    y: INITIAL_Y,
  });

  const posRef = useRef<NormalizedVec2>({ x: INITIAL_X, y: INITIAL_Y });
  const targetNormRef = useRef<NormalizedVec2 | null>(null);
  const syncMoveRef = useRef(syncMove);
  const serverSyncRef = useRef(serverSyncEnabled);
  const lastSyncRef = useRef({ x: 50, y: 82, t: 0 });
  const prevServerSyncRef = useRef(false);

  useEffect(() => {
    syncMoveRef.current = syncMove;
  }, [syncMove]);

  useEffect(() => {
    serverSyncRef.current = serverSyncEnabled;
  }, [serverSyncEnabled]);

  const maybeSync = useCallback(
    (xNorm: number, yNorm: number) => {
      const xPct = xNorm * 100;
      const yPct = yNorm * 100;
      selfPositionPctRef.current = { x: xPct, y: yPct };
      if (!serverSyncRef.current) return;

      const now = Date.now();
      const last = lastSyncRef.current;
      const dist = Math.hypot(xPct - last.x, yPct - last.y);
      if (
        now - last.t >= SYNC_INTERVAL_MS ||
        dist >= SYNC_DIST_MIN_PCT
      ) {
        lastSyncRef.current = { x: xPct, y: yPct, t: now };
        syncMoveRef.current(xPct, yPct);
      }
    },
    [selfPositionPctRef],
  );

  useEffect(() => {
    if (!movementEnabled) {
      targetNormRef.current = null;
    }
  }, [movementEnabled]);

  useEffect(() => {
    if (serverSyncEnabled && !prevServerSyncRef.current) {
      const { x, y } = posRef.current;
      const xp = x * 100;
      const yp = y * 100;
      selfPositionPctRef.current = { x: xp, y: yp };
      const now = Date.now();
      lastSyncRef.current = { x: xp, y: yp, t: now };
      syncMoveRef.current(xp, yp);
    }
    prevServerSyncRef.current = serverSyncEnabled;
  }, [serverSyncEnabled, selfPositionPctRef]);

  useEffect(() => {
    let frame = 0;
    let lastNow = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.045, (now - lastNow) / 1000);
      lastNow = now;

      const target = targetNormRef.current;
      if (movementEnabled && target) {
        let { x, y } = posRef.current;
        const dx = target.x - x;
        const dy = target.y - y;
        const dist = Math.hypot(dx, dy);

        if (dist <= ARRIVE_EPS) {
          targetNormRef.current = null;
        } else {
          const speedScale = Math.min(1, dist / ARRIVE_SLOW_DIST);
          // Ease-in/out: far away is near full speed, close-in is noticeably slower.
          const easedScale = 0.35 + 0.65 * speedScale * speedScale;
          const step = Math.min(dist, MOVE_SPEED * dt * easedScale);
          x = clampNorm(x + (dx / dist) * step);
          y = clampNorm(y + (dy / dist) * step);
          posRef.current = { x, y };
          setPositionNorm({ x, y });
          maybeSync(x, y);
        }
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [movementEnabled, maybeSync]);

  const onFieldPointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!movementEnabled) return;
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return;
      const x = clampNorm((e.clientX - r.left) / r.width);
      const y = clampNorm((e.clientY - r.top) / r.height);
      targetNormRef.current = { x, y };
    },
    [movementEnabled],
  );

  const setMoveTargetPct = useCallback(
    (xPct: number, yPct: number) => {
      if (!movementEnabled) return;
      targetNormRef.current = {
        x: clampNorm(xPct / 100),
        y: clampNorm(yPct / 100),
      };
    },
    [movementEnabled],
  );

  return {
    positionNorm,
    onFieldPointerDown,
    setMoveTargetPct,
  };
}
