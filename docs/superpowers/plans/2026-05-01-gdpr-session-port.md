# GDPR + Session Auto-Fetch Port Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port PR #18 (auto-fetch Worker API key on login) and PR #19 (8 GDPR/DSGVO compliance fixes) from `ElBoiler/myinternetface` to this `template_site` project.

**Architecture:** Vanilla JS/HTML/CSS project with no build step, deployed to Cloudflare Workers + Pages. Changes are applied directly to source files. Binary assets (WOFF2 fonts, Leaflet) are copied from the PR branch of the sibling `myinternetface` repo.

**Tech Stack:** Vanilla JS, HTML5, CSS3, Cloudflare Workers, WebCrypto API (PBKDF2), Cloudflare KV

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `_worker.js` | Modify | Add `POST /api/session` endpoint |
| `js/admin.js` | Modify | Login handler → session endpoint; SHA-256 → PBKDF2; legal load/save; PDF import |
| `js/i18n.js` | Modify | Add ~35 new translation strings (DE + EN) |
| `js/content.js` | Modify | Add `impressum` + `datenschutz` to DEFAULT_CONTENT |
| `js/main.js` | Modify | Leaflet local paths; consent checkbox validation |
| `index.html` | Modify | fonts.css swap; consent checkbox; footer legal links |
| `about-me.html` | Modify | fonts.css swap; footer legal links |
| `admin.html` | Modify | fonts.css swap; add `#sec-legal` section + nav link |
| `css/styles.css` | Modify | Consent checkbox + footer legal link styles |
| `css/fonts.css` | Create | `@font-face` declarations for self-hosted Inter + Playfair Display |
| `fonts/*.woff2` | Create (4) | Self-hosted font binaries copied from PR branch |
| `vendor/leaflet/leaflet.css` | Create | Self-hosted Leaflet CSS |
| `vendor/leaflet/leaflet.js` | Create | Self-hosted Leaflet JS |
| `vendor/leaflet/images/` | Create (5) | Leaflet marker/layer images |
| `impressum.html` | Create | Impressum legal page (reads from content store) |
| `datenschutz.html` | Create | Datenschutz page (renders HTML from content store) |

---

## Task 1: Copy binary assets from PR branch

**Files:**
- Create: `fonts/inter-latin.woff2`, `fonts/inter-latin-ext.woff2`, `fonts/playfair-display-latin.woff2`, `fonts/playfair-display-latin-ext.woff2`
- Create: `vendor/leaflet/leaflet.css`, `vendor/leaflet/leaflet.js`
- Create: `vendor/leaflet/images/layers.png`, `layers-2x.png`, `marker-icon.png`, `marker-icon-2x.png`, `marker-shadow.png`

- [ ] **Step 1: Check out PR #19 branch in personal_website**

```bash
cd "C:\Users\thoma\Documents\personal\personal_website"
gh pr checkout 19
```

Expected: git switches to the PR branch (e.g. `feat/gdpr-compliance` or similar).

- [ ] **Step 2: Create destination directories in template_site worktree**

```bash
mkdir -p "C:\Users\thoma\Documents\personal\template_site\.claude\worktrees\naughty-faraday-6c62c3\fonts"
mkdir -p "C:\Users\thoma\Documents\personal\template_site\.claude\worktrees\naughty-faraday-6c62c3\vendor\leaflet\images"
```

- [ ] **Step 3: Copy font WOFF2 files**

```bash
cp "C:\Users\thoma\Documents\personal\personal_website\fonts\inter-latin.woff2" \
   "C:\Users\thoma\Documents\personal\template_site\.claude\worktrees\naughty-faraday-6c62c3\fonts\"
cp "C:\Users\thoma\Documents\personal\personal_website\fonts\inter-latin-ext.woff2" \
   "C:\Users\thoma\Documents\personal\template_site\.claude\worktrees\naughty-faraday-6c62c3\fonts\"
cp "C:\Users\thoma\Documents\personal\personal_website\fonts\playfair-display-latin.woff2" \
   "C:\Users\thoma\Documents\personal\template_site\.claude\worktrees\naughty-faraday-6c62c3\fonts\"
cp "C:\Users\thoma\Documents\personal\personal_website\fonts\playfair-display-latin-ext.woff2" \
   "C:\Users\thoma\Documents\personal\template_site\.claude\worktrees\naughty-faraday-6c62c3\fonts\"
```

- [ ] **Step 4: Copy Leaflet files**

```bash
cp "C:\Users\thoma\Documents\personal\personal_website\vendor\leaflet\leaflet.css" \
   "C:\Users\thoma\Documents\personal\template_site\.claude\worktrees\naughty-faraday-6c62c3\vendor\leaflet\"
cp "C:\Users\thoma\Documents\personal\personal_website\vendor\leaflet\leaflet.js" \
   "C:\Users\thoma\Documents\personal\template_site\.claude\worktrees\naughty-faraday-6c62c3\vendor\leaflet\"
cp "C:\Users\thoma\Documents\personal\personal_website\vendor\leaflet\images\layers.png" \
   "C:\Users\thoma\Documents\personal\template_site\.claude\worktrees\naughty-faraday-6c62c3\vendor\leaflet\images\"
cp "C:\Users\thoma\Documents\personal\personal_website\vendor\leaflet\images\layers-2x.png" \
   "C:\Users\thoma\Documents\personal\template_site\.claude\worktrees\naughty-faraday-6c62c3\vendor\leaflet\images\"
cp "C:\Users\thoma\Documents\personal\personal_website\vendor\leaflet\images\marker-icon.png" \
   "C:\Users\thoma\Documents\personal\template_site\.claude\worktrees\naughty-faraday-6c62c3\vendor\leaflet\images\"
cp "C:\Users\thoma\Documents\personal\personal_website\vendor\leaflet\images\marker-icon-2x.png" \
   "C:\Users\thoma\Documents\personal\template_site\.clone\worktrees\naughty-faraday-6c62c3\vendor\leaflet\images\"
cp "C:\Users\thoma\Documents\personal\personal_website\vendor\leaflet\images\marker-shadow.png" \
   "C:\Users\thoma\Documents\personal\template_site\.claude\worktrees\naughty-faraday-6c62c3\vendor\leaflet\images\"
```

- [ ] **Step 5: Return personal_website to main**

```bash
cd "C:\Users\thoma\Documents\personal\personal_website"
git checkout main
```

- [ ] **Step 6: Verify files exist**

```bash
ls "C:\Users\thoma\Documents\personal\template_site\.claude\worktrees\naughty-faraday-6c62c3\fonts"
ls "C:\Users\thoma\Documents\personal\template_site\.claude\worktrees\naughty-faraday-6c62c3\vendor\leaflet\images"
```

Expected: 4 `.woff2` files and 5 `.png` files present.

- [ ] **Step 7: Commit binary assets**

```bash
cd "C:\Users\thoma\Documents\personal\template_site\.claude\worktrees\naughty-faraday-6c62c3"
git add fonts/ vendor/
git commit -m "chore: add self-hosted font WOFF2 files and Leaflet 1.9.4 assets"
```

---

## Task 2: PR #18 — Worker session endpoint

**Files:**
- Modify: `_worker.js`

- [ ] **Step 1: Add `/api/session` route + `handleSession` function to `_worker.js`**

In `_worker.js`, add the route after the `/api/ping` block:

```javascript
    if (url.pathname === '/api/session' && request.method === 'POST') {
      return handleSession(request, env);
    }
```

And add the handler function after `handleGet`:

```javascript
async function handleSession(request, env) {
  let body;
  try { body = await request.json(); } catch (_) {
    return jsonRes({ error: 'Bad Request' }, 400);
  }
  if (!body || body.secret !== env.WORKER_SECRET) {
    return jsonRes({ ok: false, error: 'Unauthorized' }, 401);
  }
  return jsonRes({ ok: true, key: env.WORKER_SECRET });
}
```

Also update the JSDoc comment block at the top to add the new route:
```
 *   POST /api/session  → verify secret in body, return key for auto-population in admin UI
```

- [ ] **Step 2: Commit**

```bash
cd "C:\Users\thoma\Documents\personal\template_site\.claude\worktrees\naughty-faraday-6c62c3"
git add _worker.js
git commit -m "feat: add POST /api/session endpoint for admin auto-key-fetch"
```

---

## Task 3: PR #18 — Admin login auto-fetch

**Files:**
- Modify: `js/admin.js` (login handler at line 112)

- [ ] **Step 1: Replace the login handler**

Find this block in `js/admin.js` (around line 112–126):

