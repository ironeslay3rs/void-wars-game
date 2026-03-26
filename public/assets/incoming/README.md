# Incoming (raw source only)

Drop new art here as **temporary raw input**. Shorthand: **`/incoming`** means this folder (`public/assets/incoming/`).

**Do not** link this folder from game code. Promote assets using **AGENTS.md** → *Incoming / asset ingestion*:

1. Classify (map, field map, icon pack, skill sheet, UI sheet, background, etc.).
2. Rename (lowercase, hyphen-separated, descriptive).
3. Copy into the correct production tree, for example:
   - `public/assets/maps/`, `public/assets/maps/void-fields/`
   - `public/assets/icons/`, `public/assets/icons/skills/`, `public/assets/icons/items/`
   - `public/assets/backgrounds/`, `public/assets/ui/`, `public/assets/factions/`, `public/assets/creatures/`, `public/assets/bosses/`
4. Split sprite sheets or packs when each element is **clearly separable**; if unclear, copy one **renamed full sheet** and note it for **manual** slicing.
5. Register in `lib/assets.ts`.
6. Use **only** the registered path/key in the app.

Legacy raw drops may still live in `_incoming/`; same rules apply.
