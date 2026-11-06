-- LOCAL SYNTHETIC REHEARSAL ONLY. Not a production migration.
-- Deliberately excludes authentication, billing and schedules pending cutover design.
BEGIN;
INSERT INTO belezapura.salons(id,slug,name,created_at,updated_at)
SELECT id,'migrado-'||id::text,name,now(),now() FROM public.tenants;
INSERT INTO belezapura.professionals(id,salon_id,name,status,created_at,updated_at)
SELECT id,tenant_id,name,CASE WHEN active IS TRUE THEN 'active' ELSE 'inactive' END,now(),now()
FROM public.professionals;
INSERT INTO belezapura.services(id,salon_id,name,duration,price,status,created_at,updated_at)
SELECT id,tenant_id,name,duration_minutes,price,'active',now(),now() FROM public.services;
DO $$ BEGIN
  IF EXISTS (SELECT id,name FROM public.tenants EXCEPT SELECT id,name FROM belezapura.salons)
  OR EXISTS (SELECT id,tenant_id,name FROM public.professionals EXCEPT SELECT id,salon_id,name FROM belezapura.professionals)
  OR EXISTS (SELECT id,tenant_id,name,duration_minutes,price FROM public.services EXCEPT SELECT id,salon_id,name,duration,price FROM belezapura.services)
  THEN RAISE EXCEPTION 'Synthetic import changed identifiers, tenant links or mapped values'; END IF;
END $$;
COMMIT;
