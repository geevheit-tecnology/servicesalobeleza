-- Additive: upgrades older databases without replacing existing settings.
ALTER TABLE salons ADD COLUMN IF NOT EXISTS reviews_raw text NOT NULL DEFAULT '[]';
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS commission decimal(5,2) NOT NULL DEFAULT 0;
