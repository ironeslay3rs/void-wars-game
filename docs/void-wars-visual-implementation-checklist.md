# Void Wars Visual Implementation Checklist

## Role Summary

This checklist translates the production style guide into a practical, high-value alignment pass for the current game UI.

- Scope is limited to the existing repo state.
- The goal is alignment, not redesign.
- Priority is given to shared chrome, navigation, panel, and screen primitives that affect the most pages.
- Work should be staged so the game keeps shipping while visual consistency improves.

> Note: `docs/void-wars-production-style-guide.md` was not present in this checkout when this checklist was created. Until that file is restored here, treat this as a repo-grounded implementation checklist derived from the current shared visual system and the highest-impact UI surfaces.

## Exact Files

### Shared foundation
- `app/globals.css`
- `config/theme.ts`
- `components/shared/PanelFrame.tsx`
- `components/shared/SectionCard.tsx`
- `components/shared/ScreenHeader.tsx`
- `components/shared/PlaceholderPanel.tsx`
- `components/shared/MenuButton.tsx`
- `components/shared/StatChip.tsx`
- `components/shared/IconBadge.tsx`

### Global HUD and navigation
- `components/layout/GameHudShell.tsx`
- `components/layout/TopBar.tsx`
- `components/layout/LeftCommandMenu.tsx`
- `components/layout/ResourceBar.tsx`
- `components/layout/BottomNav.tsx`
- `components/layout/BazaarShell.tsx`
- `components/layout/BazaarTopHeader.tsx`

### Highest-value screen implementations
- `app/home/page.tsx`
- `app/status/page.tsx`
- `app/arena/page.tsx`
- `app/arena/match/page.tsx`
- `components/status/StatusHeroCard.tsx`
- `components/status/StatusResourcesCard.tsx`
- `components/status/StatusSystemsCard.tsx`
- `components/bazaar/BazaarMapCanvas.tsx`
- `components/bazaar/BazaarNode.tsx`
- `components/home/MainMenuLeftRail.tsx`
- `components/home/MainMenuCenterStage.tsx`
- `components/home/MainMenuRightRail.tsx`

## Top 10 Visual Alignment Targets

1. **Unify panel shells before touching individual screens**
   - Make `PanelFrame` and `SectionCard` the source of truth for border weight, corner radius, background opacity, inner highlights, and blur treatment.
   - Migrate one-off card treatments in Status, Arena, Home rails, and Bazaar nodes onto those shared primitives where possible.
   - Why first: this creates the biggest consistency gain with the lowest redesign risk.

2. **Standardize screen headers across non-home screens**
   - Lock eyebrow, title, subtitle spacing and text hierarchy to `ScreenHeader`.
   - Verify all major screens use the same width, top spacing, and tonal balance.
   - Remove ad hoc header styling that makes screens feel like different products.

3. **Consolidate button and nav states into a single interaction language**
   - Align `MenuButton`, `BottomNav`, and major action buttons like the recovery CTA so idle, hover, active, disabled, and “primary” states feel related.
   - Reuse the same highlight line, border contrast, glow strength, and uppercase rhythm.
   - Keep faction color as accent only, not as a separate button system per screen.

4. **Normalize progress bars and meters**
   - XP, condition, mastery, match health bars, and any capacity bars should share track height, radius, label placement, and gradient behavior.
   - Introduce a common meter pattern rather than each screen styling bars independently.
   - This is especially visible in `StatusHeroCard`, `ArenaConsoleCard`, `app/arena/match/page.tsx`, `ConditionWidget`, and inventory/status bars.

5. **Reduce typography drift in hero-scale UI**
   - Current screens mix several different uppercase tracking systems, label sizes, and heavy title scales.
   - Define practical tiers: micro label, panel label, section title, screen title, and hero title.
   - Apply those tiers first to `TopBar`, home rails, `ScreenHeader`, and status/arena cards.

