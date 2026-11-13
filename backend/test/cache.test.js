import test from 'node:test';
import assert from 'node:assert/strict';
import { cachedRequest, clearCacheForTests, getCached, setCached } from '../src/services/cache.js';

test('cache returns a value and drops it after its TTL expires', async () => {
  clearCacheForTests();
  setCached('sample', { value: 7 }, 10);
  assert.deepEqual(getCached('sample'), { value: 7 });
  await new Promise((resolve) => setTimeout(resolve, 15));
  assert.equal(getCached('sample'), undefined);
});

test('cachedRequest coalesces concurrent requests', async () => {
  clearCacheForTests();
  let calls = 0;
  const request = async () => {
    calls += 1;
    await new Promise((resolve) => setTimeout(resolve, 10));
    return { ok: true };
  };

  const [first, second] = await Promise.all([
    cachedRequest('same-key', request),
    cachedRequest('same-key', request),
  ]);

  assert.deepEqual(first, { ok: true });
  assert.deepEqual(second, { ok: true });
  assert.equal(calls, 1);
});
