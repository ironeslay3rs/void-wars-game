# QA — Convergence, Knight valor, redemptions

Use this to verify **`REDEEM_RUNE_KNIGHT_VALOR`** and arena valor in a real save.

## Prerequisites (Mythic ladder, top to bottom)

1. **L3 Rare Rune set** — rank **4+**, rune depth **4+**, **1× Ironheart**, **30 Rune Dust** → *Unlock* on **Career → Mythic ladder** (Mastery screen).
2. **Rune Crafter license** — after L3: rank **5+**, **2× Ironheart** → *Earn license*.
3. **File convergence** — **two** schools at rune depth **3+**, rank **5+**, Crafter license → *File convergence*.

Until step 3 is done, **valor does not accrue** from arena SR wins (`APPLY_ARENA_RANKED_SR_DELTA` checks `convergencePrimed`).

## Earn valor (arena)

1. Open **Arena** and start a match in **`?mode=ranked`** or **`?mode=tournament`** (not **practice** — practice does not apply ranked SR / valor).
2. **Win** the fight. On victory you should see a log line like `Season SR +…`.
3. **Career → Mythic ladder**: **Rune Knight valor** should increase by **+1** per SR **gain** while already converged (cap **99**).
4. **Losses** change SR but **do not** add valor (`delta` must be **> 0**).

**Edge cases**

- If SR is already at the **clamp** (`2800`) and a win would not change displayed SR, the reducer may no-op — valor might not tick that fight.
- Keep **condition** high enough to enter ranked where a gate applies (see arena hub).

## Spend valor

### On the ladder (no credits)

With convergence filed, on **Career → Mythic ladder**:

- **Mastery boon** — **5** valor → **+12** mastery progress.
- **Influence seal** — **3** valor → **+2** influence.

### Ivory Tower (valor + credits)

**Black Market → Ivory Tower**:

- **Knight prestige rite** — **4** valor + **120** credits → **+15** condition (capped at 100).
- Card only appears when **convergence is filed**; otherwise you see a short gate message.

## Automated checks

- `npm test` — includes `runeKnightValorRedemption.test.ts` (redemptions + gates).

## Code references

- Valor accrual: `gameActions.ts` → `APPLY_ARENA_RANKED_SR_DELTA`
- Arena modes: `features/arena/arenaMatchModes.ts` → `arenaModeAppliesRankedStakes`
- Convergence gate: `mythicAscensionLogic.ts` → `canPrimeConvergence`
