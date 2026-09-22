# 버림뚝딱 Pre-build Pack v1

작성일: 2026-09-22

이 폴더는 ChatGPT Work + Codex에서 버림뚝딱 v1을 바로 구현하기 전에
아키텍처, SEO, 데이터 검증, Cloudflare D1, 정책 페이지, 배포 검수를 고정하기 위한 사전 설계 묶음이다.

## 권장 작업 순서

1. `01-codex-bootstrap-prompt.md`를 Work/Codex에 제공한다.
2. `burimttukttak-seed-v1.1.json`을 프로젝트 데이터 원본으로 넣는다.
3. `02-item.schema.json`에 맞춰 데이터 검증기를 만든다.
4. `03-d1-schema.sql`로 검색 실패 집계용 D1을 만든다.
5. `04-seo-indexing-spec.md` 규칙대로 정적 페이지와 sitemap/robots를 생성한다.
6. `05-policy-pages-draft.md`를 실제 운영자 정보와 광고 설정에 맞게 수정한다.
7. `06-analytics-events.md` 기준으로 과도한 개인정보 수집 없이 성과를 측정한다.
8. `07-launch-acceptance-checklist.md`를 모두 통과한 뒤 production 배포한다.
9. `08-launch-30-pages.md`의 30개 verified 페이지가 실제로 생성되는지 확인한다.

## 절대 원칙

- `verification_status == "verified"` 품목만 공개 배출방법 페이지 생성
- AI가 배출방법을 추정해서 채우지 않음
- 검색결과 페이지 noindex
- 별칭/오타마다 별도 SEO 페이지를 만들지 않음
- 지역명만 바꾼 복제 페이지를 만들지 않음
- 광고보다 답을 먼저 표시
- 서비스키/API 키를 브라우저 코드에 포함하지 않음
- production 배포 및 DNS 변경은 사용자 확인 후 수행

## 권장 v1 스택

- GitHub
- Cloudflare Pages
- Cloudflare Web Analytics
- Cloudflare Worker + D1 (미등록 검색어 집계만)
- Google AdSense
- Coupang Partners

## 추가 고정 사양
- `10-categories-v1.json`: 카테고리명/slug/설명 고정
- `11-ui-component-spec.md`: 홈·검색·품목페이지·광고·상태 UI 규칙 고정

## 운영 안정성 보강 파일
- `12-source-registry-v1.json`: 공식 출처 등급과 재확인 주기
- `13-content-lifecycle-spec.md`: verified 정보 노후화/변경감지 정책
- `14-search-quality-fixtures.json`: 검색 alias/오타/준비중/missing 회귀 테스트
- `15-_headers-template.txt`: Pages preview 미색인 + 기본 보안헤더
- `16-url-redirect-http-status-spec.md`: 301/404/soft-404 규칙
- `17-github-actions-quality-checks.md`: 주간/월간 무료 자동검사 설계
- `18-data-versioning-spec.md`: 배출정보 변경이력
- `19-correction-feedback-spec.md`: 정보 수정 제보 흐름
- `20-feature-backlog.md`: v1/v1.1/v2 기능 우선순위
