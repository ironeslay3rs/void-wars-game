/**
 * Sin institution data — 7 organizations, one per sin.
 *
 * Canon-locked entries:
 *  - Bonehowl Syndicate (Wrath) — confirmed in Puppy Vol.1 Episode 1 as
 *    the org Discount Lars sells cut Lycan strains for. See
 *    VOID_WARS_CANON_GAPS.md "Discount Lars" entry.
 *
 * Game-specific entries (the other six):
 *  Each name pairs with the school's nation/pantheon and is designed to
 *  feel "culturally, visually, and philosophically distinct" per the
 *  vault's Sin Institutions directive. None of these names appear in the
 *  novels. They are flagged `canonSource: "game-specific"` and tracked in
 *  VOID_WARS_CANON_GAPS.md so a future canon pass can revise them.
 */

import type { Institution, InstitutionId } from "@/features/institutions/institutionTypes";

export const INSTITUTIONS: Record<InstitutionId, Institution> = {
  "bonehowl-syndicate": {
    id: "bonehowl-syndicate",
    name: "Bonehowl Syndicate",
    shortName: "Bonehowl Syndicate",
    sin: "wrath",
    schoolId: "bonehowl-of-fenrir",
    laneId: "arena-of-blood",
    tagline:
      "The wolf-pack contracted out. Predator discipline turned commerce.",
    methods:
      "Bonehowl runs hunting contracts in the open and blood-debt arena " +
      "matches in the shadow. Cut Lycan strains move through their dealers " +
      "(Discount Lars among them). Pack hierarchy decides who eats first.",
    socialStance:
      "Recruits from the chase-survivors — operatives who know motion is " +
      "the only honest survival. Distrusts the still and the patient. " +
      "Trades with anyone who needs a Wrath solution that won't be traced " +
      "to a nation.",
    accentHex: "#9c2b2b",
    canonSource: "puppy-spinoff",
  },

  "inti-court": {
    id: "inti-court",
    name: "Court of the Sun-Mouth",
    shortName: "Inti Court",
    sin: "gluttony",
    schoolId: "mouth-of-inti",
    laneId: "feast-hall",
    tagline:
      "Tribute is the only honest economy. The Court keeps the ledger.",
    methods:
      "The Court runs the Pure Empire's tribute pipeline out of the Andes " +
      "and rents Feast Hall stalls to the operatives who feed Blackcity. " +
      "Every meal sold is a vote for which mouth gets to grow next.",
    socialStance:
      "Recruits scribes and ration-priests who can balance hunger against " +
      "memory. Distrusts gamblers and one-meal opportunists. Trades freely " +
      "with the Bonehowl when blood debts pay in spoiled meat.",
    accentHex: "#c89530",
    canonSource: "game-specific",
  },

  "olympus-concord": {
    id: "olympus-concord",
    name: "The Olympus Concord",
    shortName: "Olympus Concord",
    sin: "envy",
    schoolId: "flesh-thrones-of-olympus",
    laneId: "mirror-house",
    tagline:
      "If a rival exists, study them until you become better. If not, invent one.",
    methods:
      "The Concord runs comparison rooms and mimic clinics inside the Bio " +
      "Empire's Aegean territories. In Blackcity, they own the Mirror " +
      "House intel desks where one operative's loadout is sold to another " +
      "for the price of two more loadouts.",
    socialStance:
      "Recruits the relentlessly competitive — operatives who cannot " +
      "stomach being second. Distrusts collaborators. Trades intel with " +
      "anyone willing to be measured.",
    accentHex: "#b87d3a",
    canonSource: "game-specific",
  },

  "astarte-veil": {
    id: "astarte-veil",
    name: "The Astarte Veil",
    shortName: "Astarte Veil",
    sin: "lust",
    schoolId: "crimson-altars-of-astarte",
    laneId: "velvet-den",
    tagline:
      "Every forbidden boon has a price. The Veil decides when to charge it.",
    methods:
      "The Veil runs the Crimson Altars' temple-clinics in the Levantine " +
      "Bio territories and operates the Velvet Den's contracts in " +
      "Blackcity. They specialize in cleansing the corruption their own " +
      "boons cause — both transactions priced separately.",
    socialStance:
      "Recruits the willing and the broken. Distrusts the abstinent. " +
      "Trades pleasures for influence and influence for survival, never " +
      "the other way around.",
    accentHex: "#a4324c",
    canonSource: "game-specific",
  },

  "vishrava-ledger": {
    id: "vishrava-ledger",
    name: "The Vishrava Ledger",
    shortName: "Vishrava Ledger",
    sin: "greed",
    schoolId: "thousand-hands-of-vishrava",
    laneId: "golden-bazaar",
    tagline:
      "Greed is patience misunderstood. The Ledger charges interest on misunderstanding.",
    methods:
      "The Ledger runs the Pure Empire's hoard-vaults in the subcontinent " +
      "and operates the Golden Bazaar exchange floors in Blackcity. Every " +
      "trade routes through one of their abacuses; every loan accrues " +
      "interest in two currencies — credits and patience.",
    socialStance:
      "Recruits accountants, fences, and the long-game-minded. Distrusts " +
      "spenders. Trades with everyone, including rivals — they hold no " +
      "feuds, only positions.",
    accentHex: "#c7a02b",
    canonSource: "game-specific",
  },

  "pharos-conclave": {
    id: "pharos-conclave",
    name: "The Pharos Conclave",
    shortName: "Pharos Conclave",
    sin: "pride",
    schoolId: "divine-pharos-of-ra",
    laneId: "ivory-tower",
    tagline:
      "Visibility is power. The Conclave decides who gets to be seen.",
    methods:
      "The Conclave commands the Mecha Empire's lighthouse-fortresses " +
      "along the Nile and runs the Ivory Tower's prestige negotiations in " +
      "Blackcity. Elite contracts pass through their solar registry; " +
      "anything off-registry goes dark for everyone.",
    socialStance:
      "Recruits operatives whose pride is also their discipline. " +
      "Distrusts the unmarked and the anonymous. Trades only at " +
      "highest-tier — the Conclave does not haggle.",
    accentHex: "#c79a3a",
    canonSource: "game-specific",
  },

  "mandate-bureau": {
    id: "mandate-bureau",
    name: "The Mandate Bureau",
    shortName: "Mandate Bureau",
    sin: "sloth",
    schoolId: "clockwork-mandate-of-heaven",
    laneId: "silent-garden",
    tagline:
      "The Bureau outlasts everything. That is its weapon and its tax.",
    methods:
      "The Bureau runs the Mecha Empire's clockwork tribunals across the " +
      "Eastern frontier and maintains the Silent Garden's hidden " +
      "observation cells in Blackcity. They operate on cycles, not " +
      "deadlines — and the cycles are always longer than your patience.",
    socialStance:
      "Recruits the disciplined patient — operatives who can wait three " +
      "cycles for a single shot. Distrusts the urgent. Trades by " +
      "appointment only, and the appointment is two months away.",
    accentHex: "#5e7a8a",
    canonSource: "game-specific",
  },
};

export const INSTITUTION_ORDER: InstitutionId[] = [
  "bonehowl-syndicate",
  "olympus-concord",
  "astarte-veil",
  "inti-court",
  "vishrava-ledger",
  "pharos-conclave",
  "mandate-bureau",
];
