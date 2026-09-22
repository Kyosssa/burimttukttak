# 버림뚝딱 SEO / 색인 규칙 v1

## 1. 색인 허용

색인:
- `/`
- `/item/{verified-slug}/`
- `/category/{slug}/` (고유 설명과 내부 링크가 충분할 때만)
- `/guides/.../`
- `/about/`
- `/privacy/`
- `/affiliate-disclosure/`
- `/source-policy/`

noindex:
- `/search/`
- 미검증 품목 임시 페이지
- 내부 테스트/프리뷰
- 파라미터만 다른 중복 페이지

## 2. Canonical

- 품목당 canonical은 정확히 1개: `/item/{slug}/`
- aliases는 redirect 또는 검색 매칭만 사용
- query string은 canonical에 포함하지 않음
- http → https, www/non-www 중 하나로 일관되게 301

## 3. Title / H1

Title 기본형:
`{품목명} 버리는 법 | {배출분류} 배출 방법 - 버림뚝딱`

H1:
`{품목명} 버리는 법`

억지 키워드 반복 금지.

## 4. 구조화 데이터

홈:
- `WebSite`
- `Organization`

품목:
- `WebPage`
- `BreadcrumbList`

카테고리:
- `CollectionPage`
- `BreadcrumbList`

주의:
- 품목 페이지는 기사형 콘텐츠가 아니므로 기본값을 `Article`로 잡지 않는다.
- `SearchAction`은 추가하지 않는다. Google의 사이트링크 검색창은 2024-11-21부터 종료됨.
- 실제 화면에 없는 내용을 구조화 데이터에만 넣지 않는다.

## 5. Sitemap

- `/sitemap.xml`
- UTF-8
- 절대 URL 사용
- canonical + indexable URL만 포함
- `verified` 품목만 포함
- 검색결과/noindex/프리뷰 제외
- `lastmod`는 실제 내용이 바뀐 경우에만 변경
- 50,000 URL을 넘기기 전까지 단일 sitemap으로 충분

robots.txt 예시:

User-agent: *
Allow: /
Disallow: /search/
Sitemap: https://beorimttukttak.com/sitemap.xml

`Disallow`만으로 검색 결과의 색인 제거를 보장하지 않으므로
검색 페이지 HTML에는 `meta robots=noindex,follow`도 넣는다.

## 6. 내부링크

품목 페이지:
- 상위 카테고리
- 관련 품목 3~6개
- 해당 시 공식 가이드
- 홈 검색

카테고리 페이지:
- verified 품목만
- 얇은 태그 페이지는 만들지 않음

## 7. Search Console / 네이버

Google:
- 도메인 속성 등록
- sitemap 제출
- 대표 품목 3~5개 URL 검사
- 색인 생성 요청 남발 금지

네이버:
- 사이트 소유확인
- robots.txt 검증
- sitemap 제출
- 수집 현황 확인

## 8. 페이지 품질

정답 카드 → 광고 → 상세 설명 순.
페이지 시작에 500자짜리 SEO 서론을 두지 않는다.

각 품목은 최소:
- 정답 요약
- 2~5 단계
- 주의사항(해당 시)
- 지역차이
- 공식 출처
- 확인일
- 관련 품목

## 9. 업데이트 정책

공식 기준 변경 시:
1. staging JSON 갱신
2. diff 검토
3. 사람 검토
4. verified_at / checked_at 갱신
5. build
6. 변경된 URL의 lastmod만 변경
