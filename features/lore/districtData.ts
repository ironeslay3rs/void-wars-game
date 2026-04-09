/**
 * Blackcity districts — the neighborhoods of the survival city.
 * Each district is a functional game region AND a lore location.
 * The Black Market is the world, not just a shop screen.
 *
 * CANON STATUS: PARTIALLY CANONICAL
 * The 7 sin lanes (Arena of Blood, Feast Hall, Mirror House, Velvet Den,
 * Golden Bazaar, Ivory Tower, Silent Garden) are CANONICAL from the Master Guide.
 * The overarching city is canonically called "Blackcity" (Books 3-6).
 * The game uses "Black Market" as the player-facing shorthand; "Blackcity" is
 * the in-world proper noun for the hidden city itself.
 *
 * CANON SOURCES: Book 3 — "the Blackcity district"; Book 4 — "Blackcity money",
 * "Chapter Nine — Blackcity in the Walls"; Book 5 — "Blackcity network";
 * Book 6 — "Blackcity cutters", "Blackcity's old exchange halls"
 */

export type DistrictId =
  | "void-market"
  | "black-market-proper"
  | "mercenary-guild"
  | "mecha-foundry"
  | "crafting-district"
  | "pure-enclave"
  | "coliseum"
  | "teleport-gate"
  | "faction-hqs"
  | "feast-hall"
  | "golden-bazaar"
  | "mirror-house"
  | "velvet-den"
  | "ivory-tower"
  | "silent-garden";

export type DistrictEntry = {
  id: DistrictId;
  name: string;
  /** Short atmospheric description — what the player feels when they enter. */
  ambient: string;
  /** What gameplay function this district serves. */
  purpose: string;
  /** Route href in the app. */
  href: string;
  /** Which sin lane this belongs to (if applicable). */
  sinLane?: string;
  /** Tags for filtering and ambient display. */
  tags: string[];
};

