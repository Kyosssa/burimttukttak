import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const source = readFileSync(new URL('../src/coupang-carousel.mjs', import.meta.url), 'utf8');
function harness(width = 728, mode = 'loaded') {
  let loader, deadline, config, calls = 0;
  const status = { textContent: '광고 영역', hidden: false };
  const frame = {};
  const stage = { style: {}, querySelector: () => frame, replaceChildren() { this.cleared = true; } };
  const slot = { getBoundingClientRect: () => ({ width }), append() {}, querySelector: () => status };
  const banner = { isConnected: true, dataset: {}, closest: () => ({}), querySelector: () => slot };
  const handlers = {};
  const document = {
    querySelectorAll: () => [banner], querySelector: () => null,
    createElement: tag => tag === 'div' ? stage : { addEventListener(name, callback) { handlers[name] = callback; } },
    head: { append(value) { loader = value; } },
  };
  const window = { setTimeout(fn) { deadline = fn; }, clearTimeout() {}, addEventListener() {} };
  const run = () => runInNewContext(source, { document, window, Promise });
  run();
  const sdk = () => { window.PartnersCoupang = { G: class { constructor(options) { calls++; config = options; if (mode === 'throw') throw Error('blocked'); if (mode !== 'timeout') options.onLoaded(mode !== 'empty'); } } }; };
  return { banner, slot, stage, status, frame, run, get calls() { return calls; }, get config() { return config; }, get loader() { return loader; },
    async load() { sdk(); handlers.load(); await Promise.resolve(); },
    async fail() { handlers.error(); await Promise.resolve(); }, timeout() { deadline(); },
  };
}
for (const width of [288, 320, 375, 390, 430, 727, 728, 1280, 1920]) {
  test(`one correctly configured creative fits ${width}px container`, async () => {
    const page = harness(width); await page.load(); page.run();
    assert.equal(page.calls, 1);
    assert.equal(page.config.id, width >= 728 ? 1034259 : 1032289);
    assert.equal(page.config.trackingCode, 'AF4293553'); assert.equal(page.config.tsource, '');
    assert.equal(page.config.template, 'carousel');
    assert.equal(page.config.container, page.stage); assert.equal(page.banner.dataset.coupangState, 'loaded');
    assert.equal(page.frame.title, '쿠팡 파트너스 광고');
    if (width < 320) assert.match(page.stage.style.transform, /scale\(0\.9\)/);
  });
}
for (const mode of ['throw','empty','timeout','network']) {
  test(`advertising ${mode} failure keeps reserved slot and stops late render`, async () => {
    const page = harness(728, mode);
    if (mode === 'network') await page.fail();
    else if (mode === 'timeout') { page.timeout(); await page.load(); assert.equal(page.calls, 0); }
    else await page.load();
    assert.equal(page.banner.dataset.coupangState, 'unavailable');
    assert.equal(page.stage.cleared, true);
    assert.equal(page.status.textContent, '광고를 불러오지 못했습니다.');
    assert.equal(page.slot.getBoundingClientRect().width, 728);
  });
}
test('client does not access tool data or browser storage', () => {
  assert.doesNotMatch(source, /document\.cookie|localStorage|sessionStorage|\.files|FormData|fetch\(/);
});
