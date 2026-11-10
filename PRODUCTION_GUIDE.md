# Operação de produção — BelezaPura

Atualizado em 09/11/2026 com verificação remota.

- Frontend: https://servicesalobeleza.vercel.app (Vercel).
- API Go: https://belezapura-api.vercel.app (Vercel Function, região iad1).
- Banco: Supabase, projeto `yugrmyjvespydrggutvo`, schema `public` verificado nesta data.
- Render: removido pelo proprietário; o fluxo web validado não depende dele.
- Frontend: `VITE_API_URL=https://belezapura-api.vercel.app`, sem `/api` ao final. Essa variável é incorporada na compilação.

## Migrações

Não execute `20261107000000_belezapura_init.sql` sobre um banco existente: é um script destrutivo de instalação limpa, com DROP de tabelas. Ele não é um procedimento de atualização.

A correção aditiva `supabase/migrations/20261109000000_fix_onboarding_whatsapp.sql` foi aplicada em produção em 09/11/2026. Ela adiciona as colunas e tabela da migração Go 005 e registra a versão, sem apagar dados. WhatsApp permanece desativado por padrão.

Para próximas versões da API, confira as migrações embarcadas e execute explicitamente `go run ./cmd/migrate` no banco e schema corretos antes de publicar. O servidor não deve migrar o banco ao iniciar. A verificação local `CheckSchema` agora exige todas as migrações embarcadas; essa prevenção ainda precisa de publicação da API.

## Verificação

Consulte `/health`, `/api/public/plans` e valide cadastro, login e consulta autenticada do salão com uma conta de teste controlada. Ready da Vercel e health isolados não certificam o cadastro.

Evidência da correção: [cadastro em 09/11/2026](docs/validation/2026-11-09-cadastro-vercel.md).

A validação desta correção não certifica automação WhatsApp, entrega de mensagens, cobrança nem recuperação de backup gerenciado. O antigo guia Docker não descrevia a API efetivamente publicada.
