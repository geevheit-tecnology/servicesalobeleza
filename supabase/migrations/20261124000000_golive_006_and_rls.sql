-- ==============================================================================
-- Migração Aditiva de Go-Live (006 + RLS Security Hardening)
-- Segura para execução em banco existente (NÃO apaga dados)
-- ==============================================================================
BEGIN;
SET LOCAL search_path = public;
SELECT pg_advisory_xact_lock(7300411);

-- 1. Colunas da migração 006_reviews_commission.sql + PIX da Plataforma em system_settings
ALTER TABLE salons ADD COLUMN IF NOT EXISTS reviews_raw text NOT NULL DEFAULT '[]';
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS commission decimal(5,2) NOT NULL DEFAULT 0;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS pix_key text NOT NULL DEFAULT '';
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS pix_name text NOT NULL DEFAULT '';

INSERT INTO schema_migrations(version)
VALUES ('006_reviews_commission.sql')
ON CONFLICT (version) DO NOTHING;

-- 2. Ativação de Row Level Security (RLS) em todas as tabelas do schema public
-- Bloqueia acesso direto indevido via PostgREST (anon key), enquanto a API Go
-- (conectada com role postgres/service) opera normalmente.
ALTER TABLE schema_migrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_usages ENABLE ROW LEVEL SECURITY;

COMMIT;
