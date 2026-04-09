/**
 * Home command deck — short lines that reinforce the primary CTA and loop pressure.
 * Survival-first, readable; avoids generic anxiety lines.
 */

export type HomePrimaryAction = {
  phase: "prep" | "deploy" | "return" | "recover";
  href: string;
};

export function getHomeCommandFooter(action: HomePrimaryAction): string {
  if (action.phase === "recover") {
    return "Stabilize first — the Void taxes the reckless twice.";
  }

  if (action.phase === "prep") {
    return "No chain, no forward motion. Queue a contract or you are only visiting the hub.";
  }

  if (action.phase === "deploy") {
    if (action.href === "/void-field") {
      return "The field is open — finish the hunt before you stack another problem.";
    }
    if (action.href === "/missions") {
      return "A contract is live — close the return before you spin up another thread.";
    }
    return "Queue is primed — deploy, or the lane goes cold while you wait.";
  }

  if (action.phase === "return") {
    return "Settle the return before you spend the haul in your head.";
  }

  return "Pressure does not pause — move while you still choose how.";
}
