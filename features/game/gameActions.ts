import {
  BazaarDistrict,
  InventoryItem,
  PathType,
  PlayerState,
} from "./gameTypes";

function mergeInventoryItems(
  inventory: InventoryItem[],
  incoming: InventoryItem[]
): InventoryItem[] {
  const next = [...inventory];

  for (const item of incoming) {
    const existing = next.find((entry) => entry.id === item.id);

    if (existing) {
      existing.quantity += item.quantity;
    } else {
      next.push({ ...item });
    }
  }

  return next;
}

function unlockMissionIfLocked(state: PlayerState, missionId: string) {
  return state.missions.map((mission) =>
    mission.id === missionId && mission.status === "locked"
      ? { ...mission, status: "available" as const }
      : mission
  );
}

function getRankTitle(level: number): string {
  if (level >= 10) return "Ascendant";
  if (level >= 7) return "Vanguard";
  if (level >= 4) return "Operative";
  return "Initiate";
}

function getXpThreshold(level: number): number {
  if (level <= 1) return 100;
  if (level === 2) return 150;
  if (level === 3) return 225;
  if (level === 4) return 325;

  return Math.floor(325 + (level - 4) * 125);
}

function applyRankXp(state: PlayerState, xpGained: number) {
  let rankLevel = state.rankLevel;
  let rankXp = state.rankXp + xpGained;
  let rankXpToNext = state.rankXpToNext;

  while (rankXp >= rankXpToNext) {
    rankXp -= rankXpToNext;
    rankLevel += 1;
    rankXpToNext = getXpThreshold(rankLevel);
  }

  return {
    rank: getRankTitle(rankLevel),
    rankLevel,
    rankXp,
    rankXpToNext,
  };
}

export function selectPath(state: PlayerState, path: PathType): PlayerState {
  const missions = unlockMissionIfLocked(state, "prologue-entry");

  return {
    ...state,
    path,
    missions,
  };
}

export function startMission(state: PlayerState, missionId: string): PlayerState {
  const targetMission = state.missions.find((mission) => mission.id === missionId);

  if (!targetMission || targetMission.status !== "available") {
    return state;
  }

  if (state.activeMissionId && state.activeMissionId !== missionId) {
    return state;
  }

  if (!state.path && missionId === "prologue-entry") {
    return state;
  }

  const missions = state.missions.map((mission) =>
    mission.id === missionId
      ? { ...mission, status: "active" as const }
      : mission
  );

  return {
    ...state,
    activeMissionId: missionId,
    missions,
  };
}

export function completeMission(state: PlayerState, missionId: string): PlayerState {
  const mission = state.missions.find((entry) => entry.id === missionId);

  if (!mission || mission.status !== "active") {
    return state;
  }

  if (!state.path && missionId === "prologue-entry") {
    return state;
  }

  const rewards = mission.rewards;
  const unlockedDistricts: BazaarDistrict[] = [...state.unlockedDistricts];

  if (rewards.unlockDistricts) {
    for (const district of rewards.unlockDistricts) {
      if (!unlockedDistricts.includes(district)) {
        unlockedDistricts.push(district);
      }
    }
  }

  const inventory = rewards.items?.length
    ? mergeInventoryItems(state.inventory, rewards.items)
    : state.inventory;

  const rankProgress = applyRankXp(state, rewards.rankXp ?? 0);

  const missions = state.missions.map((entry) => {
    if (entry.id === missionId) {
      return { ...entry, status: "completed" as const };
    }

    if (
      missionId === "prologue-entry" &&
      entry.id === "first-assignment" &&
      entry.status === "locked"
    ) {
      return { ...entry, status: "available" as const };
    }

    if (
      missionId === "first-assignment" &&
      entry.id === "district-access" &&
      entry.status === "locked"
    ) {
      return { ...entry, status: "available" as const };
    }

    return entry;
  });

  return {
    ...state,
    ...rankProgress,
    credits: state.credits + (rewards.credits ?? 0),
    voidCrystals: state.voidCrystals + (rewards.voidCrystals ?? 0),
    bioEssence: state.bioEssence + (rewards.bioEssence ?? 0),
    condition: Math.min(100, state.condition + (rewards.condition ?? 0)),
    masteryProgress: Math.min(100, state.masteryProgress + (rewards.masteryProgress ?? 0)),
    activeMissionId: null,
    unlockedDistricts,
    inventory,
    missions,
  };
}