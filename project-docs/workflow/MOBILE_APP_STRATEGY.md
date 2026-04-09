# Mobile (phones): app strategy

The game is a **Next.js web client**. Getting it onto cellphones has three practical layers — do them in order.

## Layer 1 — Mobile web + installable PWA (in repo now)

**Goal:** Players on Chrome (Android) and Safari (iOS) get a **full-screen, home-screen icon** experience without an app store.

**Shipped in code:**

- `app/manifest.ts` — Web App Manifest (`display: standalone`, `start_url: /home`, theme colors, stable `id`, `categories`, **shortcuts** to Command / Deploy / Contracts / Black Market).
- `public/icons/pwa-icon.svg` — maskable-friendly vector icon for the manifest.
- `app/apple-icon.tsx` — PNG **apple-touch-icon** for iOS “Add to Home Screen”.
- `app/icon.tsx` — favicon for browser tabs (matches tile styling).
- `app/opengraph-image.tsx` + `app/twitter-image.tsx` — **link preview** cards (shares, Discord, etc.); `metadataBase` + Open Graph / Twitter metadata in `app/layout.tsx`.
- `lib/siteUrl.ts` — canonical origin (`NEXT_PUBLIC_SITE_URL` or `VERCEL_URL` fallback) for absolute metadata.
- `app/layout.tsx` — `appleWebApp`, `themeColor`, `formatDetection` (no auto tel links).

**Implemented layout pass (March 2026 — narrow phones ~390px):**

- Home: scroll panel top follows **`TopBar` + `safe-area-inset-top`**; bottom nav / resource strip respect horizontal safe inset; quick links **`min-h-[44px]`**.
- Bottom nav: tighter `gap` + truncated labels; **≥44px** hit height retained.
- Top bar / `IconBadge`: **44×44 min** on small screens (compact again from `sm` up).
- Void field: HUD top padding uses **safe-area**; combat ticker bottom clears control bar + **safe-area-inset-bottom**; placeholder skill chips hide **below 480px**; extraction chip clears notch.

**You still must verify on real devices:**

- Every **primary screen** (Home, void field, bazaar) feels good at **390×844** and **360×780**.
- **Touch targets** and bottom nav vs **home indicator** (see `globals.css` + `config/layout.ts`).
- **Realtime:** production must use **`wss://`** (`NEXT_PUBLIC_VOID_WS_URL`); mixed content is blocked on mobile HTTPS.
- **Auth:** Supabase session cookies behave as expected in standalone / Safari WebView (smoke test on real devices).

**Test install:**

- **Android Chrome:** menu → “Install app” or “Add to Home screen”.
- **iOS Safari:** Share → “Add to Home Screen”.

---

## Layer 2 — “Store apps” with Capacitor (no rewrite)

**Goal:** **Google Play** and **Apple App Store** listings using a thin **native shell** that loads the **same** deployed site.

**Pattern:** Capacitor `server.url` points at your **production HTTPS origin** (e.g. Vercel). The shell is ~WebView “browser app”; updates ship when you deploy the web app.

**Outline (when you are ready):**

1. `npm create @capacitor/cli@latest` in a sibling folder or subfolder; add iOS + Android platforms.
2. Set `capacitor.config.ts` `server.url` to production (and optional `androidScheme` / cleartext rules — avoid HTTP).
3. Configure **App Store / Play** icons, splash, privacy labels (webView collects same data as site).
4. Pass Valve / Apple review: disclose “uses web content”, data collection, account login.

**Caveats:**

- Apple may scrutinize “thin WebView wrappers”; ensure **substantive** game value + compliant sign-in.
- Deep links / universal links optional later.

---

## Layer 3 — Optional: true offline / push (later)

- **Service worker** (e.g. Serwist / `next-pwa` patterns) for offline **shell** or asset cache — non-trivial with App Router; plan only when M1 loop is stable online-first.
- **Push notifications** — requires service worker + server; defer until product needs them.

---

## Relation to Steam / desktop

Steam and “phone app” share the **same web build**; store pages differ (Steamworks vs Play Console vs App Store Connect). Keep **one production URL** as source of truth.

## References

- `README.md` — env, health, WS.
- `STEAM_RELEASE_READINESS.md` — ops and smoke checks (also apply before mobile store submission).
- `VOID_WARS_DIRECTOR.md` — mobile / z-index audit notes.
