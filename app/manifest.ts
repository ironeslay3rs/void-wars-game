import type { MetadataRoute } from "next";

/**
 * Web App Manifest — enables “Install app” / Add to Home Screen on supported mobile browsers.
 * Native store listings usually use Capacitor (or similar) wrapping this same web client.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Void Wars: Oblivion",
    short_name: "Void Wars",
    description:
      "Survival-first RPG — deploy from the Black Market, hunt the Void, extract resources.",
    start_url: "/home",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
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
  };
}
