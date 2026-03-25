# Mastery Framework Scaffold

## Purpose
Define a small, canon-safe mastery framework for Bio, Mecha, and Pure without implementing the full system yet.

This document exists to keep future mastery work specialization-first, sticky by default, and cleanly expandable into later hybrid unlocks.

## Locked Canon

### Canon facts
- The only player-facing macro schools are Bio, Mecha, and Pure.
- Bio maps to Verdant Coil.
- Mecha maps to Chrome Synod.
- Pure maps to Ember Vault.
- The final path is Fusion: body + mind + soul.

### Canon-safe design rule
- School mastery should feel costly and meaningful.
- Early specialization should matter more than casual swapping.

## Flexible Implementation

### 1. Canonical rule for school mastery permanence
- School mastery investment is sticky and permanent by default.
- Players may preview or begin a school path early, but crossing the first specialization lock should make that commitment the baseline identity.
- This is an implementation rule that supports canon tone and project direction; it does not invent new lore.

### 2. Clean M1-safe implementation shape
- Keep M1 at a scaffolding level only.
- Treat mastery as a specialization framework with:
  - one primary school rail
  - threshold ids for future lock checks
  - reserved hooks for a limited respec window
  - reserved hooks for later hybrid eligibility
- Do not build trees, node logic, or class effects yet.
- Do not expand reducers or persistence yet unless active gameplay work later requires it.

### 3. Future respec window hook
- The respec hook should sit before the first hard specialization lock.
- Recommended future rule:
  - allow removal or reassignment only during an early pre-lock phase
  - close that window once the specialization lock threshold is crossed
- This preserves meaningful commitment while still allowing a limited early correction window.

### 4. Future hybrid unlock rule
- Hybrid classes should unlock later from a committed primary school, not from equal split investment at the start.
- Recommended future order:
  - commit to one primary school first
  - cross the specialization lock
  - add later cross-school investment or milestone requirements
  - unlock hybrid eligibility only after specialization identity is already established
- This protects the specialization-first design and avoids breaking early mastery clarity.

## Repo Shape

### Data scaffold
- `features/mastery/masteryFramework.ts`
  - school ids
  - threshold ids
  - respec hook metadata
  - future hybrid hook metadata

### UI-safe usage now
- `features/mastery/masteryScreenData.ts`
  - can surface the framework as read-only guidance
  - should not imply full gameplay implementation

## Not Included
- No hybrid gameplay implementation.
- No class tree or node system.
- No mastery reset economy.
- No reducer or persistence expansion.
- No UI redesign.

## Implementation Notes
- Keep all threshold tuning abstract until gameplay implementation begins.
- Prefer symbolic threshold ids now over hard-coded numbers.
- When implementation starts, wire the first lock check into mastery progression state before adding any respec action.
