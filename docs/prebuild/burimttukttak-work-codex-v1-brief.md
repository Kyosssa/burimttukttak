# 버림뚝딱 v1 구현 지시서 (Work + Codex)

작성일: 2026-09-22
목표: 도메인 비용 외 별도 서버 비용 없이, Cloudflare + GitHub 기반으로 운영하는 생활폐기물 검색/SEO 사이트 v1 구축

---

## 1. 서비스 정의

버림뚝딱은 사용자가 "이거 어떻게 버리지?"라고 검색했을 때 10초 안에 답을 얻는 서비스다.

핵심 UX:
1. 품목 검색
2. 즉시 정답 카드
3. 상세 배출 단계
4. 주의사항
5. 지역별 차이 안내
6. 공식 출처와 확인일
7. 관련 품목
8. 자연스러운 AdSense / 쿠팡 파트너스 영역

회원가입, 로그인, AI 채팅은 v1에서 만들지 않는다.

---

## 2. 기술 원칙

- GitHub 저장소를 단일 소스 저장소로 사용
- Cloudflare Pages 무료 플랜 사용
- 정적 HTML 중심
- 품목 데이터는 JSON으로 관리
- 검색은 클라이언트 사이드에서 실행
- 일반 페이지 조회 시 Worker를 호출하지 않는다
- SEO 품목 페이지는 빌드 타임에 정적 생성
- SSR 금지
- 사용자 검색 미등록 품목 집계만 Cloudflare Worker + D1 사용 가능
- 외부 API 장애가 사이트 표시를 막지 않도록 공식 데이터는 빌드 시 가져오고 정적 결과를 저장하는 방식 우선

---

## 3. 입력 데이터

기본 데이터 파일:
`burimttukttak-seed-v1.1.json`

현재 총 품목: 120
공식 검증 완료: 30
추가 조사 필요: 90

`verification_status == "verified"`인 품목만 공개 페이지를 생성한다.

`needs_research` 품목은 검색 자동완성/검색 결과에서 기본적으로 노출하지 않거나
"준비 중" 처리한다.

근거 없는 배출법을 AI가 임의 생성해서는 안 된다.

---

## 4. 공식 데이터 출처 우선순위

### A. 최신 공식 지침
분리의 정석 / 재활용가능자원의 분리수거 등에 관한 지침
https://www.xn--oy2b29bd3a601b.kr/front/bbsList.do?bbsId=BBS_0003

### B. 생활폐기물 공식 품목정보
분리의 정석
https://xn--oy2b29bd3a601b.kr/

### C. 폐가전
E-순환거버넌스 폐가전 무상방문수거
https://www.15990903.or.kr/

### D. 공식 OpenAPI
기후에너지환경부_분리배출 정보조회 서비스
https://www.data.go.kr/data/15156866/openapi.do?recommendDataYn=Y

OpenAPI는 무료이며 JSON REST API다.
서비스키는 브라우저에 노출하지 않는다.

주의:
공공데이터포털 메타데이터에 공간범위가 "대한민국 서울"로 표시되어 있다.
전국 지역별 데이터를 제공한다고 가정하지 말고 실제 응답을 먼저 검증한다.

---

## 5. 권장 디렉터리 구조

/
├─ src/
│  ├─ data/
│  │  ├─ items.json
│  │  ├─ categories.json
│  │  └─ search-index.json
│  ├─ templates/
│  │  ├─ item.html
│  │  ├─ category.html
│  │  └─ guide.html
│  ├─ js/
│  │  ├─ search.js
│  │  ├─ autocomplete.js
│  │  └─ missing-search.js
│  └─ css/
│     └─ app.css
│
├─ scripts/
│  ├─ build-items.mjs
│  ├─ build-search-index.mjs
│  ├─ build-sitemap.mjs
│  └─ validate-data.mjs
│
├─ public/
│  ├─ item/
│  ├─ category/
│  ├─ guides/
│  ├─ assets/
│  ├─ robots.txt
│  └─ sitemap.xml
│
├─ functions/
│  └─ api/
│     └─ missing-search.js
│
└─ package.json

기존 프로젝트 구조와 더 잘 맞는 방식이 있다면 변경 가능하나,
정적 사이트 원칙은 유지한다.

