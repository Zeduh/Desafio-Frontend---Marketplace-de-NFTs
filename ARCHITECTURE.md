# Architecture and development

## Foundation

- React and TypeScript are built with Vite.
- TanStack Router owns client-side routes; the router is created with the app's `QueryClient` context.
- TanStack Query owns server-state caching. The Axios instance in `src/lib/api-client.ts` is the only REST transport.
- MSW handlers live under `src/mocks`. The browser worker starts by default and can be disabled with `VITE_ENABLE_MOCKS=false`.
- Socket.IO clients are created disconnected by `src/lib/realtime.ts`; features connect and release their own client lifecycle.
- Tailwind CSS v4 is integrated through the Vite plugin. Reusable UI primitives live under `src/components/ui`.

The Home route currently contains the structural sections from the supplied layer hierarchy: Top/Destaques, Products, Promos, and Blog. Its content placeholders are scaffolding, not a finished Figma interpretation. The page background `#140D0A` is the provided design token; each section will be refined in its own increment.

## Required stack adoption status

The challenge requires each listed technology to participate in the finished solution. The current foundation is intentionally incomplete; technologies are activated as their corresponding user flows are implemented rather than being added to static placeholders.

| Technology | Current status | Planned feature use |
| --- | --- | --- |
| React and TypeScript | Used by the app and page components. | All screens and typed contracts. |
| TanStack Router | Owns the Home route and app shell. | Search-state URLs, direct detail routes, and private routes. |
| TanStack Query | Provider and cache policy are configured; business queries and mutations are not implemented yet. | Catalog, detail, session, cart, and other remote state. |
| Axios and REST | The shared Axios client and MSW health handler exist; no business request is issued by the UI yet. | All feature REST requests must use the shared Axios client. |
| Socket.IO | A disconnected client factory exists; no feature subscribes to events yet. | NFT price/availability and order updates, with the MSW Socket.IO binding. |
| Tailwind CSS | Vite plugin and stylesheet import are active; the shared `Button` uses Tailwind utility classes, while the Home layout remains CSS-based. | Utility styling through the shared UI primitives and feature components. |
| shadcn/ui | Source-based `Button` primitive is built on Radix Slot, CVA, and Tailwind, and is used by the keyboard-accessible skip link. | Extend with only the primitives required by the Figma flows. |
| MSW | Browser worker and deterministic health handler are active. | Stateful REST and Socket.IO simulations for feature flows. |
| Playwright | Home structure, background, and mocked health are covered by E2E tests. | Required journey, viewport, accessibility, and visual regression coverage. |
| Lighthouse | CI configuration and command exist; the required audit has not been run yet. | Audit stable Home and NFT detail production builds on mobile and desktop. |

## Incremental TDD workflow

For each page or foundation increment:

1. Define the behavior and acceptance criteria.
2. Add the smallest relevant test first and run it to establish the expected failure.
3. Implement only what is needed to satisfy that test.
4. Run the focused test, then typecheck, lint, build, and any related regressions.
5. Review the diff and update directly related documentation.
6. Commit the validated increment with a concise message.

If a change has no meaningful automated test, record why and validate it with the narrowest observable check instead. Do not commit failing or unverified changes.

## Local commands

- `npm run dev` — local app, MSW enabled by default.
- `npm run typecheck` — TypeScript project checks.
- `npm run lint` — ESLint.
- `npm run build` — typecheck and production build.
- `npm run test:e2e:install` — install Playwright Chromium.
- `npm run test:e2e` — Playwright E2E tests.
- `npm run audit:lighthouse` — Lighthouse CI.
