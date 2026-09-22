import { createSearchIndex, normalize as normalizeForSearch, search } from '../../src/search.mjs';

export const UPSERT_SQL = `INSERT INTO missing_searches
  (normalized_query, display_query, search_count, first_seen, last_seen)
VALUES
  (?1, ?2, 1, datetime('now'), datetime('now'))
ON CONFLICT(normalized_query)
DO UPDATE SET
  search_count = search_count + 1,
  display_query = excluded.display_query,
  last_seen = datetime('now')`;

const MAX_BODY_LENGTH = 512;

export function normalizeMissingQuery(value) {
  if (typeof value !== 'string' || /[\p{Cc}\p{Cf}]/u.test(value) || /[<>]/u.test(value)) return null;
  const displayQuery = value.normalize('NFC').trim().replace(/\s+/gu, ' ');
  const length = [...displayQuery].length;
  if (length < 1 || length > 60) return null;
  return { displayQuery, normalizedQuery: displayQuery.toLowerCase() };
}

export function isAllowedOrigin(value) {
  if (!value) return false;
  try {
    const origin = new URL(value);
    if (origin.origin === 'https://beorimttukttak.com') return true;
    if (/^https:\/\/(?:[a-z0-9-]+\.)?burimttukttak\.pages\.dev$/i.test(origin.origin)) return true;
    return (origin.hostname === 'localhost' || origin.hostname === '127.0.0.1') && origin.protocol === 'http:';
  } catch {
    return false;
  }
}

function response(status, code, headers = {}) {
  return new Response(code ? JSON.stringify({ error: code }) : null, {
    status,
    headers: { ...(code ? { 'Content-Type': 'application/json; charset=utf-8' } : {}), 'Cache-Control': 'no-store', ...headers },
  });
}

export function createMissingSearchApi(seed, fixtures) {
  const knownIndex = createSearchIndex(seed.items);
  const knownFixtureQueries = new Set(fixtures.cases
    .filter(item => item.expected_state === 'verified_item' || item.expected_state === 'unverified_item')
    .map(item => normalizeForSearch(item.query)));

  function isKnownMissingSearchQuery(query) {
    const normalized = normalizeForSearch(query);
    if (knownFixtureQueries.has(normalized)) return true;
    const result = search(knownIndex, query);
    return result.state === 'verified_item' || result.state === 'unverified_item';
  }

  async function handleMissingSearch(request, env) {
    if (request.method !== 'POST') return response(405, 'method_not_allowed', { Allow: 'POST' });
    if (!isAllowedOrigin(request.headers.get('Origin'))) return response(403, 'forbidden');
    if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('Content-Type') ?? '')) return response(415, 'unsupported_media_type');
    const declaredLength = Number(request.headers.get('Content-Length'));
    if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_LENGTH) return response(400, 'invalid_request');

    let body;
    try {
      const text = await request.text();
      if (text.length > MAX_BODY_LENGTH) return response(400, 'invalid_request');
      body = JSON.parse(text);
    } catch {
      return response(400, 'invalid_request');
    }
    if (!body || Array.isArray(body) || typeof body !== 'object') return response(400, 'invalid_request');
    const query = normalizeMissingQuery(body.query);
    if (!query) return response(400, 'invalid_request');
    if (isKnownMissingSearchQuery(query.displayQuery)) return response(204);
    if (!env?.DB || typeof env.DB.prepare !== 'function') return response(500, 'internal_error');

    try {
      await env.DB.prepare(UPSERT_SQL).bind(query.normalizedQuery, query.displayQuery).run();
      return response(204);
    } catch {
      return response(500, 'internal_error');
    }
  }

  return { handleMissingSearch, isKnownMissingSearchQuery };
}
