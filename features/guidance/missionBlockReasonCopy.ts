/**
 * Short inline hints for disabled "Queue Mission" — same truths as board feedback, always visible.
 */

export type MissionQueueBlockReason =
  | "path-locked"
  | "already-queued"
  | "queue-full"
  | "launch-lock"
  | "canon-locked";

export function getMissionQueueBlockHint(input: {
  reason: MissionQueueBlockReason;
  missionTitle: string;
  pathLabel: string;
  canonLockDetail: string;
  queueLen: number;
  queueCap: number;
  launchLockDetail: string | null;
}): string {
  switch (input.reason) {
    case "path-locked":
      return `Requires ${input.pathLabel} affiliation — align on New Game or path screens.`;
    case "already-queued":
      return `"${input.missionTitle}" is already on your stack.`;
    case "queue-full":
      return `Contract stack full (${input.queueLen}/${input.queueCap}). Finish a timer or remove one.`;
    case "launch-lock":
      return (
        input.launchLockDetail ??
        "Launch doctrine is blocking new queue work — stabilize condition and stores."
      );
    case "canon-locked":
      return input.canonLockDetail;
  }
}
