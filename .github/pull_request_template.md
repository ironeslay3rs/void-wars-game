## Summary

<!-- 1-3 bullets describing what changed and why. -->

-

## Canon anchor (if applicable)

<!-- Which lore-canon/ note this slice is grounded in. Skip for pure tooling/infra. -->

-

## Loop / status impact

<!-- Which GSD.md loop row this touches, and whether it changes a status (🔴→🟡, 🟡→🟢). Skip if no loop impact. -->

-

## Verification

- [ ] `npx tsc --noEmit` clean
- [ ] `npm test -- --run` all green
- [ ] Dev smoke: booted the affected screen and exercised the primary action
- [ ] Vercel preview URL opened and visually confirmed
- [ ] No new save-state fields without hydration compat (or migration filed)

## Risk / rollback

<!-- What breaks if this is wrong? How do we revert? One line is fine. -->

-

🤖 Generated with [Claude Code](https://claude.com/claude-code)
