export const HOME_RESOURCE_STRIP_BOTTOM = "calc(5rem + env(safe-area-inset-bottom))";
export const HOME_LEFT_MENU_BOTTOM_CLEARANCE = "calc(8.5rem + env(safe-area-inset-bottom))";
export const HOME_BOTTOM_NAV_BOTTOM = "calc(0.75rem + env(safe-area-inset-bottom))";
export const HOME_CENTER_STAGE_BOTTOM_CLEARANCE = HOME_LEFT_MENU_BOTTOM_CLEARANCE;
export const HOME_MOBILE_PANEL_BOTTOM_CLEARANCE = "calc(6.5rem + env(safe-area-inset-bottom))";
/** Below `TopBar` (h-20 + pt-3) + notch — mobile scroll panel top inset */
export const HOME_MOBILE_SCROLL_TOP = "calc(5.75rem + env(safe-area-inset-top, 0px))";

/** When vitals-critical strip is shown under TopBar, scroll content clears the extra band */
export const HOME_MOBILE_SCROLL_TOP_CRITICAL = "calc(9rem + env(safe-area-inset-top, 0px))";
