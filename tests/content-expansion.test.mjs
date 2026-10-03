import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { loadInputs } from '../scripts/lib/inputs.mjs';
import { guideData, guidePaths, validateGuides, recentItems } from '../scripts/lib/guides.mjs';
import { isIndexable, heldSlugs } from '../scripts/lib/index-quality.mjs';
import { createSearchIndex, search } from '../src/search.mjs';
import { createMissingSearchApi } from '../functions/api/missing-search-core.mjs';
import { SITE_URL, escapeHtml } from '../scripts/lib/html.mjs';

const { seed, registry } = loadInputs();
const expansion = JSON.parse(readFileSync(new URL('../data/content-expansion-2026-09-30.json', import.meta.url)));
const read = path => readFileSync(new URL(`../dist/${path}`, import.meta.url), 'utf8');
const changes = JSON.parse(readFileSync(new URL('../data/changelog.json', import.meta.url)));
const fixtures = JSON.parse(readFileSync(new URL('../docs/prebuild/14-search-quality-fixtures.json', import.meta.url)));
const { handleMissingSearch } = createMissingSearchApi(seed, fixtures);

test('expansion is 17 new and 2 promoted, keeping all 11 holds', () => {
  assert.equal(expansion.records.length, 19);
  assert.equal(expansion.candidates.length, 50);
  assert.equal(new Set(expansion.candidates.map(candidate => candidate.name.normalize('NFKC').replace(/\s/g, ''))).size, 50);
  assert.equal(expansion.records.filter(record => record.action === 'added').length, 17);
  assert.equal(expansion.records.filter(record => record.action === 'promoted').length, 2);
  assert.equal(seed.items.length, 149);
  assert.equal(seed.items.filter(isIndexable).length, 124);
  assert.equal(heldSlugs.size, 11);
  for (const record of expansion.records) {
    const item = seed.items.find(item => item.slug === record.slug);
    assert.equal(item.sources[0].url, record.url);
    assert.equal(item.sources[0].checked_at, '2026-09-30');
    assert.ok(registry.sources.some(source => source.id === record.source_id && source.url === record.url));
    assert.ok(existsSync(new URL(`../dist/item/${record.slug}/index.html`, import.meta.url)));
  }
});

test('every expanded canonical name and alias finds the right item and performs zero D1 operations', async () => {
  const index = createSearchIndex(seed.items);
  const db = { prepare() { assert.fail('Known expansion query must never touch D1'); } };
  for (const record of expansion.records) {
    const item = seed.items.find(item => item.slug === record.slug);
    for (const query of [item.name, ...item.aliases]) {
      const result = search(index, query);
      assert.equal(result.state, 'verified_item', query);
      assert.equal(result.slug, item.slug, query);
      assert.equal(result.shouldTrackMissing, false, query);
      const response = await handleMissingSearch(new Request(`${SITE_URL}/api/missing-search`, { method: 'POST', headers: { Origin: SITE_URL, 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) }), { DB: db });
      assert.equal(response.status, 204, query);
    }
  }
});

test('five distinct guides use registered official sources and only indexable canonical item links', () => {
  assert.equal(guideData.guides.length, 5);
  assert.doesNotThrow(() => validateGuides(seed, registry));
  for (const guide of guideData.guides) {
    const page = read(`guides/${guide.slug}/index.html`);
    assert.ok(page.includes(`<link rel="canonical" href="${SITE_URL}/guides/${guide.slug}/">`));
    assert.match(page, /content="index,follow"/);
    assert.doesNotMatch(page, /data-coupang|coupang-carousel|data-ad-slot|adsbygoogle\.push/);
    const ld = [...page.matchAll(/<script type="application\/ld\+json">([^<]+)<\/script>/g)].map(match => JSON.parse(match[1]));
    assert.deepEqual(ld.map(entry => entry['@type']), ['WebPage', 'BreadcrumbList']);
    for (const step of guide.steps) {
      for (const slug of step.items) assert.ok(page.includes(`href="/item/${slug}/"`));
      for (const id of step.sources) assert.ok(page.includes(`href="${escapeHtml(registry.sources.find(source => source.id === id).url)}" target="_blank" rel="noopener noreferrer"`));
    }
  }
  const copy = structuredClone(guideData);
  copy.guides[0].steps[0].items[0] = 'sofa';
  assert.throws(() => validateGuides(seed, registry, copy), /indexable verified/);
  copy.guides[0].steps[0].items[0] = 'cardboard-box';
  copy.guides[0].steps[0].sources[0] = 'unregistered';
  assert.throws(() => validateGuides(seed, registry, copy), /source not registered/);
});

