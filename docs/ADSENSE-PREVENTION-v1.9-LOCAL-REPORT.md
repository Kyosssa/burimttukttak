# AdSense 예방 보강 v1.9 — 로컬 작업 보고

기준: `beorimttukttak-adsense-prevention-v1.9.zip`의 `15-PASTE-IN-CODEX.txt`, `14-codex-bootstrap.md`, `04-scope-lock.md` 및 관련 품질·색인 사양. 작업 시작 시 `main`과 `origin/main`은 같은 커밋 `3ccb87457578021c78c55267e3cc48e13a6c2863`이었고 작업 트리는 깨끗했다. 이 보고는 로컬 생성물에 관한 것이며 운영 배포 결과가 아니다.

## 진단과 수정

- 기존 verified 100개, needs_research 20개, 상세 100개, sitemap 113개 URL. 가구 11개는 요약·단계·주의사항·지역 안내의 정규화된 본문이 완전히 같았다. 기존 공식 자료로 품목별 고유 처리 근거를 확인하지 못했으므로 문장을 창작하거나 verified 상태를 바꾸지 않았다.
- 11개 상세는 계속 제공하되 `noindex,follow`와 `_headers`의 `X-Robots-Tag`를 적용하고 sitemap에서 제외했다. hold 목록은 `data/indexing-holds.json`에서 명시적으로 관리한다. 완전히 중복된 verified 본문 중 하나라도 색인 대상이면 데이터 검증과 build가 실패한다. 품목명 치환 후 유사한 본문은 편집 검토 경고로 남긴다.
- 공개 HTML에서 비활성 수정 제보·문의·시행일 placeholder를 제거하고, 끊어진 문의 앵커를 footer에서 제거했다. generic 쿠팡 캐러셀과 로더·클라이언트 자산·CSS를 제거했다. 상품별 제휴 기능은 기본 비활성으로 남아 있고 실제 슬롯이나 링크는 없다. 개인정보·제휴 고지 문구는 현재 제공 상태에 맞췄다.
- privacy와 affiliate-disclosure는 `noindex,follow`로 바꾸고 sitemap에서 제외했다. `/search/`의 HTML noindex는 유지하면서 robots.txt의 `/search/` Disallow를 제거하여 크롤러가 noindex를 읽을 수 있게 했다.
- Seed의 `seo.description` 80개에서 잘못된 `을(를)` 표기를 자연스러운 `버리는 방법을` 표현으로 고쳤다. 배출방법·출처·검증 상태·별칭·기타 Seed 필드는 변경하지 않았다.
- 정보 출처 정책에 중복 본문 검토와 색인 보류 원칙을 추가했다.

## 예상 색인 구성

| 구분 | 이전 | 로컬 수정 후 |
| --- | ---: | ---: |
| verified / needs_research | 100 / 20 | 100 / 20 |
| 생성 상세페이지 | 100 | 100 |
| 색인 대상 상세페이지 | 100 | 89 |
| sitemap URL | 113 | 100 |
| generic 쿠팡 배너 페이지 | 101 | 0 |

색인 대상은 홈 1개, 상세 89개, 카테고리 8개, about와 source-policy 각 1개다. privacy·affiliate-disclosure·search·404와 아래 hold 11개는 sitemap에서 제외한다. 11개 상세 URL은 실제 200 페이지와 자기 canonical을 유지한다. needs_research 상세는 계속 실제 404다.

hold/noindex 품목: `bed-frame`, `sofa`, `chair`, `desk`, `dining-table`, `drawer-chest`, `wardrobe`, `bookshelf`, `vanity-table`, `shoe-cabinet`, `mirror`.

## 검증 및 남은 검토

`npm run preflight`에서 Seed 120개 검증, 검색 fixture 34개, 전체 163개 테스트, 정적 build와 Pages Functions 번들, sitemap·내부 링크·index/noindex·실제 로컬 404·외부 요청 감사가 통과했다. 생성 HTML 115개에는 기존 AdSense loader가 각 1회 있으며, 그 외 자동 외부 요청은 0개다. source-health는 레지스트리 8개, 기한 도래 0개, 미매핑 0개를 읽기 전용으로 보고했다.

남은 위험: 11개 가구 상세는 이용자 접근과 내부 탐색이 가능하지만 품목별 고유 근거가 없어 색인을 보류한다. 공식 근거를 사람이 확인하고 별개의 유용한 정보가 생기기 전에는 hold를 풀지 않는다. 이름 치환 후 유사한 본문이 여러 그룹에 남아 있어 편집 검토가 필요하다. AdSense 심사 결과는 이 로컬 검증으로 보장되지 않는다. 운영 반영 및 Search Console 재수집은 commit·push·배포가 승인된 뒤 별도 확인이 필요하다.

변경하지 않은 항목: `ads.txt`, 브랜드 자산, D1·Pages Functions, missing-search 개인정보 보호, TODAY, 공식 출처와 배출 사실, DNS. commit·push·Production 배포·외부 출처 자동 수집은 수행하지 않았다.
