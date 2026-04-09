# Design fusion pillars

## Purpose and audience

This document is an **internal development reference** for how Void Wars: Oblivion combines structural design goals (growth clarity, run pressure, territorial conflict, crafting depth, book-grounded lore). It informs tradeoffs and sequencing; it is **not** player-facing copy.

**Scope alignment:** Book 1 and M1 priorities — readable vertical slice, survival-first tone, no scope explosion.

---

## Canon and lore boundaries

- **Locked truths and tone** live in [`../canon/LOCKED_CANON.md`](../canon/LOCKED_CANON.md). Do not contradict them in systems or UI.
- **Book 1 boundaries** are summarized in [`../canon/BOOK1_SCOPE.md`](../canon/BOOK1_SCOPE.md).
- **Narrative and faction language** must follow project canon sources (books + canon docs + `docs/` registry where applicable). This file describes **game structure and feel**, not new lore. Do not invent factions, cosmology, nations, or backstory here.

---

## Pillar mapping (mechanical meaning)

These pillars translate “fusion” goals into **implementation language**. External games may inspire *structure*; Void Wars remains canon- and M1-bound.

| Pillar | What it means for Oblivion | Notes |
|--------|----------------------------|--------|
| **Long-arc growth structure** | Layered progression (rank, mastery, influence, valued sinks, unlock cadence) with a clear **next lever** — players should see what advances them without opaque grind. | Incremental unlocks beat sprawling parallel systems in M1. |
| **Clarity-first flow** | Every session answers: what happened, what changed, what do I do next — see [`CORE_LOOP.md`](./CORE_LOOP.md). AFK/shell resolution remains **source of truth**; realtime is a **bonus layer**, not a competing truth. | Aligns with existing clarity and AFK rules. |
| **Run pressure** | Deployments have consequences: preparation, strain, condition, hunger, carry pressure, recovery costs. Pressure should be **readable** (costly, war-scarred) rather than obscure or purely punitive. | Deepen feedback and clarity before adding new meters. |
| **Territory / war meta** | Long-horizon conflict: contested lanes, faction pressure, war-front visibility, guild-adjacent hooks — **scoped** to Book 1. | Not a full grand-strategy layer in M1; tie to documented war-front / guild direction in [`../workflow/VOID_WARS_DIRECTOR.md`](../workflow/VOID_WARS_DIRECTOR.md). |
| **Crafting emphasis** | Crafting and prep (recipes, work orders, stall pressure) are a **core preparation loop**, not a side minigame. “Deep” means **utility, cost visibility, and readable outcomes** — not an economy explosion in M1. | Extend existing crafting paths before inventing parallel economies. |
| **Book lore** | Story, factions, and proper nouns flow from **Void Wars books** and project canon docs — single source of truth. | Implementation details may flex; locked canon may not. |

---

## M1 vs later

**M1 must prove**

- A **playable loop**: prep → deploy → hunt/extract → recover → repeat (with crafting in the chain as in Book 1 scope).
- **State clarity**: vitals, carry, strain, and outcomes visible and understandable.
- **Stability** of client state, hydration, and reducer behavior for the slice you ship.

**Defer unless explicitly prioritized** (consistent with [`../workflow/VOID_WARS_TASK_QUEUE.md`](../workflow/VOID_WARS_TASK_QUEUE.md) and M1 avoidance lists)

- Large new systems, broad economy expansion, crafting redesigns driven by feature creep.
- Narrative-heavy implementation that does not serve the loop.
- Multi-loop expansion, premature live-service complexity, broad world expansion.
- Server-authoritative parity for every subsystem before the slice is understandable (realtime parity where promised remains a targeted follow-up).

---

## Related docs

- [`CORE_LOOP.md`](./CORE_LOOP.md) — main loop, AFK rule, clarity rule.
- [`M1_RULES.md`](./M1_RULES.md) — M1 focus and build priority.
- [`../workflow/VOID_WARS_DIRECTOR.md`](../workflow/VOID_WARS_DIRECTOR.md) — project identity, phase notes, live audit pointers.
- [`../workflow/VOID_WARS_TASK_QUEUE.md`](../workflow/VOID_WARS_TASK_QUEUE.md) — current task and suggested slices.
