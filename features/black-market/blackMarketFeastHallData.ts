export const FEAST_HALL_SERVICE_CREDITS_COST = 18;
export const FEAST_HALL_SERVICE_BIO_SAMPLE_COST = 2;
export const FEAST_HALL_SERVICE_CONDITION_GAIN = 30;

export const blackMarketFeastHallData = {
  eyebrow: "Black Market / Gluttony Lane",
  title: "Feast Hall",
  subtitle:
    "The first real Black Market lane: a neutral survivor kitchen where hunted matter, sacred deals, and frontline readiness are converted into another push into the Void.",
  law: "Deals are sacred; betrayal costs more than death.",
  serviceName: "Frontline Communion Bowl",
  serviceDescription:
    "The Feast Hall reduces viable biomass into trench-safe provisions. Pay in credits, surrender samples, and leave able to endure one more expedition.",
  effectLabel: `+${FEAST_HALL_SERVICE_CONDITION_GAIN} Condition`,
} as const;
