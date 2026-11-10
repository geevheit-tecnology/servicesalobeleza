-- Correção aditiva do cadastro; não executar novamente o script de instalação limpa.
BEGIN;
SET LOCAL search_path = public;
SELECT pg_advisory_xact_lock(7300411);
ALTER TABLE salons ADD COLUMN IF NOT EXISTS whatsapp_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE salons ADD COLUMN IF NOT EXISTS whatsapp_monthly_limit integer NOT NULL DEFAULT 0;
CREATE TABLE IF NOT EXISTS whatsapp_usages (
  salon_id text NOT NULL,
  month text NOT NULL,
  sent integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (salon_id, month)
);


INSERT INTO schema_migrations(version) VALUES ('005_whatsapp_quota.sql') ON CONFLICT (version) DO NOTHING;
COMMIT;
