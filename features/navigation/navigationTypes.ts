export type RouteNodeId =
  | "home"
  | "bazaar"
  | "forge"
  | "arena"
  | "mecha-foundry"
  | "spirit-sanctum"
  | "gate";

export type RouteRequirement = {
  requiredRankLevel?: number;
  requiredRoutes?: RouteNodeId[];
};

export type RouteDefinition = {
  id: RouteNodeId;
  label: string;
  description: string;
  requirement?: RouteRequirement;
};

export type NavigationState = {
  currentRoute: RouteNodeId;
  availableRoutes: RouteNodeId[];
};