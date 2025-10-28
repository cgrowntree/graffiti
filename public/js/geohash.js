const B32 = '0123456789bcdefghjkmnpqrstuvwxyz';

export function encodeGeohash(lat, lon, precision) {
  let idx = 0; let bit = 0; let even = true; let geohash = '';
  let latMin = -90; let latMax = 90; let lonMin = -180; let lonMax = 180;
  while (geohash.length < precision) {
    if (even) {
      const lonMid = (lonMin + lonMax) / 2;
      if (lon > lonMid) { idx = (idx * 2) + 1; lonMin = lonMid; } else { idx *= 2; lonMax = lonMid; }
    } else {
      const latMid = (latMin + latMax) / 2;
      if (lat > latMid) { idx = (idx * 2) + 1; latMin = latMid; } else { idx *= 2; latMax = latMid; }
    }
    even = !even; bit += 1;
    if (bit === 5) { geohash += B32[idx]; bit = 0; idx = 0; }
  }
  return geohash;
}
