/**
 * Rapport decay on silence.
 *
 * Canon feel: relationships are not a bank account you top up once. If
 * you ignore a broker for too long, their trust slips. The Black Market
 * is full of people who remember everyone who didn't come back.
 *
 * Mechanics:
 * - Every broker interaction or dialogue choice records
 *   `brokerLastContactAt[brokerId] = now`.
 * - At mission-queue tick, each broker whose rapport > 0 AND whose last
 *   contact is older than `RAPPORT_DECAY_GRACE_MS` loses 1 rapport per
 *   full day past the grace period.
 * - We also advance `brokerLastContactAt` forward by the consumed days so
 *   the decay doesn't re-double-dip on the next tick.
 * - Floor is 0.
 *
 * Grace period is generous (7 days). The point is to reward consistency,
 * not punish a week off.
 */

export const RAPPORT_DECAY_GRACE_MS = 7 * 24 * 60 * 60 * 1000;
export const RAPPORT_DECAY_PER_DAY = 1;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export type RapportDecayInput = {
  rapport: Record<string, number>;
  lastContactAt: Record<string, number>;
  now: number;
};

export type RapportDecayResult = {
  rapport: Record<string, number>;
  lastContactAt: Record<string, number>;
  changed: boolean;
};

/**
 * Pure function. Given the raw state, applies any rapport decay that
 * has accumulated since the last tick and returns the updated maps.
 * Returns `changed: false` when no decay applied so the reducer can
 * skip the state update.
 */
export function applyRapportDecay(input: RapportDecayInput): RapportDecayResult {
  const { rapport, lastContactAt, now } = input;
  let changed = false;
  const nextRapport: Record<string, number> = { ...rapport };
  const nextLastContactAt: Record<string, number> = { ...lastContactAt };

  for (const [brokerId, value] of Object.entries(rapport)) {
    if (value <= 0) continue;
    const lastContact = lastContactAt[brokerId] ?? 0;
    if (lastContact === 0) {
      // No contact timestamp yet — seed it to now so decay starts from
      // here, not from the epoch. Avoids existing-save runaway decay.
      nextLastContactAt[brokerId] = now;
      changed = true;
      continue;
    }
    const msSinceContact = now - lastContact;
    if (msSinceContact <= RAPPORT_DECAY_GRACE_MS) continue;

    const msPastGrace = msSinceContact - RAPPORT_DECAY_GRACE_MS;
    const daysPastGrace = Math.floor(msPastGrace / ONE_DAY_MS);
    if (daysPastGrace <= 0) continue;

    const decayAmount = Math.min(value, daysPastGrace * RAPPORT_DECAY_PER_DAY);
    if (decayAmount <= 0) continue;

    nextRapport[brokerId] = Math.max(0, value - decayAmount);
    // Advance contact timestamp by the consumed full days so the next
    // tick doesn't re-decay the same period.
    nextLastContactAt[brokerId] = lastContact + daysPastGrace * ONE_DAY_MS;
    changed = true;
  }

  return { rapport: nextRapport, lastContactAt: nextLastContactAt, changed };
}
