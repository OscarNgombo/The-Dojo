# Project Review: The Dojo (Feature Branch: feature-users)

Date: 2025-09-20

## Overview
This review assesses alignment with the provided architectural & development instructions for the Training Management Platform. It highlights compliance, gaps, and recommended additions to the instructions and codebase.

## Stack & Configuration
- React 19 + TypeScript: ✅ In place.
- TanStack Router: ✅ Used with file-based routing.
- State management: ✅ Context Providers (App/Auth/Users/Toast). No Redux/Zustand/etc.
- Styling: ✅ CSS Modules + inline styles. (Tailwind dependency is present but NOT used in inspected components; this conflicts with instruction prohibiting external styling frameworks. Recommend removing or documenting exception.)
- Strict TS: ✅ `strict: true` plus additional compiler flags.
- Native Fetch: ✅ Used via `apiService` wrapper.

## Dependency Compliance
| Category | Status | Notes |
|----------|--------|-------|
| UI Libraries | ✅ | None used (custom components). |
| State Libraries | ✅ | Pure Context usage. |
| Utility Libraries | ✅ | No lodash/moment/date-fns. |
| Styling Frameworks | ⚠️ | Tailwind listed as dependency but not applied; clarify or remove. |

## Architecture & Providers
| Provider | Purpose | Observations |
|----------|---------|-------------|
| AppProvider | App-level loading/error + Google auth init | Lean, clear, no overreach. |
| AuthProvider | Auth state, login flows, Google mock flow | Some `any` in router context updates; could introduce a typed RouterContext interface. |
| UsersProvider | User list CRUD, pagination state | Fetch options recently extended to include `id` sorting. Consider exposing a `refresh()` method. |
| ToastProvider | Toast queue management | Lacks max queue length & accessible live region container (could add `role="status" aria-live="polite"`). |

## API Layer
- Centralized in `api/base.ts`; wraps fetch with JSON parse & error normalization.
- `getToken()` currently substitutes a static admin bearer token when authenticated (potential security placeholder). Should be updated to use real JWT persistence & refresh logic.
- Missing: Retry logic, abort controllers, standardized error shape typing (e.g., `ApiError`).

## Types & Type Safety
- Most domains typed (`User`, `Subject`, `Task`).
- `any` usages:
  - Sorting comparator in users page.
  - Response unwrapping in user detail and auth flows.
  - Router context updates `(prev: any)` in providers.
  - Google auth placeholder types.
- Recommendation: Introduce a `RouterContext` interface and generic helper for safe data extraction: `function unwrap<T>(candidate: unknown): T | never`.

## Routing & Guards
- Root route composes providers; context syncing occurs via `AuthSync`.
- Admin guard via `useRequireAdmin` (not reviewed in full here—assumed role check). Consider centralizing guard logic into route `beforeLoad` for consistency.
- Suggest adding lazy loading for feature routes to optimize bundle size.

## Components & UI Patterns
| Component | Notes | Recommendations |
|-----------|-------|----------------|
| Button | Variant + size pattern, CSS Modules | Add `aria-busy` for loading states if/when needed. |
| Modal | Good accessibility baseline (focus trap, Esc, labels) | Persisted dynamic title ID could be deterministic to reduce layout shift; consider portal mounting. |
| DataTable | Modular (columns, rows, footer) | Add empty state slot, keyboard row navigation, and accessible `<caption>`. |
| Toast | Basic queue | Add SR-only region and stacking position customization. |

