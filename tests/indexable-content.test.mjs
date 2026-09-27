import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadInputs } from '../scripts/lib/inputs.mjs';
import { escapeHtml, SITE_URL } from '../scripts/lib/html.mjs';
import { disposalFingerprint, isIndexable } from '../scripts/lib/index-quality.mjs';
import { relatedItems } from '../scripts/lib/related-items.mjs';

const { seed } = loadInputs();
const indexable = seed.items.filter(isIndexable);
const page = slug => readFileSync(new URL(`../dist/item/${slug}/index.html`, import.meta.url), 'utf8');

test('all 89 indexable answers have substantive steps, cautions, official provenance and valid discovery links', () => {
  assert.equal(indexable.length, 89);
  const fingerprints = new Set();
  for (const item of indexable) {
    const html = page(item.slug);
    assert.ok(item.summary.trim() && item.steps.length && item.warnings.length && item.sources.length, item.slug);
    assert.ok(html.includes(`<title>${escapeHtml(item.seo.title)}</title>`), item.slug);
    assert.ok(html.includes(`<meta name="description" content="${escapeHtml(item.seo.description)}">`), item.slug);
    assert.ok(html.includes(`<h1>${escapeHtml(item.name)} 버리는 법</h1>`), item.slug);
    assert.ok(html.includes(escapeHtml(item.summary)), item.slug);
    assert.ok(html.includes(`<link rel="canonical" href="${SITE_URL}/item/${item.slug}/">`), item.slug);
    for (const step of item.steps) assert.ok(html.includes(escapeHtml(step)), item.slug);
    for (const warning of item.warnings) assert.ok(html.includes(escapeHtml(warning)), item.slug);
    for (const source of item.sources) assert.ok(html.includes(`href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer"`), item.slug);
    for (const target of relatedItems(item, seed.items)) assert.ok(html.includes(`href="/item/${target.slug}/"`), item.slug);
    const fingerprint = disposalFingerprint(item);
    assert.ok(!fingerprints.has(fingerprint), `duplicate indexable disposal body: ${item.slug}`);
    fingerprints.add(fingerprint);
    assert.equal(html.includes('class="evidence-basis"'), item.verification_level === 'official_category_rule', item.slug);
  }
});

test('monitor and TV show the official display-size split without unconditional free-collection promises', () => {
  const monitor = page('computer-monitor');
  const television = page('television');
  for (const html of [monitor, television]) {
    assert.match(html, /31인치 이상/);
    assert.match(html, /30인치 이하/);
    assert.match(html, /5개 이상/);
    assert.doesNotMatch(html, /무료 방문수거 대상입니다/);
    assert.match(html, /조건에 따라 무료수거가 가능합니다/);
  }
  assert.doesNotMatch(monitor, /컴퓨터모니터는 소형 전기/);
  assert.equal(seed.items.find(item => item.slug === 'television').collection_service.eligible, 'conditional');
});

test('printer and copier expose the official ink and toner removal condition', () => {
  for (const slug of ['printer', 'copier']) {
    const html = page(slug);
    assert.match(html, /잉크·토너가 새지 않도록 탈착 후 밀봉/);
    assert.match(html, /2026\.09\.28/);
  }
});

test('category-backed appliances do not claim their names are explicit examples in the guideline', () => {
  for (const slug of ['kimchi-refrigerator', 'water-purifier', 'water-dispenser']) {
    assert.doesNotMatch(page(slug), new RegExp(`${seed.items.find(item => item.slug === slug).name}는 공식 지침에 예시된`));
  }
  assert.match(page('water-purifier'), /공식 지침은 전기정수기를/);
  assert.match(page('kimchi-refrigerator'), /실제 접수 가능 여부/);
  assert.match(page('water-dispenser'), /제품의 크기·중량에 따라/);
});
