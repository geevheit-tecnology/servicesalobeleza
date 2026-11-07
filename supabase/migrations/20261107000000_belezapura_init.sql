-- ==============================================================================
-- Schema Oficial BelezaPura - Instalação Limpa do Zero (Supabase: yugrmyjvespydrggutvo)
-- ==============================================================================

-- 0. Limpeza prévia de tabelas antigas (Garante execução limpa sem conflitos)
DROP TABLE IF EXISTS payments, products, admin_audit_logs, system_settings, appointments, services, professionals, clients, subscriptions, plans, users, salons, schema_migrations CASCADE;
DROP FUNCTION IF EXISTS validate_appointment_tenant() CASCADE;

-- Extensões necessárias para UUIDs, exclusão anti-conflito (btree_gist) e criptografia de senhas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tabela de Controle de Migrações (Exigida pela API Go)
CREATE TABLE schema_migrations (
    version text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Tabela de Salões / Estabelecimentos
CREATE TABLE salons (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text UNIQUE NOT NULL,
    name text NOT NULL,
    document text,
    phone text,
    pix_key text,
    pix_name text DEFAULT '',
    logo text,
    cover text,
    gallery text,
    main_color text,
    schedule_raw text,
    timezone text NOT NULL DEFAULT 'America/Sao_Paulo',
    blocked_dates text NOT NULL DEFAULT '[]',
    address_zip_code text NOT NULL DEFAULT '',
    address_street text NOT NULL DEFAULT '',
    address_number text NOT NULL DEFAULT '',
    address_district text NOT NULL DEFAULT '',
    address_city text NOT NULL DEFAULT '',
    address_state text NOT NULL DEFAULT '',
    instagram text NOT NULL DEFAULT '',
    deposit_policy text NOT NULL DEFAULT 'required',
    deposit_type text NOT NULL DEFAULT 'percentage',
    deposit_value decimal(10,2) NOT NULL DEFAULT 20.00,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz,
    CONSTRAINT salons_deposit_configuration CHECK (
        deposit_policy IN ('required', 'optional', 'none')
        AND deposit_type IN ('percentage', 'fixed')
        AND deposit_value > 0 AND deposit_value <= 99999999
        AND (deposit_type <> 'percentage' OR deposit_value <= 100)
    )
);

CREATE INDEX idx_salons_deleted_at ON salons(deleted_at);
CREATE INDEX idx_salons_document ON salons(document);

-- 3. Tabela de Usuários (Donos de Salão e Administradores)
CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_provider text NOT NULL DEFAULT 'local',
    token_version integer NOT NULL DEFAULT 0,
    email text UNIQUE NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    role text DEFAULT 'owner',
    status text DEFAULT 'active',
    salon_id uuid REFERENCES salons(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz,
    CONSTRAINT users_auth_provider_valid CHECK (auth_provider IN ('local', 'supabase'))
);

CREATE INDEX idx_users_deleted_at ON users(deleted_at);

-- 4. Tabela de Clientes do Salão
CREATE TABLE clients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    name text NOT NULL,
    phone text,
    status text DEFAULT 'active',
    last_visit timestamptz,
    visits integer DEFAULT 0,
    total_spent decimal(10,2) DEFAULT 0.00,
    tags text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz
);

CREATE INDEX idx_clients_deleted_at ON clients(deleted_at);
CREATE INDEX idx_clients_salon_id ON clients(salon_id);

-- 5. Tabela de Profissionais
CREATE TABLE professionals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    name text NOT NULL,
    phone text,
    specialty text,
    avatar text,
    commission decimal(5,2) DEFAULT 0.00,
    status text DEFAULT 'active',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz
);

CREATE INDEX idx_professionals_deleted_at ON professionals(deleted_at);
CREATE INDEX idx_professionals_salon_id ON professionals(salon_id);

-- 6. Tabela de Serviços
CREATE TABLE services (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    name text NOT NULL,
    category text NOT NULL DEFAULT '',
    price decimal(10,2) NOT NULL DEFAULT 0.00,
    duration integer NOT NULL DEFAULT 30,
    status text DEFAULT 'active',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz
);

CREATE INDEX idx_services_deleted_at ON services(deleted_at);
CREATE INDEX idx_services_salon_id ON services(salon_id);

-- 7. Tabela de Agendamentos (com checagem de sobreposição e intervalo)
CREATE TABLE appointments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    client_id uuid NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    professional_id uuid NOT NULL REFERENCES professionals(id) ON DELETE RESTRICT,
    service_id uuid NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    date timestamptz NOT NULL,
    ends_at timestamptz NOT NULL,
    deposit decimal(10,2) NOT NULL DEFAULT 0.00,
    value decimal(10,2) NOT NULL DEFAULT 0.00,
    payment_method text,
    status text DEFAULT 'waiting',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz,
    CONSTRAINT appointment_positive_interval CHECK (ends_at > date),
    CONSTRAINT appointments_deposit_valid CHECK (deposit >= 0 AND deposit <= value),
    CONSTRAINT appointment_no_overlap EXCLUDE USING gist (
        professional_id WITH =,
        tstzrange(date, ends_at, '[)') WITH &&
    ) WHERE (deleted_at IS NULL AND status <> 'cancelled')
);

CREATE INDEX idx_appointments_deleted_at ON appointments(deleted_at);
CREATE INDEX idx_appointments_salon_date ON appointments(salon_id, date) WHERE deleted_at IS NULL;

