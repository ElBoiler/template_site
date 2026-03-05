# Design: Image-Based Colour Scheme Picker

**Date:** 2026-03-05
**Status:** Approved

## Overview

Add a Colour Scheme section to the admin panel. The user uploads an image; the site extracts a palette, lets them assign Primary and Accent roles, previews the result, and applies it sitewide.

## Tech Stack Constraints

Pure static HTML/CSS/JS — no bundler, no npm. All dependencies via CDN. Colors managed as CSS custom properties on `:root`.

## CSS Variable Rename

All colour variables renamed to semantic names (mechanical find-and-replace across all files):

| Old | New |
|-----|-----|
| `--clr-brand` | `--clr-primary` |
| `--clr-teal` | `--clr-accent` |
| `--clr-teal-hover` | `--clr-accent-hover` |
| `--clr-teal-light` | `--clr-accent-light` |
| `--clr-white` | `--clr-bg` |
| All others | Unchanged (already semantic) |

## Architecture

### Color Extraction

- Library: **Color Thief** (CDN, ~4KB) — loaded in `admin.html` only
- Extracts 6 dominant colours via median cut on a `<canvas>` element
- All colours converted to HSL for role assignment logic

### Role Mapping Algorithm

1. Extract 6 `[r,g,b]` colours from uploaded image
2. Convert to HSL
3. Auto-assign: darkest (lowest L) → Primary; most saturated non-dark → Accent
4. If no colour is dark enough, programmatically darken the darkest extracted colour
5. **User can override** Primary and Accent by clicking a swatch selector (inline picker showing all 6 extracted colours)
6. Computed roles derived automatically:
   - `--clr-accent-hover`: accent darkened ~15%
   - `--clr-accent-light`: accent at ~10% opacity on white
   - `--clr-text`: derived from primary (slightly lightened if near-black, else fixed dark)
   - `--gradient-hero`: `linear-gradient(135deg, primary 0%, accent 100%)`
7. Neutrals not touched: `--clr-surface`, `--clr-border`, `--clr-muted`, `--clr-success`, `--clr-error`

### Persistence

- Storage key: `bds_theme` in `localStorage`
- Value: flat object of CSS var name → hex string
- Theme loader runs on every page load in both `index.html` and `admin.html`
- Applies vars directly to `document.documentElement.style` (overrides stylesheet defaults)
- Reset: delete `bds_theme`, remove inline styles → stylesheet defaults restored

## Admin UI

### Sidebar

New entry `🎨 Farbschema` (DE) / `🎨 Colour Scheme` (EN), placed above the Security divider.

### Section Layout

```
[ Drop zone: drag & drop or click, JPG/PNG/SVG/GIF ]

[ Image thumbnail ] [ Swatch 1 ] [ Swatch 2 ] [ Swatch 3 ]
                    [ Swatch 4 ] [ Swatch 5 ] [ Swatch 6 ]

Role assignment:
  Primary  [ ■ #hex ▼ ]   (click → inline picker of 6 swatches)
  Accent   [ ■ #hex ▼ ]   (click → inline picker of 6 swatches)

Preview:
  ┌──────────────────────────────┐
  │ ████ Header (primary)        │
  │  [ Accent btn ]  Heading     │
  │  ░ Card ░  Body text         │
  └──────────────────────────────┘

[ Apply Colour Scheme ]  [ Reset to Default ]
```

### Behaviour

- Upload triggers extraction immediately (no submit)
- Role picker shows inline swatch grid on click; selecting a swatch updates roles + preview live
- Mini mockup updates live on any role change
- Apply: saves `bds_theme` to localStorage, applies vars to `:root` immediately (admin page updates too)
- Reset: removes `bds_theme`, restores defaults
- New upload replaces pending palette but does not auto-apply

## i18n

New translation keys required for both DE and EN in `i18n.js`:

- `admin_nav_theme` — sidebar label
- `sec_theme_h2` — section heading
- `sec_theme_desc` — section description
- `sec_theme_drop` — drop zone label
- `sec_theme_formats` — supported formats hint
- `sec_theme_primary` — "Primary" role label
- `sec_theme_accent` — "Accent" role label
- `sec_theme_preview` — "Preview" label
- `sec_theme_apply` — "Apply Colour Scheme" button
- `sec_theme_reset` — "Reset to Default" button
- `toast_theme_applied` — success toast
- `toast_theme_reset` — reset toast

## Files Changed

| File | Change |
|------|--------|
| `css/styles.css` | Rename CSS vars |
| `css/admin.css` | Rename CSS vars + new theme section styles |
| `index.html` | Rename CSS var references in any inline styles |
| `admin.html` | Rename refs + new sidebar link + new section + Color Thief CDN |
| `js/main.js` | Add theme loader (runs on page load) |
| `js/admin.js` | Upload handler, extraction, role UI, apply/reset |
| `js/i18n.js` | New translation keys |
| `js/content.js` | Rename any CSS var references |