export const districts: DistrictEntry[] = [
  {
    id: "void-market",
    name: "Void Market",
    ambient:
      "The public face of the Black Market. Auctions run day and night under flickering lumen-strips. Everything here is legal-ish.",
    purpose: "Player-to-player auction, public listings, commodity exchange.",
    href: "/bazaar/void-market",
    tags: ["economy", "public", "trade"],
  },
  {
    id: "black-market-proper",
    name: "The Black Market",
    ambient:
      "The real power center. Contraband brokers, off-record deals, and survival bargains that Central Command pretends don't exist. The air smells like ozone and old debts.",
    purpose: "Contraband trade, secret deals, faction-neutral contraband hub.",
    href: "/bazaar/black-market",
    tags: ["economy", "contraband", "core"],
  },
  {
    id: "mercenary-guild",
    name: "Mercenary Guild",
    ambient:
      "Rumor boards line every wall. Half the postings are traps. The other half pay better than they should. A Bonehowl deserter is arguing prices with a Pharos defector at the counter.",
    purpose: "Mission board, hunt contracts, bounty postings.",
    href: "/bazaar/mercenary-guild",
    tags: ["missions", "combat", "contracts"],
  },
  {
    id: "mecha-foundry",
    name: "Mecha Foundry",
    ambient:
      "Hydraulic hiss and the smell of hot alloy. Chrome Synod engineers who couldn't stomach the Mandate's patience run independent shops here. Everything they build works. Nothing they build has a soul.",
    purpose: "Frame calibration, cybernetic upgrades, Mecha-specific crafting.",
    href: "/bazaar/mecha-foundry",
    tags: ["crafting", "mecha", "upgrades"],
  },
  {
    id: "crafting-district",
    name: "Crafting District",
    ambient:
      "Forges, workbenches, and the constant sound of hammering. Artisans from all three schools share space here because none of them can afford their own district.",
    purpose: "General crafting, recipe execution, material refinement.",
    href: "/bazaar/crafting-district",
    tags: ["crafting", "refining", "production"],
  },
  // CANON SOURCE: Book 4 — "I am standing at the long table in the Ember Vault with three bowls"
  {
    id: "pure-enclave",
    name: "Ember Vault",
    ambient:
      "Quiet. The air tastes like ash and old memory. Relic dealers sit at long tables where Soul Crystals rest in bowls and candle-light never quite reaches the walls.",
    purpose: "Rune services, attunement, soul-based crafting and relic trade.",
    href: "/bazaar/pure-enclave",
    tags: ["pure", "runes", "soul"],
  },
  {
    id: "coliseum",
    name: "The Coliseum",
    ambient:
      "If there is truth left in them, the arena will reveal it. Spectators bet on blood. Fighters bet on themselves. The Warden watches everything and says nothing.",
    purpose: "Arena combat, PvP, ranked seasons, tournament entry.",
    href: "/arena",
    tags: ["combat", "pvp", "prestige"],
  },
  {
    id: "teleport-gate",
    name: "Teleport Gate",
    ambient:
      "The hum of stabilized void-space. Beyond this gate, the zones wait — hunting grounds that the Black Market carved from the edge of nothing.",
    purpose: "Travel to hunt zones, void field deployment, expedition launch.",
    href: "/bazaar/teleport-gate",
    tags: ["travel", "deployment", "zones"],
  },
  {
    id: "faction-hqs",
    name: "Affiliation Concourse",
    ambient:
      "The three schools maintain embassies here — neutral ground, technically. Each wing smells different: copper and wet earth for Bio, machine oil for Mecha, dry ash for Pure.",
    purpose: "Faction alignment, stipend claims, doctrine pressure display.",
    href: "/bazaar/faction-hqs",
    tags: ["factions", "alignment", "diplomacy"],
  },
  {
    id: "feast-hall",
    name: "Feast Hall",
    ambient:
      "The smell of smoke and cheap protein. This is where the Black Market feeds its people. The cooks don't ask where the meat comes from. The diners don't ask why it glows.",
    purpose: "Recovery, hunger management, ration politics.",
    href: "/bazaar/black-market/feast-hall",
    sinLane: "Gluttony",
    tags: ["recovery", "survival", "food"],
  },
  {
    id: "golden-bazaar",
    name: "Golden Bazaar",
    ambient:
      "Everything has a price. The brokers here deal in rare procurement — Thousand Hands fragments, Pharos prototypes, Bonehowl trophies. If you can't afford it, you can't afford to be seen here.",
    purpose: "Rare trade, premium listings, high-value exchange.",
    href: "/bazaar/black-market/golden-bazaar",
    sinLane: "Greed",
    tags: ["economy", "rare", "premium"],
  },
  {
    id: "mirror-house",
    name: "Mirror House",
    ambient:
      "Olympus castoffs sell information here — who's rising, who's falling, who's about to lose everything. The mirrors don't reflect you. They reflect who's watching you.",
    purpose: "Rival intel, status comparison, social pressure.",
    href: "/bazaar/black-market/mirror-house",
    sinLane: "Envy",
    tags: ["intel", "social", "comparison"],
  },
  {
    id: "velvet-den",
    name: "Velvet Den",
    ambient:
      "Crimson Altar contraband and Astarte pheromone tech. The Den deals in influence, leverage, and the kind of power that works best when the target doesn't know it's happening.",
    purpose: "Social leverage, influence trade, alliance negotiation.",
    href: "/bazaar/black-market/velvet-den",
    sinLane: "Lust",
    tags: ["social", "influence", "leverage"],
  },
  {
    id: "ivory-tower",
    name: "Ivory Tower",
    ambient:
      "Pharos defectors built this place to prove they could make something beautiful without Ra's oversight. It didn't work, but the prestige is real. Entry requires standing.",
    purpose: "Elite negotiation, prestige signaling, authority display.",
    href: "/bazaar/black-market/ivory-tower",
    sinLane: "Pride",
    tags: ["prestige", "elite", "authority"],
  },
  {
    id: "silent-garden",
    name: "Silent Garden",
    ambient:
      "Mandate engineers who defected from China's clockwork hierarchy maintain this space. Nothing happens quickly here. Everything happens eventually. Patience is the only currency they accept.",
    purpose: "Delayed rewards, observation, long-term investment.",
    href: "/bazaar/black-market/silent-garden",
    sinLane: "Sloth",
    tags: ["patience", "long-term", "observation"],
  },
];

export function getDistrictById(id: DistrictId): DistrictEntry | undefined {
  return districts.find((d) => d.id === id);
}

export function getDistrictsBySinLane(): DistrictEntry[] {
  return districts.filter((d) => d.sinLane != null);
}
