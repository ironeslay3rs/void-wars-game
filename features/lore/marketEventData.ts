import type { GameState } from "@/features/game/gameTypes";

/**
 * Rotating Black Market event headlines for the Home Command Deck.
 * These make the market feel alive between sessions.
 * Daily rotation using a date-based seed.
 *
 * CANON STATUS: GAME-SPECIFIC CREATIVE WORK — no vault source for event text.
 * NPC names reference game-specific brokers (see brokerData.ts).
 */

export type MarketEvent = {
  id: string;
  text: string;
  tags: string[];
  /** If provided, event only shows when this returns true. */
  condition?: (state: GameState) => boolean;
};

export const marketEvents: MarketEvent[] = [
  // ── Static events (always valid) ──────────────────────────
  {
    id: "bonehowl-crash",
    text: "A Bonehowl transport crashed in the outer tunnels. Bio materials flooding the Lower Ring at half price.",
    tags: ["bio", "supply"],
  },
  {
    id: "pharos-lockdown",
    text: "The Pharos embassy just locked down Stall 14. Something about unauthorized neural bridges. Kessler-9 says she's fine.",
    tags: ["mecha", "incident"],
  },
  {
    id: "mama-sol-menu",
    text: "Mama Sol added something new to the menu. Nobody's asking what it is. Nobody wants to know.",
    tags: ["feast-hall", "mystery"],
  },
  {
    id: "arena-cycle",
    text: "Arena registration for the next cycle opens tomorrow. The Warden was seen inspecting the pit.",
    tags: ["arena", "combat"],
  },
  {
    id: "hazel-silent",
    text: "An Ember Vault relic dealer went silent three days ago. Her stall is still lit. The candles don't go out.",
    tags: ["pure", "mystery"],
  },
  {
    id: "mandate-shipment",
    text: "Mandate salvage drop confirmed. Clockwork precision parts in transit cases. The Foundry is already queueing buyers.",
    tags: ["mecha", "supply"],
  },
  {
    id: "mirror-house-rumor",
    text: "Glass says someone in the Mirror House has been asking about you. She won't say who. The price for that information is higher than the question.",
    tags: ["intel", "social"],
  },
  {
    id: "golden-bazaar-rare",
    text: "Ashveil has new inventory in the Golden Bazaar. Thousand Hands fragments — vault-grade. She says they're the last ones.",
    tags: ["pure", "rare"],
  },
  {
    id: "inti-relic-surface",
    text: "A Mouth of Inti relic surfaced in the lower market. The ash-cloth wrapping is still warm. Three brokers are arguing over provenance.",
    tags: ["pure", "supply"],
  },
  {
    id: "velvet-den-leverage",
    text: "Sable closed a deal in the Velvet Den that nobody's talking about. That's how you know it was expensive.",
    tags: ["social", "mystery"],
  },
  {
    id: "rustfang-infestation",
    text: "Rustfangs are back in the Ash Relay. The Mercenary Guild is offering double bounty for ore recovered from their nests.",
    tags: ["combat", "supply"],
  },
  {
    id: "gate-calibration",
    text: "Nails is recalibrating the gate array. Deployments may take an extra cycle. She says it's routine. Her hands say otherwise.",
    tags: ["travel", "incident"],
  },
  // CANON SOURCE: Books 3-6 — "Blackcity" is the canonical city name
  {
    id: "blackcity-proper",
    text: "Outsiders call it the Black Market. The people who live here call it Blackcity. The difference matters when you're asking for directions.",
    tags: ["market", "identity"],
  },
  // ── Conditional events (state-dependent) ──────────────────
  {
    id: "heat-premium",
    text: "The heat brokers are offering vent services at a premium. Your name is on their list.",
    tags: ["pressure"],
    condition: (s) => s.player.runInstability >= 60,
  },
  {
    id: "feast-hall-reserved",
    text: "The Feast Hall has a table reserved. Mama Sol says you look like you need it.",
    tags: ["recovery"],
    condition: (s) => s.player.condition < 40,
  },
  {
    id: "elite-contracts",
    text: "Mercenary Guild is posting elite contracts. Your rank qualifies. The pay is better. The zone isn't.",
    tags: ["combat", "contracts"],
    condition: (s) => s.player.rankLevel >= 3,
  },
  {
    id: "coil-shipment",
    text: "New Verdant Coil shipment in the Lower Ring. Fenrir-grade tissue, if you believe the labels.",
    tags: ["bio", "supply"],
    condition: (s) => s.player.factionAlignment === "bio",
  },
  {
    id: "synod-drop",
    text: "Chrome Synod surplus in the Foundry. Frame-grade components, still in military casings.",
    tags: ["mecha", "supply"],
    condition: (s) => s.player.factionAlignment === "mecha",
  },
  {
    id: "candle-row-inventory",
    text: "Candle Row has new inventory. The memory-ash smells different today — older, heavier.",
    tags: ["pure", "supply"],
    condition: (s) => s.player.factionAlignment === "pure",
  },
  {
    id: "hunger-pressure",
    text: "The food lines are getting longer. Mama Sol is rationing. If your stores are low, don't wait.",
    tags: ["survival"],
    condition: (s) => s.player.hunger < 50,
  },
];

/**
 * Select the active market event for the current day.
 * Uses a daily seed so the headline changes once per day, not per render.
 */
export function getActiveMarketEvent(state: GameState): MarketEvent {
  const daySeed = Math.floor(Date.now() / 86_400_000);
  const validEvents = marketEvents.filter(
    (e) => !e.condition || e.condition(state),
  );
  const pool = validEvents.length > 0 ? validEvents : marketEvents.filter((e) => !e.condition);
  const idx = Math.abs(daySeed) % pool.length;
  return pool[idx];
}
