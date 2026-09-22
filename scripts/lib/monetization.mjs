import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { escapeHtml } from './html.mjs';

const carouselSource = readFileSync(new URL('../../src/coupang-carousel.mjs', import.meta.url));
export const coupangCarouselAsset = `coupang-carousel-${createHash('sha256').update(carouselSource).digest('hex').slice(0, 12)}.js`;

export const monetizationConfig = Object.freeze({
  ads: Object.freeze({ enabled: false }),
  affiliate: Object.freeze({
    enabled: true,
    disclosure: '이 배너는 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받을 수 있습니다.',
  }),
});

function renderAdSlot(position, config) {
  if (config?.ads?.enabled !== true || typeof config.ads.renderSlot !== 'function') return '';
  const content = config.ads.renderSlot(position);
  if (typeof content !== 'string' || !content.trim()) return '';
  const component = position === 'top' ? 'AdSlotTop' : 'AdSlotBottom';
  return `<aside class="ad-slot ad-slot-${position}" data-component="${component}" aria-label="광고">${content}</aside>`;
}

export function renderAdSlotTop(config = monetizationConfig) {
  return renderAdSlot('top', config);
}

export function renderAdSlotBottom(config = monetizationConfig) {
  return renderAdSlot('bottom', config);
}

function validAffiliateOffer(value) {
  if (!value || typeof value.label !== 'string' || !value.label.trim() || typeof value.href !== 'string') return false;
  try {
    return new URL(value.href).protocol === 'https:';
  } catch {
    return false;
  }
}

export function renderAffiliateBlock(item, config = monetizationConfig) {
  if (item?.verification_status !== 'verified') return '';
  if (!Array.isArray(item?.shopping_keywords) || item.shopping_keywords.length === 0) return '';
  if (config?.affiliate?.enabled !== true || typeof config.affiliate.resolveOffers !== 'function') return '';
  const disclosure = config.affiliate.disclosure;
  if (typeof disclosure !== 'string' || !disclosure.trim()) return '';
  const offers = config.affiliate.resolveOffers(item);
  if (!Array.isArray(offers) || offers.length === 0 || !offers.every(validAffiliateOffer)) return '';
  return `<section class="affiliate-block" data-component="AffiliateBlock"><h2>관련 생활용품</h2><p class="affiliate-disclosure"><strong>경제적 이해관계 안내</strong> ${escapeHtml(disclosure)}</p><ul>${offers.map(offer => `<li><a href="${escapeHtml(offer.href)}" target="_blank" rel="sponsored noopener noreferrer">${escapeHtml(offer.label)}<span class="sr-only"> (제휴 링크, 새 창)</span></a></li>`).join('')}</ul></section>`;
}

export function renderCoupangCarousel(config = monetizationConfig) {
  if (config?.affiliate?.enabled !== true || typeof config.affiliate.disclosure !== 'string' || !config.affiliate.disclosure.trim()) return '';
  return `<section class="affiliate-block coupang-carousel" data-component="CoupangCarousel" data-coupang-carousel hidden aria-label="쿠팡 제휴 배너"><p class="affiliate-disclosure"><strong>경제적 이해관계 안내</strong> ${escapeHtml(config.affiliate.disclosure)}</p><div class="coupang-carousel-frame"><div id="coupang-carousel-desktop" class="coupang-carousel-container coupang-carousel-desktop" data-coupang-container="desktop"></div><div id="coupang-carousel-mobile" class="coupang-carousel-container coupang-carousel-mobile" data-coupang-container="mobile"></div></div><script src="https://ads-partners.coupang.com/g.js" data-coupang-partners-loader="true"></script><script type="module" src="/assets/${coupangCarouselAsset}"></script></section>`;
}
