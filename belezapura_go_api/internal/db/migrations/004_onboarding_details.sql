-- Additive migration; preserve existing account, identity and booking data.
ALTER TABLE salons ADD COLUMN IF NOT EXISTS address_zip_code text NOT NULL DEFAULT '';
ALTER TABLE salons ADD COLUMN IF NOT EXISTS address_street text NOT NULL DEFAULT '';
ALTER TABLE salons ADD COLUMN IF NOT EXISTS address_number text NOT NULL DEFAULT '';
ALTER TABLE salons ADD COLUMN IF NOT EXISTS address_district text NOT NULL DEFAULT '';
ALTER TABLE salons ADD COLUMN IF NOT EXISTS address_city text NOT NULL DEFAULT '';
ALTER TABLE salons ADD COLUMN IF NOT EXISTS address_state text NOT NULL DEFAULT '';
ALTER TABLE salons ADD COLUMN IF NOT EXISTS instagram text NOT NULL DEFAULT '';
ALTER TABLE salons ADD COLUMN IF NOT EXISTS pix_name text NOT NULL DEFAULT '';
ALTER TABLE salons ADD COLUMN IF NOT EXISTS deposit_policy text NOT NULL DEFAULT 'required';
ALTER TABLE salons ADD COLUMN IF NOT EXISTS deposit_type text NOT NULL DEFAULT 'percentage';
ALTER TABLE salons ADD COLUMN IF NOT EXISTS deposit_value decimal(10,2) NOT NULL DEFAULT 20;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE services ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT '';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS deposit decimal(10,2) NOT NULL DEFAULT 0;
ALTER TABLE salons ADD CONSTRAINT salons_deposit_configuration CHECK (
  deposit_policy IN ('required', 'optional', 'none')
  AND deposit_type IN ('percentage', 'fixed')
  AND deposit_value > 0 AND deposit_value <= 99999999
  AND (deposit_type <> 'percentage' OR deposit_value <= 100)
);
ALTER TABLE appointments ADD CONSTRAINT appointments_deposit_valid CHECK (deposit >= 0 AND deposit <= value);
