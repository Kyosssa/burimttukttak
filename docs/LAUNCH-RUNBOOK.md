# 버림뚝딱 출시 안내

이 문서는 GitHub와 Cloudflare 설정을 처음 하는 운영자가 순서대로 따라갈 수 있도록 작성했습니다. 현재 저장소에서는 아래 작업을 실행하지 않았습니다.

## 1. 로컬 최종 확인

1. Node.js 22 이상을 설치합니다.
2. 프로젝트 폴더에서 `npm ci --ignore-scripts`를 실행합니다.
3. `npm run preflight`를 실행합니다.
4. 마지막 줄의 `Preflight passed`와 source health 보고서를 확인합니다.
5. `review_due` 또는 `unmapped`가 있으면 [Seed 변경 절차](./DATA-MAINTENANCE.md)에 따라 사람 검토를 먼저 마칩니다.

## 2. GitHub 저장소 준비

1. GitHub에서 빈 저장소를 만듭니다. README나 `.gitignore` 자동 생성을 선택하지 않습니다.
2. 현재 로컬 저장소에 GitHub remote를 추가합니다.
3. 기본 브랜치를 `main`으로 정리한 뒤 최초 push를 수행합니다.
4. GitHub의 Actions 탭에서 `Quality checks`가 성공하는지 확인합니다.
5. 저장소 보호 규칙을 사용할 경우 `Quality checks / quality` 성공을 merge 조건으로 설정합니다.

workflow는 push, pull request, 수동 실행, 매주 수요일 04:17 및 매월 8일 04:37(Asia/Seoul)에 preflight만 수행합니다. 배포, commit, issue 생성, 외부 API 호출은 하지 않습니다.

## 3. Cloudflare Pages 연결

Pages Functions가 있으므로 GitHub Git integration 방식으로 새 Pages 프로젝트를 만듭니다. Cloudflare 문서상 Git integration은 branch push와 PR Preview를 지원합니다.

설정값:

- Production branch: `main`
- Framework preset: 없음
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: 저장소 루트
- Node version: 22

첫 배포 전에 Preview에서만 결과를 확인합니다. `*.pages.dev` 응답에 `X-Robots-Tag: noindex, nofollow`가 있고 운영 도메인 규칙에는 이 헤더가 없는지 확인합니다.

## 4. Preview와 Production D1 분리

1. Cloudflare D1에서 Preview용 `burimttukttak-missing-search-preview`와 Production용 `burimttukttak-missing-search-production`을 각각 만듭니다.
2. Pages 프로젝트 Settings의 Bindings에서 두 환경 모두 변수 이름을 정확히 `DB`로 지정합니다.
3. Preview 환경에는 Preview DB, Production 환경에는 Production DB를 연결합니다.
4. 실제 database ID를 확인해 `wrangler.jsonc`의 placeholder를 교체합니다. 환경별 값은 Cloudflare Dashboard binding을 최종 기준으로 확인합니다.
5. [migration](../migrations/0001_missing_searches.sql)을 먼저 Preview DB에 적용합니다.
6. Preview API 검증 후에만 같은 migration을 Production DB에 적용합니다.

예시 명령은 다음과 같습니다. 데이터베이스 이름을 다시 확인한 뒤 운영자가 직접 실행합니다.

```sh
npx wrangler d1 migrations apply burimttukttak-missing-search-preview --remote
npx wrangler d1 migrations apply burimttukttak-missing-search-production --remote
```

D1은 `/api/missing-search`의 집계에만 사용합니다. 홈, 상세, 카테고리, 정책 페이지는 `dist/`의 정적 asset으로 제공됩니다.

## 5. Preview 검증

[수동 출시 체크리스트](./MANUAL-LAUNCH-CHECKLIST.md)를 Preview URL에서 완료합니다. 특히 다음을 확인합니다.

- verified와 alias 검색은 D1을 호출하지 않음
- needs_research는 `확인 중`만 표시하고 D1을 호출하지 않음
- 실제 missing만 Preview DB count를 증가시킴
- API 오류를 만들어도 검색 UI가 유지됨
- 없는 item slug는 실제 HTTP 404
- 광고·제휴·Analytics 외부 요청 없음

## 6. Custom domain과 Production 검증

1. Pages 프로젝트의 Custom domains에서 `burimttukttak.com`을 추가합니다.
2. apex domain은 Cloudflare zone과 nameserver 설정이 필요합니다. Cloudflare 화면에서 인증서와 도메인이 Active가 될 때까지 기다립니다.
3. `www` 사용 여부를 결정하고 현재 `_redirects` 규칙대로 apex 하나로 통일합니다.
4. Production 배포 전 사용자 검토를 완료합니다.
5. 배포 후 운영 도메인에서 수동 체크리스트를 다시 수행합니다.
6. Production 응답에 Preview용 `X-Robots-Tag: noindex, nofollow`가 적용되지 않았는지 확인합니다.
7. 마지막으로 Search Console과 네이버 서치어드바이저에 운영 도메인을 등록하고 `https://burimttukttak.com/sitemap.xml`을 제출합니다.

참고 문서:

- [Cloudflare Pages Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/)
- [Cloudflare Pages custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [Cloudflare D1 시작하기](https://developers.cloudflare.com/d1/get-started/)
- [Cloudflare D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/)
- [GitHub Actions workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax)
