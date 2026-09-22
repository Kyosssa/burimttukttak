# Seed 변경 이력과 수정 제보 처리

## 기준 파일

- 운영 Seed: `docs/prebuild/burimttukttak-seed-v1.1.json`
- 공식 출처 등록부: `docs/prebuild/12-source-registry-v1.json`
- 변경 이력: `data/changelog.json`

`data/changelog.json`에는 현재 verified 30개 품목의 Seed v1.1 기준선을 기록했습니다. 이후 Seed를 바꾸는 커밋에는 변경된 품목마다 다음 정보를 한 항목으로 추가합니다.

- `date`: 사람이 공식 자료를 확인한 날짜
- `item_slug`: 변경한 품목 slug
- `type`: `created`, `verified`, `content_update`, `source_update`, `collection_rule_update`, `alias_update`, `seo_update`, `retired` 중 하나
- `summary`: 변경 이유와 실제 변경 내용을 짧게 설명
- `source_ids`: 근거로 재확인한 source registry ID

## 공식 출처 검토 순서

1. `npm run check:sources`로 마지막 확인일과 등록부의 검토 주기를 비교합니다. 이 명령은 네트워크를 호출하지 않고 Seed도 수정하지 않습니다.
2. `review_due` 항목은 운영자가 등록부 URL을 브라우저에서 직접 엽니다.
3. 기관명, 문서 제목, 적용 조건, 배출방법과 수거 조건을 사람이 확인합니다.
4. 변경이 없으면 해당 source의 `checked_at`과 품목의 `verified_at`을 검토일로 갱신하고 changelog에 확인 기록을 남깁니다.
5. 변경이 있으면 영향받는 품목만 수정하고 `content_update`, `source_update` 또는 `collection_rule_update`로 기록합니다.
6. `npm run preflight`를 통과시킨 뒤 별도 데이터 커밋으로 남깁니다.

출처 장애나 문구 변경만으로 배출방법을 자동 변경하거나 verified 상태를 자동 승격·삭제하지 않습니다.

## 수정 제보 처리

현재 공개 UI는 운영 이메일이 정해지지 않아 제보 경로를 활성화하지 않았습니다. 이메일을 정한 뒤에는 이름, 전화번호, 정확한 위치를 요구하지 않고 다음 템플릿만 받습니다.

```text
제목: [버림뚝딱 수정 제보] 품목명

- 품목:
- 어떤 내용이 다른가요?
- 확인한 공식 출처 URL:
- 추가 설명:
```

처리 상태는 `new → reviewing → accepted/rejected/duplicate`로 관리합니다. 제보만으로 Seed를 수정하지 않습니다. 운영자가 공식 출처를 재확인하고, Seed와 changelog를 함께 수정한 다음 preflight를 통과시켜야 반영할 수 있습니다.

운영 이메일을 공개하기 전 개인정보처리방침의 문의처와 시행일을 함께 확정합니다.
