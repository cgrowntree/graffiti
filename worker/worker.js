export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (!url.pathname.startsWith('/api/')) return new Response('ok', { status: 200 });

    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'content-type',
    };
    if (req.method === 'OPTIONS') return new Response('', { headers: cors });

    try {
      if (url.pathname === '/api/messages' && req.method === 'GET') return listMessages(url, env, cors);
      if (url.pathname === '/api/messages' && req.method === 'POST') return postMessage(req, env, cors);
      return new Response('not found', { status: 404, headers: cors });
    } catch (e) {
      return new Response(e.message || 'server error', { status: 500, headers: cors });
    }
  },
};

async function listMessages(url, env, cors) {
  const geohash = url.searchParams.get('geohash');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '100', 10), 200);
  if (!geohash) throw new Error('geohash required');
  const rs = await env.DB
    .prepare('SELECT id, geohash, text, created_at FROM messages WHERE geohash = ? ORDER BY created_at DESC LIMIT ?')
    .bind(geohash, limit)
    .all();
  return json({ messages: rs.results || [] }, cors);
}

async function postMessage(req, env, cors) {
  const body = await req.json();
  const { geohash, text, lat, lng } = body || {};
  if (!geohash || !text) throw new Error('geohash and text required');
  if (typeof lat !== 'number' || typeof lng !== 'number') throw new Error('lat/lng required');

  const serverGh = encodeGeohash(lat, lng, 7);
  if (serverGh !== geohash) return new Response('outside tile', { status: 403, headers: cors });

  // optional KV rate limit: 1 post per 15s per IP
  const ip = req.headers.get('cf-connecting-ip') || '0.0.0.0';
  const key = `rl:${ip}`;
  const now = Date.now();
  const last = await env.KV?.get(key);
  if (last && now - parseInt(last, 10) < 15000) return new Response('slow down', { status: 429, headers: cors });
  await env.KV?.put(key, String(now), { expirationTtl: 20 });

  const id = crypto.randomUUID();
  const clean = text.slice(0, 280);
  await env.DB.exec(
    'INSERT INTO messages (id, geohash, text, lat, lng, created_at) VALUES (?, ?, ?, ?, ?, datetime("now"))',
    [id, geohash, clean, lat, lng],
  );
  return json({ ok: true, id }, cors);
}

function json(data, headers = {}) {
  return new Response(JSON.stringify(data), { headers: { 'content-type': 'application/json', ...headers } });
}

const B32S = '0123456789bcdefghjkmnpqrstuvwxyz';
function encodeGeohash(lat, lon, precision = 7) {
  let idx = 0; let bit = 0; let even = true; let geohash = '';
  let latMin = -90; let latMax = 90; let lonMin = -180; let lonMax = 180;
  while (geohash.length < precision) {
    if (even) { const lonMid = (lonMin + lonMax) / 2; if (lon > lonMid) { idx = (idx * 2) + 1; lonMin = lonMid; } else { idx *= 2; lonMax = lonMid; } }
    else { const latMid = (latMin + latMax) / 2; if (lat > latMid) { idx = (idx * 2) + 1; latMin = latMid; } else { idx *= 2; latMax = latMid; } }
    even = !even; bit += 1; if (bit === 5) { geohash += B32S[idx]; bit = 0; idx = 0; }
  }
  return geohash;
}
