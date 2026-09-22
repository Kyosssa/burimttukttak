import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadInputs } from '../scripts/lib/inputs.mjs';
import { SITE_URL } from '../scripts/lib/html.mjs';
import { createPreviewServer } from '../scripts/preview.mjs';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const { seed, categories } = loadInputs();
const verified = seed.items.filter(item => item.verification_status === 'verified');
const unverified = seed.items.filter(item => item.verification_status === 'needs_research');
const publicPaths = ['/', ...verified.map(item => `/item/${item.slug}/`), ...categories.categories.map(category => `/category/${category.slug}/`), '/about/', '/source-policy/', '/privacy/', '/affiliate-disclosure/'];
const fileFor = path => path === '/' ? join(root, 'index.html') : join(root, path.slice(1), 'index.html');
const contentFor = path => readFileSync(fileFor(path), 'utf8');
const attr = (content, pattern) => content.match(pattern)?.[1] ?? null;
const jsonLd = content => [...content.matchAll(/<script type="application\/ld\+json">([^<]+)<\/script>/g)].map(match => JSON.parse(match[1]));

test('every public canonical page has unique absolute canonical, metadata, OG and Twitter fields', () => {
  const canonicals = new Set();
  const titles = new Set();
  for (const path of publicPaths) {
    const content = contentFor(path);
    const canonical = attr(content, /<link rel="canonical" href="([^"]+)">/);
    const title = attr(content, /<title>([^<]+)<\/title>/);
    const description = attr(content, /<meta name="description" content="([^"]+)">/);
    assert.equal(canonical, `${SITE_URL}${path}`, path);
    assert.ok(title && !titles.has(title), `duplicate/missing title: ${path}`);
    assert.ok(description, `description: ${path}`);
    assert.match(content, /<meta name="robots" content="index,follow">/);
    for (const name of ['og:title', 'og:description', 'og:url', 'twitter:card', 'twitter:title', 'twitter:description']) assert.ok(content.includes(`${name}"`), `${path}: ${name}`);
    assert.ok(!canonicals.has(canonical), `duplicate canonical: ${canonical}`);
    canonicals.add(canonical);
    titles.add(title);
  }
  assert.equal(canonicals.size, 73);
});

test('every generated HTML page has exactly one Naver site verification tag', () => {
  const htmlFiles = readdirSync(root, { recursive: true }).filter(file => file.endsWith('.html'));
  assert.ok(htmlFiles.length > 0);
  for (const file of htmlFiles) {
    const content = readFileSync(join(root, file), 'utf8');
    const tags = [...content.matchAll(/<meta name="naver-site-verification" content="60090dcb1b94d4cc123aee5341a4cef1aff3c592" \/>/g)];
    assert.equal(tags.length, 1, file);
  }
});

test('every generated HTML page has exactly one official AdSense loader without ad placement code', () => {
  const script = '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7564661082214740" crossorigin="anonymous"></script>';
  const htmlFiles = readdirSync(root, { recursive: true }).filter(file => file.endsWith('.html'));
  for (const file of htmlFiles) {
    const content = readFileSync(join(root, file), 'utf8');
    assert.equal(content.split(script).length - 1, 1, file);
    assert.doesNotMatch(content, /adsbygoogle\.push|data-ad-client|data-ad-slot/i, file);
  }
});

test('home JSON-LD is valid WebSite and Organization without SearchAction', () => {
  const content = contentFor('/');
  const types = jsonLd(content).map(value => value['@type']);
  assert.deepEqual(types, ['WebSite', 'Organization']);
  for (const path of publicPaths.concat('/search/')) assert.ok(!contentFor(path).includes('SearchAction'), path);
});

test('verified item JSON-LD matches WebPage and BreadcrumbList', () => {
  for (const item of verified) {
    const data = jsonLd(contentFor(`/item/${item.slug}/`));
    assert.deepEqual(data.map(value => value['@type']), ['WebPage', 'BreadcrumbList'], item.slug);
    assert.equal(data[0].url, `${SITE_URL}/item/${item.slug}/`);
    assert.equal(data[1].itemListElement.at(-1).name, item.name);
  }
});