-- Trigger para proteção de Tenant (segurança multi-tenant)
CREATE OR REPLACE FUNCTION validate_appointment_tenant() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM clients WHERE id = NEW.client_id AND salon_id = NEW.salon_id AND deleted_at IS NULL)
    OR NOT EXISTS (SELECT 1 FROM services WHERE id = NEW.service_id AND salon_id = NEW.salon_id AND deleted_at IS NULL)
    OR NOT EXISTS (SELECT 1 FROM professionals WHERE id = NEW.professional_id AND salon_id = NEW.salon_id AND deleted_at IS NULL)
    THEN
        RAISE EXCEPTION 'appointment tenant mismatch' USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER appointment_tenant_guard 
BEFORE INSERT OR UPDATE OF salon_id, client_id, service_id, professional_id 
ON appointments 
FOR EACH ROW EXECUTE FUNCTION validate_appointment_tenant();

-- 8. Tabela de Planos da Plataforma
CREATE TABLE plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    price decimal(10,2) NOT NULL DEFAULT 0.00,
    period text DEFAULT '/mês',
    highlight boolean DEFAULT false,
    features text,
    max_professionals integer DEFAULT 0,
    max_subscriptions integer DEFAULT 0,
    color text DEFAULT '#000000',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz
);

-- 9. Tabela de Assinaturas dos Salões
CREATE TABLE subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    plan_id uuid NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    status text DEFAULT 'TRIAL',
    price decimal(10,2) NOT NULL DEFAULT 0.00,
    trial_ends timestamptz,
    current_period_end timestamptz,
    pending_plan_id text,
    payment_reference text,
    requested_price decimal(10,2),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz
);

CREATE INDEX idx_subscriptions_salon_created ON subscriptions(salon_id, created_at DESC) WHERE deleted_at IS NULL;

-- 10. Configurações Globais do Sistema
CREATE TABLE system_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_name text DEFAULT 'BelezaPura',
    domain text DEFAULT 'belezapura.com.br',
    support_email text DEFAULT 'contato@belezapura.com.br',
    trial_days integer DEFAULT 14,
    default_plan_id text,
    updated_at timestamptz DEFAULT now()
);

-- 11. Auditoria do SuperAdmin
CREATE TABLE admin_audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    action text NOT NULL,
    user_id text,
    user_name text,
    resource text NOT NULL,
    detail text NOT NULL,
    level text DEFAULT 'info',
    created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX idx_audit_logs_level ON admin_audit_logs(level);
CREATE INDEX idx_audit_logs_created ON admin_audit_logs(created_at);

-- 12. Produtos e Controle de Estoque
CREATE TABLE products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    name text NOT NULL,
    category text,
    quantity integer NOT NULL DEFAULT 0,
    minimum integer NOT NULL DEFAULT 0,
    price decimal(10,2) NOT NULL DEFAULT 0.00,
    internal_use boolean DEFAULT false,
    for_sale boolean DEFAULT true,
    version integer NOT NULL DEFAULT 1,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT product_nonnegative CHECK (quantity >= 0 AND minimum >= 0 AND price >= 0)
);

CREATE INDEX idx_products_salon_id ON products(salon_id);

-- 13. Pagamentos de Assinatura
CREATE TABLE payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id uuid NOT NULL,
    reference text UNIQUE NOT NULL,
    amount decimal(10,2) NOT NULL,
    approved_by text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- 14. Inserção dos Planos Padrão do BelezaPura
INSERT INTO plans (id, name, price, period, highlight, features, max_professionals, color)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Essencial', 59.90, '/mês', false, '["1 profissional","Página exclusiva","Agendamento online","Pix com conferência manual","Controle de atendimentos"]', 1, '#B8614A'),
    ('a0000000-0000-0000-0000-000000000002', 'Studio', 119.90, '/mês', true, '["Tudo do Essencial","Até 5 profissionais","Painel financeiro","Estoque por salão","14 dias de teste grátis"]', 5, '#E11D48'),
    ('a0000000-0000-0000-0000-000000000003', 'Elite', 319.09, '/mês', false, '["Tudo do Studio","Profissionais ilimitados","Estoque por salão"]', 0, '#8B5CF6')
ON CONFLICT (id) DO NOTHING;

-- 15. Inserção das Configurações do Sistema
INSERT INTO system_settings (id, platform_name, domain, support_email, trial_days)
VALUES ('b0000000-0000-0000-0000-000000000001', 'BelezaPura', 'belezapura.com.br', 'contato@belezapura.com.br', 14)
ON CONFLICT (id) DO NOTHING;

-- 16. Registro das versões de migração (exigido pelo CheckSchema da API Go)
INSERT INTO schema_migrations (version) VALUES 
    ('001_baseline'),
    ('002_booking_integrity.sql'),
    ('003_auth_provider.sql'),
    ('004_onboarding_details.sql')
ON CONFLICT (version) DO NOTHING;

-- 17. Criação do Usuário SuperAdmin Inicial
INSERT INTO users (id, auth_provider, email, password, name, role, status)
VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'local',
    'admin@belezapura.com.br',
    crypt('AdminBelezaPura2026!', gen_salt('bf', 10)),
    'Administrador Geral',
    'superadmin',
    'active'
)
ON CONFLICT (email) DO NOTHING;