```javascript
  if (await checkPassword(entered)) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
    errorEl.textContent = '';
    showPanel();
  } else {
    errorEl.textContent = T('toast_wrong_pw');
    document.getElementById('passwordInput').value = '';
    document.getElementById('passwordInput').focus();
  }
```

Replace it with:

```javascript
  // Try Worker session endpoint first — verifies the secret and returns the API key
  let authed = false;
  try {
    const res = await fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: entered })
    });
    if (res.ok) {
      const json = await res.json();
      if (json.ok && json.key) {
        localStorage.setItem('bds_api_key', json.key);
        const apiKeyInput = document.getElementById('f-api-key');
        if (apiKeyInput) apiKeyInput.value = json.key;
        authed = true;
      }
    }
  } catch (_) { /* offline / local dev — fall through to local check */ }

  // Fallback: local password hash check (file://, dev server, Worker unreachable)
  if (!authed) {
    authed = await checkPassword(entered);
  }

  if (authed) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
    errorEl.textContent = '';
    showPanel();
    updateConnectionPill();
  } else {
    errorEl.textContent = T('toast_wrong_pw');
    document.getElementById('passwordInput').value = '';
    document.getElementById('passwordInput').focus();
  }
```

- [ ] **Step 2: Commit**

```bash
git add js/admin.js
git commit -m "feat: auto-fetch Worker API key on admin login via /api/session"
```

---

## Task 4: Replace SHA-256 with PBKDF2 in admin.js

**Files:**
- Modify: `js/admin.js` (lines 45–82 — auth section)

- [ ] **Step 1: Replace the entire AUTH section**

Find and replace the block from the `/* AUTH … */` comment (line 45) through the closing `}` of `checkPassword` (line 82):

Replace everything from:
```javascript
/* ============================================================
   AUTH — passwords are stored as SHA-256 hashes, never plaintext
   ============================================================ */

/** Returns a hex SHA-256 digest of the given string. */
async function hashPassword(password) {
```

Through to (and including):
```javascript
  // Legacy plaintext — migrate to hash on successful login
  if (entered === stored) {
    localStorage.setItem(ADMIN_PW_KEY, enteredHash);
    return true;
  }
  return false;
}
```

With:

```javascript
/* ============================================================
   AUTH — PBKDF2 with random 128-bit salt (WebCrypto, no deps)
   Stored format: "pbkdf2$<hex-salt>$<hex-derived-key>"
   Legacy SHA-256 hashes (64-char hex) are migrated on first login.
   ============================================================ */

const PBKDF2_ITERATIONS = 200_000;
const PBKDF2_KEY_BITS   = 256;

/** Derive a PBKDF2 key from password + salt (Uint8Array). Returns hex string. */
async function pbkdf2Derive(password, salt) {
  const enc     = new TextEncoder();
  const keyMat  = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits    = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: PBKDF2_ITERATIONS },
    keyMat, PBKDF2_KEY_BITS
  );
  return Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex) {
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < arr.length; i++) arr[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return arr;
}

/** Hash a password for storage. Returns "pbkdf2$<salt-hex>$<key-hex>". */
async function hashPassword(password) {
  const salt    = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const keyHex  = await pbkdf2Derive(password, salt);
  return `pbkdf2$${saltHex}$${keyHex}`;
}

/**
 * Verifies an entered password against storage.
 *   1. Nothing stored → compare against DEFAULT_ADMIN_PW
 *   2. Modern "pbkdf2$salt$key" format → PBKDF2 verify
 *   3. Legacy 64-char SHA-256 hex → SHA-256 compare, migrate to PBKDF2 on success
 *   4. Legacy plaintext → compare directly, migrate to PBKDF2 on success
 */
async function checkPassword(entered) {
  const stored = localStorage.getItem(ADMIN_PW_KEY);

  // Nothing stored — first login, check against default
  if (!stored) {
    const match = (entered === DEFAULT_ADMIN_PW);
    if (match) {
      localStorage.setItem(ADMIN_PW_KEY, await hashPassword(entered));
    }
    return match;
  }

  // Modern PBKDF2 format
  if (stored.startsWith('pbkdf2$')) {
    const [, saltHex, storedKey] = stored.split('$');
    const derived = await pbkdf2Derive(entered, hexToBytes(saltHex));
    return derived === storedKey;
  }

  // Legacy unsalted SHA-256 (64-char hex) — migrate on success
  if (/^[0-9a-f]{64}$/.test(stored)) {
    const enc  = new TextEncoder();
    const buf  = await crypto.subtle.digest('SHA-256', enc.encode(entered));
    const hex  = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    if (hex === stored) {
      localStorage.setItem(ADMIN_PW_KEY, await hashPassword(entered));
      return true;
    }
    return false;
  }

  // Legacy plaintext — migrate on success
  if (entered === stored) {
    localStorage.setItem(ADMIN_PW_KEY, await hashPassword(entered));
    return true;
  }
  return false;
}
```

- [ ] **Step 2: Commit**

```bash
git add js/admin.js
git commit -m "feat: replace SHA-256 with PBKDF2 password hashing (200k iter, random salt)"
```

---

## Task 5: Add new i18n translation strings

**Files:**
- Modify: `js/i18n.js`

- [ ] **Step 1: Add DE translations after storage import line**

Find in the `de` block (after line 436, after `sec_storage_import: '⬆ Importieren',`):

```javascript
    sec_storage_import:        '⬆ Importieren',

    /* ── About-me page
```

Replace with:

```javascript
    sec_storage_import:        '⬆ Importieren',

    /* ── Legal pages admin ──────────────────────────────── */
    admin_nav_legal:        '📜 Rechtliches',
    sec_legal_h2:           'Impressum & Datenschutz',
    sec_legal_desc:         'Pflichtangaben gemäß TMG §5 und DSGVO Art. 13/14. Inhalte erscheinen auf /impressum und /datenschutz.',
    sec_imp_h3:             'Impressum',
    sec_imp_name:           'Name / Firmenname',
    sec_imp_strasse:        'Straße und Hausnummer',
    sec_imp_ort:            'Postleitzahl und Ort',
    sec_imp_land:           'Land',
    sec_imp_email:          'E-Mail (Kontakt)',
    sec_imp_telefon:        'Telefon (optional)',
    sec_imp_vertreter:      'Vertretungsberechtigte Person',
    sec_imp_ustid:          'USt-ID (optional)',
    sec_imp_register:       'Handelsregistereintrag (optional)',
    sec_imp_verantwortlich: 'Inhaltlich Verantwortlicher (§ 55 Abs. 2 RStV)',
    sec_legal_updated:      'Letzte Aktualisierung',
    sec_ds_h3:              'Datenschutzerklärung',
    sec_ds_desc:            'HTML-Inhalt der Datenschutzerklärung. Text eingeben oder per PDF importieren.',
    sec_ds_pdf_lbl:         'PDF importieren',
    sec_ds_pdf_hint:        'Text wird aus der PDF extrahiert und in das Textfeld unten eingefügt.',
    sec_ds_pdf_btn:         'PDF auswählen …',
    sec_ds_pdf_reading:     'PDF wird gelesen …',
    sec_ds_pdf_ok:          '{n} Zeichen extrahiert. Bitte Text überprüfen.',
    sec_ds_pdf_fail:        'Kein Text extrahierbar. Bitte manuell einfügen.',
    sec_ds_body_de:         'Inhalt (Deutsch) — HTML',
    sec_ds_body_en:         'Inhalt (Englisch) — HTML (optional)',

    /* ── Contact form consent ───────────────────────────── */
    form_consent_label:     'Ich habe die <a href="/datenschutz">Datenschutzerklärung</a> gelesen und bin damit einverstanden, dass meine Angaben zur Kontaktaufnahme verarbeitet werden.',
    err_consent_required:   'Bitte stimmen Sie der Datenschutzerklärung zu, um fortzufahren.',

    /* ── Footer legal links ─────────────────────────────── */
    footer_impressum:       'Impressum',
    footer_datenschutz:     'Datenschutz',

    /* ── About-me page
```

- [ ] **Step 2: Add EN translations**

In the `en` block, find (should be around line 800 area — use grep to locate):
```javascript
    sec_storage_import:        '⬆ Export',

    /* ── About-me page
```

Wait — in the EN block the storage import key is `'⬆ Export'` (it says Export in EN too based on the diff showing `sec_storage_export: '⬇ Export'`). Find the correct anchor by searching for the last storage key before the About-me comment in EN:

```javascript
    sec_storage_import:        '⬆ Import',

    /* ── About-me page
```

Replace with:

