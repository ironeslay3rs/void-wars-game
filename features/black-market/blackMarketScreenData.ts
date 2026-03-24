export type BlackMarketLaneId =
  | "pride"
  | "greed"
  | "lust"
  | "wrath"
  | "gluttony"
  | "envy"
  | "sloth";

export type BlackMarketLane = {
  id: BlackMarketLaneId;
  sin: string;
  district: string;
  purpose: string;
  service: string;
  risk: string;
  playerUse: string;
  archetype: string;
};

export const blackMarketRoleSummary = {
  eyebrow: "Bazaar / Black Market",
  title: "Black Market Neutral Citadel",
  subtitle:
    "A neutral citadel lodged between Bio, Mecha, and Pure/Rune interests, where risky services sit between survival upkeep, crafting acceleration, and contract acquisition instead of replacing the current core loops.",
  cards: [
    {
      label: "Citadel Role",
      value: "Neutral Hub",
      hint:
        "Used as a broker space where all three faction paths can trade, recover, and take on dangerous side services without forcing a faction swap.",
    },
    {
      label: "Current Fit",
      value: "Mid-loop Utility",
      hint:
        "Each lane is framed as a district-sized business identity that feeds current survival, crafting, and mission systems instead of adding a separate meta-game.",
    },
    {
      label: "Implementation Bias",
      value: "Small Slices",
      hint:
        "Start with lanes that can plug into existing resources, timed contracts, and district statuses before building bespoke economies.",
    },
  ],
} as const;

export const blackMarketLanes: BlackMarketLane[] = [
  {
    id: "pride",
    sin: "Pride",
    district: "Frame Ateliers / Relic Luxury Dealers",
    purpose:
      "Curates elite Bio grafts, Mecha shells, and Pure/Rune relic housings as prestige tuning shops for endgame-leaning builds.",
    service:
      "High-tier frame tuning, relic polishing, and visual prestige packages that can convert normal gear into aspirational upgrade targets.",
    risk:
      "Luxury pricing and vanity trap: players sink scarce materials and credits into premium upgrades before their survival base is stable.",
    playerUse:
      "Best for players who already have a dependable loop and want focused quality upgrades, faction expression, or a gold sink for rare drops.",
    archetype: "Curator-Matriarch who sells perfection as a doctrine and duels over defects.",
  },
  {
    id: "greed",
    sin: "Greed",
    district: "Vaults / Auctions / Loan Houses",
    purpose:
      "Acts as the Black Market treasury lane: convert loot into liquidity, front-load scarce supplies, and move high-value salvage between factions.",
    service:
      "Credit advances, salvage auctions, collateral loans, and buyback contracts for rare mission rewards or crafted items.",
    risk:
      "Debt pressure and asset lockups: missed payback windows can tie up resources, reduce profit, or force players to liquidate gear.",
    playerUse:
      "Best for players bridging short-term shortages, funding crafting bursts, or monetizing rare drops from hunts and expeditions.",
    archetype: "Ledger-Lord banker running a silent auction floor guarded by debt collectors.",
  },
  {
    id: "lust",
    sin: "Lust",
    district: "Oath Parlors / Pact Brokers",
    purpose:
      "Packages power as binding agreements, letting players trade future obligations for short-lived buffs, access, or faction-neutral favors.",
    service:
      "Temporary pacts, oath seals, and favor contracts that boost a mission lane or unlock conditional access to otherwise gated encounters.",
    risk:
      "Compounding obligations: players gain strong tempo now but inherit cooldowns, future penalties, or required follow-up tasks.",
    playerUse:
      "Best for players preparing for a difficult mission push, a timed hunt window, or a one-session progression spike.",
    archetype: "Velvet-voiced pact broker who weaponizes fine print and memory-bound vows.",
  },
  {
    id: "wrath",
    sin: "Wrath",
    district: "Pits / Mercenary Yards / Bounty Exchange",
    purpose:
      "Feeds the combat economy with high-risk contracts, sanctioned pit fights, and bounty routing that escalates mission intensity.",
    service:
      "Bounty boards, elite hunt contracts, combat wagers, and mercenary rerolls for stronger but more volatile rewards.",
    risk:
      "Condition loss and volatility: players take on harder encounters, attrition, and unstable payout ranges.",
    playerUse:
      "Best for combat-forward players who want to translate strength into faster resource gains and rarer contract targets.",
    archetype: "Scarred pit master who recruits champions and sells grudges as repeatable work.",
  },
  {
    id: "gluttony",
    sin: "Gluttony",
    district: "Ration Halls / Butcher Vaults / Feast Markets",
    purpose:
      "Stabilizes the survival layer by turning harvested biomass and hunt drops into recovery stock, ration buffs, and preserved field supplies.",
    service:
      "Rations, cooked recovery packs, butchered biomass conversion, and feast buffs that support expedition uptime.",
    risk:
      "Spoilage and overconsumption: players can waste raw materials on short-duration comfort effects instead of durable progression.",
    playerUse:
      "Best for players who need reliable healing, condition recovery, or prep items before long mission chains.",
    archetype: "Cannery sovereign overseeing cold vaults, ration lines, and ceremonial banquets.",
  },
  {
    id: "envy",
    sin: "Envy",
    district: "Mimic Clinics / Counterfeit Dens / Stolen-Tech Traders",
    purpose:
      "Produces imitation solutions by copying enemy traits, cloning rival tech patterns, and repackaging faction specialties into unstable shortcuts.",
    service:
      "Counterfeit modules, mimic grafts, copied schematics, and stolen-tech swaps that let players prototype gear paths early.",
    risk:
      "Instability and trace risk: fake parts can fail, mutate, or trigger faction suspicion if pushed too hard.",
    playerUse:
      "Best for experimental players who want preview access to future build paths before investing in permanent crafting.",
    archetype: "Chameleon surgeon who wears borrowed identities and sells unauthorized replicas.",
  },
  {
    id: "sloth",
    sin: "Sloth",
    district: "Stasis Storage / Automation Shops / Idle Servitors",
    purpose:
      "Supports low-attention progression by warehousing loot, automating simple processing, and smoothing downtime between active sessions.",
    service:
      "Timed storage, passive refining, queue extensions, and idle servitors that keep routine tasks moving while the player is away.",
    risk:
      "Throughput loss and dependency: automated jobs are slower or taxed, making convenience weaker than active play.",
    playerUse:
      "Best for players converting overflow materials, protecting perishables, or maintaining progress during offline windows.",
    archetype: "Sleep-blind overseer who manages a silent workforce of clockwork attendants.",
  },
];

