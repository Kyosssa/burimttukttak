# 버림뚝딱 — Work 인수인계 컨텍스트

작성일: 2026-09-22

## 1. 프로젝트 배경

사용자는 Google/Naver 검색 트래픽으로 유입을 만들고
Google AdSense + Coupang Partners로 수익화하는 자동화형 사이트들을 운영/개발하고 있다.

기존 프로젝트:
- 포토뚝딱: 사진 관련 문제를 회원가입 없이 해결하는 도구형 사이트
- 핫딜뚝딱: 여러 커뮤니티 핫딜을 모아 보여주는 수집형 사이트

세 번째 프로젝트로 `버림뚝딱`을 선택했다.

서비스 한 문장:
> "이거 어떻게 버리지?"라고 검색하면 공식 근거가 있는 배출방법을 빠르게 알려주는 사이트.

핵심 전략:
- 검색 의도가 명확한 롱테일 SEO
- 실제 사용자 문제 해결을 먼저 제공
- 광고는 답 뒤에 배치
- 공식기관 데이터에 근거
- Cloudflare 무료 인프라 중심
- 회원가입/AI 채팅/SSR 없음

---

## 2. 기술 환경 / 제약

사용자가 현재 사용하는 도구:
- ChatGPT Work
- Codex
- GitHub
- Cloudflare Free
- 유료 도메인

v1 원칙:
- GitHub → Cloudflare Pages
- 정적 HTML 중심
- 일반 페이지 조회는 Worker 사용하지 않음
- 품목 DB는 JSON
- 검색은 브라우저에서 처리
- 미등록 검색어 집계만 Cloudflare Worker + D1
- 별도 VPS / Supabase / Firebase / MySQL 불필요
- 외부 공식 API는 런타임 필수가 아니라 빌드/갱신 보조수단
- 외부 API 장애가 사이트 장애로 이어지면 안 됨

---

## 3. 현재 데이터 상태

Seed DB:
`burimttukttak-seed-v1.1.json`

총 120개 품목:
- verified: 30
- needs_research: 90

절대 규칙:
`verification_status == "verified"`인 품목만 실제 배출방법 상세 페이지를 공개한다.

needs_research 품목:
- 검색에는 "현재 확인 중"으로 표시 가능
- AI가 배출방법을 추정/생성하면 안 됨
- missing-search로 집계하면 안 됨

실제 DB에 없는 품목만 missing-search에 집계한다.

---

## 4. 공식 근거

주요 공식 출처:
1. 기후에너지환경부 재활용가능자원의 분리수거 등에 관한 지침
2. `분리의 정석` 생활폐기물 공식 포털
3. E-순환거버넌스 폐가전 무상방문수거
4. 기후에너지환경부 분리배출 정보조회 OpenAPI / 공공데이터포털

사이트 차별화는 공식 데이터를 복제하는 것이 아니라:
- 빠른 검색
- 별칭/오타 처리
- 한눈에 보는 정답 카드
- 검색엔진 최적화된 개별 품목 페이지
- 폐가전 공식 신청 CTA
- 관련 품목
- 검색 실패 기반 자동 성장
- 광고/제휴의 자연스러운 연결

---

## 5. v1 URL / SEO

홈:
`/`

품목:
`/item/{slug}/`

카테고리:
- `/category/kitchen/`
- `/category/packaging-recycling/`
- `/category/food-waste/`
- `/category/home-appliances/`
- `/category/electronics-batteries/`
- `/category/furniture-bulky/`
- `/category/household/`
- `/category/special-waste/`

검색:
`/search/?q=...`
- `noindex,follow`
- sitemap 제외

별칭/오타별 별도 SEO 페이지 금지.
지역명만 바꾼 복제 페이지 금지.

구조화 데이터:
- 홈: WebSite + Organization
- 품목: WebPage + BreadcrumbList
- 카테고리: CollectionPage + BreadcrumbList
- SearchAction 사용하지 않음

---

## 6. 상세페이지 UX

순서:
1. Breadcrumb
2. H1: `{품목명} 버리는 법`
3. AnswerCard — 광고보다 먼저
4. 지역차이 안내
5. AdSense 상단 슬롯
6. 단계별 배출방법
7. 주의사항
8. 폐가전 공식 CTA (해당 품목)
9. 관련 품목
10. Coupang AffiliateBlock (shopping_keywords 있을 때만)
11. AdSense 하단 슬롯
12. 공식 출처
13. 정보 확인일
14. 정보 수정 제보

