export type BlackMarketLaneSummary = {
  id: string;
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
  title: "Black Market",
  subtitle:
    "A neutral survivor citadel between Bio, Mecha, and Pure power blocs. Deals are sacred here, and each sin-lane exists to turn desperation into a usable advantage.",
  cards: [
    {
      label: "Canon Role",
      value: "Neutral Citadel",
      hint: "Not a faction capital. The Black Market survives by keeping Bio, Mecha, and Pure business flowing without open allegiance.",
    },
    {
      label: "First Lane",
      value: "Gluttony / Feast Hall",
      hint: "Book 1's first playable slice is a survival and recovery service that turns current resources into expedition readiness.",
    },
    {
      label: "Law",
      value: "Deals Are Sacred",
      hint: "Every lane should feel transactional, dangerous, and more binding than ordinary Bazaar commerce.",
    },
  ],
};

export const blackMarketLanes: BlackMarketLaneSummary[] = [
  {
    id: "wrath-arena-of-blood",
    sin: "Wrath",
    district: "Arena of Blood",
    purpose: "Violence-for-profit proving ground.",
    service: "Risk duels, sanctioned slaughter contracts, and prestige payouts.",
    risk: "Direct loss pressure, public humiliation, and permanent grudges.",
    playerUse: "Cash in combat confidence when you can afford real danger.",
    archetype: "A debt-duelist who treats every challenge as collateral.",
  },
  {
    id: "gluttony-feast-hall",
    sin: "Gluttony",
    district: "Feast Hall",
    purpose: "Recovery and provision lane for the next push into the Void.",
    service: "Meals, feast contracts, and salvage-to-readiness conversion.",
    risk: "Overindulgence trades short-term power for future lockout or higher cost.",
    playerUse: "Stabilize condition before another expedition or hunt.",
    archetype: "A contract-chef of Inti who measures hunger like strategy.",
  },
  {
    id: "envy-mirror-house",
    sin: "Envy",
    district: "Mirror House",
    purpose: "Information, imitation, and rival-reading lane.",
    service: "Intel extracts, target profiles, and stolen tactical previews.",
    risk: "Bad intel, manipulated expectations, and paranoia spirals.",
    playerUse: "Scout threats or prepare counters before committing scarce resources.",
    archetype: "A broker who sells reflections before truths.",
  },
  {
    id: "lust-velvet-den",
    sin: "Lust",
    district: "Velvet Den",
    purpose: "Influence, leverage, and compromise market.",
    service: "Favor trades, access brokering, and social infiltration work.",
    risk: "Strings attached to every advantage you buy here.",
    playerUse: "Force access when direct strength is too expensive.",
    archetype: "A host who never asks twice because the first agreement already owns you.",
  },
  {
    id: "greed-golden-bazaar",
    sin: "Greed",
    district: "Golden Bazaar",
    purpose: "Hard-value exchange and premium scarcity lane.",
    service: "Markup trade, rare stock, and aggressive salvage arbitrage.",
    risk: "High prices, exploitative terms, and buyer-side traps.",
    playerUse: "Turn a rich haul into exactly the one thing you still lack.",
    archetype: "A smiling merchant who inventories your desperation first.",
  },
  {
    id: "pride-ivory-tower",
    sin: "Pride",
    district: "Ivory Tower",
    purpose: "Status, recognition, and elite certification lane.",
    service: "Prestige trials, sponsorships, and curated access to higher circles.",
    risk: "Failure becomes public and expensive.",
    playerUse: "Cash in legitimacy when social standing matters as much as power.",
    archetype: "A registrar who records success like scripture and failure like sport.",
  },
  {
    id: "sloth-silent-garden",
    sin: "Sloth",
    district: "Silent Garden",
    purpose: "Low-friction waiting, hiding, and deferred-action lane.",
    service: "Safe pause, passive work, and delay-as-survival arrangements.",
    risk: "Comfort becomes stagnation and missed timing windows.",
    playerUse: "Stall intelligently when pushing forward would break the loop.",
    archetype: "A keeper who survives by never moving first.",
  },
];

export const blackMarketFirstThree = [
  {
    lane: "Gluttony / Feast Hall",
    reason:
      "Best first fit because the repo already tracks condition, cooldown, credits, and salvage. It immediately reinforces the Book 1 survival loop.",
  },
  {
    lane: "Greed / Golden Bazaar",
    reason:
      "Natural second step once a small exchange surface is needed for salvage pressure, but it should follow after the recovery lane proves demand.",
  },
  {
    lane: "Wrath / Arena of Blood",
    reason:
      "Strong later lane because combat identity already exists, but it needs more progression and reward scaffolding than Feast Hall does.",
  },
];

export const blackMarketConnections = [
  {
    title: "Survival",
    detail:
      "Feast Hall anchors the Black Market to condition pressure, making the citadel part of expedition readiness instead of a lore-only stop.",
  },
  {
    title: "Crafting",
    detail:
      "Golden Bazaar can later become the narrow bridge between raw salvage and targeted crafting inputs without forcing a full economy rewrite now.",
  },
  {
    title: "Missions",
    detail:
      "Arena of Blood, Mirror House, and Velvet Den can eventually hang mission modifiers, rival prep, or contract hooks off the existing mission flow.",
  },
];

export const blackMarketImplementationSlice = [
  "Expose the Black Market as a real Bazaar destination with canon framing and sin-lane identity.",
  "Make Gluttony / Feast Hall the first playable lane because it uses current condition and resource state with minimal code risk.",
  "Keep the implementation to one route, one data module, one action, and a small number of lane offers.",
  "Leave the remaining six lanes as structured roadmap context so later expansion has a stable canon frame without forcing system work now.",
];

export const blackMarketFinalResult =
  "The Black Market stops feeling like an empty map node and starts acting like a survival institution inside Book 1: one real lane, one real service, and a clear framework for the other six lanes when the project is ready.";
