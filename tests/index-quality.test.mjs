import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadInputs } from '../scripts/lib/inputs.mjs';
import { duplicateGroups, disposalFingerprint, heldSlugs, indexQualityErrors, isIndexable } from '../scripts/lib/index-quality.mjs';

const { seed } = loadInputs();
const verified = seed.items.filter(item => item.verification_status === 'verified');
const held = verified.filter(item => !isIndexable(item));

test('11 furniture pages are held while verified and research counts match the expansion', () => {
  assert.equal(verified.length, 135);
  assert.equal(seed.items.filter(item => item.verification_status === 'needs_research').length, 14);
  assert.equal(held.length, 11);
  assert.deepEqual(new Set(held.map(item => item.slug)), heldSlugs);
  assert.deepEqual(indexQualityErrors(seed), []);
});

test('every exact duplicate disposal body is entirely held from indexing', () => {
  const groups = duplicateGroups(verified);
  assert.equal(groups.length, 1);
  for (const group of groups) assert.ok(group.every(slug => heldSlugs.has(slug)), group.join(', '));
  assert.equal(new Set(verified.filter(isIndexable).map(disposalFingerprint)).size, 124);
});

test('a newly duplicated indexable disposal body fails the data quality gate', () => {
  const copy = structuredClone(seed);
  const targets = copy.items.filter(item => isIndexable(item));
  for (const field of ['summary', 'steps', 'warnings', 'regional_note']) targets[1][field] = structuredClone(targets[0][field]);
  assert.match(indexQualityErrors(copy).join('\n'), /Indexable duplicate disposal body/);
});

test('an incomplete hold list fails instead of silently indexing duplicate furniture', () => {
  const policy = { slugs: [...heldSlugs].filter(slug => slug !== 'mirror') };
  assert.match(indexQualityErrors(seed, policy).join('\n'), /mirror/);
});

test('SEO descriptions contain natural particle-free wording and official disposal fields remain untouched', () => {
  for (const item of verified) assert.ok(!item.seo.description.includes('을(를)'), item.slug);
  const raw = readFileSync(new URL('../docs/prebuild/burimttukttak-seed-v1.1.json', import.meta.url), 'utf8');
  assert.equal((raw.match(/을\(를\)/g) ?? []).length, 0);
});
