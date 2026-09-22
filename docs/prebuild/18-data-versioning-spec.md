# 버림뚝딱 데이터 버전 / 변경이력 v1

## 왜 필요한가

배출 정보가 바뀌었을 때:
- 언제 바뀌었는지
- 왜 바뀌었는지
- 어떤 공식자료를 근거로 했는지
를 남겨야 사이트 신뢰성과 유지보수가 쉬워진다.

## 파일 권장

`data/changelog.json`

```json
[
  {
    "date": "2026-09-22",
    "item_slug": "frying-pan",
    "type": "verified",
    "summary": "최초 공식 검증",
    "source_ids": ["me-recycling-guideline"]
  }
]
```

## change type

- `created`
- `verified`
- `content_update`
- `source_update`
- `collection_rule_update`
- `alias_update`
- `seo_update`
- `retired`

## Git 원칙

콘텐츠 갱신 commit 예:
`data: update battery disposal guidance`

한 commit에서 unrelated 대량 변경을 피한다.

## 공개 표시

v1에서 전체 changelog 페이지는 필수 아님.

페이지에는:
- 정보 확인일
- 출처

만 보여주면 충분.

향후 `/updates/`를 만들 경우 실제 사용자 가치가 있는 변경만 공개한다.

## 자동화

공식 API sync가 diff를 발견하면:
`data/staging/official-diff-YYYY-MM-DD.json`

을 생성.

main items.json 자동 덮어쓰기 금지.
