import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadInputs } from '../scripts/lib/inputs.mjs';
import { itemPage } from '../scripts/build-site.mjs';
import { monetizationConfig, renderAdSlotBottom, renderAdSlotTop, renderAffiliateBlock } from '../scripts/lib/monetization.mjs';

const { seed, categories } = loadInputs();
const verified = seed.items.filter(item => item.verification_status === 'verified');
const withKeywords = verified.find(item => item.shopping_keywords.length > 0);
const withoutKeywords = verified.find(item => item.shopping_keywords.length === 0);
const researchWithKeywords = seed.items.find(item => item.verification_status === 'needs_research' && item.shopping_keywords.length > 0);
const bySlug = new Map(seed.items.map(item => [item.slug, item]));
const categoryFor = item => categories.categories.find(category => category.source_label === item.category);
const html = path => readFileSync(join('dist', path), 'utf8');
const enabledOffers = {
  ads: { enabled: true, renderSlot: position => `<div data-test-ad="${position}">configured ad</div>` },
  affiliate: { enabled: true, disclosure: '고지', resolveOffers: () => [{ label: '설정된 제휴 링크', href: 'https://shop.example/product' }] },
};

test('generic Coupang carousel and loader are absent from all generated HTML and JS', () => {
  const pages = ['index.html', ...verified.map(item => `item/${item.slug}/index.html`), ...categories.categories.map(category => `category/${category.slug}/index.html`), 'about/index.html', 'source-policy/index.html', 'privacy/index.html', 'affiliate-disclosure/index.html', 'search/index.html', '404.html'];
  for (const path of pages) assert.doesNotMatch(html(path), /CoupangCarousel|ads-partners\.coupang\.com|coupang-carousel|data-coupang/i, path);
  assert.ok(!readdirSync('dist/assets').some(file => file.includes('coupang')));
  assert.equal(monetizationConfig.affiliate.enabled, false);
});

test('inactive ad and product-link components remain guarded', () => {
  assert.equal(renderAdSlotTop(monetizationConfig), '');
  assert.equal(renderAdSlotBottom(monetizationConfig), '');
  assert.equal(renderAffiliateBlock(withKeywords, monetizationConfig), '');
  assert.equal(renderAffiliateBlock(withoutKeywords, enabledOffers), '');
  if (researchWithKeywords) assert.equal(renderAffiliateBlock(researchWithKeywords, enabledOffers), '');
  assert.match(renderAffiliateBlock(withKeywords, enabledOffers), /data-component="AffiliateBlock"/);
});

test('answer precedes steps and related items with no empty monetization region', () => {
  const page = itemPage(withKeywords, categoryFor(withKeywords), bySlug, monetizationConfig);
  const positions = [page.indexOf('class="answer-card"'), page.indexOf('class="steps"'), page.indexOf('data-section="related-items"')];
  assert.ok(positions.every(position => position >= 0), positions);
  assert.deepEqual([...positions].sort((a, b) => a - b), positions);
  assert.doesNotMatch(page, /data-component="(?:AdSlotTop|AdSlotBottom|AffiliateBlock)"/);
});

test('legal pages describe the actual inactive affiliate state', () => {
  assert.match(html('affiliate-disclosure/index.html'), /쿠팡 파트너스 배너나 개별 상품 추천·제휴 링크를 표시하지 않습니다/);
  assert.doesNotMatch(html('privacy/index.html'), /쿠팡의 외부 스크립트|쿠팡 파트너스 캐러셀/);
});
