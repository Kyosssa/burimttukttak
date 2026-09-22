import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadInputs, pack } from './lib/inputs.mjs';

const DAY_MS = 86_400_000;
const registryPath = new URL('12-source-registry-v1.json', pack);
const dateOnly = value => new Date(`${value}T00:00:00Z`);
const isoDate = value => value.toISOString().slice(0, 10);

export function createSourceHealthReport({ asOf = new Date() } = {}) {
  const { seed } = loadInputs();
  const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
  const verified = seed.items.filter(item => item.verification_status === 'verified');
  const reportDate = dateOnly(isoDate(asOf));
  const sources = registry.sources.map(source => {
    const usages = verified.flatMap(item => item.sources
      .filter(itemSource => itemSource.url === source.url)
      .map(itemSource => ({ slug: item.slug, name: item.name, checkedAt: itemSource.checked_at })));
    if (!usages.length) return { id: source.id, name: source.name, status: 'not_in_verified_seed', reviewIntervalDays: source.review_interval_days, itemCount: 0, url: source.url };
    const oldestCheckedAt = usages.map(usage => usage.checkedAt).sort()[0];
    const nextReview = new Date(dateOnly(oldestCheckedAt).getTime() + source.review_interval_days * DAY_MS);
    const dueItems = usages.filter(usage => reportDate >= new Date(dateOnly(usage.checkedAt).getTime() + source.review_interval_days * DAY_MS));
    return {
      id: source.id,
      name: source.name,
      status: dueItems.length ? 'review_due' : 'current',
      reviewIntervalDays: source.review_interval_days,
      oldestCheckedAt,
      nextReviewAt: isoDate(nextReview),
      itemCount: usages.length,
      dueItems: dueItems.map(({ slug, name, checkedAt }) => ({ slug, name, checkedAt })),
      url: source.url,
    };
  });
  const unmapped = verified.flatMap(item => item.sources
    .filter(source => !registry.sources.some(entry => entry.url === source.url))
    .map(source => ({ slug: item.slug, name: item.name, sourceUrl: source.url })));
  return {
    generatedAt: isoDate(reportDate),
    mode: 'report_only_no_network_no_seed_write',
    summary: {
      registrySources: sources.length,
      reviewDueSources: sources.filter(source => source.status === 'review_due').length,
      reviewDueItems: sources.reduce((sum, source) => sum + (source.dueItems?.length ?? 0), 0),
      unmappedSources: unmapped.length,
    },
    sources,
    unmapped,
  };
}

export function formatSourceHealth(report) {
  const lines = [
    `Source health report (${report.generatedAt})`,
    `Mode: ${report.mode}`,
    `Summary: ${report.summary.registrySources} registry sources / ${report.summary.reviewDueSources} due sources / ${report.summary.reviewDueItems} due item references / ${report.summary.unmappedSources} unmapped`,
  ];
  for (const source of report.sources) {
    lines.push(`- [${source.status}] ${source.id}: ${source.itemCount} item references${source.nextReviewAt ? `, next review ${source.nextReviewAt}` : ''}`);
    for (const item of source.dueItems ?? []) lines.push(`  - review: ${item.slug} (${item.checkedAt})`);
  }
  return lines.join('\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dateArg = process.argv.find(value => value.startsWith('--as-of='))?.slice('--as-of='.length);
  const asOf = dateArg ? dateOnly(dateArg) : new Date();
  if (Number.isNaN(asOf.getTime())) {
    console.error('Invalid --as-of date; use YYYY-MM-DD.');
    process.exitCode = 2;
  } else {
    const report = createSourceHealthReport({ asOf });
    console.log(process.argv.includes('--json') ? JSON.stringify(report, null, 2) : formatSourceHealth(report));
    if (process.argv.includes('--fail-on-due') && (report.summary.reviewDueItems || report.summary.unmappedSources)) process.exitCode = 1;
  }
}
