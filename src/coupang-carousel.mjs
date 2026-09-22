const CONFIG = Object.freeze({ id: 1032289, template: 'carousel', trackingCode: 'AF4293553', tsource: '' });

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
  try {
    initializeBanner(banner);
  } catch {
    banner.remove();
  }
}
