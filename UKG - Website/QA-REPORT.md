# QA Report — Uttarakhand Gateways (`ukg-website`)

**Audit Date:** 2026-11-12  
**Target Codebase:** `D:\Downloads\UKG - Website`  
**Verification Server:** Built production bundle (`dist/server.cjs`, Vite client + esbuild server) running isolated against a cloned dataset on `http://127.0.0.1:3099` and verified healthy on `http://127.0.0.1:3000` (`1,010` properties loaded in file DB mode).  
**Final Automated Suite Totals (Post-Fix):**
- **API, Security, Persistence & Concurrency Suite (`tests/api_security_destruction.mjs`):** **50 passed, 0 failed** (up from **36 passed, 12 failed** out of 48 baseline checks)
- **Headless Browser E2E, Responsive, Accessibility & Stability Suite (`tests/browser_e2e_destruction.mjs`, Edge CDP):** **23 passed, 0 failed** (up from **19 passed, 3 failed** out of 22 baseline checks)
- **Backend Process Restart Persistence Check:** Verified created listing (`user-prop-restart-qa`), registered credentials, and revoked logout Bearer token all survived server termination and cold restart (`revokedTokenStatus=401`, `reLoginSuccess=True`, `leftoverVidUploads=0`).
- **TypeScript & Production Bundle (`npm.cmd run lint` / `npm.cmd run build`):** `tsc --noEmit` exited `0`; `vite build` + `esbuild` exited `0`.

---

## 1. Executive Summary

A full-stack destructive QA, security, persistence, UI/UX, and stability audit was executed against the running Uttarakhand Gateways application. Rather than relying on static code review alone, every critical workflow was exercised against live HTTP endpoints and a real Chromium-based browser (Microsoft Edge via Chrome DevTools Protocol).

The initial baseline runs exposed **16 substantive defects** across privilege escalation, IDOR overwrite/deletion, session revocation, PII leakage in public property payloads, upload validation, async file-write concurrency, client-only state mutations (profile updates, account deletion, listing reports, admin moderation queues), fabricated analytics heuristics, React hook ordering violations, and dead UI props.

All 16 findings were fixed directly in the backend (`server.ts`, `db.ts`) and frontend (`src/utils/propertyOwnership.ts`, `src/context/AuthContext.tsx`, `src/App.tsx`, `src/components/UserProfileModal.tsx`, `src/components/AdminAccountsModal.tsx`, `src/components/PropertyDetailPage.tsx`, `src/components/PropertyDetailModal.tsx`, `src/components/ReportListingModal.tsx`, `src/components/AdminReportsModal.tsx`, `src/components/ListerDashboard.tsx`, `src/components/Navbar.tsx`, `src/components/InboxPage.tsx`), rebuilt from source, and re-verified with **73 / 73 passing checks** across API, security, database persistence, browser E2E, responsive viewports, and network failure simulation.

---

## 2. Scope & Methodology

1. **Architecture & Feature Inventory:** Mapped Express/Node API routes (`server.ts`), dual-mode Postgres/MySQL/JSON persistence (`db.ts`), React SPA routes and modals (`src/App.tsx`, `src/context/AuthContext.tsx`, `src/components/*`), SEO SSR/meta handlers, AI endpoints, and file upload handlers.
2. **Test Data Isolation:** Copied `data/` to an isolated scratch `DATA_DIR` before testing so live customer records (`1,010` listings) were never altered or polluted.
3. **API & Attack Suite (`tests/api_security_destruction.mjs`):** Automated HTTP attack vectors covering health checks, SEO routes/404/noindex, registration validation, privilege escalation, Bearer session revocation, IDOR (`POST` overwrite, `PUT`, `DELETE`), mass assignment, PII redaction, magic-byte file upload filtering, rate limiting, concurrent `/view` metric updates, listing report submission, profile updates, and account deletion.
4. **Headless Browser E2E Suite (`tests/browser_e2e_destruction.mjs`):** Automated Edge CDP session driving real DOM interactions across `/`, `/buy`, `/rent`, `/login`, `/list/buy`, `/list/rent`, and canonical `/property/:slug` pages, monitoring `Runtime.exceptionThrown`, `console.error`, and HTTP `>=500` responses.
5. **Responsive, Accessibility, & Offline Resilience:** Audited rendered DOM images/buttons (`518` homepage images, `0` missing `alt`, `0` broken images, `0` unlabelled visible icon buttons), tested 7 viewports (`320px`, `375px`, `390px`, `430px`, `768px`, `1366px`, `1920px` — all `0px` horizontal overflow), and simulated offline network interruption via CDP `Network.emulateNetworkConditions`.

---

## 3. Baseline vs. Post-Fix Comparison

| Test Suite | Baseline Run | Post-Fix Final Run | Delta |
|---|---:|---:|---:|
| `tests/api_security_destruction.mjs` | 36 PASS / 12 FAIL (48 checks) | **50 PASS / 0 FAIL** (50 checks) | +14 fixed/added, 0 failing |
| `tests/browser_e2e_destruction.mjs` | 19 PASS / 3 FAIL (22 checks) | **23 PASS / 0 FAIL** (23 checks) | 0 failing |
| Restart Persistence & Revocation Check | Not verified | **PASS** (listing + user + revoked token survived restart) | Verified |
| JS Exceptions / Console Errors / HTTP 5xx | 0 / 0 / 0 | **0 / 0 / 0** | Clean |

> **Baseline Run Note:** In Baseline Run 2, `DB-RACE-01` failed with `0` views because `SEC-IDOR-03` had already deleted test property `P1` earlier in the script; the concurrency check was re-ordered before `CRUD-DEL-01` in the fixed suite and verified `10/10` concurrent increments (`withLock` serialization) prior to deletion.

---

## 4. Verification Highlights After Final Build

- **Infrastructure & SEO (`API-01`, `SEO-*`):** `/api/health` returns `200` (`count=1010`), `/robots.txt` and `/sitemap.xml` return `200`, unknown paths return true HTTP `404` with `noindex`, and private `/dashboard` includes `noindex`.
- **Auth & Persistence (`E2E-AUTH-01`, `E2E-PERSIST-01`, `E2E-PERSIST-02`, `FEAT-PROF-01`, `FEAT-DELACC-01`):** UI registration logs user in with cookie + Bearer token; reload keeps session; editing username to `E2E Renamed Persisted` persists via `PUT /api/auth/profile` and reloads cleanly from `GET /api/auth/me`; account deletion removes user from DB and invalidates login/session (`401`).
- **Marketplace Copy & Moderation Flows (`E2E-COPY-01`, `E2E-COPY-02`, `E2E-FEAT-REP-PAGE`, `E2E-FEAT-REP`, `FEAT-REP-01`):** `/list/buy` and `/list/rent` use `Broker` only (no `Builder`, `Agent`, or `0% Brokerage Rental Listing GUI` copy); `/buy` cards link to canonical `/property/:slug`; `PropertyDetailPage` renders a working `Report` button wired to `POST /api/reports`; `AdminReportsModal` fetches `GET /api/reports` and updates moderation status via `PATCH /api/reports/:id`.
- **Accessibility, Layout & Stability (`A11Y-01`, `A11Y-02`, `UX-VP-*`, `NET-OFFLINE-01`, `E2E-STAB-*`):** Zero runtime exceptions, zero console errors, zero HTTP 5xx responses, zero horizontal overflow across `320px–1920px`, and clean offline `Failed to fetch` error handling.
