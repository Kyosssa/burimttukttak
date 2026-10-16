import { recheckedDate } from './source-rechecks.mjs';
export function sourceContext(item, registry) {
  const byUrl = new Map(registry.sources.map(source => [source.url, source]));
  const sources = item.sources.map(source => {
    const registered = byUrl.get(source.url);
    if (!registered) throw new Error(`Unregistered source for ${item.slug}: ${source.url}`);
    const checked_at = recheckedDate(item, source) ?? source.checked_at;
    const nextReview = new Date(Date.parse(`${checked_at}T00:00:00Z`) + registered.review_interval_days * 86_400_000).toISOString().slice(0, 10);
    return { ...source, checked_at, scope: registered.geographic_scope, jurisdiction: registered.jurisdiction, nextReview };
  });
  const jurisdictions = [...new Set(sources.filter(source => source.scope === 'local').map(source => source.jurisdiction))];
  if (jurisdictions.length > 1) throw new Error(`Multiple local jurisdictions for ${item.slug}`);
  return { sources, jurisdiction: jurisdictions[0] ?? null };
}
