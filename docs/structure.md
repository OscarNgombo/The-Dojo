# Project Structure & Route vs Feature Separation

This document explains the rationale and pattern for separating **route definition files** (TanStack Router) from **feature implementation components**.

## Goals

- Keep route files *minimal & declarative* (only responsibility: mapping URL -> lazy feature component + guards).
- Enable **code splitting**: large screens/components live under `src/features/**` and are lazy imported.
- Avoid TanStack Router dev warnings produced when route files export many unrelated symbols or contain heavy logic.
- Improve testability: feature components can be imported & rendered in isolation in tests without router scaffolding.
- Provide clearer ownership boundaries (routing vs UI/logic) to reduce coupling.

## Pattern

```
src/
  routes/
    admin/
      subjects/
        index.tsx          # Thin wrapper that lazy-loads SubjectsList
        $subjectId.tsx     # Thin wrapper that lazy-loads SubjectDetailPage
  features/
    subjects/
      SubjectsList.tsx     # Full list page implementation
      SubjectDetailPage.tsx# Full detail/edit implementation
      index.ts             # Barrel exports
```

### Route File Responsibilities
- Define the `createFileRoute` call.
- (Optional) Provide `validateSearch`, `beforeLoad` guards, role enforcement.
- Use `Suspense` + lightweight fallback UI (spinner) for lazy imports.
- Derive & pass only the minimal props (e.g. decoded / validated params & search state) into the feature component.

### Feature Component Responsibilities
- Fetch domain data (via providers/services/hooks).
- Contain UI layout, internal state (edit mode, forms, filters, etc.).
- Emit navigation intents (e.g. pushing search params like `mode=edit`).
- Reuse shared UI primitives from `components/ui`.

## Benefits Recap
- Faster cold loads via deferred feature bundles.
- Cleaner diffs when editing UI logic (route shell rarely changes).
- Consistent param + search validation pattern across entity pages.
- Reduced risk of accidental extra exports breaking router's file-based expectations.

## Conventions
- Barrel file (`features/<domain>/index.ts`) re-exports only stable page-level components needed by routes/tests.
- No business logic directly inside route files beyond guard & param/search extraction.
- Fallback spinners use consistent inline style (flex center, 80vh) for predictable UX.
- Search params used to initialize transient UI state (e.g. `mode=edit`) are validated in the route layer.

## Adding a New Feature Page
1. Create `features/<domain>/<Name>Page.tsx` with implementation.
2. Export it via `features/<domain>/index.ts`.
3. Add a thin route file under `routes/...` that lazy-imports it.
4. Add `validateSearch` / `beforeLoad` as needed (roles, defaults).
5. Write isolated tests importing the feature component directly.

## Example Minimal Route
```tsx
export const Route = createFileRoute('/admin/things/$thingId')({
  validateSearch: (search: Record<string, unknown>) => ({ mode: search.mode === 'edit' ? 'edit' : undefined }),
  component: () => {
    const { thingId } = Route.useParams();
    const { mode } = Route.useSearch();
    return (
      <Suspense fallback={<CenteredSpinner />}> 
        <ThingDetailPage thingIdParam={thingId} initialEdit={mode === 'edit'} />
      </Suspense>
    );
  }
});
```

Where `CenteredSpinner` is the small inline JSX used consistently today.

## Future Enhancements
- Add a shared `<CenteredPageSpinner />` component to remove inline style repetition.
- Provide a tiny utility for common `{ mode }` style search validation.
- Codify guard patterns (e.g. `withAdminGuard(routeConfig)`).

## Implemented Refinements (2025-09-22)
The following items from the Future Enhancements list have now been delivered:

- `<CenteredPageSpinner />` implemented at `components/ui/CenteredPageSpinner` and exported via the UI barrel. All updated detail routes use it as their Suspense fallback.
- `parseEditMode` + `isEditMode` helpers added at `utils/searchParams.ts` to centralize logic around `mode=edit` search parsing.
- Routes (`$subjectId.tsx`, `$userId.tsx`) refactored to use both the spinner and helper, reducing duplication and ensuring consistent validation.

Next candidate for abstraction: a guard composition helper once role-based route protection expands.

---
Maintained: 2025-09-22
