-- Add links permission column
ALTER TABLE member_permissions ADD COLUMN IF NOT EXISTS can_view_links BOOLEAN DEFAULT FALSE;
