/**
 * Canonical 7 schools — full data.
 *
 * Source: docs/7-school-gameplay-spine.md cross-checked against
 * lore-canon/01 Master Canon/Sins/, Locations/Black Market Lanes.md,
 * and Empires/The Three Empires.md.
 *
 * Each entry is the open public face of one capital sin. The shadow
 * face is the black market lane named in `laneId`.
 */

import type { School, SchoolId } from "@/features/schools/schoolTypes";

export const SCHOOLS: Record<SchoolId, School> = {
  "bonehowl-of-fenrir": {
    id: "bonehowl-of-fenrir",
    name: "The Bonehowl of Fenrir",
    shortName: "Bonehowl",
    sin: "wrath",
    sinDisplay: "Wrath",
    nation: "Norway",
    pantheon: "Norse",
    empireId: "bio",
    laneId: "arena-of-blood",
    laneDisplay: "Arena of Blood",
    laneRoute: "/bazaar/black-market", // arena currently lives at the hub
    pressure: "escalation",
    countermeasure: "burst-sustain-disengage",
    originTagIds: ["bonehowl-remnant"],
    tagline:
      "The wolf-school of the northern fronts. Wrath taught as movement, " +
      "not as madness.",
    longForm:
      "The Bonehowl trains its initiates the way Fenrir's pack would: motion " +
      "is survival, hesitation is death. They hold the cold fronts of the Bio " +
      "Empire and treat wrath as a discipline, not a failure. Their predator " +
      "storms and bone-freeze packs run the Norway theatre and bleed into the " +
      "Arena of Blood inside Blackcity, where their fighters earn coin and " +
      "settle blood debts the empire can't openly sanction.",
    breakthrough:
      "Survive chained pursuit waves, then break the alpha during its overcommit window.",
    accentHex: "#9c2b2b",
  },

  "mouth-of-inti": {
    id: "mouth-of-inti",
    name: "The Mouth of Inti",
    shortName: "Mouth of Inti",
    sin: "gluttony",
    sinDisplay: "Gluttony",
    nation: "Peru",
    pantheon: "Inca",
    empireId: "pure",
    laneId: "feast-hall",
    laneDisplay: "Feast Hall",
    laneRoute: "/bazaar/black-market/feast-hall",
    pressure: "consumption",
    countermeasure: "efficiency-conversion",
    originTagIds: ["mouth-of-inti-relic"],
    tagline:
      "The sun-mouth school. Gluttony reframed as tribute, hunger as ritual.",
    longForm:
      "The Mouth of Inti runs the Pure Empire's tribute economy out of the " +
      "Peruvian highlands. Their solar drain fields and devouring shrines " +
      "teach that hunger isn't weakness — it's the metabolism of power. Their " +
      "shadow walks the Feast Hall in Blackcity, where the same tribute " +
      "principle becomes ration politics, and the cost of eating is paid in " +
      "favor and condition.",
    breakthrough:
      "Feed the citadel the demanded tribute pattern, then starve the core of fresh intake.",
    accentHex: "#c89530",
  },

  "flesh-thrones-of-olympus": {
    id: "flesh-thrones-of-olympus",
    name: "The Flesh Thrones of Olympus",
    shortName: "Flesh Thrones",
    sin: "envy",
    sinDisplay: "Envy",
    nation: "Greece",
    pantheon: "Greek",
    empireId: "bio",
    laneId: "mirror-house",
    laneDisplay: "Mirror House",
    laneRoute: "/bazaar/black-market/mirror-house",
    pressure: "comparison",
    countermeasure: "modular-swap",
    originTagIds: ["olympus-castoff"],
    tagline:
      "The mimic-school. Envy taught as the discipline of becoming better than your rival.",
    longForm:
      "The Flesh Thrones of Olympus train mutation through comparison. " +
      "Mimic elites and copied champion-rooms turn envy into a forge: their " +
      "initiates learn to swap forms faster than any opponent can read them. " +
      "Their shadow runs the Mirror House in Blackcity, where the same " +
      "discipline becomes intel work, status comparison, and quiet sabotage.",
    breakthrough:
      "Win by rotating away from repeated loadout patterns and forcing the boss into bad copies.",
    accentHex: "#b87d3a",
  },

  "crimson-altars-of-astarte": {
    id: "crimson-altars-of-astarte",
    name: "The Crimson Altars of Astarte",
    shortName: "Crimson Altars",
    sin: "lust",
    sinDisplay: "Lust",
    nation: "Lebanon",
    pantheon: "Canaanite",
    empireId: "bio",
    laneId: "velvet-den",
    laneDisplay: "Velvet Den",
    laneRoute: "/bazaar/black-market/velvet-den",
    pressure: "temptation",
    countermeasure: "cleansing-boon",
    originTagIds: ["crimson-altar-contraband"],
    tagline:
      "The school of forbidden boons. Lust taught as a contract with consequences.",
    longForm:
      "The Crimson Altars of Astarte were the Bio Empire's gift to the " +
      "ancient Canaanite coast: seduction zones, blood-offer chambers, and " +
      "healing baits that always cost more than they give. Their initiates " +
      "learn to take a forbidden boon, cash it out clean, and walk away " +
      "before the corruption settles. Their shadow runs the Velvet Den in " +
      "Blackcity, where the same arts become social leverage and influence.",
    breakthrough:
      "Refuse or cleanse enough temptation marks to expose the altar-heart phase.",
    accentHex: "#a4324c",
  },

  "thousand-hands-of-vishrava": {
    id: "thousand-hands-of-vishrava",
    name: "The Thousand Hands of Vishrava",
    shortName: "Thousand Hands",
    sin: "greed",
    sinDisplay: "Greed",
    nation: "India",
    pantheon: "Hindu",
    empireId: "pure",
    laneId: "golden-bazaar",
    laneDisplay: "Golden Bazaar",
    laneRoute: "/bazaar/black-market/golden-bazaar",
    pressure: "hoarding",
    countermeasure: "compression-protect",
    originTagIds: ["thousand-hands-fragment"],
    tagline:
      "The collector-school. Greed reframed as the long discipline of holding power.",
    longForm:
      "The Thousand Hands of Vishrava run the Pure Empire's hoarding rites " +
      "out of the Indian subcontinent. Their tax lattices and cursed caches " +
      "teach that greed only becomes corruption when it's careless. Their " +
      "shadow runs the Golden Bazaar in Blackcity, where the same logic " +
      "underwrites the most efficient market on the citadel — every trade " +
      "is also a measurement of patience.",
    breakthrough:
      "Enter lean, bank smart, and trigger the boss's overload by denying reclaimable wealth.",
    accentHex: "#c7a02b",
  },

  "divine-pharos-of-ra": {
    id: "divine-pharos-of-ra",
    name: "The Divine Pharos of Ra",
    shortName: "Divine Pharos",
    sin: "pride",
    sinDisplay: "Pride",
    nation: "Egypt",
    pantheon: "Egyptian",
    empireId: "mecha",
    laneId: "ivory-tower",
    laneDisplay: "Ivory Tower",
    laneRoute: "/bazaar/black-market/ivory-tower",
    pressure: "exposure",
    countermeasure: "shielding-anti-mark",
    originTagIds: ["pharos-surplus"],
    tagline:
      "The lighthouse-school. Pride taught as visibility — the willingness to be seen.",
    longForm:
      "The Divine Pharos of Ra anchor the Mecha Empire's southern frontier. " +
      "Their sightline towers and solar artillery turn exposure itself into a " +
      "weapon: anything visible is also marked, and anything marked is also " +
      "owned. Their shadow runs the Ivory Tower in Blackcity, where the same " +
      "discipline becomes elite negotiation and prestige signaling.",
    breakthrough:
      "Disable the region's visibility network and force the boss into a grounded collapse state.",
    accentHex: "#c79a3a",
  },

  "clockwork-mandate-of-heaven": {
    id: "clockwork-mandate-of-heaven",
    name: "The Clockwork Mandate of Heaven",
    shortName: "Clockwork Mandate",
    sin: "sloth",
    sinDisplay: "Sloth",
    nation: "China",
    pantheon: "Chinese",
    empireId: "mecha",
    laneId: "silent-garden",
    laneDisplay: "Silent Garden",
    laneRoute: "/bazaar/black-market/silent-garden",
    pressure: "delay",
    countermeasure: "tempo-restoration",
    originTagIds: ["mandate-salvage"],
    tagline:
      "The clock-school. Sloth taught as the patience to outlast.",
    longForm:
      "The Clockwork Mandate of Heaven holds the Mecha Empire's eastern " +
      "frontier with time itself. Their slowing fields, automation queues, " +
      "and sleeping cannons teach that sloth — properly disciplined — is " +
      "inevitability. Their shadow walks the Silent Garden in Blackcity, " +
      "where the same patience becomes hidden observation and slow power.",
    breakthrough:
      "Interrupt enough mandate cycles in sequence to desynchronize the core machine.",
    accentHex: "#5e7a8a",
  },
};

export const SCHOOL_ORDER: SchoolId[] = [
  "bonehowl-of-fenrir",
  "flesh-thrones-of-olympus",
  "crimson-altars-of-astarte",
  "mouth-of-inti",
  "thousand-hands-of-vishrava",
  "divine-pharos-of-ra",
  "clockwork-mandate-of-heaven",
];
