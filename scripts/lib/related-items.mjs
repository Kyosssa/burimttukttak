// Seed relationships take priority. Shared category and disposal type are used
// only when they describe the same verified disposal grouping.
export function relatedItems(item, items, limit = 6) {
  const verified = items.filter(candidate => candidate.verification_status === 'verified' && candidate.slug !== item.slug);
  const bySlug = new Map(verified.map(candidate => [candidate.slug, candidate]));
  const selected = new Map();
  const add = candidate => {
    if (candidate && selected.size < limit) selected.set(candidate.slug, candidate);
  };

  for (const slug of item.related_items) add(bySlug.get(slug));
  const stable = candidates => candidates.sort((a, b) => a.name.localeCompare(b.name, 'ko') || a.slug.localeCompare(b.slug));
  for (const candidate of stable(verified.filter(other => other.related_items.includes(item.slug)))) add(candidate);
  for (const candidate of stable(verified.filter(other => other.category === item.category && other.disposal_type === item.disposal_type))) add(candidate);
  return [...selected.values()];
}
