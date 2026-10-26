// One page-scoped banner; advertising never receives tool inputs or user files.
(() => {
  if (window.__ttukttakCoupangCarousel) return;
  const banners = [...document.querySelectorAll('[data-coupang-carousel]')];
  const banner = banners.find(node => node.closest('main'));
  if (!banner) return;
  window.__ttukttakCoupangCarousel = true;
  banners.filter(node => node !== banner).forEach(node => node.remove());
  const slot = banner.querySelector('[data-coupang-slot]');
  if (!slot) return;
  const loaderUrl = 'https://ads-partners.coupang.com/g.js';
  let started = false;

  const start = () => {
    if (started || !banner.isConnected) return;
    started = true;
    const available = slot.getBoundingClientRect().width;
    const config = available >= 728
      ? { id: 1034259, template: 'carousel', trackingCode: 'AF4293553', width: '728', height: '90', tsource: '' }
      : { id: 1032289, template: 'carousel', trackingCode: 'AF4293553', width: '320', height: '100', tsource: '' };
    const stage = document.createElement('div');
    stage.className = 'coupang-carousel__stage';
    slot.append(stage);
    const fit = () => {
      const scale = Math.min(1, slot.getBoundingClientRect().width / Number(config.width));
      stage.style.width = `${config.width}px`;
      stage.style.height = `${config.height}px`;
      stage.style.transform = `translateX(-50%) scale(${scale})`;
    };
    fit();
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(slot);
    else window.addEventListener('resize', fit, { passive: true });
    let settled = false;
    const cleanup = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      banner.dataset.coupangState = 'unavailable';
      stage.replaceChildren();
      // Keep the reserved space even if blocked, so content does not jump.
      slot.querySelector('[data-coupang-status]').textContent = '광고를 불러오지 못했습니다.';
    };
    const timeout = window.setTimeout(cleanup, 8000);
    const render = () => {
      if (settled) return;
      if (typeof window.PartnersCoupang?.G !== 'function') return cleanup();
      try {
        new window.PartnersCoupang.G({ ...config, container: stage, onLoaded: hasAd => {
          if (!hasAd) return cleanup();
          if (settled) return;
          settled = true;
          window.clearTimeout(timeout);
          banner.dataset.coupangState = 'loaded';
          slot.querySelector('[data-coupang-status]').hidden = true;
        } });
        const frame = stage.querySelector('iframe');
        if (frame) frame.title = '쿠팡 파트너스 광고';
      } catch {
        cleanup();
      }
    };
    if (window.PartnersCoupang?.G) return render();
    // Reuse an in-flight SDK load across repeated component initialization.
    if (!window.__ttukttakCoupangLoader) {
      window.__ttukttakCoupangLoader = new Promise((resolve, reject) => {
        let loader = document.querySelector(`script[src="${loaderUrl}"]`);
        const existing = Boolean(loader);
        if (!loader) {
          loader = document.createElement('script');
          loader.src = loaderUrl;
          loader.async = true;
        }
        loader.addEventListener('load', resolve, { once: true });
        loader.addEventListener('error', reject, { once: true });
        if (!existing) document.head.append(loader);
      });
    }
    window.__ttukttakCoupangLoader.then(render, cleanup);
  };
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      start();
    }, { rootMargin: '300px' });
    observer.observe(banner);
  } else start();
})();