```javascript
    sec_storage_import:        '⬆ Import',

    /* ── Legal pages admin ──────────────────────────────── */
    admin_nav_legal:        '📜 Legal',
    sec_legal_h2:           'Impressum & Privacy Policy',
    sec_legal_desc:         'Required disclosures under TMG §5 and GDPR Art. 13/14. Content appears on /impressum and /datenschutz.',
    sec_imp_h3:             'Impressum (Legal Notice)',
    sec_imp_name:           'Name / Company name',
    sec_imp_strasse:        'Street and house number',
    sec_imp_ort:            'Postcode and city',
    sec_imp_land:           'Country',
    sec_imp_email:          'Email (contact)',
    sec_imp_telefon:        'Phone (optional)',
    sec_imp_vertreter:      'Authorised representative',
    sec_imp_ustid:          'VAT ID (optional)',
    sec_imp_register:       'Trade register entry (optional)',
    sec_imp_verantwortlich: 'Editorial responsible (§ 55 para. 2 RStV)',
    sec_legal_updated:      'Last updated',
    sec_ds_h3:              'Privacy Policy (Datenschutzerklärung)',
    sec_ds_desc:            'HTML content of the privacy policy. Type directly or import from a PDF.',
    sec_ds_pdf_lbl:         'Import from PDF',
    sec_ds_pdf_hint:        'Text is extracted from the PDF and inserted into the field below.',
    sec_ds_pdf_btn:         'Select PDF …',
    sec_ds_pdf_reading:     'Reading PDF …',
    sec_ds_pdf_ok:          '{n} characters extracted. Please review the text.',
    sec_ds_pdf_fail:        'No text could be extracted. Please paste manually.',
    sec_ds_body_de:         'Content (German) — HTML',
    sec_ds_body_en:         'Content (English) — HTML (optional)',

    /* ── Contact form consent ───────────────────────────── */
    form_consent_label:     'I have read the <a href="/datenschutz">Privacy Policy</a> and agree that my details may be used to respond to my enquiry.',
    err_consent_required:   'Please accept the privacy policy to continue.',

    /* ── Footer legal links ─────────────────────────────── */
    footer_impressum:       'Legal Notice',
    footer_datenschutz:     'Privacy Policy',

    /* ── About-me page
```

- [ ] **Step 3: Commit**

```bash
git add js/i18n.js
git commit -m "feat: add i18n strings for legal pages, consent checkbox, and footer links"
```

---

## Task 6: Add impressum + datenschutz to DEFAULT_CONTENT

**Files:**
- Modify: `js/content.js`

- [ ] **Step 1: Add legal content blocks after the last `en` block closing brace**

In `js/content.js`, find the closing of the `en` language block (around line 167):

```javascript
    seo:          { title: '', description: '' },
  }
};
```

Replace with:

