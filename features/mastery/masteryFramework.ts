export type MasterySchool = "bio" | "mecha" | "pure";

export type MasteryThresholdId =
  | "specialization-lock"
  | "respec-window-close"
  | "hybrid-eligibility";

export type HybridClassHookId =
  | "bio-mecha-hybrid"
  | "bio-pure-hybrid"
  | "mecha-pure-hybrid";

export type MasteryTrackScaffold = {
  school: MasterySchool;
  identity: string;
  stickyByDefault: true;
  specializationLockThresholdId: MasteryThresholdId;
  futureHybridHookIds: HybridClassHookId[];
};

export type MasteryFrameworkScaffold = {
  lockedCanonRules: {
    macroSchools: MasterySchool[];
    stickySchoolMasteryByDefault: true;
    specializationFirst: true;
    hybridUnlocksLater: true;
  };
  m1ImplementationShape: {
    activeModel: "single-primary-school";
    masteryRail: "threshold-and-state-scaffold";
    saveSchemaChangeRequiredNow: false;
    gameplayImplementationIncludedNow: false;
  };
  respecWindowHook: {
    status: "reserved";
    allowedPhase: "before-specialization-lock";
    closesAtThresholdId: MasteryThresholdId;
    implementationNote: string;
  };
  hybridUnlockHooks: {
    status: "reserved";
    unlockOrder: "primary-school-first";
    requiresCommittedPrimary: true;
    requiresSecondaryInvestmentLater: true;
    compatibilityNote: string;
  };
  schoolTracks: MasteryTrackScaffold[];
};

export const masteryFrameworkScaffold: MasteryFrameworkScaffold = {
  lockedCanonRules: {
    macroSchools: ["bio", "mecha", "pure"],
    stickySchoolMasteryByDefault: true,
    specializationFirst: true,
    hybridUnlocksLater: true,
  },
  m1ImplementationShape: {
    activeModel: "single-primary-school",
    masteryRail: "threshold-and-state-scaffold",
    saveSchemaChangeRequiredNow: false,
    gameplayImplementationIncludedNow: false,
  },
  respecWindowHook: {
    status: "reserved",
    allowedPhase: "before-specialization-lock",
    closesAtThresholdId: "respec-window-close",
    implementationNote:
      "Future respec should only detach early school investment before the first hard specialization threshold is crossed.",
  },
  hybridUnlockHooks: {
    status: "reserved",
    unlockOrder: "primary-school-first",
    requiresCommittedPrimary: true,
    requiresSecondaryInvestmentLater: true,
    compatibilityNote:
      "Future hybrid classes should unlock from an already committed primary school plus later cross-school investment, not from day-one split leveling.",
  },
  schoolTracks: [
    {
      school: "bio",
      identity: "Verdant Coil",
      stickyByDefault: true,
      specializationLockThresholdId: "specialization-lock",
      futureHybridHookIds: ["bio-mecha-hybrid", "bio-pure-hybrid"],
    },
    {
      school: "mecha",
      identity: "Chrome Synod",
      stickyByDefault: true,
      specializationLockThresholdId: "specialization-lock",
      futureHybridHookIds: ["bio-mecha-hybrid", "mecha-pure-hybrid"],
    },
    {
      school: "pure",
      identity: "Ember Vault",
      stickyByDefault: true,
      specializationLockThresholdId: "specialization-lock",
      futureHybridHookIds: ["bio-pure-hybrid", "mecha-pure-hybrid"],
    },
  ],
};
