import { escapeHtml } from './html.mjs';

export const monetizationConfig = Object.freeze({
  ads: Object.freeze({ enabled: false }),
  affiliate: Object.freeze({ enabled: false }),
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
