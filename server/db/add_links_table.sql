CREATE TABLE IF NOT EXISTS important_links (
  id SERIAL PRIMARY KEY,
  circle_id INTEGER REFERENCES care_circles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
