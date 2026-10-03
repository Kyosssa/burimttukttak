import { readFileSync } from 'node:fs';
import { isIndexable } from './index-quality.mjs';
import { createSearchIndex, normalize, search } from '../../src/search.mjs';

export const questionData = JSON.parse(readFileSync(new URL('../../data/item-questions.json', import.meta.url), 'utf8'));

export function validateItemQuestions(seed, registry, guides, data = questionData) {
  const items = new Map(seed.items.filter(isIndexable).map(i => [i.slug, i]));
  const sources = new Map(registry.sources.map(s => [s.id, s]));
  const guideSlugs = new Set(guides.guides.map(g => g.slug));
  const slugs = new Set(), questions = new Set(), answers = new Set(), queries = new Set();
  const searchIndex = createSearchIndex(seed.items);
  for (const q of data.questions) {
    const item = items.get(q.slug);
    if (!item || slugs.has(q.slug)) throw new Error('Question target must be unique indexable verified item');
    slugs.add(q.slug);
    if (!q.question?.trim() || !q.answer?.trim() || questions.has(q.question) || answers.has(q.answer)) throw new Error('Question content missing or duplicate');
    questions.add(q.question); answers.add(q.answer);
    if (!q.source_ids?.length || new Set(q.source_ids).size !== q.source_ids.length || q.source_ids.some(id => ![1, 2].includes(sources.get(id)?.tier))) throw new Error('Question official evidence missing');
    if (!guideSlugs.has(q.guide_slug) || !guides.guides.find(g => g.slug === q.guide_slug).steps.some(s => s.items.includes(q.slug))) throw new Error('Question guide must include target item');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(q.checked_at) || new Date(`${q.checked_at}T00:00:00Z`).toISOString().slice(0, 10) !== q.checked_at) throw new Error('Question check date invalid');
    for (const query of q.queries) {
      if (!query.trim() || queries.has(normalize(query)) || !item.search_keywords?.includes(query)) throw new Error('Question search query duplicate or unmapped');
      queries.add(normalize(query));
      if (search(searchIndex, query).slug !== q.slug) throw new Error('Question query resolves to a different item');
    }
  }
}