## Missing or Partial Features vs Instructions
| Item | Status | Recommendation |
|------|--------|----------------|
| Error Boundary | Missing | Implement `ErrorBoundary` per instructions and wrap route tree. |
| Pagination Hook (`usePagination`) | Missing | Add reusable hook to encapsulate page calculations. |
| Filter/Search URL Sync | ✅ Implemented for users page | Abstract into a generic `useQueryState` helper for reuse. |
| Audit Logging | Not implemented | Add logging util writing to console first, later remote sink. |
| Task/Subject Management UI | Partially scaffolded | Ensure same filter/sort pattern parity. |
| Toast Accessibility | Partial | Add `role="alert"`/`aria-live` container. |
| Loading Skeletons | Not specified/unused | Add skeleton components for perceived performance. |
| Form Validation Strategy | Not explicit | Define a light validation helper (pure functions) since form libs are banned. |
| Testing Strategy | Minimal (vitest present, no tests) | Add tests for providers, hooks, and DataTable interactions. |
| Environment Typings | Present for some keys | Expand to include all referenced `VITE_` variables (admin token, etc.). |
| Authentication Refresh Flow | Placeholder token storage | Implement refresh endpoint handling and token expiry checks. |
| Security: Token Source | Hard-coded admin token env usage | Replace with per-user JWT from login responses. |
| Performance Memoization | Partial | Audit re-renders with React profiler; memo heavy lists. |
| Code Splitting | Not applied | Use dynamic imports for large route groups. |
| Accessibility Audits | Partial | Run axe / add manual checklist in docs. |

## Suggested Additions to Instructions
1. Router Context Typing: Define a `RouterContext` interface used in `router.update` calls to remove `any`.
2. Error Handling Standard: Specify an `ApiError` shape `{ message: string; code?: string; details?: unknown }` and enforce across `apiService`.
3. Testing Minimums: Require at least one test per provider + one integration test per critical route.
4. Accessibility Guidelines: Document toast live region, modal focus trap expectations, and DataTable caption/ARIA roles.
5. Performance Budget: Recommend max bundle size thresholds and use of React.lazy for routes.
6. Logging Policy: Provide debug util interface with levels (debug/info/warn/error) and environment gating.
7. ID Encoding Policy: Document rationale (obfuscation only) and future migration path.
8. Pagination & Query State Abstraction: Encourage shared hook for pagination, sorting, filtering with URL sync.
9. Security Guidance: Define how tokens are stored (localStorage vs httpOnly cookie) and refresh cycle.
10. Error Boundary Placement: Required at root to isolate UI failures.

## Priority Recommendations (Actionable)
1. Remove Tailwind dependency (or formally adopt and update instructions). 
2. Implement `ErrorBoundary` and wrap `<Outlet />` region.
3. Replace static admin token mechanism with real JWT from login responses.
4. Add test scaffolding (`/src/tests/`) covering AuthProvider, UsersProvider, and ToastProvider.
5. Add `usePagination` + `useQueryState` utilities; refactor users page to consume them.
6. Introduce `RouterContext` typing and eliminate `any` casts in context updates.
7. Harden `apiService` with abort controller support and typed error returns.
8. Add accessibility improvements: DataTable caption, toast live region, keyboard navigation for rows.
9. Add code-splitting for admin vs trainee route trees via `lazy` import.
10. Document all environment variables in `README` + `env.d.ts` (add admin bearer token placeholder removal).

## Quick Wins
- Replace sorting comparator `any` with a typed generic comparator helper.
- Add `<caption>` to tables for screen readers.
- Add one vitest test to assert UsersProvider fetch sets `users` state.
- Add `role="status"` to toast container.

## Risks
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Static admin token usage | Security breach potential | Implement proper auth flow immediately. |
| Missing error boundary | Full app crash on runtime error | Add boundary wrapper. |
| Lack of tests | Regression risk | Introduce minimal test suite. |
| Inconsistent sorting baseline on other entities | UX inconsistency | Apply same hidden id sort pattern. |

## Conclusion
The project adheres to most structural and architectural guidelines. Key gaps are around production-hardening (auth token handling), missing accessibility & error boundary, and lack of shared pagination/query abstractions. Addressing the outlined priority recommendations will significantly improve maintainability, security, and user experience.

---
Generated as part of an automated review. Update this document as improvements are implemented.
