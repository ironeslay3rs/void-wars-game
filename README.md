# Void Wars Game

A Next.js prototype for a UI-first adaptation of **Void Wars**, focused on building the game shell, screen flows, and progression systems in a way that can later support the locked seven-book canon roadmap.

## Project Overview

This repository currently functions as a playable interface and systems prototype. It already includes:

- a multi-screen HUD and navigation shell
- player state, resources, and persistence scaffolding
- mission, inventory, status, faction, mastery, profession, guild, and bazaar-facing screens
- combat, exploration, and progression support systems that can be expanded into canon-aligned content

The repo should be treated as an implementation workspace, not a source of truth for lore. Canon sequencing belongs to the expansion planning document below.

## Expansion Planning

The repo-facing expansion roadmap is documented here:

- [`docs/expansion-roadmap.md`](docs/expansion-roadmap.md)

That document explicitly separates:

1. **Locked canon expansion order** — the seven-book canon spine the game must follow.
2. **Current repo implementation state** — what the codebase actually supports today.
3. **Recommended development order** — how to ship practical milestones without breaking canon order.

## Current Development Focus

Based on the current repository state, the strongest implemented foundation is:

- home / HUD presentation
- mission loop scaffolding
- progression and resource state
- world-navigation shells
- screen-specific data models for key districts and game systems

This makes the repo well suited for feature-hardening, content tagging, gating rules, and canon-safe expansion planning.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Scripts

- `npm run dev` — start the local development server
- `npm run lint` — run ESLint
- `npm run build` — create a production build
- `npm run start` — run the production server

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS

## Repo Notes

- `DEV_LOG.md` tracks the implementation-phase status of core gameplay systems.
- Lore canon is considered externally locked; missing manuscripts in the repo are **not** permission to redefine sequence or invent replacement canon.
- Gameplay code and system scaffolding should stay flexible enough to map content to the canon seven-book ladder as those materials are integrated.