첫 화면에서 사용자가 답을 바로 볼 수 있어야 한다.

---

## 7. 검색 규칙

검색 우선순위:
1. name exact
2. alias exact
3. prefix
4. substring
5. fuzzy

대표 기대:
- 프라이팬 → 후라이팬
- 후라이펜 → 후라이팬
- 전자렌지 → 전자레인지
- 티비 → TV
- 폐건전지 → 건전지
- 에어후라이기 → 에어프라이어(현재 미검증이면 준비 중)

`14-search-quality-fixtures.json`에 34개 테스트 케이스가 있다.
검색 구현은 이 fixture를 통과해야 한다.

---

## 8. missing-search 성장 루프

실제 미등록 검색:
예) 골프공

흐름:
사용자 검색
→ 결과 없음
→ `/api/missing-search`
→ Worker
→ D1
→ normalized_query / count / first_seen / last_seen

수집하지 않을 것:
- 이름
- 이메일
- IP를 앱 DB에 영구 저장
- User-Agent 원문
- fingerprint
- 정확 위치

목적:
가장 많이 검색되는데 없는 품목을 다음 검증/추가 우선순위로 사용.

---

## 9. 운영 안정성

공식자료가 바뀌어도 자동으로 본문 수정 금지.

흐름:
공식 출처 변경 감지
→ diff/report
→ 사람 검토
→ Seed 수정
→ validation
→ build

관련 파일:
- `12-source-registry-v1.json`
- `13-content-lifecycle-spec.md`
- `17-github-actions-quality-checks.md`
- `18-data-versioning-spec.md`

Cloudflare `pages.dev` preview는 반드시 noindex.
`15-_headers-template.txt` 참고.

404는 실제 HTTP 404.
URL 변경은 HTTP 301.
soft 404 / JS redirect 금지.

---

## 10. 광고 / 분석 / 개인정보

초기 분석:
Cloudflare Web Analytics 우선.

GA4는 v1 필수 아님.

AdSense:
- AnswerCard 뒤에 첫 광고
- CLS 방지 예약 영역
- 실제 계정 코드가 없으면 placeholder만 생성

Coupang:
- shopping_keywords가 있는 품목에만
- 제휴 블록 인접 위치에서 경제적 이해관계를 명확히 고지
- 최신 파트너스 고지 문구는 실제 대시보드 기준으로 최종 적용

정책 초안:
`05-policy-pages-draft.md`

---

## 11. 지금 Work/Codex가 해야 할 일

가장 먼저:
`01-codex-bootstrap-prompt.md`를 실행 지시로 사용한다.

작업 순서:
Phase 0 — 데이터 validator / 검색 fixture
Phase 1 — 광고 없는 핵심 정적 사이트
Phase 2 — SEO / sitemap / robots / 404 / headers
Phase 3 — missing-search Worker + D1
Phase 4 — 광고/제휴 placeholder + 정책페이지
Phase 5 — 운영 자동검사

중요:
페이지 디자인부터 만들지 말고 Phase 0 검증부터 시작한다.

---

## 12. 완료 기준

`07-launch-acceptance-checklist.md`를 기준으로 self-review.

최소 조건:
- 120개 Seed 정상 파싱
- verified 30개 상세 페이지
- needs_research 배출법 생성 없음
- 검색 fixture 34개 통과
- 관련 slug 깨짐 없음
- sitemap에는 indexable canonical만
- search URL sitemap 제외
- preview noindex
- 실제 404
- 공식 출처/정보 확인일 표시
- 모바일 360px 정상
- build 성공

사용자 확인 전:
- Git commit/push 하지 않음
- production deploy 하지 않음
- DNS 변경하지 않음

---

## 13. 현재 준비된 패키지

최신 전체 파일:
`burimttukttak-prebuild-pack-v1.2.zip`

이 패키지 안의 파일들을 현재 설계의 source of truth로 간주한다.

특히 우선순위:
1. `00-README-FIRST.md`
2. `01-codex-bootstrap-prompt.md`
3. `burimttukttak-seed-v1.1.json`
4. `02-item.schema.json`
5. `04-seo-indexing-spec.md`
6. `07-launch-acceptance-checklist.md`
7. `11-ui-component-spec.md`
8. `14-search-quality-fixtures.json`
9. `21-implementation-phases.md`

설계가 충돌하면:
- 공식 근거
- 데이터 정확성
- 정적 구조
- 사용자에게 답을 먼저 제공
- 무료 운영
순으로 우선한다.