```javascript
    seo:          { title: '', description: '' },
  },

  /* ── Impressum (language-neutral legal data) ─────────────── */
  impressum: {
    anbieter_name:    '[Bitte ausfüllen: vollständiger Name oder Firmenname]',
    anbieter_strasse: '[Bitte ausfüllen: Straße und Hausnummer]',
    anbieter_ort:     '[Bitte ausfüllen: Postleitzahl und Ort]',
    anbieter_land:    '[Bitte ausfüllen: Land]',
    kontakt_email:    'hello@example.com',
    kontakt_telefon:  '',
    vertreter:        '',
    registereintrag:  '',
    ustid:            '',
    verantwortlich:   '',
    updated:          'Mai 2026'
  },

  /* ── Datenschutzerklärung body text (HTML, per language) ─── */
  datenschutz: {
    body_de: [
      '<h2>1. Verantwortlicher</h2>',
      '<p>Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) und anderer nationaler Datenschutzgesetze ist:</p>',
      '<p>[Bitte ausfüllen: vollständiger Name]<br>[Bitte ausfüllen: Adresse]<br>',
      'E-Mail: <a href="mailto:hello@example.com">hello@example.com</a></p>',

      '<h2>2. Welche Daten werden verarbeitet und warum?</h2>',

      '<h3>2.1 Serverlog-Daten / IP-Adressen</h3>',
      '<p>Bei jedem Aufruf unserer Website überträgt Ihr Browser automatisch Daten an unsere Infrastruktur. ',
      'Diese Seite wird über das Netzwerk von <strong>Cloudflare, Inc.</strong> (101 Townsend St, San Francisco, CA 94107, USA) ausgeliefert. ',
      'Cloudflare verarbeitet dabei Ihre IP-Adresse sowie technische Anfrage-Metadaten (Browser-Typ, Betriebssystem, Datum und Uhrzeit des Abrufs, aufgerufene URL). ',
      'Dies ist technisch notwendig, um die Website zu Ihrem Browser zu übertragen.</p>',
      '<p>Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der sicheren und zuverlässigen Auslieferung der Website).</p>',
      '<p>Wir haben mit Cloudflare einen Auftragsverarbeitungsvertrag gemäß Art. 28 DSGVO geschlossen. Cloudflares Datenschutzrichtlinie finden Sie unter <a href="https://www.cloudflare.com/de-de/privacypolicy/" target="_blank" rel="noopener noreferrer">cloudflare.com/privacypolicy</a>.</p>',

      '<h3>2.2 Spracheinstellung</h3>',
      '<p>Unsere Website speichert Ihre Sprachpräferenz (Deutsch / Englisch) im <strong>localStorage</strong> Ihres Browsers unter dem Schlüssel <code>bds_lang</code>. ',
      'Dieser Wert verlässt Ihren Browser nicht und wird ausschließlich verwendet, um die gewählte Sprache beim nächsten Besuch beizubehalten. ',
      'Es werden keine Cookies gesetzt.</p>',
      '<p>Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an nutzerfreundlicher Bedienung).</p>',

      '<h3>2.3 Kontaktformular</h3>',
      '<p>Unser Kontaktformular (Name, E-Mail-Adresse, Betreff, Nachricht) wird ausschließlich lokal in Ihrem Browser verarbeitet. ',
      'Bei Absenden öffnet das Formular Ihr lokales E-Mail-Programm via <code>mailto:</code>-Link. ',
      'Die eingegebenen Daten werden <strong>nicht</strong> auf unseren Servern gespeichert und <strong>nicht</strong> von uns übertragen. ',
      'Die anschließende E-Mail-Kommunikation unterliegt dem Datenschutzrecht Ihres E-Mail-Anbieters.</p>',
      '<p>Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen) bzw. Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).</p>',

      '<h3>2.4 Kartenansicht / OpenStreetMap</h3>',
      '<p>Falls unser Standorte-Bereich auf der Website aktiv ist und Sie diesen aufrufen, werden Kartenkacheln vom Server der <strong>OpenStreetMap Foundation</strong> geladen. ',
      'Dabei wird Ihre IP-Adresse an <code>tile.openstreetmap.org</code> übertragen. ',
      'OpenStreetMap ist ein nichtkommerzieller, gemeinnütziger Dienst. Die Datenschutzrichtlinie finden Sie unter ',
      '<a href="https://wiki.openstreetmap.org/wiki/Privacy_Policy" target="_blank" rel="noopener noreferrer">wiki.openstreetmap.org/wiki/Privacy_Policy</a>.</p>',
      '<p>Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO.</p>',

      '<h2>3. Cookies</h2>',
      '<p>Wir setzen <strong>keine Cookies</strong>. Die unter 2.2 genannte Sprachpräferenz wird im localStorage gespeichert, nicht in einem Cookie.</p>',

      '<h2>4. Tracking und Analyse</h2>',
      '<p>Wir verwenden <strong>keine</strong> Analyse-, Tracking- oder Remarketing-Werkzeuge (weder Google Analytics, Matomo, noch andere Dienste).</p>',

      '<h2>5. Speicherdauer</h2>',
      '<p>Die unter 2.2 beschriebenen localStorage-Daten bleiben bis zur manuellen Löschung in Ihrem Browser gespeichert. Sie können diese jederzeit über die Entwicklertools Ihres Browsers löschen.</p>',
      '<p>Cloudflare-Logdaten werden gemäß den Aufbewahrungsfristen von Cloudflare gespeichert (in der Regel maximal 30 Tage).</p>',

      '<h2>6. Ihre Rechte</h2>',
      '<p>Sie haben gegenüber uns folgende Rechte hinsichtlich der Sie betreffenden personenbezogenen Daten:</p>',
      '<ul>',
      '<li><strong>Auskunftsrecht</strong> (Art. 15 DSGVO)</li>',
      '<li><strong>Recht auf Berichtigung</strong> (Art. 16 DSGVO)</li>',
      '<li><strong>Recht auf Löschung</strong> (Art. 17 DSGVO)</li>',
      '<li><strong>Recht auf Einschränkung der Verarbeitung</strong> (Art. 18 DSGVO)</li>',
      '<li><strong>Recht auf Datenübertragbarkeit</strong> (Art. 20 DSGVO)</li>',
      '<li><strong>Widerspruchsrecht</strong> (Art. 21 DSGVO)</li>',
      '<li><strong>Recht auf Widerruf einer Einwilligung</strong> (Art. 7 Abs. 3 DSGVO)</li>',
      '</ul>',
      '<p>Da wir keine personenbezogenen Daten auf unseren Servern speichern, wird eine Auskunftsanfrage in der Regel mit dem Hinweis beantwortet, dass keine Daten vorliegen. ',
      'Anfragen richten Sie bitte an: <a href="mailto:hello@example.com">hello@example.com</a>. Wir antworten innerhalb von 30 Tagen.</p>',

      '<h2>7. Beschwerderecht</h2>',
      '<p>Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung Ihrer personenbezogenen Daten zu beschweren. ',
      'Zuständig ist die Behörde am Ort Ihres gewöhnlichen Aufenthalts, Ihres Arbeitsplatzes oder des Orts des mutmaßlichen Verstoßes.</p>',

      '<h2>8. Änderungen dieser Datenschutzerklärung</h2>',
      '<p>Wir behalten uns vor, diese Datenschutzerklärung zu aktualisieren, um sie an geänderte Rechtslagen oder bei Änderungen des Dienstes anzupassen. ',
      'Die jeweils aktuelle Fassung finden Sie auf dieser Seite.</p>'
    ].join(''),

    body_en: [
      '<h2>1. Data Controller</h2>',
      '<p>The data controller within the meaning of the General Data Protection Regulation (GDPR) is:</p>',
      '<p>[Please fill in: full name]<br>[Please fill in: address]<br>',
      'Email: <a href="mailto:hello@example.com">hello@example.com</a></p>',

      '<h2>2. What data is processed and why?</h2>',

      '<h3>2.1 Server log data / IP addresses</h3>',
      '<p>Each time you visit our website your browser automatically transmits data to our infrastructure. ',
      'This site is delivered via the network of <strong>Cloudflare, Inc.</strong> (101 Townsend St, San Francisco, CA 94107, USA). ',
      'Cloudflare processes your IP address and technical request metadata (browser type, OS, date and time of request, URL accessed). ',
      'This is technically necessary to deliver the website to your browser.</p>',
      '<p>Legal basis: Art. 6(1)(f) GDPR (legitimate interest in secure and reliable website delivery).</p>',
      '<p>We have entered into a data processing agreement with Cloudflare pursuant to Art. 28 GDPR. ',
      "Cloudflare's privacy policy is available at <a href=\"https://www.cloudflare.com/privacypolicy/\" target=\"_blank\" rel=\"noopener noreferrer\">cloudflare.com/privacypolicy</a>.</p>",

      '<h3>2.2 Language preference</h3>',
      '<p>Our website stores your language preference (German / English) in your browser\'s <strong>localStorage</strong> under the key <code>bds_lang</code>. ',
      'This value never leaves your browser and is used solely to remember your language choice on your next visit. ',
      'No cookies are set.</p>',
      '<p>Legal basis: Art. 6(1)(f) GDPR (legitimate interest in user-friendly operation).</p>',

      '<h3>2.3 Contact form</h3>',
      '<p>Our contact form (name, email address, subject, message) is processed exclusively in your browser. ',
      'When you submit the form, it opens your local email client via a <code>mailto:</code> link. ',
      'The data entered is <strong>not</strong> stored on our servers and is <strong>not</strong> transmitted by us. ',
      "Subsequent email communication is subject to your email provider's privacy policy.</p>",
      '<p>Legal basis: Art. 6(1)(b) GDPR (pre-contractual measures) or Art. 6(1)(a) GDPR (consent).</p>',

      '<h3>2.4 Map / OpenStreetMap</h3>',
      '<p>If our Locations section is active and you scroll to it, map tiles are loaded from the <strong>OpenStreetMap Foundation</strong> servers. ',
      'Your IP address is transmitted to <code>tile.openstreetmap.org</code>. ',
      'OpenStreetMap is a non-commercial, non-profit service. Their privacy policy is available at ',
      '<a href="https://wiki.openstreetmap.org/wiki/Privacy_Policy" target="_blank" rel="noopener noreferrer">wiki.openstreetmap.org/wiki/Privacy_Policy</a>.</p>',
      '<p>Legal basis: Art. 6(1)(f) GDPR.</p>',

      '<h2>3. Cookies</h2>',
      '<p>We set <strong>no cookies</strong>. The language preference mentioned in 2.2 is stored in localStorage, not a cookie.</p>',

      '<h2>4. Tracking and analytics</h2>',
      '<p>We use <strong>no</strong> analytics, tracking, or remarketing tools (no Google Analytics, Matomo, or similar services).</p>',

      '<h2>5. Retention periods</h2>',
      '<p>The localStorage data described in 2.2 remains stored in your browser until manually deleted. You can delete it at any time via your browser\'s developer tools.</p>',
      '<p>Cloudflare log data is stored in accordance with Cloudflare\'s retention periods (typically up to 30 days).</p>',

      '<h2>6. Your rights</h2>',
      '<p>You have the following rights with regard to your personal data:</p>',
      '<ul>',
      '<li><strong>Right of access</strong> (Art. 15 GDPR)</li>',
      '<li><strong>Right to rectification</strong> (Art. 16 GDPR)</li>',
      '<li><strong>Right to erasure</strong> (Art. 17 GDPR)</li>',
      '<li><strong>Right to restriction of processing</strong> (Art. 18 GDPR)</li>',
      '<li><strong>Right to data portability</strong> (Art. 20 GDPR)</li>',
      '<li><strong>Right to object</strong> (Art. 21 GDPR)</li>',
      '<li><strong>Right to withdraw consent</strong> (Art. 7(3) GDPR)</li>',
      '</ul>',
      '<p>Since we do not store personal data on our servers, an access request will typically be answered by confirming no data is held. ',
      'Please direct requests to: <a href="mailto:hello@example.com">hello@example.com</a>. We will respond within 30 days.</p>',

      '<h2>7. Right to lodge a complaint</h2>',
      '<p>You have the right to lodge a complaint with a supervisory authority if you believe the processing of your personal data violates the GDPR. ',
      'The competent authority is that of your habitual residence, place of work, or the location of the alleged infringement.</p>',

      '<h2>8. Changes to this privacy policy</h2>',
      '<p>We reserve the right to update this privacy policy to reflect changes in legal requirements or our services. ',
      'The current version is always available on this page.</p>'
    ].join(''),

    updated: 'Mai 2026'
  }
};
```

- [ ] **Step 2: Commit**

```bash
git add js/content.js
git commit -m "feat: add impressum and datenschutz blocks to DEFAULT_CONTENT (generic placeholders)"
```

---

## Task 7: Create css/fonts.css and swap Google Fonts links

**Files:**
- Create: `css/fonts.css`
- Modify: `index.html`, `about-me.html`, `admin.html`

- [ ] **Step 1: Create `css/fonts.css`**

```css
/* ============================================================
   Self-hosted webfonts — no external CDN connections.
   Files are served from /fonts/ alongside this stylesheet.
   GDPR: eliminates IP transmission to Google on every page load.
   ============================================================ */

/* ── Inter (variable, latin-ext subset) ──────────────────── */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 300 800;
  font-display: swap;
  src: url('../fonts/inter-latin-ext.woff2') format('woff2');
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF,
                 U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF,
                 U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
/* ── Inter (variable, latin subset) ─────────────────────── */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 300 800;
  font-display: swap;
  src: url('../fonts/inter-latin.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
                 U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122,
                 U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* ── Playfair Display (variable, latin-ext subset) ───────── */
@font-face {
  font-family: 'Playfair Display';
  font-style: normal;
  font-weight: 700 800;
  font-display: swap;
  src: url('../fonts/playfair-display-latin-ext.woff2') format('woff2');
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF,
                 U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF,
                 U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
/* ── Playfair Display (variable, latin subset) ───────────── */
@font-face {
  font-family: 'Playfair Display';
  font-style: normal;
  font-weight: 700 800;
  font-display: swap;
  src: url('../fonts/playfair-display-latin.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
                 U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122,
                 U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
```

