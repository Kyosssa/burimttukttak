import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { loadInputs } from '../scripts/lib/inputs.mjs';
import { isIndexable, heldSlugs } from '../scripts/lib/index-quality.mjs';
import { guideData } from '../scripts/lib/guides.mjs';
import { createSearchIndex, search } from '../src/search.mjs';
import { createMissingSearchApi } from '../functions/api/missing-search-core.mjs';
import { SITE_URL } from '../scripts/lib/html.mjs';

const { seed, registry } = loadInputs();
const expansion = JSON.parse(readFileSync(new URL('../data/content-expansion-2026-10-03.json', import.meta.url)));
const fixtures = JSON.parse(readFileSync(new URL('../docs/prebuild/14-search-quality-fixtures.json', import.meta.url)));
const html = path => readFileSync(new URL(`../dist/${path}`, import.meta.url), 'utf8');
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

test('second expansion adds 12 and promotes 4, preserves the original verified data, registry and holds', () => {
  assert.equal(expansion.records.length, 16);
  assert.equal(expansion.records.filter(r => r.action === 'added').length, 12);
  assert.equal(expansion.records.filter(r => r.action === 'promoted').length, 4);
  assert.equal(seed.items.length, 149);
  assert.equal(seed.items.filter(i => i.verification_status === 'verified').length, 135);
  assert.equal(seed.items.filter(i => i.verification_status === 'needs_research').length, 14);
  assert.equal(seed.items.filter(isIndexable).length, 124);
  assert.equal(heldSlugs.size, 11);
  assert.equal(hash(seed.items.filter(i => expansion.preserved_verified_slugs.includes(i.slug))), expansion.preserved_verified_sha256);
  assert.equal(hash(registry.sources.slice(0, 27)), expansion.preserved_registry_sha256);
  assert.equal(hash(seed.items.filter(i => i.verification_status === 'needs_research')), expansion.preserved_research_sha256);
  for (const record of expansion.records) {
    const item = seed.items.find(i => i.slug === record.slug);
    assert.equal(item.verified_at, '2026-10-03');
    assert.ok(isIndexable(item));
    assert.ok(existsSync(new URL(`../dist/item/${item.slug}/index.html`, import.meta.url)));
    assert.deepEqual(item.sources.map(s => s.url), record.urls);
    assert.ok(item.sources.every(s => s.checked_at === '2026-10-03'));
    for (const id of record.source_ids) assert.ok(registry.sources.some(s => s.id === id && s.geographic_scope === 'national'));
  }
});

test('all 149 names and aliases, including expanded material questions, never reach D1', async () => {
  const index = createSearchIndex(seed.items);
  const { handleMissingSearch } = createMissingSearchApi(seed, fixtures);
  const DB = { prepare() { assert.fail('Known name or alias must not reach D1'); } };
  for (const item of seed.items) for (const query of [item.name, ...item.aliases]) {
    const result = search(index, query);
    assert.equal(result.state, item.verification_status === 'verified' ? 'verified_item' : 'unverified_item', query);
    assert.equal(result.slug, item.slug, query);
    assert.equal(result.shouldTrackMissing, false, query);
    const response = await handleMissingSearch(new Request(`${SITE_URL}/api/missing-search`, { method: 'POST', headers: { Origin: SITE_URL, 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) }), { DB });
    assert.equal(response.status, 204, query);
  }
});

test('material and contents branches remain inside single pages without extrapolating methods', () => {
  const checks = {
    'food-wrap': [/PE/, /PVC/, /오염된 랩/, /재활용 불가/],
    'shower-cap': [/비닐 단일재질/, /실리콘/, /복합재질/],
    'scissors': [/모두 금속/, /여러 재질/, /충분히 감싼/],
    'cleaner-container': [/내용물을 완전히 제거한/, /남은 액체 세제의 폐기 방법을 안내하는 페이지가 아닙니다/],
    'powder-detergent': [/하수로 배출하지/, /액체 세제/],
    'bag': [/수거함의 허용/, /바퀴 달린 가방/, /크기가 커/],
    'razor': [/일회용/, /전기면도기/, /칼날/],
    'food-absorbent-pad': [/육류·생선/, /SAP/, /방습제/],
    'dental-floss': [/플라스틱 손잡이/, /치실통/, /구강세정기/]
  };
  for (const [slug, patterns] of Object.entries(checks)) for (const pattern of patterns) assert.match(html(`item/${slug}/index.html`), pattern, slug);
  for (const slug of ['shower-filter', 'shower-ball', 'perfume', 'shoes']) assert.ok(!existsSync(new URL(`../dist/item/${slug}/index.html`, import.meta.url)));
});

test('bathroom and clothing-bin guides provide distinct check sequences with no affiliate loader', () => {
  assert.equal(guideData.guides.length, 5);
  for (const slug of ['bathroom-cleanup', 'before-clothing-bin']) {
    const guide = guideData.guides.find(g => g.slug === slug);
    assert.equal(guide.steps.length, 3);
    assert.match(html(`guides/${slug}/index.html`), /content="index,follow"/);
    assert.doesNotMatch(html(`guides/${slug}/index.html`), /data-coupang|ads-partners\.coupang/);
    assert.ok(html('index.html').includes(`/guides/${slug}/`));
  }
  assert.match(html('guides/before-clothing-bin/index.html'), /전부 일반쓰레기라고 단정하지/);
  assert.match(html('guides/bathroom-cleanup/index.html'), /남은 액체 세제나/);
  assert.equal((html('sitemap.xml').match(/<loc>/g) ?? []).length, 141);
});