6. **Bring Home, HUD, and screen interiors into the same chrome family**
   - The home experience uses strong bespoke rails and hero framing while screen interiors lean on simpler rectangular cards.
   - Keep the home identity, but pull over the same edge highlights, panel layering, and accent restraint so the user transition feels intentional.
   - Focus on `GameHudShell`, `TopBar`, `LeftCommandMenu`, and the home rail components.

7. **Tighten Bazaar node readability and chrome consistency**
   - Bazaar nodes currently read more like floating tags than destination cards.
   - Align node radius, border contrast, hover motion, label hierarchy, and internal spacing with the shared card system without redesigning the map layout.
   - Improve legibility first; keep the district color coding.

8. **Standardize status and data list rows**
   - Resource rows, system state pills, placeholder panels, and small stat chips all communicate structured data but currently use different spacing and contrast rules.
   - Create one consistent small-data language for rows, chips, and badges.
   - Prioritize `StatusResourcesCard`, `StatusSystemsCard`, `PlaceholderPanel`, `StatChip`, and `IconBadge`.

9. **Rationalize glow usage and visual intensity**
   - The repo uses many different shadow and glow values across home, arena, bazaar, and shared cards.
   - Limit glow to a few intentional levels: ambient shell glow, accent glow, and active-state glow.
   - This will make faction accents feel more premium and less noisy.

10. **Move page backgrounds toward a controlled system**
   - The app currently mixes page-specific radial gradients, HUD overlays, and map-specific atmosphere.
   - Preserve each screen’s mood, but align the depth stack: base background, vignette, scan/chrome layer, then panels.
   - Prioritize `GameHudShell`, `app/status/page.tsx`, and `app/arena/page.tsx`.

## What Already Fits

- The repo already has a strong dark sci-fi baseline with layered gradients, glass-like panels, and HUD framing.
- Shared chrome exists and is reusable: `PanelFrame`, `ScreenHeader`, `StatChip`, `IconBadge`, and the shell overlays provide a solid starting system.
- Faction accents are already established in `config/theme.ts` and several screen components.
- Navigation components already use uppercase labels, border-led states, and restrained motion that can be normalized instead of replaced.
- Home, Arena, and Bazaar all aim at the same broad fantasy: tactical, high-contrast, futuristic, and faction-driven.

## What Drifts

- Shared primitives are not yet the default; many major screens still use one-off card shells.
- Typography is expressive but inconsistent, especially between home hero areas and utility screens.
- Progress bars are visually fragmented across status, arena, combat, and inventory.
- Some small data surfaces use premium styling while others fall back to very plain rows.
- Accent colors are strong, but the amount of glow and border emphasis changes too much by feature.
- Bazaar nodes and some placeholder/info cards feel lighter and less “production” than the main HUD chrome.
- Recovery and utility actions do not yet feel like part of the same button system as navigation and primary CTAs.

## Best First Visual Refactor

**Refactor the shared surface system first, then pull Status and Arena onto it.**

Recommended order:
1. Expand `PanelFrame` so it can cover the visual roles now split across `SectionCard`, `PlaceholderPanel`, and several custom card wrappers.
2. Update `SectionCard` and `PlaceholderPanel` to consume the same surface language instead of maintaining their own shell rules.
3. Apply the unified surface system to:
   - `components/status/StatusHeroCard.tsx`
   - `components/status/StatusResourcesCard.tsx`
   - `components/status/StatusSystemsCard.tsx`
   - `app/arena/page.tsx`
4. In the same pass, standardize one shared meter style for XP, condition, mastery, and readiness bars.

Why this is the best first move:
- It touches the highest-traffic utility screens.
- It improves multiple pages without changing information architecture.
- It creates reusable primitives for every later visual cleanup.
- It is realistic for the current repo because the component structure is already partially shared.

## Final Result

If this checklist is followed in order, the game should land in a much cleaner visual state without a redesign:

- one consistent panel language
- one recognizable navigation/button language
- one reusable meter system
- tighter typography hierarchy
- more disciplined faction accents
- better continuity between Home, HUD screens, Arena, and Bazaar

That would give the current repo a more production-ready UI pass while staying faithful to the game’s existing structure and content.
