/**
 * UI identity portraits (hub / HUD only). Void Field keeps icon sprites — do not use these there.
 */

export const CHARACTER_PORTRAIT_IDS = [
  "male_01",
  "female_01",
  "male_02",
  "female_02",
  "elder_male",
  "elder_female",
] as const;

export type CharacterPortraitId = (typeof CHARACTER_PORTRAIT_IDS)[number];

const PORTRAIT_PATH: Record<CharacterPortraitId, string> = {
  male_01: "/assets/characters/male_01.png",
  female_01: "/assets/characters/female_01.png",
  male_02: "/assets/characters/male_02.png",
  female_02: "/assets/characters/female_02.png",
  elder_male: "/assets/characters/elder_male.png",
  elder_female: "/assets/characters/elder_female.png",
};

export function isCharacterPortraitId(value: string): value is CharacterPortraitId {
  return (CHARACTER_PORTRAIT_IDS as readonly string[]).includes(value);
}

export function portraitSrcForCharacterId(id: CharacterPortraitId): string {
  return PORTRAIT_PATH[id];
}

export const DEFAULT_CHARACTER_PORTRAIT_ID: CharacterPortraitId = "male_01";
