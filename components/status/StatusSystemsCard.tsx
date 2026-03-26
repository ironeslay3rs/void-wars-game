"use client";

import { useGame } from "@/features/game/gameContext";

function formatStatus(value: string) {
  return value
    .split("-")
    .map((v) => v.charAt(0).toUpperCase() + v.slice(1))
    .join(" ");
}

function getStateColor(value: string) {
  switch (value) {
    case "active":
    case "open":
    case "stable":
    case "available":
    case "resonating":
      return "text-emerald-300 border-emerald-500/30 bg-emerald-500/10";

    case "idle":
    case "dormant":
    case "unbound":
      return "text-white/70 border-white/10 bg-white/5";

    case "locked":
    case "sealed":
    case "closed":
      return "text-red-300 border-red-500/30 bg-red-500/10";

    case "unstable":
    case "critical":
      return "text-amber-300 border-amber-500/30 bg-amber-500/10";

    default:
      return "text-white border-white/10 bg-white/5";
  }
}

export default function StatusSystemsCard() {
  const { state } = useGame();
  const { districtState } = state.player;

  const systems = [
    { label: "Forge", value: districtState.forgeStatus },
    { label: "Arena", value: districtState.arenaStatus },
    { label: "Mecha Core", value: districtState.mechaStatus },
    { label: "Mutation", value: districtState.mutationState },
    { label: "Attunement", value: districtState.attunementState },
    { label: "Gate", value: districtState.gateStatus },
  ];

  return (
    <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,28,0.9),rgba(8,10,16,0.95))] p-5 backdrop-blur">
      <div className="text-xs uppercase tracking-[0.24em] text-white/40">
        System States
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {systems.map((sys) => {
          const color = getStateColor(sys.value);
          const gateTooltip =
            sys.label === "Gate" && sys.value === "sealed"
              ? "GATE: SEALED — the Teleport Gate is currently uncharged (travel staging is locked). Unseal when the gate-charge/open preparation is completed so the gate transitions out of Sealed and the travel route becomes available."
              : undefined;

          return (
            <div
              key={sys.label}
              title={gateTooltip}
              className={`rounded-xl border px-4 py-3 ${color}`}
            >
              <div className="text-[10px] uppercase tracking-[0.2em] opacity-60">
                {sys.label}
              </div>

              <div className="mt-1 text-sm font-bold uppercase tracking-[0.05em]">
                {formatStatus(sys.value)}
              </div>
              {sys.label === "Gate" && sys.value === "sealed" ? (
                <p className="mt-2 text-[11px] normal-case leading-relaxed text-white/70">
                  The Gate remains sealed until field progression unlocks the travel sequence.
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}