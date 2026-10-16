import { readFileSync } from 'node:fs';
import { isIndexable } from './index-quality.mjs';
export const improvements = JSON.parse(readFileSync(new URL('../../data/content-improvements-2026-10-17.json', import.meta.url), 'utf8'));
export function validateImprovements(seed, registry, guideData, data = improvements) {
  const items = new Map(seed.items.filter(isIndexable).map(i => [i.slug, i]));
  const paths = new Set([...items.keys()].map(s => `/item/${s}/`).concat(guideData.guides.map(g => `/guides/${g.slug}/`)));
  const sources = new Map(registry.sources.map(s => [s.id, s]));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.checked_at) || new Date(`${data.checked_at}T00:00:00Z`).toISOString().slice(0, 10) !== data.checked_at) throw new Error('Invalid improvement date');
  const seen = new Set(), texts = new Set();
  for (const entry of data.items) {
    const item = items.get(entry.slug);
    if (!item || seen.has(entry.slug)) throw new Error('Improvement target must be a unique indexable item');
    seen.add(entry.slug);
    const steps = new Set();
    if (!entry.step_notes?.length || !entry.links?.length) throw new Error('Missing practical explanation or navigation');
    for (const note of entry.step_notes) {
      if (!Number.isInteger(note.step) || note.step < 0 || note.step >= item.steps.length || steps.has(note.step)) throw new Error('Invalid or duplicate step annotation');
      steps.add(note.step);
      if (!note.text?.trim() || texts.has(note.text)) throw new Error('Empty or repeated explanation');
      texts.add(note.text);
      if (!note.source_ids?.length || new Set(note.source_ids).size !== note.source_ids.length || note.source_ids.some(id => ![1, 2].includes(sources.get(id)?.tier))) throw new Error('Missing official evidence');
    }
    const links = new Set();
    for (const link of entry.links) {
      if (!link.label?.trim() || !paths.has(link.path) || link.path === `/item/${entry.slug}/` || links.has(link.path)) throw new Error('Invalid practical navigation');
      links.add(link.path);
    }
  }
}
