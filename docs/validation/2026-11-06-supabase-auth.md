# Supabase: preservação e autenticação

Destino confirmado: `yugrmyjvespydrggutvo`. Decisão do usuário: preservar Supabase Auth e adaptar a API. Não houve migração remota, alteração de contas ou implantação da API.

## Entrega local

- Inventário e verificações agregadas remotas: `supabase-preservation-2026-11-06.json`; consulta reproduzível `../operations/supabase-preservation-audit.sql`.
- Plano: `../operations/SUPABASE_MIGRACAO_PRESERVANDO_DADOS.md`; criação em schema separado e preservação de `public`/`auth`.
- Ensaio sintético: migrações aplicadas/reaplicadas; dump do legado idêntico antes/depois; importação de IDs, vínculos e valores aprovada. Não é restauração de backup real.
- Adaptador HTTP Supabase com HTTPS, timeout de 5s, limite de resposta de 1MiB e bloqueio de redirecionamentos. Usa chave publicável/anon, rejeita chaves secret/service_role reconhecidas. Não imprime respostas privadas do provedor.
- Login de conta externa confirma UUID e e-mail; chamadas protegidas consultam a identidade no provedor e permissões locais. Não provisiona contas a partir de JWT/metadados. Contas locais mantidas; token local de conta convertida é rejeitado.
- Migração explícita `003_auth_provider.sql`; schema obrigatório atualizado. Não roda no startup nem converte usuários existentes automaticamente.
- Painel rejeita alteração de e-mail/senha de conta externa; não declara uma mudança inexistente no Supabase.

Endpoints conferidos na [documentação oficial Auth](https://supabase.github.io/auth/) e no [guia JWT](https://supabase.com/docs/guides/auth/jwts).

## Validação executada

PostgreSQL local descartável `belezapura_supabase_auth_test`, provedor de identidade simulado por HTTPS. Nenhuma credencial de usuário real usada. Comando final:

```sh
TEST_DATABASE_URL='<conexão local descartável>' go test -race -count=1 ./...
```

Código 0, saída dos pacotes:

```text
ok  belezapura_go_api                     7.223s
ok  belezapura_go_api/internal/db         6.516s
ok  belezapura_go_api/internal/handler    4.437s
ok  belezapura_go_api/internal/identity   3.431s
ok  belezapura_go_api/internal/middleware 5.922s
```

Cobertura nova: senha correta/incorreta no provedor simulado; UUID divergente com mesmo e-mail; metadados com superadmin ignorados; token de outro projeto; token recusado pelo provedor; token local antigo de conta convertida; bloqueio e exclusão locais; indisponibilidade 503; alteração indevida de credencial externa; ausência de provisionamento automático; URL insegura, chaves privilegiadas, redirecionamento e resposta inválida. Regressões anteriores de reservas, assinatura e isolamento incluídas no comando.

`go vet ./...` e `git diff --check`: código 0.

## Pendências para o destino

Backup/restauração privados verificáveis, papéis e privilégios do novo schema, provisionamento dos dois vínculos externos, administrador/horários/assinatura, conexão administrativa Render e revisão saudável da API. Login real das duas contas e integração publicada ainda não foram validados.

O adaptador suporta o login por senha já usado pelos clientes. Não implementa OAuth, MFA, refresh automático ou logout global. O access token precisa ser renovado por novo login nos clientes atuais. A consulta de usuário não garante revogação instantânea de JWT por logout; validar política de sessão antes da ativação. Não atribuir os resultados de carga anteriores à latência real de chamadas Supabase, que não fez parte daquele ensaio.
