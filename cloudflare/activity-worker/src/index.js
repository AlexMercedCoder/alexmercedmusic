const siteOrigin = 'https://alexmercedmusic.com';
const actions = new Set(['view', 'play', 'listen', 'download']);
const slugPattern = /^[a-z0-9][a-z0-9-]{0,119}$/;
const jsonHeaders = { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*' };

function eventHeaders() {
  return {
    'access-control-allow-origin': siteOrigin,
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'vary': 'Origin',
  };
}

function json(value, status = 200, headers = {}) {
  return new Response(JSON.stringify(value), { status, headers: { ...jsonHeaders, ...headers } });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/health' && request.method === 'GET') return json({ status: 'ok' });
    if (url.pathname === '/event' && request.method === 'OPTIONS') {
      return request.headers.get('origin') === siteOrigin
        ? new Response(null, { status: 204, headers: eventHeaders() })
        : new Response(null, { status: 403 });
    }
    if (url.pathname === '/event' && request.method === 'POST') {
      if (request.headers.get('origin') !== siteOrigin) return json({ error: 'Origin not allowed.' }, 403);
      if (Number(request.headers.get('content-length') ?? 0) > 512) return json({ error: 'Event too large.' }, 413, eventHeaders());
      let event;
      try {
        const body = await request.text();
        if (body.length > 512) return json({ error: 'Event too large.' }, 413, eventHeaders());
        event = JSON.parse(body);
      }
      catch { return json({ error: 'Invalid JSON.' }, 400, eventHeaders()); }
      if (!slugPattern.test(event?.song) || !actions.has(event?.action)) {
        return json({ error: 'Invalid event.' }, 400, eventHeaders());
      }
      const day = new Date().toISOString().slice(0, 10);
      await env.ACTIVITY_DB.prepare(`
        INSERT INTO song_activity_daily (day, song_slug, action, count)
        VALUES (?, ?, ?, 1)
        ON CONFLICT (day, song_slug, action) DO UPDATE SET count = count + 1
      `).bind(day, event.song, event.action).run();
      return new Response(null, { status: 204, headers: eventHeaders() });
    }
    if (url.pathname === '/top' && request.method === 'GET') {
      const cached = await caches.default.match(request);
      if (cached) return cached;
      const windowDays = 90;
      const from = new Date(Date.now() - (windowDays - 1) * 86400000).toISOString().slice(0, 10);
      const result = await env.ACTIVITY_DB.prepare(`
        SELECT song_slug AS song,
          SUM(count) AS total,
          SUM(CASE WHEN action = 'view' THEN count ELSE 0 END) AS views,
          SUM(CASE WHEN action = 'play' THEN count ELSE 0 END) AS plays,
          SUM(CASE WHEN action = 'listen' THEN count ELSE 0 END) AS listens,
          SUM(CASE WHEN action = 'download' THEN count ELSE 0 END) AS downloads
        FROM song_activity_daily
        WHERE day >= ?
        GROUP BY song_slug
        ORDER BY total DESC, downloads DESC, plays DESC, song_slug ASC
        LIMIT 100
      `).bind(from).all();
      const items = result.results.map((row) => ({
        song: row.song,
        total: Number(row.total),
        views: Number(row.views),
        plays: Number(row.plays),
        listens: Number(row.listens),
        downloads: Number(row.downloads),
      }));
      const response = json({ windowDays, asOf: new Date().toISOString(), items }, 200, { 'cache-control': 'public, max-age=300' });
      ctx.waitUntil(caches.default.put(request, response.clone()));
      return response;
    }
    return json({ error: 'Not found.' }, 404);
  },
};
