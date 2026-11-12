# Automated Test Cases & Execution Matrix — Uttarakhand Gateways

**Execution Environment:** Isolated test instance `http://127.0.0.1:3099` (`dist/server.cjs`, cloned `DATA_DIR`), Edge Headless CDP (`1366x800` desktop + `320px–1920px` responsive sweep).  
**Final Post-Fix Run Timestamp:** `2026-11-12T14:07:24Z` (API/Security) & `2026-11-12T14:10:04Z` (Browser E2E).  
**Pass Rate:** **73 / 73 automated checks passed (`50/50` API + `23/23` E2E)** + **Backend Restart Persistence Check passed**.

---

## 1. API, Security, Persistence & Concurrency Suite (`tests/api_security_destruction.mjs`) — 50 / 50 PASS

| Test ID | Category | Severity | Test Objective | Observed Final Result |
|---|---|---|---|---|
| `API-01` | Infrastructure | CRITICAL | `/api/health` confirms connected database & inventory | **PASS** — `HTTP 200, db=file, count=1010` |
| `SEO-/` | SEO/Routing | HIGH | Root `/` serves 200 HTML | **PASS** — `HTTP 200, len=12337` |
| `SEO-/buy` | SEO/Routing | HIGH | `/buy` serves 200 HTML | **PASS** — `HTTP 200, len=12337` |
| `SEO-/rent` | SEO/Routing | HIGH | `/rent` serves 200 HTML | **PASS** — `HTTP 200, len=12477` |
| `SEO-/list` | SEO/Routing | HIGH | `/list` serves 200 HTML | **PASS** — `HTTP 200, len=9675` |
| `SEO-/list/buy` | SEO/Routing | HIGH | `/list/buy` serves 200 HTML | **PASS** — `HTTP 200, len=9800` |
| `SEO-/list/rent` | SEO/Routing | HIGH | `/list/rent` serves 200 HTML | **PASS** — `HTTP 200, len=9652` |
| `SEO-/guides` | SEO/Routing | HIGH | `/guides` serves 200 HTML with content | **PASS** — `HTTP 200, len=23011` |
| `SEO-/properties-in-dehradun` | SEO/Routing | HIGH | Location SEO landing route returns 200 | **PASS** — `HTTP 200, len=22415` |
| `SEO-/flats-for-sale-in-dehradun` | SEO/Routing | HIGH | Category+city SEO landing route returns 200 | **PASS** — `HTTP 200, len=21087` |
| `SEO-/robots.txt` | SEO/Routing | HIGH | `/robots.txt` accessible | **PASS** — `HTTP 200, len=1541` |
| `SEO-/sitemap.xml` | SEO/Routing | HIGH | Dynamic XML sitemap serves 200 | **PASS** — `HTTP 200, len=794207` |
| `SEO-404` | SEO/Routing | HIGH | Unknown route returns true HTTP 404 + `noindex` | **PASS** — `HTTP 404, hasNoindex=true` |
| `SEO-NOINDEX` | SEO/Routing | MEDIUM | Private route `/dashboard` injects `noindex` meta | **PASS** — `HTTP 200, hasNoindex=true` |
| `AUTH-01` | Auth | HIGH | Register rejects short name, bad email, weak password | **PASS** — `HTTP 400` |
| `AUTH-02` | Auth | CRITICAL | Valid registration issues cookie + token with `role=user`, `isOwner=false` | **PASS** — `HTTP 201` |
| `AUTH-03` | Auth | HIGH | Duplicate email registration returns `409 Conflict` | **PASS** — `HTTP 409` |
| `SEC-PRIV-01` | Security | CRITICAL | Registering with display name `"Amit Tyagi"` stays `role=user, isOwner=false` | **PASS** — `HTTP 201, isOwner=false, role=user` |
| `SEC-PRIV-02` | Security | CRITICAL | Fake `"Amit Tyagi"` blocked from `GET /api/users` | **PASS** — `HTTP 403, leakedUsers=0` |
| `SEC-AUTH-LEGACY` | Security | HIGH | Legacy `/api/register-user` enforces input/email/password validation | **PASS** — `HTTP 400` |
| `SEC-SESS-01` | Security | HIGH | Bearer logout revokes server session token | **PASS** — `logout HTTP 200`, follow-up `/api/auth/me` -> `HTTP 401` |
| `AUTH-04` | Auth | CRITICAL | Login succeeds with valid credentials after prior logout | **PASS** — `HTTP 200` |
| `AUTH-05` | Auth | HIGH | Wrong password rejected | **PASS** — `HTTP 401` |
| `SEC-SESS-02` | Security | CRITICAL | Unauthenticated `/api/auth/sync-session` spoofing blocked | **PASS** — `HTTP 401` |
| `SEC-ADMIN-01` | Security | CRITICAL | Normal user blocked from `GET /api/users` | **PASS** — `HTTP 403` |
| `SEC-ADMIN-02` | Security | CRITICAL | Normal user blocked from `POST /api/properties/clear-all` | **PASS** — `HTTP 403` |
| `SEC-PROP-01` | Security | CRITICAL | Unauthenticated `POST /api/properties` rejected | **PASS** — `HTTP 401` |
| `CRUD-01` | CRUD/Persistence | CRITICAL | Authenticated owner creates listing `P1` | **PASS** — `HTTP 200` |
| `SEC-MASS-01` | Security | HIGH | `POST /api/properties` strips spoofed metrics/flags & `javascript:` URLs | **PASS** — `views=0, isSold=false` |
| `SEC-PII-01` | Security | HIGH | Unauthenticated `GET /api/properties/:id` omits `ownerContact`/`sellerEmail` | **PASS** — Both undefined |
| `SEC-IDOR-01` | Security | CRITICAL | User B blocked from `PUT` on User A's property | **PASS** — `HTTP 403` |
| `SEC-IDOR-02` | Security | CRITICAL | User B blocked from overwriting User A's ID via `POST /api/properties` | **PASS** — `HTTP 409`, title preserved |
| `SEC-IDOR-03` | Security | CRITICAL | User B blocked from `DELETE` on User A's property | **PASS** — `HTTP 403` |
| `SEC-MASS-02` | Security | HIGH | `PUT /api/properties/:id` prevents client overwrite of `ownerId`/`views` | **PASS** — `HTTP 200`, `views=0`, `ownerId` intact |
| `VAL-01` | Validation | MEDIUM | Negative property price rejected | **PASS** — `HTTP 400` |
| `SEC-UPL-01` | Security | HIGH | Unauthenticated `/api/upload-video` rejected | **PASS** — `HTTP 401` |
| `SEC-UPL-01B` | Security | HIGH | Authenticated fake HTML payload to `/api/upload-video` rejected via magic bytes | **PASS** — `HTTP 400` |
| `SEC-ADMIN-03` | Security | CRITICAL | Normal user blocked from `/api/properties/bulk-sync` | **PASS** — `HTTP 403` |
| `SEC-UPL-02` | Security | HIGH | SVG payload rejected by `/api/moderate-image` | **PASS** — `HTTP 400` |
| `AI-01` | Validation | LOW | Empty `/api/chat` message rejected | **PASS** — `HTTP 400` |
| `AI-02` | Validation | MEDIUM | Over-1000-char `/api/chat` message rejected | **PASS** — `HTTP 400` |
| `AI-03` | Validation | LOW | Too-short `/api/enhance-description` rejected | **PASS** — `HTTP 400` |
| `SEC-RL-01` | Security | MEDIUM | `/api/enhance-description` enforces rate limiting | **PASS** — `rateLimited=true` (`429`) |
| `FEAT-PROF-01` | Persistence/API | HIGH | Profile rename persists via `PUT /api/auth/profile` -> `GET /api/auth/me` | **PASS** — `HTTP 200`, `"QA Updated Alpha"` |
| `FEAT-REP-01` | Persistence/API | HIGH | Listing report created via `POST /api/reports` | **PASS** — `HTTP 201`, persisted ID returned |
| `SEC-ADMIN-04` | Security | HIGH | Normal user blocked from `GET /api/reports` queue | **PASS** — `HTTP 403` |
| `SEC-ADMIN-05` | Security | CRITICAL | Normal user blocked from `DELETE /api/users/:id` | **PASS** — `HTTP 403` |
| `DB-RACE-01` | Concurrency | HIGH | 10 concurrent `POST /view` calls increment without lost updates | **PASS** — `10/10` views persisted |
| `CRUD-DEL-01` | CRUD/Persistence | CRITICAL | Owner `DELETE` removes listing permanently (`GET` -> `404`) | **PASS** — `DELETE 200`, follow-up `GET 404` |
| `FEAT-DELACC-01` | Persistence/API | HIGH | `DELETE /api/auth/account` removes user and invalidates session & login | **PASS** — `DELETE 200`, `/me 401`, `login 401` |

