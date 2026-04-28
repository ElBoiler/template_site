# Admin Content Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make admin-panel saves persist to Cloudflare KV for all visitors, and surface KV connection state so silent-fallback failures can no longer masquerade as success.

**Architecture:** The infrastructure already exists — a Cloudflare Worker at `_worker.js` with `GET/POST /api/content` backed by a `BDS_CONTENT` KV namespace, and a `saveContent()` path in `js/content.js` that POSTs when an API key is set. Two issues block it: the KV namespace ID in `wrangler.jsonc` is a placeholder, and `saveContent()` silently falls back to `localStorage` on any failure. This plan: (1) provides an operational runbook the user runs once against their Cloudflare account, (2) replaces the silent fallback with a hard failure + red toast, (3) adds a KV-connection pill to the admin header so the active state is visible.

**Tech Stack:** Vanilla JS (no build step), Cloudflare Workers + KV, Wrangler CLI. No test framework in this codebase — verification is manual in-browser.

**Spec:** [docs/superpowers/specs/2026-04-28-admin-content-persistence-design.md](../specs/2026-04-28-admin-content-persistence-design.md)

---

## File Structure

Files to modify (no new files):

- `wrangler.jsonc` — replace placeholder KV namespace ID (user-driven, see Task 1).
- `js/content.js` — `saveContent()` no longer falls back to `localStorage` on KV failure; returns `{ ok, error, source }`.
- `js/admin.js` — Save handler reads `ok`/`error` and shows red toast on failure. New `updateConnectionPill()` helper polled on load + after Test/Save.
- `admin.html` — `<span id="kvStatusPill">` added to `.admin-header-right`, before the Save button.
- `css/admin.css` — `.kv-pill` styles with `.kv-pill--ok` (green) and `.kv-pill--warn` (amber) variants.
- `js/i18n.js` — DE + EN strings for `toast_save_failed`, `kv_pill_connected`, `kv_pill_local_only`.

No tests added (no test framework). Each task includes a manual verification step in the browser using DevTools.

---

## Task 1: Cloudflare KV setup runbook (user-driven)

This task is run by the user against their own Cloudflare account. The implementing agent does NOT execute these commands — they require the user's Cloudflare login. The agent's role is to confirm the runbook ran successfully before proceeding to Task 2.

**Files:**
- Modify: `wrangler.jsonc:19` (the agent edits this once the user provides the KV namespace ID)

- [ ] **Step 1: Confirm wrangler is installed and authenticated**

User runs (from project root):
```bash
npx wrangler whoami
```
Expected: prints the user's Cloudflare email. If it errors with "not authenticated", user runs `npx wrangler login` first.

- [ ] **Step 2: User creates the KV namespace**

User runs:
```bash
npx wrangler kv namespace create BDS_CONTENT
```
Expected output contains a line like:
```
[[kv_namespaces]]
binding = "BDS_CONTENT"
id = "abc123def456..."
```
User pastes the `id` value to the agent.

- [ ] **Step 3: Agent edits wrangler.jsonc with the real ID**

Replace `REPLACE_WITH_YOUR_KV_NAMESPACE_ID` on `wrangler.jsonc:19` with the ID from Step 2.

- [ ] **Step 4: User sets the WORKER_SECRET**

User picks a long random value:
```bash
openssl rand -hex 32
```
Then:
```bash
npx wrangler secret put WORKER_SECRET
```
At the prompt, paste the random value. Save the same value somewhere safe — it will be needed in Step 6.

- [ ] **Step 5: User redeploys**

```bash
npx wrangler deploy
```
Expected: "Deployment complete!" with no warnings about missing bindings.

- [ ] **Step 6: User verifies in admin panel**

Open the deployed admin URL → Storage section → paste the WORKER_SECRET into "Worker API Key" → click Test.
Expected: green "✓ Connected to Cloudflare KV".
If failure: re-check namespace ID matches Step 2, and that secret matches Step 4.

- [ ] **Step 7: Commit wrangler.jsonc change**

