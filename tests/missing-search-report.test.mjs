import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { READ_ONLY_SQL, WRANGLER_ARGS, safeRows } from '../scripts/report-missing-searches.mjs';

test('production report is a bounded, read-only Wrangler 3 query', () => {
  const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(packageJson.devDependencies.wrangler, '3.114.17');
  assert.equal(packageJson.scripts['report:missing-searches'], 'node scripts/report-missing-searches.mjs');
  assert.match(READ_ONLY_SQL, /^SELECT normalized_query, display_query, search_count, first_seen, last_seen FROM missing_searches WHERE search_count >= 2 ORDER BY search_count DESC, last_seen DESC LIMIT 20$/);
  assert.doesNotMatch(READ_ONLY_SQL, /\b(?:UPDATE|DELETE|INSERT|ALTER|DROP|CREATE|PRAGMA)\b/i);
  assert.deepEqual(WRANGLER_ARGS.slice(0, 3), ['d1', 'execute', 'burimttukttak-missing-search-prod']);
  for (const option of ['--remote', '--json', '--env', 'production', '--command']) assert.ok(WRANGLER_ARGS.includes(option), option);
  for (const option of ['--preview', '--local', '--file']) assert.ok(!WRANGLER_ARGS.includes(option), option);
});

test('report prints only five approved fields and omits unsafe legacy values', () => {
  const row = (query, count = 2) => ({ normalized_query: query, display_query: query, search_count: count, first_seen: '2026-09-23', last_seen: '2026-09-23', ip_address: 'PRIVATE' });
  const rows = safeRows([{ results: [row('새품목', 3), row('person@example.com'), row('https://example.com'), row('01012345678'), row('single', 1)] }]);
  assert.deepEqual(rows, [{ normalized_query: '새품목', display_query: '새품목', search_count: 3, first_seen: '2026-09-23', last_seen: '2026-09-23' }]);
  assert.ok(!JSON.stringify(rows).includes('PRIVATE'));
});
