# 2차 품목·콘텐츠 확장 — 2026-10-03

## 기준과 작업 경계

main 기준 커밋 0220bd642475c32b3f4111f8272a5289ce42e9bd, 시작 시 Git 작업 트리 깨끗함. 실제 기준 119 verified / 18 needs_research / hold 11 / 색인 상세 108 / sitemap 123으로 요청과 일치. 쇼츠 및 다른 프로젝트는 작업에서 제외했다. 로컬 구현·검증만 수행하며 staging, commit, push, Production 배포 없음. Production D1 조회·수정, migration, DNS 접근 없음.

1차 보고서의 보류 31개(기존 research 18 + 미등록 13)를 재검토했고 11개의 부족 사유를 해소했다. 별도 후보 5개를 함께 반영해 신규 12 + 승격 4 = 16개. 숫자를 맞추기 위한 유사 페이지를 만들지 않았다. 기존 verified 119개와 출처 레코드 27개의 JSON 내용, 남은 research 14개는 기준 커밋 SHA-256 비교 회귀로 보존한다.

## 추가·승격 및 공식 근거

아래 품목사전은 기후에너지환경부의 전국 단위 공개 자료다. 전국 모든 제품의 처리법을 보장하는 뜻이 아니며 해당 재질·내용물·상태 조건과 지자체 별도 방식 우선 안내를 유지한다. 신규 확인일 2026-10-03, 30일 검토 주기의 다음 예정일 2026-11-02.

