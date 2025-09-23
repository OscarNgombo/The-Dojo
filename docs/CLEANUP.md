# Circular Import Cleanup (September 2025)

## Problem
Vite/Rollup build warnings:
> Export "useAuth" of module "src/providers/AuthProvider.tsx" was reexported through module "src/providers/index.ts" while both modules are dependencies of each other and will end up in different chunks by current Rollup settings. This scenario is not well supported at the moment as it will produce a circular dependency between chunks and will likely lead to broken execution order.

## Solution
- All route files now import `useAuth` directly from `AuthProvider` (e.g. `import { useAuth } from '../providers/AuthProvider'`), not from the barrel `providers/index.ts`.
- This eliminates the circular chunk warning and risk of broken execution order.
- Barrel export for `useAuth` is retained for non-route usage (can be removed later if desired).

## Verification
- Build now completes with no circular chunk warnings.
- No functional changes to authentication logic or provider composition.

## Recommendation
- For all future imports of hooks/providers, prefer direct import from the source file unless a barrel is strictly needed for composition.
- Remove barrel re-export of `useAuth` if not used elsewhere.

_Last updated: 2025-09-23_

---

## UI / Accessibility Improvements (RowActions Dropdown)

Date: 2025-09-23

### Changes
- Reworked `RowActions` trigger button to use a neutral base color (secondary) to reduce visual noise and reserve primary color for intent.
- Added accessible focus rings (WCAG 2.1 AA visible focus requirement) to trigger and menu items.
- Introduced divider before first destructive (`danger`) action to separate neutral vs destructive groups.
- Darkened default icon/trigger color and only elevate to primary on hover/focus for clearer contrast hierarchy.
- Added `aria-expanded` and improved `aria-label` semantics for the trigger for better screen reader context.
- Added keyboard focus outline (box-shadow) and kept existing full arrow key navigation (Home/End, Up/Down, Escape) for menu.

### Rationale
- Neutral trigger prevents overuse of brand/primary color and improves scanability.
- Divider increases affordance and reduces accidental destructive action clicks.
- Focus ring ensures accessibility for keyboard and low-vision users.
- Explicit aria attributes improve SR narration of menu state.

### Follow Up (Optional)
- Consider adding subtle motion reduction via `prefers-reduced-motion` media query for fade/scale animation.
- Unify future menus (context/dropdowns) under a shared primitive to avoid duplication.

