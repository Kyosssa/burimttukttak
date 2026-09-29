import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadInputs } from './lib/inputs.mjs';
import { carouselAsset, SITE_URL } from './lib/html.mjs';
import { isIndexable } from './lib/index-quality.mjs';
import { createPreviewServer } from './preview.mjs';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const { seed, categories } = loadInputs();
const verified = seed.items.filter(item => item.verification_status === 'verified');
const expectedPaths = ['/', ...verified.filter(isIndexable).map(item => `/item/${item.slug}/`), ...categories.categories.map(category => `/category/${category.slug}/`), '/about/', '/source-policy/'];
const carouselPaths = new Set(['/', ...verified.filter(isIndexable).map(item => `/item/${item.slug}/`)]);
const ADSENSE_LOADER = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7564661082214740';

function files(directory = root) {
  return readdirSync(directory).flatMap(name => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

function fileFor(pathname) {
  if (pathname === '/') return join(root, 'index.html');
  return join(root, pathname.replace(/^\//, ''), pathname.endsWith('/') ? 'index.html' : '');
}

function fail(message) {
  throw new Error(`Preflight artifact audit failed: ${message}`);
}

export async function auditDist() {
  if (!existsSync(root)) fail('dist/ does not exist; run the build first');
  const htmlFiles = files().filter(path => path.endsWith('.html'));
  const missingLinks = [];
  const automaticExternalRequests = [];
  const permittedAdSenseRequests = [];
  let carouselPages = 0;
  const recordExternalRequest = (path, target) => {
    if (target === ADSENSE_LOADER) permittedAdSenseRequests.push(`${path}: ${target}`);
    else automaticExternalRequests.push(`${path}: ${target}`);
  };
  for (const path of htmlFiles) {
    const content = readFileSync(path, 'utf8');
    if (/준비 중|정식 공개 전에|을\(를\)/.test(content)) fail(`public placeholder or broken description: ${path}`);
    const relative = path.slice(root.length).replaceAll('\\', '/');
    const pathname = relative === 'index.html' ? '/' : relative === '404.html' ? '/404.html' : `/${relative.replace(/index\.html$/, '')}`;
    const shouldShowCarousel = carouselPaths.has(pathname);
    const wrappers = [...content.matchAll(/data-coupang-carousel/g)].length;
    const clients = content.split(`src="/assets/${carouselAsset}"`).length - 1;
    if (wrappers !== Number(shouldShowCarousel) || clients !== Number(shouldShowCarousel)) fail(`Coupang target or loader count: ${path}`);
    if (shouldShowCarousel) {
      carouselPages++;
      if (!/data-coupang-carousel"? hidden/.test(content)) fail(`Coupang must start hidden: ${path}`);
      const mainEnd = content.indexOf('</main>');
      const banner = content.indexOf('data-coupang-carousel');
      const footer = content.indexOf('<footer>');
      if (!(banner >= 0 && banner < mainEnd && mainEnd < footer)) fail(`Coupang placement: ${path}`);
    } else if (/CoupangCarousel|ads-partners\.coupang\.com|coupang-carousel|data-coupang/i.test(content)) fail(`Coupang on excluded page: ${path}`);
    for (const match of content.matchAll(/href="(\/[^"#?]*(?:[?#][^"]*)?)"/g)) {
      const pathname = match[1].split(/[?#]/)[0];
      if (!pathname) continue;
      const target = fileFor(pathname);
      if (!existsSync(target)) missingLinks.push(`${path}: ${match[1]}`);
    }
    for (const match of content.matchAll(/<(?:script|img|iframe)[^>]+src="([^"]+)"/gi)) {
      const target = match[1];
      if (/^https?:\/\//i.test(target)) recordExternalRequest(path, target);
    }
    for (const match of content.matchAll(/<link\b[^>]*>/gi)) {
      const tag = match[0];
      if (!/rel="(?:stylesheet|preload|modulepreload|icon)"/i.test(tag)) continue;
      const target = tag.match(/href="([^"]+)"/i)?.[1];
      if (target && /^https?:\/\//i.test(target)) recordExternalRequest(path, target);
    }
  }
  if (missingLinks.length) fail(`broken internal links\n${missingLinks.join('\n')}`);
  if (automaticExternalRequests.length) fail(`automatic external requests\n${automaticExternalRequests.join('\n')}`);
  if (permittedAdSenseRequests.length !== htmlFiles.length) fail('official AdSense loader count');
  if (carouselPages !== 90 || !existsSync(join(root, 'assets', carouselAsset))) fail('Coupang carousel target or asset count');
  const carouselSource = readFileSync(join(root, 'assets', carouselAsset), 'utf8');
  if (!carouselSource.includes('https://ads-partners.coupang.com/g.js')) fail('Coupang loader missing from hashed asset');

  const sitemap = readFileSync(join(root, 'sitemap.xml'), 'utf8');
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  const expectedUrls = expectedPaths.map(path => `${SITE_URL}${path}`);
  if (urls.length !== expectedUrls.length || new Set(urls).size !== urls.length) fail('sitemap URL count or uniqueness');
  if (expectedUrls.some(url => !urls.includes(url))) fail('sitemap missing a public canonical URL');
  for (const url of urls) if (!existsSync(fileFor(new URL(url).pathname))) fail(`sitemap target missing: ${url}`);

  for (const path of expectedPaths) {
    const content = readFileSync(fileFor(path), 'utf8');
    if (!content.includes('<meta name="robots" content="index,follow">')) fail(`index policy: ${path}`);
    if (!content.includes(`<link rel="canonical" href="${SITE_URL}${path}">`)) fail(`canonical: ${path}`);
  }
  for (const path of [...verified.filter(item => !isIndexable(item)).map(item => `/item/${item.slug}/`), '/privacy/', '/affiliate-disclosure/']) {
    const content = readFileSync(fileFor(path), 'utf8');
    if (!content.includes('<meta name="robots" content="noindex,follow">')) fail(`hold/legal noindex policy: ${path}`);
    if (!content.includes(`<link rel="canonical" href="${SITE_URL}${path}">`)) fail(`hold/legal canonical: ${path}`);
    if (urls.includes(`${SITE_URL}${path}`)) fail(`noindex URL in sitemap: ${path}`);
  }
  const robots = readFileSync(join(root, 'robots.txt'), 'utf8');
  if (/Disallow:\s*\/search\//.test(robots)) fail('search must be crawlable for noindex');
  const search = readFileSync(fileFor('/search/'), 'utf8');
  const notFound = readFileSync(join(root, '404.html'), 'utf8');
  if (!search.includes('<meta name="robots" content="noindex,follow">')) fail('search noindex policy');
  if (!notFound.includes('<meta name="robots" content="noindex,nofollow">')) fail('404 noindex policy');

  const server = createPreviewServer();
  await new Promise((resolve, reject) => server.listen(0, '127.0.0.1', resolve).once('error', reject));
  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}/preflight-not-found/`);
    if (response.status !== 404 || !(await response.text()).includes('찾으시는 페이지가 없어요')) fail('local Preview real 404');
  } finally {
    await new Promise(resolve => server.close(resolve));
  }

  return { sitemapUrls: urls.length, internalLinks: 'ok', indexing: 'ok', real404: 'ok', automaticExternalRequests: 0, permittedAdSenseRequests: permittedAdSenseRequests.length, carouselPages };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const result = await auditDist();
    console.log(`Artifact audit passed: ${result.sitemapUrls} sitemap URLs / internal links OK / index policy OK / real 404 OK / ${result.carouselPages} carousel targets / ${result.permittedAdSenseRequests} permitted AdSense loader requests / 0 other static external requests`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
