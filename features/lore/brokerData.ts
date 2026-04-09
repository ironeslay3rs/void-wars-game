import type { PathType } from "@/features/game/gameTypes";
import type { NationId } from "@/features/lore/nationData";
import type { DistrictId } from "@/features/lore/districtData";

/**
 * NPC brokers — the displaced war refugees who inhabit the Black Market.
 * Each carries a backstory from the distant wars and a personality that
 * makes the districts feel alive.
 *
 * CANON STATUS: GAME-SPECIFIC CREATIVE WORK
 * None of these NPCs are canonical book characters. The vault's only named
 * character is "Iron" (protagonist). All broker names, backstories, and
 * personalities are game-specific design for Void Wars: Oblivion.
 * Nation origins and school alignments follow the game's nation-sin-school
 * mapping (also game-specific — see nationData.ts).
 */

export type BrokerEntry = {
  id: string;
  name: string;
  title: string;
  districtId: DistrictId;
  school: PathType | "neutral";
  nationOrigin: NationId | null;
  backstory: string;
  personality: string;
  specialization: string;
  flavorQuote: string;
};

export const brokers: BrokerEntry[] = [
  // CANON SOURCE: Evolution Puppy Vol.1, Episode 1 — "Discount Lars," Bonehowl Syndicate,
  // sold Elias a cut Lycan strain. "Pure Lycan Strain. Uncut. Moon-blessed. Fresh from the Bonehowl labs."
  // Canonical NPC. Cheerful scammer. Sells beast blood that's "probably grade two."
  {
    id: "discount-lars",
    name: "Discount Lars",
    title: "Bonehowl Deserter",
    districtId: "feast-hall",
    school: "bio",
    nationOrigin: "norway",
    backstory:
      "Lars deserted from Fenrir's third hunting cadre after a Wrath-surge left half his unit mutated beyond recognition. He took what blood vials he could carry and walked south until the Black Market swallowed him.",
    personality: "Cheerful, dishonest, surprisingly reliable. Sells beast blood that's 'probably grade two.'",
    specialization: "Bio samples, beast blood, Bonehowl-grade mutation catalysts.",
    flavorQuote: "Bonehowl stock, fresh off the transport. No refunds. No questions.",
  },
  {
    id: "hazel",
    name: "Hazel",
    title: "Memory Ash Dealer",
    districtId: "pure-enclave",
    school: "pure",
    nationOrigin: "peru",
    backstory:
      "Hazel absorbed too many fragmented souls during a Mouth of Inti excavation. She speaks in half-finished sentences because three other people's memories keep interrupting her own. The relic trade is all she has left.",
    personality: "Gentle, scattered, unsettlingly perceptive. Finishes other people's thoughts before they do.",
    specialization: "Memory shards, rune dust, Inti-grade soul fragments.",
    flavorQuote: "The rune-smith who made this… she was… the fire was…",
  },
  {
    id: "kessler-9",
    name: "Kessler-9",
    title: "Pharos Defector",
    districtId: "mecha-foundry",
    school: "mecha",
    nationOrigin: "egypt",
    backstory:
      "Kessler was a fourth-tier frame architect in Ra's divine factories before Pride's obsession with aesthetic perfection drove her out. She kept the Pharos serial number as a name because she doesn't remember the one her parents gave her.",
    personality: "Precise, clinical, secretly lonely. Every sentence sounds like a diagnostic report.",
    specialization: "Neural interface chips, Pharos-grade servomotors, frame calibration parts.",
    flavorQuote: "Pharos engineering. Divine-grade. The serial is gone but the architecture is flawless.",
  },
  // CANON PARALLEL: "The Cook" from Evolution Puppy Vol.1 — unnamed food stall operator
  // in Lower Sector 9. Serves Elias throughout the series. Key line: "Survive. That's the
  // only currency I accept." Mama Sol is the game's adaptation of this archetype.
  // The Cook's real name is never revealed in the Puppy series.
  {
    id: "mama-sol",
    name: "Mama Sol",
    title: "Feast Hall Matron",
    districtId: "feast-hall",
    school: "neutral",
    nationOrigin: null,
    backstory:
      "Nobody knows where Mama Sol came from. Some say she was a combat medic who defected from all three schools. The food always tastes like home, regardless of which home you came from. She has never explained how.",
    personality: "Warm, immovable, terrifying when crossed. The kitchen is her territory and everyone respects that.",
    specialization: "Recovery meals, ration brokering, condition restoration.",
    flavorQuote: "You eat. You rest. You go back out. That's the deal.",
  },
  {
    id: "glass",
    name: "Glass",
    title: "Mirror House Intel Broker",
    districtId: "mirror-house",
    school: "bio",
    nationOrigin: "greece",
    backstory:
      "Glass was an Olympus flesh-sculptor who specialized in making people look like other people. She fled Greece when Envy's politics turned lethal. Now she sells information instead of faces — the margins are better and the clients are less likely to kill the product.",
    personality: "Cool, observant, never reveals her real name. Trades in secrets and comparison.",
    specialization: "Intel on rivals, market movements, faction pressure shifts.",
    flavorQuote: "The mirrors don't reflect you. They reflect who's watching you.",
  },
  {
    id: "the-warden",
    name: "The Warden",
    title: "Coliseum Overseer",
    districtId: "coliseum",
    school: "neutral",
    nationOrigin: null,
    backstory:
      "Nobody has ever heard the Warden speak outside the arena floor. On the floor, the Warden speaks once per match — the judgment. It is always final. Rumors say the Warden was the last survivor of a school that no longer exists.",
    personality: "Silent, absolute, watching. Presence is the only communication needed.",
    specialization: "Arena management, match arbitration, prestige judgment.",
    flavorQuote: "",
  },
  {
    id: "tomo-wrench",
    name: "Tomo Wrench",
    title: "Mandate Salvage Specialist",
    districtId: "crafting-district",
    school: "mecha",
    nationOrigin: "china",
    backstory:
      "Tomo was a patience-engineer in the Mandate's automation division — a role so slow that projects took decades. He defected because he wanted to build something he could finish in his own lifetime. The Black Market gave him that chance.",
    personality: "Methodical, patient even by Mandate standards, finds joy in small repairs.",
    specialization: "Precision components, alloy refinement, structural crafting.",
    flavorQuote: "Mandate engineering. Slow to arrive. Impossible to break.",
  },
  {
    id: "sable",
    name: "Sable",
    title: "Velvet Den Influence Broker",
    districtId: "velvet-den",
    school: "bio",
    nationOrigin: "lebanon",
    backstory:
      "Sable carried Crimson Altar pheromone tech out of Lebanon in her blood — literally. The Astarte cults engineered her as a social weapon. She decided to weaponize herself on her own terms instead.",
    personality: "Magnetic, controlled, always two moves ahead in every conversation.",
    specialization: "Influence trade, social leverage, neural-bond catalysts.",
    flavorQuote: "Everyone in this room wants something from everyone else. I'm the only one who admits it.",
  },
  {
    id: "old-ivory",
    name: "Old Ivory",
    title: "Ivory Tower Prestige Dealer",
    districtId: "ivory-tower",
    school: "mecha",
    nationOrigin: "egypt",
    backstory:
      "A former Pharos aesthetician who built beauty into war machines. When Ra's engineers decided function mattered more than form, Ivory lost his purpose. He rebuilt it in the Black Market, where prestige is a product you can sell.",
    personality: "Elegant, performative, genuinely believes beauty is a form of power.",
    specialization: "Prestige marks, elite signaling, authority display.",
    flavorQuote: "The Pharos built divine machines. I build divine impressions. The effect is the same.",
  },
  {
    id: "root",
    name: "Root",
    title: "Silent Garden Watcher",
    districtId: "silent-garden",
    school: "mecha",
    nationOrigin: "china",
    backstory:
      "Root was a temporal-patience specialist in the Mandate — someone whose entire job was to wait and observe. When the Mandate decided observation was a form of Sloth and therefore a sin, Root walked out. Now she observes the Black Market. Nobody knows what she's waiting for.",
    personality: "Still, patient, speaks only when the answer has been certain for a long time.",
    specialization: "Long-term observation, delayed investments, temporal patience.",
    flavorQuote: "Everything arrives. The question is whether you are still here when it does.",
  },
  {
    id: "ashveil",
    name: "Ashveil",
    title: "Thousand Hands Relic Smuggler",
    districtId: "golden-bazaar",
    school: "pure",
    nationOrigin: "india",
    backstory:
      "Ashveil was a vault-keeper for Vishrava's spiritual hoard before Greed consumed the institution. She smuggled fragments out one at a time, hidden in resonance-shielded containers. The Golden Bazaar pays well for what she carries.",
    personality: "Careful, guilt-ridden, precise about provenance. Treats every fragment like stolen heritage.",
    specialization: "Rare spiritual artifacts, Thousand Hands vault fragments, resonance shards.",
    flavorQuote: "Every piece was stolen from someone who needed it more. Including this one.",
  },
  {
    id: "nails",
    name: "Nails",
    title: "Teleport Gate Engineer",
    districtId: "teleport-gate",
    school: "neutral",
    nationOrigin: null,
    backstory:
      "Nails maintains the gate array — the only stable portal between the Black Market and the hunting zones. Nobody knows how she learned void-space stabilization. She doesn't talk about it. The gate works. That's enough.",
    personality: "Terse, competent, zero tolerance for small talk near the gate array.",
    specialization: "Gate calibration, zone routing, void-space stabilization.",
    flavorQuote: "Stand clear. Touch nothing. The gate doesn't care if you're ready.",
  },
  // NON-CANON PLACEHOLDER — game-specific NPC
  {
    id: "iron-jaw",
    name: "Iron Jaw",
    title: "Mercenary Guild Recruiter",
    districtId: "mercenary-guild",
    school: "neutral",
    nationOrigin: "norway",
    backstory:
      "Former Bonehowl enforcer who lost half his jaw to a Verdant Coil beast and replaced it with Ironheart. Now runs recruitment for the Guild. He doesn't fight anymore — he decides who does.",
    personality: "Blunt. Efficient. Judges you by your record, not your school.",
    specialization: "Combat contracts, bounty postings, hunt registration.",
    flavorQuote: "The contract doesn't care about your feelings. Neither do I.",
  },
];

export function getBrokerById(id: string): BrokerEntry | undefined {
  return brokers.find((b) => b.id === id);
}

export function getBrokersByDistrict(districtId: DistrictId): BrokerEntry[] {
  return brokers.filter((b) => b.districtId === districtId);
}
