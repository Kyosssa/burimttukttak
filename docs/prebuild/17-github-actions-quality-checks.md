# GitHub Actions 운영 자동검사 설계 v1

목표: 무료 범위에서 '공식 출처가 깨졌는지'와 '사이트 빌드가 망가졌는지'만 자동 확인.
콘텐츠를 자동 변경하거나 production에 자동 배포하지 않는다.

## A. Weekly Source Health

권장:
- 매주 수요일 04:17 Asia/Seoul
- 정각/00분을 피해 실행
- source registry URL 확인
- timeout 15s
- redirect 최종 URL 기록
- HTTP 상태 확인
- expected_content 최소 1개 확인

성공:
아무 작업 없음

실패:
GitHub Actions run failure
(향후 필요하면 GitHub Issue 자동 생성)

자동 commit 금지.

## B. Monthly Full Validation

매월 8일 04:37 Asia/Seoul:
- npm ci
- schema validation
- search fixture test
- build
- generated sitemap 검증
- 내부 링크 검사
- source health

자동 deploy 금지.

## 예시 workflow skeleton

```yaml
name: Quality checks

on:
  workflow_dispatch:
  schedule:
    - cron: '17 4 * * 3'
      timezone: 'Asia/Seoul'

permissions:
  contents: read

jobs:
  quality:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run validate:data
      - run: npm run test:search
      - run: npm run check:sources
      - run: npm run build
```

주의:
- 실제 package scripts가 생긴 뒤 workflow 이름을 맞춘다.
- public repo는 장기간 활동이 없으면 scheduled workflow가 비활성화될 수 있으므로 운영 중 확인.
- API key가 필요한 작업은 repository secret 사용.
- PR에서 외부 secret을 필요로 하지 않도록 설계.