test('guide hub is reachable from home and recent items reflect real dated changes, without holds or popularity claims', () => {
  const home = read('index.html');
  assert.match(home, /data-section="recent-items"/);
  assert.match(home, /href="\/guides\/"/);
  for (const path of guidePaths) assert.ok(read('sitemap.xml').includes(`${SITE_URL}${path}`));
  const recent = recentItems(seed, changes);
  assert.equal(recent.length, 6);
  assert.equal(new Set(recent.map(row => row.item.slug)).size, 6);
  assert.deepEqual(recentItems(seed, [...changes].reverse()), recent);
  for (const {item, change} of recent) {
    assert.ok(isIndexable(item));
    assert.equal(change.date, '2026-10-03');
    assert.ok(home.includes(`href="/item/${item.slug}/"`));
  }
});

test('conditional materials and remaining contents are not generalized', () => {
  assert.match(read('item/pill-blister-pack/index.html'), /플라스틱과 알루미늄이 결합된 빈 알약 포장재/);
  assert.match(read('item/pill-blister-pack/index.html'), /남은 알약은 빈 포장재와 같은 기준으로 처리하지 마세요/);
  assert.match(read('item/fruit-protection-net/index.html'), /소량의 EPE 완충 그물망/);
  assert.match(read('item/food-desiccant/index.html'), /식품 포장에 들어 있는 방습제/);
  assert.match(read('item/foil-plate/index.html'), /은박으로 만든 일회용 접시/);
  assert.match(read('item/mixed-toothbrush-holder/index.html'), /플라스틱·금속·고무 등이 섞인 복합재질/);
  assert.match(read('item/hand-cream-container/index.html'), /도포·첩합/);
  assert.match(read('item/hand-cream-container/index.html'), /남은 핸드크림 내용물/);
  assert.match(read('item/metal-can-opener/index.html'), /금속 단일재질/);
  assert.match(read('item/metal-can-opener/index.html'), /전동 오프너/);
  assert.match(read('item/food-desiccant/index.html'), /용기형 제습제/);
  assert.match(read('item/broth-bag/index.html'), /원문에 없는 뼈·껍데기/);
});

test('all local item answers explicitly name their registry jurisdiction inside the first answer card', () => {
  for (const item of seed.items.filter(item => item.verification_status === 'verified')) {
    const localSources = item.sources.map(source => registry.sources.find(entry => entry.url === source.url)).filter(source => source.geographic_scope === 'local');
    if (!localSources.length) continue;
    const answer = read(`item/${item.slug}/index.html`).match(/<section class="answer-card">([\s\S]*?)<\/section>/)?.[1];
    assert.ok(answer, item.slug);
    for (const source of localSources) assert.ok(answer.includes(source.jurisdiction), `${item.slug}: ${source.jurisdiction}`);
  }
});

test('all guide evidence fragments point to an existing displayed source section', () => {
  for (const guide of guideData.guides) {
    const page = read(`guides/${guide.slug}/index.html`);
    for (const link of page.matchAll(/href="#(guide-source-[^"]+)"/g)) assert.ok(page.includes(`id="${link[1]}"`), link[1]);
  }
});
