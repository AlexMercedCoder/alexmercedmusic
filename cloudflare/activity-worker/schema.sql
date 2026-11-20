CREATE TABLE IF NOT EXISTS song_activity_daily (
  day TEXT NOT NULL,
  song_slug TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('view', 'play', 'listen', 'download')),
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, song_slug, action)
);
