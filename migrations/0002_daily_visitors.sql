-- Anonymous browser-tab-session visits by Asia/Seoul calendar date.
-- TODAY is an approximate session count, not a unique-person count.
CREATE TABLE IF NOT EXISTS daily_visitors (
  date TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0 CHECK (count >= 0),
  last_updated TEXT NOT NULL
);
