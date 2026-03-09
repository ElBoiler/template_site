/**
 * Cloudflare Worker — persistent content storage via KV
 *
 * Routes:
 *   GET  /api/content  → read from KV (auto-seeds from /content.json if empty)
 *   POST /api/content  → write to KV  (requires Authorization: Bearer {WORKER_SECRET})
 *   GET  /api/ping     → connection test (requires Authorization: Bearer {WORKER_SECRET})
 *   *                  → pass-through to static assets
 *
 * Setup:
 *   1. Create a KV namespace in Cloudflare dashboard and add its ID to wrangler.jsonc
 *   2. wrangler secret put WORKER_SECRET
 *   3. wrangler deploy
 */

const CONTENT_KEY = 'bds_content';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/content') {
      if (request.method === 'GET')  return handleGet(request, env);
      if (request.method === 'POST') return handlePost(request, env);
      return new Response('Method Not Allowed', { status: 405 });
    }

    if (url.pathname === '/api/ping') {
      if (!isAuthed(request, env)) return jsonRes({ ok: false, error: 'Unauthorized' }, 401);
      return jsonRes({ ok: true });
    }

    return env.ASSETS.fetch(request);
  }
};

function isAuthed(request, env) {
  return request.headers.get('Authorization') === `Bearer ${env.WORKER_SECRET}`;
}

function jsonRes(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleGet(request, env) {
  let data = await env.BDS_CONTENT.get(CONTENT_KEY);

  if (!data) {
    // Auto-seed from committed content.json on first request when KV is empty
    try {
      const seedUrl = new URL('/content.json', request.url).toString();
      const seedRes = await env.ASSETS.fetch(new Request(seedUrl));
      if (seedRes.ok) {
        data = await seedRes.text();
        await env.BDS_CONTENT.put(CONTENT_KEY, data);
      }
    } catch (_) {
      // No seed file available — return empty object
    }
  }

  return new Response(data || '{}', {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });
}

async function handlePost(request, env) {
  if (!isAuthed(request, env)) return jsonRes({ error: 'Unauthorized' }, 401);

  const body = await request.text();
  try {
    JSON.parse(body);
  } catch (_) {
    return jsonRes({ error: 'Invalid JSON' }, 400);
  }

  await env.BDS_CONTENT.put(CONTENT_KEY, body);
  return jsonRes({ ok: true });
}
