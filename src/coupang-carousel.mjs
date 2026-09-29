// Anonymous, page-scoped banner. No storage or visitor information is read.
(() => {
  const banners = document.querySelectorAll('[data-coupang-carousel]');
  if (banners.length !== 1 || !banners[0].closest('main')) {
    banners.forEach(banner => banner.remove());
    return;
  }

  const banner = banners[0];
  const slot = banner.querySelector('[data-coupang-slot]');
  if (!slot) {
    banner.remove();
    return;
  }

  const compact = window.matchMedia('(max-width: 720px)').matches;
  const config = compact
    ? { id: 1032289, trackingCode: 'AF4293553', subId: null, template: 'carousel', width: '320', height: '100' }
    : { id: 1034259, trackingCode: 'AF4293553', template: 'carousel', width: '728', height: '90', tsource: '' };
  let displayedFrame = null;
  let stopped = false;
  let timeout;

  const isCarouselFrame = frame => frame instanceof HTMLIFrameElement && (
    frame.id.startsWith(String(config.id)) || /(^|\.)ads-partners\.coupang\.com/i.test(frame.src)
  );
  const place = frame => {
    if (!isCarouselFrame(frame) || stopped || frame === displayedFrame) return;
    if (displayedFrame) {
      frame.remove();
      return;
    }
    displayedFrame = frame;
    frame.width = config.width;
    frame.height = config.height;
    frame.title = '쿠팡 파트너스 광고';
    slot.replaceChildren(frame);
    banner.hidden = false;
    window.clearTimeout(timeout);
  };
  const scan = root => root.querySelectorAll?.('iframe').forEach(place);
  const observer = new MutationObserver(records => {
    for (const record of records) for (const node of record.addedNodes) {
      if (node.nodeType !== Node.ELEMENT_NODE) continue;
      if (node.matches?.('iframe')) place(node);
      scan(node);
    }
  });
  const cleanup = () => {
    if (displayedFrame) return;
    stopped = true;
    observer.disconnect();
    banner.remove();
  };
  observer.observe(document.body, { childList: true, subtree: true });
  timeout = window.setTimeout(cleanup, 5000);

  const loader = document.createElement('script');
  loader.src = 'https://ads-partners.coupang.com/g.js';
  loader.async = true;
  loader.onload = () => {
    if (stopped) return;
    if (typeof window.PartnersCoupang?.G !== 'function') return cleanup();
    try {
      new window.PartnersCoupang.G(config);
      scan(document);
    } catch {
      cleanup();
    }
  };
  loader.onerror = cleanup;
  document.head.append(loader);
})();
