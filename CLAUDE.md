\# Void Wars: Oblivion — Claude Code Context



\## Project

Next.js web game. Live at void-wars-game.vercel.app.

Deploy workflow: git push → Vercel auto-redeploys.



\## Rules

\- Pages stay thin (app/ routes only)

\- Shared UI lives in components/shared

\- Logic lives in features/

\- Navigation is data-driven via homeMenuData.ts + bottomNavData.ts

\- No hardcoded route logic inside components

\- Always run `npx tsc --noEmit` before finishing



\## Architecture

\- features/void-maps/ → field loop, mobs, loot, boss spawn

\- features/game/ → gameTypes, gameActions, gameState, gameMissionUtils

\- features/navigation/ → nav data files

\- components/void-field/ → VoidFieldScreen, VoidFieldHud, etc

\- app/bazaar/ → market + crafting routes



\## Current resource keys

credits, scrapAlloy, emberCore, runeDust, bioSamples



\## Active loot system

\- ADD\_FIELD\_LOOT action banks resources + tracks per-run ledger

\- rollVoidFieldLoot.ts handles all drop logic

\- Zone loot themes: ash\_mecha | bio\_rot | void\_pure

\- Boss mobs: isBoss flag → upgraded drop rules



\## What's NOT done yet

\- Realtime mob loot parity (shell mobs done, server mobs not)

\- Mastery functional layer (rune depth, capacity costs, set detection)

\- Black Market buy/sell wiring

\- Phase 2 named materials

```



\---



\*\*Step 4 — First test prompt\*\*



Type this into the Claude Code panel to verify it can see your project:

```

Read the file features/void-maps/rollVoidFieldLoot.ts and summarize what it does

