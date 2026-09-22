# 버림뚝딱 — Phase 3

Seed 검증, 정적 안내 사이트, SEO/색인 정책과 미등록 검색어 집계 API를 구현한 로컬 프로젝트입니다. Node.js 22 이상이 필요합니다.

```sh
npm ci --ignore-scripts
npm run validate:data
npm run test:search
npm run build
npm run preview
```

`build`는 데이터 검증 후 `dist/` 정적 사이트를 생성하고 전체 테스트를 실행합니다. 오류가 있으면 nonzero로 종료합니다.
`preview`는 생성된 사이트를 `http://127.0.0.1:4173`에서 제공하며 없는 URL에는 실제 HTTP 404를 반환합니다. 포트가 필요하면 `npm run preview -- 4187`처럼 지정할 수 있습니다.

- 원본 기준 문서와 Seed: `docs/prebuild/` (첨부 v1.3 ZIP의 26개 파일 그대로)
- 별도 인수인계: `docs/WORK-HANDOFF.md`
- 구현·검증 규칙·결과·보류 사항: `docs/PHASE-0-REPORT.md`
- 데이터 검증 CLI: `scripts/validate-data.mjs`
- Schema 및 교차 검증: `scripts/lib/validate.mjs`
- 정적 페이지 생성: `scripts/build-site.mjs`
- 로컬 Preview: `scripts/preview.mjs`
- 순수 검색 함수: `src/search.mjs`
- 홈 검색 UI: `src/app.mjs`
- 미등록 검색 전송 제어: `src/missing-search.mjs`
- Pages Function API: `functions/api/missing-search.js`
- 로컬 D1 migration: `migrations/0001_missing_searches.sql`
- Pages/D1 설정: `wrangler.jsonc`
- SEO·sitemap·headers·redirect 생성: `scripts/build-site.mjs`
- 색인 정책 회귀 테스트: `tests/seo.test.mjs`
- 회귀/실패 검증: `tests/`

Seed를 중복 복사하지 않고 Pack 안의 원본을 직접 읽습니다. 검증기는 입력을 변경하지 않습니다.
별도 데이터 검증은 `node scripts/validate-data.mjs <seed.json>`으로 실행할 수 있습니다.
`npm run build -- <seed.json>`도 가능하며, 지정 데이터의 검증 후 원본 Pack 기반 회귀 테스트를 실행합니다.

Phase 3 API는 실제 missing 상태인 검색어만 정규화해 D1의 단일 집계 행에 기록합니다. 알려진 품목·별칭·검색 fixture는 서버에서도 거부하며 IP, User-Agent, 위치, 이름, 이메일, 쿠키, fingerprint는 저장하지 않습니다. 로컬/Cloudflare 설정 절차는 `docs/PHASE-3-LOCAL-D1.md`에 정리했습니다.

광고·제휴 링크·외부 분석은 포함하지 않습니다. `wrangler.jsonc`의 D1 ID는 의도적으로 placeholder이며, 운영 D1 생성·migration 적용·배포는 아직 수행하지 않았습니다.
