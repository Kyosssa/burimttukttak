import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadInputs } from './lib/inputs.mjs';
import { breadcrumb, escapeHtml, formatDate, layout, SITE_URL } from './lib/html.mjs';
import { coupangCarouselAsset, monetizationConfig, renderAdSlotBottom, renderAdSlotTop, renderAffiliateBlock, renderCoupangCarousel } from './lib/monetization.mjs';
import { createSearchIndex } from '../src/search.mjs';

const root = new URL('../', import.meta.url);
const output = new URL('../dist/', import.meta.url);
const write = (relative, content) => {
  const url = new URL(relative, output);
  mkdirSync(new URL('./', url), { recursive: true });
  writeFileSync(url, content);
};
const pagePath = (prefix, slug) => `${prefix}/${slug}/index.html`;
const card = item => `<li><a class="item-card" href="/item/${escapeHtml(item.slug)}/"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.disposal_label)}</span></a></li>`;

function searchBox() {
  return `<section class="search-panel" aria-labelledby="search-title">
    <h2 id="search-title" class="sr-only">품목 검색</h2>
    <form id="search-form" role="search" action="/search/" method="get" novalidate>
      <label for="item-search">버릴 물건을 검색해보세요</label>
      <div class="search-control"><input id="item-search" name="q" type="search" placeholder="예: 후라이팬, 건전지, 냉장고" autocomplete="off" maxlength="60" role="combobox" aria-autocomplete="list" aria-controls="search-results" aria-expanded="false"><button type="submit">검색</button></div>
    </form>
    <div id="search-message" class="search-message" role="status" aria-live="polite"></div>
    <ul id="search-results" class="search-results" role="listbox" hidden></ul>
  </section>`;
}

const absolute = path => `${SITE_URL}${path}`;
const crumbData = parts => ({
  '@type': 'BreadcrumbList',
  itemListElement: parts.map((part, index) => ({
    '@type': 'ListItem', position: index + 1, name: part.name,
    ...(part.path ? { item: absolute(part.path) } : {}),
  })),
});

function home(seed, categories, bySlug) {
  const popular = ['frying-pan', 'battery', 'clear-pet-bottle', 'refrigerator', 'styrofoam', 'power-bank'].map(slug => bySlug.get(slug));
  const categoryCards = categories.map(category => `<li><a class="category-card" href="/category/${escapeHtml(category.slug)}/"><span class="category-icon" aria-hidden="true">${category.icon}</span><strong>${escapeHtml(category.name)}</strong><span>${escapeHtml(category.description)}</span></a></li>`).join('');
  const title = '버림뚝딱 | 생활폐기물 배출방법 검색';
  const description = '버릴 물건을 검색하면 공식 자료로 확인한 배출방법, 주의사항과 공식 출처를 빠르게 확인할 수 있습니다.';
  return layout({ title, description, canonical: '/', mainClass: 'home', search: true, jsonLd: [
    { '@context': 'https://schema.org', '@type': 'WebSite', name: '버림뚝딱', url: SITE_URL, description, inLanguage: 'ko-KR' },
    { '@context': 'https://schema.org', '@type': 'Organization', name: '버림뚝딱', url: SITE_URL },
  ], content: `
    <section class="hero wide"><p class="eyebrow">공식 자료로 확인한 생활폐기물 안내</p><h1>이거, 어떻게 버리지?</h1><p>버릴 물건을 검색하면 배출방법을 바로 알려드려요.</p>${searchBox()}</section>
    <div class="wide">${renderCoupangCarousel()}</div>
    <section class="wide section"><div class="section-heading"><h2>자주 찾는 품목</h2><p>공식 자료로 확인된 품목부터 안내합니다.</p></div><ul class="card-grid item-grid">${popular.map(card).join('')}</ul></section>
    <section id="categories" class="wide section"><div class="section-heading"><h2>카테고리로 찾기</h2><p>생활 속 물건을 종류별로 살펴보세요.</p></div><ul class="card-grid category-grid">${categoryCards}</ul></section>
    <section class="trust"><div class="wide"><div><p class="eyebrow">정보 원칙</p><h2>확인된 정보만 답합니다</h2></div><p>공식 출처를 확인한 품목에만 배출방법을 제공합니다. 지역마다 달라질 수 있는 내용은 관할 지방자치단체의 최신 안내를 함께 확인해 주세요.</p><a href="/source-policy/">정보 출처 및 검증 정책 보기</a></div></section>` });
}