---

## 6. URL 규칙

홈:
/

품목:
`/item/{slug}/`

예:
`/item/frying-pan/`
`/item/battery/`
`/item/refrigerator/`

카테고리:
`/category/{slug}/`

가이드:
`/guides/e-waste/`
`/guides/recycling-basics/`

검색:
`/search/?q=후라이팬`

검색 결과 페이지에는 `noindex,follow` 적용.

별칭/오타별 별도 SEO 페이지를 생성하지 않는다.

예:
후라이팬
프라이팬
후라이펜
프라이펜

모두 `/item/frying-pan/` 하나로 연결.

---

## 7. 메인 페이지

모바일 우선.

상단 구조:

[버림뚝딱 로고]

"이거, 어떻게 버리지?"
"버릴 물건을 검색해보세요."

[검색창]
예: 후라이팬, 우산, 건전지

[인기 품목]
후라이팬 / 건전지 / 투명페트병 / 냉장고 / 스티로폼 / 보조배터리

[카테고리]

[간단한 서비스 소개]

[공식 정보 사용 안내]

검색이 화면의 주인공이어야 한다.

---

## 8. 품목 상세페이지 레이아웃

H1:
`후라이팬 버리는 법`

첫 화면에 광고보다 답을 먼저 보여준다.

### 정답 카드

예시:

✅ 고철류로 배출

금속이 주재질인 후라이팬은
이물질을 제거하고 고철류로 분리배출합니다.
분리 가능한 다른 재질의 손잡이는 분리하세요.

[지역에 따라 배출 장소/요일이 다를 수 있어요]

정답 카드 아래 첫 AdSense 가능.

이후 순서:

1. 버리는 순서
2. 주의사항
3. 무료수거/전용수거함 CTA (해당 품목만)
4. 지역별 차이
5. 관련 품목
6. 관련 생활용품 / 쿠팡
7. 두 번째 AdSense
8. 공식 출처
9. 정보 확인일

---

## 9. 폐가전 CTA

`collection_service` 필드를 사용한다.

예:

### 냉장고

[무료 방문수거 신청]
E-순환거버넌스
1개부터 신청 가능

### TV

31인치 이상:
단일 품목 수거 가능

30인치 이하:
현재 다량수거 기준 확인

### 선풍기

소형전기전자제품 수거함 우선
또는 소형 폐가전 다량수거 기준 확인

고정된 광고 문구처럼 쓰지 말고
품목 데이터에 따라 표시한다.

---

## 10. 검색 엔진

검색 대상:
- name
- aliases
- category
- optional search_keywords

우선순위:
1. 정확한 name 일치
2. aliases 정확 일치
3. prefix 일치
4. 부분 일치
5. typo/fuzzy 일치
6. 관련 품목

한글 초성 검색은 v1.1 또는 v1.2에서 가능.

오타 허용 예:
에어후라이어 → 에어프라이어
후라이펜 → 후라이팬

외부 검색 서버는 사용하지 않는다.

---

## 11. 검색 결과 없음 수집

DB에 없는 검색어가 입력되면:

"아직 등록되지 않은 품목이에요."

비슷한 품목 표시.

동시에:
POST `/api/missing-search`

Cloudflare Worker → D1

저장 권장:
- normalized_query
- count
- first_seen
- last_seen

개인정보, IP 주소, User-Agent는 필요 이상 저장하지 않는다.

동일 사용자의 반복 호출 방지를 위해 간단한 클라이언트 debounce/rate limiting 적용.

---

## 12. SEO

각 verified 품목마다 정적 HTML 생성.

title:
`{품목명} 버리는 법 | {배출분류} 배출 방법 - 버림뚝딱`

H1:
`{품목명} 버리는 법`

meta description:
Seed DB의 `seo.description` 활용.

필수:
- canonical
- Open Graph
- BreadcrumbList
- WebSite
- Organization
- 품목 페이지 WebPage/Article
- sitemap.xml
- robots.txt

검색 결과 페이지는 noindex.

지역명만 바꾼 복제 페이지는 만들지 않는다.

---

## 13. 콘텐츠 품질 원칙

