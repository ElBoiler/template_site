#!/usr/bin/env node
/**
 * Static page assembler for the Chamisso-Grundschule site.
 *
 * Reads:
 *   partials/head.html        — <head> contents (mustache-style {{title}}/{{description}})
 *   partials/header.html      — top nav + mobile menu (with {{NAV_DESKTOP}} / {{NAV_MOBILE}} slots)
 *   partials/footer.html      — site footer
 *   partials/page.html        — generic content-page template
 *   partials/home.html        — homepage template
 *   partials/aktuelles.html   — news listing template
 *   partials/kontakt.html     — contact-form template
 *   pages/_routes.json        — nav structure (drives header rendering)
 *   pages/**\/*.json           — one JSON per route → emits matching .html at repo root
 *
 * Writes pure static HTML files at repo root, ready for `wrangler pages dev .`
 * or any static host. Runtime content (per-page text, news posts, contact info)
 * still lives in content.json / KV and renders via js/content.js.
 *
 * Zero dependencies. Run with:  npm run build
 */

'use strict';

const fs   = require('node:fs');
const path = require('node:path');

const ROOT       = __dirname;
const PARTIALS   = path.join(ROOT, 'partials');
const PAGES_DIR  = path.join(ROOT, 'pages');

/* ── Helpers ─────────────────────────────────────────────── */

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
}

/** Replace all {{key}} placeholders. Missing keys → empty string (logged). */
function fill(template, vars) {
  return template.replace(/\{\{([A-Za-z0-9_]+)\}\}/g, (m, key) => {
    if (!(key in vars)) {
      console.warn(`  ⚠ missing template var: ${key}`);
      return '';
    }
    return vars[key] == null ? '' : String(vars[key]);
  });
}

function escAttr(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function escText(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Walk pages/ directory, collecting *.json files (excluding _routes.json). */
function walkPages(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkPages(full, out);
    } else if (entry.isFile() && entry.name.endsWith('.json') && !entry.name.startsWith('_')) {
      out.push(full);
    }
  }
  return out;
}

/* ── Nav rendering ───────────────────────────────────────── */

function renderDesktopNav(routes) {
  return routes.groups.map(g => {
    if (g.children) {
      const items = g.children.map(c =>
        `<li role="none"><a role="menuitem" href="${escAttr(c.href)}">${escText(c.label)}</a></li>`
      ).join('');
      return (
        `<li role="none" class="has-dropdown">` +
          `<button class="nav-link dropdown-toggle" type="button" aria-haspopup="true" aria-expanded="false" role="menuitem">` +
            `${escText(g.label)}<span class="dropdown-caret" aria-hidden="true">▾</span>` +
          `</button>` +
          `<ul class="dropdown-menu" role="menu">${items}</ul>` +
        `</li>`
      );
    }
    const cls = g.label === 'Kontakt' ? 'nav-cta' : '';
    return `<li role="none"><a role="menuitem" class="${cls}" href="${escAttr(g.href)}">${escText(g.label)}</a></li>`;
  }).join('');
}

function renderMobileNav(routes) {
  return routes.groups.map(g => {
    if (g.children) {
      const items = g.children.map(c =>
        `<li><a href="${escAttr(c.href)}">${escText(c.label)}</a></li>`
      ).join('');
      return (
        `<details class="m-group">` +
          `<summary>${escText(g.label)}</summary>` +
          `<ul>${items}</ul>` +
        `</details>`
      );
    }
    return `<a class="m-link" href="${escAttr(g.href)}">${escText(g.label)}</a>`;
  }).join('');
}

/* ── Page rendering ──────────────────────────────────────── */

function buildHead(page) {
  const headTpl = read(path.join(PARTIALS, 'head.html'));
  return fill(headTpl, {
    title: escText(page.title),
    description: escAttr(page.description || page.title)
  });
}

function buildHeader(routes) {
  const tpl = read(path.join(PARTIALS, 'header.html'));
  return tpl
    .replace('{{NAV_DESKTOP}}', renderDesktopNav(routes))
    .replace('{{NAV_MOBILE}}',  renderMobileNav(routes));
}

function buildFooter() {
  return read(path.join(PARTIALS, 'footer.html'));
}

function outputPathFor(page) {
  // "/" → index.html ; "/foo" → foo.html ; "/foo/bar" → foo/bar.html
  const key = page.key === '/' ? '/index' : page.key;
  return path.join(ROOT, key.slice(1) + '.html');
}

function renderPage(page, header, footer) {
  const tplName =
    page.template === 'home'      ? 'home.html'      :
    page.template === 'aktuelles' ? 'aktuelles.html' :
    page.template === 'kontakt'   ? 'kontakt.html'   :
                                    'page.html';

  const tpl = read(path.join(PARTIALS, tplName));
  const head = buildHead(page);

  const subtitleBlock = page.subtitle
    ? `<p class="page-subtitle">${escText(page.subtitle)}</p>`
    : '';

  return fill(tpl, {
    HEAD: head,
    HEADER: header,
    FOOTER: footer,
    title: escText(page.title),
    eyebrow: escText(page.eyebrow || ''),
    subtitleBlock,
    body: page.body || '',  // raw HTML by design
    pageKey: escAttr(page.key),
    pageSlug: escAttr(page.slug)
  });
}

/* ── Main ────────────────────────────────────────────────── */

function main() {
  const routes = JSON.parse(read(path.join(PAGES_DIR, '_routes.json')));
  const header = buildHeader(routes);
  const footer = buildFooter();

  const pageFiles = walkPages(PAGES_DIR);
  console.log(`Building ${pageFiles.length} pages...`);

  let count = 0;
  for (const file of pageFiles) {
    const page = JSON.parse(read(file));
    if (!page.key) {
      console.warn(`  ⚠ ${path.relative(ROOT, file)} has no "key", skipping`);
      continue;
    }
    const html = renderPage(page, header, footer);
    const out  = outputPathFor(page);
    write(out, html);
    console.log(`  ✓ ${page.key}  →  ${path.relative(ROOT, out)}`);
    count++;
  }

  console.log(`\n✅ Built ${count} pages.`);
}

main();