export const blackMarketFirstThree = [
  {
    lane: "Gluttony",
    reason:
      "It plugs straight into the current survival framing: hunt materials become ration items, recovery stock, and expedition prep without needing new currencies.",
  },
  {
    lane: "Wrath",
    reason:
      "It extends the existing mission and hunting-ground loop with higher-risk contract variants and better reward brackets, which fits the current queue and reward model.",
  },
  {
    lane: "Sloth",
    reason:
      "It fits the project's timed-loop direction by offering passive storage and simple automation hooks that can reuse district statuses and async progression patterns.",
  },
] as const;

export const blackMarketConnections = [
  {
    title: "Survival",
    detail:
      "Gluttony becomes the recovery and ration district, Sloth preserves perishables and handles low-value processing, and Wrath creates the pressure that makes recovery planning matter.",
  },
  {
    title: "Crafting",
    detail:
      "Greed funds burst crafting, Envy offers unstable prototype parts, and Pride becomes the premium finishing pass once the standard crafting district has produced a solid item base.",
  },
  {
    title: "Missions",
    detail:
      "Wrath injects elite contracts, Lust provides temporary pact-based mission boosts with future costs, and Greed buys back or auctions rare drops gathered from dangerous routes.",
  },
] as const;

export const blackMarketImplementationSlice = [
  "Make the Black Market a clickable neutral citadel destination in the Bazaar map and define all seven lanes as canon district identities.",
  "Implement Gluttony first as a ration-and-recovery panel that consumes existing hunt outputs and updates survival-facing status messaging.",
  "Implement Wrath second as a Black Market contract variant layered onto missions and the mercenary/hunting flow, using higher risk with clearer reward spikes.",
  "Implement Sloth third as passive storage and simple timed processing using existing queue/state patterns rather than a new subsystem.",
  "Keep Pride, Greed, Lust, and Envy in the design layer for now so their future hooks are already aligned with resources, missions, and crafting.",
] as const;

export const blackMarketFinalResult =
  "The Black Market stops being just a shady label and becomes a neutral mid-loop citadel: seven sins define seven business districts, each with a clear gameplay role, a cost profile, and a natural connection to the current survival, crafting, and mission structure.";
