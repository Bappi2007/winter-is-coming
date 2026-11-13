export class UpstreamError extends Error {
  constructor(message, status = 502, code = 'UPSTREAM_ERROR') {
    super(message);
    this.name = 'UpstreamError';
    this.status = status;
    this.code = code;
  }
}

export async function fetchJson(url, options = {}, label = 'Upstream service', timeoutMs = 12_000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new UpstreamError(`${label} returned HTTP ${response.status}.`, 502, 'UPSTREAM_BAD_RESPONSE');
    }

    try {
      return await response.json();
    } catch {
      throw new UpstreamError(`${label} returned an unreadable response.`, 502, 'UPSTREAM_INVALID_JSON');
    }
  } catch (error) {
    if (error instanceof UpstreamError) throw error;
    if (error.name === 'AbortError') {
      throw new UpstreamError(`${label} timed out. Please try again.`, 504, 'UPSTREAM_TIMEOUT');
    }
    throw new UpstreamError(`${label} is temporarily unavailable. Please try again.`, 502, 'UPSTREAM_UNAVAILABLE');
  } finally {
    clearTimeout(timeout);
  }
}
