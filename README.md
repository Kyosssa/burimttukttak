# 버림뚝딱 — Phase 0

Seed 검증과 검색 회귀 테스트를 구현한 로컬 프로젝트입니다. Node.js 22 이상이 필요합니다.

```sh
npm ci --ignore-scripts
npm run validate:data
npm run test:search
npm run build
```

`build`는 데이터 검증 후 전체 테스트를 실행합니다. 오류가 있으면 nonzero로 종료합니다.
현재는 Phase 0이므로 HTML, public, dist 등 공개 산출물을 만들지 않습니다.
향후 사이트 빌더도 이 검증 단계 뒤에 연결해야 합니다.

- 원본 기준 문서와 Seed: `docs/prebuild/` (첨부 v1.3 ZIP의 26개 파일 그대로)
- 별도 인수인계: `docs/WORK-HANDOFF.md`
- 구현·검증 규칙·결과·보류 사항: `docs/PHASE-0-REPORT.md`
- 데이터 검증 CLI: `scripts/validate-data.mjs`
- Schema 및 교차 검증: `scripts/lib/validate.mjs`
- 순수 검색 함수: `src/search.mjs`
- 회귀/실패 검증: `tests/`

Seed를 중복 복사하지 않고 Pack 안의 원본을 직접 읽습니다. 검증기는 입력을 변경하지 않습니다.
별도 데이터 검증은 `node scripts/validate-data.mjs <seed.json>`으로 실행할 수 있습니다.
`npm run build -- <seed.json>`도 가능하며, 지정 데이터의 검증 후 원본 Pack 기반 회귀 테스트를 실행합니다.

문서에 적힌 전체 구현 지시는 향후 설계 참고이며, 이번 범위는 사용자가 지정한 Phase 0입니다.
Phase 구분은 인수인계와 `21-implementation-phases.md`를 따릅니다.
commit, push, 배포, DNS 변경은 수행하지 않았습니다.
