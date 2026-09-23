import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';
import seed from '../docs/prebuild/burimttukttak-seed-v1.1.json' with { type: 'json' };
import categories from '../docs/prebuild/10-categories-v1.json' with { type: 'json' };
import { itemPage } from '../scripts/build-site.mjs';
import { styleAsset } from '../scripts/lib/html.mjs';
import { coupangCarouselAsset, monetizationConfig, renderAdSlotBottom, renderAdSlotTop, renderAffiliateBlock, renderCoupangCarousel } from '../scripts/lib/monetization.mjs';

const verified = seed.items.filter(item => item.verification_status === 'verified');
const needsResearch = seed.items.filter(item => item.verification_status === 'needs_research');
const withKeywords = verified.find(item => item.shopping_keywords.length > 0);
const withoutKeywords = verified.find(item => item.shopping_keywords.length === 0);
const researchWithKeywords = needsResearch.find(item => item.shopping_keywords.length > 0);
const bySlug = new Map(seed.items.map(item => [item.slug, item]));
const categoryFor = item => categories.categories.find(category => category.source_label === item.category);
const enabledOffers = {
  ads: { enabled: true, renderSlot: position => `<div data-test-ad="${position}">configured ad</div>` },
  affiliate: { enabled: true, disclosure: '고지', resolveOffers: () => [{ label: '설정된 제휴 링크', href: 'https://shop.example/product' }] },
};
const html = path => readFileSync(join('dist', path), 'utf8');
const count = (text, pattern) => [...text.matchAll(pattern)].length;

test('Coupang carousel is emitted once on home and every verified detail page', () => {
  const targets = ['index.html', ...verified.map(item => `item/${item.slug}/index.html`)];
  assert.equal(targets.length, 81);
  for (const path of targets) {
    const page = html(path);
    assert.equal(count(page, /data-component="CoupangCarousel"/g), 1, path);
    assert.equal(count(page, /src="https:\/\/ads-partners\.coupang\.com\/g\.js"/g), 1, path);
    assert.equal(count(page, new RegExp(`src="/assets/${coupangCarouselAsset}"`, 'g')), 1, path);
    assert.match(page, /경제적 이해관계 안내/);
    assert.match(page, /id="coupang-carousel-desktop"/);
    assert.match(page, /id="coupang-carousel-mobile"/);
  }
});

test('Coupang carousel is absent from non-target public and non-public pages', () => {
  const nonTargets = [...categories.categories.map(category => `category/${category.slug}/index.html`), 'about/index.html', 'source-policy/index.html', 'privacy/index.html', 'affiliate-disclosure/index.html', 'search/index.html', '404.html'];
  for (const path of nonTargets) assert.doesNotMatch(html(path), /data-component="CoupangCarousel"/, path);
  for (const item of needsResearch) assert.doesNotMatch(html('assets/search-index.json'), new RegExp(`item/${item.slug}`));
});

test('carousel client config loads one official loader and initializes responsive containers', () => {
  const client = html(`assets/${coupangCarouselAsset}`);
  assert.match(client, /id: 1032289/);
  assert.match(client, /template: 'carousel'/);
  assert.match(client, /trackingCode: 'AF4293553'/);
  assert.match(client, /width: '728', height: '90', container: desktop \}/);
  assert.match(client, /width: '320', height: '100', container: mobile \}/);
  assert.match(client, /function waitForPartner\(timeoutMs = 3000\)/);
  assert.match(html('index.html'), /data-coupang-partners-loader="true"/);
});

test('carousel initializes the official container option with DOM elements', async () => {
  const containers = [{ nodeType: 1 }, { nodeType: 1 }];
  const calls = [];
  const frames = [];
  const banner = {
    hidden: true,
    querySelector(selector) { return selector.includes('desktop') ? containers[0] : containers[1]; },
    querySelectorAll() { return frames; },
    remove() { throw new Error('valid carousel must not be removed'); },
  };
  const context = {
    document: { querySelectorAll: () => [banner] },
    window: {
      PartnersCoupang: { G: class {
        constructor(options) {
          assert.ok(containers.includes(options.container));
          calls.push(options);
          frames.push({ getAttribute: name => name === 'width' ? options.width : options.height });
        }
      } },
      setTimeout: () => 0,
    },
    MutationObserver: class { observe() {} disconnect() {} },
    requestAnimationFrame: callback => callback(),
  };
  runInNewContext(html(`assets/${coupangCarouselAsset}`), context);
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(calls.map(call => [call.width, call.height]), [['728', '90'], ['320', '100']]);
  assert.equal(banner.hidden, false);
});

test('existing ad and product-link components remain inactive without explicit settings', () => {
  assert.equal(renderAdSlotTop(monetizationConfig), '');
  assert.equal(renderAdSlotBottom(monetizationConfig), '');
  assert.equal(renderAffiliateBlock(withKeywords, monetizationConfig), '');
  assert.match(renderCoupangCarousel(monetizationConfig), /data-component="CoupangCarousel"/);
  assert.equal(renderCoupangCarousel({ affiliate: { enabled: false, disclosure: '고지' } }), '');
  assert.equal(renderAffiliateBlock(withoutKeywords, enabledOffers), '');
  assert.equal(renderAffiliateBlock(researchWithKeywords, enabledOffers), '');
  assert.match(renderAffiliateBlock(withKeywords, enabledOffers), /data-component="AffiliateBlock"/);
});

test('configured detail order keeps answer, steps, related items, and carousel in order', () => {
  const page = itemPage(withKeywords, categoryFor(withKeywords), bySlug, monetizationConfig);
  const positions = [page.indexOf('class="answer-card"'), page.indexOf('class="steps"'), page.indexOf('관련 품목'), page.indexOf('data-component="CoupangCarousel"')];
  assert.ok(positions.every(position => position >= 0), positions);
  assert.deepEqual([...positions].sort((a, b) => a - b), positions);
});

test('policy text and mobile styles describe and contain the enabled carousel', () => {
  const disclosure = html('affiliate-disclosure/index.html');
  const privacy = html('privacy/index.html');
  const css = html(`assets/${styleAsset}`);
  assert.match(disclosure, /쿠팡 파트너스 캐러셀 배너를 표시합니다/);
  assert.match(privacy, /쿠팡의 외부 스크립트를 불러옵니다/);
  assert.match(css, /\.coupang-carousel-frame \{ display: flex; justify-content: center; width: 100%; max-width: 100%; overflow: hidden; \}/);
  assert.match(css, /@media \(max-width: 420px\)/);
  assert.match(css, /\.coupang-carousel-desktop \{ display: none; \}/);
  assert.match(css, /\.coupang-carousel-mobile \{ display: block; \}/);
});
