# Phase 0 완료 보고

## 기준과 범위

`01-codex-bootstrap-prompt.md`의 필수 12개 문서를 읽고, Seed 전체를 파싱했습니다.
추가로 별도 인수인계, 카테고리 목록, 출시 체크리스트, Phase 구분, 품질 검사 및 데이터 버전 문서를 참고했습니다.
문서의 전체 사이트 구현 지시는 이번 사용자 요청의 Phase 0 범위를 확대하지 않습니다.
인수인계에 적힌 Pack v1.2 표기와 달리 실제 첨부된 v1.3 ZIP을 기준으로 사용했습니다.

## 구현 파일

| 파일 | 역할 |
| --- | --- |
| `package.json`, `package-lock.json` | 고정 Ajv/Ajv-formats 의존성과 실행 명령 |
| `.gitignore` | 의존성·캐시·임시 파일 제외 |
| `scripts/lib/inputs.mjs` | Pack JSON 로드, 작업 디렉터리에 의존하지 않는 기본 경로 |
| `scripts/lib/validate.mjs` | JSON Schema 2020-12 및 데이터 정책 검사 |
| `scripts/validate-data.mjs` | 오류 코드·JSON 경로 출력, 실패 종료 코드 1 |
| `scripts/build.mjs` | 데이터 검증 → 전체 테스트; 실패 즉시 중단 |
| `src/search.mjs` | 브라우저에서도 사용 가능한 순수 검색/정규화/안전한 인덱스 함수 |
| `tests/search.test.mjs` | 원본 fixture 34개와 검색·미검증 보호 테스트 |
| `tests/validation.test.mjs` | 원본 데이터 및 잘못된 데이터 거부 테스트 |
| `tests/build.test.mjs` | 잘못된 JSON/Seed/없는 파일로 build 중단 확인 |
| `README.md` | 실행 방법과 범위 |
| `docs/prebuild/*`, `docs/WORK-HANDOFF.md` | 원본 기준 문서 보존 |

## 데이터 검증 규칙

- 원본 `02-item.schema.json`을 Ajv 2020-12로 검증합니다. 날짜의 실제 달력 유효성, URI, 자료형, 필수 필드, 길이, enum, 배열 중복, collection_service 구조를 검사합니다.
- Seed의 비어 있지 않은 items 배열과 총계/verified/needs_research 메타데이터의 실제 개수 일치를 검사합니다. 원본 회귀 테스트는 120/30/90을 고정합니다.
- ID·slug는 정확 일치, 이름은 NFKC·영문 소문자·공백 제거 후 중복을 검사합니다.
- 별칭의 정규화 중복, 다른 품목의 이름/별칭과의 충돌을 검사합니다. 원본의 `투명페트병`/`투명 페트병`처럼 같은 품목 이름과 별칭이 정규화 후 일치하는 경우는 허용합니다.
- 관련 품목 slug의 존재, 중복, 자기 참조를 검사합니다. 미검증 품목을 가리키는 원본 관련 참조는 유효합니다. 해당 품목의 공개를 허용한다는 뜻은 아닙니다.
- 카테고리를 원본 카테고리 목록과 대조하고, 선택적 search_keywords는 비어 있지 않은 문자열 배열이어야 합니다.
- verified는 summary·steps·disposal_type·disposal_label·verified_at·verification_level·SEO title/description이 필요합니다. 공백만 있는 필드도 거부합니다. 지역 차이 여부는 boolean이어야 하고 true이면 regional_note가 필요합니다.
- verified 출처마다 자료명·기관·checked_at이 필요합니다. HTTPS URL이 source registry URL과 정확히 일치하고 기관도 같아야 합니다. 등록된 tier 1/2 출처가 적어도 하나 있어야 하며 tier 3만으로는 통과하지 못합니다.
- collection_service URL이 있으면 HTTPS 및 인증정보 없는 URL이어야 합니다. 수거 가능 여부의 의미적 사실 판단은 자동화하지 않습니다.
- needs_research의 배출 요약·분류·지역 안내·수거 안내·SEO는 null/미지정, steps/warnings는 빈 배열을 유지하도록 검사합니다. 데이터 자동 보완이나 상태 승격은 없습니다.