export function itemPage(item, category, bySlug, monetization = monetizationConfig) {
  const related = item.related_items.map(slug => bySlug.get(slug)).filter(target => target?.verification_status === 'verified');
  const sources = item.sources.map(source => `<li><div><strong>${escapeHtml(source.name)}</strong><span>${escapeHtml(source.authority)}</span><span>확인일 ${formatDate(source.checked_at)}</span></div><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">공식 자료 보기<span class="sr-only"> (새 창)</span></a></li>`).join('');
  const regional = item.regional_variation ? `<aside class="notice"><h2>📍 지역에 따라 달라질 수 있어요</h2><p>${escapeHtml(item.regional_note)}</p></aside>` : '';
  const warnings = item.warnings.length ? `<section class="content-card warning"><h2>주의사항</h2><ul>${item.warnings.map(value => `<li>${escapeHtml(value)}</li>`).join('')}</ul></section>` : '';
  const cta = item.collection_service?.type === 'free_home_pickup' ? `<section class="collection-card"><p class="eyebrow">공식 수거 서비스</p><h2>🔌 폐가전 무상방문수거</h2><p>${item.collection_service.eligible === true ? '무료 방문수거 대상입니다.' : '조건에 따라 무료수거가 가능합니다.'}</p>${item.collection_service.eligible === 'conditional' ? '<p>제품 크기 또는 수량 조건을 공식 사이트에서 확인하세요.</p>' : ''}<a class="button secondary" href="${escapeHtml(item.collection_service.url)}" target="_blank" rel="noopener noreferrer">공식 사이트에서 신청 조건 확인<span class="sr-only"> (새 창)</span></a></section>` : '';
  const relatedBlock = related.length ? `<section class="content-card"><h2>관련 품목</h2><ul class="related-list">${related.map(target => `<li><a href="/item/${escapeHtml(target.slug)}/">${escapeHtml(target.name)} <span>${escapeHtml(target.disposal_label)}</span></a></li>`).join('')}</ul></section>` : '';
  const adSlotTop = renderAdSlotTop(monetization);
  const affiliateBlock = renderAffiliateBlock(item, monetization);
  const coupangCarousel = renderCoupangCarousel(monetization);
  const adSlotBottom = renderAdSlotBottom(monetization);
  const path = `/item/${item.slug}/`;
  const title = item.seo.title;
  const description = item.seo.description;
  return layout({ title, description, canonical: path, mainClass: 'detail narrow', jsonLd: [
    { '@context': 'https://schema.org', '@type': 'WebPage', name: title, description, url: absolute(path), inLanguage: 'ko-KR', isPartOf: { '@type': 'WebSite', name: '버림뚝딱', url: SITE_URL }, dateModified: item.verified_at },
    { '@context': 'https://schema.org', ...crumbData([{ name: '홈', path: '/' }, { name: category.name, path: `/category/${category.slug}/` }, { name: item.name, path }]) },
  ], content: `
    ${breadcrumb([{ label: '홈', href: '/' }, { label: category.name, href: `/category/${category.slug}/` }, { label: item.name }])}
    <h1>${escapeHtml(item.name)} 버리는 법</h1>
    <section class="answer-card"><p class="eyebrow">한눈에 보는 배출방법</p><h2>✓ ${escapeHtml(item.disposal_label)}</h2><p>${escapeHtml(item.summary)}</p></section>
    ${adSlotTop}${regional}
    <section class="content-card"><h2>버리는 순서</h2><ol class="steps">${item.steps.map(value => `<li>${escapeHtml(value)}</li>`).join('')}</ol></section>
    ${warnings}${cta}${relatedBlock}${affiliateBlock}${coupangCarousel}${adSlotBottom}
    <section class="content-card sources"><h2>공식 출처</h2><ul>${sources}</ul><p class="updated">정보 확인: ${formatDate(item.verified_at)}</p></section>
    <section class="feedback" id="feedback"><h2>정보가 달라졌나요?</h2><p>공식 기준이 변경되었거나 잘못된 내용을 발견했다면 알려주세요.</p><span class="button muted" aria-disabled="true">수정 제보 경로 준비 중</span></section>` });
}