---

## 2. Browser E2E, Accessibility, Viewport & Stability Suite (`tests/browser_e2e_destruction.mjs`) — 23 / 23 PASS

| Test ID | Category | Severity | Test Objective | Observed Final Result |
|---|---|---|---|---|
| `E2E-HOME-01` | Functionality | CRITICAL | Homepage renders H1 and marketplace content cleanly | **PASS** — `load=1918ms`, `h1Count=1` |
| `A11Y-01` | Accessibility | MEDIUM | All rendered homepage images have `alt` attributes & load cleanly | **PASS** — `518` images, `noAlt=0`, `broken=0` |
| `A11Y-02` | Accessibility | MEDIUM | Visible icon buttons include accessible `aria-label` or `title` | **PASS** — `emptyIconButtons=0` |
| `E2E-CHAT-01` | Functionality | MEDIUM | AI Chatbot opens and replies accurately to Nali unit query (`2,160`) | **PASS** — `opened=true, replied=true` |
| `E2E-AUTH-01` | Auth/UX | CRITICAL | User registration on `/login` signs in & stores session token | **PASS** — `token=true`, navbar updated |
| `E2E-PERSIST-01` | Persistence | CRITICAL | Authenticated session survives full page reload | **PASS** — `username=E2E Seller Original` |
| `E2E-PERSIST-02` | Persistence | HIGH | Profile rename in `UserProfileModal` persists after full page reload | **PASS** — `beforeReload="E2E Renamed Persisted"`, `afterReload="E2E Renamed Persisted"` |
| `E2E-COPY-01` | Copy/UX | MEDIUM | `/list/buy` shows `Broker`, hides `Builder` and `Agent` | **PASS** |
| `E2E-COPY-02` | Copy/UX | MEDIUM | `/list/rent` shows `Broker`, hides `Builder`, `Agent`, and `0% Brokerage Rental Listing GUI` | **PASS** |
| `E2E-FEAT-REP-PAGE` | Functionality | MEDIUM | `/buy` card links open canonical `/property/:slug` page with visible `Report` button | **PASS** — `/property/duplex-prop-...`, `hasReportBtn=true` |
| `E2E-FEAT-REP` | Persistence | HIGH | Submitting `ReportListingModal` dispatches real `POST /api/reports` & shows confirmation | **PASS** — `thankYouVisible=true, backendCalled=true` |
| `E2E-CLEANUP-01` | Persistence | MEDIUM | E2E test account cleans up cleanly via `DELETE /api/auth/account` | **PASS** — `HTTP 200` |
| `UX-VP-320`..`1920` | Responsive | HIGH/MED | Zero horizontal overflow at `320`, `375`, `390`, `430`, `768`, `1366`, `1920`px | **PASS** — `overflow=0px` on all 7 viewports |
| `NET-OFFLINE-01` | Resilience | MEDIUM | Offline network transition fails gracefully with 0 uncaught JS errors | **PASS** — `Failed to fetch`, `pageErrors=0` |
| `E2E-STAB-01` | Stability | CRITICAL | Zero uncaught runtime JS exceptions across entire browser suite | **PASS** — `[]` |
| `E2E-STAB-02` | Stability | CRITICAL | Zero HTTP `5xx` server responses across entire browser suite | **PASS** — `[]` |
| `E2E-STAB-03` | Stability | HIGH | Zero `console.error` messages across entire browser suite | **PASS** — `[]` |
