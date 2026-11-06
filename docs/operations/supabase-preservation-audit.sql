-- Read-only inventory. Run against the confirmed Supabase target before migration.
SELECT 'counts' AS section, jsonb_build_object(
  'tenants',(SELECT count(*) FROM public.tenants),
  'profiles',(SELECT count(*) FROM public.profiles),
  'customers',(SELECT count(*) FROM public.customers),
  'professionals',(SELECT count(*) FROM public.professionals),
  'services',(SELECT count(*) FROM public.services),
  'appointments',(SELECT count(*) FROM public.appointments),
  'availability_blocks',(SELECT count(*) FROM public.availability_blocks),
  'auth_users',(SELECT count(*) FROM auth.users)
) AS detail
UNION ALL
SELECT 'integrity' AS section, jsonb_build_object(
  'orphan_profiles',(SELECT count(*) FROM public.profiles p LEFT JOIN public.tenants t ON t.id=p.tenant_id WHERE p.tenant_id IS NOT NULL AND t.id IS NULL),
  'profiles_without_tenant',(SELECT count(*) FROM public.profiles WHERE tenant_id IS NULL),
  'orphan_customers',(SELECT count(*) FROM public.customers c LEFT JOIN public.tenants t ON t.id=c.tenant_id WHERE t.id IS NULL),
  'orphan_professionals',(SELECT count(*) FROM public.professionals p LEFT JOIN public.tenants t ON t.id=p.tenant_id WHERE t.id IS NULL),
  'orphan_services',(SELECT count(*) FROM public.services s LEFT JOIN public.tenants t ON t.id=s.tenant_id WHERE t.id IS NULL),
  'invalid_services',(SELECT count(*) FROM public.services WHERE duration_minutes<=0 OR price<0),
  'invalid_appointments',(SELECT count(*) FROM public.appointments WHERE end_time<=start_time),
  'cross_tenant_appointments',(SELECT count(*) FROM public.appointments a
    LEFT JOIN public.customers c ON c.id=a.customer_id
    LEFT JOIN public.professionals p ON p.id=a.professional_id
    LEFT JOIN public.services s ON s.id=a.service_id
    WHERE c.id IS NULL OR p.id IS NULL OR s.id IS NULL
       OR c.tenant_id<>a.tenant_id OR p.tenant_id<>a.tenant_id OR s.tenant_id<>a.tenant_id)
) AS detail
UNION ALL
SELECT 'columns',jsonb_build_object('table',table_name,'column',column_name,'type',data_type,'nullable',is_nullable,'default',column_default)
FROM information_schema.columns WHERE table_schema='public'
UNION ALL
SELECT 'constraints',jsonb_build_object('table',c.conrelid::regclass::text,'name',c.conname,'definition',pg_get_constraintdef(c.oid))
FROM pg_constraint c JOIN pg_namespace n ON n.oid=c.connamespace WHERE n.nspname='public'
UNION ALL
SELECT 'policies',jsonb_build_object('table',tablename,'name',policyname,'roles',roles,'command',cmd,'qual',qual,'with_check',with_check)
FROM pg_policies WHERE schemaname='public';
