"use client";

import { useGame } from "@/features/game/gameContext";
import {
  PANTHEON_BLESSING_REWARD_BONUS_PCT,
  isPlayerAlignedPantheon,
} from "@/features/pantheons/pantheonReward";
import type { Pantheon } from "@/features/pantheons/pantheonTypes";

type PantheonBlessingPanelProps = {
  pantheon: Pantheon;
};

/**
 * Visit-blessing UI for the pantheon HQ page.
 *
 * - When the player has no affinity school, shows a soft hint that
 *   blessings are gated on picking one.
 * - When the player IS aligned with this pantheon and no blessing is
 *   pending, shows the "Receive blessing" button.
 * - When a blessing is already pending, shows a "claim it on your next
 *   mission" reminder instead.
 * - When the player is aligned with a DIFFERENT pantheon, shows a
 *   neutral hint that this isn't their inheritor.
 */
export default function PantheonBlessingPanel({
  pantheon,
}: PantheonBlessingPanelProps) {
  const { state, dispatch } = useGame();
  const { player } = state;

  const aligned = isPlayerAlignedPantheon(player, pantheon.id);
  const pending = player.pantheonBlessingPending === true;
  const hasAffinity = player.affinitySchoolId !== null;

  function handleReceive() {
    if (!aligned || pending) return;
    dispatch({
      type: "GRANT_PANTHEON_BLESSING",
      payload: { pantheonId: pantheon.id },
    });
  }

  return (
    <div
      className="rounded-2xl border p-5"
      style={{
        borderColor: `${pantheon.accentHex}55`,
        background: `${pantheon.accentHex}12`,
      }}
    >
      <p
        className="text-[10px] font-bold uppercase tracking-[0.22em]"
        style={{ color: pantheon.accentHex }}
      >
        Pantheon visit blessing
      </p>
      <p className="mt-2 text-sm leading-6 text-white/80">
        Claim a one-shot blessing of the {pantheon.name} pantheon. Your next
        mission settlement pays{" "}
        <span className="font-bold text-white">
          +{PANTHEON_BLESSING_REWARD_BONUS_PCT}%
        </span>{" "}
        on every reward channel — rank XP, mastery, influence, and
        resources.
      </p>

      {!hasAffinity ? (
        <p className="mt-3 text-[11px] leading-snug text-white/45">
          You have no school affinity yet. Pick a school in the New Game flow
          (or via Career → Mythic) to unlock pantheon blessings.
        </p>
      ) : !aligned ? (
        <p className="mt-3 text-[11px] leading-snug text-white/45">
          This isn&apos;t your inheritor pantheon. Visit your aligned pantheon
          HQ to receive a blessing here.
        </p>
      ) : pending ? (
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-200/85">
          Blessing already pending — claim it on your next mission
          settlement.
        </p>
      ) : (
        <button
          type="button"
          onClick={handleReceive}
          className="mt-3 rounded-xl border px-4 py-3 text-xs font-bold uppercase tracking-[0.1em] text-white transition"
          style={{
            borderColor: `${pantheon.accentHex}88`,
            background: `${pantheon.accentHex}22`,
          }}
        >
          Receive {pantheon.name} blessing
        </button>
      )}
    </div>
  );
}
