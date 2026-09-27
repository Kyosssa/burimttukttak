# 색인 상세 89개 콘텐츠·근거 점검 (2026-09-28)

작업 기준은 `main`의 AdSense 보강 배포 `452063a`다. 이 보고는 현재 색인 대상 89개만 다룬다. verified 100개와 needs_research 20개, 가구 hold 11개, sitemap 100 URL은 유지한다. 공식 자료의 공통 규칙이 같은 품목에 적용될 때에는 문장을 억지로 차별화하지 않았다.

## 전수 점검 방법과 결과

Seed 89개와 생성된 각 상세 HTML의 title·description·H1, 첫 답변, 배출 단계, 주의사항, 공식 원문 링크·기관·확인일, 관련 품목 링크, canonical·index 상태를 확인했다. `tests/indexable-content.test.mjs`가 89개 전부에 같은 검사를 반복한다. 요약·단계·주의사항·공식 출처가 빠진 페이지 0개, 존재하지 않는 관련 링크 0개, 색인 대상의 완전 동일 배출 본문 0개다. 공식 출처 레지스트리와 Seed의 매핑은 기존 검증기가 확인한다. 이 자동 검사는 출처 문장과 답변의 의미상 일치까지 증명하지 않으므로 아래 원문 범위도 사람이 대조했다.

| 분류 | 수 | 점검한 slug |
| --- | ---: | --- |
| 주방·조리도구 | 7 | `frying-pan`, `pot`, `cutting-board`, `plate`, `ceramic-mug`, `food-container`, `rubber-gloves` |
| 포장재·재활용 | 14 | `styrofoam`, `plastic-film`, `cardboard-box`, `paper-cup`, `plastic-cup`, `clear-pet-bottle`, `colored-pet-bottle`, `plastic-container`, `takeout-container`, `disposable-lunchbox`, `milk-carton`, `aseptic-carton`, `glass-bottle`, `metal-can` |
| 음식물·식재료 | 13 | `eggshell`, `chicken-bone`, `pork-bone`, `fish-bone`, `shellfish-shell`, `crab-shell`, `banana-peel`, `onion-skin`, `garlic-skin`, `corn-husk`, `corn-cob`, `peach-pit`, `watermelon-rind` |
| 대형·생활가전 | 20 | `refrigerator`, `kimchi-refrigerator`, `washing-machine`, `dryer`, `air-conditioner`, `television`, `microwave`, `electric-oven`, `dishwasher`, `air-purifier`, `dehumidifier`, `water-purifier`, `water-dispenser`, `treadmill`, `copier`, `electric-fan`, `humidifier`, `rice-cooker`, `vacuum-cleaner`, `air-fryer` |
| 소형전자·배터리 | 15 | `laptop`, `desktop-computer`, `computer-monitor`, `printer`, `mobile-phone`, `tablet`, `wifi-router`, `game-console`, `hair-dryer`, `electric-iron`, `coffee-maker`, `blender`, `electric-kettle`, `battery`, `power-bank` |
| 가구·대형폐기물 | 4 | `mattress`, `carpet`, `drying-rack`, `stroller` |
| 생활·의류·욕실 | 10 | `umbrella`, `clothes`, `blanket`, `pillow`, `clothes-hanger`, `toothbrush`, `toothpaste-tube`, `flower-pot`, `toy`, `ice-pack` |
| 특수·주의품목 | 6 | `broken-glass`, `fluorescent-lamp`, `led-bulb`, `butane-can`, `aerosol-can`, `unused-medicine` |

## 공식 원문과 실제 보강

