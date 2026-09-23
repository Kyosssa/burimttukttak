export function sourceContext(item, registry) {
  const byUrl = new Map(registry.sources.map(source => [source.url, source]));
  const sources = item.sources.map(source => {
    const registered = byUrl.get(source.url);
    if (!registered) throw new Error(`Unregistered source for ${item.slug}: ${source.url}`);
    const nextReview = new Date(Date.parse(`${source.checked_at}T00:00:00Z`) + registered.review_interval_days * 86_400_000).toISOString().slice(0, 10);
    return { ...source, scope: registered.geographic_scope, jurisdiction: registered.jurisdiction, nextReview };
  });
  const jurisdictions = [...new Set(sources.filter(source => source.scope === 'local').map(source => source.jurisdiction))];
  if (jurisdictions.length > 1) throw new Error(`Multiple local jurisdictions for ${item.slug}`);
  return { sources, jurisdiction: jurisdictions[0] ?? null };
}
