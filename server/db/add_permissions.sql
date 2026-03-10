-- Add permissions table
CREATE TABLE IF NOT EXISTS member_permissions (
  id SERIAL PRIMARY KEY,
  circle_id INTEGER REFERENCES care_circles(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  can_view_calendar BOOLEAN DEFAULT TRUE,
  can_view_messages BOOLEAN DEFAULT TRUE,
  can_view_careplan BOOLEAN DEFAULT TRUE,
  can_view_checklist BOOLEAN DEFAULT TRUE,
  can_view_providers BOOLEAN DEFAULT TRUE,
  can_view_members BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(circle_id, user_id)
);

-- Create index for faster lookups
CREATE INDEX idx_member_permissions_lookup ON member_permissions(circle_id, user_id);
