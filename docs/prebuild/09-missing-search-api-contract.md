# `/api/missing-search` 계약 v1

## 목적
등록되지 않은 검색어의 빈도만 집계해 다음 품목 확장 우선순위를 정한다.

## Request
POST `/api/missing-search`
Content-Type: application/json

```json
{
  "query": "골프공"
}
```

## Validation
- trim 후 1~60자
- Unicode NFC
- 연속 공백 정리
- 제어문자 거부
- 문자열 이외 거부
- HTML은 텍스트로 취급하되 태그 형태 입력은 저장 전 정규화/필터
- 검증된 품목 name/alias와 이미 매칭되는 검색어면 저장하지 않음

## Normalized query
권장:
- trim
- NFC
- 영문은 lowercase
- 공백 연속 제거
- 한국어는 원문 유지

`display_query`는 정리된 사용 표현,
`normalized_query`는 unique key.

## Response
성공: `204 No Content`

잘못된 입력: `400`
메서드 오류: `405`
서버 오류: `500`

응답에 DB row나 내부 오류 정보를 노출하지 않는다.

## Privacy
앱 DB에 저장하지 않음:
- IP
- User-Agent
- cookie id
- fingerprint
- referer 전체 URL

Cloudflare 인프라 수준의 로그는 Cloudflare 자체 정책에 따라 별개로 존재할 수 있으므로
사이트 개인정보처리방침은 실제 설정과 일치하게 유지한다.

## 중복 억제
클라이언트:
- 동일 브라우저에서 같은 검색어를 짧은 시간 반복 전송하지 않도록 localStorage/sessionStorage 기반 debounce 가능
- 이 값은 서버로 사용자 식별자로 보내지 않음

서버:
- upsert count만 수행
- 고빈도 abuse가 확인되면 Cloudflare rate limiting 또는 Turnstile을 후순위 도입

v1에는 복잡한 anti-bot 시스템을 넣지 않는다.
