import test from 'node:test';
import assert from 'node:assert/strict';
import { loadInputs } from '../scripts/lib/inputs.mjs';
import { createValidator } from '../scripts/lib/validate.mjs';

const inputs = loadInputs();
const validate = createValidator(inputs);
test('Phase 7 baseline: 120 / 80 / 40, validation does not mutate Seed', () => {
  const seed = structuredClone(inputs.seed);
  assert.deepEqual(validate(seed), []);
  assert.deepEqual(seed, inputs.seed);
  assert.equal(seed.items.length, 120);
  assert.equal(seed.items.filter(i => i.verification_status === 'verified').length, 80);
  assert.equal(seed.items.filter(i => i.verification_status === 'needs_research').length, 40);
});

const mutations = [
  ['duplicate id', s => { s.items[1].id = s.items[0].id; }, 'duplicate'],
  ['duplicate slug', s => { s.items[1].slug = s.items[0].slug; }, 'duplicate'],
  ['normalized duplicate name', s => { s.items[1].name = '후 라이팬'; }, 'duplicate'],
  ['name/alias collision', s => { s.items[1].aliases.push('프라이팬'); }, 'term_collision'],
  ['alias/other name collision', s => { s.items[0].aliases.push('냄비'); }, 'term_collision'],
  ['normalized duplicate alias', s => { s.items[0].aliases.push('프 라이팬'); }, 'alias_duplicate'],
  ['blank alias', s => { s.items[0].aliases.push('  '); }, 'blank'],
  ['unknown related slug', s => { s.items[0].related_items.push('not-in-seed'); }, 'related_reference'],
  ['self related slug', s => { s.items[0].related_items.push(s.items[0].slug); }, 'related_self'],
  ['duplicate related slug', s => { s.items[0].related_items.push('pot'); }, 'schema'],
  ['unknown category', s => { s.items[0].category = 'unknown'; }, 'category'],
  ['invalid keywords', s => { s.items[0].search_keywords = 'wrong'; }, 'keywords'],
  ['wrong metadata count', s => { s.item_count = 119; }, 'count'],
  ['wrong verified count', s => { s.verified_item_count = 79; }, 'count'],
  ['wrong research count', s => { s.needs_research_count = 41; }, 'count'],
  ['missing required field', s => { delete s.items[0].aliases; }, 'schema'],
  ['invalid slug', s => { s.items[0].slug = '../bad'; }, 'schema'],
  ['wrong type', s => { s.items[0].steps = 'wrong'; }, 'schema'],
  ['unknown status', s => { s.items[0].verification_status = 'review_due'; }, 'schema'],
  ['verified summary missing', s => { s.items[0].summary = null; }, 'schema'],
  ['verified summary blank', s => { s.items[0].summary = ' '; }, 'verified_required'],
  ['verified steps empty', s => { s.items[0].steps = []; }, 'schema'],
  ['verified steps blank', s => { s.items[0].steps = [' ']; }, 'blank'],
  ['verified sources empty', s => { s.items[0].sources = []; }, 'schema'],
  ['verified SEO null', s => { s.items[0].seo = null; }, 'verified_required'],
  ['verified SEO blank', s => { s.items[0].seo.title = ' '; }, 'verified_required'],
  ['verification level blank', s => { s.items[0].verification_level = ' '; }, 'verified_required'],
  ['verified date missing', s => { delete s.items[0].verified_at; }, 'schema'],
  ['invalid calendar date', s => { s.items[0].verified_at = '2026-02-30'; }, 'schema'],
  ['source checked_at missing', s => { delete s.items[0].sources[0].checked_at; }, 'source_required'],
  ['source checked_at null', s => { s.items[0].sources[0].checked_at = null; }, 'source_required'],
  ['source checked_at invalid', s => { s.items[0].sources[0].checked_at = 'yesterday'; }, 'schema'],
  ['source authority mismatch', s => { s.items[0].sources[0].authority = 'unknown'; }, 'source_authority'],
  ['source registry mismatch', s => { s.items[0].sources[0].url = 'https://example.org/'; }, 'source_registry'],
  ['source lookalike domain', s => { s.items[0].sources[0].url += '.example.org'; }, 'source_registry'],
  ['source javascript URL', s => { s.items[0].sources[0].url = 'javascript:alert(1)'; }, 'source_registry'],
  ['malformed collection', s => { s.items[0].collection_service = {}; }, 'schema'],
  ['unsafe collection URL', s => { s.items[0].collection_service.url = 'javascript:alert(1)'; }, 'collection_url'],
  ['missing regional note', s => { s.items[0].regional_note = null; }, 'verified_required'],
  ['unknown regional variation', s => { s.items[0].regional_variation = null; }, 'verified_required'],
  ['unverified summary contamination', s => { s.items[2].summary = 'PRIVATE_SENTINEL'; }, 'unverified_content'],
  ['unverified steps contamination', s => { s.items[2].steps = ['PRIVATE_SENTINEL']; }, 'unverified_content'],
  ['unverified collection contamination', s => { s.items[2].collection_service = { type: 'PRIVATE_SENTINEL' }; }, 'unverified_content'],
];
for (const [label, mutate, expectedCode] of mutations) {
  test(`reject: ${label}`, () => {
    const seed = structuredClone(inputs.seed);
    mutate(seed);
    const errors = validate(seed);
    assert.ok(errors.some(e => e.code === expectedCode), JSON.stringify(errors));
    assert.ok(errors.every(e => e.path.startsWith('/')));
  });
}

test('reject malformed root/empty seed without crashing', () => {
  for (const data of [null, [], {}, { items: [] }, { items: [null] }]) assert.ok(validate(data).length > 0);
});

test('registered tier 3 alone cannot establish verified status', () => {
  const changed = structuredClone(inputs);
  changed.registry.sources.forEach(s => { s.tier = 3; });
  assert.ok(createValidator(changed)(changed.seed).some(e => e.code === 'source_tier'));
});

test('related needs_research items are valid references, not publish authorization', () => {
  const item = inputs.seed.items.find(i => i.slug === 'microwave');
  assert.ok(item.related_items.includes('air-fryer'));
  assert.deepEqual(validate(inputs.seed), []);
});
