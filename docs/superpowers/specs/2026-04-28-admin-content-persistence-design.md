# Admin content persistence — design

## Problem

Changes made in the admin panel do not persist for visitors and don't reliably survive a reload. The infrastructure to fix this is mostly already in place — `_worker.js` exposes `GET/POST /api/content` backed by a KV namespace `BDS_CONTENT`, and `js/content.js` has a `saveContent()` path that POSTs to that API — but two things are broken:

1. **KV namespace is never wired up.** `wrangler.jsonc` still has `"id": "REPLACE_WITH_YOUR_KV_NAMESPACE_ID"`, so the deployed worker has a placeholder binding and every KV read/write fails.
2. **Silent localStorage fallback hides failure.** When the API key isn't set, or when the POST fails, `saveContent()` writes to the admin's browser-local `localStorage` and returns `{ ok: true, source: 'local' }`. The toast says "saved" and there is no visible signal that the save did not actually reach a backend visible to other visitors.

Together these two issues mean every save the user has made so far has either gone nowhere visible (KV failed → fallback to localStorage → only the admin's own browser sees the change) or appeared to succeed while doing nothing useful for visitors.

## Goal

Admin saves write to Cloudflare KV. All visitors of the site read the same content from KV. The admin can tell at a glance whether their connection to KV is working, and if a save fails, they know about it instead of seeing a fake success.

Out of scope: replacing the storage backend, changing the admin login model (still client-side SHA-256 against `bds_admin_pw`), introducing per-user write keys, or changing the public read path's localStorage fallback for offline/dev use.

## Approach

Two parts: an operational runbook the user runs once to actually wire up KV in their Cloudflare account, plus small code changes that prevent the silent-failure footgun.

### Part 1 — Operational runbook

A one-time setup checklist the user executes against their Cloudflare account. Steps:

1. Ensure `wrangler` is installed and logged in (`npx wrangler login`).
2. Create the KV namespace: `npx wrangler kv namespace create BDS_CONTENT` and copy the printed `id`.
3. Replace `REPLACE_WITH_YOUR_KV_NAMESPACE_ID` in `wrangler.jsonc` with the real ID.
4. Set the worker secret: `npx wrangler secret put WORKER_SECRET`. Paste a long random string (e.g., `openssl rand -hex 32`). This is the bearer token that authorizes admin writes — distinct from the admin login password.
5. Redeploy: `npx wrangler deploy`.
6. In the admin Storage section, paste the same `WORKER_SECRET` value into the Worker API Key field and click Test. Expect "✓ Connected to Cloudflare KV".
7. Click Save once in the admin panel to write current content to KV.

After this, public visitors hit `/api/content` and the worker reads from KV; the admin's writes go to the same KV; eventual-consistency lag (~60s globally) is acceptable for this use case.

### Part 2 — Code changes

**Remove the silent localStorage fallback in `saveContent()`** (`js/content.js`). When an API key is configured but the POST fails (network error, non-OK response, missing key), `saveContent()` returns `{ ok: false, error: <reason> }` instead of writing to localStorage and returning success. The save handler in `js/admin.js` reads `ok` and shows a red toast on failure with a clear message ("Not saved — KV connection failed. Check Storage settings."). The localStorage fallback in `getContent()` stays unchanged: it's still useful for offline/dev reads and harmless on its own.

**Add a connection-state pill in the admin header** (`admin.html`, `js/admin.js`, `css/admin.css`). On admin load and after every Test/Save, ping `/api/ping` with the stored API key. Render a small pill next to the Save button:

- Green "KV connected" — `/api/ping` returns `{ ok: true }`.
- Amber "Local only — saves won't reach visitors" — no API key set, or `/api/ping` fails.

The pill is purely informational; it doesn't block save attempts. It exists so the admin can't silently drift into a state where they think saves are persistent when they aren't.

## Files affected

- `wrangler.jsonc` — KV namespace ID replacement (user does this manually with the ID from `wrangler kv namespace create`).
- `js/content.js` — `saveContent()` no longer falls back to localStorage on KV failure; returns `{ ok: false, error }` instead.
- `js/admin.js` — Save handler shows red toast on `ok: false`; new connection-pill code that pings `/api/ping` on load and after Test/Save.
- `admin.html` — Add pill element next to Save button in the header.
- `css/admin.css` — Pill styles (green/amber states).
- `js/i18n.js` — German + English strings for the new toast and pill states.

## Risks and mitigations

- **User pastes the wrong KV ID or fat-fingers the secret.** Mitigated by the existing Test button and the new connection pill — both surface the failure immediately rather than letting it hide behind a fake-success toast.
- **Admin loses their `WORKER_SECRET`.** They re-run `wrangler secret put WORKER_SECRET` with a new value and update the admin Storage field. KV data is untouched.
- **First visitor after deploy hits empty KV.** Worker already auto-seeds from `/content.json` on first GET, so this is handled.
- **Removing the localStorage save fallback could regress offline editing for the admin.** This is acceptable — the admin panel is for production content edits, not offline drafting. If offline editing later becomes a need, it deserves its own feature with explicit "draft" semantics rather than the current silent-shadow behavior.
