-- Add slug to workspaces
ALTER TABLE workspaces ADD COLUMN slug TEXT UNIQUE;

-- Create an index to quickly find workspaces by slug
CREATE INDEX IF NOT EXISTS workspaces_slug_idx ON workspaces(slug);