- [ ] **Step 2: Update `index.html` — swap Google Fonts for fonts.css**

Replace in `index.html` `<head>`:
```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet">
```
With:
```html
  <link rel="stylesheet" href="css/fonts.css">
```

- [ ] **Step 3: Update `about-me.html` — swap Google Fonts for fonts.css**

Replace in `about-me.html` `<head>`:
```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet">
```
With:
```html
  <link rel="stylesheet" href="css/fonts.css">
```

- [ ] **Step 4: Update `admin.html` — swap Google Fonts for fonts.css**

Replace in `admin.html` `<head>`:
```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```
With:
```html
  <link rel="stylesheet" href="css/fonts.css">
```

- [ ] **Step 5: Commit**

```bash
git add css/fonts.css index.html about-me.html admin.html
git commit -m "feat: self-host Inter and Playfair Display fonts, remove Google Fonts CDN"
```

---

## Task 8: Self-host Leaflet (update main.js)

**Files:**
- Modify: `js/main.js`

- [ ] **Step 1: Replace unpkg Leaflet URLs with local paths**

In `js/main.js`, find:
```javascript
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
```
Replace with:
```javascript
      link.href = 'vendor/leaflet/leaflet.css';
```

Find:
```javascript
      s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
```
Replace with:
```javascript
      s.src = 'vendor/leaflet/leaflet.js';
```

- [ ] **Step 2: Commit**

```bash
git add js/main.js
git commit -m "feat: load Leaflet from self-hosted vendor/leaflet/ instead of unpkg CDN"
```

---

## Task 9: Create `impressum.html`

**Files:**
- Create: `impressum.html`

- [ ] **Step 1: Create the file**

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Impressum">
  <title>Impressum</title>
  <meta name="robots" content="noindex, follow">
  <link rel="stylesheet" href="css/fonts.css">
  <link rel="stylesheet" href="css/styles.css">
  <style>
    .legal-page { max-width: 760px; margin: 0 auto; padding: 6rem 1.5rem 4rem; }
    .legal-page h1 { margin-bottom: 0.5rem; }
    .legal-page h2 { margin-top: 2.5rem; margin-bottom: 0.75rem; font-size: 1.2rem; }
    .legal-page p, .legal-page address { margin-bottom: 1rem; font-style: normal; line-height: 1.7; }
    .legal-page a { color: var(--color-primary); }
    [data-imp].empty { display: none; }
  </style>
