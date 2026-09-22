import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import seed from '../docs/prebuild/burimttukttak-seed-v1.1.json' with { type: 'json' };
import fixtures from '../docs/prebuild/14-search-quality-fixtures.json' with { type: 'json' };
import { createMissingSearchApi, isAllowedOrigin, normalizeMissingQuery, UPSERT_SQL } from '../functions/api/missing-search-core.mjs';

const { handleMissingSearch, isKnownMissingSearchQuery } = createMissingSearchApi(seed, fixtures);

const endpoint = 'https://beorimttukttak.com/api/missing-search';
const request = (body, options = {}) => new Request(endpoint, {
  method: options.method ?? 'POST',
  headers: {
    Origin: options.origin ?? 'https://beorimttukttak.com',
    'Content-Type': options.contentType ?? 'application/json',
    ...(options.headers ?? {}),
  },
  body: (options.method ?? 'POST') === 'GET' ? undefined : (options.raw ?? JSON.stringify(body)),
});

function mockD1({ fail = false } = {}) {
  const rows = new Map();
  return {
    rows,
    prepares: 0,
    runs: 0,
    sql: [],
    bindings: [],
    prepare(sql) {
      this.prepares += 1;
      this.sql.push(sql);
      return {
        bind: (...values) => {
          this.bindings.push(values);
          return {
            run: async () => {
              this.runs += 1;
              if (fail) throw new Error('SQLITE_PRIVATE_DETAIL');
              const [normalized, display] = values;
              const prior = rows.get(normalized);
              rows.set(normalized, { normalized_query: normalized, display_query: display, search_count: (prior?.search_count ?? 0) + 1 });
              return { success: true };
            },
          };
        },
      };
    },
  };
}

test('normalizes Korean/English and repeated spaces while rejecting unsafe input', () => {
  assert.deepEqual(normalizeMissingQuery('  골프   공  '), { displayQuery: '골프 공', normalizedQuery: '골프 공' });
  assert.deepEqual(normalizeMissingQuery('  New   ITEM  '), { displayQuery: 'New ITEM', normalizedQuery: 'new item' });
  assert.equal(normalizeMissingQuery('e\u0301').displayQuery, 'é');
  for (const value of [null, 1, {}, '', '   ', '<b>골프공</b>', '골프\n공', '골프\u200b공', '가'.repeat(61)]) assert.equal(normalizeMissingQuery(value), null, String(value));
  assert.equal([...normalizeMissingQuery('가'.repeat(60)).displayQuery].length, 60);
});

test('allows only production, project preview and local development origins', () => {
  for (const origin of ['https://beorimttukttak.com', 'https://burimttukttak.pages.dev', 'https://feature.burimttukttak.pages.dev', 'http://localhost:8788', 'http://127.0.0.1:8788']) assert.equal(isAllowedOrigin(origin), true, origin);
  for (const origin of [null, '', 'https://www.beorimttukttak.com', 'https://evil.example', 'https://burimttukttak.pages.dev.evil.example', 'file:///tmp']) assert.equal(isAllowedOrigin(origin), false, String(origin));
});

test('canonical names, every alias, needs_research and known fixture matches perform zero D1 work', async () => {
  const db = mockD1();
  const known = new Set(seed.items.flatMap(item => [item.name, ...item.aliases]));
  for (const fixture of fixtures.cases.filter(item => ['verified_item', 'unverified_item'].includes(item.expected_state))) known.add(fixture.query);
  known.add('후라아팬'); // Non-alias fuzzy match to a known item.
  for (const query of known) {
    assert.equal(isKnownMissingSearchQuery(query), true, query);
    const result = await handleMissingSearch(request({ query }), { DB: db });
    assert.equal(result.status, 204, query);
  }
  assert.equal(db.prepares, 0);
  assert.equal(db.runs, 0);
});

test('a real missing query uses exactly one bound upsert and returns no content', async () => {
  const db = mockD1();
  const result = await handleMissingSearch(request({ query: '골프공' }), { DB: db });
  assert.equal(result.status, 204);
  assert.equal(await result.text(), '');
  assert.equal(db.prepares, 1);
  assert.equal(db.runs, 1);
  assert.deepEqual(db.bindings, [['골프공', '골프공']]);
  assert.equal(db.sql[0], UPSERT_SQL);
  assert.ok(!db.sql[0].includes('골프공'));
  assert.match(db.sql[0], /ON CONFLICT\(normalized_query\)/);
});

test('equivalent normalized queries increment one aggregate row', async () => {
  const db = mockD1();
  for (const query of ['  새   품목  ', '새 품목', '새    품목']) {
    assert.equal((await handleMissingSearch(request({ query }), { DB: db })).status, 204);
  }
  assert.equal(db.prepares, 3);
  assert.equal(db.runs, 3);
  assert.equal(db.rows.size, 1);
  assert.deepEqual(db.rows.get('새 품목'), { normalized_query: '새 품목', display_query: '새 품목', search_count: 3 });
});

