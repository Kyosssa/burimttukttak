import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadInputs } from '../scripts/lib/inputs.mjs';
import { carouselAsset } from '../scripts/lib/html.mjs';
import { isIndexable } from '../scripts/lib/index-quality.mjs';
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

test('one hidden carousel and hashed client appear only on home and 89 indexable details', () => {
  const targets = ['index.html', ...verified.filter(isIndexable).map(item => `item/${item.slug}/index.html`)];
  const excluded = [...verified.filter(item => !isIndexable(item)).map(item => `item/${item.slug}/index.html`), ...categories.categories.map(category => `category/${category.slug}/index.html`), 'about/index.html', 'source-policy/index.html', 'privacy/index.html', 'affiliate-disclosure/index.html', 'search/index.html', '404.html'];
  assert.equal(targets.length, 90);
  assert.equal(excluded.length, 25);
  for (const path of targets) {
    const page = html(path);
    assert.equal((page.match(/data-coupang-carousel/g) ?? []).length, 1, path);
    assert.equal((page.match(new RegExp(`src="/assets/${carouselAsset}"`, 'g')) ?? []).length, 1, path);
    assert.match(page, /data-coupang-carousel hidden/);
    assert.match(page, /광고 상품은 폐기물 배출 기준이나 품목별 상품 적합성을 뜻하지 않습니다/);
    const banner = page.indexOf('data-coupang-carousel');
    const mainEnd = page.indexOf('</main>');
    assert.ok(banner > 0 && banner < mainEnd && mainEnd < page.indexOf('<footer>'), path);
    if (path !== 'index.html') {
      for (const marker of ['class="answer-card"', 'class="warning"', 'data-section="related-items"', 'id="official-sources"']) assert.ok(page.indexOf(marker) < banner, `${path}: ${marker}`);
    } else assert.ok(page.indexOf('class="trust"') < banner);
  }
  for (const path of excluded) assert.doesNotMatch(html(path), /coupang-carousel|data-coupang|ads-partners\.coupang/i, path);
  assert.deepEqual(readdirSync('dist/assets').filter(file => file.includes('coupang')), [carouselAsset]);
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

test('answer precedes steps and related items with no inactive monetization region', () => {
  const page = itemPage(withKeywords, categoryFor(withKeywords), bySlug, monetizationConfig);
  const positions = [page.indexOf('class="answer-card"'), page.indexOf('class="steps"'), page.indexOf('data-section="related-items"')];
  assert.ok(positions.every(position => position >= 0), positions);
  assert.deepEqual([...positions].sort((a, b) => a - b), positions);
  assert.doesNotMatch(page, /data-component="(?:AdSlotTop|AdSlotBottom|AffiliateBlock)"/);
});

test('legal pages describe the actual scoped affiliate state', () => {
  assert.match(html('affiliate-disclosure/index.html'), /홈과 색인 가능한 verified 품목 상세페이지에는 쿠팡 파트너스 캐러셀 광고가 표시될 수 있습니다/);
  assert.match(html('affiliate-disclosure/index.html'), /일정액의 수수료를 제공받을 수 있습니다/);
  assert.match(html('privacy/index.html'), /쿠팡 파트너스 배너 스크립트를 불러올 수 있으며/);
});
