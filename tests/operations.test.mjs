import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import seed from '../docs/prebuild/burimttukttak-seed-v1.1.json' with { type: 'json' };
import registry from '../docs/prebuild/12-source-registry-v1.json' with { type: 'json' };
import { createSourceHealthReport } from '../scripts/source-health.mjs';

const seedUrl = new URL('../docs/prebuild/burimttukttak-seed-v1.1.json', import.meta.url);
const digest = () => createHash('sha256').update(readFileSync(seedUrl)).digest('hex');

test('source health is deterministic, report-only and never mutates Seed', () => {
  const before = digest();
  const current = createSourceHealthReport({ asOf: new Date('2026-09-22T00:00:00Z') });
  const due = createSourceHealthReport({ asOf: new Date('2026-10-07T00:00:00Z') });
  assert.equal(digest(), before);
  assert.equal(current.mode, 'report_only_no_network_no_seed_write');
  assert.equal(current.summary.reviewDueItems, 0);
  assert.equal(current.summary.unmappedSources, 0);
  assert.ok(due.summary.reviewDueItems > 0);
  assert.equal(due.sources.find(source => source.id === 'me-recycling-guideline').status, 'current');
  assert.equal(due.sources.find(source => source.id === 'official-disposal-portal').status, 'review_due');
  assert.equal(due.sources.find(source => source.id === 'ewaste-pickup').status, 'review_due');
});

test('data changelog establishes one source-backed baseline per verified item', () => {
  const changes = JSON.parse(readFileSync(new URL('../data/changelog.json', import.meta.url), 'utf8'));
  const verified = seed.items.filter(item => item.verification_status === 'verified');
  const sourceIds = new Set(registry.sources.map(source => source.id));
  assert.equal(changes.length, verified.length);
  assert.deepEqual(new Set(changes.map(change => change.item_slug)), new Set(verified.map(item => item.slug)));
  for (const change of changes) {
    assert.equal(change.type, 'verified');
    assert.ok(change.source_ids.length > 0, change.item_slug);
    assert.ok(change.source_ids.every(id => sourceIds.has(id)), change.item_slug);
  }
});

test('GitHub Actions workflow has valid required structure and cannot deploy or write', () => {
  const workflow = readFileSync(new URL('../.github/workflows/quality.yml', import.meta.url), 'utf8');
  for (const token of ['name: Quality checks', 'on:', 'push:', 'pull_request:', 'workflow_dispatch:', 'schedule:', 'jobs:', 'runs-on: ubuntu-latest', 'uses: actions/checkout@v4', 'uses: actions/setup-node@v4', 'run: npm run preflight']) assert.ok(workflow.includes(token), token);
  assert.equal((workflow.match(/cron:/g) ?? []).length, 2);
  assert.match(workflow, /permissions:\s*\n  contents: read/);
  assert.match(workflow, /persist-credentials: false/);
  assert.doesNotMatch(workflow, /\b(?:deploy|wrangler|curl|gh\s)\b/i);
});

test('preflight command groups every required local release gate', () => {
  const preflight = readFileSync(new URL('../scripts/preflight.mjs', import.meta.url), 'utf8');
  for (const gate of ['Seed validation', 'Search fixtures', 'Production build', 'Full tests', 'Generated artifact audit', 'Source review schedule']) assert.ok(preflight.includes(gate), gate);
  const audit = readFileSync(new URL('../scripts/audit-dist.mjs', import.meta.url), 'utf8');
  for (const gate of ['sitemap', 'broken internal links', 'index policy', 'local Preview real 404', 'automatic external requests']) assert.ok(audit.includes(gate), gate);
});
