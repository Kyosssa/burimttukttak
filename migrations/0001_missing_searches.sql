-- Local/Cloudflare D1 migration copied from the Pack's 03-d1-schema.sql.
-- Stores aggregate missing-query frequency only; no user or request metadata.
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
