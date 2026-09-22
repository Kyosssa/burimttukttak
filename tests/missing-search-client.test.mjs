import test from 'node:test';
import assert from 'node:assert/strict';
import { createMissingSearchReporter } from '../src/missing-search.mjs';

test('client calls the API only for missing state', async () => {
  const calls = [];
  const report = createMissingSearchReporter({ fetchImpl: async (...args) => { calls.push(args); return { ok: true }; } });
  for (const state of ['verified_item', 'unverified_item', 'empty_or_invalid']) assert.equal(await report('골프공', state), false);
  assert.equal(calls.length, 0);
  assert.equal(await report('골프공', 'missing'), true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], '/api/missing-search');
  assert.deepEqual(JSON.parse(calls[0][1].body), { query: '골프공' });
  assert.equal(calls[0][1].credentials, 'same-origin');
});

test('client limits repeated normalized queries in memory without an identifier', async () => {
  const calls = [];
  let clock = 1_000;
  const report = createMissingSearchReporter({ fetchImpl: async (...args) => { calls.push(args); return { ok: true }; }, now: () => clock, cooldownMs: 30_000 });
  assert.equal(await report('골프 공', 'missing'), true);
  assert.equal(await report(' 골프   공 ', 'missing'), false);
  clock += 30_001;
  assert.equal(await report('골프공', 'missing'), true);
  assert.equal(calls.length, 2);
  for (const options of calls.map(call => call[1])) {
    assert.deepEqual(Object.keys(JSON.parse(options.body)), ['query']);
    assert.ok(!/identifier|fingerprint|user|cookie/i.test(options.body));
  }
});

test('network and HTTP failures never reject or change the caller state', async () => {
  const networkFailure = createMissingSearchReporter({ fetchImpl: async () => { throw new Error('offline'); } });
  const httpFailure = createMissingSearchReporter({ fetchImpl: async () => ({ ok: false }) });
  await assert.doesNotReject(() => networkFailure('골프공', 'missing'));
  assert.equal(await httpFailure('새품목', 'missing'), false);
});
