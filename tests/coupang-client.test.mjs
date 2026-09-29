import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../src/coupang-carousel.mjs', import.meta.url), 'utf8');

function harness(width = 1280) {
  let callback;
  let deadline;
  let loader;
  let active = true;
  const bodyFrames = [];
  const slotFrames = [];
  class Frame {
    nodeType = 1;
    id = '';
    src = '';
    removed = false;
    matches(selector) { return selector === 'iframe'; }
    querySelectorAll() { return []; }
    remove() { this.removed = true; }
  }
  const slot = { replaceChildren(frame) {
    bodyFrames.splice(bodyFrames.indexOf(frame), 1);
    slotFrames.splice(0, slotFrames.length, frame);
    callback?.([{ addedNodes: [frame] }]);
  } };
  const banner = { hidden: true, removed: false, closest: () => ({}), querySelector: () => slot, remove() { this.removed = true; } };
  const document = {
    body: {},
    head: { append(node) { loader = node; } },
    querySelectorAll(selector) {
      if (selector === '[data-coupang-carousel]') return [banner];
      if (selector === 'iframe') return [...bodyFrames, ...slotFrames];
      return [];
    },
    createElement: () => ({}),
  };
  class Observer {
    constructor(fn) { callback = fn; }
    observe() {}
    disconnect() { active = false; }
  }
  let config;
  const window = {
    matchMedia: () => ({ matches: width <= 720 }),
    setTimeout(fn, ms) { assert.equal(ms, 5000); deadline = fn; return 1; },
    clearTimeout() { deadline = undefined; },
    PartnersCoupang: { G: class {
      constructor(value) {
        config = value;
        const frame = new Frame();
        frame.id = `${value.id}-banner`;
        bodyFrames.push(frame);
        if (active) callback?.([{ addedNodes: [frame] }]);
      }
    } },
  };
  runInNewContext(source, { document, window, HTMLIFrameElement: Frame, MutationObserver: Observer, Node: { ELEMENT_NODE: 1 } });
  return {
    banner, bodyFrames, slotFrames, get loader() { return loader; }, get config() { return config; },
    timeout() { deadline?.(); },
    addDuplicate() {
      const frame = new Frame();
      frame.id = `${config.id}-duplicate`;
      bodyFrames.push(frame);
      if (active) callback?.([{ addedNodes: [frame] }]);
      return frame;
    },
  };
}

test('Coupang stays absent on blocked loader and five-second timeout', () => {
  const blocked = harness();
  assert.equal(blocked.banner.hidden, true);
  assert.equal(blocked.loader.src, 'https://ads-partners.coupang.com/g.js');
  blocked.loader.onerror();
  assert.equal(blocked.banner.removed, true);
  const late = harness();
  late.timeout();
  assert.equal(late.banner.removed, true);
  late.loader.onload();
  assert.equal(late.slotFrames.length, 0);
});

for (const [width, id, frameWidth, frameHeight] of [[1280, 1034259, '728', '90'], [390, 1032289, '320', '100'], [360, 1032289, '320', '100']]) {
  test(`Coupang moves one ${frameWidth}x${frameHeight} iframe into the slot at ${width}px`, () => {
    const page = harness(width);
    page.loader.onload();
    assert.equal(page.config.id, id);
    assert.equal(page.config.trackingCode, 'AF4293553');
    assert.equal(page.slotFrames.length, 1);
    assert.equal(page.bodyFrames.length, 0);
    assert.equal(page.slotFrames[0].width, frameWidth);
    assert.equal(page.slotFrames[0].height, frameHeight);
    assert.equal(page.banner.hidden, false);
    const extra = page.addDuplicate();
    assert.equal(extra.removed, true);
    assert.equal(page.slotFrames.length, 1);
  });
}

test('carousel client never reads browser identity or storage', () => {
  assert.doesNotMatch(source, /document\.cookie|localStorage|sessionStorage|navigator\.|geolocation|fetch\(/);
});
