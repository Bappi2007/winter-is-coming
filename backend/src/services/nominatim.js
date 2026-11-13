import { cachedRequest } from './cache.js';
import { fetchJson } from './http.js';

const NOMINATIM_REVERSE_URL = process.env.NOMINATIM_REVERSE_URL || 'https://nominatim.openstreetmap.org/reverse';
let lastRequestAt = 0;
let requestQueue = Promise.resolve();

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function rateLimitedReverse(url) {
  const run = requestQueue.then(async () => {
    const elapsed = Date.now() - lastRequestAt;
    if (elapsed < 1_100) await wait(1_100 - elapsed);
    lastRequestAt = Date.now();
    return fetchJson(url, {
      headers: {
        'User-Agent': process.env.NOMINATIM_USER_AGENT || 'WinterIsComing/1.0 (weather web app)',
        ...(process.env.NOMINATIM_CONTACT ? { 'From': process.env.NOMINATIM_CONTACT } : {}),
      },
    }, 'OpenStreetMap reverse geocoding', 4_500);
  });

  // Keep the queue usable after a failed request.
  requestQueue = run.catch(() => undefined);
  return run;
}

export async function reverseGeocode(latitude, longitude) {
  const lat = Number(latitude.toFixed(4));
  const lon = Number(longitude.toFixed(4));
  const key = `reverse:${lat}:${lon}`;

  return cachedRequest(key, async () => {
    const params = new URLSearchParams({
      format: 'jsonv2',
      lat: String(lat),
      lon: String(lon),
      zoom: '10',
      addressdetails: '1',
    });
    const data = await rateLimitedReverse(`${NOMINATIM_URL}?${params}`);
    const address = data?.address ?? {};
    const name = data?.name
      || address.city
      || address.town
      || address.village
      || address.municipality
      || address.county
      || address.state
      || 'Your location';

    return {
      name,
      admin1: address.state ?? address.region ?? null,
      country: address.country ?? null,
      displayName: data?.display_name ?? null,
    };
  });
}
