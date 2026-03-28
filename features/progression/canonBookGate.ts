import type { CanonBookRung, MissionDefinition } from "@/features/game/gameTypes";

export const CURRENT_LAUNCH_CANON_RUNG: CanonBookRung = "book-1";

const canonBookOrder: CanonBookRung[] = [
  "book-1",
  "book-2",
  "book-3",
  "book-4",
  "book-5",
  "book-6",
  "book-7",
];

function normalizeCanonBook(book: MissionDefinition["canonBook"]): CanonBookRung {
  if (!book || book === "system") {
    return "book-1";
  }

  return book;
}

export function isCanonBookMissionUnlocked(
  book: MissionDefinition["canonBook"],
  unlockedBook: CanonBookRung = CURRENT_LAUNCH_CANON_RUNG,
): boolean {
  const missionBook = normalizeCanonBook(book);
  const missionIndex = canonBookOrder.indexOf(missionBook);
  const unlockedIndex = canonBookOrder.indexOf(unlockedBook);

  if (missionIndex < 0 || unlockedIndex < 0) {
    return true;
  }

  return missionIndex <= unlockedIndex;
}

export function getCanonBookLockReason(
  book: MissionDefinition["canonBook"],
  unlockedBook: CanonBookRung = CURRENT_LAUNCH_CANON_RUNG,
): string {
  const missionBook = normalizeCanonBook(book).replace("-", " ").toUpperCase();
  const currentBook = unlockedBook.replace("-", " ").toUpperCase();

  return `Locked to ${missionBook}. Current live scope: ${currentBook}.`;
}
