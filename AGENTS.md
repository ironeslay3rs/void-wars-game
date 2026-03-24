# AGENTS.md

## Scope
These instructions apply to the entire repository.

## Canon-first workflow
Future Codex tasks must treat the following docs as required inputs before making narrative, faction, UI-theme, worldbuilding, progression-copy, or Black Market changes:

- `docs/game-canon-registry.md`
- `docs/black-market-law.md`
- `docs/expansion-roadmap.md`
- `docs/faction-visual-law.md`

## Required behavior
- Treat every section explicitly labeled `Locked Canon` or `Locked Canon Anchors` as non-negotiable unless the user explicitly changes canon.
- Separate locked canon from flexible implementation details in any proposal, spec, task output, or code/content change.
- Do not invent new lore, nations, sins, macro schools, cosmology, or character backstory unless the user explicitly supplies it.
- Do not redesign the game when working from these docs; prefer tight, incremental changes that support the current direction.
- Prefer documentation and canon infrastructure before proposing large gameplay or system changes.
- If existing repo content appears to conflict with canon docs, flag the conflict and keep scope tight unless the user asks for a broader rewrite.

## Delivery rules
- For canon-affecting tasks, cite the relevant docs in the final response.
- Keep repo-facing documentation concise, practical, and implementation-safe.
- Do not change gameplay code for documentation-only canon tasks unless the user explicitly asks.
