ALTER TABLE salons ADD COLUMN IF NOT EXISTS whatsapp_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE salons ADD COLUMN IF NOT EXISTS whatsapp_monthly_limit integer NOT NULL DEFAULT 0;
CREATE TABLE IF NOT EXISTS whatsapp_usages (
  salon_id text NOT NULL,
  month text NOT NULL,
  sent integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (salon_id, month)
);

