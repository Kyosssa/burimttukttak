// Shared normalization for matching and cross-item collision validation.
export function normalize(value) {
  return value.normalize('NFKC').toLowerCase().replace(/\s+/gu, '');
}

function distance(a, b) {
  let row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const next = [i];
    for (let j = 1; j <= b.length; j++) {
      next[j] = Math.min(next[j - 1] + 1, row[j] + 1,
        row[j - 1] + Number(a[i - 1] !== b[j - 1]));
    }
    row = next;
  }
  return row[b.length];
}

// Allowlist projection: never copy disposal content into the search index.
export function createSearchIndex(items) {
  return items.map(({ id, name, slug, category, aliases, search_keywords = [], verification_status }) => ({
    id, name, slug, category, verification_status,
    normalizedName: normalize(name),
    aliases: aliases.map(normalize),
    keywords: [category, ...search_keywords].map(normalize),
  }));
}

export function search(index, input) {
  const empty = { state: 'empty_or_invalid', slug: null, results: [], shouldTrackMissing: false };
  if (typeof input !== 'string' || input.length > 60 || /[\p{Cc}\p{Cf}<>]/u.test(input)) return empty;
  const query = normalize(input);
  if (!query || /[<>]/u.test(query) || !/^[\p{L}\p{N}·()\-]+$/u.test(query)) return empty;

  // Known one-character names/aliases (옷, 캔, 칼, 약, 팬) remain searchable.
  const exact = index.some(i => i.normalizedName === query || i.aliases.includes(query));
  if (query.length < 2 && !exact) return empty;

  const ranked = index.flatMap(item => {
    const terms = [item.normalizedName, ...item.aliases];
    let rank;
    if (item.normalizedName === query) rank = 0;
    else if (item.aliases.includes(query)) rank = 1;
    else if (query.length >= 2 && terms.some(t => t.startsWith(query))) rank = 2;
    else if (query.length >= 2 && terms.some(t => t.includes(query))) rank = 3;
    // Short terms are too ambiguous for fuzzy matching. One edit only.
    else if (query.length >= 3 && terms.some(t => t.length >= 3 && distance(query, t) <= 1)) rank = 4;
    else if (query.length >= 2 && item.keywords.some(t => t.includes(query))) rank = 5;
    else return [];
    return [{ item, rank }];
  }).sort((a, b) => a.rank - b.rank || (a.item.slug < b.item.slug ? -1 : a.item.slug > b.item.slug ? 1 : 0));

  const results = ranked.slice(0, 6).map(({ item, rank }) => ({
    id: item.id, name: item.name, slug: item.slug, category: item.category,
    state: item.verification_status === 'verified' ? 'verified_item' : 'unverified_item',
    match: ['name_exact', 'alias_exact', 'prefix', 'substring', 'fuzzy', 'keyword'][rank],
  }));
  return {
    state: results[0]?.state ?? 'missing',
    slug: results[0]?.slug ?? null,
    results,
    shouldTrackMissing: results.length === 0,
  };
}