```bash
git add wrangler.jsonc
git commit -m "chore: wire BDS_CONTENT KV namespace ID"
```

---

## Task 2: Replace silent localStorage fallback in saveContent()

**Files:**
- Modify: `js/content.js:197-216`

- [ ] **Step 1: Read the current saveContent() implementation**

Confirm the current shape at `js/content.js:197-216` matches what's in the spec (POSTs when `apiKey` set, falls back to `localStorage.setItem` on any failure, always returns `{ ok: true }`).

- [ ] **Step 2: Replace the body of saveContent()**

Replace lines 197–216 with:

```js
async function saveContent(data) {
  const apiKey = localStorage.getItem('bds_api_key');
  if (!apiKey) {
    return { ok: false, error: 'no_api_key' };
  }
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(data)
    });
    if (res.ok) return { ok: true, source: 'kv' };
    if (res.status === 401) return { ok: false, error: 'unauthorized' };
    return { ok: false, error: `http_${res.status}` };
  } catch (_) {
    return { ok: false, error: 'network' };
  }
}
```

- [ ] **Step 3: Manually verify in DevTools console (admin page)**

Open admin.html in the deployed site, open DevTools console.

```js
// Simulate no API key
localStorage.removeItem('bds_api_key');
await saveContent({ test: true });
// Expected: { ok: false, error: 'no_api_key' }

// Simulate bad API key
localStorage.setItem('bds_api_key', 'wrong');
await saveContent({ test: true });
// Expected: { ok: false, error: 'unauthorized' }
```

Restore the real key afterwards.

- [ ] **Step 4: Commit**

```bash
git add js/content.js
git commit -m "fix: saveContent returns ok:false instead of silent localStorage fallback"
```

---

## Task 3: Update Save handler in admin.js to surface failures

**Files:**
- Modify: `js/admin.js:1008-1022`

- [ ] **Step 1: Replace the Save click handler**

Replace lines 1008–1022 with:

```js
document.getElementById('saveBtn').addEventListener('click', async () => {
  if (!pendingContent) pendingContent = await getContent();

  // Flush the currently visible tab's fields
  captureFormIntoContent(adminContentLang, pendingContent);

  // Capture shared (language-neutral) fields
  pendingContent.companyName = get('f-companyName') || DEFAULT_CONTENT.companyName;
  pendingContent.contact     = buildContactFromForm();

  const saveResult = await saveContent(pendingContent); // from content.js
  const saveBtn = document.getElementById('saveBtn');

  if (saveResult.ok) {
    if (saveBtn) saveBtn.textContent = 'KV ✓';
    showToast(T('toast_saved'), 'success');
  } else {
    if (saveBtn) saveBtn.textContent = T('admin_save_btn');
    showToast(T('toast_save_failed'), 'error');
  }

  // Refresh connection-state pill (added in Task 5)
  if (typeof updateConnectionPill === 'function') updateConnectionPill();
});
```

- [ ] **Step 2: Manually verify the failure toast**

In the deployed admin (with KV correctly wired from Task 1):
1. Open DevTools console, run `localStorage.removeItem('bds_api_key')`.
2. Make any change in the admin form, click Save.
3. Expected: red toast "Could not save — check Storage settings (no Worker API Key)." (DE/EN per current language).
4. Restore the API key in the Storage panel and click Test → green status. Click Save again → green toast.

- [ ] **Step 3: Commit**

```bash
git add js/admin.js
git commit -m "feat: show red toast when admin save fails"
```

---

## Task 4: Add i18n strings

**Files:**
- Modify: `js/i18n.js` (DE block ~line 308–315, EN block ~line 640)

- [ ] **Step 1: Add DE strings**

After `js/i18n.js:310` (after `toast_reset`), add:

```js
    toast_save_failed:    'Speichern fehlgeschlagen — Worker-API-Key prüfen (Bereich Storage).',
    kv_pill_connected:    'KV verbunden',
    kv_pill_local_only:   'Nicht verbunden — Speicherungen erreichen keine Besucher',
```

