"use client";

import { useMemo, useState } from "react";
import { useGame } from "@/features/game/gameContext";
import type { BrokerEntry } from "@/features/lore/brokerData";
import type { PathType } from "@/features/game/gameTypes";
import type {
  BrokerDialogueChoice,
  BrokerDialogueTree,
} from "@/features/broker-dialogue/brokerDialogueTypes";
import { getRapportBand } from "@/features/broker-dialogue/brokerDialogueTypes";
import { pushToast } from "@/features/toast/toastBus";

const SCHOOL_ACCENT: Record<
  PathType | "neutral",
  { border: string; bg: string; btn: string }
> = {
  bio: {
    border: "border-emerald-500/40",
    bg: "bg-emerald-950/95",
    btn: "border-emerald-400/40 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/25",
  },
  mecha: {
    border: "border-cyan-400/40",
    bg: "bg-slate-950/95",
    btn: "border-cyan-400/40 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/25",
  },
  pure: {
    border: "border-amber-400/40",
    bg: "bg-amber-950/95",
    btn: "border-amber-400/40 bg-amber-500/15 text-amber-100 hover:bg-amber-500/25",
  },
  neutral: {
    border: "border-white/20",
    bg: "bg-black/95",
    btn: "border-white/20 bg-white/10 text-white/90 hover:bg-white/15",
  },
};

type Props = {
  broker: BrokerEntry;
  tree: BrokerDialogueTree;
  onClose: () => void;
};

export default function BrokerDialogueModal({ broker, tree, onClose }: Props) {
  const { state, dispatch } = useGame();
  const accent = SCHOOL_ACCENT[broker.school];
  const [currentNodeId, setCurrentNodeId] = useState(tree.rootNodeId);

  const rapport = state.player.brokerRapport[broker.id] ?? 0;
  const band = useMemo(() => getRapportBand(rapport), [rapport]);
  const unlocks = state.player.brokerDialogueUnlocks[broker.id] ?? [];
  const currentNode = tree.nodes[currentNodeId];

  if (!currentNode) {
    return null;
  }

  const visibleChoices = currentNode.choices.filter((c) => {
    if (c.rapportGate !== undefined && rapport < c.rapportGate) return false;
    if (c.requiresUnlock && !unlocks.includes(c.requiresUnlock)) return false;
    return true;
  });

  function handleChoice(choice: BrokerDialogueChoice) {
    for (const effect of choice.effects ?? []) {
      switch (effect.kind) {
        case "rapport_delta":
          dispatch({
            type: "ADJUST_BROKER_RAPPORT",
            payload: { brokerId: broker.id, delta: effect.amount },
          });
          break;
        case "grant_unlock":
          dispatch({
            type: "GRANT_BROKER_DIALOGUE_UNLOCK",
            payload: { brokerId: broker.id, unlockKey: effect.unlockKey },
          });
          pushToast(`${broker.name} trusts you`, {
            variant: "reward",
            detail: "New dialogue option unlocked.",
          });
          break;
        case "grant_resource":
          dispatch({
            type: "ADD_RESOURCE",
            payload: { key: effect.resourceKey, amount: effect.amount },
          });
          break;
        case "spend_resource":
          dispatch({
            type: "ADD_RESOURCE",
            payload: { key: effect.resourceKey, amount: -effect.amount },
          });
          break;
      }
    }

    if (choice.nextNodeId === null) {
      onClose();
      return;
    }
    setCurrentNodeId(choice.nextNodeId);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-lg rounded-t-2xl border p-5 sm:rounded-2xl ${accent.bg} ${accent.border}`}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
              {broker.title}
            </div>
            <h3 className="mt-1 text-lg font-bold text-white">{broker.name}</h3>
          </div>
          <div className="rounded-full border border-white/15 bg-black/40 px-3 py-1 text-right">
            <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/45">
              Rapport · {rapport}
            </div>
            <div className="text-xs font-semibold text-white/85">
              {band.label}
            </div>
          </div>
        </div>

        {currentNode.flavor ? (
          <p className="mt-4 text-xs italic leading-relaxed text-white/50">
            {currentNode.flavor}
          </p>
        ) : null}

        <p className="mt-4 text-sm leading-relaxed text-white/90">
          &ldquo;{currentNode.speakerLine}&rdquo;
        </p>

        <div className="mt-5 flex flex-col gap-2">
          {visibleChoices.length === 0 ? (
            <button
              type="button"
              onClick={onClose}
              className={`flex min-h-[44px] w-full items-center justify-center rounded-xl border px-4 py-3 text-sm font-bold uppercase tracking-[0.1em] transition ${accent.btn}`}
            >
              End conversation
            </button>
          ) : (
            visibleChoices.map((choice) => (
              <button
                key={choice.id}
                type="button"
                onClick={() => handleChoice(choice)}
                className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-left text-sm text-white/85 transition hover:bg-white/[0.09]"
              >
                {choice.text}
              </button>
            ))
          )}
        </div>

        <p className="mt-4 text-[10px] uppercase tracking-[0.16em] text-white/30">
          {band.hint}
        </p>
      </div>
    </div>
  );
}
