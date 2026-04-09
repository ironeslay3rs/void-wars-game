export type StatCard = {
  label: string;
  value: string;
  hint: string;
};

export type ProfessionDoctrine = {
  title: string;
  description: string;
};

export type ProfessionTrack = {
  title: string;
  family: string;
  battlefieldRole: string;
  loopRole: string;
};

export type ProfessionsSection = {
  title: string;
  description: string;
  body?: string;
  items?: string[];
};

export type ProfessionsScreenData = {
  eyebrow: string;
  title: string;
  subtitle: string;
  cards: StatCard[];
  doctrine: ProfessionDoctrine[];
  tracks: ProfessionTrack[];
  sections: ProfessionsSection[];
};

export const professionsScreenData: ProfessionsScreenData = {
  eyebrow: "Void Wars / War Professions Doctrine",
  title: "Profession Systems",
  subtitle:
    "Professions are not side jobs — they are how expedition wounds and rare hauls become gear, rites, and war readiness. Start from the snapshot, then read the doctrine blocks below.",

  cards: [
    {
      label: "War Pillars",
      value: "06",
      hint: "Bio, Mecha, Pure, Rune Crafter, Rune Knight, Void evolution support.",
    },
    {
      label: "Craft Engines",
      value: "03",
      hint: "Salvage, refinement, and inscription shape every combat run.",
    },
    {
      label: "Design Rule",
      value: "Pressure First",
      hint: "Professions must answer expedition risk instead of becoming a detached economy.",
    },
  ],

  doctrine: [
    {
      title: "Pressure must feed profession demand.",
      description:
        "Expeditions should damage bodies, strain minds, consume tools, and surface rare materials that only trained professions can stabilize.",
    },
    {
      title: "Crafted power must change survival odds.",
      description:
        "Bio grafts, mecha frames, pure rites, and rune work should determine whether later runs break the player or open the next threshold.",
    },
    {
      title: "Ascension must pass through profession thresholds.",
      description:
        "Evolution paths should require crafted breakthroughs, not only raw levels, so progression stays tied to the world and its factions.",
    },
  ],

  tracks: [
    {
      title: "Bio Crafter",
      family: "Flesh, grafts, specimens",
      battlefieldRole:
        "Turns harvested tissue into mutagens, healing grafts, and risky evolution catalysts.",
      loopRole:
        "Converts monster pressure into survivability and mutation-driven advancement.",
    },
    {
      title: "Mecha Crafter",
      family: "Frames, salvage, prosthetics",
      battlefieldRole:
        "Builds weapon housings, armor plates, servo limbs, and recovery rigs from battlefield salvage.",
      loopRole:
        "Transforms war scrap into durable loadouts that let players survive harsher fronts.",
    },
    {
      title: "Pure Adept",
      family: "Purification, breathing, internal stability",
      battlefieldRole:
        "Refines the body-core, resists corruption, and protects breakthroughs from collapse.",
      loopRole:
        "Keeps pressure from becoming runaway degeneration and anchors long-term ascension.",
    },
    {
      title: "Rune Crafter",
      family: "Seals, inscriptions, ritual tooling",
      battlefieldRole:
        "Imprints gear, chambers, and relics with path-specific runes that unlock stronger expedition options.",
      loopRole:
        "Converts rare drops into persistent power spikes and progression keys.",
    },
    {
      title: "Rune Knight",
      family: "Frontline war carriers",
      battlefieldRole:
        "Takes crafted systems into the field as the armored executor of faction doctrine.",
      loopRole:
        "Proves crafted power under pressure and returns with war reputation, scars, and elite spoils.",
    },
    {
      title: "Void Evolutionist",
      family: "Forbidden adaptation",
      battlefieldRole:
        "Studies void residue, afflictions, and failed growth to force high-risk evolution paths.",
      loopRole:
        "Opens the darkest ascent routes while threatening collapse, corruption, and faction backlash.",
    },
  ],

  sections: [
    {
      title: "Profession Contribution Loop",
      description:
        "Every profession should attach to the same core loop instead of living in an isolated crafting menu.",
      items: [
        "Expeditions create wounds, stress, scarcity, and volatile materials.",
        "Professions stabilize or weaponize those returns into gear, rites, grafts, and runes.",
        "Upgraded builds push deeper expeditions with higher failure pressure.",
        "Successful returns feed faction war boards, district output, and ascension gates.",
        "New thresholds unlock harsher evolution paths, which create new profession demands.",
      ],
    },
    {
      title: "What the profession layer must support",
      description:
        "The profession foundation should serve the main fantasy before it serves content breadth.",
      items: [
        "Recovery and anti-collapse systems so pressure has consequences without dead-ending runs.",
        "Path-bound recipes that make Bio, Mecha, and Pure/Rune identities play differently.",
        "Faction war requisitions that consume crafted goods for territory or influence gain.",
        "Breakthrough requirements that demand crafted preparations before rank ascension.",
      ],
    },
    {
      title: "Scope rule",
      description:
        "Keep the first implementation narrow and structural.",
      body:
        "The next safe step is to connect one profession output directly to the live expedition loop, then let future work expand into faction requisitions, afflictions, and evolution branches.",
    },
  ],
};
