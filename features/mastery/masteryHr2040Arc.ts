/** Hour 20–40 spine — copy + steps for mastery timeline UI (canon-safe, implementation framing). */

export type MasteryArcStep = {
  id: string;
  label: string;
  detail: string;
};

export const masteryHr2040ArcSteps: MasteryArcStep[] = [
  {
    id: "rails",
    label: "20 · Three rails",
    detail: "Bio, Mecha, Pure — parallel depth; Blood / Frame / Resonance pay for installs.",
  },
  {
    id: "capacity",
    label: "22 · Capacity tax",
    detail:
      "Each minor spends pool costs; hybrid (off-primary) costs more and stacks ceiling shrink.",
  },
  {
    id: "executional",
    label: "25 · Executional L2",
    detail: "Three minors in one school form the set — unlocks L2 Executional for that path.",
  },
  {
    id: "yields",
    label: "28 · Theme yields",
    detail: "Matching zone loot theme scales field pickups and contract resources (capped bonus).",
  },
  {
    id: "gates",
    label: "32 · Zone gates",
    detail: "Deploy checks deepest rune depth; some realms need Executional tier on the theme school.",
  },
  {
    id: "deep-set",
    label: "36 · Executional L3",
    detail: "Five minors in one school — deeper set tier for yield and future gate hooks.",
  },
  {
    id: "phase2",
    label: "40 · Boss mats",
    detail: "Void bosses roll phase‑2 named materials — Crafting District refines into sinks.",
  },
];
