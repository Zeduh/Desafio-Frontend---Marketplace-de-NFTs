# Architecture and development

## Foundation

- React and TypeScript are built with Vite.
- TanStack Router owns client-side routes; the router is created with the app's `QueryClient` context.
- TanStack Query owns server-state caching. The Axios instance in `src/lib/api-client.ts` is the only REST transport.
- MSW handlers live under `src/mocks`. The browser worker starts by default and can be disabled with `VITE_ENABLE_MOCKS=false`.
- Socket.IO clients are created disconnected by `src/lib/realtime.ts`; features connect and release their own client lifecycle.
- Tailwind CSS v4 is integrated through the Vite plugin. Reusable UI primitives live under `src/components/ui`.

The current route is a temporary foundation screen that checks the mocked health endpoint. Its layout and colors are scaffolding, not a Figma interpretation; page styling will be replaced incrementally from the supplied design references.

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
