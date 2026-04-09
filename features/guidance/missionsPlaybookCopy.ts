/**
 * Missions / Contracts — teaches the timer queue without extra systems.
 * Copy stays short; situational line reacts to queue pressure.
 */

export const MISSIONS_PLAYBOOK_TITLE = "How this board works";

export function getMissionsPlaybookLines(): string[] {
  return [
    "Pick an operation — it takes a slot on your contract stack and starts its timer.",
    "Running contracts tick down — payouts land automatically when a timer completes.",
    "When you are ready to fight, deploy from Command or the realm chart — the contract stack lives under Contracts.",
  ];
}

/**
 * Consequence awareness — how much room you have if a contract or deploy goes wrong.
 * Copy only; does not change mission math.
 */
export function getMissionConsequenceHint(input: {
  condition: number;
  hunger: number;
}): string {
  const { condition, hunger } = input;

  if (condition < 30 || hunger < 30) {
    return "If this run goes bad, you won't recover clean.";
  }

  if (condition < 50 || hunger < 50) {
    return "You're entering this run already weakened.";
  }

  return "You can take this risk — for now.";
}

export function getMissionsPlaybookCallout(input: {
  queueLen: number;
  queueFull: boolean;
  launchLocked: boolean;
  inProgress: number;
}): string | null {
  if (input.queueFull) {
    return "Stack is full — let something finish or recover capacity before you add more.";
  }
  if (input.launchLocked) {
    return "Launch doctrine is holding new queue work — stabilize in the Black Market, then come back.";
  }
  if (input.queueLen === 0) {
    return "Nothing queued — choose an operation below to start the chain.";
  }
  if (input.inProgress > 0) {
    return "Live timers on the stack — payouts will land; plan the next slot before you overload.";
  }
  return null;
}
