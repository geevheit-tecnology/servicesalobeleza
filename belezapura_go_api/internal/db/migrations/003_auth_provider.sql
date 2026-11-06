ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider text NOT NULL DEFAULT 'local';
ALTER TABLE users ADD CONSTRAINT users_auth_provider_valid CHECK (auth_provider IN ('local','supabase'));
