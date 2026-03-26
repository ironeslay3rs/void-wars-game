import { VOID_EXPEDITION_PATH } from "@/features/void-maps/voidRoutes";

export const bazaarRouteMap = {
  "biotech-labs": "/bazaar/biotech-labs",
  "spirit-enclave": "/bazaar/spirit-enclave",
  "crafting-district": "/bazaar/crafting-district",
  arena: "/bazaar/arena",
  "mecha-foundry": "/bazaar/mecha-foundry",
  "mercenary-guild": "/bazaar/mercenary-guild",
  "void-expedition": VOID_EXPEDITION_PATH,
  "faction-hqs": "/bazaar/faction-hqs",
  "teleport-gate": "/bazaar/teleport-gate",
  "void-market": "/bazaar/void-market",
  "black-market": "/bazaar/black-market",
} as const;