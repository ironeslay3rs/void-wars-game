"use client";

import { useCallback, useRef, useState, type PointerEvent } from "react";

/**
 * Mobile virtual joystick — translucent thumb-stick overlay for
 * touch-based void field movement.
 *
 * Positioned bottom-left of the field. Dragging the thumb away from
 * center calls `onMove(dxPct, dyPct)` where dx/dy are % of field to
 * move per tick. The component handles pointer capture so the thumb
 * can track outside the visual bounds.
 *
 * Desktop users don't see this — the parent should only mount it
 * when touch is detected (`'ontouchstart' in window` or media query).
 */
export default function VirtualJoystick({
  onMove,
  onRelease,
  size = 120,
}: {
  /** Called continuously while dragging. dx/dy in field % per tick. */
  onMove: (dxPct: number, dyPct: number) => void;
  /** Called when the thumb is released. */
  onRelease: () => void;
  /** Diameter of the joystick base in px. Default 120. */
  size?: number;
}) {
  const baseRef = useRef<HTMLDivElement>(null);
  const [thumbOffset, setThumbOffset] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);
  const animRef = useRef(0);
  const thumbRef = useRef({ x: 0, y: 0 });

  const radius = size / 2;
  const deadZone = radius * 0.15;

  const handlePointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const el = baseRef.current;
      if (!el) return;
      el.setPointerCapture(e.pointerId);
      setActive(true);

      // Start continuous movement loop.
      const tick = () => {
        const { x, y } = thumbRef.current;
        const dist = Math.hypot(x, y);
        if (dist > deadZone) {
          // Normalize to 0..1, then scale to field % per frame (~5% max).
          const scale = Math.min(1, (dist - deadZone) / (radius - deadZone));
          const nx = x / dist;
          const ny = y / dist;
          onMove(nx * scale * 1.8, ny * scale * 1.8);
        }
        animRef.current = requestAnimationFrame(tick);
      };
      animRef.current = requestAnimationFrame(tick);
    },
    [onMove, radius, deadZone],
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!active) return;
      const el = baseRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      let dx = e.clientX - cx;
      let dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > radius) {
        dx = (dx / dist) * radius;
        dy = (dy / dist) * radius;
      }
      thumbRef.current = { x: dx, y: dy };
      setThumbOffset({ x: dx, y: dy });
    },
    [active, radius],
  );

  const handlePointerUp = useCallback(() => {
    setActive(false);
    setThumbOffset({ x: 0, y: 0 });
    thumbRef.current = { x: 0, y: 0 };
    cancelAnimationFrame(animRef.current);
    onRelease();
  }, [onRelease]);

  return (
    <div
      ref={baseRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="touch-manipulation absolute z-[55] rounded-full border-2 border-white/20 bg-white/5 backdrop-blur-sm"
      style={{
        width: size,
        height: size,
        bottom: "calc(5rem + env(safe-area-inset-bottom, 0px))",
        left: "max(1rem, env(safe-area-inset-left, 0px))",
      }}
    >
      {/* Center dot */}
      <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20" />
      {/* Thumb */}
      <div
        className="absolute left-1/2 top-1/2 h-10 w-10 rounded-full border-2 border-white/40 bg-white/15 transition-transform duration-75"
        style={{
          transform: `translate(calc(-50% + ${thumbOffset.x}px), calc(-50% + ${thumbOffset.y}px))`,
        }}
      />
    </div>
  );
}
