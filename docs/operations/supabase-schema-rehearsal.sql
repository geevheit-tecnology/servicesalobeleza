-- SYNTHETIC LOCAL FIXTURE ONLY. Never run this file against Supabase.
-- Simulates the three conflicting legacy table names; no production data.
CREATE TABLE public.tenants (id uuid PRIMARY KEY, name text NOT NULL);
CREATE TABLE public.professionals (id uuid PRIMARY KEY, tenant_id uuid NOT NULL, name text NOT NULL, active boolean);
CREATE TABLE public.services (id uuid PRIMARY KEY, tenant_id uuid NOT NULL, name text NOT NULL, duration_minutes integer NOT NULL, price numeric NOT NULL);
CREATE TABLE public.appointments (id uuid PRIMARY KEY, tenant_id uuid NOT NULL, customer_id uuid NOT NULL, date date NOT NULL, start_time time NOT NULL, end_time time NOT NULL);
INSERT INTO public.tenants VALUES ('10000000-0000-0000-0000-000000000001','Synthetic legacy salon');
INSERT INTO public.professionals VALUES ('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','Synthetic legacy professional',true);
INSERT INTO public.services VALUES ('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','Synthetic legacy service',30,50);
CREATE SCHEMA belezapura;