- [기후에너지환경부 분리수거 지침](https://www.xn--oy2b29bd3a601b.kr/front/bbsList.do?bbsId=BBS_0003)은 재질별 분리배출, 전기·전자제품의 대형·소형 규칙과 예시, 조명·전지류 및 지역별 운영 차이를 제시한다. 재질·품목군 규칙을 적용하는 17개 페이지에는 답변 아래에 **근거 범위**를 표시했다. 이는 해당 품목의 모든 재질·구조에 같은 답을 단정하지 않기 위한 설명이며 새 배출 규칙이 아니다.
- [E-순환거버넌스 수거품목·기준](https://www.15990903.or.kr/portal/cnts/userGuide.do)은 31인치 이상 디스플레이는 1개부터, 30인치 이하는 5개 이상 다량 접수로 구분한다. `computer-monitor`의 잘못된 일괄 “소형” 답변을 크기별 조건으로 바꾸고 `television`의 조건부 수거를 반영했다. 같은 원문의 잉크·토너 탈착·밀봉 조건을 `printer`와 `copier`의 주의사항에 명시했다. 이 4개 품목의 **E-순환거버넌스 원문 확인일**과 정보 확인일을 2026-09-28로 기록했다. 기존 전국 지침의 출처 확인일은 이번 검토로 새로 확인했다고 간주하지 않고 유지했다.
- 공식 지침의 대형가전 예시에는 **냉장고**와 **전기정수기**가 있으나 `kimchi-refrigerator`·`water-dispenser` 이름은 직접 열거되지 않는다. 세 페이지의 “공식 지침에 예시된” 표현을 각각 냉장고류 접수 확인, 전기정수기 한정, 제품 규격별 확인으로 좁혔다. 실제 수거 가능 여부를 임의로 단정하지 않았다.
- [서초구 음식물류 폐기물 안내](https://www.seocho.go.kr/site/seocho/04/10413030600002020072410.jsp), [파주시 음식물류 폐기물 안내](https://www.paju.go.kr/www/www_02/environment/environment_05/environment_05_01/environment_05_01_06.jsp), [파주시 대형폐기물 표](https://www.paju.go.kr/www/www_02/environment/environment_05/environment_05_01/environment_05_01_04.jsp)의 지역 한정 범위를 재확인했다. 지역별 수거일·비용을 전국 기준으로 확장하지 않았다.
- [공식 배출장소 지도](https://xn--oy2b29bd3a601b.kr/front/region/location.do)는 폐의약품·아이스팩 관련 수거 위치 유형을 안내한다. `unused-medicine`과 `ice-pack`은 현재처럼 **장소 확인**만 안내하고, 지도에 없는 지역의 배출방법은 만들지 않았다.
- `kimchi-refrigerator`, `microwave`, `dishwasher` 등 21개 색인 페이지 첫 답변의 잘못된 `은/는` 조사를 고쳤다. 이 편집만으로 출처나 배출 사실은 달라지지 않는다. 총 22개 품목의 문구 변경을 `data/changelog.json`에 기록했다.

## 근거가 부족해 추가하지 않은 내용

공식 원문이 공통 규칙만 제시하는 품목에 제품별 수수료·분해·재질 판별·수거 가능성을 추가하지 않았다. 특히 다음은 별도 원문을 확보하기 전까지 현재의 조건부·품목군 안내 이상으로 구체화하지 않는다.

- **품목별 직접 근거가 아닌 재질·품목군 규칙을 적용한 17개:** `frying-pan`, `pot`, `plate`, `ceramic-mug`, `food-container`, `rubber-gloves`, `plastic-cup`, `colored-pet-bottle`, `disposable-lunchbox`, `blanket`, `pillow`, `clothes-hanger`, `toothbrush`, `toothpaste-tube`, `toy`, `broken-glass`, `aerosol-can`. 일부 품목명이 예시·제외 목록에 등장하더라도 답변은 해당 재질·제품군과 지역 조례 범위로 한정한다.
- **공식 공통 소형가전 절차가 반복되는 품목:** `vacuum-cleaner`, `air-fryer`, `wifi-router`, `game-console`, `hair-dryer`, `electric-iron`, `coffee-maker`, `blender`, `electric-kettle` 등. 확인한 원문에 품목별 별도 절차가 없어 공통 단계 자체를 유지했다. 품목명만 바꾼 설명이나 근거 없는 구매·해체·전지 제거 의무를 새로 넣지 않았다.
- **추가 직접 확인이 필요한 제품별 차이:** `electric-fan`, `laptop`, `mobile-phone`, `water-dispenser`, `kimchi-refrigerator` 등의 개별 수거 조건과 `power-bank`의 팽창 상태별 구체적 처리 절차. 현행 페이지의 조건부·지역 확인 안내를 넘는 내용은 이번에 추가하지 않았다.
- **가구 hold 11개:** 공식 원문에서 품목별 고유 배출 판단을 이 변경 범위에서 정리하지 않았으므로 모두 기존 200/noindex/sitemap 제외 상태를 유지했다.

## 회귀 범위

검색 fixture 34개, needs_research 상세 비생성, 내부 링크·sitemap 100 URL·canonical·실제 404, generic 쿠팡 배너 부재, AdSense loader 1회와 `ads.txt`, missing-search·TODAY D1 회귀는 기존 preflight에서 확인한다. D1 실데이터 조회·수정, 새 외부 API, 광고·브랜드·DNS 변경, AdSense 재검토 신청은 하지 않았다.
