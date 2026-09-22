# 버림뚝딱 Analytics v1

## 기본 선택

v1에서는 Google Analytics를 필수로 넣지 않는다.
Cloudflare Web Analytics를 우선 사용한다.

목표:
- 페이지뷰
- 인기 품목
- 유입 페이지
- Core Web Vitals
- 국가/기기 수준의 집계 확인

## 앱 내부에서 꼭 필요한 별도 통계

D1:
- 검색 결과 없음 검색어
- 검색 횟수
- 최초/최근 검색 시각

저장하지 않을 것:
- IP
- 이메일
- 이름
- 로그인 ID
- User-Agent 원문
- fingerprint
- 정확 위치

## 클라이언트 이벤트가 필요할 경우

외부 분석도구를 늘리기 전에 아래만 내부적으로 고려:

- `search_submit`
  - query 자체는 외부 analytics로 보내지 않는 것을 기본
  - 결과 존재 여부만 boolean으로 전송 가능
- `item_open`
  - slug
- `related_item_click`
  - source_slug / target_slug
- `official_source_click`
  - item slug / source domain
- `ewaste_cta_click`
  - item slug
- `affiliate_block_view`
  - item slug
- `affiliate_click`
  - item slug / generic placement id

민감하거나 자유입력된 검색어를 광고/분석 사업자 이벤트 파라미터로 보내지 않는다.

## 성공지표

초기:
- 검색 성공률
- 미등록 검색 상위 50개
- verified 품목별 유입
- 평균 Core Web Vitals
- 검색 → 상세 페이지 이동률

수익화 이후:
- 상세 페이지당 광고 노출
- 제휴 블록 클릭률
- 품목 카테고리별 제휴 클릭률

수익 데이터와 검색 품질 데이터를 분리해서 본다.