</head>
<body>

  <nav class="navbar scrolled" id="navbar">
    <div class="container nav-container">
      <a href="/" class="nav-logo">Boyle <span>Digital</span> Services</a>
      <ul class="nav-links" id="navLinks">
        <li><a href="/#about">Über uns</a></li>
        <li><a href="/#services">Leistungen</a></li>
        <li><a href="/#contact" class="nav-cta">Kontakt</a></li>
      </ul>
      <button class="hamburger" id="hamburger" aria-label="Navigation ein-/ausblenden" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>

  <div class="mobile-menu" id="mobileMenu" role="dialog" aria-label="Mobile Navigation">
    <a href="/">Startseite</a>
    <a href="/#about">Über uns</a>
    <a href="/#services">Leistungen</a>
    <a href="/#contact">Kontakt</a>
  </div>

  <main class="legal-page">
    <p class="section-eyebrow">Rechtliche Informationen</p>
    <h1>Impressum</h1>
    <p>Angaben gemäß § 5 Telemediengesetz (TMG) und § 55 Rundfunkstaatsvertrag (RStV).</p>

    <h2>Angaben zum Diensteanbieter</h2>
    <address>
      <strong data-imp="anbieter_name"></strong><br>
      <span data-imp="anbieter_strasse"></span><br>
      <span data-imp="anbieter_ort"></span><br>
      <span data-imp="anbieter_land"></span>
    </address>

    <h2>Kontakt</h2>
    <address>
      E-Mail: <a id="imp-email" href="#" data-imp="kontakt_email"></a><br>
      <span id="imp-phone-row">Telefon: <span data-imp="kontakt_telefon"></span></span>
    </address>

    <h2>Vertretungsberechtigte Person</h2>
    <p data-imp="vertreter"></p>

    <h2 id="imp-register-heading">Handelsregister (sofern zutreffend)</h2>
    <p id="imp-register-row" data-imp="registereintrag"></p>

    <h2 id="imp-ustid-heading">Umsatzsteuer-ID (sofern vorhanden)</h2>
    <p id="imp-ustid-row">
      Gemäß § 27a Umsatzsteuergesetz: <span data-imp="ustid"></span>
    </p>

    <h2>Verantwortlicher für den Inhalt gemäß § 55 Abs. 2 RStV</h2>
    <p data-imp="verantwortlich"></p>

    <h2>EU-Streitschlichtung</h2>
    <p>
      Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
      <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">
        https://ec.europa.eu/consumers/odr/
      </a>.
    </p>

    <h2>Verbraucherstreitbeilegung / Universalschlichtungsstelle</h2>
    <p>
      Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
      Verbraucherschlichtungsstelle teilzunehmen.
    </p>

    <h2>Haftung für Inhalte</h2>
    <p>
      Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den
      allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht
      verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen
      zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
    </p>

    <h2>Haftung für Links</h2>
    <p>
      Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss
      haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber
      verantwortlich.
    </p>

    <h2>Urheberrecht</h2>
    <p>
      Die durch die Seitenbetreiber erstellten Inhalte und Werke unterliegen dem deutschen Urheberrecht.
      Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen
      des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors.
    </p>

    <p style="margin-top: 3rem; font-size: 0.875rem; color: var(--color-text-muted);">
      Zuletzt aktualisiert: <span data-imp="updated"></span>
    </p>
  </main>

  <footer class="footer">
    <div class="container">
      <div class="footer-bottom">
        <p>© 2026 Boyle Digital Services. Alle Rechte vorbehalten.</p>
        <span class="footer-legal-links">
          <a href="/impressum">Impressum</a>
          <a href="/datenschutz">Datenschutz</a>
        </span>
      </div>
    </div>
  </footer>

  <script src="js/i18n.js"></script>
  <script src="js/content.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', async () => {
      const hamburger  = document.getElementById('hamburger');
      const mobileMenu = document.getElementById('mobileMenu');
      const toggle = () => {
        const open = mobileMenu.classList.toggle('open');
        hamburger.classList.toggle('active', open);
        hamburger.setAttribute('aria-expanded', String(open));
        document.body.style.overflow = open ? 'hidden' : '';
      };
      hamburger.addEventListener('click', toggle);
      mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }));
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) toggle();
      });

      const content = await getContent();
      const imp = content.impressum || {};

      document.querySelectorAll('[data-imp]').forEach(el => {
        const key = el.getAttribute('data-imp');
        const val = (imp[key] || '').trim();
        el.textContent = val;
        if (!val) el.classList.add('empty');
      });

      const emailEl = document.getElementById('imp-email');
      if (emailEl && imp.kontakt_email) {
        emailEl.href = 'mailto:' + imp.kontakt_email;
      }

      if (!imp.kontakt_telefon) document.getElementById('imp-phone-row').style.display = 'none';
      if (!imp.registereintrag) {
        document.getElementById('imp-register-heading').style.display = 'none';
        document.getElementById('imp-register-row').style.display    = 'none';
      }
      if (!imp.ustid) {
        document.getElementById('imp-ustid-heading').style.display = 'none';
        document.getElementById('imp-ustid-row').style.display    = 'none';
      }

      const nameEl = document.querySelector('.nav-logo');
      if (nameEl && content.companyName) {
        const parts = content.companyName.split(' ');
        if (parts.length > 1) {
          nameEl.innerHTML = parts[0] + ' <span>' + parts[1] + '</span>' +
            (parts.slice(2).length ? ' ' + parts.slice(2).join(' ') : '');
        }
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add impressum.html
git commit -m "feat: add Impressum legal page (/impressum) — reads from content store"
```

---

## Task 10: Create `datenschutz.html`

**Files:**
- Create: `datenschutz.html`

- [ ] **Step 1: Create the file**

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Datenschutzerklärung">
  <title>Datenschutzerklärung</title>
  <meta name="robots" content="noindex, follow">
  <link rel="stylesheet" href="css/fonts.css">
  <link rel="stylesheet" href="css/styles.css">
  <style>
    .legal-page { max-width: 760px; margin: 0 auto; padding: 6rem 1.5rem 4rem; }
    .legal-page h1 { margin-bottom: 0.5rem; }
    .legal-page h2 { margin-top: 2.5rem; margin-bottom: 0.75rem; font-size: 1.25rem; }
    .legal-page h3 { margin-top: 1.5rem; margin-bottom: 0.5rem; font-size: 1rem; }
    .legal-page p, .legal-page ul { margin-bottom: 1rem; line-height: 1.7; }
    .legal-page ul { padding-left: 1.5rem; }
    .legal-page li { margin-bottom: 0.35rem; }
    .legal-page a { color: var(--color-primary); }
    .legal-page code { background: var(--color-surface, #f4f4f5); padding: 0.1em 0.4em; border-radius: 3px; font-size: 0.9em; }
    #ds-body h2, #ds-body h3 { color: var(--color-heading, inherit); }
  </style>
</head>
<body>

  <nav class="navbar scrolled" id="navbar">
    <div class="container nav-container">
      <a href="/" class="nav-logo">Boyle <span>Digital</span> Services</a>
      <ul class="nav-links" id="navLinks">
        <li><a href="/#about">Über uns</a></li>
        <li><a href="/#services">Leistungen</a></li>
        <li><a href="/#contact" class="nav-cta">Kontakt</a></li>
      </ul>
      <button class="hamburger" id="hamburger" aria-label="Navigation ein-/ausblenden" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>

  <div class="mobile-menu" id="mobileMenu" role="dialog" aria-label="Mobile Navigation">
    <a href="/">Startseite</a>
    <a href="/#about">Über uns</a>
    <a href="/#services">Leistungen</a>
    <a href="/#contact">Kontakt</a>
  </div>

  <main class="legal-page">
    <p class="section-eyebrow">Rechtliche Informationen</p>
    <h1 id="ds-heading">Datenschutzerklärung</h1>
    <div id="ds-body" class="legal-page"></div>
    <p style="margin-top:3rem;font-size:0.875rem;color:var(--color-text-muted);">
      Zuletzt aktualisiert: <span id="ds-updated"></span>
    </p>
  </main>

  <footer class="footer">
    <div class="container">
      <div class="footer-bottom">
        <p>© 2026 Boyle Digital Services. Alle Rechte vorbehalten.</p>
        <span class="footer-legal-links">
          <a href="/impressum">Impressum</a>
          <a href="/datenschutz">Datenschutz</a>
        </span>
      </div>
    </div>
  </footer>

  <script src="js/i18n.js"></script>
  <script src="js/content.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', async () => {
      const hamburger  = document.getElementById('hamburger');
      const mobileMenu = document.getElementById('mobileMenu');
      const toggle = () => {
        const open = mobileMenu.classList.toggle('open');
        hamburger.classList.toggle('active', open);
        hamburger.setAttribute('aria-expanded', String(open));
        document.body.style.overflow = open ? 'hidden' : '';
      };
      hamburger.addEventListener('click', toggle);
      mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }));
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) toggle();
      });

      const content = await getContent();
      const ds  = content.datenschutz || {};
      const lang = (typeof getLang === 'function') ? getLang() : 'de';

      const bodyHtml = (lang === 'en' && ds.body_en) ? ds.body_en : ds.body_de;
      const bodyEl = document.getElementById('ds-body');
      if (bodyEl && bodyHtml) bodyEl.innerHTML = bodyHtml;

      const updEl = document.getElementById('ds-updated');
      if (updEl) updEl.textContent = ds.updated || '';

      document.documentElement.lang = lang;

      const nameEl = document.querySelector('.nav-logo');
      if (nameEl && content.companyName) {
        const parts = content.companyName.split(' ');
        if (parts.length > 1) {
          nameEl.innerHTML = parts[0] + ' <span>' + parts[1] + '</span>' +
            (parts.slice(2).length ? ' ' + parts.slice(2).join(' ') : '');
        }
      }
    });
  </script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add datenschutz.html
git commit -m "feat: add Datenschutzerklärung page (/datenschutz) — renders HTML from content store"
```

---

## Task 11: Add consent checkbox to contact form

**Files:**
- Modify: `index.html`
- Modify: `css/styles.css`
- Modify: `js/main.js`

- [ ] **Step 1: Add consent checkbox to `index.html`**

Find in `index.html` (around line 303–304):
```html
              <span class="form-error" id="messageError" role="alert"></span>
            </div>
            <button type="submit" class="btn btn-primary btn-full" data-i18n="form_submit">Nachricht senden</button>
```

Replace with:
```html
              <span class="form-error" id="messageError" role="alert"></span>
            </div>
            <div class="form-group form-group--consent">
              <label class="consent-label">
                <input type="checkbox" id="consent" name="consent">
                <span data-i18n-html="form_consent_label">Ich habe die <a href="/datenschutz">Datenschutzerklärung</a> gelesen und stimme zu.</span>
              </label>
              <span class="form-error" id="consentError" role="alert"></span>
            </div>
            <button type="submit" class="btn btn-primary btn-full" data-i18n="form_submit">Nachricht senden</button>
```

- [ ] **Step 2: Add consent + footer-legal-links CSS to `css/styles.css`**

Find the `/* Success message */` block comment in `css/styles.css` (the `.success-message` rule). Insert **before** it:

```css
/* Consent checkbox */
.form-group--consent { margin-bottom: 1.25rem; }

.consent-label {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  cursor: pointer;
  font-size: 0.9rem;
  line-height: 1.5;
}

.consent-label input[type="checkbox"] {
  flex-shrink: 0;
  margin-top: 0.2rem;
  width: 1.1rem;
  height: 1.1rem;
  accent-color: var(--clr-primary, #0e7490);
  cursor: pointer;
}

.consent-label a { color: var(--clr-primary, #0e7490); }

/* Footer legal links */
.footer-legal-links {
  display: flex;
  gap: 1.25rem;
  align-items: center;
}

.footer-legal-links a {
  color: var(--clr-footer-text, #94a3b8);
  font-size: 0.85rem;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-legal-links a:hover { color: var(--clr-primary, #0e7490); }

```

- [ ] **Step 3: Add consent validation to `js/main.js`**

Find after the `['name', 'email', 'subject', 'message'].forEach` block (around line 358), before `contactForm.addEventListener`:

```javascript
// Inline clear on input
['name', 'email', 'subject', 'message'].forEach(id => {
  ...
});

contactForm.addEventListener('submit', async e => {
```

Insert between the `forEach` and the `contactForm.addEventListener`:

```javascript
// Clear consent error when checkbox is ticked
const consentBox = document.getElementById('consent');
if (consentBox) {
  consentBox.addEventListener('change', () => {
    document.getElementById('consentError').textContent = '';
  });
}

```

Then find the message validation block in the submit handler (around line 399–404):

```javascript
  // Message
  if (!msgVal || msgVal.length < 10) {
    setFieldError('message', 'messageError', T('err_message_short'));
    isValid = false;
  } else {
    clearFieldError('message', 'messageError');
  }

  if (isValid) {
```

Replace the `if (isValid) {` line with:

```javascript
  // Consent
  const consentChecked = document.getElementById('consent')?.checked;
  const consentError   = document.getElementById('consentError');
  if (!consentChecked) {
    if (consentError) consentError.textContent = T('err_consent_required');
    isValid = false;
  } else {
    if (consentError) consentError.textContent = '';
  }

  if (isValid) {
```

- [ ] **Step 4: Commit**

```bash
git add index.html css/styles.css js/main.js
git commit -m "feat: add GDPR consent checkbox to contact form with bilingual validation"
```

---

## Task 12: Add footer legal links to public pages

**Files:**
- Modify: `index.html`
- Modify: `about-me.html`

- [ ] **Step 1: Update `index.html` footer**

Find in `index.html` (around line 352–354):
```html
      <div class="footer-bottom">
        <p data-i18n="footer_copyright">© 2026 Boyle Digital Services. Alle Rechte vorbehalten.</p>
        <a href="admin.html" class="footer-admin-link" data-i18n="footer_admin">Admin</a>
      </div>
```

Replace with:
```html
      <div class="footer-bottom">
        <p data-i18n="footer_copyright">© 2026 Boyle Digital Services. Alle Rechte vorbehalten.</p>
        <span class="footer-legal-links">
          <a href="/impressum" data-i18n="footer_impressum">Impressum</a>
          <a href="/datenschutz" data-i18n="footer_datenschutz">Datenschutz</a>
          <a href="admin.html" class="footer-admin-link" data-i18n="footer_admin">Admin</a>
        </span>
      </div>
```

- [ ] **Step 2: Update `about-me.html` footer**

Find in `about-me.html`:
```html
      <div class="footer-bottom">
        <p data-i18n="footer_copyright">© 2026 Boyle Digital Services. Alle Rechte vorbehalten.</p>
        <a href="admin.html" class="footer-admin-link" data-i18n="footer_admin">Admin</a>
      </div>
```

Replace with:
```html
      <div class="footer-bottom">
        <p data-i18n="footer_copyright">© 2026 Boyle Digital Services. Alle Rechte vorbehalten.</p>
        <span class="footer-legal-links">
          <a href="/impressum" data-i18n="footer_impressum">Impressum</a>
          <a href="/datenschutz" data-i18n="footer_datenschutz">Datenschutz</a>
          <a href="admin.html" class="footer-admin-link" data-i18n="footer_admin">Admin</a>
        </span>
      </div>
```

- [ ] **Step 3: Commit**

```bash
git add index.html about-me.html
git commit -m "feat: add Impressum and Datenschutz footer links to all public pages"
```

---

## Task 13: Admin panel — Legal pages section UI

**Files:**
- Modify: `admin.html`

- [ ] **Step 1: Add nav item for Legal section**

Find in `admin.html` sidebar (around line 88–89):
```html
          <li><a href="#sec-theme"    class="sidebar-link" data-i18n="admin_nav_theme">🎨 Farbschema</a></li>
          <li class="sidebar-divider"></li>
```

Replace with:
```html
          <li><a href="#sec-theme"    class="sidebar-link" data-i18n="admin_nav_theme">🎨 Farbschema</a></li>
          <li><a href="#sec-legal"     class="sidebar-link" data-i18n="admin_nav_legal">📜 Rechtliches</a></li>
          <li class="sidebar-divider"></li>
```

- [ ] **Step 2: Add `#sec-legal` section before `#sec-security`**

Find in `admin.html` (around line 426):
```html
        <!-- ── SECURITY ───────────────────────────── -->
        <section class="admin-section" id="sec-security">
```

Insert the entire legal section **before** that comment:

```html
        <!-- ── LEGAL PAGES ──────────────────────────────────── -->
        <section class="admin-section" id="sec-legal">
          <div class="section-title">
            <h2 data-i18n="sec_legal_h2">Impressum &amp; Datenschutz</h2>
            <p data-i18n="sec_legal_desc">Pflichtangaben gemäß TMG §5 und DSGVO Art. 13/14. Alle Felder werden auf den Seiten /impressum und /datenschutz angezeigt.</p>
          </div>

          <!-- Impressum -->
          <div class="card">
            <h3 style="margin:0 0 1.25rem" data-i18n="sec_imp_h3">Impressum</h3>
            <div class="field-group">
              <label for="f-imp-name" data-i18n="sec_imp_name">Name / Firmenname</label>
              <input type="text" id="f-imp-name" placeholder="Max Mustermann">
            </div>
            <div class="field-group">
              <label for="f-imp-strasse" data-i18n="sec_imp_strasse">Straße und Hausnummer</label>
              <input type="text" id="f-imp-strasse" placeholder="Musterstraße 1">
            </div>
            <div class="field-group">
              <label for="f-imp-ort" data-i18n="sec_imp_ort">Postleitzahl und Ort</label>
              <input type="text" id="f-imp-ort" placeholder="10115 Berlin">
            </div>
            <div class="field-group">
              <label for="f-imp-land" data-i18n="sec_imp_land">Land</label>
              <input type="text" id="f-imp-land" placeholder="Deutschland">
            </div>
            <div class="field-group">
              <label for="f-imp-email" data-i18n="sec_imp_email">E-Mail (Kontakt)</label>
              <input type="email" id="f-imp-email" placeholder="hello@example.com">
            </div>
            <div class="field-group">
              <label for="f-imp-telefon" data-i18n="sec_imp_telefon">Telefon (optional)</label>
              <input type="tel" id="f-imp-telefon" placeholder="+49 30 12345678">
            </div>
            <div class="field-group">
              <label for="f-imp-vertreter" data-i18n="sec_imp_vertreter">Vertretungsberechtigte Person</label>
              <input type="text" id="f-imp-vertreter" placeholder="Max Mustermann">
            </div>
            <div class="field-group">
              <label for="f-imp-ustid" data-i18n="sec_imp_ustid">USt-ID (optional)</label>
              <input type="text" id="f-imp-ustid" placeholder="DE123456789">
            </div>
            <div class="field-group">
              <label for="f-imp-register" data-i18n="sec_imp_register">Handelsregistereintrag (optional)</label>
              <input type="text" id="f-imp-register" placeholder="z. B. HRB 12345, AG Berlin-Charlottenburg">
            </div>
            <div class="field-group">
              <label for="f-imp-verantwortlich" data-i18n="sec_imp_verantwortlich">Inhaltlich Verantwortlicher (§ 55 Abs. 2 RStV)</label>
              <input type="text" id="f-imp-verantwortlich" placeholder="Max Mustermann">
            </div>
            <div class="field-group">
              <label for="f-imp-updated" data-i18n="sec_legal_updated">Letzte Aktualisierung</label>
              <input type="text" id="f-imp-updated" placeholder="Mai 2026">
            </div>
          </div>

          <!-- Datenschutzerklärung -->
          <div class="card">
            <h3 style="margin:0 0 0.5rem" data-i18n="sec_ds_h3">Datenschutzerklärung</h3>
            <p class="field-hint" data-i18n="sec_ds_desc">HTML-Inhalt der Datenschutzerklärung. Sie können Text direkt eingeben oder eine PDF-Datei importieren.</p>

            <!-- PDF import -->
            <div class="field-group">
              <label data-i18n="sec_ds_pdf_lbl">PDF importieren</label>
              <p class="field-hint" data-i18n="sec_ds_pdf_hint">Text wird aus der PDF extrahiert und in das Textfeld unten eingefügt. Überprüfen und bearbeiten Sie danach den Text.</p>
              <div style="display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap">
                <label class="btn-ghost" style="cursor:pointer">
                  <span data-i18n="sec_ds_pdf_btn">PDF auswählen …</span>
                  <input type="file" id="f-ds-pdf-input" accept=".pdf" style="display:none">
                </label>
                <span id="f-ds-pdf-status" style="font-size:0.875rem;color:var(--color-text-muted)"></span>
              </div>
            </div>

            <!-- DE body -->
            <div class="field-group">
              <label for="f-ds-body-de" data-i18n="sec_ds_body_de">Inhalt (Deutsch) — HTML</label>
              <textarea id="f-ds-body-de" rows="18" style="font-family:monospace;font-size:0.8rem"></textarea>
            </div>

            <!-- EN body -->
            <div class="field-group">
              <label for="f-ds-body-en" data-i18n="sec_ds_body_en">Inhalt (Englisch) — HTML (optional)</label>
              <textarea id="f-ds-body-en" rows="10" style="font-family:monospace;font-size:0.8rem"></textarea>
            </div>

            <div class="field-group">
              <label for="f-ds-updated" data-i18n="sec_legal_updated">Letzte Aktualisierung</label>
              <input type="text" id="f-ds-updated" placeholder="Mai 2026">
            </div>
          </div>
        </section>

```

- [ ] **Step 3: Commit**

```bash
git add admin.html
git commit -m "feat: add Legal pages (Impressum + Datenschutz) editor section to admin panel"
```

---

## Task 14: Wire legal data into admin.js load/save/PDF

**Files:**
- Modify: `js/admin.js`

- [ ] **Step 1: Add legal field loading to `loadFormData`**

Find in `js/admin.js` (around line 322–325):
```javascript
  if (biztypeEl) biztypeEl.value = seoRoot.businessType || 'ProfessionalService';

  /* ── Update bilingual visibility for new sections ── */
```

Replace with:
```javascript
  if (biztypeEl) biztypeEl.value = seoRoot.businessType || 'ProfessionalService';

  /* ── Legal pages ── */
  const imp = data.impressum || {};
  val('f-imp-name',          imp.anbieter_name    || '');
  val('f-imp-strasse',       imp.anbieter_strasse || '');
  val('f-imp-ort',           imp.anbieter_ort     || '');
  val('f-imp-land',          imp.anbieter_land    || '');
  val('f-imp-email',         imp.kontakt_email    || '');
  val('f-imp-telefon',       imp.kontakt_telefon  || '');
  val('f-imp-vertreter',     imp.vertreter        || '');
  val('f-imp-ustid',         imp.ustid            || '');
  val('f-imp-register',      imp.registereintrag  || '');
  val('f-imp-verantwortlich',imp.verantwortlich   || '');
  val('f-imp-updated',       imp.updated          || '');

  const ds = data.datenschutz || {};
  val('f-ds-body-de', ds.body_de  || '');
  val('f-ds-body-en', ds.body_en  || '');
  val('f-ds-updated', ds.updated  || '');

  /* ── Update bilingual visibility for new sections ── */
```

- [ ] **Step 2: Add legal field capture to `captureFormIntoContent`**

Find in `js/admin.js` (around line 520–523):
```javascript
    businessType:  document.getElementById('f-seo-biztype')?.value || 'ProfessionalService'
  };
}
```

Replace with:
```javascript
    businessType:  document.getElementById('f-seo-biztype')?.value || 'ProfessionalService'
  };

  /* ── Legal pages (language-neutral) ── */
  contentObj.impressum = {
    anbieter_name:    get('f-imp-name'),
    anbieter_strasse: get('f-imp-strasse'),
    anbieter_ort:     get('f-imp-ort'),
    anbieter_land:    get('f-imp-land'),
    kontakt_email:    get('f-imp-email'),
    kontakt_telefon:  get('f-imp-telefon'),
    vertreter:        get('f-imp-vertreter'),
    ustid:            get('f-imp-ustid'),
    registereintrag:  get('f-imp-register'),
    verantwortlich:   get('f-imp-verantwortlich'),
    updated:          get('f-imp-updated')
  };
  contentObj.datenschutz = {
    body_de:  (document.getElementById('f-ds-body-de')?.value || '').trim(),
    body_en:  (document.getElementById('f-ds-body-en')?.value || '').trim(),
    updated:  get('f-ds-updated')
  };
}
```

- [ ] **Step 3: Add PDF import code at end of `js/admin.js`**

Append to the end of `js/admin.js`:

```javascript


/* ============================================================
   PDF TEXT IMPORT — self-contained, no external library.
   Extracts readable text from uncompressed PDF content streams.
   ============================================================ */

(function initPdfImport() {
  const fileInput = document.getElementById('f-ds-pdf-input');
  const statusEl  = document.getElementById('f-ds-pdf-status');
  if (!fileInput || !statusEl) return;

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;

    statusEl.textContent = T('sec_ds_pdf_reading');
    fileInput.value = '';

    try {
      const text = await extractPdfText(file);
      if (text && text.length > 50) {
        const bodyDe = document.getElementById('f-ds-body-de');
        if (bodyDe) {
          bodyDe.value = plainTextToHtml(text);
          statusEl.style.color = 'var(--color-success, green)';
          statusEl.textContent = T('sec_ds_pdf_ok').replace('{n}', text.length);
        }
      } else {
        statusEl.style.color = 'var(--color-danger, red)';
        statusEl.textContent = T('sec_ds_pdf_fail');
      }
    } catch (_) {
      statusEl.style.color = 'var(--color-danger, red)';
      statusEl.textContent = T('sec_ds_pdf_fail');
    }
  });
}());

async function extractPdfText(file) {
  const buffer = await file.arrayBuffer();
  const raw = new TextDecoder('latin1').decode(new Uint8Array(buffer));
  const lines = [];
  let pos = 0;
  while (true) {
    const btIdx = raw.indexOf('BT', pos);
    if (btIdx === -1) break;
    const etIdx = raw.indexOf('ET', btIdx + 2);
    if (etIdx === -1) break;
    pos = etIdx + 2;
    const block = raw.slice(btIdx, etIdx);
    const parts  = [];
    const tjRe = /\(([^)\\]*(?:\\[\s\S][^)\\]*)*)\)\s*(?:Tj|'|")/g;
    let m;
    while ((m = tjRe.exec(block)) !== null) {
      const decoded = decodePdfString(m[1]);
      if (decoded.trim()) parts.push(decoded);
    }
    const tjArrRe = /\[([^\]]*)\]\s*TJ/g;
    while ((m = tjArrRe.exec(block)) !== null) {
      const inner   = m[1];
      const innerRe = /\(([^)\\]*(?:\\[\s\S][^)\\]*)*)\)/g;
      let im;
      while ((im = innerRe.exec(inner)) !== null) {
        const decoded = decodePdfString(im[1]);
        if (decoded.trim()) parts.push(decoded);
      }
    }
    const line = parts.join('').trim();
    if (line) lines.push(line);
  }
  return lines.join('\n').trim();
}

function decodePdfString(s) {
  return s
    .replace(/\\([0-7]{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\(.)/g, '$1');
}

function plainTextToHtml(text) {
  const paras = text.split(/\n{2,}/).map(p => p.replace(/\n/g, ' ').trim()).filter(Boolean);
  return paras.map(p => {
    if (p.length < 80 && !/[.,:;]$/.test(p) && /\d|^[A-ZÄÖÜ]/.test(p)) {
      return `<h2>${escHtml(p)}</h2>`;
    }
    return `<p>${escHtml(p)}</p>`;
  }).join('\n');
}

function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
```

- [ ] **Step 4: Commit**

```bash
git add js/admin.js
git commit -m "feat: wire legal pages load/save into admin form + PDF text extractor"
```

---

## Task 15: Open pull request

- [ ] **Step 1: Push branch**

```bash
git push -u origin claude/naughty-faraday-6c62c3
```

- [ ] **Step 2: Create PR**

```bash
gh pr create \
  --title "feat: port PR #18 + #19 — session auto-fetch and GDPR compliance" \
  --body "$(cat <<'EOF'
## Summary

Ports two PRs from the sibling `myinternetface` project to this template:

- **PR #18** — Auto-fetch Worker API key on admin login via `POST /api/session`
- **PR #19** — 8 GDPR/DSGVO compliance fixes

## Changes

### PR #18 — Session auto-fetch
- New `POST /api/session` Worker endpoint: verifies `WORKER_SECRET` from request body, returns key on success
- Admin login now calls `/api/session` first; on success stores key in `localStorage('bds_api_key')` and pre-fills the Storage field automatically. Falls back to local password check when offline.

### PR #19 — GDPR compliance
1. **Self-hosted fonts** — Inter + Playfair Display WOFF2 files served from `/fonts/`; `css/fonts.css` replaces all Google Fonts CDN links
2. **Self-hosted Leaflet** — Leaflet 1.9.4 CSS/JS/images served from `/vendor/leaflet/`; no more `unpkg.com` requests on map load
3. **Impressum page** — `/impressum` reads all fields dynamically from the content store
4. **Datenschutzerklärung page** — `/datenschutz` renders HTML body from the content store; ships with a comprehensive default policy (DE + EN)
5. **Admin legal editor** — new `📜 Rechtliches` section in the admin sidebar with Impressum fields, Datenschutz textareas, and a client-side PDF text extractor
6. **Contact form consent** — checkbox with link to `/datenschutz` required before form submission (bilingual validation)
7. **PBKDF2 password hashing** — replaces unsalted SHA-256 with PBKDF2-SHA-256 (200k iterations, random 128-bit salt); auto-migrates legacy hashes
8. **Footer legal links** — Impressum + Datenschutz links added to footers of `index.html`, `about-me.html`, `impressum.html`, `datenschutz.html`

### Adaptations from personal_website
- All DEFAULT_CONTENT placeholder emails changed from `hello@boyledigital.ie` → `hello@example.com`
- Impressum field placeholders use generic names (`Max Mustermann`, `Musterstraße 1`)
- `wrangler.jsonc` unchanged (KV namespace already wired in PR #17)

## Test plan
- [ ] Visit `/` — no `fonts.googleapis.com` requests in DevTools Network tab
- [ ] Scroll to Locations section — no `unpkg.com` requests (Leaflet loads from `/vendor/leaflet/`)
- [ ] Visit `/impressum` — renders with placeholder fields; optional sections hidden when empty
- [ ] Visit `/datenschutz` — full German policy renders; language toggle switches to English body
- [ ] Submit contact form without ticking consent — error appears; with consent ticked — `mailto:` opens
- [ ] Admin login with correct `WORKER_SECRET` on fresh browser — KV pill turns green without visiting Storage section
- [ ] Admin → Security — change password, log out, log back in with new password (PBKDF2 migration)
- [ ] Admin → Rechtliches — fill Impressum fields, save, reload `/impressum` — values appear
- [ ] Admin → Rechtliches — edit Datenschutz body, save, reload `/datenschutz` — content updates

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

*Self-review: All 8 PR #19 fixes + PR #18 covered. Binary assets handled in Task 1. No TBDs. Type/ID consistency verified across load (Task 14) and HTML (Task 13) — all field IDs match (`f-imp-name`, `f-ds-body-de`, etc.). Consent error ID `consentError` consistent between Task 11 JS and HTML.*