function categoryPage(category, items) {
  const path = `/category/${category.slug}/`;
  const title = `${category.name} 배출방법 | 버림뚝딱`;
  const description = category.description;
  return layout({ title, description, canonical: path, mainClass: 'wide category-page', jsonLd: [
    { '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, description, url: absolute(path), inLanguage: 'ko-KR', isPartOf: { '@type': 'WebSite', name: '버림뚝딱', url: SITE_URL } },
    { '@context': 'https://schema.org', ...crumbData([{ name: '홈', path: '/' }, { name: category.name, path }]) },
  ], content: `
    ${breadcrumb([{ label: '홈', href: '/' }, { label: category.name }])}
    <header class="page-intro"><span class="category-icon" aria-hidden="true">${category.icon}</span><h1>${escapeHtml(category.name)}</h1><p>${escapeHtml(category.description)}</p></header>
    <section class="section"><div class="section-heading"><h2>확인된 품목</h2><p>${items.length ? `공식 자료로 확인된 ${items.length}개 품목입니다.` : '현재 공식 자료를 확인한 품목을 준비하고 있습니다.'}</p></div>${items.length ? `<ul class="card-grid item-grid">${items.map(card).join('')}</ul>` : '<div class="empty-state"><p>확인되지 않은 배출방법은 안내하지 않습니다.</p><a href="/">홈에서 다른 품목 검색하기</a></div>'}</section>` });
}

function policyPage(title, description, path, sections) {
  return layout({ title: `${title} | 버림뚝딱`, description, canonical: path, mainClass: 'narrow policy', content: `${breadcrumb([{ label: '홈', href: '/' }, { label: title }])}<h1>${escapeHtml(title)}</h1>${sections}` });
}

function searchPage() {
  const description = '버림뚝딱에서 생활폐기물 품목을 검색합니다.';
  return layout({ title: '품목 검색 | 버림뚝딱', description, robots: 'noindex,follow', mainClass: 'narrow policy', search: true, content: `${breadcrumb([{ label: '홈', href: '/' }, { label: '품목 검색' }])}<h1>품목 검색</h1><p>버릴 물건의 이름을 입력해 주세요. 공식 자료로 확인된 품목만 상세 배출방법을 제공합니다.</p>${searchBox()}` });
}

function sitemap(paths, items) {
  const dates = new Map(items.map(item => [`/item/${item.slug}/`, item.verified_at]));
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map(path => `  <url>\n    <loc>${absolute(path)}</loc>${dates.has(path) ? `\n    <lastmod>${dates.get(path)}</lastmod>` : ''}\n  </url>`).join('\n')}\n</urlset>\n`;
}

function headersFile() {
  return `https://:project.pages.dev/*
  X-Robots-Tag: noindex, nofollow

https://:version.:project.pages.dev/*
  X-Robots-Tag: noindex, nofollow

/search/*
  X-Robots-Tag: noindex, follow

/404.html
  X-Robots-Tag: noindex, nofollow

/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
  Cross-Origin-Resource-Policy: same-site

/assets/*
  Cache-Control: public, max-age=31536000, immutable
`;
}

function redirectsFile(indexablePaths) {
  const slashRedirects = indexablePaths.filter(path => path !== '/').concat('/search/').map(path => `${path.slice(0, -1)} ${path} 301`);
  return [`http://beorimttukttak.com/* https://beorimttukttak.com/:splat 301`, `https://www.beorimttukttak.com/* https://beorimttukttak.com/:splat 301`, ...slashRedirects].join('\n') + '\n';
}

export function buildSite() {
  const { seed, categories: categoryData } = loadInputs();
  const verified = seed.items.filter(item => item.verification_status === 'verified');
  const categories = categoryData.categories;
  const bySlug = new Map(seed.items.map(item => [item.slug, item]));
  const byCategory = new Map(categories.map(category => [category.source_label, category]));
  rmSync(output, { recursive: true, force: true });
  mkdirSync(output, { recursive: true });

  write('index.html', home(seed, categories, bySlug));
  for (const item of verified) write(pagePath('item', item.slug), itemPage(item, byCategory.get(item.category), bySlug));
  for (const category of categories) write(pagePath('category', category.slug), categoryPage(category, verified.filter(item => item.category === category.source_label)));

  write('about/index.html', policyPage('버림뚝딱 소개', '공식 자료를 바탕으로 생활폐기물 배출방법을 안내하는 버림뚝딱 서비스를 소개합니다.', '/about/', `<p>버림뚝딱은 생활 속에서 버리기 어려운 물건의 배출방법을 빠르게 찾을 수 있도록 공식 기관의 공개 자료를 이해하기 쉬운 형태로 정리하는 생활정보 서비스입니다.</p><p>품목별 기본 배출원칙, 주의사항, 폐가전 수거 가능 여부와 공식 출처를 함께 제공합니다.</p><p>폐기물 배출 요일, 수거 장소, 대형폐기물 수수료 등은 지역에 따라 다를 수 있으므로 지역별 정보가 필요한 경우 거주지 지방자치단체의 최신 안내도 함께 확인해 주세요.</p><section id="contact"><h2>문의</h2><p>운영자 연락 경로를 준비하고 있습니다. 연락처가 확정되기 전에는 개인정보를 받지 않습니다.</p></section>`));
  write('source-policy/index.html', policyPage('정보 출처 및 검증 정책', '버림뚝딱이 공식 출처를 확인하고 생활폐기물 정보를 관리하는 원칙을 안내합니다.', '/source-policy/', `<p>버림뚝딱은 다음 원칙으로 정보를 관리합니다.</p><ol><li>기후에너지환경부, 지방자치단체, E-순환거버넌스 등 공식 자료를 우선 사용합니다.</li><li>출처를 확인하지 못한 배출방법을 임의로 생성하지 않습니다.</li><li>검증된 품목에는 출처와 확인일을 표시합니다.</li><li>지역에 따라 달라질 수 있는 내용은 전국 공통사항처럼 단정하지 않습니다.</li><li>공식 기준이 변경된 경우 확인 후 정보를 갱신합니다.</li></ol><p>버림뚝딱의 정보는 생활 편의를 위한 안내이며, 실제 수거 가능 여부·배출일·수수료는 관할 지방자치단체 또는 수거기관의 최신 기준이 우선합니다.</p>`));
  write('privacy/index.html', policyPage('개인정보처리방침', '버림뚝딱의 현재 개인정보 처리 범위와 외부 링크 정책을 안내합니다.', '/privacy/', `<p>버림뚝딱은 서비스 운영에 필요한 범위에서 최소한의 정보만 처리하는 것을 원칙으로 합니다.</p><h2>현재 처리하는 정보</h2><p>현재 사이트는 회원가입, 로그인과 외부 분석 도구를 사용하지 않습니다. Google AdSense 검토 및 광고 제공 준비를 위해 공식 AdSense 스크립트를 불러오며, Google의 데이터 처리는 Google의 정책에 따릅니다. 현재 사이트에는 AdSense 광고 슬롯이나 Auto ads를 활성화하지 않았습니다. 홈과 공식 자료로 확인된 품목 상세에는 쿠팡 파트너스 캐러셀 배너를 표시하며, 해당 배너는 쿠팡의 외부 스크립트를 불러옵니다. 사이트 검색은 브라우저에서 처리합니다. 검색 결과가 실제로 없는 경우에만 품목 추가 우선순위를 정하기 위해 정리된 검색어, 검색 횟수, 최초·최근 검색 시각을 집계할 수 있습니다.</p><p>버림뚝딱 애플리케이션 데이터베이스에는 이름, 이메일 주소, IP 주소, User-Agent 원문, 쿠키 식별자, fingerprint 또는 정확한 위치를 저장하지 않습니다. Cloudflare와 쿠팡 등 외부 서비스의 인프라 수준 데이터 처리는 각 서비스의 정책에 따라 별도로 처리될 수 있습니다.</p><h2>외부 링크</h2><p>정부기관과 폐가전 수거기관, 쿠팡 등 외부 사이트 링크를 열면 해당 사이트의 개인정보처리방침이 적용됩니다.</p><h2>문의와 시행일</h2><p>운영자 연락 경로와 공개 시행일은 정식 공개 전에 확정해 반영합니다.</p>`));
  write('affiliate-disclosure/index.html', policyPage('제휴 마케팅 안내', '버림뚝딱의 쿠팡 파트너스 배너와 경제적 이해관계를 안내합니다.', '/affiliate-disclosure/', `<p>버림뚝딱은 홈과 공식 자료로 확인된 품목 상세페이지에 쿠팡 파트너스 캐러셀 배너를 표시합니다. 배너 바로 위에 경제적 이해관계 안내를 표시합니다.</p><p>배너를 통한 구매가 발생하면 구매자에게 별도 비용을 더하지 않으면서 버림뚝딱이 일정액의 수수료를 제공받을 수 있습니다.</p><p>현재 개별 상품 추천, 품목별 키워드 매칭, 쿠팡 외 제휴 링크는 제공하지 않습니다. Google AdSense 스크립트는 유지하지만 AdSense 광고 슬롯과 Auto ads는 활성화하지 않았습니다.</p>`));
  write('search/index.html', searchPage());
  write('404.html', layout({ title: '페이지를 찾을 수 없습니다 | 버림뚝딱', description: '요청한 페이지를 찾을 수 없습니다. 버림뚝딱에서 품목을 다시 검색해 주세요.', robots: 'noindex,nofollow', mainClass: 'narrow not-found', search: true, content: `<p class="eyebrow">404</p><h1>찾으시는 페이지가 없어요.</h1><p>주소를 다시 확인하거나 아래에서 물건을 검색해 주세요.</p>${searchBox()}<h2>자주 찾는 품목</h2><ul class="related-list"><li><a href="/item/frying-pan/">후라이팬</a></li><li><a href="/item/battery/">건전지</a></li><li><a href="/item/refrigerator/">냉장고</a></li></ul>` }));

  const indexablePaths = ['/', ...verified.map(item => `/item/${item.slug}/`), ...categories.map(category => `/category/${category.slug}/`), '/about/', '/source-policy/', '/privacy/', '/affiliate-disclosure/'];
  write('sitemap.xml', sitemap(indexablePaths, verified));
  write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /search/\nSitemap: ${SITE_URL}/sitemap.xml\n`);
  write('ads.txt', 'google.com, pub-7564661082214740, DIRECT, f08c47fec0942fa0\n');
  write('_headers', headersFile());
  write('_redirects', redirectsFile(indexablePaths));

  mkdirSync(new URL('assets/', output), { recursive: true });
  cpSync(new URL('../src/styles.css', import.meta.url), new URL('assets/style.css', output));
  cpSync(new URL('../src/app.mjs', import.meta.url), new URL('assets/app.js', output));
  cpSync(new URL('../src/coupang-carousel.mjs', import.meta.url), new URL(`assets/${coupangCarouselAsset}`, output));
  write('assets/missing-search.js', readFileSync(new URL('../src/missing-search.mjs', import.meta.url), 'utf8').replace("'./search.mjs'", "'./search.js'"));
  cpSync(new URL('../src/search.mjs', import.meta.url), new URL('assets/search.js', output));
  write('assets/search-index.json', JSON.stringify(createSearchIndex(seed.items)));
  return { items: verified.length, categories: categories.length, other: 8, sitemap: indexablePaths.length };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) console.log(buildSite());