|품목 / slug|구분|카테고리|직접 공식 원문|적용 조건|
|---|---|---|---|---|
|물티슈 / wet-wipes|추가|생활/의류/욕실|[공식 원문 1](https://www.xn--oy2b29bd3a601b.kr/front/dischargeMethod/dictionaryView.do?niIdx=375)|폴리에스터·부직포 등으로 만든 물티슈는 재활용이 어려워 종량제봉투로 배출하도록 공식 품목사전이 안내합니다.|
|화장솜 / cotton-pad|추가|생활/의류/욕실|[공식 원문 1](https://www.xn--oy2b29bd3a601b.kr/front/dischargeMethod/dictionaryView.do?niIdx=733)|면 또는 펄프·레이온 혼방 재질의 화장솜은 공식 품목사전에서 종량제봉투 배출 대상으로 안내합니다.|
|치실 / dental-floss|추가|생활/의류/욕실|[공식 원문 1](https://www.xn--oy2b29bd3a601b.kr/front/dischargeMethod/dictionaryView.do?niIdx=725)|공식 품목사전은 플라스틱 손잡이에 나일론·폴리에스테르 실이 부착된 치실을 재질별 분리가 어려운 종량제봉투 대상으로 안내합니다.|
|종이호일 / baking-paper|추가|주방/조리도구|[공식 원문 1](https://www.xn--oy2b29bd3a601b.kr/front/dischargeMethod/dictionaryView.do?niIdx=410)|실리콘을 코팅한 종이호일은 내수성·내유성·내열성을 가진 코팅 때문에 재활용이 어려워 종량제봉투로 배출하도록 공식 품목사전이 안내합니다.|
|에어캡 / bubble-wrap|추가|포장재/재활용|[공식 원문 1](https://www.xn--oy2b29bd3a601b.kr/front/dischargeMethod/dictionaryView.do?niIdx=106)|공식 품목사전은 에어캡을 이물질을 제거한 후 비닐류 수거함으로 배출하도록 안내합니다.|
|흡수패드 / food-absorbent-pad|추가|포장재/재활용|[공식 원문 1](https://www.xn--oy2b29bd3a601b.kr/front/dischargeMethod/dictionaryView.do?niIdx=454)|육류·생선 포장에서 핏물이나 물기를 흡수하는 종이·부직포·고흡수성수지(SAP) 혼합 패드는 공식 품목사전의 종량제봉투 대상입니다.|
|식품포장랩 / food-wrap|추가|포장재/재활용|[공식 원문 1](https://www.xn--oy2b29bd3a601b.kr/front/dischargeMethod/dictionaryView.do?niIdx=119)|가정용 PE 랩은 이물질을 제거한 깨끗한 상태에서 비닐류로 배출합니다. 오염된 랩은 일반쓰레기이며, 공식 품목사전은 배달·마트 포장용 PVC 랩을 재활용 불가로 구분합니다.|
|청소세제용기 / cleaner-container|추가|생활/의류/욕실|[공식 원문 1](https://www.xn--oy2b29bd3a601b.kr/front/dischargeMethod/dictionaryView.do?niIdx=595)|내용물을 완전히 제거한 HDPE·PET 등 플라스틱 청소세제 용기는 물로 헹구는 등 깨끗한 상태로 플라스틱 수거함에 배출하도록 공식 품목사전이 안내합니다.|
|가루세제 / powder-detergent|추가|생활/의류/욕실|[공식 원문 1](https://www.xn--oy2b29bd3a601b.kr/front/dischargeMethod/dictionaryView.do?niIdx=399)|가루세제 내용물은 흩날리지 않도록 비닐에 담아 종량제봉투로 배출하도록 공식 품목사전이 안내합니다. 가루세제와 빈 포장재는 구분합니다.|
|샤워커튼 / shower-curtain|추가|생활/의류/욕실|[공식 원문 1](https://www.xn--oy2b29bd3a601b.kr/front/dischargeMethod/dictionaryView.do?niIdx=398)|면·폴리에스테르·PVC·PEVA 등이 혼합된 샤워커튼은 재활용이 어려워 종량제봉투로 배출하도록 공식 품목사전이 안내합니다.|
|샤워캡 / shower-cap|추가|생활/의류/욕실|[공식 원문 1](https://www.xn--oy2b29bd3a601b.kr/front/dischargeMethod/dictionaryView.do?niIdx=397) · [공식 원문 2](https://www.xn--oy2b29bd3a601b.kr/front/dischargeMethod/dictionaryView.do?niIdx=769)|비닐 단일재질 샤워캡은 비닐류로, 실리콘이나 섬유·고무 등이 섞인 복합재질 샤워캡은 종량제봉투로 배출하도록 공식 품목사전이 구분합니다.|
|테이프클리너 / lint-roller|추가|생활/의류/욕실|[공식 원문 1](https://www.xn--oy2b29bd3a601b.kr/front/dischargeMethod/dictionaryView.do?niIdx=120)|플라스틱 몸체와 테이프로 구성된 테이프클리너는 테이프를 제거해 몸체는 플라스틱으로, 테이프는 일반쓰레기로 나누도록 공식 품목사전이 안내합니다.|
|주방칼 / kitchen-knife|승격|주방/조리도구|[공식 원문 1](https://www.xn--oy2b29bd3a601b.kr/front/dischargeMethod/dictionaryView.do?niIdx=711)|공식 품목사전은 칼의 날카로운 부분을 충분히 감싼 뒤 종량제봉투로 배출하도록 안내합니다. 금속이라는 이유만으로 고철류에 넣는 기준은 아닙니다.|
|가위 / scissors|승격|주방/조리도구|[공식 원문 1](https://www.xn--oy2b29bd3a601b.kr/front/dischargeMethod/dictionaryView.do?niIdx=762) · [공식 원문 2](https://www.xn--oy2b29bd3a601b.kr/front/dischargeMethod/dictionaryView.do?niIdx=306)|날과 손잡이 등 부품이 모두 금속인 가위는 고철류입니다. 여러 재질이 섞인 가위는 날카로운 부분을 감싸 종량제봉투로 배출하도록 공식 품목사전이 구분합니다.|
|면도기 / razor|승격|생활/의류/욕실|[공식 원문 1](https://www.xn--oy2b29bd3a601b.kr/front/dischargeMethod/dictionaryView.do?niIdx=331)|플라스틱과 금속이 섞인 일회용 면도기는 칼날이 노출되지 않도록 충분히 감싼 후 종량제봉투로 배출하도록 공식 품목사전이 안내합니다.|
|가방 / bag|승격|생활/의류/욕실|[공식 원문 1](https://www.xn--oy2b29bd3a601b.kr/front/dischargeMethod/dictionaryView.do?niIdx=150) · [공식 원문 2](https://www.xn--oy2b29bd3a601b.kr/front/bbsList.do?bbsId=BBS_0003)|상태가 좋은 가방은 의류수거함의 허용 품목을 먼저 확인합니다. 해지거나 오염돼 재사용이 어려운 가방은 종량제봉투로, 크기가 커 봉투 배출이 어려운 경우에는 대형폐기물로 안내합니다.|

### 일반화 방지

- 치실: 원문이 설명하는 플라스틱 손잡이와 섬유 실의 결합 제품 범위. 치실통·구강세정기 기준은 아님.
- 면도기: 기존 name/slug/alias는 유지하며 첫 답변부터 일회용 플라스틱·금속 복합제품으로 제한. 전기·금속 단일재질·다른 수동 제품의 배출법은 미확정.
- 가위: 금속 단일/복합 두 원문으로 한 페이지 안에서 분기. 칼은 별도 원문의 날 보호 조건을 사용.
- 식품포장랩: 깨끗한 가정용 PE / 오염 / PVC를 한 페이지에서 구분. PVC 원문은 재활용 불가이므로 추가 처리법을 창작하지 않음.
- 샤워캡: 비닐 단일 / 실리콘·복합 원문을 한 페이지에 연결. 샤워커튼은 원문의 혼합재질 범위로 제한.
- 청소세제용기: 내용물을 완전히 제거한 HDPE·PET 등 플라스틱 용기만 안내. 남은 액체 세제의 처리법은 확인 대상으로 남김. 가루세제는 별도 직접 원문.
- 흡수패드: 육류·생선 포장용 종이·부직포·SAP 혼합 패드. 식품 방습제·아이스팩으로 확대하지 않음.
- 가방: 재사용 상태/수거함 허용/봉투 배출 가능한 크기를 구분. 바퀴가방·골프가방 예외는 기존 공식 지침을 함께 연결. 수거 장소·가격·가능 여부를 보장하지 않음.

## 1차 보류 후보 전수 재검토

해결된 후보도 이전 부족 사유를 manifest에 보존한다. 아래 보류는 이번 원문 검토로 해결하지 못했거나 기존 상세와 질문이 중복되는 경우다. 유사 검색어·유사 품목 목록만으로 사실을 확정하지 않았다.

|후보|이번 처리|이유|
|---|---|---|
|주방칼|추가 또는 승격|직접 공식 품목 원문을 확인했고 재질·상태 조건을 상세에 제한하여 반영. 기존 근거 부족 사유 해소.|
|가위|추가 또는 승격|직접 공식 품목 원문을 확인했고 재질·상태 조건을 상세에 제한하여 반영. 기존 근거 부족 사유 해소.|
|수저|보류 유지|금속·플라스틱·목재를 포함하는 이름이므로 단일 답변 보류.|
|젓가락|보류 유지|금속·나무·플라스틱과 사용 상태별 조건 원문 확인 부족.|
|유리컵|보류 유지|내열·강화·일반 유리를 포괄하는 기존 이름에 필요한 조건 확인 부족.|
|텀블러|보류 유지|혼합 재질 제품을 한 가지 경로로 확정할 수 없음.|
|보온병|보류 유지|진공 구조·혼합 재질의 직접 근거가 이번 조사에서 부족.|
|택배봉투|보류 유지|비닐·복합재질·보냉 구조를 포괄하여 이름만으로 판단 불가.|
|새우껍질|보류 유지|지역 차이를 포함한 해당 품목의 직접 원문을 이번에 확보하지 못함.|
|신발|보류 유지|공식 검색에서 고무신·운동화·부츠 등 재질별 구분이 확인되어 일반 신발을 일괄 승격하지 않음.|
|가방|추가 또는 승격|직접 공식 품목 원문을 확인했고 재질·상태 조건을 상세에 제한하여 반영. 기존 근거 부족 사유 해소.|
|면도기|추가 또는 승격|직접 공식 품목 원문을 확인했고 재질·상태 조건을 상세에 제한하여 반영. 기존 근거 부족 사유 해소.|
|샤워기헤드|보류 유지|단일·복합재질을 구분할 직접 근거 부족.|
|변기커버|보류 유지|재질·수거 경로의 직접 원문 확인 부족.|
|라이터|보류 유지|잔류 연료와 제품 조건을 뒷받침하는 직접 공식 근거 부족.|
|화장품|보류 유지|내용물과 용기 재질이 다른 포괄 항목이므로 유지. 새 핸드크림용기는 도포·첩합 표시 조건만 안내.|
|향수|보류 유지|잔류 내용물과 용기 처리 조건의 직접 근거 부족.|
|매니큐어|보류 유지|잔류액 및 용기 조건의 공식 원문 확인 부족.|
|염색약용기|보류 유지|도포·첩합 원문(niIdx=799)을 확인했지만 이번 핸드크림용기와 동일 재질 규칙이고 남은 염색약 처리는 확인되지 않아 별도 유사 페이지 보류.|
|걸레|보류 유지|원문(niIdx=342)은 행주·수건 등 천과 오염·파손 조건을 설명. 이번 행주와 겹치는 질문이므로 별도 페이지를 만들지 않음.|
|종이호일|추가 또는 승격|직접 공식 품목 원문을 확인했고 재질·상태 조건을 상세에 제한하여 반영. 기존 근거 부족 사유 해소.|
|비닐랩|추가 또는 승격|직접 공식 품목 원문을 확인했고 재질·상태 조건을 상세에 제한하여 반영. 기존 근거 부족 사유 해소.|
|화장솜|추가 또는 승격|직접 공식 품목 원문을 확인했고 재질·상태 조건을 상세에 제한하여 반영. 기존 근거 부족 사유 해소.|
|물티슈|추가 또는 승격|직접 공식 품목 원문을 확인했고 재질·상태 조건을 상세에 제한하여 반영. 기존 근거 부족 사유 해소.|
|치실|추가 또는 승격|직접 공식 품목 원문을 확인했고 재질·상태 조건을 상세에 제한하여 반영. 기존 근거 부족 사유 해소.|
|샤워볼|보류 유지|직접 원문 미확인. 수세미와 같은 방법이라고 추정하지 않음.|
|샤워기필터|보류 유지|직접 원문 미확인. 수세미 유사품목 목록만으로 상세를 만들지 않음.|
|향초|보류 유지|잔류 왁스와 용기 재질별 원문 근거 필요.|
|에어캡|추가 또는 승격|직접 공식 품목 원문을 확인했고 재질·상태 조건을 상세에 제한하여 반영. 기존 근거 부족 사유 해소.|
|튀김기름|보류 유지|공식 지침의 폐식용유 수거 원칙은 확인했지만 생활 배출 경로와 관할 수거 조건을 충분히 확인하지 못함.|
|흡수패드|추가 또는 승격|직접 공식 품목 원문을 확인했고 재질·상태 조건을 상세에 제한하여 반영. 기존 근거 부족 사유 해소.|

남은 후보 20개 = research 14개 + 미등록 6개. 신발은 스니커즈·부츠·슬리퍼 원문은 확인했지만 기존 운동화·구두 별칭 전체에 충분한 직접 근거가 없어 유지. 샤워기헤드는 샤워기 복합재질 원문이 헤드 전체 재질을 포괄하지 않아 유지. 수저는 복합재질 원문만으로 단일재질 전체를 설명할 수 없어 유지. 남은 화장품·향수·매니큐어·라이터의 내용물별 처리법, 유리컵·텀블러·보온병 등 구조별 경로는 추가 공식 원문이 필요하다. 염색약용기·걸레는 이전의 유사 질문 중복 사유를 유지한다.

## 가이드의 고유 역할

- /guides/bathroom-cleanup/: 내용물이 남았는지 → 빈 용기와 본체·포장·캡 구분 → 샤워용품 재질 확인. 남은 액체의 폐기법을 새로 만들지 않는다.
- /guides/before-clothing-bin/: 수거함 허용 품목 → 재사용 상태 → 침구·특수 잡화 제외 목록과 관할 안내. 제외 품목을 모두 종량제라고 단정하지 않는다.

각 단계는 실제 source ID, 해당 재질 상세 canonical 링크로 연결한다. 기존 택배·이사·음식물 가이드와 역할이 다르며 상세 본문 복사 모음이 아니다. 기존 공식 분리수거 지침의 의류 항목을 직접 재확인했고 지역별 처리 조건을 유지했다. 새 가이드에 쿠팡 영역/loader 추가 없음.

## 수량

|항목|전|후|
|---|---:|---:|
|Seed|137|149|
|verified / 공개 상세|119|135|
|needs_research|18|14|
|hold|11|11|
|색인 상세|108|124|
|가이드|3|5|
|sitemap|123|141|
|전체 HTML(404 포함)|138|156|

sitemap 141 = 색인 상세 124 + 카테고리 8 + 가이드 허브 1 + 가이드 5 + about/source-policy 2 + 홈 1. hold·research·검색·privacy·affiliate-disclosure·404 제외 유지.

## 검증

- npm run preflight 성공: 검색 fixture 34/34, 전체 테스트 183/183, 정적 build 및 고정 Wrangler 3.114.17 Functions 번들 성공.
- npm run build 성공: 135 상세 / 8 카테고리 / 5 가이드 + 허브 / sitemap 141.
- 전체 149개 canonical name와 전체 alias 정확한 연결; known/alias/research 서버 D1 작업 0회. API 코드·schema 변경 없음.
- 내부 링크·관련 링크 canonical-only/자기 자신·중복 없음, 실제 없는 URL 및 research 실제404.
- title/description/canonical 중복 0, JSON-LD 파싱·유형/robots/noindex·hold 정상. 정확히 복제된 색인 본문 0. 기존 가구 hold 11개와 기존 유사 본문 수동 경고 유지.
- source-health: 45 registry sources, unmapped 0, 현재 검토 기한 도래 0. 네트워크 수집·Seed 변경 없이 보고만 수행.
- 광고 대상 홈+색인 상세 125; 비대상 31. AdSense loader 156 및 ads.txt, TODAY, 기존 쿠팡 설정·실패 처리·GA 정책·브랜드 원본 회귀 유지.
- PC 1280 / 모바일 360·390: 식품포장랩·가위·청소세제용기와 새 가이드 2개, 총 15개 뷰포트/페이지 조합 가로 넘침 0. 기존 제휴 슬롯의 실제 iframe은 식품포장랩에서 PC 728×90 / 모바일 320×100 1개 확인. 모든 상세의 광고 외부 응답 성공을 보장한 검사는 아님. 가이드 carousel/iframe 0.
- 홈 최근 품목의 실제 2026-10-03 변경 이력 및 가이드 링크, 별칭 뽁뽁이 → 에어캡, 신발 → 확인 중 표시를 로컬 UI에서 확인.
- 로컬 정적 Preview에는 API가 없어 TODAY fallback 유지. Production D1 접근 없이 mock 보호 회귀로 검사.
- JS/CSS 소스 변경 0, 추가 클라이언트 런타임 없음. 검색 index는 Seed 증가로 갱신됨.
- git diff --check 성공. tracked 14개 수정 + 신규 3개. stage/commit/push/배포 없음.
- 화면/측정 증빙은 Git 제외 .tmp/second-expansion-layout.json, second-clothing-guide-390.png, second-bathroom-guide-390.png, second-scissors-390.png.

## 변경 파일

데이터: docs/prebuild/burimttukttak-seed-v1.1.json, docs/prebuild/12-source-registry-v1.json, data/changelog.json, data/guides.json, data/content-expansion-2026-10-03.json.

테스트: tests/content-expansion.test.mjs, index-quality.test.mjs, indexable-content.test.mjs, monetization.test.mjs, search.test.mjs, seo.test.mjs, site.test.mjs, source-presentation.test.mjs, today-visitors.test.mjs, validation.test.mjs, second-content-expansion.test.mjs.

보고서: docs/CONTENT-EXPANSION-2026-10-03.md. 기존 생성기가 데이터로 홈·가이드·검색·canonical·sitemap을 반영하므로 생성 로직 수정 없음.

## 남은 확인사항

사용자 로컬 결과 검토와 별도 배포 승인 전에는 운영 페이지 수가 바뀌지 않는다. 승인 후 새로운 상세 16개와 가이드 2개의 실제 Production 응답·canonical·모바일·광고 실패/성공을 확인해야 한다. 보류 후보의 추가 원문과 제품 조건을 확보하기 전에는 상세나 확정 답변을 만들지 않는다.
