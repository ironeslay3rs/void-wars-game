"use client";

import { useState } from "react";
import type { BrokerEntry } from "@/features/lore/brokerData";
import type { PathType } from "@/features/game/gameTypes";
import {
  getBestUnlockedBrokerInteraction,
  PASSIVE_BROKER_IDS,
  SILENT_BROKER_IDS,
} from "@/features/lore/brokerInteractionData";
import { getInstitutionById } from "@/features/institutions/institutionSelectors";
import BrokerInteractionModal from "@/components/shared/BrokerInteractionModal";
import BrokerDialogueModal from "@/components/shared/BrokerDialogueModal";
import { getBrokerDialogueTree } from "@/features/broker-dialogue/brokerDialogueData";
import { useGame } from "@/features/game/gameContext";
import { getRapportBand } from "@/features/broker-dialogue/brokerDialogueTypes";

const SCHOOL_ACCENT: Record<PathType | "neutral", string> = {
  bio: "border-emerald-500/25 bg-emerald-500/5",
  mecha: "border-cyan-400/25 bg-cyan-400/5",
  pure: "border-amber-400/25 bg-amber-400/5",
  neutral: "border-white/12 bg-white/[0.03]",
};

const SCHOOL_TEXT: Record<PathType | "neutral", string> = {
  bio: "text-emerald-200/80",
  mecha: "text-cyan-200/80",
  pure: "text-amber-200/80",
  neutral: "text-white/50",
};

export default function BrokerCard({ broker }: { broker: BrokerEntry }) {
  const [expanded, setExpanded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [dialogueOpen, setDialogueOpen] = useState(false);
  const [passiveMsg, setPassiveMsg] = useState(false);
  const dialogueTree = getBrokerDialogueTree(broker.id);
  const accent = SCHOOL_ACCENT[broker.school];
  const textAccent = SCHOOL_TEXT[broker.school];
  const { state } = useGame();
  const unlocks = state.player.brokerDialogueUnlocks[broker.id] ?? [];
  const rapport = state.player.brokerRapport[broker.id] ?? 0;
  const rapportBand = dialogueTree ? getRapportBand(rapport) : null;
  const interaction = getBestUnlockedBrokerInteraction(broker.id, unlocks);
  const hasUnlockedOffer = !!interaction?.requiresUnlock;
  const isSilent = SILENT_BROKER_IDS.has(broker.id);
  const isPassive = PASSIVE_BROKER_IDS.has(broker.id);
  // Phase 9 / Sin Institutions: surface the operating org if any.
  const institution = broker.institutionId
    ? getInstitutionById(broker.institutionId)
    : null;

  return (
    <>
      <div className={`rounded-xl border p-4 ${accent}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className={`text-sm font-bold ${textAccent}`}>
              {broker.name}
            </div>
            <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
              {broker.title}
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {rapportBand ? (
              <span
                className="rounded-md border border-fuchsia-400/25 bg-fuchsia-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-fuchsia-100/80"
                title={`Rapport ${rapport}/100 — ${rapportBand.hint}`}
              >
                {rapportBand.label} · {rapport}
              </span>
            ) : null}
            {institution ? (
              <span
                className="rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em]"
                style={{
                  borderColor: `${institution.accentHex}55`,
                  color: institution.accentHex,
                }}
                title={`${institution.name} — the ${institution.sin} institution`}
              >
                {institution.shortName}
              </span>
            ) : null}
            {broker.nationOrigin ? (
              <span className="rounded-md border border-white/10 bg-black/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-white/35">
                {broker.nationOrigin}
              </span>
            ) : null}
          </div>
        </div>

        {broker.flavorQuote ? (
          <p className="mt-2.5 text-[11px] italic leading-snug text-white/50">
            &ldquo;{broker.flavorQuote}&rdquo;
          </p>
        ) : (
          <p className="mt-2.5 text-[11px] italic leading-snug text-white/30">
            (Silence.)
          </p>
        )}

        <div className="mt-2 text-[10px] text-white/35">
          {broker.specialization}
        </div>

        {expanded ? (
          <div className="mt-3 space-y-2 border-t border-white/8 pt-3">
            <p className="text-xs leading-relaxed text-white/55">
              {broker.backstory}
            </p>
            <p className="text-[10px] italic text-white/35">
              {broker.personality}
            </p>
          </div>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30 hover:text-white/50"
          >
            {expanded ? "Less" : "Backstory"}
          </button>

          {/* Active broker — has a real interaction. Unlocked premium
              offers get a distinct gold-ish styling so the dialogue-
              earned upgrade is legible at a glance. */}
          {interaction && !isSilent ? (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className={
                hasUnlockedOffer
                  ? "rounded-lg border border-amber-300/45 bg-amber-500/12 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-amber-100 transition hover:border-amber-200/60 hover:bg-amber-500/20"
                  : "rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white/70 transition hover:border-white/25 hover:bg-white/10"
              }
            >
              {interaction.actionLabel}
            </button>
          ) : null}

          {/* Broker with a dialogue tree — "Talk" opens the branching dialogue */}
          {dialogueTree ? (
            <button
              type="button"
              onClick={() => setDialogueOpen(true)}
              className="rounded-lg border border-fuchsia-400/25 bg-fuchsia-500/8 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-fuchsia-100/85 transition hover:border-fuchsia-300/40 hover:bg-fuchsia-500/14"
            >
              Talk
            </button>
          ) : null}

          {/* Passive broker — no gameplay yet */}
          {isPassive && !interaction ? (
            <button
              type="button"
              onClick={() => {
                setPassiveMsg(true);
                setTimeout(() => setPassiveMsg(false), 3000);
              }}
              className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/25 hover:text-white/40"
            >
              Talk
            </button>
          ) : null}

          {/* The Warden — no button at all */}
        </div>

        {passiveMsg ? (
          <p className="mt-2 text-[10px] italic text-white/35">
            This broker doesn&apos;t deal with newcomers yet.
          </p>
        ) : null}
      </div>

      {modalOpen && interaction ? (
        <BrokerInteractionModal
          broker={broker}
          interaction={interaction}
          onClose={() => setModalOpen(false)}
        />
      ) : null}

      {dialogueOpen && dialogueTree ? (
        <BrokerDialogueModal
          broker={broker}
          tree={dialogueTree}
          onClose={() => setDialogueOpen(false)}
        />
      ) : null}
    </>
  );
}
