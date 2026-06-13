/**
 * Cloudflare Worker — content API + news SSR for Chamisso-Grundschule
 *
 * Routes:
 *   GET  /api/content      → read from KV (auto-seeds from /content.json if empty)
 *   POST /api/content      → write to KV (requires Bearer WORKER_SECRET)
 *   GET  /api/ping         → auth probe
 *   POST /api/upload       → upload image to KV (requires Bearer auth); returns { url }
 *   GET  /uploads/:key     → serve uploaded image from KV
 *   GET  /aktuelles/:slug  → server-renders an individual news post from KV
 *                            using partials/post.html as a template, so admin-
 *                            published posts get correct <title>/<meta og:>
 *                            without re-deploying the static build.
 *   *                      → static asset fallthrough
 */

const CONTENT_KEY         = 'bds_content';
const ADMIN_PW_KEY        = '__admin_pw';
const TEACHER_PW_KEY      = '__teacher_pw';
const TEACHER_CONTENT_KEY = 'teacher_content';
const TEACHER_FILE_PREFIX = 'teacher-file:';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/content') {
      if (request.method === 'GET')  return handleGetContent(request, env);
      if (request.method === 'POST') return handlePostContent(request, env);
      return new Response('Method Not Allowed', { status: 405 });
    }

    if (url.pathname === '/api/ping') {
      if (!await isAuthed(request, env)) return jsonRes({ ok: false, error: 'Unauthorized' }, 401);
      return jsonRes({ ok: true });
    }

    if (url.pathname === '/api/upload') {
      if (request.method === 'POST') return handleUpload(request, env);
      return new Response('Method Not Allowed', { status: 405 });
    }

    const uploadMatch = url.pathname.match(/^\/uploads\/([^/]+)$/);
    if (uploadMatch) return handleServeUpload(decodeURIComponent(uploadMatch[1]), env);

    if (url.pathname === '/api/setup') {
      if (request.method === 'GET')  return handleGetSetup(env);
      if (request.method === 'POST') return handlePostSetup(request, env);
      return new Response('Method Not Allowed', { status: 405 });
    }

    if (url.pathname.startsWith('/api/teacher/')) {
      const sub = url.pathname.slice('/api/teacher/'.length);
      if (sub === 'setup') {
        if (request.method === 'GET')  return handleTeacherGetSetup(env);
        if (request.method === 'POST') return handleTeacherPostSetup(request, env);
        return new Response('Method Not Allowed', { status: 405 });
      }
      if (sub === 'ping') {
        if (!await isTeacherAuthed(request, env)) return jsonRes({ ok: false, error: 'Unauthorized' }, 401);
        return jsonRes({ ok: true });
      }
      if (sub === 'content') {
        if (request.method === 'GET')  return handleTeacherGetContent(request, env);
        if (request.method === 'POST') return handleTeacherPostContent(request, env);
        return new Response('Method Not Allowed', { status: 405 });
      }
      if (sub === 'upload') {
        if (request.method === 'POST') return handleTeacherUpload(request, env);
        return new Response('Method Not Allowed', { status: 405 });
      }
      return new Response('Not Found', { status: 404 });
    }

    const tfMatch = url.pathname.match(/^\/teacher-files\/([^/]+)$/);
    if (tfMatch) return handleServeTeacherFile(decodeURIComponent(tfMatch[1]), env);

    const m = url.pathname.match(/^\/aktuelles\/([^/]+)\/?$/);
    if (m) return handlePostPage(decodeURIComponent(m[1]), request, env);

    if (url.pathname === '/robots.txt')  return handleRobots(url.origin);
    if (url.pathname === '/sitemap.xml') return handleSitemap(url.origin, request, env);

    try {
      return await env.ASSETS.fetch(request);
    } catch (e) {
      console.error('asset fetch failed', e);
      return new Response('Not Found', { status: 404 });
    }
  }
};

/* ── helpers ─────────────────────────────────────────────── */

async function isAuthed(request, env) {
  const auth = request.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) return false;
  const provided = auth.slice(7);
  if (!provided) return false;
  if (env.WORKER_SECRET) return provided === env.WORKER_SECRET;
  const stored = await env.CHAMISSO_CONTENT.get(ADMIN_PW_KEY);
  return stored ? provided === stored : false;
}

async function hasAuthConfigured(env) {
  if (env.WORKER_SECRET) return true;
  return !!(await env.CHAMISSO_CONTENT.get(ADMIN_PW_KEY));
}

async function isTeacherAuthed(request, env) {
  const auth = request.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) return false;
  const provided = auth.slice(7);
  if (!provided) return false;
  const stored = await env.CHAMISSO_CONTENT.get(TEACHER_PW_KEY);
  return stored ? provided === stored : false;
}

