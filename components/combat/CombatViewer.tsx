"use client";

import { useState } from "react";
import type { CombatResult } from "@/features/combat/combatTypes";

type Props = {
  result: CombatResult | null;
};

export default function CombatViewer({ result }: Props) {
  const [step, setStep] = useState(0);

  if (!result) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/40 p-6 text-white">
        No combat yet.
      </div>
    );
  }

  const current = result.log[step];

  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-6 text-white">
      <h3 className="mb-4 text-lg font-bold">Combat Replay</h3>

      <div className="mb-4 space-y-1">
        <p>
          <strong>Attacker:</strong> {current?.attackerId}
        </p>
        <p>
          <strong>Defender:</strong> {current?.defenderId}
        </p>
        <p>
          <strong>Damage:</strong> {current?.damage}
        </p>
        <p>
          <strong>Crit:</strong> {current?.isCrit ? "YES 🔥" : "No"}
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className="rounded bg-gray-700 px-3 py-1"
        >
          Prev
        </button>

        <button
          onClick={() => setStep((s) => Math.min(result.log.length - 1, s + 1))}
          className="rounded bg-blue-600 px-3 py-1"
        >
          Next
        </button>
      </div>

      <div className="mt-4 text-sm text-white/70">
        Step {step + 1} / {result.log.length}
      </div>

      <div className="mt-4 font-bold text-green-400">
        Winner: {result.winnerId}
      </div>
    </div>
  );
}