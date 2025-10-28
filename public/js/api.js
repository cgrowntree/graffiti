const API_BASE = '/api';

async function api(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'content-type': 'application/json' },
    ...opts,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getMessages(geohash, limit = 200) {
  return api(`/messages?geohash=${geohash}&limit=${limit}`);
}

export async function postMessage(payload) {
  return api('/messages', { method: 'POST', body: JSON.stringify(payload) });
}