금지:
- 검증되지 않은 배출방법 자동 생성
- 공식 자료 복붙
- 지역명만 바꾼 대량 페이지
- 500자짜리 SEO용 의미 없는 서론
- 답을 광고 아래 숨기기
- 사용자 위치를 강제로 요구하기

권장:
- 답부터 표시
- 3~5단계 절차
- 예외/주의사항 별도 카드
- 원문이 아니라 버림뚝딱 문장으로 재작성
- 공식 출처 링크
- `checked_at` 날짜 표시

---

## 14. 광고 위치

품목 페이지:

H1
↓
정답 카드
↓
AdSense #1
↓
상세 방법
↓
주의사항
↓
공식 기능 CTA
↓
관련 품목
↓
쿠팡 파트너스
↓
AdSense #2
↓
출처

CLS 방지를 위해 광고 슬롯 높이를 미리 예약.

쿠팡은 `shopping_keywords`가 있는 품목에만 노출.

---

## 15. 디자인

톤:
깨끗함 / 생활 / 환경 / 빠른 해결

모바일 우선.

기본:
- 밝은 배경
- 녹색 계열 포인트
- 둥근 정답 카드
- 큰 검색창
- 충분한 터치 영역
- 텍스트 대비 WCAG 고려
- 색상만으로 배출 분류를 구분하지 않음

상태 표시 예:
✅ 재활용
🗑️ 종량제
🔌 폐가전
🔋 전지
💡 조명
⚠️ 주의

이모지는 보조 수단만 사용.

---

## 16. 검증 스크립트

빌드 전에 반드시 `validate-data.mjs` 실행.

검사:
- slug 중복
- id 중복
- name 중복
- verified인데 summary 없음
- verified인데 sources 없음
- verified인데 steps 없음
- source checked_at 없음
- invalid related slug
- alias가 다른 품목 name과 충돌하는지
- SEO title/description 누락
- collection_service 스키마 오류

오류가 하나라도 있으면 빌드 실패.

---

## 17. 공식 OpenAPI 활용 전략

v1 배포는 seed-v1.1 JSON만으로 가능.

OpenAPI 연동은 초기 배포를 막지 않는다.

추천 2단계:

### v1
Seed JSON 정적 운영.

### v1.1
개발자가 수동 실행하는 sync 스크립트:
`scripts/sync-official-data.mjs`

- API 호출
- 응답을 staging JSON에 저장
- 기존 데이터와 diff 생성
- 자동으로 verified 덮어쓰기 금지
- 사람이 diff 확인 후 반영

### 이후
GitHub Actions 또는 Work/Codex를 이용해
주 1회/월 1회 변경사항 확인 가능.

절대로 외부 API 응답만 보고 운영 데이터를 무조건 자동 덮어쓰지 않는다.

---

## 18. v1 완료 기준

- verified 30개 품목 페이지 생성
- 120개 Seed DB 로딩
- 검색/자동완성
- alias/오타 지원
- 카테고리 탐색
- 폐가전 CTA
- 관련품목
- 공식출처/확인일
- sitemap/robots
- SEO metadata
- 반응형 모바일
- missing search API/D1 (가능하면 포함)
- AdSense 슬롯 자리
- Coupang 슬롯 자리
- Lighthouse 기본 품질 점검
- 검증 스크립트 통과

---

## 19. 배포 전 확인

배포 전에 개발 결과를 로컬/프리뷰에서 먼저 검토한다.

특히:
- 검색 정확성
- 모바일 레이아웃
- verified 30개 내용
- 폐가전 수거 조건
- 모든 외부 공식 링크
- 개인정보 수집 여부
- sitemap 포함 URL
- noindex 검색페이지
- 404 페이지

사용자 확인 없이 production 배포/도메인 DNS 변경은 하지 않는다.

---

## 20. 향후 v2

v2 후보:
- 공식 OpenAPI 기반 지역별 배출장소
- 우리동네 배출요일
- 대형폐기물 지역별 신고링크
- 지역별 수수료
- 품목 300~500개 확대
- 검색 실패 상위 키워드 자동 큐
- 정보 변경 감지
- "근처 어디에 버리지?" 지도
- 지자체별 조례/공식 페이지 연결

지역 SEO 페이지는 실제로 지역별 정보가 충분히 다를 때만 생성한다.
