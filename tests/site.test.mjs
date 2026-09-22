import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadInputs } from '../scripts/lib/inputs.mjs';
import { createPreviewServer } from '../scripts/preview.mjs';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const { seed, categories } = loadInputs();
const verified = seed.items.filter(item => item.verification_status === 'verified');
const unverified = seed.items.filter(item => item.verification_status === 'needs_research');
const html = path => readFileSync(join(root, path), 'utf8');

function files(directory = root) {
  return readdirSync(directory).flatMap(name => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

test('generates exactly 80 verified item pages and zero unverified item pages', () => {
  const itemPages = files(join(root, 'item')).filter(path => path.endsWith('index.html'));
  assert.equal(itemPages.length, 80);
  for (const item of verified) assert.ok(existsSync(join(root, 'item', item.slug, 'index.html')), item.slug);
  for (const item of unverified) assert.ok(!existsSync(join(root, 'item', item.slug, 'index.html')), item.slug);
});

test('generates all eight fixed categories and required standalone pages', () => {
  assert.equal(categories.categories.length, 8);
  for (const category of categories.categories) assert.ok(existsSync(join(root, 'category', category.slug, 'index.html')), category.slug);
  for (const page of ['index.html', 'about/index.html', 'source-policy/index.html', 'privacy/index.html', 'affiliate-disclosure/index.html', 'search/index.html', '404.html', 'ads.txt']) {
    assert.ok(existsSync(join(root, page)), page);
  }
});

test('item pages contain required Seed-backed sections and CTA only when eligible', () => {
  for (const item of verified) {
    const page = html(`item/${item.slug}/index.html`);
    for (const content of [item.name, item.disposal_label, item.summary, ...item.steps, ...item.warnings, ...item.sources.map(source => source.name)]) {
      assert.ok(page.includes(content.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')), `${item.slug}: ${content}`);
    }
    for (const heading of ['현재 위치', '한눈에 보는 배출방법', '버리는 순서', '공식 출처', '정보가 달라졌나요?']) assert.ok(page.includes(heading), `${item.slug}: ${heading}`);
    const hasCta = page.includes('<h2>🔌 폐가전 무상방문수거</h2>');
    assert.equal(hasCta, item.collection_service?.type === 'free_home_pickup', item.slug);
  }
});

test('generated search index exposes no disposal guidance and keeps all known items', () => {
  const data = JSON.parse(html('assets/search-index.json'));
  assert.equal(data.length, 120);
  const allowed = ['aliases', 'category', 'id', 'keywords', 'name', 'normalizedName', 'slug', 'verification_status'];
  for (const item of data) assert.deepEqual(Object.keys(item).sort(), allowed);
  assert.ok(!html('assets/search-index.json').includes('summary'));
  assert.ok(!html('assets/search-index.json').includes('steps'));
  assert.ok(!html('assets/search-index.json').includes('sources'));
});

test('all root-relative internal links resolve to generated files', () => {
  const missing = [];
  for (const path of files().filter(path => path.endsWith('.html'))) {
    const content = readFileSync(path, 'utf8');
    for (const match of content.matchAll(/href="(\/[^"]*)"/g)) {
      const pathname = match[1].split(/[?#]/)[0];
      if (!pathname || pathname.startsWith('//')) continue;
      const target = join(root, pathname.replace(/^\//, ''));
      const resolved = pathname.endsWith('/') ? join(target, 'index.html') : target;
      if (!existsSync(resolved)) missing.push(`${path}: ${match[1]}`);
    }
  }
  assert.deepEqual(missing, []);
});

test('only the approved Coupang carousel integration is present and no AdSense slots or analytics code are added', () => {
  const scripts = files().filter(path => /\.(?:js|mjs)$/.test(path)).map(path => readFileSync(path, 'utf8')).join('\n');
  assert.match(scripts, /https:\/\/ads-partners\.coupang\.com\/g\.js/);
  assert.match(scripts, /trackingCode: 'AF4293553'/);
  assert.ok(!/analytics|adsbygoogle\.push|doubleclick|data-ad-slot|partners\/external/i.test(scripts));
});

test('ads.txt contains only the approved Google AdSense publisher record', () => {
  assert.equal(html('ads.txt'), 'google.com, pub-7564661082214740, DIRECT, f08c47fec0942fa0\n');
});

test('local preview returns real 404 status and serves the custom page', async () => {
  const server = createPreviewServer();
  await new Promise((resolve, reject) => server.listen(0, '127.0.0.1', resolve).once('error', reject));
  try {
    const { port } = server.address();
    const found = await fetch(`http://127.0.0.1:${port}/item/frying-pan/`);
    const missing = await fetch(`http://127.0.0.1:${port}/definitely-missing/`);
    const unverified = await fetch(`http://127.0.0.1:${port}/item/kitchen-knife/`);
    assert.equal(found.status, 200);
    assert.equal(missing.status, 404);
    assert.equal(unverified.status, 404);
    assert.match(await missing.text(), /찾으시는 페이지가 없어요/);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
