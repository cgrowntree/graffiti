CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  geohash TEXT NOT NULL,
  text TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_messages_gh ON messages(geohash, created_at DESC);