Schema는 그대로 두고, Schema만으로 막히지 않는 null SEO·누락된 출처 확인일·미검증 내용 등은 별도 정책 검사로 보강했습니다.
출처 대조는 로컬 등록 정보의 무결성 검사입니다. 공식 본문의 정확성·최신성·URL 접속 성공을 새로 확인했다는 의미는 아닙니다.

## 검색 계약

- 우선순위: 이름 정확 일치 → 별칭 정확 일치 → prefix → substring → fuzzy → 카테고리/선택 키워드.
- NFKC, 소문자화, 공백 제거를 공유합니다. 동점은 slug 순으로 정렬하고 최대 6개를 반환합니다.
- fuzzy는 검색어와 대상이 모두 3글자 이상일 때 편집거리 1까지만 허용합니다. 짧은 미등록 검색의 오탐을 줄이기 위한 보수적인 기준입니다.
- 입력은 최대 60 UTF-16 코드 단위입니다. 빈 값·제어문자·비문자열·HTML 형태·허용하지 않는 기호는 empty_or_invalid입니다.
- 1글자는 등록 이름/별칭의 정확 일치만 허용합니다. 따라서 옷/캔/칼/약/팬을 막지 않으면서 무의미한 1글자 입력은 집계 대상에서 제외합니다.
- 반환 상태: verified_item / unverified_item / missing / empty_or_invalid.
- shouldTrackMissing은 실제 검색 결과가 없는 유효 입력에만 true입니다. 집계 여부를 표현하는 값이며 네트워크 호출·DB 기록은 구현하지 않았습니다.
- 인덱스와 검색 결과는 허용 필드만 복사합니다. 배출방법·출처 본문·SEO·수거 안내를 포함하지 않으며, 미검증 입력이 오염돼도 해당 내용이 검색 결과에 섞이지 않습니다.

## 검증 결과

- `npm run validate:data`: 성공, 총 120 / verified 30 / needs_research 90.
- `npm run build`: 성공, 전체 91개 테스트 통과, 실패·건너뜀 0.
- `14-search-quality-fixtures.json`: 34/34 통과, 기대 slug·상태·missing 집계 여부 확인.
- 전체 120개 이름과 모든 별칭의 올바른 품목 연결 확인.
- 원본 별칭에 없는 실제 오타, 순위 충돌, 정규화, 짧은 입력, 미검증 내용 비노출 확인.
- 손상 JSON·출처가 없는 verified·없는 입력 파일: build 종료 코드 1, 후속 테스트/산출 단계 중단 확인.
- 원본 v1.3 ZIP과 `docs/prebuild/`의 26개 파일을 SHA-256으로 대조: 전부 동일.
- Seed SHA-256: `74AE0C3AFCB3D796ECFC1B0DFB94114C70421B102D2FD7760724A6A072FEEF2B`.

이 환경에서는 Node 테스트 러너의 자식 프로세스 생성이 기본 sandbox에서 EPERM으로 차단되어, 승인된 로컬 실행으로 build를 검증했습니다. 데이터 검증 자체는 기본 sandbox에서도 통과했습니다.

## 보류와 다음 Phase

Phase 0 실패/미완료 항목은 없습니다. 출시 체크리스트의 UI·SEO·네트워크·배포 항목은 아직 수행 대상이 아닙니다.
공식 사이트 자동 수집·우회 접근·원본 수정·미검증 배출법 생성·commit·push·Cloudflare 배포·DNS 변경은 수행하지 않았습니다.
외부 통신은 개발 의존성 설치에만 사용했습니다.

다음 Phase 1은 `21-implementation-phases.md` 기준의 광고 없는 핵심 정적 서비스입니다:

- 홈 검색 및 준비 중 상태 UI
- verified 30개 상세 페이지와 8개 카테고리
- 관련 품목, 공식 출처와 정보 확인일, 원본 조건을 반영한 폐가전 CTA
- 미검증 관련 품목의 비공개/준비 중 처리와 모바일·키보드 사용 검증

SEO 상세 작업은 Phase 2, Worker/D1은 Phase 3, 광고·제휴·정책 페이지는 Phase 4, 운영 자동검사는 Phase 5로 보류합니다.
Phase 0에서 필요한 GitHub/Cloudflare 사용자 설정은 없습니다.
