import { ROUTE_DEFINITIONS } from "@/features/navigation/navigationData";
import type {
  NavigationState,
  RouteDefinition,
  RouteNodeId,
} from "@/features/navigation/navigationTypes";

type RouteAccessInput = {
  route: RouteDefinition;
  rankLevel: number;
  unlockedRoutes: string[];
};

export function getRouteById(routeId: RouteNodeId) {
  return ROUTE_DEFINITIONS.find((route) => route.id === routeId);
}

export function canAccessRoute({
  route,
  rankLevel,
  unlockedRoutes,
}: RouteAccessInput) {
  const requirement = route.requirement;

  if (!requirement) return true;

  if (
    typeof requirement.requiredRankLevel === "number" &&
    rankLevel < requirement.requiredRankLevel
  ) {
    return false;
  }

  if (
    Array.isArray(requirement.requiredRoutes) &&
    requirement.requiredRoutes.some(
      (requiredRoute) => !unlockedRoutes.includes(requiredRoute)
    )
  ) {
    return false;
  }

  return true;
}

export function getAvailableRoutes(
  rankLevel: number,
  unlockedRoutes: string[]
): RouteNodeId[] {
  return ROUTE_DEFINITIONS.filter((route) =>
    canAccessRoute({ route, rankLevel, unlockedRoutes })
  ).map((route) => route.id);
}

export function buildNavigationState(
  rankLevel: number,
  unlockedRoutes: string[],
  currentRoute: RouteNodeId
): NavigationState {
  const availableRoutes = getAvailableRoutes(rankLevel, unlockedRoutes);

  return {
    currentRoute: availableRoutes.includes(currentRoute) ? currentRoute : "home",
    availableRoutes,
  };
}