async function isTeacherOrAdminAuthed(request, env) {
  return (await isAuthed(request, env)) || (await isTeacherAuthed(request, env));
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
  let raw = await env.CHAMISSO_CONTENT.get(CONTENT_KEY);
  if (!raw) {
    try {
      const seedUrl = new URL('/content.json', request.url).toString();
      const seedRes = await env.ASSETS.fetch(new Request(seedUrl));
      if (seedRes.ok) {
        raw = await seedRes.text();
        await env.CHAMISSO_CONTENT.put(CONTENT_KEY, raw);
      }
    } catch (_) { /* ignore */ }
  }
  try { return raw ? JSON.parse(raw) : {}; } catch (_) { return {}; }
}

/* ── /robots.txt + /sitemap.xml ──────────────────────────── */

function handleRobots(origin) {
  const body =
    'User-agent: *\n' +
    'Allow: /\n' +
    'Disallow: /admin.html\n' +
    'Disallow: /lehrerbereich\n' +
    '\n' +
    `Sitemap: ${origin}/sitemap.xml\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}

async function handleSitemap(origin, request, env) {
  // Stable build date — avoids every URL falsely claiming it changed today.
  const LASTMOD = '2026-06-12';
  const paths = new Set(['/']);

  try {
    const routes = JSON.parse(await fetchAsset('/pages/_routes.json', request, env));
    const add = (href) => {
      if (!href || href === '/lehrerbereich') return; // keep the private teacher area out
      paths.add(href);
    };
    (routes.groups || []).forEach(g => g.children ? g.children.forEach(c => add(c.href)) : add(g.href));
    (routes.footer || []).forEach(f => add(f.href));
  } catch (_) { /* fall back to just "/" */ }

  // Individual news posts (server-rendered at /aktuelles/:slug).
  try {
    const data  = await loadContent(request, env);
    const posts = (data && Array.isArray(data.posts)) ? data.posts : [];
    posts.forEach(p => { if (p && p.slug) paths.add(`/aktuelles/${p.slug}`); });
  } catch (_) { /* ignore */ }

  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    [...paths].map(p => `  <url><loc>${origin}${p}</loc><lastmod>${LASTMOD}</lastmod></url>`).join('\n') +
    '\n</urlset>\n';
  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' }
  });
}

/* ── /api/content ────────────────────────────────────────── */

async function handleGetContent(request, env) {
  let data = await env.CHAMISSO_CONTENT.get(CONTENT_KEY);
  if (!data) {
    try {
      const seedUrl = new URL('/content.json', request.url).toString();
      const seedRes = await env.ASSETS.fetch(new Request(seedUrl));
      if (seedRes.ok) {
        data = await seedRes.text();
        await env.CHAMISSO_CONTENT.put(CONTENT_KEY, data);
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
  if (!await isAuthed(request, env)) return jsonRes({ error: 'Unauthorized' }, 401);

  const body = await request.text();
  try { JSON.parse(body); }
  catch (_) { return jsonRes({ error: 'Invalid JSON' }, 400); }

  await env.CHAMISSO_CONTENT.put(CONTENT_KEY, body);
  return jsonRes({ ok: true });
}

/* ── /api/upload + /uploads/:key ─────────────────────────── */

const ALLOWED_IMAGE_TYPES = {
  'image/jpeg': 'jpg',
  'image/png':  'png',
  'image/gif':  'gif',
  'image/avif': 'avif',
};

async function handleUpload(request, env) {
  if (!await isAuthed(request, env)) return jsonRes({ error: 'Unauthorized' }, 401);

  let formData;
  try { formData = await request.formData(); }
  catch (_) { return jsonRes({ error: 'Invalid form data' }, 400); }

  const file = formData.get('file');
  if (!file || typeof file === 'string') return jsonRes({ error: 'No file provided' }, 400);
  if (!ALLOWED_IMAGE_TYPES[file.type]) return jsonRes({ error: 'Nur JPG, PNG, GIF und AVIF erlaubt' }, 400);
  if (file.size > 5 * 1024 * 1024) return jsonRes({ error: 'Datei zu groß (max. 5 MB)' }, 400);

  const ext = ALLOWED_IMAGE_TYPES[file.type];
  const rand = Math.random().toString(36).slice(2, 9);
  const key = `${Date.now()}-${rand}.${ext}`;

  const buf = await file.arrayBuffer();
  await env.CHAMISSO_CONTENT.put(`img:${key}`, buf, { metadata: { type: file.type } });

  return jsonRes({ ok: true, url: `/uploads/${key}` });
}

async function handleServeUpload(key, env) {
  const { value, metadata } = await env.CHAMISSO_CONTENT.getWithMetadata(`img:${key}`, { type: 'arrayBuffer' });
  if (!value) return new Response('Not Found', { status: 404 });
  const type = (metadata && metadata.type) || 'image/jpeg';
  return new Response(value, {
    headers: {
      'Content-Type': type,
      'Cache-Control': 'public, max-age=31536000, immutable',
    }
  });
}

/* ── /api/setup ───────────────────────────────────────────── */

async function handleGetSetup(env) {
  const configured = await hasAuthConfigured(env);
  return jsonRes({ needsSetup: !configured });
}

async function handlePostSetup(request, env) {
  if (await hasAuthConfigured(env)) return jsonRes({ error: 'Already configured' }, 403);
  let body;
  try { body = await request.json(); } catch (_) { return jsonRes({ error: 'Invalid JSON' }, 400); }
  if (!body || typeof body.password !== 'string' || body.password.length < 8) {
    return jsonRes({ error: 'Passwort muss mindestens 8 Zeichen haben' }, 400);
  }
  await env.CHAMISSO_CONTENT.put(ADMIN_PW_KEY, body.password);
  return jsonRes({ ok: true });
}

/* ── /api/teacher/* ──────────────────────────────────────── */

async function handleTeacherGetSetup(env) {
  const configured = !!(await env.CHAMISSO_CONTENT.get(TEACHER_PW_KEY));
  return jsonRes({ configured });
}

async function handleTeacherPostSetup(request, env) {
  if (!await isAuthed(request, env)) return jsonRes({ error: 'Unauthorized' }, 401);
  let body;
  try { body = await request.json(); } catch (_) { return jsonRes({ error: 'Invalid JSON' }, 400); }
  if (!body || typeof body.password !== 'string' || body.password.length < 8) {
    return jsonRes({ error: 'Passwort muss mindestens 8 Zeichen haben' }, 400);
  }
  await env.CHAMISSO_CONTENT.put(TEACHER_PW_KEY, body.password);
  return jsonRes({ ok: true });
}

async function handleTeacherGetContent(request, env) {
  if (!await isTeacherOrAdminAuthed(request, env)) return jsonRes({ error: 'Unauthorized' }, 401);
  const raw = await env.CHAMISSO_CONTENT.get(TEACHER_CONTENT_KEY);
  if (!raw) return new Response('{}', { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' } });
  return new Response(raw, { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' } });
}

async function handleTeacherPostContent(request, env) {
  if (!await isAuthed(request, env)) return jsonRes({ error: 'Unauthorized' }, 401);
  const body = await request.text();
  try { JSON.parse(body); } catch (_) { return jsonRes({ error: 'Invalid JSON' }, 400); }
  await env.CHAMISSO_CONTENT.put(TEACHER_CONTENT_KEY, body);
  return jsonRes({ ok: true });
}

const ALLOWED_TEACHER_TYPES = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'text/plain': 'txt',
  'application/zip': 'zip',
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/avif': 'avif',
};

async function handleTeacherUpload(request, env) {
  if (!await isAuthed(request, env)) return jsonRes({ error: 'Unauthorized' }, 401);
  let formData;
  try { formData = await request.formData(); } catch (_) { return jsonRes({ error: 'Invalid form data' }, 400); }
  const file = formData.get('file');
  if (!file || typeof file === 'string') return jsonRes({ error: 'No file provided' }, 400);
  if (!ALLOWED_TEACHER_TYPES[file.type]) return jsonRes({ error: 'Dateityp nicht erlaubt' }, 400);
  if (file.size > 10 * 1024 * 1024) return jsonRes({ error: 'Datei zu groß (max. 10 MB)' }, 400);
  const rand      = Math.random().toString(36).slice(2, 9);
  const rawLabel  = (formData.get('label') || file.name || 'datei').slice(0, 60);
  const safeLabel = rawLabel.replace(/[^\w.\-äöüÄÖÜß]/g, '_');
  const key       = `${Date.now()}-${rand}-${safeLabel}`;
  const buf       = await file.arrayBuffer();
  await env.CHAMISSO_CONTENT.put(`${TEACHER_FILE_PREFIX}${key}`, buf, { metadata: { type: file.type, name: safeLabel } });
  return jsonRes({ ok: true, key });
}

async function handleServeTeacherFile(key, env) {
  const { value, metadata } = await env.CHAMISSO_CONTENT.getWithMetadata(
    `${TEACHER_FILE_PREFIX}${key}`, { type: 'arrayBuffer' }
  );
  if (!value) return new Response('Not Found', { status: 404 });
  const type = (metadata && metadata.type) || 'application/octet-stream';
  const name = (metadata && metadata.name) || key;
  return new Response(value, {
    headers: {
      'Content-Type': type,
      'Content-Disposition': `attachment; filename="${name}"`,
      'Cache-Control': 'private, max-age=3600',
    }
  });
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
