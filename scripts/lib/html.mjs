import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const styleSource = readFileSync(new URL('../../src/styles.css', import.meta.url));
export const styleAsset = `style-${createHash('sha256').update(styleSource).digest('hex').slice(0, 12)}.css`;

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ESCAPES[char]);
export const formatDate = value => value.replaceAll('-', '.');
export const SITE_URL = 'https://beorimttukttak.com';

function safeJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export function layout({ title, description, canonical, content, mainClass = '', search = false, robots = 'index,follow', jsonLd = [] }) {
  const absoluteCanonical = canonical ? `${SITE_URL}${canonical}` : null;
  const social = absoluteCanonical ? `
  <link rel="canonical" href="${escapeHtml(absoluteCanonical)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="버림뚝딱">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(absoluteCanonical)}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">` : '';
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="${escapeHtml(robots)}">${social}
  <meta name="naver-site-verification" content="60090dcb1b94d4cc123aee5341a4cef1aff3c592" />
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7564661082214740" crossorigin="anonymous"></script>
  <link rel="stylesheet" href="/assets/${styleAsset}">
  ${jsonLd.map(value => `<script type="application/ld+json">${safeJson(value)}</script>`).join('\n  ')}
</head>
<body>
  <a class="skip-link" href="#main">본문으로 건너뛰기</a>
  <header class="site-header"><div class="wide"><a class="brand" href="/" aria-label="버림뚝딱 홈">버림뚝딱</a><nav aria-label="주요 메뉴"><a href="/#categories">카테고리</a><a href="/source-policy/">정보 검증</a><a href="/about/">소개</a></nav></div></header>
  <main id="main" class="${escapeHtml(mainClass)}">${content}</main>
  <footer><div class="wide"><strong>버림뚝딱</strong><nav aria-label="하단 메뉴"><a href="/about/">소개</a><a href="/source-policy/">정보 출처 및 검증 정책</a><a href="/privacy/">개인정보처리방침</a><a href="/affiliate-disclosure/">제휴 마케팅 안내</a><a href="/about/#contact">문의</a></nav><small>© 버림뚝딱</small></div></footer>
  ${search ? '<script type="module" src="/assets/app.js"></script>' : ''}
</body>
</html>`;
}

export function breadcrumb(parts) {
  return `<nav class="breadcrumb" aria-label="현재 위치">${parts.map((part, index) => part.href ? `<a href="${escapeHtml(part.href)}">${escapeHtml(part.label)}</a>${index < parts.length - 1 ? '<span aria-hidden="true">/</span>' : ''}` : `<span aria-current="page">${escapeHtml(part.label)}</span>`).join('')}</nav>`;
}
