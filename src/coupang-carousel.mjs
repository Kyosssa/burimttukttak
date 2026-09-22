const LOADER_URL = 'https://ads-partners.coupang.com/g.js';
const CONFIG = Object.freeze({ id: 1032289, template: 'carousel', trackingCode: 'AF4293553', tsource: '' });

function loadPartnerScript() {
  const existing = document.querySelector('script[data-coupang-partners-loader="true"]');
  if (existing?.dataset.loaded === 'true') return Promise.resolve();
  if (existing?.dataset.failed === 'true') return Promise.reject(new Error('Coupang loader unavailable'));
  if (existing) return new Promise((resolve, reject) => {
    existing.addEventListener('load', resolve, { once: true });
    existing.addEventListener('error', reject, { once: true });
  });
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = LOADER_URL;
    script.async = true;
    script.dataset.coupangPartnersLoader = 'true';
    script.addEventListener('load', () => { script.dataset.loaded = 'true'; resolve(); }, { once: true });
    script.addEventListener('error', () => { script.dataset.failed = 'true'; reject(new Error('Coupang loader unavailable')); }, { once: true });
    document.head.append(script);
  });
}

function hasFrame(banner) {
  return Boolean(banner.querySelector('iframe'));
}

function initializeBanner(banner) {
  const desktop = banner.querySelector('[data-coupang-container="desktop"]');
  const mobile = banner.querySelector('[data-coupang-container="mobile"]');
  if (!desktop || !mobile || !window.PartnersCoupang?.G) throw new Error('Coupang container unavailable');
  new window.PartnersCoupang.G({ ...CONFIG, width: '728', height: '90', container: desktop.id });
  new window.PartnersCoupang.G({ ...CONFIG, width: '320', height: '100', container: mobile.id });
  const reveal = () => { if (hasFrame(banner)) banner.hidden = false; };
  const observer = new MutationObserver(reveal);
  observer.observe(banner, { childList: true, subtree: true });
  requestAnimationFrame(reveal);
  window.setTimeout(() => { reveal(); observer.disconnect(); if (!hasFrame(banner)) banner.remove(); }, 3000);
}

for (const banner of document.querySelectorAll('[data-coupang-carousel]')) {
  void loadPartnerScript().then(() => initializeBanner(banner)).catch(() => banner.remove());
}
