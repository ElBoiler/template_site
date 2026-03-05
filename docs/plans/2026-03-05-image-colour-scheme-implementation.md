# Image Colour Scheme Picker — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an admin section that extracts a colour palette from an uploaded image, lets the user assign Primary and Accent roles, previews via a mini mockup, and applies the scheme sitewide via CSS custom properties.

**Architecture:** Color Thief (CDN) extracts 6 dominant colours from an image via canvas. The user assigns Primary/Accent roles via an inline swatch picker; all other vars are computed. The theme is stored in `localStorage` as `bds_theme` and applied to `:root` via inline styles on every page load.

**Tech Stack:** Vanilla JS/HTML/CSS (no bundler). Color Thief CDN. CSS custom properties on `:root`. `localStorage`.

---

## Task 1: Rename CSS custom properties in `styles.css`

**Files:**
- Modify: `css/styles.css`

This is a mechanical find-and-replace. The CSS variables in `styles.css` are renamed to semantic names so they make sense regardless of the active colour scheme.

**Step 1: Apply all renames using sed-style replacements**

Open `css/styles.css` and make these exact replacements (replace all occurrences, not just `:root` declarations):

| Find (exact string) | Replace with |
|---|---|
| `--clr-brand` | `--clr-primary` |
| `--clr-teal:` | `--clr-accent:` |
| `--clr-teal-hover` | `--clr-accent-hover` |
| `--clr-teal-light` | `--clr-accent-light` |
| `--clr-teal)` | `--clr-accent)` |
| `--clr-white` | `--clr-bg` |

> Note: `--clr-teal:` (with colon) catches the declaration; `--clr-teal)` catches `var(--clr-teal)` usages. Run the broader `--clr-teal` replace last to catch any remaining.

After replacements, the `:root` block in `styles.css` should read:
```css
:root {
  --clr-primary:      #0F172A;
  --clr-accent:       #0891B2;
  --clr-accent-hover: #0E7490;
  --clr-accent-light: #ECFEFF;
  --clr-bg:           #FFFFFF;
  --clr-surface:      #F8FAFC;
  --clr-text:         #1E293B;
  --clr-muted:        #64748B;
  --clr-border:       #E2E8F0;
  --clr-success:      #10B981;
  --clr-error:        #EF4444;

  --gradient-hero: linear-gradient(135deg, #0F172A 0%, #0891B2 100%);
  /* ... rest unchanged */
}
```

**Step 2: Verify in browser**

Open `index.html` in a browser. The site should look identical to before — same navy/teal colour scheme. If anything looks broken, a rename was missed or double-applied.

**Step 3: Commit**

```bash
git add css/styles.css
git commit -m "refactor: rename CSS colour vars to semantic names"
```

---

## Task 2: Add theme loader to `content.js`

**Files:**
- Modify: `js/content.js`

`content.js` is loaded by both `index.html` and `admin.html`, making it the right place for a shared theme loader.

**Step 1: Add the theme constants and loader at the bottom of `content.js`**

Append to the end of `js/content.js`:

```javascript
/* ============================================================
   THEME — apply stored colour scheme from localStorage
   ============================================================ */

const THEME_KEY = 'bds_theme';

/**
 * Reads bds_theme from localStorage and sets each CSS custom
 * property directly on :root (document.documentElement.style).
 * Called on every page load. No-ops if no theme is stored.
 */
function applyStoredTheme() {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (!raw) return;
    const theme = JSON.parse(raw);
    Object.entries(theme).forEach(([prop, value]) => {
      document.documentElement.style.setProperty(prop, value);
    });
  } catch (e) {
    // Corrupt data — silently clear it
    localStorage.removeItem(THEME_KEY);
  }
}

/**
 * Removes all inline CSS custom properties previously set by
 * applyStoredTheme, restoring the stylesheet defaults.
 */
function removeStoredTheme() {
  const THEME_PROPS = [
    '--clr-primary', '--clr-accent', '--clr-accent-hover',
    '--clr-accent-light', '--clr-text', '--gradient-hero',
  ];
  THEME_PROPS.forEach(prop => {
    document.documentElement.style.removeProperty(prop);
  });
}

// Apply on load (runs on both index.html and admin.html)
applyStoredTheme();
```

