-- 버림뚝딱 D1 v1
-- 목적: 사이트에 아직 등록되지 않은 검색어의 빈도만 집계
-- 개인정보/IP/User-Agent/쿠키 식별자는 저장하지 않는다.

CREATE TABLE IF NOT EXISTS missing_searches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  normalized_query TEXT NOT NULL UNIQUE,
  display_query TEXT NOT NULL,
  search_count INTEGER NOT NULL DEFAULT 1 CHECK (search_count >= 1),
  first_seen TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_missing_searches_count
ON missing_searches(search_count DESC);

CREATE INDEX IF NOT EXISTS idx_missing_searches_last_seen
ON missing_searches(last_seen DESC);

-- Worker upsert 예시:
-- INSERT INTO missing_searches
--   (normalized_query, display_query, search_count, first_seen, last_seen)
-- VALUES
--   (?1, ?2, 1, datetime('now'), datetime('now'))
-- ON CONFLICT(normalized_query)
-- DO UPDATE SET
--   search_count = search_count + 1,
--   display_query = excluded.display_query,
--   last_seen = datetime('now');

-- 권장 정규화:
-- 1) trim
-- 2) Unicode normalization (NFC)
-- 3) 연속 공백 1칸
-- 4) 길이 1~60자
-- 5) HTML 태그 제거/무시
-- 6) 제어문자 거부
--
-- API는 성공 시 204 No Content를 반환해도 충분하다.
