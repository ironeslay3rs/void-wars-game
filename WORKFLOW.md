# Workflow — Void Wars: Oblivion

Operational guide for shipping safely. Pairs with `CLAUDE.md` (project rules),
`GSD.md` (loop audit + session log), and `AGENTS.md` (agent conventions).

---

## One-time local setup

```bash
# Enable the shared pre-commit + pre-push hooks (tsc + tests).
git config core.hooksPath .githooks
```

That's it. Hooks live in `.githooks/` and are version-controlled, so every
contributor + agent runs the same gate.

Skip a hook only when truly needed (WIP checkpoint, emergency hotfix):

```bash
git commit --no-verify ...
git push --no-verify ...
```

---

## Daily loop

### 1. Branch per slice

Never commit directly to `main`. Branch naming:

- `feat/<slice-name>` — new functionality or canon slice
- `fix/<area>` — bug or regression fix
- `chore/<area>` — infra, docs, tooling, tests-only
- `canon/<topic>` — lore-canon migration or canon-grounded rewire

### 2. Implement

- Keep pages thin (`app/` routes mount screen components in `components/`)
- Logic lives in `features/<domain>/`
- Reuse `gameReducer` actions — no parallel state machines
- Canon slices: quote the lore-canon path + excerpt in a comment next to
  the constant or type. Future-you will thank you.

### 3. Verify locally

```bash
npm run verify     # tsc + vitest
```

The pre-commit hook runs this automatically. Running it manually before
committing catches issues faster.

### 4. Open a PR

- `.github/pull_request_template.md` auto-populates — fill it in.
- Vercel creates a preview URL per PR. **Smoke-test on the preview** before
  merging, not after.
- CI (`.github/workflows/ci.yml`) runs: typecheck + lint + tests + build.

### 5. Merge

- Squash-merge to keep `main` linear.
- Update `GSD.md` §1 status cells if the PR changes a loop status
  (🔴→🟡→🟢) or adds a new loop row.
- Append a short dated session-log entry to `GSD.md` for notable shapes.

### 6. Deploy

- Vercel auto-deploys `main`. No manual step.
- Watch the deploy log if the PR touched realtime/server code.

---

## Memory (auto-memory system)

At session end, update memory in
`C:\Users\irone\.claude\projects\c--Users-irone-void-wars-game\memory\`
with anything **non-derivable from code or git**:

- New user preferences or explicit feedback
- Project decisions with a *why* (deadline, stakeholder, canon constraint)
- Pointers to external systems (Obsidian vaults, dashboards, tracker)

Don't save:
- Code patterns or file paths (derivable)
- Git history or status snapshots (fresher in git)
- Debugging recipes (fresher in code + commits)

---

## Agent lanes

Two parallel lanes of automated work can exist:

1. **Claude Code** (this tool) — interactive, main repo checkout.
2. **Codex passes** — scripted prompt runs, operates in
   `.claude/worktrees/<branch>/`. Each worktree is a full checkout on its
   own branch; it does *not* share working tree state with `main`.

**Coordination rule:** check `git worktree list` before large refactors to
confirm no parallel lane is touching the same files. If both lanes need
to edit the same system, sequence them — don't race.

---

## When to bypass the workflow

- **Truly trivial** single-file doc edits on main: allowed, but still run
  the pre-commit hook.
- **Canon-docs-only** changes in `lore-canon/`: allowed direct to main
  since the vault is gitignored anyway (no code impact).
- **Emergency hotfix on live prod bug**: branch → PR → merge is still the
  path. `--no-verify` only if the hook itself is broken; otherwise fix
  the cause.

---

## Why this shape

- **No direct-to-main** prevents a bad push from breaking the live Vercel
  deploy with no review gate.
- **Pre-commit hook** catches tsc/test failures in seconds, not after push.
- **PR template** enforces "canon anchor + GSD impact + verification" as
  non-optional fields — the project's value comes from canon grounding.
- **Vercel preview per PR** is the single biggest win: tests pass ≠ the
  game runs. Manual smoke on a real deploy catches mount-point bugs.
- **Worktree awareness** prevents silent merge conflicts between Claude
  Code and Codex pass lanes.
