# 버림뚝딱 구현 순서 — 실패 비용을 줄이는 방식

## Phase 0: 데이터가 코드보다 먼저
완료 조건:
- JSON Schema validator
- 120개 파싱
- 30 verified / 90 needs_research
- 검색 fixture 테스트 가능

여기서 실패하면 UI 작업 금지.

## Phase 1: 광고 없는 순수 서비스
완료 조건:
- 홈 검색
- 30 상세 페이지
- 카테고리
- 관련품목
- 공식출처
- 폐가전 CTA
- 모바일

이 단계에서 실제 사용자 가치가 완성되어야 한다.

## Phase 2: SEO
완료 조건:
- metadata
- canonical
- structured data
- sitemap
- robots
- 404
- redirects
- pages.dev noindex

SEO는 콘텐츠를 만든 뒤 붙인다.
SEO를 위해 콘텐츠를 변형하지 않는다.

## Phase 3: D1
완료 조건:
- missing-search API
- 실패가 사이트 검색에 영향 없음
- privacy 최소화

D1 없이도 사이트 전체가 작동해야 한다.

## Phase 4: 수익화 준비
완료 조건:
- AdSlot placeholder
- AffiliateBlock
- policy pages
- CLS 확인

실제 AdSense/Coupang 코드는 계정 값이 준비된 뒤 삽입.

## Phase 5: 운영자동화
완료 조건:
- source health checker
- monthly validation
- build dry-run

운영자동화는 데이터 자동수정이 아니라 '이상 감지'만 한다.

## 출시 판단

Phase 0~4 통과 시 v1 출시 가능.
Phase 5는 출시 직후 추가해도 됨.

가장 중요한 원칙:
'기능 개수'보다 '30개 페이지가 정확하고 빠르게 답하는지'를 우선한다.
