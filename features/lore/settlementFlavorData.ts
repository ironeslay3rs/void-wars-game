import type { MissionOriginTagId } from "@/features/game/gameTypes";

/**
 * Post-settlement flavor lines per origin tag.
 * Shown after a mission completes to anchor the loot in the Sevenfold Rune universe.
 * 3-5 rotating lines per origin so it doesn't repeat every time.
 *
 * CANON STATUS: GAME-SPECIFIC CREATIVE WORK — no vault source for flavor lines.
 */

export const settlementFlavorLines: Record<MissionOriginTagId, string[]> = {
  "bonehowl-remnant": [
    "The marrow is still warm. Whatever this came from, it died fighting. — Stall 7 will pay well.",
    "Fenrir blood, grade uncertain. Your hands are shaking and you can't tell if it's adrenaline or the sample reaching for your veins.",
    "The Bonehowl deserter was right. The beast left behind enough tissue to fund a week. Your body already knows what it wants to do with it.",
    "Wrath-grade specimens. The broker weighs them without touching — smart. These things remember being alive.",
  ],
  "olympus-castoff": [
    "Flesh throne castoffs. The tissue is perfect — too perfect. Olympus engineers don't make mistakes. They make failures that look like gifts.",
    "The samples are viable. The Biotech Labs will want them. Just don't ask what the original host looked like before Greece was done with it.",
    "Mirror-grade grafts, still sealed. An Olympus castoff that another buyer couldn't stomach. Their loss. Your gain.",
  ],
  "crimson-altar-contraband": [
    "The pheromone catalyst is intact. The Velvet Den will want this — or the Biotech Labs, if you'd rather keep it clinical.",
    "Astarte-grade contraband. The neural bonds are still active. You can feel them trying to connect. Don't let them.",
    "Crimson Altar tech. Beautiful. Dangerous. The broker says it's safe if you don't think about it too hard.",
  ],
  "pharos-surplus": [
    "Pristine. Soulless. Every component works exactly as designed. The Foundry brokers will want this.",
    "Sun-forged alloy from Ra's divine factories. The serial numbers are filed off but the quality speaks for itself.",
    "Pharos engineering at its finest — precision parts that will outlast everything in your inventory. The Chrome Synod defectors pay premium for these.",
    "Divine-grade servomotors, still in their Pharos casings. The engineers who built these would weep if they knew where they ended up.",
  ],
  "mandate-salvage": [
    "Mandate-grade components. Patient. Methodical. These parts were built to last forever in a bureaucracy that moves at geological speed.",
    "Clockwork precision parts from China's automation lines. Slow to arrive, impossible to break. The Foundry can use every piece.",
    "Mandate salvage — the most boring loot in the market and the most reliable. The brokers don't haggle on Mandate stock. They know the price.",
  ],
  "mouth-of-inti-relic": [
    "The relic hums when you hold it. You can feel a memory pressing against the inside of your skull. Don't hold it too long.",
    "Fire-touched residue from the Mouth of Inti. The Ember Vault dealers will trade rune work for this. Be careful what memories you absorb.",
    "Soul-forged fragments. They whisper when the candle row catches the light. The relic dealer says that's normal. You're not sure she's right.",
    "Inti relics consume what they touch. The ember residue is valuable precisely because it's dangerous. The Vault calls this a lesson.",
  ],
  "thousand-hands-fragment": [
    "Vishrava's hoard leaks. Every fragment was stolen from someone who needed it more. The Golden Bazaar doesn't care — they want volume.",
    "Thousand Hands artifacts — greed given material form. The spiritual weight is real. Your resonance capacity registers the pressure.",
    "Metaphysical vault shards from India's deepest collections. Worth more than credits. Worth more than the broker is telling you.",
  ],
  "black-market-local": [
    "Another day, another deal. The broker nods. You survived. That's the only currency that matters here.",
    "Local salvage. Nothing exotic, nothing dangerous, nothing that will change your life — unless you're smart about how you spend it.",
    "The Black Market takes its cut. What's left is yours. Spend it before something else does.",
    "Homegrown haul from the city's edge. Not glamorous, but the credits are real and the condition cost was honest.",
    "The market absorbs everything. Your salvage joins the flow. Tomorrow there will be more. There is always more.",
  ],
};

/**
 * Get a pseudo-random flavor line for a given origin tag.
 * Uses a simple hash of the timestamp to avoid true randomness on hydration.
 */
export function getSettlementFlavorLine(
  originTag: MissionOriginTagId,
  seedMs?: number,
): string {
  const lines = settlementFlavorLines[originTag];
  const seed = seedMs ?? Date.now();
  const idx = Math.abs(seed) % lines.length;
  return lines[idx];
}