- [ ] **Step 2: Add EN strings**

After `js/i18n.js:641` (after the EN `toast_reset`), add:

```js
    toast_save_failed:    'Save failed — check Worker API Key (Storage section).',
    kv_pill_connected:    'KV connected',
    kv_pill_local_only:   'Not connected — saves won\'t reach visitors',
```

- [ ] **Step 3: Manually verify in DevTools console**

```js
T('toast_save_failed')   // → "Save failed — ..." or DE equivalent
T('kv_pill_connected')   // → "KV connected" or "KV verbunden"
T('kv_pill_local_only')  // → "Not connected — ..." or DE
```

Switch language with the admin DE/EN switcher and re-run; strings should follow the active UI language.

- [ ] **Step 4: Commit**

```bash
git add js/i18n.js
git commit -m "i18n: add save-failed toast and KV pill strings"
```

---

## Task 5: Add the KV connection pill to admin.html

**Files:**
- Modify: `admin.html:54` (insert pill before `resetBtn`)

- [ ] **Step 1: Insert the pill markup**

In `admin.html`, change lines 54–55 from:

```html
        <button id="resetBtn" class="btn-ghost btn-danger" data-i18n="admin_reset_btn">Zurücksetzen</button>
        <button id="saveBtn" class="btn-primary" data-i18n="admin_save_btn">Änderungen speichern</button>
```

to:

```html
        <span id="kvStatusPill" class="kv-pill kv-pill--warn" data-i18n="kv_pill_local_only" hidden>Nicht verbunden — Speicherungen erreichen keine Besucher</span>
        <button id="resetBtn" class="btn-ghost btn-danger" data-i18n="admin_reset_btn">Zurücksetzen</button>
        <button id="saveBtn" class="btn-primary" data-i18n="admin_save_btn">Änderungen speichern</button>
```

The element starts `hidden` so it doesn't flash before the first `updateConnectionPill()` call.

- [ ] **Step 2: Verify markup loads**

Reload admin.html. In DevTools elements panel, confirm the `<span id="kvStatusPill">` exists in `.admin-header-right` and is hidden. No console errors.

- [ ] **Step 3: Commit**

```bash
git add admin.html
git commit -m "feat: add KV connection pill markup to admin header"
```

---

## Task 6: Style the pill

**Files:**
- Modify: `css/admin.css` (insert after `.admin-header-right` block at line 227)

- [ ] **Step 1: Add pill styles**

After line 227 in `css/admin.css`, insert:

```css
.kv-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  white-space: nowrap;
}
.kv-pill::before {
  content: '';
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: currentColor;
}
.kv-pill--ok {
  background: rgba(34, 139, 86, 0.12);
  color: #1f8c4e;
}
.kv-pill--warn {
  background: rgba(212, 130, 30, 0.15);
  color: #b86a14;
}
@media (max-width: 720px) {
  .kv-pill { display: none; } /* save space; toast still surfaces failures */
}
```

- [ ] **Step 2: Manually verify visual**

Reload admin.html. In DevTools, manually unhide:

```js
const p = document.getElementById('kvStatusPill');
p.hidden = false;
p.textContent = 'KV connected';
p.className = 'kv-pill kv-pill--ok';
```

Expected: green pill appears next to the Reset button. Switch className to `kv-pill kv-pill--warn` → amber. Restore `hidden = true` afterwards.

- [ ] **Step 3: Commit**

```bash
git add css/admin.css
git commit -m "feat: style KV connection pill (green/amber states)"
```

---

## Task 7: Wire updateConnectionPill() in admin.js

**Files:**
- Modify: `js/admin.js` (add helper near top of file, ~line 10; call it from `DOMContentLoaded` and after Test/Save)

- [ ] **Step 1: Add the helper function**

Insert near the top of `js/admin.js` (after the `'use strict'` line if present, or near other top-level helpers around line 10):

