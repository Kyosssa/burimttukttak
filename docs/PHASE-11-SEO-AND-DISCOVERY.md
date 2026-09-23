# Phase 11: SEO·콘텐츠·탐색 감사

## 변경 사항과 관련 품목 규칙

- 검증된 상세 100개에 정적 탐색 영역을 제공한다. Seed의 명시적 `related_items`, 해당 품목을 가리키는 검증된 품목, 동일 카테고리와 동일 `disposal_type`의 검증된 품목 순서로 최대 6개를 고른다. 후자의 두 그룹은 품목명·slug 순으로 고정 정렬한다.
- 자기 자신, 중복, `needs_research`는 상세 링크에 넣지 않는다. 직접 관련 품목이 없는 `unused-medicine`에는 카테고리 탐색 경로만 제공한다. 57개 페이지는 6개, 2개는 5개, 11개는 4개, 8개는 3개, 14개는 2개, 7개는 1개, 1개는 0개 관련 품목이다. 개수를 채우려고 다른 배출 분류를 연결하지 않는다.
- 홈과 `/search/`에서 진짜 미등록 검색 결과일 때만 재검색 안내, 대표 검증 품목 3개, 카테고리 탐색 링크를 보여준다. 검색어와 대표 품목 사이의 유사성을 주장하지 않는다. 기존 missing-search 전송 조건과 30초 메모리 중복 방지는 그대로다.

## 검증된 상세 100개 콘텐츠 전수 감사

Seed와 생성 HTML의 title, description, H1, 첫 요약, 단계, 주의사항, 공식 출처, 관련 탐색을 전체 100개에서 확인했다. title과 description은 각각 100개 모두 존재하고 중복은 0개다. 첫 요약, 단계, 주의사항, 출처는 100개 모두 존재한다. 생성 페이지의 canonical과 WebPage/BreadcrumbList JSON-LD는 Seed의 품목·카테고리와 일치한다. 8개 카테고리와 홈에서 모든 검증 품목으로 이동할 수 있어 고아 상세는 0개다.

요약이 35자 미만인 14개는 `chicken-bone`, `pork-bone`, `fish-bone`, `shellfish-shell`, `banana-peel`, `onion-skin`, `garlic-skin`, `corn-husk`, `corn-cob`, `peach-pit`, `watermelon-rind`, `carpet`, `umbrella`, `fluorescent-lamp`다. 짧은 핵심 답변 아래에 기존 공식 근거 기반 단계·주의사항·출처·지역 안내가 있으므로, 근거 없이 문장을 늘리지 않았다.

`bed-frame`, `sofa`, `chair`, `desk`, `dining-table`, `drawer-chest`, `wardrobe`, `bookshelf`, `vanity-table`, `shoe-cabinet`, `mirror`의 요약·단계·주의사항이 동일하다. 동일한 지역 대형폐기물 절차를 적용하는 현행 근거 범위에서는 공통 문장을 유지한다. 가전제품 등에도 공식 수거 절차가 같은 품목 사이에 동일 단계가 있다. 중복 본문은 기존과 같이 사람의 검토 경고이며 빌드 실패로 바꾸지 않았다. 품목별 수수료, 크기, 재질, 분해법을 구별하려면 관할 기관의 품목별 공식 원문을 추가로 확인해야 한다.

FAQ는 이번에 일괄 생성하지 않았다. 일반쓰레기·재활용 여부를 모든 품목에 같은 질문으로 적용하면 현행 출처가 뒷받침하지 않는 답을 만들 수 있다. 현재 화면의 핵심 답변, 단계, 주의사항, 지역 안내, 출처가 확인 가능한 보조 설명을 제공한다. 화면에 없는 FAQPage JSON-LD도 생성하지 않았다.

## 내부 링크·SEO·성능·모바일

- 관련 품목 URL은 존재하는 `/item/{slug}/` canonical만 사용한다. 자기 참조·중복 링크 0개. 전체 HTML 내부 링크 검사에서 깨진 링크 0개.
- 공개 canonical URL과 sitemap 113개 유지. 검색·404는 색인 제외하고, 검증되지 않은 20개 품목은 상세·sitemap에 없다. 기존 OG/Twitter, robots, Naver/AdSense, WebPage/BreadcrumbList 구조화 데이터는 변경하지 않았다.
- Phase 10 기준 app JS 5,220 B → 5,454 B (+234 B), CSS 10,875 B → 11,527 B (+652 B). 검색 index 26,371 B, 검색 로직 JS 3,610 B, missing-search JS 1,009 B, 쿠팡 JS 1,715 B는 동일하다. 관련 탐색은 빌드 시 생성해 클라이언트 런타임을 추가하지 않았다.
- 로컬 브라우저 360px에서 홈 검색과 후라이팬 상세, 미등록 검색 안내의 `documentElement.scrollWidth`가 345px로 뷰포트 360px 이내였다. 쿠팡 영역·제휴 고지·공식 출처·관련 링크는 기존 순서를 유지한다. 광고 공간 예약과 외부 iframe의 실제 로딩은 네트워크 상태에 따라 달라질 수 있으므로 배포 후에도 확인한다.

## 회귀 검사와 변경하지 않은 것

관련 품목 결정성·최대 개수·정확한 생성 링크·자기 참조·중복·검증 상태, 검색 실패 안내의 숨김/노출을 테스트에 추가했다. 기존 34개 검색 fixture, D1 개인정보 차단, 100개 상세, 113개 sitemap, 404, 내부 링크, 광고/고지 검사를 유지했다. Seed의 verified 상태·배출 방법·공식 출처·SEO 문구, D1/API, 광고 설정, `scripts/research/*`는 변경하지 않았다. Production D1을 조회하거나 수정하지 않았다.
