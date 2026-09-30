# 품목·상황별 탐색 확장 로컬 검토 (2026-09-30)

## 기준선과 작업 경계

main / origin main / 원격 main은 ecbd530615d61bbec2e7ffac750f7dd178db4939로 일치했고 시작 작업 트리는 깨끗했다. 기존 verified 100개 레코드는 변경하지 않았으며 needs_research 중 수세미·티백만 직접 원문 확인 후 승격했다. 가구 hold 11개 정책은 그대로다. 기존 GA 동의/분석 구현은 현재 main에 없으므로 새로 추가하지 않았다. D1/API/schema, Production D1 데이터, 광고 설정·브랜드 자산·DNS는 수정 또는 조회하지 않았다. commit/push/deploy는 하지 않았다.

## 레퍼런스 대표 화면 비교

|참고 화면|관찰|채택 여부|
|---|---|---|
|[어케버림 홈](https://www.eokeburim.kr/), [품목사전](https://www.eokeburim.kr/dictionary), [가이드](https://www.eokeburim.kr/blog)|검색·카테고리와 상황/가이드 진입을 분리|가이드 허브와 홈 진입을 채택. 품목명만 바꾼 가이드·가격/수거 가능성 추정은 제외|
|[블리스고 홈](https://blisgo.com/), [대표 보냉백 페이지](https://blisgo.com/일반쓰레기/보냉백-분리수거/)|최근 변경·품목별 답변과 관련 탐색|실제 변경 이력 표시를 채택. 인기·검색량 수치는 만들지 않음|
|[공식 품목사전](https://www.xn--oy2b29bd3a601b.kr/front/dischargeMethod/dictionary.do), [분리수거 지침](https://www.xn--oy2b29bd3a601b.kr/front/bbsList.do?bbsId=BBS_0003)|재질·조건과 지자체 우선 안내|폐기 사실은 공식 원문만 사용|

경쟁 화면은 질문과 탐색 구조 참고용이다. 경쟁 문구·이미지·데이터를 복제하지 않았으며, 전수 크롤링이나 런타임 외부 API를 추가하지 않았다. 공식 품목사전의 선정된 공개 URL만 수동으로 확인했다.

## 추가·승격 19개

목표 20~30개를 숫자로 채우지 않았다. 신규 17개 + 승격 2개. 각 상세는 해당 재질/내용물 조건을 답변·단계·주의사항에 명시한다. 모두 전국 단위 기후에너지환경부 품목사전이지만 지역별 별도 규칙이 우선한다. 확인일 2026-09-30, 다음 검토일 2026-10-30.

|처리|품목|slug|카테고리|직접 공식 원문|
|---|---|---|---|---|
|승격|수세미|scrubber|주방/조리도구|[품목 원문](https://www.xn--oy2b29bd3a601b.kr/front/dischargeMethod/dictionaryView.do?niIdx=485)|
|승격|티백|tea-bag|음식물/식재료|[품목 원문](https://www.xn--oy2b29bd3a601b.kr/front/dischargeMethod/dictionaryView.do?niIdx=419)|
|추가|핸드크림용기|hand-cream-container|포장재/재활용|[품목 원문](https://www.xn--oy2b29bd3a601b.kr/front/dischargeMethod/dictionaryView.do?niIdx=800)|
|추가|택배송장|shipping-label|포장재/재활용|[품목 원문](https://www.xn--oy2b29bd3a601b.kr/front/dischargeMethod/dictionaryView.do?niIdx=718)|
|추가|영수증|thermal-receipt|포장재/재활용|[품목 원문](https://www.xn--oy2b29bd3a601b.kr/front/dischargeMethod/dictionaryView.do?niIdx=730)|
|추가|비닐지퍼백|vinyl-zip-bag|포장재/재활용|[품목 원문](https://www.xn--oy2b29bd3a601b.kr/front/dischargeMethod/dictionaryView.do?niIdx=630)|
|추가|종이가방|paper-bag|포장재/재활용|[품목 원문](https://www.xn--oy2b29bd3a601b.kr/front/dischargeMethod/dictionaryView.do?niIdx=561)|
|추가|알약포장재|pill-blister-pack|포장재/재활용|[품목 원문](https://www.xn--oy2b29bd3a601b.kr/front/dischargeMethod/dictionaryView.do?niIdx=400)|
|추가|과일그물망|fruit-protection-net|포장재/재활용|[품목 원문](https://www.xn--oy2b29bd3a601b.kr/front/dischargeMethod/dictionaryView.do?niIdx=746)|
|추가|마스킹테이프|masking-tape|포장재/재활용|[품목 원문](https://www.xn--oy2b29bd3a601b.kr/front/dischargeMethod/dictionaryView.do?niIdx=714)|
|추가|행주|dishcloth|주방/조리도구|[품목 원문](https://www.xn--oy2b29bd3a601b.kr/front/dischargeMethod/dictionaryView.do?niIdx=728)|
|추가|식품방습제|food-desiccant|포장재/재활용|[품목 원문](https://www.xn--oy2b29bd3a601b.kr/front/dischargeMethod/dictionaryView.do?niIdx=457)|
|추가|육수팩|broth-bag|음식물/식재료|[품목 원문](https://www.xn--oy2b29bd3a601b.kr/front/dischargeMethod/dictionaryView.do?niIdx=744)|
|추가|한약찌꺼기|herbal-medicine-residue|음식물/식재료|[품목 원문](https://www.xn--oy2b29bd3a601b.kr/front/dischargeMethod/dictionaryView.do?niIdx=745)|
|추가|녹차잎|tea-leaves|음식물/식재료|[품목 원문](https://www.xn--oy2b29bd3a601b.kr/front/dischargeMethod/dictionaryView.do?niIdx=420)|
|추가|은박접시|foil-plate|포장재/재활용|[품목 원문](https://www.xn--oy2b29bd3a601b.kr/front/dischargeMethod/dictionaryView.do?niIdx=741)|
|추가|금속캔따개|metal-can-opener|주방/조리도구|[품목 원문](https://www.xn--oy2b29bd3a601b.kr/front/dischargeMethod/dictionaryView.do?niIdx=791)|
|추가|키친타올심|kitchen-paper-core|포장재/재활용|[품목 원문](https://www.xn--oy2b29bd3a601b.kr/front/dischargeMethod/dictionaryView.do?niIdx=560)|
|추가|복합재질칫솔꽂이|mixed-toothbrush-holder|생활/의류/욕실|[품목 원문](https://www.xn--oy2b29bd3a601b.kr/front/dischargeMethod/dictionaryView.do?niIdx=790)|

핸드크림 내용물, 용기형 제습제, 금속 캔따개의 복합재질/전동 제품, 모든 지퍼백 등은 검증 범위를 확대하지 않았다. 육수팩 원문의 내용물 안내는 열거된 재료에만 한정하고 다른 뼈·껍데기로 확장하지 않는다.

## 후보 50개 전수 처리

기존 20개 + 신규 후보 30개를 검토했다. 기존 이름/별칭과 정확히 충돌하는 후보 및 난좌처럼 기존 스티로폼·종이 분기와 겹치는 후보는 추가하지 않았다. 아래 신규 보류 후보는 Seed에도 추가하지 않으며, 검색 결과를 verified처럼 만들지 않는다.

|후보|결과|이유|
|---|---|---|
|주방칼|보류|날·손잡이 재질과 안전 포장 조건을 한 답변으로 검증하지 못함.|
|가위|보류|금속 단일재질 원문만으로 기존 일반 가위 후보의 복합재질까지 확정할 수 없음.|
|수저|보류|금속·플라스틱·목재를 포함하는 이름이므로 단일 답변 보류.|
|젓가락|보류|금속·나무·플라스틱과 사용 상태별 조건 원문 확인 부족.|
|유리컵|보류|내열·강화·일반 유리를 포괄하는 기존 이름에 필요한 조건 확인 부족.|
|텀블러|보류|혼합 재질 제품을 한 가지 경로로 확정할 수 없음.|
|보온병|보류|진공 구조·혼합 재질의 직접 근거가 이번 조사에서 부족.|
|수세미|승격|직접 공식 품목 원문을 확인해 승격.|
|택배봉투|보류|비닐·복합재질·보냉 구조를 포괄하여 이름만으로 판단 불가.|
|새우껍질|보류|지역 차이를 포함한 해당 품목의 직접 원문을 이번에 확보하지 못함.|
|티백|승격|직접 공식 품목 원문을 확인해 승격.|
|신발|보류|공식 검색에서 고무신·운동화·부츠 등 재질별 구분이 확인되어 일반 신발을 일괄 승격하지 않음.|
|가방|보류|천·가죽·복합재질·바퀴 구조별 조건이 달라 기존 일반 후보 유지.|
|면도기|보류|수동·일회용과 전기제품이 섞이지 않도록 직접 근거 추가 필요.|
|샤워기헤드|보류|단일·복합재질을 구분할 직접 근거 부족.|
|변기커버|보류|재질·수거 경로의 직접 원문 확인 부족.|
|라이터|보류|잔류 연료와 제품 조건을 뒷받침하는 직접 공식 근거 부족.|
|화장품|보류|내용물과 용기 재질이 다른 포괄 항목이므로 유지. 새 핸드크림용기는 도포·첩합 표시 조건만 안내.|
|향수|보류|잔류 내용물과 용기 처리 조건의 직접 근거 부족.|
|매니큐어|보류|잔류액 및 용기 조건의 공식 원문 확인 부족.|
|핸드크림용기|신규|직접 공식 품목 원문 및 재질·조건 확인.|
|택배송장|신규|직접 공식 품목 원문 및 재질·조건 확인.|
|영수증|신규|직접 공식 품목 원문 및 재질·조건 확인.|
|비닐지퍼백|신규|직접 공식 품목 원문 및 재질·조건 확인.|
|종이가방|신규|직접 공식 품목 원문 및 재질·조건 확인.|
|알약포장재|신규|직접 공식 품목 원문 및 재질·조건 확인.|
|과일그물망|신규|직접 공식 품목 원문 및 재질·조건 확인.|
|마스킹테이프|신규|직접 공식 품목 원문 및 재질·조건 확인.|
|행주|신규|직접 공식 품목 원문 및 재질·조건 확인.|
|식품방습제|신규|직접 공식 품목 원문 및 재질·조건 확인.|
|육수팩|신규|직접 공식 품목 원문 및 재질·조건 확인.|
|한약찌꺼기|신규|직접 공식 품목 원문 및 재질·조건 확인.|
|녹차잎|신규|직접 공식 품목 원문 및 재질·조건 확인.|
|은박접시|신규|직접 공식 품목 원문 및 재질·조건 확인.|
|금속캔따개|신규|직접 공식 품목 원문 및 재질·조건 확인.|
|키친타올심|신규|직접 공식 품목 원문 및 재질·조건 확인.|
|복합재질칫솔꽂이|신규|직접 공식 품목 원문 및 재질·조건 확인.|
|염색약용기|보류|도포·첩합 원문(niIdx=799)을 확인했지만 이번 핸드크림용기와 동일 재질 규칙이고 남은 염색약 처리는 확인되지 않아 별도 유사 페이지 보류.|
|걸레|보류|원문(niIdx=342)은 행주·수건 등 천과 오염·파손 조건을 설명. 이번 행주와 겹치는 질문이므로 별도 페이지를 만들지 않음.|
|종이호일|보류|코팅·사용 상태 조건을 직접 품목 원문으로 추가 확인해야 함.|
|비닐랩|보류|이번 지퍼백 근거를 랩까지 확대하지 않음.|
|화장솜|보류|성분·오염 상태별 직접 공식 근거 미확보.|
|물티슈|보류|직접 원문 미확인. 유사품목 목록만으로 승격하지 않음.|
|치실|보류|직접 원문 미확인. 칫솔꽂이 검색어 목록은 처리 근거가 아님.|
|샤워볼|보류|직접 원문 미확인. 수세미와 같은 방법이라고 추정하지 않음.|
|샤워기필터|보류|직접 원문 미확인. 수세미 유사품목 목록만으로 상세를 만들지 않음.|
|향초|보류|잔류 왁스와 용기 재질별 원문 근거 필요.|
|에어캡|보류|재질·오염 조건의 직접 품목 원문 추가 확인 필요.|
|튀김기름|보류|공식 지침의 폐식용유 수거 원칙은 확인했지만 생활 배출 경로와 관할 수거 조건을 충분히 확인하지 못함.|
|흡수패드|보류|식품 방습제와 같은 것으로 일반화할 수 없으며 직접 원문 미확인.|

## 가이드의 고유 역할

- /guides/parcel-components/: 한 택배의 상자·송장·테이프·완충재를 구성품별로 나누고 코팅 조건 확인.
- /guides/before-moving/: 가구와 폐가전의 경로를 구분하고 수량·크기·설치 상태를 접수 전에 확인. 파주 매트리스 상세로 연결될 때 해당 상세의 지역 적용 표시를 확인하도록 안내하며 전국 수수료를 만들지 않음.
- /guides/food-or-general/: 포장재와 음식 내용물 구분 → 우린 차/한약 찌꺼기 확인 → 품목별 지역 출처 확인. 특정 지역 음식물 기준을 전국화하지 않음.

가이드 단계마다 출처 레지스트리 ID를 연결하고 공식 근거·적용 범위·확인일을 표시한다. 상세 설명 복사 대신 확인 순서와 canonical 상세 링크를 제공한다. WebPage/BreadcrumbList, 허브 CollectionPage만 사용한다. 가이드 쿠팡 loader/슬롯은 0이며 기존 공통 AdSense loader만 유지한다.

## 수량

|항목|변경 전|로컬 변경 후|
|---|---:|---:|
|전체 Seed|120|137|
|verified/공개 상세|100|119|
|needs_research|20|18|
|hold|11|11|
|색인 상세|89|108|
|가이드+허브|0|4|
|sitemap|100|123|
|쿠팡 대상 홈+색인 상세|90|109|

## 구현 및 검증

- Seed·직접 출처 레지스트리·변경 이력·후보 manifest 추가. 기존 verified 및 기존 출처 항목은 유지.
- 정적 가이드/허브, 홈 최근 변경 및 가이드 카드. 최근 변경은 실제 changelog의 날짜 내림차순/slug 고정순서로 품목별 최신 기록 6개. hold/research 제외.
- guide 데이터의 중복 slug/title/description, 직접 공식 source tier, indexable 상세 링크 검증을 build에 연결. 새 페이지 수에 맞춰 기존 수량 회귀를 명시적으로 갱신.
- 신규 canonical/alias 검색 및 서버 D1 0회 테스트 추가. API 구현 변경 없이 Seed 자동 known 정책 사용. 기존 34 fixture 유지.
- 로컬 Preview의 SVG/PNG/ICO MIME만 보완해 브랜드 원본 변경 없이 화면 확인 가능하게 함.

검증 결과와 화면 증빙은 아래 최종 확인 절에 기록한다.

## 최종 로컬 확인

- `npm run preflight`: 최종 승인 점검 성공. 전체 테스트 179/179, 기존 검색 fixture 34/34 유지.
- `npm run build`: 성공. 119 상세·8 카테고리·가이드 3개+허브, sitemap 123 URL. Wrangler 3.114.17 Pages Functions 번들 성공.
- `audit:dist`: 내부 링크 오류 0, 중복/누락 sitemap 0, canonical/index/noindex 정상, 로컬 없는 URL 실제 404. 쿠팡 대상 109개, 비대상 29개, 비대상 loader 0.
- 신규 canonical/alias 모두 해당 verified 상세로 연결되고 서버 D1 작업 0회. 전체 137개 이름 및 전체 별칭 검사도 통과. 기존 정상 missing bound UPSERT/개인정보 제외/30초 중복 방지 회귀 유지.
- title/description/canonical 중복 0. 정확히 복제된 indexable 본문 0. 기존 hold 중복 11개와 기존 유사 본문 수동 검토 경고는 유지.
- source-health: 레지스트리 27개, 미매핑 0, 검토 기한 도래 0. 보고만 생성하며 네트워크/Seed 변경 없음.
- PC 1280px, 모바일 360·390px: 가이드 3개 및 핸드크림용기·육수팩 상세의 가로 넘침 0. 신규 상세에서 기존 쿠팡 iframe 1개, PC 728×90 / 모바일 320×100. 가이드 loader/iframe 0.
- 홈 → 가이드 → 상세, 새 별칭 `키친 타월 심` → `/item/kitchen-paper-core/`, `신발` 확인 중, 미등록 검색의 다음 행동 안내, 이메일 형태 입력의 보호 안내를 로컬 브라우저에서 확인.
- 로컬 정적 Preview에는 API 서버가 없으므로 TODAY fallback이 표시된다. D1 API 동작은 mock 기반 회귀 테스트로 확인했으며 Production D1은 조회하지 않았다.
- 기존 JS 원본은 모두 바이트 수와 내용 유지. CSS 12,039 → 12,281 bytes (+242 bytes), 가이드 전용 새 런타임 JS 없음. Seed 변경으로 검색 asset 해시와 검색 index 크기는 변경됨.
- AdSense loader/ads.txt, Naver, TODAY, 기존 쿠팡 설정, 브랜드 자산, 기존 출처 레코드 및 verified 100개 보존 확인.
- `git diff --check`: 성공. 16개 tracked 수정 + 5개 신규 파일, staging/commit/push/배포 없음.
- 화면 증빙: `.tmp/expansion-guide-mobile.png`, `.tmp/expansion-item-desktop.png`, `.tmp/expansion-item-390.png`, `.tmp/expansion-layout.json` (Git 제외).

## 변경 파일

- 데이터: `docs/prebuild/burimttukttak-seed-v1.1.json`, `docs/prebuild/12-source-registry-v1.json`, `data/changelog.json`, `data/content-expansion-2026-09-30.json`, `data/guides.json`.
- 생성/검사/스타일: `scripts/build-site.mjs`, `scripts/lib/guides.mjs`, `scripts/audit-dist.mjs`, `scripts/preview.mjs`, `src/styles.css`.
- 테스트: `tests/content-expansion.test.mjs`, `tests/index-quality.test.mjs`, `tests/indexable-content.test.mjs`, `tests/monetization.test.mjs`, `tests/search.test.mjs`, `tests/seo.test.mjs`, `tests/site.test.mjs`, `tests/source-presentation.test.mjs`, `tests/today-visitors.test.mjs`, `tests/validation.test.mjs`.
- 보고서: `docs/CONTENT-EXPANSION-2026-09-30.md`.

## 남은 확인사항

31개 보류 후보(기존 research 18개, 신규 미등록 13개)는 위 사유에 따른 직접 원문/제품 조건 추가 확인이 필요하다. 색인 가구 hold는 해제하지 않았다. 로컬 결과 검토 후 별도 승인된 커밋·배포 단계에서 새 canonical URL의 Production 200, 신규 가이드 링크, 지역 표시 및 광고 제외를 다시 확인해야 한다. 이번 작업은 배포 전 로컬 결과이며 운영 사이트의 품목 수는 아직 변경되지 않는다.

## 승인 후 최종 범위 점검

사용자가 단일 커밋·main non-force push·Production 자동 배포 확인을 승인했다. 알약포장재 첫 답변에 빈 포장재임을 명시했고, 6개 주의 후보의 재질·내용물 제한과 모든 지역 출처 상세의 첫 답변 카드에 관할 지역이 표시되는 회귀 검사를 추가했다. 나머지 공식 근거 범위와 상태는 그대로 유지한다. sitemap 구성은 색인 상세 108 + 카테고리 8 + 가이드 허브 1 + 가이드 3 + 공개 정보(about/source-policy) 2 + 홈 1 = 123이다. hold 11, research 18, 검색, privacy, affiliate-disclosure, 404는 sitemap에서 제외한다. 앞의 로컬 작업 경계 및 운영 미반영 문구는 최초 검토 시점 기록이다.