```js
async function updateConnectionPill() {
  const pill = document.getElementById('kvStatusPill');
  if (!pill) return;
  const apiKey = localStorage.getItem('bds_api_key') || '';
  let connected = false;
  if (apiKey) {
    try {
      const res = await fetch('/api/ping', { headers: { 'Authorization': `Bearer ${apiKey}` } });
      const json = await res.json().catch(() => ({}));
      connected = !!json.ok;
    } catch (_) { connected = false; }
  }
  pill.hidden = false;
  pill.classList.remove('kv-pill--ok', 'kv-pill--warn');
  pill.classList.add(connected ? 'kv-pill--ok' : 'kv-pill--warn');
  const key = connected ? 'kv_pill_connected' : 'kv_pill_local_only';
  pill.setAttribute('data-i18n', key);
  pill.textContent = (typeof T === 'function') ? T(key) : key;
}
```

- [ ] **Step 2: Call on admin load**

In the `DOMContentLoaded` handler at `js/admin.js:1136`, after the existing `if (apiKeyInput) apiKeyInput.value = savedApiKey;` line, add:

```js
  updateConnectionPill();
```

- [ ] **Step 3: Call after the Test button**

In the Test connection handler at `js/admin.js:1191-1209`, add `updateConnectionPill();` as the last line of the handler (after the status text is set).

- [ ] **Step 4: Confirm Save handler already calls it**

Task 3 already added the `updateConnectionPill()` call inside the Save handler. Verify by re-reading `js/admin.js` around line 1022.

- [ ] **Step 5: Manually verify the pill reacts**

In the deployed admin:
1. Reload — pill shows green "KV connected" (assuming Task 1 wired correctly).
2. In DevTools: `localStorage.removeItem('bds_api_key')`, then click Test → pill flips to amber "Not connected".
3. Re-paste the real key in Storage panel, click Test → pill flips back to green.
4. Switch DE/EN — pill text updates on next refresh (acceptable; pill text reflects language at last `updateConnectionPill()` call).

- [ ] **Step 6: Commit**

```bash
git add js/admin.js
git commit -m "feat: KV connection pill polls /api/ping on load and after Test/Save"
```

---

## Task 8: End-to-end verification

**Files:** None (verification only).

- [ ] **Step 1: Cross-browser persistence test**

In Browser A (the admin's browser):
1. Open the deployed admin, log in, verify pill is green.
2. Change a visible field (e.g., hero headline).
3. Click Save → expect green toast.
4. Open DevTools → Network → confirm `POST /api/content` returned 200.

In Browser B (incognito or another device):
1. Open the public site (non-admin URL).
2. Confirm the changed hero headline appears.

This is the test that originally failed and is the whole point of the change.

- [ ] **Step 2: Failure-mode test**

In Browser A:
1. In Storage panel, clear the Worker API Key, click Test → pill goes amber.
2. Change a field, click Save.
3. Expected: red toast "Save failed — check Worker API Key". No silent localStorage write masquerading as success.
4. Restore the key, click Test → pill green again.

- [ ] **Step 3: First-visitor seed test (optional but worth confirming)**

The worker auto-seeds KV from `/content.json` on first GET when KV is empty. To confirm it still works:
1. Wrangler CLI: `npx wrangler kv key delete --binding=BDS_CONTENT bds_content`
2. Reload the public site in an incognito window.
3. Confirm content matches `content.json` defaults.
4. Re-run any admin save to repopulate KV.

- [ ] **Step 4: Final commit (if any tweaks were needed during verification)**

If any fixes were needed during Step 1–3, commit them. Otherwise skip.

```bash
git status   # confirm clean
```

---

## Done criteria

- Admin saves are visible to all visitors after a single reload.
- A failed save (no API key, wrong key, network down) shows a red toast and does NOT write to localStorage.
- The header pill shows green when KV is reachable, amber when not — visible at all times in the admin UI.
- `wrangler.jsonc` no longer contains `REPLACE_WITH_YOUR_KV_NAMESPACE_ID`.
