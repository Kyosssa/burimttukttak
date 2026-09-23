import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadInputs } from '../scripts/lib/inputs.mjs';
import { sourceContext } from '../scripts/lib/source-context.mjs';
import { formatDate } from '../scripts/lib/html.mjs';

const { seed, registry } = loadInputs();
const html = path => readFileSync(new URL(`../dist/${path}`, import.meta.url), 'utf8');
const verified = seed.items.filter(item => item.verification_status === 'verified');

test('all 100 verified pages show registry-derived scope and complete source provenance', () => {
  let local = 0;
  for (const item of verified) {
    const page = html(`item/${item.slug}/index.html`);
    const { sources, jurisdiction } = sourceContext(item, registry);
    assert.equal((page.match(/class="source-scope"/g) ?? []).length, 1, item.slug);
    assert.equal((page.match(/class="notice regional-notice"/g) ?? []).length, jurisdiction ? 1 : 0, item.slug);
    assert.ok(page.indexOf('class="answer-card"') < page.indexOf('class="source-scope"'), item.slug);
    assert.ok(page.indexOf('class="source-scope"') < page.indexOf('data-component="CoupangCarousel"'), item.slug);
    assert.match(page, /id="official-sources"/);
    if (jurisdiction) {
      local++;
      assert.ok(page.includes(`${jurisdiction} 공식 기준이에요. 거주 지역에 따라 다를 수 있어요.`), item.slug);
      assert.ok(page.includes('거주 지역의 시·군·구 홈페이지에서도 확인해 주세요.'), item.slug);
      assert.ok(page.includes(item.regional_note), item.slug);
      assert.match(page, /href="#official-sources"/);
    } else {
      assert.ok(page.includes('전국 단위 공식 자료를 기준으로 안내해요.'), item.slug);
      assert.ok(!page.includes('다른 지역에서는 배출 방식·신고 방법·수수료가 다를 수 있어요.'), item.slug);
    }
    for (const source of sources) {
      assert.ok(page.includes(`출처 기관: ${source.authority}`), item.slug);
      assert.ok(page.includes(`적용 범위: ${source.scope === 'local' ? source.jurisdiction : '전국 기준'}`), item.slug);
      assert.ok(page.includes(`확인일: ${formatDate(source.checked_at)}`), item.slug);
      assert.ok(page.includes(`다음 검토 예정일: ${formatDate(source.nextReview)}`), item.slug);
      assert.ok(page.includes(`href="${source.url}" target="_blank" rel="noopener noreferrer">${source.authority}의 ${source.name} 원문 보기`), item.slug);
    }
  }
  assert.equal(verified.length, 100);
  assert.equal(local, 20);
});

test('non-detail pages have no regional card and verified sitemap remains 113 URLs', () => {
  for (const path of ['index.html', 'search/index.html', 'about/index.html', 'source-policy/index.html', 'privacy/index.html', 'affiliate-disclosure/index.html', '404.html']) {
    assert.ok(!html(path).includes('regional-notice'), path);
  }
  for (const item of seed.items.filter(item => item.verification_status === 'needs_research')) {
    assert.ok(!html('sitemap.xml').includes(`/item/${item.slug}/`), item.slug);
  }
  assert.equal((html('sitemap.xml').match(/<loc>/g) ?? []).length, 113);
});
