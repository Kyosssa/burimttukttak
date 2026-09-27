import { readFileSync } from 'node:fs';

export const holdPolicy = JSON.parse(readFileSync(new URL('../../data/indexing-holds.json', import.meta.url), 'utf8'));
export const heldSlugs = new Set(holdPolicy.slugs);
export const isIndexable = item => item.verification_status === 'verified' && !heldSlugs.has(item.slug);

const normalizeText = value => String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim();
export const disposalFingerprint = item => JSON.stringify([
  normalizeText(item.summary),
  item.steps.map(normalizeText),
  item.warnings.map(normalizeText),
  normalizeText(item.regional_note),
]);

export function duplicateGroups(items, fingerprint = disposalFingerprint) {
  const groups = new Map();
  for (const item of items.filter(value => value.verification_status === 'verified')) {
    const key = fingerprint(item);
    groups.set(key, [...(groups.get(key) ?? []), item.slug]);
  }
  return [...groups.values()].filter(group => group.length > 1);
}

// Editorial signal only: replacing a name cannot establish genuinely distinct advice.
export function fuzzyDisposalFingerprint(item) {
  const names = [item.name, ...item.aliases].map(normalizeText).filter(value => value.length >= 2).sort((a, b) => b.length - a.length);
  const generic = value => {
    let text = normalizeText(value);
    for (const name of names) text = text.replaceAll(name, '[품목]');
    return text;
  };
  return JSON.stringify([generic(item.summary), item.steps.map(generic), item.warnings.map(generic), generic(item.regional_note)]);
}

export function indexQualityErrors(seed, policy = holdPolicy) {
  const errors = [];
  const verified = seed.items.filter(item => item.verification_status === 'verified');
  const bySlug = new Map(verified.map(item => [item.slug, item]));
  const holds = new Set();
  for (const slug of policy.slugs) {
    if (holds.has(slug)) errors.push(`Duplicate hold slug: ${slug}`);
    if (!bySlug.has(slug)) errors.push(`Hold must name a verified item: ${slug}`);
    holds.add(slug);
  }
  for (const group of duplicateGroups(verified)) {
    const indexable = group.filter(slug => !holds.has(slug));
    if (indexable.length) errors.push(`Indexable duplicate disposal body: ${group.join(', ')} (not held: ${indexable.join(', ')})`);
  }
  return errors;
}
