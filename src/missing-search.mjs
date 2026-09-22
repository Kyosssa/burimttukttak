import { normalize } from './search.mjs';

export function createMissingSearchReporter({ fetchImpl = globalThis.fetch, now = Date.now, cooldownMs = 30_000 } = {}) {
  const sentAt = new Map();
  return async function reportMissing(query, state) {
    if (state !== 'missing' || typeof fetchImpl !== 'function') return false;
    const key = normalize(query);
    if (!key) return false;
    const current = now();
    if (current - (sentAt.get(key) ?? -Infinity) < cooldownMs) return false;
    sentAt.set(key, current);
    try {
      const result = await fetchImpl('/api/missing-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
        credentials: 'same-origin',
        keepalive: true,
      });
      return result.ok;
    } catch {
      return false;
    }
  };
}
