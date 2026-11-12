# Architecture and development

## Foundation

- React and TypeScript are built with Vite.
- TanStack Router owns client-side routes; the router is created with the app's `QueryClient` context.
- TanStack Query owns server-state caching. The Axios instance in `src/lib/api-client.ts` is the only REST transport.
- MSW handlers live under `src/mocks`. The browser worker starts by default and can be disabled with `VITE_ENABLE_MOCKS=false`.
- Socket.IO clients are created disconnected by `src/lib/realtime.ts`; features connect and release their own client lifecycle.
- Tailwind CSS v4 is integrated through the Vite plugin. Reusable UI primitives live under `src/components/ui`.

The Home route follows the supplied desktop CSS and the separate mobile composition. Desktop Top uses the 1200px hero geometry, Roboto Mono, and the Portuguese headline “SEJA DONO DO FUTURO DA ARTE DIGITAL”; mobile Top uses its own collection search bar, featured artwork, and Portuguese hero copy. Products has the 310px desktop filter/sidebar, featured NFT, three-column catalog, API-derived collection/network facet counts, a read-only ETH range display controlled by an accessible dual-handle slider, exclusive category tabs, sorting, and the mobile two-column catalog with a filter dialog and bottom navigation. Desktop search opens a shadcn Popover from the header; its Input and the separate mobile search both synchronize with the URL. The catalog UI consumes `GET /api/nfts` through Axios and TanStack Query; MSW owns the fixtures, filtering, sorting, and pagination. Search, filters, sorting, and page are validated in and synchronized with the URL. Facet filters use OR within a group (multiple selected collections include products from any selected collection; likewise for networks) and AND between groups (collection, network, price, and catalog tab). Facet counts are recalculated by the API using the other active filters while omitting the facet's own selection, so all collection and network options remain available while refining results. TanStack Query keeps the previous response visible during refetch and marks the grid busy. “Todas as coleções” and “Todas as redes” clear their respective filter groups; the price range applies when the user activates “Aplicar.” The 36 mock NFTs have intentionally varied collection counts—some collections have several items and “Assinaturas” is empty—to demonstrate dynamic counts and empty results. Promos and Blog remain structural placeholders.

## Required stack adoption status

The challenge requires each listed technology to participate in the finished solution. The current foundation is intentionally incomplete; technologies are activated as their corresponding user flows are implemented rather than being added to static placeholders.

| Technology | Current status | Planned feature use |
| --- | --- | --- |
| React and TypeScript | Used by the app and page components. | All screens and typed contracts. |
| TanStack Router | Owns the Home route and app shell; catalog query state is validated and synchronized with the URL. | Direct detail routes and private routes. |
| TanStack Query | Caches the catalog query; other business queries and mutations are not implemented yet. | Catalog, detail, session, cart, and other remote state. |
| Axios and REST | The catalog issues `GET /api/nfts` through the shared Axios client; the MSW handler simulates filtering, sorting, pagination, and facets. | All feature REST requests must use the shared Axios client. |
| Socket.IO | A disconnected client factory exists; no feature subscribes to events yet. | NFT price/availability and order updates, with the MSW Socket.IO binding. |
| Tailwind CSS | Vite plugin and stylesheet import are active; shared UI primitives use Tailwind utilities, while Figma-specific Home layout remains CSS-based. | Utility styling through shared UI primitives and feature components. |
| shadcn/ui | CLI-generated and design-adapted Button, Input, Popover, Dialog, Pagination, Select, Slider, Skeleton, Badge, and Tabs components are used in the interface. Interactive primitives use Base UI (`@base-ui/react`), not Radix; Figma-specific layout and artwork retain custom CSS. | Continue preferring shadcn components for reusable interactions and states while preserving custom composition where it serves the design. |
| MSW | Browser worker, health handler, and fixture-backed catalog endpoint are active. | Stateful REST and Socket.IO simulations for feature flows. |
| Playwright | Home structure, responsive Top, Products layout, catalog API contract, read-only price slider and Figma spacing, exclusive tabs, all-facets reset, multi-select collection/network behavior, uneven and zero-count collection facets, empty results, four-page API pagination and scroll position, background, and mocked health are covered by E2E tests. | Required journey, viewport, accessibility, and visual regression coverage. |
| Lighthouse | CI configuration and command exist; the required audit has not been run yet. | Audit stable Home and NFT detail production builds on mobile and desktop. |

## Catalog REST contract

`GET /api/nfts` accepts `q`, repeated `collection` and `network` parameters, decimal-string `minPrice`/`maxPrice`, `tab`, `sort`, `page`, and `pageSize`. A successful response contains the paginated `items`, `featured`, filtered `total`, `page`, `pageSize`, and `facets.collections`/`facets.networks` arrays of `{ value, count }`. Each facet count is computed against the other filters but excludes its own group: collection counts honor network/search/price/tab; network counts honor collection/search/price/tab. This disjunctive-faceting contract keeps every option visible and makes counts useful for the next selection, including zero-count collections. Fixture quantities intentionally differ by collection, with one collection empty, so the UI can demonstrate varied counts and the empty-results state. Values within a facet are ORed; different facets are ANDed. Invalid pagination, sort, tab, or price parameters return HTTP 400 with a typed error object.

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
