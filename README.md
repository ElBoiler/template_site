# Chamisso-Grundschule — Website

Static-first website for the Chamisso-Grundschule Berlin, built on the
`template_site` base. Pure vanilla HTML/CSS/JS, no framework, with a
Cloudflare Worker for an editable content layer (KV-backed) and SSR for
news posts.

## Architecture

- **Build step (`build.js`)** — Node script with zero dependencies. Reads
  `partials/*.html` + `pages/**/*.json` and emits the final per-page
  static HTML at the repo root. Run with `npm run build`.
- **Static pages (~26)** — Generated `*.html` files at the repo root and
  in `unsere-schule/`, `unterricht/`, `fuer-eltern/`. Identical chrome
  (header nav, footer) is injected from partials so the menu can never
  drift between pages.
- **Runtime content (`js/content.js` + `content.json` + KV)** — Per-page
  text, news posts, contact info, homepage carousel & events all live in
  `content.json` and (in production) Cloudflare KV. The static HTML
  provides structure + sensible defaults; `content.js` overlays the live
  values on `DOMContentLoaded`.
- **Worker (`_worker.js`)** — Serves `/api/content` (GET/POST), `/api/ping`
  (auth probe) and SSRs individual news posts at `/aktuelles/:slug` so
  admin-published posts get correct `<title>`/`<meta og:>` without a
  re-deploy.
- **Admin (`/admin.html`)** — Minimal in-browser editor for posts
  (Beiträge), contact info and homepage events (Veranstaltungen). Auth
  uses the Worker secret as a Bearer token.

## Repo layout

```
.
├── build.js                 # Node assembler (no deps)
├── package.json             # build / dev / deploy scripts
├── _worker.js               # Cloudflare Worker (API + /aktuelles/:slug SSR)
├── wrangler.jsonc           # Worker config (KV binding, asset dir)
├── content.json             # KV seed (auto-loaded on first GET /api/content)
├── partials/                # head, header, footer, post template + page
│   ├── head.html
│   ├── header.html
│   ├── footer.html
│   ├── home.html
│   ├── page.html
│   ├── kontakt.html
│   ├── aktuelles.html
│   └── post.html
├── pages/                   # source for build.js (one JSON per route)
│   ├── _routes.json         # nav structure (drives header rendering)
│   ├── index.json
│   ├── aktuelles.json
│   ├── kontakt.json
│   ├── unsere-schule/...
│   ├── unterricht/...
│   └── fuer-eltern/...
├── css/
│   ├── styles.css           # design tokens + all components
│   └── admin.css            # admin-only styles
├── js/
│   ├── i18n.js              # mono-DE stub (kept for future re-enable)
│   ├── content.js           # fetch/render/save content
│   ├── main.js              # nav, dropdowns, mobile menu, carousel, form
│   └── admin.js             # admin editor
├── img/
│   ├── banner/              # carousel images (banner-01.jpg, …)
│   ├── news/                # news post images
│   └── logo.svg             # school logo (TBD — drop in as needed)
├── downloads/               # PDFs (Schulflyer, Krankmeldung, BVG-Antrag)
├── admin.html               # admin entry point
└── *.html                   # generated pages (do not edit by hand — re-run build)
```

## How to run

```bash
# Install nothing (zero deps). Just build:
npm run build

# Serve statically (any tool works). For full Worker behaviour:
npx wrangler@latest pages dev .

# Deploy:
npm run deploy        # = build + wrangler deploy
```

To enable admin saves, set the Worker secret:

```bash
npx wrangler secret put WORKER_SECRET
```

Then log in at `/admin.html` with that value.

## What ships in this iteration

**Done:**

- ✅ All 25+ pages from the source IA build successfully (homepage,
  Aktuelles, Kontakt, Impressum, Datenschutz, plus all dropdowns:
  Unsere Schule × 7, Unterricht × 6, Für Eltern × 4, EFöB,
  Schulsozialarbeit, Mittagessen, Förderverein).
- ✅ School-blue + warm-amber branding swap; Quicksand + Inter typography.
- ✅ Dropdown / mega-menu nav with ARIA `aria-expanded`, focus-within
  desktop hover, click-toggle for touch, ESC to close, keyboard
  navigation. Mobile menu uses native `<details>` for collapsible groups.
- ✅ Homepage hero carousel — autoplay, dots, prev/next,
  `prefers-reduced-motion` aware, pause on hover/focus.
- ✅ Aktuelle Veranstaltungen list (homepage), rendered from
  `homepage.veranstaltungen` array with a date badge.
- ✅ Welcome block (homepage) with editable heading + body.
- ✅ Quicklinks row: Sdui app, Schulflyer (PDF), Kontakt.
- ✅ Neuigkeiten preview on homepage (3 most recent), full list at
  `/aktuelles`, individual post at `/aktuelles/:slug` via Worker SSR.
- ✅ Contact form — full validation + `mailto:` fallback (matches the
  source site, which only has a mailto). No backend mail delivery.
- ✅ Admin: login (Worker secret), Beiträge editor (list/create/edit/delete),
  Kontakt fields, Veranstaltungen editor.
- ✅ Mono-DE; `js/i18n.js` kept as a stub for easy re-enable.
- ✅ Skip-link, semantic landmarks, ARIA labels on nav.
- ✅ Reduced-motion CSS media query.

**Deferred (documented for next iterations):**

- ❌ **Per-page content editor in admin.** Pages currently come from the
  static build (`pages/*.json`). To add: a "Seiten" tab in admin that
  picks a route, loads `data.pages[route]`, lets the user edit
  `title` + `body`, and saves. Code path is reserved — `content.js`
  already merges `data.pages[__PAGE_KEY]` over the static body.
- ❌ **Carousel image upload.** Currently the admin can edit URLs only.
  Real upload requires Cloudflare R2 + an upload endpoint in the Worker.
- ❌ **Real banner images.** The build references `/img/banner/banner-01.jpg`
  through `banner-03.jpg` — drop actual school photos there.
- ❌ **Real PDFs in `/downloads/`.** Folder exists; populate with the
  school flyer, Krankmeldungs-Formular, BVG-Antrag.
- ❌ **Search.** Not on the source site; not built.
- ❌ **Page subtitle in admin.** Subtitle field is in JSON (build-time)
  but not exposed in admin yet.
- ❌ **Backfilling sub-page bodies with the school's real content.** All
  ~20 sub-pages currently ship with placeholder bodies marked
  `<em>Inhalt folgt …</em>`. Replace per page in `pages/**/*.json` and
  re-run `npm run build`.

## How to add content

| Change                       | Edit               | Re-build needed? |
|------------------------------|--------------------|------------------|
| Branding (colors / fonts)    | `css/styles.css`   | No               |
| Nav structure / labels       | `pages/_routes.json` | **Yes**         |
| Add a new sub-page           | New `pages/.../foo.json` + add to `_routes.json` | **Yes** |
| Edit a sub-page body (now)   | `pages/.../foo.json` | **Yes**         |
| Add / edit a news post       | `/admin.html` → Beiträge | No (live)    |
| Edit contact info            | `/admin.html` → Kontakt   | No (live)    |
| Edit homepage events         | `/admin.html` → Veranstaltungen | No (live) |
| Drop a new PDF download      | `downloads/foo.pdf` | No              |
| Replace banner images        | `img/banner/banner-NN.jpg` | No        |
