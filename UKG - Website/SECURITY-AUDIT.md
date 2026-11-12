# Security Audit Report — Uttarakhand Gateways

**Audit Date:** 2026-11-12  
**Target Scope:** Express API (`server.ts`), Persistence Layer (`db.ts`), Ownership Helpers (`src/utils/propertyOwnership.ts`), Auth State (`src/context/AuthContext.tsx`), and Frontend Callers.  
**Post-Fix Attack Suite Result:** All security checks in `tests/api_security_destruction.mjs` passed (**50/50 total checks passing**).

---

## 1. Remediated Vulnerabilities

### 1.1 Critical — Privilege Escalation via Display Username (`db.ts`, `src/utils/propertyOwnership.ts`, `src/components/AdminAccountsModal.tsx`, `src/context/AuthContext.tsx`)
- **Finding:** `db.saveUser` and frontend `isAppOwner` granted `isOwner: true` / `role: 'owner'` to any account whose display `username` was `'amit tyagi'` (or `'amit1986.delhi'`). In live baseline test `SEC-PRIV-02`, registering a brand-new account with `name: "Amit Tyagi"` and an attacker email gained full access to `GET /api/users` (`HTTP 200`, returning `8` user records).
- **Fix:**
  - Restricted owner determination in `db.ts` (`saveUser` / `OWNER_EMAIL`) and `src/utils/propertyOwnership.ts` (`isAppOwner`) strictly to the verified founder email `'amit1986.delhi@gmail.com'` (or explicit server-verified `isOwner === true` / `role === 'owner'`), removing username-based elevation across `AuthContext.tsx` and `AdminAccountsModal.tsx`.
  - Tightened `isDirectPropertyOwner` so display-name matching only falls back when explicit `ownerId`, `ownerContact`, and `sellerEmail` fields are absent.
- **Verification:** `SEC-PRIV-01` (`HTTP 201`, `role=user, isOwner=false`) & `SEC-PRIV-02` (`GET /api/users` returns `HTTP 403, leakedUsers=0`).

### 1.2 Critical — Cross-User Property Overwrite & Delete IDOR via `POST /api/properties` (`server.ts`)
- **Finding:** `POST /api/properties` executed an upsert without checking whether the submitted `id` already belonged to another user. In baseline tests `SEC-IDOR-02` & `SEC-IDOR-03`, User B passed User A's property ID to `POST /api/properties`, overwrote User A's listing title/ownership (`HTTP 200`), and then deleted User A's property (`HTTP 200`).
- **Fix:** Added a conflict guard on `POST /api/properties`: if `existingProperty` exists, reject with `HTTP 409` (`A listing with this ID already exists. Use PUT to update your own listing.`), forcing edits through ownership-checked `PUT /api/properties/:id`.
- **Verification:** `SEC-IDOR-01` (`PUT` -> `403`), `SEC-IDOR-02` (`POST` existing ID -> `409`, User A title intact), `SEC-IDOR-03` (`DELETE` -> `403`).

### 1.3 High — Session Token Not Revoked on Bearer Logout (`server.ts`, `db.ts`, `src/context/AuthContext.tsx`)
- **Finding:** Two compounded defects prevented logout revocation: (1) `/api/auth/logout` only deleted the `ukg_session` cookie and ignored `Authorization: Bearer <token>` and `X-Session-Token`; (2) `getSessionUser` fell back to `verifySignedSessionToken(sessionId)` and **re-created the session in DB** even after it had been deleted (`SEC-SESS-01` returned `HTTP 200` on `/api/auth/me` after logout).
- **Fix:**
  - Updated `/api/auth/logout` to revoke all presented cookie, Bearer, and `x-session-token` tokens.
  - Added persistent session revocation (`db.revokeSession`, `db.isSessionRevoked`, stored in memory and `revoked_sessions.json`) invoked on `deleteSession` and `deleteUserSessions`, and checked at the top of `getSessionUser` before fallback token signature verification.
  - Updated `AuthContext.tsx` `logout()` to transmit `Authorization: Bearer <token>` and `checkServerSession()` to clear stale client auth state on `401` rather than calling `/api/auth/sync-session`.