test('fixture missing terms are accepted while known typo terms are refused', async () => {
  const db = mockD1();
  for (const fixture of fixtures.cases) {
    const result = await handleMissingSearch(request({ query: fixture.query }), { DB: db });
    if (fixture.expected_state === 'missing') assert.equal(result.status, 204, fixture.query);
  }
  assert.equal(db.runs, fixtures.cases.filter(item => item.expected_state === 'missing').length);
});

test('rejects malformed bodies, invalid input, methods, content types and origins before D1', async () => {
  const db = mockD1();
  const cases = [
    request(null, { method: 'GET' }),
    request({ query: '골프공' }, { contentType: 'text/plain' }),
    request({ query: '골프공' }, { origin: 'https://evil.example' }),
    request(null, { raw: '{not-json' }),
    request({ query: 123 }),
    request({ query: '' }),
    request({ query: '가'.repeat(61) }),
    request({ query: '제어\u0000문자' }),
    request({ query: '<script>alert(1)</script>' }),
    request({ query: '골프공' }, { headers: { 'Content-Length': '9999' } }),
  ];
  const statuses = [];
  for (const item of cases) statuses.push((await handleMissingSearch(item, { DB: db })).status);
  assert.deepEqual(statuses, [405, 415, 403, 400, 400, 400, 400, 400, 400, 400]);
  assert.equal(db.prepares, 0);
  assert.equal(db.runs, 0);
});

test('D1 failures return a generic error without SQL or internal details', async () => {
  const db = mockD1({ fail: true });
  const result = await handleMissingSearch(request({ query: '새품목' }), { DB: db });
  assert.equal(result.status, 500);
  assert.deepEqual(await result.json(), { error: 'internal_error' });
  assert.equal(db.runs, 1);
  assert.ok(!(await (await handleMissingSearch(request({ query: '또다른품목' }), {})).text()).includes('DB'));
});

test('D1 schema and Worker omit personal/request tracking fields', () => {
  const migration = readFileSync(new URL('../migrations/0001_missing_searches.sql', import.meta.url), 'utf8');
  const worker = readFileSync(new URL('../functions/api/missing-search-core.mjs', import.meta.url), 'utf8');
  for (const forbidden of ['ip_address', 'user_agent', 'email', 'fingerprint', 'latitude', 'longitude', 'cookie_id', 'referer']) {
    assert.ok(!migration.toLowerCase().includes(forbidden), forbidden);
  }
  for (const forbidden of ['request.cf', "get('user-agent')", "get('referer')", "get('cookie')"]) assert.ok(!worker.toLowerCase().includes(forbidden.toLowerCase()), forbidden);
  assert.match(migration, /normalized_query TEXT NOT NULL UNIQUE/);
  assert.match(migration, /search_count INTEGER NOT NULL DEFAULT 1/);
});

test('Pages Function entrypoint uses Wrangler 3 compatible JSON import assertions', () => {
  const worker = readFileSync(new URL('../functions/api/missing-search.js', import.meta.url), 'utf8');
  assert.match(worker, /\.json' assert \{ type: 'json' \}/);
  assert.doesNotMatch(worker, /\.json' with \{ type: 'json' \}/);
});

test('Wrangler config keeps DB bound to isolated production and preview databases', () => {
  const config = JSON.parse(readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8'));
  assert.equal(config.pages_build_output_dir, './dist');
  assert.deepEqual(config.d1_databases.map(({ binding, database_name, database_id, preview_database_id, migrations_dir }) => ({ binding, database_name, database_id, preview_database_id, migrations_dir })), [{
    binding: 'DB', database_name: 'burimttukttak-missing-search-prod', database_id: 'e6d5d8eb-426f-4621-995a-22bbd887b328', preview_database_id: 'burimttukttak-missing-search-local', migrations_dir: 'migrations',
  }]);
  assert.deepEqual(config.env.production.d1_databases, [{
    binding: 'DB', database_name: 'burimttukttak-missing-search-prod', database_id: 'e6d5d8eb-426f-4621-995a-22bbd887b328', migrations_dir: 'migrations',
  }]);
  assert.deepEqual(config.env.preview.d1_databases, [{
    binding: 'DB', database_name: 'burimttukttak-missing-search-preview', database_id: 'a7a271fb-1e15-4bbc-a6db-23e5c36263e3', migrations_dir: 'migrations',
  }]);
  assert.notEqual(config.env.production.d1_databases[0].database_id, config.env.preview.d1_databases[0].database_id);
});
