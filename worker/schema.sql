CREATE TABLE IF NOT EXISTS registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  people INTEGER,
  message TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT,
  form_sent_at TEXT,
  form_error TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS registrations_email ON registrations(lower(email));
