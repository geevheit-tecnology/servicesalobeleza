# Correção do cadastro — 09/11/2026

## Diagnóstico confirmado

API publicada em https://belezapura-api.vercel.app, projeto Vercel `belezapura-api`, deploy `dpl_ACHEj7xDjxSkenFTXHcRRWbLrX7f`, função Go em iad1. `/health` HTTP 200 e planos disponíveis. Render não participa desse endpoint.

O modelo Salon já enviava `whatsapp_enabled` e `whatsapp_monthly_limit`, mas ambas as colunas estavam ausentes em `public.salons`. O banco registrava somente as versões 001–004. A verificação de inicialização também só exigia essas quatro versões, permitindo iniciar com a 005 pendente.

O mesmo payload sintético reproduziu `HTTP 500`, `{"error":"Erro ao criar salão."}` antes da intervenção.

## Correção aplicada no Supabase

Executada `supabase/migrations/20261109000000_fix_onboarding_whatsapp.sql`: transação explícita, trava de migração, adição idempotente das duas colunas, criação de `whatsapp_usages` e registro de `005_whatsapp_quota.sql`. Sem executar o instalador destrutivo, sem ativar WhatsApp, sem enviar mensagens.

No código local, `CheckSchema` passa a comparar o banco com todas as migrações embarcadas, evitando esquecer novas versões na lista fixa. Essa proteção local não foi publicada nesta sessão. A correção operacional do banco já atende a API publicada, sem novo deploy.

## Evidências

- Mesmo POST `/api/public/onboarding`: **HTTP 201** após a migração, token e slug presentes.
- Login da conta sintética: **HTTP 200**.
- GET autenticado `/api/salon/details`: **HTTP 200**, 1 serviço, 1 profissional e assinatura `TRIAL`.
- Registros sintéticos de assinatura, serviço, profissional, usuário e salão removidos por IDs exatos após a validação, em transação. Nenhuma conta real usada.
- `go test ./...`: código 0; principal 3.661s, db 0.972s, handler 1.709s, identity 0.476s, middleware 2.681s. Testes que exigem `TEST_DATABASE_URL` foram pulados nesta execução; não representa integração local completa.
- Primeira execução Go bloqueada pelo cache do macOS no sandbox; repetição autorizada fora dele aprovada.

Validação remota feita por HTTP; não foi executada uma nova passagem de navegador pelas sete telas. Até o fim da validação não houve publicação. Commit e push foram autorizados pelo usuário na sequência; isso não equivale a um novo deploy. Os logs históricos da Vercel não retornaram registros nesta consulta; a causa foi confirmada pela estrutura do banco e pelo antes/depois com o mesmo payload.
