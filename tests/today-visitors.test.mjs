import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleTodayVisitors, seoulDate as serverDate, SELECT_SQL, UPSERT_SQL } from '../functions/api/today-visitors.js';
import { loadTodayVisitors, seoulDate as clientDate } from '../src/today-visitors.mjs';
import { visitorAsset } from '../scripts/lib/html.mjs';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const endpoint = 'https://beorimttukttak.com/api/today-visitors';
const at = new Date('2026-09-22T15:00:00.000Z');

function mockD1() {
  const rows = new Map();
  const calls = [];
  return {
    rows, calls,
    prepare(sql) {
      return { bind: (...params) => ({ first: async () => {
        calls.push({ sql, params });
        if (sql === SELECT_SQL) return rows.has(params[0]) ? { count: rows.get(params[0]) } : null;
        assert.equal(sql, UPSERT_SQL);
        rows.set(params[0], (rows.get(params[0]) ?? 0) + 1);
        return { count: rows.get(params[0]) };
      } }) };
    },
  };
}

test('Asia/Seoul day rolls at UTC 15:00 on both server and client', () => {
  for (const date of [serverDate, clientDate]) {
    assert.equal(date(new Date('2026-09-22T14:59:59.999Z')), '2026-09-22');
    assert.equal(date(at), '2026-09-23');
  }
});

test('GET reads only, POST performs one bound atomic UPSERT, repeated POST increments same day', async () => {
  const db = mockD1();
  const get = () => handleTodayVisitors(new Request(endpoint), { DB: db }, at);
  const post = () => handleTodayVisitors(new Request(endpoint, { method: 'POST' }), { DB: db }, at);
  assert.deepEqual(await (await get()).json(), { date: '2026-09-23', count: 0 });
  assert.equal(db.rows.size, 0);
  assert.deepEqual(await (await post()).json(), { date: '2026-09-23', count: 1 });
  assert.deepEqual(await (await post()).json(), { date: '2026-09-23', count: 2 });
  assert.deepEqual(await (await get()).json(), { date: '2026-09-23', count: 2 });
  assert.equal(db.rows.size, 1);
  assert.deepEqual(db.calls.map(call => call.sql), [SELECT_SQL, UPSERT_SQL, UPSERT_SQL, SELECT_SQL]);
  assert.deepEqual(db.calls[1].params, ['2026-09-23', at.toISOString()]);
  assert.match(UPSERT_SQL, /ON CONFLICT\(date\).*count = count \+ 1.*RETURNING count/);
});

test('unsupported methods and D1 errors have JSON no-store responses without internal details', async () => {
  const db = mockD1();
  const rejected = await handleTodayVisitors(new Request(endpoint, { method: 'PUT' }), { DB: db }, at);
  assert.equal(rejected.status, 405);
  assert.equal(rejected.headers.get('cache-control'), 'no-store');
  assert.match(rejected.headers.get('content-type'), /application\/json/);
  assert.equal(db.calls.length, 0);
  const broken = await handleTodayVisitors(new Request(endpoint), { DB: { prepare() { throw new Error('SQLITE_PRIVATE_DETAIL'); } } }, at);
  assert.equal(broken.status, 503);
  assert.equal(broken.headers.get('cache-control'), 'no-store');
  assert.doesNotMatch(await broken.text(), /SQLITE_PRIVATE_DETAIL/);
});

test('POST ignores body, query and personal request fields', async () => {
  const db = mockD1();
  const request = new Proxy({ method: 'POST' }, {
    get(target, property) {
      if (property === 'method') return target.method;
      throw new Error(`Do not read ${String(property)}`);
    },
  });
  assert.equal((await handleTodayVisitors(request, { DB: db }, at)).status, 200);
  assert.equal(db.calls.length, 1);
  assert.deepEqual(db.calls[0].params, ['2026-09-23', at.toISOString()]);
  const migration = readFileSync(new URL('../migrations/0002_daily_visitors.sql', import.meta.url), 'utf8');
  assert.match(migration, /CREATE TABLE IF NOT EXISTS daily_visitors/);
  for (const field of ['date TEXT PRIMARY KEY', 'count INTEGER NOT NULL', 'last_updated TEXT NOT NULL']) assert.ok(migration.includes(field));
  assert.doesNotMatch(migration, /(?:ip|user_agent|referer|email|fingerprint|session_id)/i);
  assert.doesNotMatch(readFileSync(new URL('../functions/api/today-visitors.js', import.meta.url), 'utf8'), /request\.(?:json|text|headers|url|body)/);
});

function storage() {
  const values = new Map();
  return { values, getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
}

test('same tab posts once, subsequent page gets, and a new tab posts once', async () => {
  const methods = [];
  const fetchImpl = async (_path, options) => {
    methods.push(options.method);
    return new Response(JSON.stringify({ date: '2026-09-23', count: methods.length }), { status: 200 });
  };
  const firstTab = storage();
  const display = { textContent: '' };
  await loadTodayVisitors({ display, fetchImpl, storage: firstTab, now: at });
  await loadTodayVisitors({ display, fetchImpl, storage: firstTab, now: at });
  await loadTodayVisitors({ display, fetchImpl, storage: storage(), now: at });
  assert.deepEqual(methods, ['POST', 'GET', 'POST']);
  assert.equal(display.textContent, 'TODAY 3');
});

test('parallel starts do not double POST; blocked storage uses GET only', async () => {
  const methods = [];
  const fetchImpl = async (_path, options) => {
    methods.push(options.method);
    return new Response(JSON.stringify({ date: '2026-09-23', count: 7 }), { status: 200 });
  };
  const tab = storage();
  await Promise.all([1, 2].map(() => loadTodayVisitors({ display: { textContent: '' }, fetchImpl, storage: tab, now: at })));
  await loadTodayVisitors({ display: { textContent: '' }, fetchImpl, storage: null, now: at });
  assert.deepEqual(methods.sort(), ['GET', 'GET', 'POST']);
});

test('API failures keep fallback and a provisional tab claim prevents ambiguous retry', async () => {
  const tab = storage();
  const display = { textContent: '' };
  const methods = [];
  const fetchImpl = async (_path, options) => {
    methods.push(options.method);
    if (options.method === 'POST') throw new Error('network');
    return new Response(JSON.stringify({ date: '2026-09-23', count: 0 }), { status: 200 });
  };
  await loadTodayVisitors({ display, fetchImpl, storage: tab, now: at });
  assert.equal(display.textContent, 'TODAY —');
  await loadTodayVisitors({ display, fetchImpl, storage: tab, now: at });
  assert.deepEqual(methods, ['POST', 'GET']);
  assert.equal(display.textContent, 'TODAY 0');
});

test('every generated HTML footer has TODAY and exactly one immutable visitor asset', () => {
  const files = readdirSync(root, { recursive: true }).filter(path => path.endsWith('.html'));
  assert.equal(files.length, 115);
  for (const path of files) {
    const content = readFileSync(join(root, path), 'utf8');
    assert.match(content, /<footer>[\s\S]*id="today-visitors"[^>]*>TODAY —<\/p>/, path);
    assert.equal(content.split(`/assets/${visitorAsset}`).length - 1, 1, path);
  }
  assert.ok(readFileSync(join(root, 'assets', visitorAsset), 'utf8').includes("sessionStorage"));
});
