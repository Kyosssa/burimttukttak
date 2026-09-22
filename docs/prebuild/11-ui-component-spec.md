# 버림뚝딱 UI / 컴포넌트 설계 v1

## 1. 핵심 원칙

- 모바일 우선
- 홈 첫 화면의 주인공은 검색창
- 품목 상세 첫 화면의 주인공은 정답 카드
- 광고는 정답 뒤
- 녹색 = 브랜드 포인트이지만 색상만으로 상태를 전달하지 않음
- 장식보다 읽기 쉬움 우선
- 사용자에게 회원가입이나 위치권한을 요구하지 않음

---

## 2. 기본 레이아웃

최대 콘텐츠 폭:
- 상세/가이드: 760px
- 홈/카테고리: 1040px

모바일:
- 좌우 padding 16px
- 버튼/입력 최소 높이 44px
- 검색창 52~56px 권장

데스크톱:
- 검색 영역은 지나치게 넓히지 말고 680px 안팎

---

## 3. 홈 화면 순서

1. Header
2. Hero
3. MainSearch
4. PopularItems
5. CategoryGrid
6. TrustSection
7. AdSlot (필요 시)
8. Footer

Hero 문구:
- H1: `이거, 어떻게 버리지?`
- Sub: `버릴 물건을 검색하면 배출방법을 바로 알려드려요.`

검색 placeholder:
`예: 후라이팬, 건전지, 냉장고`

---

## 4. 검색 상태

### idle
검색창만 표시

### typing
최대 6개 자동완성
각 항목:
- 품목명
- 배출분류 badge
- category

### exact alias match
예:
`프라이팬` 검색 → `후라이팬` 결과

UI에서 작은 보조문구:
`'후라이팬'으로 안내할게요.`

### unverified match
Seed에 있으나 미검증:
`이 품목은 현재 배출방법을 확인 중이에요.`

배출방법을 생성하지 않는다.

### no result
`아직 등록되지 않은 품목이에요.`
`검색어는 품목 추가 우선순위를 정하는 데 익명 통계로 활용될 수 있어요.`

관련 결과가 있으면 최대 3개.

---

## 5. 품목 상세 페이지

순서:

Breadcrumb
H1
Alias helper (필요 시)
AnswerCard
RegionalNotice
AdSlotTop
StepsCard
WarningsCard (있는 경우)
CollectionCTA (있는 경우)
RelatedItems
AffiliateBlock (shopping_keywords 있을 때)
AdSlotBottom
SourcesCard
UpdatedInfo
FeedbackLink
Footer

---

## 6. AnswerCard

예:

`♻️ 고철류로 배출`

`금속이 주재질인 후라이팬은 이물질을 제거하고 고철류로 분리배출하는 것이 기본입니다.`

필수:
- 아이콘
- disposal_label
- summary

광고를 카드 내부에 넣지 않는다.

---

## 7. 지역 차이 안내

`regional_variation == true`일 때:

`📍 지역에 따라 달라질 수 있어요`
`수거일, 배출장소, 대형폐기물 처리방식은 지자체 또는 공동주택 기준이 다를 수 있습니다.`

버튼:
`지역별 기능은 준비 중이에요` 또는 v2 이후 실제 링크.

v1에서 가짜 위치 버튼을 만들지 않는다.

---

## 8. 폐가전 CTA

`collection_service.type == free_home_pickup`

CTA 카드:

`🔌 폐가전 무상방문수거`

eligible = true:
- `무료 방문수거 대상`
- 조건 설명
- `[공식 사이트에서 신청하기]`

eligible = conditional:
- `조건에 따라 무료수거 가능`
- `제품 크기 또는 수량 조건을 확인하세요.`

외부 공식 링크임을 표시.

---

## 9. SourceCard

`공식 출처`

각 source:
- 기관명
- 자료명
- `공식 자료 보기`
- 확인일

페이지 하단:
`정보 확인: YYYY.MM.DD`

출처 URL을 그대로 긴 텍스트로 노출하지 않아도 됨.

---

## 10. AffiliateBlock

`shopping_keywords`가 비어 있으면 렌더링하지 않는다.

구조:

`관련 생활용품`
`[경제적 이해관계 고지]`
[쿠팡 배너 또는 링크]

정답 카드와 visually 분리.
공식 수거서비스 CTA와 제휴광고 CTA를 혼동시키지 않는다.

---

## 11. FeedbackLink

페이지 하단:
`정보가 달라졌나요? 수정 제보하기`

v1:
- 운영 이메일 mailto 또는 간단한 외부 문의 경로

사용자에게 개인정보 입력을 강제하지 않는다.

향후:
- 별도 feedback API 가능

---

## 12. 상태 Badge 제안

- `♻️ 재활용`
- `🗑️ 일반배출`
- `🔌 폐가전`
- `🔋 전지`
- `💡 조명`
- `⚠️ 주의 필요`

화면읽기 도구를 위해 텍스트 label 포함.

---

## 13. 광고 슬롯

`AdSlotTop`
- AnswerCard 다음
- 고정 min-height 예약

`AdSlotBottom`
- 관련품목/제휴블록 다음

모바일에서 광고가 화면 전체를 과도하게 밀어내지 않는지 확인.

---

## 14. Footer

필수 링크:
- 버림뚝딱 소개
- 정보 출처 및 검증 정책
- 개인정보처리방침
- 제휴 마케팅 안내
- 문의

표시:
`© 버림뚝딱`

---

## 15. 오류/빈 상태

404:
`찾으시는 페이지가 없어요.`
[물건 검색하기]

500/API error:
사이트 검색 자체는 정적으로 계속 작동해야 함.
missing-search API 실패는 사용자 검색을 막으면 안 됨.

외부 공식 링크 오류:
페이지 본문은 유지하고 링크 오류만 graceful 처리.

---

## 16. 접근성

- input에는 visible label 또는 aria-label
- 자동완성은 키보드 ↑↓ Enter Esc 사용 가능
- focus outline 제거 금지
- icon-only 버튼에는 accessible name
- 모든 텍스트 대비 확인
- heading 순서 H1 → H2 유지
- 링크 텍스트를 `여기` 대신 목적지 설명으로 작성
