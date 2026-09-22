import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import seed from '../docs/prebuild/burimttukttak-seed-v1.1.json' with { type: 'json' };
import categories from '../docs/prebuild/10-categories-v1.json' with { type: 'json' };
import { itemPage } from '../scripts/build-site.mjs';
import { monetizationConfig, renderAdSlotBottom, renderAdSlotTop, renderAffiliateBlock } from '../scripts/lib/monetization.mjs';

const verified = seed.items.filter(item => item.verification_status === 'verified');
const withKeywords = verified.find(item => item.shopping_keywords.length > 0);
const withoutKeywords = verified.find(item => item.shopping_keywords.length === 0);
const researchWithKeywords = seed.items.find(item => item.verification_status === 'needs_research' && item.shopping_keywords.length > 0);
const bySlug = new Map(seed.items.map(item => [item.slug, item]));
const categoryFor = item => categories.categories.find(category => category.source_label === item.category);
const enabled = {
  ads: { enabled: true, renderSlot: position => `<div data-test-ad="${position}">configured ad</div>` },
  affiliate: {
    enabled: true,
    disclosure: '이 링크를 통해 구매하면 운영자가 수수료를 받을 수 있습니다.',
    resolveOffers: () => [{ label: '설정된 제휴 링크', href: 'https://shop.example/product' }],
  },
};

test('disabled monetization config emits no empty advertising or affiliate markup', () => {
  assert.equal(renderAdSlotTop(monetizationConfig), '');
  assert.equal(renderAdSlotBottom(monetizationConfig), '');
  assert.equal(renderAffiliateBlock(withKeywords, monetizationConfig), '');
  for (const item of verified) {
    const html = readFileSync(join('dist', 'item', item.slug, 'index.html'), 'utf8');
    assert.doesNotMatch(html, /data-component="(?:AdSlotTop|AdSlotBottom|AffiliateBlock)"/);
    assert.doesNotMatch(html, /adsbygoogle|googlesyndication|coupang|partners\/external/i);
  }
});

test('configured detail order keeps the answer before ads and affiliate content', () => {
  const html = itemPage(withKeywords, categoryFor(withKeywords), bySlug, enabled);
  const positions = [
    html.indexOf('class="answer-card"'),
    html.indexOf('data-component="AdSlotTop"'),
    html.indexOf('class="steps"'),
    html.indexOf('관련 품목'),
    html.indexOf('data-component="AffiliateBlock"'),
    html.indexOf('data-component="AdSlotBottom"'),
  ];
  assert.ok(positions.every(position => position >= 0), positions);
  assert.deepEqual([...positions].sort((a, b) => a - b), positions);
  assert.match(html, /경제적 이해관계 안내/);
  assert.match(html, /rel="sponsored noopener noreferrer"/);
});

test('affiliate block requires both shopping keywords and complete explicit settings', () => {
  assert.equal(renderAffiliateBlock(withoutKeywords, enabled), '');
  assert.equal(renderAffiliateBlock(researchWithKeywords, enabled), '');
  assert.equal(renderAffiliateBlock(withKeywords, { affiliate: { enabled: true, disclosure: '', resolveOffers: enabled.affiliate.resolveOffers } }), '');
  assert.equal(renderAffiliateBlock(withKeywords, { affiliate: { enabled: true, disclosure: '고지', resolveOffers: () => [{ label: '상품', href: 'http://insecure.example' }] } }), '');
  assert.match(renderAffiliateBlock(withKeywords, enabled), /data-component="AffiliateBlock"/);
});

test('footer policy links resolve and published policy text matches the disconnected state', () => {
  const html = readFileSync(join('dist', 'item', withKeywords.slug, 'index.html'), 'utf8');
  for (const href of ['/privacy/', '/source-policy/', '/affiliate-disclosure/']) assert.match(html, new RegExp(`href="${href}"`));
  const disclosure = readFileSync(join('dist', 'affiliate-disclosure', 'index.html'), 'utf8');
  const privacy = readFileSync(join('dist', 'privacy', 'index.html'), 'utf8');
  assert.match(disclosure, /현재 버림뚝딱에는 제휴 링크, 상품 배너 또는 광고가 없습니다/);
  assert.match(privacy, /외부 분석 도구와 광고를 사용하지 않습니다/);
});

test('mobile styles constrain future slots and affiliate content at 360px', () => {
  const css = readFileSync(join('dist', 'assets', 'style.css'), 'utf8');
  assert.match(css, /\.ad-slot, \.affiliate-block \{ width: 100%; max-width: 100%; overflow: hidden; \}/);
  assert.match(css, /@media \(max-width: 420px\)/);
  assert.match(css, /\.ad-slot, \.affiliate-block \{ min-width: 0; \}/);
});