- **Verification:** `SEC-SESS-01` (`logout HTTP 200`, subsequent `/api/auth/me` -> `HTTP 401`), plus survival confirmed across server restart (`revokedTokenStatus=401`).

### 1.4 High — Mass Assignment & Unsafe Media URLs on Properties (`server.ts`)
- **Finding:** `POST /api/properties` and `PUT /api/properties/:id` accepted client-supplied `views`, `inquiries`, `shares`, `featured`, `isSold`, `ownerId`, and unsafe `javascript:` image URLs (`SEC-MASS-01` stored `views: 99999` and `isSold: true`).
- **Fix:** Sanitized property creation and update payloads (`server.ts`): server-controlled counters (`views`, `inquiries`, `shares`) and `ownerId`/`ownerContact` cannot be spoofed or reassigned by clients, new listings default `views=0`, `inquiries=0`, `shares=0`, `isSold=false`, and unsafe non-`http(s)` / non-relative `images` URLs are filtered out.
- **Verification:** `SEC-MASS-01` (`views=0, isSold=false`, `javascript:` URL stripped) and `SEC-MASS-02` (`PUT` client `views: 55555, ownerId: 'hijacked-owner-id'` rejected/ignored).

### 1.5 High — Public PII Exposure on Unauthenticated Property Reads (`server.ts`)
- **Finding:** `GET /api/properties` and `GET /api/properties/:id` returned private email fields `ownerContact` and `sellerEmail` to unauthenticated callers (`SEC-PII-01`).
- **Fix:** Added `sanitizePublicProperty` so unauthenticated responses strip `ownerContact` and `sellerEmail` while preserving owner/admin visibility when authenticated.
- **Verification:** `SEC-PII-01` (`ownerContact=undefined, sellerEmail=undefined`).

### 1.6 High — Arbitrary Content / Fake HTML Disguised as Video Upload (`server.ts`)
- **Finding:** `POST /api/upload-video` accepted an unvalidated `<html><script>...</script></html>` payload from an authenticated user and wrote an `.mp4` file under `uploads/` (`SEC-UPL-01B`: `HTTP 200`).
- **Fix:** Added `detectVideoExtensionFromMagic` binary magic-byte inspection (supporting real MP4/MOV `ftyp`, WebM/MKV EBML `0x1A45DFA3`, AVI `RIFF....AVI `, Ogg `OggS`) plus upload rate limiting on `/api/upload-video`.
- **Verification:** `SEC-UPL-01` (unauthenticated `HTTP 401`) and `SEC-UPL-01B` (authenticated HTML payload rejected with `HTTP 400`).

### 1.7 High / Medium — Legacy Registration Validation, Password Policy Consistency, HTML Injection, & AI Rate Limiting (`server.ts`)
- **Findings & Fixes:**
  - `/api/register-user`: Added username length (`2–80`), email format regex validation, password length (`>= 6`), IP rate limiting, and `HTTP 409` duplicate email status (`SEC-AUTH-LEGACY` -> `HTTP 400`).
  - `/api/auth/reset-password`: Aligned minimum password length to `>= 6` matching registration.
  - Email HTML templates: Wrapped interpolated usernames in `escapeHtml()`.
  - `/api/enhance-description`: Added IP rate limiting (`SEC-RL-01` -> triggers `429`).

---

## 2. Residual Operational Notes (Non-Defect Items)

- **Public `sellerPhone` on listings:** Intentionally preserved for marketplace buyer contact per product design, while email PII (`sellerEmail`, `ownerContact`) is hidden from unauthenticated API reads.
- **Database Engine:** Currently running in atomic JSON file storage mode (`db=file`, `data/`). PostgreSQL and MySQL adapters exist in `db.ts` (`ukg_properties`, `ukg_users`, `ukg_sessions`, `ukg_reports`, `ukg_password_resets`); revocation set persistence currently uses `revoked_sessions.json` alongside in-memory `Set<string>`, which assumes single-instance deployment or shared persistent `DATA_DIR` until moved to Redis/SQL for multi-node horizontal scaling.
- **Environment Secrets:** `.env` values were never committed or exposed in any API response, test artifact, or report.
