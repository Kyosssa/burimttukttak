import { readFileSync } from 'node:fs';
import { isIndexable } from './index-quality.mjs';

export const guideData = JSON.parse(readFileSync(new URL('../../data/guides.json', import.meta.url), 'utf8'));
export const guidePaths = ['/guides/', ...guideData.guides.map(guide => `/guides/${guide.slug}/`)];

export function validateGuides(seed, registry, data = guideData) {
  const slugs = new Set(), titles = new Set(), descriptions = new Set();
  const items = new Map(seed.items.filter(isIndexable).map(item => [item.slug, item]));
  const sources = new Map(registry.sources.map(source => [source.id, source]));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.checked_at) || new Date(`${data.checked_at}T00:00:00Z`).toISOString().slice(0, 10) !== data.checked_at) throw new Error('Guide check date invalid');
  for (const guide of data.guides) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(guide.slug) || slugs.has(guide.slug) || !guide.title || titles.has(guide.title) || !guide.description || descriptions.has(guide.description)) throw new Error('Guide identity duplicate or missing');
    slugs.add(guide.slug); titles.add(guide.title); descriptions.add(guide.description);
    if (!guide.intro || !guide.steps.length) throw new Error('Guide content missing');
    for (const step of guide.steps) {
      if (!step.title || !step.text || !step.sources.length || !step.items.length) throw new Error('Guide step missing evidence or navigation');
      if (new Set(step.items).size !== step.items.length || step.items.some(slug => !items.has(slug))) throw new Error('Guide link must target an indexable verified item');
      if (step.sources.some(id => ![1, 2].includes(sources.get(id)?.tier))) throw new Error('Guide official source not registered');
    }
  }
}

export function recentItems(seed, changes, limit = 6) {
  const bySlug = new Map(seed.items.filter(isIndexable).map(item => [item.slug, item]));
  const selected = new Map();
  // On the same day, a content update describes the current page more precisely
  // than its initial verification. Final text tie-break keeps input order irrelevant.
  const sorted = [...changes].sort((a, b) => b.date.localeCompare(a.date)
    || a.item_slug.localeCompare(b.item_slug)
    || Number(a.type === 'verified') - Number(b.type === 'verified')
    || a.summary.localeCompare(b.summary));
  for (const change of sorted) {
    if (bySlug.has(change.item_slug) && !selected.has(change.item_slug)) selected.set(change.item_slug, { item: bySlug.get(change.item_slug), change });
    if (selected.size === limit) break;
  }
  return [...selected.values()];
}
