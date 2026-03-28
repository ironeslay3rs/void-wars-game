# Official Launch Fusion Plan (Book-Core + Current Game + AFK/Cultivation Patterns)

## Goal
Ship a player-ready public build that keeps Book 1 canon intact while delivering a readable fusion loop:
**prepare in Black Market -> queue/deploy contracts -> settle costs/rewards -> recover/upgrade -> redeploy**.

## Doctrine Reference
- Authoritative merge doctrine: `03-Docs/game-direction/fusion-doctrine.md`

## Locked Canon (non-negotiable)
- Void is a 3D prison.
- Black Market is a neutral survivor citadel.
- Bio / Mecha / Pure are the macro paths.
- Progression must feel costly and survival-first.

## Launch Pillars
1. **Clarity first:** players always know what changed and what to do next.
2. **Pressure first:** condition/hunger/cadence visibly shape outcomes.
3. **Fusion first:** cultivation + AFK cadence + doctrine influence outcomes, not just copy.
4. **Canon first:** no naming drift from Bio / Mecha / Pure and Black Market law.

## Implementation Slices

### Slice A — Home command deck as operational hub
- Keep right rail as launch control: condition, fusion read, and concrete next directives.
- Show live modulation read for expected contract impact.
- Keep action wording diegetic and pressure-aware.

### Slice B — Contract settlement explainability
- Show fusion cadence + pressure read on hunt settlement surfaces.
- Keep progression table readable and consistent with applied state changes.
- Preserve settlement telemetry in saved state to avoid confusion after reload.

### Slice C — Public launch hardening gates
- Type safety clean (`tsc --noEmit`).
- Lint clean on edited surfaces.
- Diff hygiene clean (`git diff --check`).
- No external-game naming in player-facing copy.

## Release Readiness Checklist
- [ ] New player can identify first action from Home in < 10 seconds.
- [ ] Returning player can understand latest settlement changes in one screen.
- [ ] Contract chain pressure is visible before queuing/deploying.
- [ ] No canon-breaking naming in launch-facing text.
- [ ] Core home + missions + hunt-result flow works without dead-end routes.

## This Merge (implemented now)
- Queue-aware fusion settlement math (per-entry queue pressure).
- Live home readout of current fusion modulation.
- Launch directive panel with top-priority actions (stabilize/queue/claim/deploy).

## Official Launch Doctrine (operational)
- Compute a loop-readiness score from live condition, hunger, queue pressure, and idle drift.
- Expose readiness status on Home as the primary "is this account safe to push?" signal.
- Keep directives and readiness coupled so each warning has an immediate action path.
- Enforce a doctrine queue cap (critical = 1 slot, at-risk = 2 slots, stable/ready = normal cap) to prevent unreadable over-queuing during unstable states.

## Next launch-critical implementation slices
1. Doctrine messaging parity on all queue-entry screens (Missions + Hunting Ground + Expedition entry points).
2. Settlement deltas panel that quantifies why a payout changed (fusion, hunger, realtime, doctrine) in one compact breakdown.