test('category JSON-LD matches CollectionPage and BreadcrumbList', () => {
  for (const category of categories.categories) {
    const data = jsonLd(contentFor(`/category/${category.slug}/`));
    assert.deepEqual(data.map(value => value['@type']), ['CollectionPage', 'BreadcrumbList'], category.slug);
    assert.equal(data[0].url, `${SITE_URL}/category/${category.slug}/`);
    assert.equal(data[1].itemListElement.at(-1).name, category.name);
  }
});

test('search and 404 are noindex and have no canonical or JSON-LD', () => {
  const search = contentFor('/search/');
  const missing = readFileSync(join(root, '404.html'), 'utf8');
  assert.match(search, /<meta name="robots" content="noindex,follow">/);
  assert.match(missing, /<meta name="robots" content="noindex,nofollow">/);
  for (const content of [search, missing]) {
    assert.ok(!content.includes('rel="canonical"'));
    assert.equal(jsonLd(content).length, 0);
  }
});

test('sitemap has exactly 73 unique, complete, live canonical URLs', () => {
  const sitemap = readFileSync(join(root, 'sitemap.xml'), 'utf8');
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  assert.equal(urls.length, 73);
  assert.equal(new Set(urls).size, 73);
  assert.deepEqual(new Set(urls), new Set(publicPaths.map(path => `${SITE_URL}${path}`)));
  assert.ok(!urls.some(url => url.includes('/search/') || url.includes('404')));
  for (const item of unverified) assert.ok(!urls.includes(`${SITE_URL}/item/${item.slug}/`), item.slug);
  for (const url of urls) assert.ok(existsSync(fileFor(new URL(url).pathname)), url);
});

test('robots allows the site, excludes search and points to the absolute sitemap', () => {
  assert.equal(readFileSync(join(root, 'robots.txt'), 'utf8'), `User-agent: *\nAllow: /\nDisallow: /search/\nSitemap: ${SITE_URL}/sitemap.xml\n`);
});

test('Cloudflare headers isolate preview noindex from production security headers', () => {
  const headers = readFileSync(join(root, '_headers'), 'utf8');
  const previewBlocks = [...headers.matchAll(/https:\/\/[^\n]*pages\.dev\/\*\n((?:  [^\n]+\n?)+)/g)];
  assert.equal(previewBlocks.length, 2);
  for (const block of previewBlocks) assert.match(block[1], /X-Robots-Tag: noindex, nofollow/);
  const productionBlock = headers.match(/^\/\*\r?\n((?:  [^\r\n]+\r?\n?)+)/m)?.[1];
  assert.ok(productionBlock);
  assert.ok(!/X-Robots-Tag/i.test(productionBlock));
  for (const header of ['X-Content-Type-Options: nosniff', 'X-Frame-Options: DENY', 'Referrer-Policy: strict-origin-when-cross-origin', 'Permissions-Policy:', 'Cross-Origin-Resource-Policy: same-site']) assert.ok(productionBlock.includes(header), header);
});

test('redirect rules enforce HTTPS, apex host and explicit trailing slashes without aliases', () => {
  const redirects = readFileSync(join(root, '_redirects'), 'utf8');
  assert.match(redirects, /^http:\/\/beorimttukttak\.com\/\* https:\/\/beorimttukttak\.com\/:splat 301/m);
  assert.match(redirects, /^https:\/\/www\.beorimttukttak\.com\/\* https:\/\/beorimttukttak\.com\/:splat 301/m);
  for (const path of publicPaths.filter(path => path !== '/').concat('/search/')) assert.ok(redirects.includes(`${path.slice(0, -1)} ${path} 301`), path);
  for (const item of seed.items) for (const alias of item.aliases) assert.ok(!redirects.includes(`/item/${alias}`), alias);
});

test('local preview serves search, redirects slash variants and preserves real 404s', async () => {
  const server = createPreviewServer();
  await new Promise((resolve, reject) => server.listen(0, '127.0.0.1', resolve).once('error', reject));
  try {
    const { port } = server.address();
    const request = (path, redirect = 'follow') => fetch(`http://127.0.0.1:${port}${path}`, { redirect });
    assert.equal((await request('/search/?q=후라이팬')).status, 200);
    const redirect = await request('/item/frying-pan', 'manual');
    assert.equal(redirect.status, 301);
    assert.equal(redirect.headers.get('location'), '/item/frying-pan/');
    assert.equal((await request('/item/mattress/')).status, 404);
    assert.equal((await request('/item/not-real/')).status, 404);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