**Step 2: Verify**

Open `index.html` — site still looks the same (no theme stored yet). Open browser DevTools → Application → Local Storage; there should be no `bds_theme` key. The function runs and does nothing — correct.

**Step 3: Commit**

```bash
git add js/content.js
git commit -m "feat: add theme loader to content.js (reads bds_theme on load)"
```

---

## Task 3: Add i18n translation keys

**Files:**
- Modify: `js/i18n.js`

**Step 1: Add DE keys to the German translations object**

In `js/i18n.js`, find the DE block (`admin_nav_security` is at line ~223). Add after `admin_nav_security`:

```javascript
    admin_nav_theme:     '🎨 Farbschema',

    sec_theme_h2:        'Farbschema',
    sec_theme_desc:      'Extrahieren Sie ein Farbschema aus einem Bild und wenden Sie es auf die Website an.',
    sec_theme_drop:      'Bild hier ablegen oder klicken zum Hochladen',
    sec_theme_formats:   'JPG · PNG · SVG · GIF',
    sec_theme_extracted: 'Extrahierte Farben',
    sec_theme_roles:     'Rollen zuweisen',
    sec_theme_primary:   'Primär',
    sec_theme_accent:    'Akzent',
    sec_theme_preview:   'Vorschau',
    sec_theme_apply:     'Farbschema anwenden',
    sec_theme_reset:     'Auf Standard zurücksetzen',
    toast_theme_applied: 'Farbschema angewendet!',
    toast_theme_reset:   'Farbschema auf Standard zurückgesetzt.',
```

**Step 2: Add EN keys to the English translations object**

Find the EN block (`admin_nav_security` at line ~417). Add after it:

```javascript
    admin_nav_theme:     '🎨 Colour Scheme',

    sec_theme_h2:        'Colour Scheme',
    sec_theme_desc:      'Extract a colour scheme from an image and apply it to the website.',
    sec_theme_drop:      'Drop an image here, or click to upload',
    sec_theme_formats:   'JPG · PNG · SVG · GIF',
    sec_theme_extracted: 'Extracted colours',
    sec_theme_roles:     'Assign roles',
    sec_theme_primary:   'Primary',
    sec_theme_accent:    'Accent',
    sec_theme_preview:   'Preview',
    sec_theme_apply:     'Apply Colour Scheme',
    sec_theme_reset:     'Reset to Default',
    toast_theme_applied: 'Colour scheme applied!',
    toast_theme_reset:   'Colour scheme reset to default.',
```

**Step 3: Commit**

```bash
git add js/i18n.js
git commit -m "feat: add i18n keys for colour scheme admin section (DE + EN)"
```

---

## Task 4: Add Color Thief CDN, sidebar entry, and section markup to `admin.html`

**Files:**
- Modify: `admin.html`

**Step 1: Add Color Thief CDN script**

In `admin.html`, find the existing scripts block near the bottom:
```html
  <script src="js/i18n.js"></script>
```
Add Color Thief **before** the existing scripts:
```html
  <script src="https://cdnjs.cloudflare.com/ajax/libs/color-thief/2.4.0/color-thief.umd.js"></script>
  <script src="js/i18n.js"></script>
```

**Step 2: Add sidebar link**

Find in `admin.html`:
```html
          <li class="sidebar-divider"></li>
          <li><a href="#sec-security" class="sidebar-link" data-i18n="admin_nav_security">🔒 Sicherheit</a></li>
```
Add the new entry before the divider:
```html
          <li><a href="#sec-theme"    class="sidebar-link" data-i18n="admin_nav_theme">🎨 Farbschema</a></li>
          <li class="sidebar-divider"></li>
          <li><a href="#sec-security" class="sidebar-link" data-i18n="admin_nav_security">🔒 Sicherheit</a></li>
```

