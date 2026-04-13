"use client";

import { useEffect, useState } from "react";
import {
  subscribeToasts,
  type ToastPayload,
  type ToastVariant,
} from "@/features/toast/toastBus";

const LIFE_MS = 3400;
const MAX_VISIBLE = 4;

function variantClass(variant: ToastVariant): string {
  switch (variant) {
    case "success":
      return "border-emerald-400/40 bg-emerald-950/70 text-emerald-50";
    case "warning":
      return "border-amber-400/40 bg-amber-950/70 text-amber-50";
    case "reward":
      return "border-cyan-400/40 bg-cyan-950/70 text-cyan-50";
    default:
      return "border-white/20 bg-black/70 text-white/90";
  }
}

export default function ToastHost() {
  const [queue, setQueue] = useState<ToastPayload[]>([]);

  useEffect(() => {
    return subscribeToasts((toast) => {
      setQueue((prev) => [...prev, toast].slice(-MAX_VISIBLE));
      window.setTimeout(() => {
        setQueue((prev) => prev.filter((t) => t.id !== toast.id));
      }, LIFE_MS);
    });
  }, []);

  if (queue.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[90] flex -translate-x-1/2 flex-col items-center gap-2">
      {queue.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto void-toast-pop rounded-xl border px-4 py-2 text-sm shadow-[0_4px_24px_rgba(0,0,0,0.6)] backdrop-blur-sm ${variantClass(
            t.variant,
          )}`}
        >
          <div className="font-semibold tracking-wide">{t.text}</div>
          {t.detail ? (
            <div className="mt-0.5 text-xs text-white/70">{t.detail}</div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
