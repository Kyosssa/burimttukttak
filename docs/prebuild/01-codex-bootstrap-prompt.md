# Work / Codex 첫 실행 프롬프트 — 버림뚝딱 v1.1

프로젝트명: 버림뚝딱

목표:
사용자가 "이거 어떻게 버리지?"라고 검색하면 10초 안에 공식 근거가 있는 배출방법을 확인할 수 있는
한국어 생활폐기물 검색 사이트 v1을 구현한다.

## 반드시 먼저 읽을 파일

1. `00-README-FIRST.md`
2. `burimttukttak-work-codex-v1-brief.md`
3. `burimttukttak-seed-v1.1.json`
4. `02-item.schema.json`
5. `04-seo-indexing-spec.md`
6. `11-ui-component-spec.md`
7. `12-source-registry-v1.json`
8. `13-content-lifecycle-spec.md`
9. `14-search-quality-fixtures.json`
10. `15-_headers-template.txt`
11. `16-url-redirect-http-status-spec.md`
12. `20-feature-backlog.md`

나머지 파일도 구현 단계에서 참고한다.

## 절대 원칙

- Cloudflare Pages 무료 플랜에 맞춘 정적 사이트
- 일반 페이지 조회는 Worker 없이 정적 asset
- `verification_status == "verified"`만 배출방법 상세 페이지 생성
- `needs_research`의 배출방법을 AI가 추정하거나 생성하지 않음
- 검색은 브라우저에서 실행
- Worker + D1은 미등록 검색어 집계에만 사용
- 외부 API가 죽어도 공개 사이트는 계속 동작해야 함
- 공식 API/service key는 프런트엔드 bundle에 절대 포함하지 않음
- 광고보다 정답을 먼저 표시
- 사용자에게 위치 권한/회원가입 요구하지 않음
- production 배포, DNS 변경, GitHub push는 하지 말고 로컬/Preview 결과까지만 준비

## 구현 순서

### Phase 0 — 검증기부터
페이지를 만들기 전에:
- Seed JSON 로드
- JSON Schema validation
- id/name/slug 중복검사
- related slug 검사
- verified 필수필드 검사
- 14-search-quality-fixtures 기준 검색 테스트 구조 생성

검증 실패 시 build 실패.

### Phase 1 — 정적 사이트
- 홈
- verified 30개 품목 페이지
- 8개 카테고리
- about
- source policy
- privacy
- affiliate disclosure
- custom 404
- sitemap
- robots
- `_headers`

### Phase 2 — 검색 UX
검색 순서:
1. canonical name exact
2. alias exact
3. prefix
4. substring
5. fuzzy

상태:
- verified → 상세 이동
- needs_research → "확인 중" 표시, missing API 호출 금지
- 실제 missing → 안내 + missing-search API

키보드:
- ArrowUp/ArrowDown
- Enter
- Escape

### Phase 3 — Cloudflare 동적 최소기능
- `/api/missing-search`
- D1 schema는 `03-d1-schema.sql`
- 계약은 `09-missing-search-api-contract.md`
- parameterized query
- query 길이/제어문자 방어
- 실패해도 검색 UX는 정상 동작

### Phase 4 — SEO/보안/운영
- canonical
- WebSite / Organization
- WebPage / BreadcrumbList
- SearchAction 금지
- search noindex
- pages.dev noindex header
- 실제 404 status
- 보안 header
- Preview에서 전체 링크 검사
- source registry 기반 source health script 골격
- 검색 fixture 모두 통과

## 광고

광고 SDK가 아직 없으면 실제 광고 코드를 임의로 만들지 말고 placeholder component만 만든다.

`AdSlotTop`
- AnswerCard 다음

`AffiliateBlock`
- shopping_keywords가 있을 때만
- 경제적 이해관계 고지 영역 포함

`AdSlotBottom`
- 관련품목/제휴영역 이후

CLS 방지를 위해 예약 공간을 둔다.

## 분석

v1 기본:
Cloudflare Web Analytics

자유입력 검색어를 외부 analytics event parameter로 보내지 않는다.

D1에는 missing query 빈도만 저장.
IP/User-Agent/fingerprint를 앱 데이터로 저장하지 않는다.

## 공식자료

자동화는 source가 바뀌었는지 탐지할 수 있지만,
절대로 자동으로 배출방법 본문을 변경하지 않는다.

source 변경:
→ diff/report
→ 사람 검토
→ seed 수정
→ validation
→ build

## UI 핵심

홈:
`이거, 어떻게 버리지?`
큰 검색창

품목:
Breadcrumb
H1
AnswerCard
RegionalNotice
AdSlotTop
Steps
Warnings
Collection CTA
Related Items
Affiliate
AdSlotBottom
Sources
정보 확인일
수정 제보

모바일 360px에서 먼저 검증.

## 완료 기준

반드시 `07-launch-acceptance-checklist.md`를 체크한다.

최소:
- verified 정확히 30개 page 생성
- needs_research page 미생성 또는 준비중 UX
- search fixture 34개 통과
- sitemap에는 verified canonical만
- search URL sitemap 제외
- pages.dev noindex
- 잘못된 URL 실제 404
- 관련링크 404 없음
- source 링크 존재
- build 성공
- preview에서 모바일/데스크톱 확인

## 작업 완료 시 보고 형식

1. 구현한 기능
2. 생성/변경 파일
3. 테스트 결과
4. 실패/보류 항목
5. Cloudflare/GitHub에서 사용자가 직접 해야 할 설정
6. production 배포 전에 확인할 사항

커밋, push, production deploy는 하지 않는다.
