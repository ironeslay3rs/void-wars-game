/**
 * Empire data — three civilizational bodies.
 *
 * Source: lore-canon/01 Master Canon/Empires/The Three Empires.md +
 * docs/7-school-gameplay-spine.md (sin → school → empire mapping).
 *
 * Each empire owns 2-3 schools. Total: 7 schools across 3 empires.
 *  - Bio: 3 schools (Wrath, Envy, Lust)
 *  - Pure: 2 schools (Gluttony, Greed)
 *  - Mecha: 2 schools (Pride, Sloth)
 */

import type { Empire, EmpireId } from "@/features/empires/empireTypes";

export const EMPIRES: Record<EmpireId, Empire> = {
  bio: {
    id: "bio",
    name: "Bio Empire",
    tagline: "Adaptation through flesh",
    philosophy:
      "Strength, survival, flesh, adaptation, predation, and renewal.",
    longForm:
      "The Bio Empire answers the question of survival with the body itself. " +
      "Where Mecha builds and Pure remembers, Bio adapts — through DNA, hunting, " +
      "mutation, and the living power of organisms refusing to stay still. Its " +
      "schools spread across nations whose myths name the body's hungers: the " +
      "wrath of the wolf, the envy of mirrored champions, the lust of crimson rites.",
    schoolIds: [
      "bonehowl-of-fenrir",
      "flesh-thrones-of-olympus",
      "crimson-altars-of-astarte",
    ],
    accentHex: "#7a1f2b",
    doctrineWord: "Flesh",
    claim: "The body is the only honest answer.",
  },
  mecha: {
    id: "mecha",
    name: "Mecha Empire",
    tagline: "Adaptation through precision",
    philosophy:
      "Intelligence, analysis, precision, structure, enhancement, and control.",
    longForm:
      "The Mecha Empire answers survival with the mind made structural. Where " +
      "Bio mutates and Pure inherits, Mecha engineers — frames, sensors, command " +
      "lattices, and the cold certainty of machinery that refuses to forget. Its " +
      "schools rise in nations whose discipline shaped armies and mandates: the " +
      "pride of the radiant tower, the sloth of the inevitable clock.",
    schoolIds: ["divine-pharos-of-ra", "clockwork-mandate-of-heaven"],
    accentHex: "#3d5a7a",
    doctrineWord: "Frame",
    claim: "The future belongs to those who measure it.",
  },
  pure: {
    id: "pure",
    name: "Pure Empire",
    tagline: "Adaptation through memory",
    philosophy:
      "Wisdom, memory, soul, inheritance, and spiritual law.",
    longForm:
      "The Pure Empire answers survival with the soul preserved. Where Bio " +
      "consumes and Mecha builds, Pure remembers — through ritual, ember, " +
      "rune-wisdom, and the slow refining of inheritance into law. Its schools " +
      "anchor in nations whose temples held back time: the gluttony of the sun-mouth, " +
      "the greed of the thousand-handed broker.",
    schoolIds: ["mouth-of-inti", "thousand-hands-of-vishrava"],
    accentHex: "#7a5d1f",
    doctrineWord: "Ember",
    claim: "Memory is the only thing the Void cannot eat.",
  },
};

export const EMPIRE_ORDER: EmpireId[] = ["bio", "mecha", "pure"];
