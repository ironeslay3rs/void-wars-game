import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/siteUrl";

const shortcutIcon: MetadataRoute.Manifest["icons"] = [
  {
    src: "/icons/pwa-icon.svg",
    sizes: "any",
    type: "image/svg+xml",
  },
];

/**
 * Web App Manifest — enables “Install app” / Add to Home Screen on supported mobile browsers.
 * Native store listings usually use Capacitor (or similar) wrapping this same web client.
 */
export default function manifest(): MetadataRoute.Manifest {
  const origin = getSiteUrl();

  return {
    id: `${origin}/`,
    name: "Void Wars: Oblivion",
    short_name: "Void Wars",
    description:
      "Survival-first RPG — deploy from the Black Market, hunt the Void, extract resources.",
    lang: "en",
    start_url: "/home",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    categories: ["games", "entertainment"],
    icons: [
      {
        src: "/icons/pwa-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/pwa-icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Command",
        short_name: "Home",
        description: "Command deck and deployment status.",
        url: "/home",
        icons: shortcutIcon,
      },
      {
        name: "Deploy",
        short_name: "Deploy",
        description: "Enter the Void from the staging lane.",
        url: "/deploy-into-void",
        icons: shortcutIcon,
      },
      {
        name: "Contracts",
        short_name: "Contracts",
        description: "Mission queue and contracts.",
        url: "/missions",
        icons: shortcutIcon,
      },
      {
        name: "Black Market",
        short_name: "Bazaar",
        description: "Districts, trade, and recovery.",
        url: "/bazaar/black-market",
        icons: shortcutIcon,
      },
    ],
  };
}
