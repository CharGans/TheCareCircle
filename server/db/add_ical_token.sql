-- Add ical_token column to care_circles table
ALTER TABLE care_circles ADD COLUMN IF NOT EXISTS ical_token VARCHAR(64) UNIQUE;
