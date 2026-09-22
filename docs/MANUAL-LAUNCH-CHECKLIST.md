# 운영 전 수동 확인 체크리스트

아래의 `{BASE_URL}`을 Preview URL 또는 `https://burimttukttak.com`으로 바꿔 확인합니다. Preview와 Production에서 각각 한 번 수행합니다.

## 주요 URL

- [ ] `{BASE_URL}/` — 홈, 검색창, 8개 카테고리 진입
- [ ] `{BASE_URL}/item/frying-pan/` — 일반 verified 상세와 출처
- [ ] `{BASE_URL}/item/refrigerator/` — 폐가전 공식 수거 CTA
- [ ] `{BASE_URL}/category/kitchen/` — 카테고리 목록
- [ ] `{BASE_URL}/search/?q=후라이팬` — verified 검색
- [ ] `{BASE_URL}/search/?q=프라이팬` — alias가 후라이팬으로 연결
- [ ] `{BASE_URL}/search/?q=에어후라이기` — needs_research `확인 중`, 상세 링크 없음
- [ ] `{BASE_URL}/search/?q=골프공` — 실제 missing 안내와 D1 집계
- [ ] `{BASE_URL}/item/air-fryer/` — 실제 HTTP 404
- [ ] `{BASE_URL}/definitely-missing/` — 실제 HTTP 404와 custom 404 본문
- [ ] `{BASE_URL}/about/`, `/source-policy/`, `/privacy/`, `/affiliate-disclosure/`
- [ ] `{BASE_URL}/robots.txt`, `/sitemap.xml`

## 기능과 화면

- [ ] 360px, 768px, 데스크톱에서 가로 넘침 없음
- [ ] AnswerCard가 첫 광고·제휴 위치보다 먼저임
- [ ] 현재 설정에서는 빈 광고 박스와 제휴 블록이 보이지 않음
- [ ] 공식 출처와 폐가전 CTA는 새 창으로 열리고 `noopener noreferrer`가 적용됨
- [ ] footer의 소개·출처·개인정보·제휴·문의 링크가 모두 열림
- [ ] 키보드 Tab, 위/아래 화살표, Enter, Esc로 검색을 사용할 수 있음

## D1와 장애 동작

- [ ] verified, alias, needs_research 검색 후 D1 count가 변하지 않음
- [ ] 실제 missing 검색 후 해당 정규화 검색어 count만 증가함
- [ ] 같은 검색어를 빠르게 반복해도 브라우저 debounce가 작동함
- [ ] Preview DB와 Production DB가 서로 분리됨
- [ ] D1 binding을 잠시 제거한 Preview에서도 검색 결과 화면이 유지됨

## 색인과 요청

- [ ] Preview 응답에 `X-Robots-Tag: noindex, nofollow`
- [ ] Production 홈·품목·카테고리·정책 페이지는 `index,follow`
- [ ] Production 검색은 `noindex,follow`, 404는 `noindex,nofollow`
- [ ] sitemap에는 43개 canonical URL만 존재
- [ ] 브라우저 Network 패널에서 미등록 검색 API 외 광고·제휴·Analytics 요청 0건
- [ ] Production에 Preview용 noindex 응답 헤더가 없음

## 출시 승인 기록

- 확인 환경:
- 확인 날짜:
- 확인자:
- Preview URL:
- Production URL:
- 남은 보류 사항:
