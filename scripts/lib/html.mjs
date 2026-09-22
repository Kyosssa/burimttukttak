const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ESCAPES[char]);
export const formatDate = value => value.replaceAll('-', '.');

export function layout({ title, content, mainClass = '', search = false }) {
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="/assets/style.css">
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
