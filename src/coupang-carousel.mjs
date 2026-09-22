const CONFIG = Object.freeze({ id: 1032289, template: 'carousel', trackingCode: 'AF4293553', tsource: '' });

function hasFrame(banner) {
  return [...banner.querySelectorAll('iframe')].some(frame => Number(frame.getAttribute('width')) > 0 && Number(frame.getAttribute('height')) > 0);
}

function waitForPartner(timeoutMs = 3000) {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const check = () => {
      if (window.PartnersCoupang?.G) return resolve();
      if (Date.now() - startedAt >= timeoutMs) return reject(new Error('Coupang loader unavailable'));
      window.setTimeout(check, 25);
    };
    check();
  });
}

function initializeBanner(banner) {
  const desktop = banner.querySelector('[data-coupang-container="desktop"]');
  const mobile = banner.querySelector('[data-coupang-container="mobile"]');
  if (!desktop || !mobile || !window.PartnersCoupang?.G) throw new Error('Coupang container unavailable');
  new window.PartnersCoupang.G({ ...CONFIG, width: '728', height: '90', container: desktop });
  new window.PartnersCoupang.G({ ...CONFIG, width: '320', height: '100', container: mobile });
  const reveal = () => { if (hasFrame(banner)) banner.hidden = false; };
  const observer = new MutationObserver(reveal);
  observer.observe(banner, { childList: true, subtree: true, attributes: true, attributeFilter: ['width', 'height', 'style'] });
  requestAnimationFrame(reveal);
  window.setTimeout(() => { reveal(); observer.disconnect(); if (!hasFrame(banner)) banner.remove(); }, 3000);
}

for (const banner of document.querySelectorAll('[data-coupang-carousel]')) {
  void waitForPartner().then(() => initializeBanner(banner)).catch(() => banner.remove());
}
