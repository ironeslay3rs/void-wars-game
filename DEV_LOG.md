# Void Wars: Oblivion — Dev Log

## Phase 1 — Foundation (DONE)
- Global Game State (GameContext)
- Player system (resources, rank, condition)
- UI shell (HUD, panels, bars)
- Persistence (localStorage)
- Condition + Resource system

## Phase 2 — Core Loop (IN PROGRESS)
- Mission Queue System ✅
- Mission Timer (async) ✅
- Queue persistence ✅
- Claim rewards system ✅

### Notes
- Game loop handled in GameContext
- UI does NOT control logic
- MissionPanel is display-only
- Mission rewards are applied on claim, not auto-completion

## Next Steps
- Navigation system (routes + unlocks)
- Mission rewards breakdown UI
- Progression system (rank scaling)