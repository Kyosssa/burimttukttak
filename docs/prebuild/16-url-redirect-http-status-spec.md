# 버림뚝딱 URL / Redirect / HTTP 상태 정책 v1

## 대표 호스트

production 도메인은 정확히 하나만 사용:
`https://beorimttukttak.com`

`www.beorimttukttak.com`을 연결한다면 production에서는 한 쪽으로 HTTP 301.
JavaScript redirect 사용 금지.

Cloudflare Preview / `*.pages.dev`:
- 공개 테스트 가능
- `X-Robots-Tag: noindex`

## 품목 URL 변경

예:
기존 `/item/old-slug/`
신규 `/item/new-slug/`

→ HTTP 301

redirect chain 금지:
old → middle → new ❌
old → new ✅

## alias

`/item/frypan/` 같은 alias SEO URL을 새로 생성하지 않는다.
검색 UI에서 canonical `/item/frying-pan/`으로 이동.

과거 실수로 alias URL을 배포했다면 301 canonical로 보낸다.

## 삭제 품목

실수/중복으로 만들어진 URL:
- 적절한 대체 페이지가 있으면 301
- 대체가 없으면 실제 404 또는 410 검토
- 전부 홈으로 redirect 금지

## Custom 404

내용:
- `찾으시는 페이지가 없어요.`
- 메인 검색창
- 인기 품목 링크

반드시 HTTP 404 응답 유지.
HTML 내용만 404처럼 만들고 200을 반환하는 soft 404 금지.

## 점검

사이트 전체 장애/계획 점검:
가능하다면 503 + Retry-After 고려.
점검 페이지를 200으로 장기간 반환하지 않는다.

## Search query

`/search/?q=...`
- 정상 200
- `noindex,follow`
- canonical을 개별 검색어마다 자기 자신으로 생성하지 않음
- sitemap 제외

## Trailing slash

한 형식으로 통일:
`/item/frying-pan/`

`/item/frying-pan` 요청이 별도로 존재한다면 하나로 canonical/redirect 처리.
