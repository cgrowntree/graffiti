import { getMessages, postMessage } from './api.js';
import { encodeGeohash } from './geohash.js';
import { renderWall } from './ui.js';

const GEOHASH_PRECISION = 7; // ~153m tile

const statusEl = document.getElementById('status');
const landingEl = document.getElementById('landing');
const wallSection = document.getElementById('wallSection');
const wallEl = document.getElementById('wall');
const tileLabel = document.getElementById('tileLabel');
const composer = document.getElementById('composer');
const postBtn = document.getElementById('postBtn');
const msgEl = document.getElementById('msg');

function setStatus(t) { statusEl.textContent = t; }

async function loadWallFor(lat, lng) {
  const gh = encodeGeohash(lat, lng, GEOHASH_PRECISION);
  setStatus(`📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
  tileLabel.textContent = gh;
  const data = await getMessages(gh, 200);
  renderWall(wallEl, data.messages);
  landingEl.hidden = true;
  wallSection.hidden = false;
  composer.hidden = false;
  window.__current = { gh, lat, lng };
}

function requestLocationAndLoad() {
  setStatus('requesting location…');
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude, accuracy } = pos.coords;
    setStatus(`±${Math.round(accuracy)}m`);
    await loadWallFor(latitude, longitude);
  }, (err) => {
    alert(`location failed: ${err.message}`);
    setStatus('denied');
  }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
}

function onPostClick() {
  const txt = msgEl.value.trim();
  if (!txt) return;
  if (!window.__current) { alert('no location'); return; }
  const { gh, lat, lng } = window.__current;
  postMessage({ geohash: gh, text: txt, lat, lng })
    .then(() => getMessages(gh, 200))
    .then((data) => {
      msgEl.value = '';
      renderWall(wallEl, data.messages);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    })
    .catch((e) => alert(e.message));
}

postBtn.addEventListener('click', onPostClick);
document.getElementById('enterBtn').addEventListener('click', requestLocationAndLoad);
document.getElementById('brandLink').addEventListener('click', requestLocationAndLoad);
