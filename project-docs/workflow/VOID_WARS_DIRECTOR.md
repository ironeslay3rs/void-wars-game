\# VOID WARS DIRECTOR



\## Project Identity

Void Wars: Oblivion is a survival-first, war-scarred dark RPG where players deploy from the Black Market into the Void, hunt in dangerous field maps, extract resources, and return stronger. The game must feel readable, costly, and world-driven.



\## Locked Canon

\- Void = 3D prison

\- Fusion = body + mind + soul

\- Bio = Verdant Coil

\- Mecha = Chrome Synod

\- Pure = Ember Vault

\- Black Market = neutral survivor citadel

\- Book 1 scope only



\## Current Phase

M1–M7 Full Implementation Track (Loop → Combat Texture → War Layer → Mythic Progression → Social Layer)



\## M1 Focus

\- playable field shell

\- movement

\- visible mobs

\- targeting

\- auto attack baseline

\- shell fallback

\- reward clarity

\- route clarity



\## M1–M7 Scope Policy (explicitly allowed)

\- Skill trees, guilds/clans, war-layer, and late-game progression are allowed **when they are implemented as milestone slices** (M1→M7) with bounded scope and validation.
\- Multiplayer / server-authoritative social is allowed only when explicitly scheduled (M7), and must still preserve loop stability and save integrity.
\- Economy work is allowed when it supports a milestone’s playable loop and has clear sinks/sources (avoid “broad redesign” without a migration plan).

\## M2 Focus

\- First Black Market depth slice: Crafting District utility (Moss Binder, Refinery Bay, Rune Crafter output)
\- Reinforce progression/crafting priority: survival buffers first, then stabilizing wards
\- Verify character portrait UI everywhere (hub/HUD consistency)
\- Keep scope bounded; preserve loop stability (no unrelated UX panels)

\## M2 (still a priority, not a restriction)

\- First Black Market depth slice: Crafting District utility (Moss Binder, Refinery Bay, Rune Crafter output)
\- Reinforce progression/crafting priority: survival buffers first, then stabilizing wards
\- Verify character portrait UI everywhere (hub/HUD consistency)
\- Keep scope bounded; preserve loop stability (no unrelated UX panels)



\## Current Active Milestone

Playable Void Field shell



\## Approved Build Order

1\. Movement

2\. Player presence

3\. Visible mobs

4\. Target selection

5\. Auto attack baseline

6\. Shell fallback

7\. Hit feedback

8\. Entity immersion polish

9\. Reward clarity

10\. Black Market expansion



\## Architecture Rules

\- app/ = thin route wrappers only

\- components/ = presentation and composition

\- features/ = logic, data, helpers

\- avoid god files

\- one approved task at a time

\- no unrelated edits

\- extend existing systems before inventing new ones



\## Asset Pipeline

\- /incoming = raw source only

\- never use /incoming directly in production

\- rename every asset clearly

\- move to /public/assets/...

\- split sheets when practical

\- register in lib/assets.ts



\## Worker Roles

\### Codex

Implements approved bounded tasks only. Must return exact files changed, validations, and full file contents.



\### Cursor

Applies local edits, testing, and repo-aware iteration. Does not decide roadmap.



\### ChatGPT

Acts as Lead Game Designer + Technical Director. Picks next task, challenges assumptions, reviews architecture, and prevents scope creep.



\## Required Task Return Format

1\. Role Summary

2\. Task Classification

3\. Exact Files Changed

4\. Scope Decision

5\. What Changed

6\. Validation

7\. Full Updated File Contents



\## Rejection Rules

Reject any task that:

\- expands scope beyond the active milestone

\- starts a new system before the current one is playable

\- touches unrelated files

\- introduces backend changes without approval

\- prioritizes polish over loop stability

