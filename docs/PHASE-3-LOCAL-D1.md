# Phase 3 로컬 D1 및 추후 Cloudflare 설정

Phase 3에는 Pages Function `functions/api/missing-search.js`와 D1 migration `migrations/0001_missing_searches.sql`이 포함됩니다. 현재 `wrangler.jsonc`의 `database_id`는 운영 리소스를 만들지 않기 위한 placeholder입니다.

## 로컬 확인

Wrangler를 사용할 환경에서 아래 순서로 로컬 D1에만 migration을 적용하고 Pages 개발 서버를 실행할 수 있습니다.

```sh
npx wrangler d1 migrations apply burimttukttak-missing-search --local
npm run build
npx wrangler pages dev
```

`preview_database_id`는 `DB`로 고정해 로컬 Pages 개발 서버의 D1 binding을 식별합니다. 이 절차는 로컬 상태만 사용하며 이 저장소 작업에서는 실행하지 않았습니다.

## 추후 사용자가 Cloudflare에서 할 일

1. Cloudflare 계정에서 D1 데이터베이스 `burimttukttak-missing-search`를 생성합니다.
2. 발급된 실제 database ID로 `wrangler.jsonc`의 placeholder를 교체합니다.
3. Pages 프로젝트의 Preview와 Production 환경에 binding 이름 `DB`로 D1을 연결합니다.
4. migration을 원격 D1에 적용하기 전에 대상과 내용을 확인합니다.
5. Pages를 배포한 뒤 허용된 운영·Preview origin에서 API 동작을 확인합니다.

운영 D1 생성, 원격 migration, Pages 배포는 Phase 3 구현 범위에 포함하지 않습니다.
