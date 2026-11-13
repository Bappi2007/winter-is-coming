const DEFAULT_TTL_MS = 10 * 60 * 1000;
const MAX_ENTRIES = 500;

const cache = new Map();
const inFlight = new Map();

export function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return undefined;

  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return undefined;
  }

  // Refresh insertion order so frequently used entries survive the size cap.
  cache.delete(key);
  cache.set(key, entry);
  return entry.value;
}

export function setCached(key, value, ttlMs = DEFAULT_TTL_MS) {
  cache.delete(key);
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });

  while (cache.size > MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
}

export async function cachedRequest(key, request, ttlMs = DEFAULT_TTL_MS) {
  const hit = getCached(key);
  if (hit !== undefined) return hit;

  if (inFlight.has(key)) return inFlight.get(key);

  const pending = (async () => {
    const value = await request();
    setCached(key, value, ttlMs);
    return value;
  })();

  inFlight.set(key, pending);
  try {
    return await pending;
  } finally {
    inFlight.delete(key);
  }
}

export function clearCacheForTests() {
  cache.clear();
  inFlight.clear();
}