**Step 3: Add the section markup**

Find the closing tag `</section>` of the security section followed by:
```html
      </main>
    </div><!-- /admin-body -->
```

Insert the new section **between** the security `</section>` and `</main>`:

```html
        <!-- ── COLOUR SCHEME ────────────────────────────── -->
        <section class="admin-section" id="sec-theme">
          <div class="section-title">
            <h2 data-i18n="sec_theme_h2">Farbschema</h2>
            <p data-i18n="sec_theme_desc">Extrahieren Sie ein Farbschema aus einem Bild und wenden Sie es auf die Website an.</p>
          </div>

          <!-- Upload zone -->
          <div class="card">
            <div class="theme-drop-zone" id="themeDropZone" role="button" tabindex="0"
                 aria-label="Upload image">
              <input type="file" id="themeImageInput" accept=".jpg,.jpeg,.png,.svg,.gif"
                     class="theme-file-input" aria-hidden="true">
              <div class="theme-drop-inner" id="themeDropPrompt">
                <span class="theme-drop-icon">🖼</span>
                <span class="theme-drop-label" data-i18n="sec_theme_drop">Bild hier ablegen oder klicken zum Hochladen</span>
                <span class="theme-drop-formats" data-i18n="sec_theme_formats">JPG · PNG · SVG · GIF</span>
              </div>
            </div>
          </div>

          <!-- Palette (hidden until image uploaded) -->
          <div class="card hidden" id="themePaletteCard">

            <!-- Image thumbnail + swatches -->
            <div class="theme-palette-row">
              <img id="themeImgThumbnail" class="theme-thumbnail" alt="Uploaded image">
              <div class="theme-swatches" id="themeSwatches" aria-label="Extracted colours"></div>
            </div>

            <!-- Role assignment -->
            <div class="theme-roles">
              <p class="theme-roles-label" data-i18n="sec_theme_roles">Rollen zuweisen</p>
              <div class="theme-role-row">
                <span class="theme-role-name" data-i18n="sec_theme_primary">Primär</span>
                <button class="theme-role-swatch" id="rolePickerPrimary" aria-haspopup="true"
                        aria-label="Pick primary colour">
                  <span class="theme-role-dot" id="roleDotPrimary"></span>
                  <span class="theme-role-hex" id="roleHexPrimary">#000000</span>
                  <span class="theme-role-arrow">▾</span>
                </button>
                <div class="theme-role-popup hidden" id="rolePopupPrimary" role="listbox"
                     aria-label="Choose primary colour"></div>
              </div>
              <div class="theme-role-row">
                <span class="theme-role-name" data-i18n="sec_theme_accent">Akzent</span>
                <button class="theme-role-swatch" id="rolePickerAccent" aria-haspopup="true"
                        aria-label="Pick accent colour">
                  <span class="theme-role-dot" id="roleDotAccent"></span>
                  <span class="theme-role-hex" id="roleHexAccent">#000000</span>
                  <span class="theme-role-arrow">▾</span>
                </button>
                <div class="theme-role-popup hidden" id="rolePopupAccent" role="listbox"
                     aria-label="Choose accent colour"></div>
              </div>
            </div>

            <!-- Mini mockup preview -->
            <div class="theme-preview-section">
              <p class="theme-roles-label" data-i18n="sec_theme_preview">Vorschau</p>
              <div class="theme-mockup" id="themeMockup" aria-hidden="true">
                <div class="mockup-header">
                  <div class="mockup-logo"></div>
                  <div class="mockup-nav">
                    <div class="mockup-nav-dot"></div>
                    <div class="mockup-nav-dot"></div>
                    <div class="mockup-nav-dot"></div>
                    <div class="mockup-btn-pill"></div>
                  </div>
                </div>
                <div class="mockup-hero">
                  <div class="mockup-hero-eyebrow"></div>
                  <div class="mockup-hero-headline"></div>
                  <div class="mockup-hero-sub"></div>
                  <div class="mockup-hero-cta"></div>
                </div>
                <div class="mockup-cards">
                  <div class="mockup-card">
                    <div class="mockup-card-icon"></div>
                    <div class="mockup-card-title"></div>
                    <div class="mockup-card-text"></div>
                  </div>
                  <div class="mockup-card">
                    <div class="mockup-card-icon"></div>
                    <div class="mockup-card-title"></div>
                    <div class="mockup-card-text"></div>
                  </div>
                  <div class="mockup-card">
                    <div class="mockup-card-icon"></div>
                    <div class="mockup-card-title"></div>
                    <div class="mockup-card-text"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="theme-actions">
              <button id="themeApplyBtn" class="btn-primary" data-i18n="sec_theme_apply">
                Farbschema anwenden
              </button>
              <button id="themeResetBtn" class="btn-ghost" data-i18n="sec_theme_reset">
                Auf Standard zurücksetzen
              </button>
            </div>
          </div>

        </section>
```

