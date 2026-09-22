import test from 'node:test';
import assert from 'node:assert/strict';
import { loadInputs, readJson, pack } from '../scripts/lib/inputs.mjs';
import { createSearchIndex, search } from '../src/search.mjs';

const { seed } = loadInputs();
const index = createSearchIndex(seed.items);
const fixtures = readJson(new URL('14-search-quality-fixtures.json', pack));

test('supplied regression fixture contains 34 cases', () => assert.equal(fixtures.cases.length, 34));
for (const [i, fixture] of fixtures.cases.entries()) {
  test(`fixture ${i + 1}: ${JSON.stringify(fixture.query)}`, () => {
    const result = search(index, fixture.query);
    assert.equal(result.slug, fixture.expected_slug);
    assert.equal(result.state, fixture.expected_state);
    assert.equal(result.shouldTrackMissing, fixture.expected_state === 'missing');
  });
}

test('all 120 canonical names and every alias resolve to their own item', () => {
  for (const item of seed.items) {
    for (const query of [item.name, ...item.aliases]) {
      const result = search(index, query);
      assert.equal(result.slug, item.slug, query);
      assert.equal(result.shouldTrackMissing, false, query);
      assert.equal(result.state, item.verification_status === 'verified' ? 'verified_item' : 'unverified_item');
    }
  }
});

test('normalization, prefix, substring and genuine non-alias fuzzy match', () => {
  for (const [query, slug, match] of [
    [' ＴＶ ', 'television', 'name_exact'],
    ['투명 페트 병', 'clear-pet-bottle', 'name_exact'],
    ['후라이팬'.normalize('NFD'), 'frying-pan', 'name_exact'],
    ['후라이', 'frying-pan', 'prefix'],
    ['라이팬', 'frying-pan', 'substring'],
    ['후라아팬', 'frying-pan', 'fuzzy'],
  ]) {
    const result = search(index, query);
    assert.equal(result.slug, slug, query);
    assert.equal(result.results[0].match, match, query);
  }
});

test('ranking is name > alias > prefix > substring > fuzzy, independent of data order/status', () => {
  const entries = [
    ['fuzzy', '가나마라', [], 'verified'],
    ['substring', '물건가나다라물건', [], 'verified'],
    ['prefix', '가나다라물건', [], 'verified'],
    ['alias', '별칭품목', ['가나다라'], 'verified'],
    ['exact', '가나다라', [], 'needs_research'],
  ].map(([slug, name, aliases, verification_status]) => ({ id: slug, slug, name, aliases, verification_status, category: '분류' }));
  const result = search(createSearchIndex(entries), '가나다라');
  assert.deepEqual(result.results.map(i => i.slug), ['exact', 'alias', 'prefix', 'substring', 'fuzzy']);
  assert.equal(result.state, 'unverified_item');
  assert.equal(result.shouldTrackMissing, false);
});

test('category/optional keywords work after item matching; ties are stable', () => {
  const data = [
    { id: 'b', slug: 'b', name: '도구둘', aliases: [], category: '공통분류', search_keywords: ['특별키워드'], verification_status: 'needs_research' },
    { id: 'a', slug: 'a', name: '도구하나', aliases: [], category: '공통분류', verification_status: 'verified' },
  ];
  assert.deepEqual(search(createSearchIndex(data), '공통분류').results.map(i => i.slug), ['a', 'b']);
  assert.equal(search(createSearchIndex(data), '특별키워드').slug, 'b');
});

test('invalid/short input cannot trigger missing collection; known one-character items work', () => {
  for (const query of [null, undefined, 123, {}, [], 'ㄱ', '힣', '\tTV', 'TV\n', 'TV\u200b', '＜script＞', '!@#', '가'.repeat(61)]) {
    assert.equal(search(index, query).state, 'empty_or_invalid', String(query));
    assert.equal(search(index, query).shouldTrackMissing, false);
  }
  for (const query of ['옷', '캔', '칼', '약', '팬']) assert.notEqual(search(index, query).state, 'empty_or_invalid');
  assert.equal(search(index, '가'.repeat(60)).state, 'missing');
});

test('index and results contain no disposal content, even from contaminated unverified input', () => {
  const item = structuredClone(seed.items.find(i => i.slug === 'air-fryer'));
  // Sentinel text only: no invented disposal guidance.
  item.summary = 'PRIVATE_SENTINEL';
  item.steps = ['PRIVATE_SENTINEL'];
  item.collection_service = { type: 'PRIVATE_SENTINEL' };
  item.seo = { title: 'PRIVATE_SENTINEL', description: 'PRIVATE_SENTINEL' };
  const safeIndex = createSearchIndex([item]);
  const result = search(safeIndex, item.name);
  assert.equal(result.state, 'unverified_item');
  assert.equal(result.shouldTrackMissing, false);
  assert.ok(!JSON.stringify({ safeIndex, result }).includes('PRIVATE_SENTINEL'));
  assert.deepEqual(Object.keys(result.results[0]).sort(), ['category', 'id', 'match', 'name', 'slug', 'state']);
});
