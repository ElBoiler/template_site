# Design: Port PR #18 & #19 from personal_website → template_site

**Date:** 2026-05-01  
**Scope:** Apply two merged PRs from the sibling project `myinternetface` to `template_site`. Both projects share identical code baseline.

---

## 1. Summary

Two feature groups are being ported:

- **PR #18** — Auto-fetch Worker API key on admin login via a new `/api/session` endpoint  
- **PR #19** — 8 GDPR/DSGVO compliance fixes (self-hosted fonts & Leaflet, legal pages, consent, PBKDF2, footer links, admin editor)

---

## 2. PR #18 — Auto-fetch API key on login

### Problem
After each new browser session the admin must manually paste `WORKER_SECRET` into the Storage panel before saves reach Cloudflare KV.

### Solution
Add `POST /api/session` to the Worker. The login handler calls it first; if the Worker confirms the secret, the returned key is stored in `localStorage('bds_api_key')` and pre-fills the `#f-api-key` input. The existing local SHA-256 fallback is preserved for offline/dev scenarios.

### Files changed
| File | Change |
|------|--------|
| `_worker.js` | Add `POST /api/session` route + `handleSession()` |
| `js/admin.js` | Update login submit handler to call `/api/session`, store key, call `updateConnectionPill()` |

---

## 3. PR #19 — GDPR/DSGVO Compliance

### Fix 1 — Self-host Google Fonts (Critical)
- Create `css/fonts.css` with `@font-face` declarations for Inter + Playfair Display
- Copy 4 WOFF2 files to `fonts/` (latin + latin-ext subsets for each family)
- Remove Google Fonts `<link>` preconnect tags from `index.html`, `about-me.html`, `admin.html`; replace with `<link rel="stylesheet" href="css/fonts.css">`
- **Result:** Zero outgoing connections to Google on page load

### Fix 2 — Self-host Leaflet (High)
- Copy Leaflet 1.9.4 CSS + JS to `vendor/leaflet/`
- Copy 5 marker/layer images to `vendor/leaflet/images/`
- Update `js/main.js` to load from local paths instead of `unpkg.com`
- **Result:** Map section no longer sends visitor IPs to npm's CDN

### Fix 3 — Impressum page (`/impressum`)
- New `impressum.html` — reads all fields from `content.impressum` (via `getContent()`)
- Optional fields (phone, register, USt-ID) auto-hide when blank via `.empty` class
- Static legal boilerplate (§7 TMG, EU dispute resolution, copyright) hardcoded

### Fix 4 — Datenschutzerklärung (`/datenschutz`)
- New `datenschutz.html` — renders `content.datenschutz.body_de` / `body_en` as inner HTML
- Ships with comprehensive default policy (Cloudflare CDN, mailto contact form, OpenStreetMap, localStorage language pref, GDPR rights Art. 15–22)

### Fix 5 — Admin legal pages editor
- Add `📜 Rechtliches` nav item in `admin.html` sidebar
- New `#sec-legal` section with:
  - Impressum: 11 individual input fields
  - Datenschutz: DE textarea + EN textarea + PDF import button
- `loadFormData()` + `captureFormIntoContent()` wired to read/write `content.impressum` and `content.datenschutz`

### Fix 6 — Contact form consent checkbox (High)
- Add `<div class="form-group form-group--consent">` with checkbox + `data-i18n-html="form_consent_label"` above the submit button in `index.html`
- `js/main.js`: block submit if unchecked, show `T('err_consent_required')` in `#consentError`
- `css/styles.css`: add `.form-group--consent`, `.consent-label`, `.footer-legal-links` styles

### Fix 7 — PBKDF2 password hashing (Medium)
- Replace unsalted SHA-256 with PBKDF2-SHA-256 (200,000 iterations, 128-bit random salt, 256-bit key, WebCrypto only — no new deps)
- Stored format: `pbkdf2$<hex-salt>$<hex-key>`
- Auto-migrates legacy SHA-256 hashes and plaintext passwords on next successful login

### Fix 8 — Footer legal links
- `index.html` + `about-me.html`: wrap existing admin link in `<span class="footer-legal-links">` with Impressum + Datenschutz links preceding it
- `impressum.html` + `datenschutz.html`: same footer pattern (minus admin link)

---

## 4. Placeholder values for DEFAULT_CONTENT

All personal references are replaced with generic placeholders:
- Email: `hello@example.com`
- Name/address fields: `[Bitte ausfüllen: ...]` strings
- Company name in Datenschutz policy body: `[Firmenname]`
- Updated date: `Mai 2026`

---

## 5. Files affected

### New files
- `css/fonts.css`
- `fonts/inter-latin.woff2`, `fonts/inter-latin-ext.woff2`
- `fonts/playfair-display-latin.woff2`, `fonts/playfair-display-latin-ext.woff2`
- `vendor/leaflet/leaflet.css`, `vendor/leaflet/leaflet.js`
- `vendor/leaflet/images/` (5 images)
- `impressum.html`
- `datenschutz.html`

### Modified files
- `_worker.js`
- `index.html`
- `about-me.html`
- `admin.html`
- `css/styles.css`
- `js/main.js`
- `js/admin.js`
- `js/content.js`
- `js/i18n.js`

---

## 6. Constraints

- No build step — vanilla JS, no npm
- All binary assets (fonts, Leaflet) copied from the PR branch of personal_website
- No external CDN connections after this change for fonts or maps
- `wrangler.jsonc` and `content.json` untouched — KV namespace already wired

---

## 7. Out of scope

- Changing `wrangler.jsonc` KV namespace (already done in PR #17)
- Any new features beyond what the two PRs implement
- Changing company name / branding in HTML static text (that's content, editable via admin)
