/**
 * Cloudflare Worker — content API + news SSR for Chamisso-Grundschule
 *
 * Routes:
 *   GET  /api/content      → read from KV (auto-seeds from /content.json if empty)
 *   POST /api/content      → write to KV (requires Bearer WORKER_SECRET)
 *   GET  /api/ping         → auth probe
 *   GET  /aktuelles/:slug  → server-renders an individual news post from KV
 *                            using partials/post.html as a template, so admin-
 *                            published posts get correct <title>/<meta og:>
 *                            without re-deploying the static build.
 *   *                      → static asset fallthrough
 */

const CONTENT_KEY = 'bds_content';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/content') {
      if (request.method === 'GET')  return handleGetContent(request, env);
      if (request.method === 'POST') return handlePostContent(request, env);
      return new Response('Method Not Allowed', { status: 405 });
    }

    if (url.pathname === '/api/ping') {
      if (!isAuthed(request, env)) return jsonRes({ ok: false, error: 'Unauthorized' }, 401);
      return jsonRes({ ok: true });
    }

    const m = url.pathname.match(/^\/aktuelles\/([^/]+)\/?$/);
    if (m) return handlePostPage(decodeURIComponent(m[1]), request, env);

    return env.ASSETS.fetch(request);
  }
};

/* ── helpers ─────────────────────────────────────────────── */

function isAuthed(request, env) {
  return request.headers.get('Authorization') === `Bearer ${env.WORKER_SECRET}`;
}

function jsonRes(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function escHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatDate(iso) {
  const months = ['Jan.', 'Feb.', 'März', 'April', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sept.', 'Okt.', 'Nov.', 'Dez.'];
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso || '';
  return `${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}`;
}

async function loadContent(request, env) {
  let raw = await env.BDS_CONTENT.get(CONTENT_KEY);
  if (!raw) {
    try {
      const seedUrl = new URL('/content.json', request.url).toString();
      const seedRes = await env.ASSETS.fetch(new Request(seedUrl));
      if (seedRes.ok) {
        raw = await seedRes.text();
        await env.BDS_CONTENT.put(CONTENT_KEY, raw);
      }
    } catch (_) { /* ignore */ }
  }
  try { return raw ? JSON.parse(raw) : {}; } catch (_) { return {}; }
}

/* ── /api/content ────────────────────────────────────────── */

async function handleGetContent(request, env) {
  let data = await env.BDS_CONTENT.get(CONTENT_KEY);
  if (!data) {
    try {
      const seedUrl = new URL('/content.json', request.url).toString();
      const seedRes = await env.ASSETS.fetch(new Request(seedUrl));
      if (seedRes.ok) {
        data = await seedRes.text();
        await env.BDS_CONTENT.put(CONTENT_KEY, data);
      }
    } catch (_) { /* ignore */ }
  }
  return new Response(data || '{}', {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });
}

async function handlePostContent(request, env) {
  if (!isAuthed(request, env)) return jsonRes({ error: 'Unauthorized' }, 401);

  const body = await request.text();
  try { JSON.parse(body); }
  catch (_) { return jsonRes({ error: 'Invalid JSON' }, 400); }

  await env.BDS_CONTENT.put(CONTENT_KEY, body);
  return jsonRes({ ok: true });
}

/* ── /aktuelles/:slug SSR ─────────────────────────────────── */

async function fetchAsset(path, request, env) {
  const u = new URL(path, request.url).toString();
  const res = await env.ASSETS.fetch(new Request(u));
  if (!res.ok) throw new Error(`asset fetch failed: ${path} (${res.status})`);
  return res.text();
}

async function handlePostPage(slug, request, env) {
  const data = await loadContent(request, env);
  const posts = (data && Array.isArray(data.posts)) ? data.posts : [];
  const post  = posts.find(p => p && (p.slug === slug || p.id === slug));

  if (!post) {
    return new Response('Beitrag nicht gefunden.', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }

  let tpl, header, footer;
  try {
    tpl    = await fetchAsset('/partials/post.html',   request, env);
    header = await fetchAsset('/partials/header.html', request, env);
    footer = await fetchAsset('/partials/footer.html', request, env);
  } catch (e) {
    return new Response('Template error: ' + e.message, { status: 500 });
  }

  let routes;
  try { routes = JSON.parse(await fetchAsset('/pages/_routes.json', request, env)); }
  catch (_) { routes = { groups: [] }; }

  const navDesktop = (routes.groups || []).map(g => {
    if (g.children) {
      const items = g.children.map(c =>
        `<li role="none"><a role="menuitem" href="${escHtml(c.href)}">${escHtml(c.label)}</a></li>`
      ).join('');
      return `<li role="none" class="has-dropdown"><button class="nav-link dropdown-toggle" type="button" aria-haspopup="true" aria-expanded="false" role="menuitem">${escHtml(g.label)}<span class="dropdown-caret" aria-hidden="true">▾</span></button><ul class="dropdown-menu" role="menu">${items}</ul></li>`;
    }
    const cls = g.label === 'Kontakt' ? 'nav-cta' : '';
    return `<li role="none"><a role="menuitem" class="${cls}" href="${escHtml(g.href)}">${escHtml(g.label)}</a></li>`;
  }).join('');

  const navMobile = (routes.groups || []).map(g => {
    if (g.children) {
      const items = g.children.map(c =>
        `<li><a href="${escHtml(c.href)}">${escHtml(c.label)}</a></li>`
      ).join('');
      return `<details class="m-group"><summary>${escHtml(g.label)}</summary><ul>${items}</ul></details>`;
    }
    return `<a class="m-link" href="${escHtml(g.href)}">${escHtml(g.label)}</a>`;
  }).join('');

  header = header.replace('{{NAV_DESKTOP}}', navDesktop).replace('{{NAV_MOBILE}}', navMobile);

  const imageBlock = post.image
    ? `<img class="post-image" src="${escHtml(post.image)}" alt="${escHtml(post.title || '')}">`
    : '';

  const html = tpl
    .replace(/\{\{title\}\}/g,         escHtml(post.title || ''))
    .replace(/\{\{excerpt\}\}/g,       escHtml(post.excerpt || ''))
    .replace(/\{\{image\}\}/g,         escHtml(post.image || ''))
    .replace(/\{\{date\}\}/g,          escHtml(post.date || ''))
    .replace(/\{\{dateFormatted\}\}/g, escHtml(formatDate(post.date)))
    .replace(/\{\{imageBlock\}\}/g,    imageBlock)
    .replace(/\{\{body\}\}/g,          post.body || '')
    .replace(/\{\{HEADER\}\}/g,        header)
    .replace(/\{\{FOOTER\}\}/g,        footer);

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=60'
    }
  });
}
