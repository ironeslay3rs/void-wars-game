---
name: review-project
description: "Use when you want a focused codebase review workflow: identify technical debt, suggest improvements, and propose next steps for the game project. Trigger with: review my work, audit my project, code quality, architecture review."
# optional scope; no applyTo means workspace-wide availability
# applyTo: "**/*"
---

## Objective

- Analyze the repo structure, code patterns, and key gameplay systems.
- Provide actionable feedback for code quality, architecture, docs, and M1 priorities.
- Suggest concrete files to change and follow-up tasks.

## Workflow

1. Identify the main technologies and architectural layers.
2. Run lightweight source discovery (open files like `AGENTS.md`, `app/page.tsx`, `features/game/*`).
3. Check for health signals:
   - TypeScript errors (`npx tsc --noEmit`)
   - lint issues (`npx eslint .`)
   - test coverage or missing tests
4. Summarize strengths and risks.
5. Recommend improvements in:
   - canon naming and language safety (Bio/Mecha/Pure, no Spirit unless required)
   - modularization (route / feature boundaries)
   - performance (lazy loading, client/server boundaries)
   - UX clarity (M1 priorities: loop readability, state clarity)
   - docs and team handoff (AGENTS.md, doc links)

## Response format

- short summary
- positives
- isolates
- action items
- quick wins (<= 1 hour) and medium/long tasks

## Tool Guidance

- Prefer repository tools and workspace files over web searches.
- Avoid speculative features or large system rewrites unless explicitly asked.
- Keep feedback minimal and high-impact (M1 scope).
