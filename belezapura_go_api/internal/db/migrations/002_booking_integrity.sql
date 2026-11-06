CREATE EXTENSION IF NOT EXISTS btree_gist;
UPDATE appointments a SET ends_at = a.date + make_interval(mins => GREATEST(COALESCE(s.duration,30),1)::integer)
FROM services s WHERE s.id = a.service_id::uuid AND (a.ends_at IS NULL OR a.ends_at <= a.date);
ALTER TABLE appointments ALTER COLUMN ends_at SET NOT NULL;
ALTER TABLE appointments ADD CONSTRAINT appointment_positive_interval CHECK (ends_at > date);
ALTER TABLE appointments ADD CONSTRAINT appointment_no_overlap EXCLUDE USING gist
(professional_id WITH =, tstzrange(date, ends_at, '[)') WITH &&)
WHERE (deleted_at IS NULL AND status <> 'cancelled');
CREATE INDEX appointments_salon_date ON appointments(salon_id,date) WHERE deleted_at IS NULL;
CREATE INDEX subscriptions_salon_created ON subscriptions(salon_id,created_at DESC) WHERE deleted_at IS NULL;
CREATE FUNCTION validate_appointment_tenant() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM clients WHERE id = NEW.client_id::uuid AND salon_id = NEW.salon_id AND deleted_at IS NULL)
 OR NOT EXISTS (SELECT 1 FROM services WHERE id = NEW.service_id::uuid AND salon_id = NEW.salon_id AND deleted_at IS NULL)
 OR NOT EXISTS (SELECT 1 FROM professionals WHERE id = NEW.professional_id::uuid AND salon_id = NEW.salon_id AND deleted_at IS NULL)
 THEN RAISE EXCEPTION 'appointment tenant mismatch' USING ERRCODE = '23514'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER appointment_tenant_guard BEFORE INSERT OR UPDATE OF salon_id,client_id,service_id,professional_id ON appointments FOR EACH ROW EXECUTE FUNCTION validate_appointment_tenant();
ALTER TABLE products ADD CONSTRAINT product_nonnegative CHECK(quantity >= 0 AND minimum >= 0 AND price >= 0);