**Step 4: Verify**

Open `admin.html`, log in, scroll to the new "🎨 Farbschema" sidebar link. Click it. The section should appear with the upload drop zone. The palette card should be hidden. No JS errors in console.

**Step 5: Commit**

```bash
git add admin.html
git commit -m "feat: add colour scheme section markup to admin.html"
```

---

## Task 5: Add styles for the colour scheme section to `admin.css`

**Files:**
- Modify: `css/admin.css`

**Step 1: Append the following CSS to the end of `css/admin.css`**

```css
/* ============================================================
   COLOUR SCHEME ADMIN SECTION
   ============================================================ */

/* Drop zone */
.theme-drop-zone {
  position: relative;
  border: 2px dashed var(--a-border);
  border-radius: var(--radius);
  padding: 2.5rem 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: border-color var(--trans), background var(--trans);
}

.theme-drop-zone:hover,
.theme-drop-zone.drag-over {
  border-color: var(--a-teal);
  background: var(--a-teal-light);
}

.theme-file-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
  width: 100%;
  height: 100%;
}

.theme-drop-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  pointer-events: none;
}

.theme-drop-icon   { font-size: 2rem; line-height: 1; }
.theme-drop-label  { font-weight: 600; font-size: 0.9rem; color: var(--a-text); }
.theme-drop-formats { font-size: 0.775rem; color: var(--a-muted); }

/* Thumbnail + swatches row */
.theme-palette-row {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.theme-thumbnail {
  width: 100px;
  height: 70px;
  object-fit: cover;
  border-radius: var(--radius);
  border: 1px solid var(--a-border);
  flex-shrink: 0;
}

.theme-swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.theme-swatch {
  width: 36px;
  height: 36px;
  border-radius: var(--radius);
  border: 2px solid transparent;
  cursor: default;
  transition: transform var(--trans), border-color var(--trans);
  position: relative;
}

.theme-swatch:hover {
  transform: scale(1.15);
  z-index: 1;
}

.theme-swatch[title]:hover::after {
  content: attr(title);
  position: absolute;
  bottom: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--a-text);
  color: #fff;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
}

/* Role assignment */
.theme-roles {
  margin-bottom: 1.25rem;
}

.theme-roles-label {
  font-size: 0.775rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--a-muted);
  margin-bottom: 0.6rem;
}

.theme-role-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  position: relative;
}

.theme-role-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--a-text);
  min-width: 60px;
}

.theme-role-swatch {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.6rem;
  border: 1px solid var(--a-border);
  border-radius: var(--radius);
  background: var(--a-surface);
  cursor: pointer;
  transition: border-color var(--trans);
  font-size: 0.8rem;
}

.theme-role-swatch:hover { border-color: var(--a-teal); }

.theme-role-dot {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid rgba(0,0,0,0.1);
  flex-shrink: 0;
}

.theme-role-hex   { font-family: monospace; color: var(--a-muted); font-size: 0.8rem; }
.theme-role-arrow { color: var(--a-muted); font-size: 0.7rem; }

/* Inline colour picker popup */
.theme-role-popup {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 100;
  background: var(--a-surface);
  border: 1px solid var(--a-border);
  border-radius: var(--radius);
  padding: 0.5rem;
  display: flex;
  gap: 0.4rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}

.theme-role-popup .theme-swatch {
  width: 28px;
  height: 28px;
  cursor: pointer;
  border-radius: 6px;
}

.theme-role-popup .theme-swatch:hover {
  border-color: var(--a-teal);
}

/* Preview section */
.theme-preview-section {
  margin-bottom: 1.25rem;
}

/* Mini mockup */
.theme-mockup {
  border: 1px solid var(--a-border);
  border-radius: var(--radius);
  overflow: hidden;
  max-width: 380px;
}

.mockup-header {
  background: var(--clr-primary, #0F172A);
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.mockup-logo {
  width: 48px;
  height: 8px;
  background: rgba(255,255,255,0.7);
  border-radius: 4px;
}

.mockup-nav {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.mockup-nav-dot {
  width: 24px;
  height: 6px;
  background: rgba(255,255,255,0.35);
  border-radius: 3px;
}

.mockup-btn-pill {
  width: 40px;
  height: 14px;
  background: var(--clr-accent, #0891B2);
  border-radius: 7px;
}

.mockup-hero {
  background: var(--clr-primary, #0F172A);
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.mockup-hero-eyebrow {
  width: 50px;
  height: 5px;
  background: var(--clr-accent, #0891B2);
  border-radius: 3px;
  opacity: 0.8;
}

.mockup-hero-headline {
  width: 120px;
  height: 10px;
  background: rgba(255,255,255,0.85);
  border-radius: 4px;
}

.mockup-hero-sub {
  width: 90px;
  height: 6px;
  background: rgba(255,255,255,0.4);
  border-radius: 3px;
}

.mockup-hero-cta {
  width: 56px;
  height: 16px;
  background: var(--clr-accent, #0891B2);
  border-radius: 8px;
  margin-top: 0.25rem;
}

.mockup-cards {
  background: var(--clr-surface, #F8FAFC);
  padding: 0.6rem;
  display: flex;
  gap: 0.4rem;
}

.mockup-card {
  flex: 1;
  background: #fff;
  border-radius: 4px;
  padding: 0.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  border: 1px solid var(--clr-border, #E2E8F0);
}

.mockup-card-icon {
  width: 14px;
  height: 14px;
  background: var(--clr-accent-light, #ECFEFF);
  border-radius: 3px;
}

.mockup-card-title {
  width: 80%;
  height: 5px;
  background: var(--clr-text, #1E293B);
  border-radius: 3px;
  opacity: 0.7;
}

.mockup-card-text {
  width: 100%;
  height: 4px;
  background: var(--clr-muted, #64748B);
  border-radius: 3px;
  opacity: 0.4;
}

/* Actions */
.theme-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
```

**Step 2: Verify**

Open the admin Colour Scheme section. The drop zone should have a dashed border. The overall layout should look clean. No visual regressions elsewhere in the admin.

**Step 3: Commit**

```bash
git add css/admin.css
git commit -m "feat: add admin CSS styles for colour scheme section"
```

---

## Task 6: Add colour scheme JS logic to `admin.js`

**Files:**
- Modify: `js/admin.js`

**Step 1: Add the theme section code**

Append the following block to the end of `js/admin.js` (before the closing of the file, after the `INIT` section):

```javascript
/* ============================================================
   COLOUR SCHEME SECTION
   ============================================================ */

const colorThief       = new ColorThief();
let extractedSwatches  = [];   // Array of { hex, r, g, b }
let pendingPrimary     = null; // hex string
let pendingAccent      = null; // hex string

/* ── Colour utilities ───────────────────────────────────── */

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return rgbToHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
}

/**
 * Given primary and accent hex values, compute the full
 * bds_theme object with all derived colour vars.
 */
function computeTheme(primaryHex, accentHex) {
  const aRgb = hexToRgb(accentHex);
  const aHsl = rgbToHsl(aRgb.r, aRgb.g, aRgb.b);

  const pRgb = hexToRgb(primaryHex);
  const pHsl = rgbToHsl(pRgb.r, pRgb.g, pRgb.b);

  // Ensure primary is dark enough for a readable dark background
  const primary = pHsl.l > 30
    ? hslToHex(pHsl.h, Math.min(pHsl.s, 60), 12)
    : primaryHex;

  // Accent hover: darken by ~15 lightness units
  const accentHover = hslToHex(aHsl.h, aHsl.s, Math.max(aHsl.l - 15, 5));

  // Accent light: very pale tint (high L, capped S)
  const accentLight = hslToHex(aHsl.h, Math.min(aHsl.s, 40), 95);

  // Text: very dark, slight hue from primary
  const text = hslToHex(pHsl.h, Math.min(pHsl.s, 25), 13);

  return {
    '--clr-primary':      primary,
    '--clr-accent':       accentHex,
    '--clr-accent-hover': accentHover,
    '--clr-accent-light': accentLight,
    '--clr-text':         text,
    '--gradient-hero':    `linear-gradient(135deg, ${primary} 0%, ${accentHex} 100%)`,
  };
}

/* ── DOM helpers ───────────────────────────────────────── */

function previewTheme(primaryHex, accentHex) {
  const theme = computeTheme(primaryHex, accentHex);
  Object.entries(theme).forEach(([prop, value]) => {
    document.documentElement.style.setProperty(prop, value);
  });
  // Sync role picker displays
  updateRolePickerUI('Primary', primaryHex);
  updateRolePickerUI('Accent',  accentHex);
}

function updateRolePickerUI(role, hex) {
  document.getElementById(`roleDot${role}`).style.background = hex;
  document.getElementById(`roleHex${role}`).textContent      = hex;
}

function buildSwatchPopup(popupEl, onPick) {
  popupEl.innerHTML = '';
  extractedSwatches.forEach(sw => {
    const btn = document.createElement('button');
    btn.type            = 'button';
    btn.className       = 'theme-swatch';
    btn.style.background = sw.hex;
    btn.title           = sw.hex;
    btn.setAttribute('role', 'option');
    btn.addEventListener('click', () => {
      onPick(sw.hex);
      popupEl.classList.add('hidden');
    });
    popupEl.appendChild(btn);
  });
}

function renderExtractedSwatches() {
  const container = document.getElementById('themeSwatches');
  container.innerHTML = '';
  extractedSwatches.forEach(sw => {
    const div = document.createElement('div');
    div.className        = 'theme-swatch';
    div.style.background = sw.hex;
    div.title            = sw.hex;
    container.appendChild(div);
  });
}

/* ── Auto role assignment ──────────────────────────────── */

function autoAssignRoles(swatches) {
  // Sort by lightness ascending — darkest first
  const sorted = [...swatches].sort((a, b) => {
    return rgbToHsl(a.r, a.g, a.b).l - rgbToHsl(b.r, b.g, b.b).l;
  });

  const primary = sorted[0];

  // Most saturated among the non-darkest
  const candidates = swatches.filter(s => s !== primary);
  const accent = candidates.reduce((best, s) => {
    return rgbToHsl(s.r, s.g, s.b).s > rgbToHsl(best.r, best.g, best.b).s ? s : best;
  }, candidates[0] || primary);

  return { primary: primary.hex, accent: accent.hex };
}

/* ── Image upload & extraction ─────────────────────────── */

function handleImageFile(file) {
  if (!file || !file.type.match(/^image\/(jpeg|png|svg\+xml|gif)$/)) return;

  const url = URL.createObjectURL(file);
  const img = new Image();

  img.onload = () => {
    try {
      const palette = colorThief.getPalette(img, 6);
      extractedSwatches = palette.map(([r, g, b]) => ({
        r, g, b, hex: rgbToHex(r, g, b)
      }));
    } catch (e) {
      // SVGs may fail canvas tainting — fall back to 1-colour
      extractedSwatches = [{ r: 8, g: 145, b: 178, hex: '#0891b2' }];
    }

    const { primary, accent } = autoAssignRoles(extractedSwatches);
    pendingPrimary = primary;
    pendingAccent  = accent;

    // Show thumbnail
    document.getElementById('themeImgThumbnail').src = url;

    // Render swatches & update role pickers
    renderExtractedSwatches();

    buildSwatchPopup(
      document.getElementById('rolePopupPrimary'),
      hex => { pendingPrimary = hex; previewTheme(pendingPrimary, pendingAccent); }
    );
    buildSwatchPopup(
      document.getElementById('rolePopupAccent'),
      hex => { pendingAccent = hex; previewTheme(pendingPrimary, pendingAccent); }
    );

    previewTheme(pendingPrimary, pendingAccent);

    // Reveal palette card
    document.getElementById('themePaletteCard').classList.remove('hidden');
    URL.revokeObjectURL(url);
  };

  img.crossOrigin = 'anonymous';
  img.src = url;
}

/* ── Event wiring ──────────────────────────────────────── */

// File input
document.getElementById('themeImageInput').addEventListener('change', e => {
  handleImageFile(e.target.files[0]);
});

// Drag and drop
const dropZone = document.getElementById('themeDropZone');

dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  handleImageFile(e.dataTransfer.files[0]);
});

// Keyboard activation for drop zone (Enter/Space)
dropZone.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    document.getElementById('themeImageInput').click();
  }
});

// Role picker toggles
['Primary', 'Accent'].forEach(role => {
  const btn   = document.getElementById(`rolePicker${role}`);
  const popup = document.getElementById(`rolePopup${role}`);

  btn.addEventListener('click', e => {
    e.stopPropagation();
    // Close the other popup first
    const other = role === 'Primary' ? 'Accent' : 'Primary';
    document.getElementById(`rolePopup${other}`).classList.add('hidden');
    popup.classList.toggle('hidden');
  });
});

// Close popups on outside click
document.addEventListener('click', () => {
  document.getElementById('rolePopupPrimary').classList.add('hidden');
  document.getElementById('rolePopupAccent').classList.add('hidden');
});

// Apply button
document.getElementById('themeApplyBtn').addEventListener('click', () => {
  if (!pendingPrimary || !pendingAccent) return;
  const theme = computeTheme(pendingPrimary, pendingAccent);
  localStorage.setItem(THEME_KEY, JSON.stringify(theme));
  showToast(T('toast_theme_applied'), 'success');
});

// Reset button
document.getElementById('themeResetBtn').addEventListener('click', () => {
  localStorage.removeItem(THEME_KEY);
  if (typeof removeStoredTheme === 'function') removeStoredTheme();
  showToast(T('toast_theme_reset'), '');
});
```

**Step 2: Verify the full feature flow**

1. Log in to admin, click "🎨 Farbschema" in the sidebar
2. Upload a colourful image (e.g. a landscape photo)
3. Confirm: thumbnail appears, 6 colour swatches shown, mini mockup updates with extracted colours
4. Click the Primary role picker — confirm popup shows 6 swatches
5. Pick a different swatch — confirm mockup header/hero updates live
6. Click "Apply Colour Scheme" — confirm success toast
7. Open `index.html` in a new tab — confirm site uses the new colours
8. Return to admin, click "Reset to Default" — confirm success toast
9. Reload `index.html` — confirm site is back to the original navy/teal scheme
10. Check browser console — no errors

**Step 3: Commit**

```bash
git add js/admin.js
git commit -m "feat: implement image colour extraction and theme apply/reset in admin"
```

---

## Done

All six tasks complete. The feature is fully functional:
- CSS vars renamed to semantic names throughout `styles.css`
- Theme persisted in `localStorage` as `bds_theme`, applied on every page load via `content.js`
- Admin section: drag-and-drop upload, Color Thief extraction, inline role picker, mini mockup preview, apply/reset
- Full DE/EN i18n support
