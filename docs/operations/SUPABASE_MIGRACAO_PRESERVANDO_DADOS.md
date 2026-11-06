# Migração do Supabase preservando dados

Avaliação de 06/11/2026. Destino confirmado pelo usuário: projeto `yugrmyjvespydrggutvo`, nome `beautifullcare`, região `us-west-2`, estado `ACTIVE_HEALTHY`.

## Inventário remoto verificado

| Origem | Quantidade | Tratamento proposto |
| --- | ---: | --- |
| `public.tenants` | 2 | Copiar para `belezapura.salons`, mantendo UUID e nome; novo slug estável por UUID |
| `public.profiles` / `auth.users` | 2 / 2 | Preservar originais; integrar a API ao Supabase Auth conforme decisão do usuário |
| `public.professionals` | 1 | Copiar UUID, tenant e nome; mapear `active` para status; foto para avatar |
| `public.services` | 1 | Copiar UUID, tenant, nome, preço e duração; mapear status |
| `public.customers` | 0 | Mapear para clients somente após nova auditoria no corte |
| `public.appointments` | 0 | Não há agenda atual a converter; interromper procedimento se surgir algum registro |
| `public.availability_blocks` | 0 | Não inventar disponibilidade; configurar horários antes de abrir reservas |

Auditoria agregada sem leitura de nomes, e-mails ou senhas: zero perfis sem tenant, referências órfãs, serviços inválidos ou agendamentos inconsistentes nas verificações de `supabase-preservation-audit.sql`. Isso não é auditoria completa de segurança/RLS. Há políticas de acesso existentes que devem permanecer associadas ao legado.

IPv4 `0.0.0.0/0` e IPv6 `::/0` já permitem os intervalos Outbound informados pelo usuário. Nenhuma alteração de allowlist foi feita. O projeto histórico configurado na API é diferente e não aparece na conta autenticada; o Render deve ter sua conexão real conferida antes da troca.

## Estratégia recomendada

Criar a estrutura da API em schema separado `belezapura`, mantendo `public` e `auth` intactos. Não executar o `AutoMigrate` atual diretamente sobre as tabelas legadas de nomes coincidentes: `professionals`, `services` e `appointments` são incompatíveis.

Manter os UUIDs e vínculos de salão na cópia. Campos sem correspondente na API, como descrição/categoria/foto de serviço e observações de cliente, continuam preservados no legado; isso não significa que estarão disponíveis na nova interface. Sua incorporação ao produto exige mapeamento específico. Não remover ou renomear tabelas existentes.

O ensaio usa `search_path=belezapura,public`, mas produção exige papel próprio com privilégios mínimos, sem permissão de alterar `public`/`auth`, sem acesso pelos papéis públicos do PostgREST ao novo schema e sem CREATE para papéis não confiáveis nos schemas do caminho. Conferir resolução da extensão `btree_gist`, dos gatilhos e de suas dependências. Não incluir o novo schema nas APIs públicas do Supabase por conveniência.

O usuário escolheu preservar Supabase Auth e adaptar a API. O adaptador foi implementado localmente: autenticação no provedor, confirmação de identidade por `/user` e autorização por usuário/salão/papel no banco da API a cada requisição. A migração `003_auth_provider.sql` permite marcar somente as contas provisionadas como externas, mantendo contas locais existentes. Não copiar hashes, criar senha padrão, elevar perfis a superadmin ou conceder assinatura paga. As contas externas precisam ser provisionadas com UUID de `auth.users` e vínculo revisado antes do corte. Login real, provisionamento e migração remota permanecem pendentes; detalhes e limites em `RENDER_API.md`.

## Evidência local executada

Banco descartável `belezapura_schema_rehearsal_20261106`, PostgreSQL em Docker, somente dados sintéticos. O fixture reproduz os três nomes conflitantes; não reproduz integralmente o Supabase, as políticas ou a autenticação gerenciada.

1. Carregado `supabase-schema-rehearsal.sql`.
2. Executado o comando real `go run ./cmd/migrate` com caminho `belezapura,public`: código 0.
3. Repetido o comando: código 0; versões `001_baseline` e `002_booking_integrity.sql`, 13 tabelas novas.
4. Comparado dump de `public` antes/depois, desconsiderando somente o nonce aleatório de `pg_dump`: conteúdo idêntico, SHA-256 `aed7d6ff5a9a0cba5ffb0f3973f74c53a6a676980cdd4ff7fe1aa4102de16684`.
5. Executado `supabase-import-rehearsal.sql`: uma cópia de salão, profissional e serviço; asserções de IDs, vínculos, nomes, duração e preço aprovadas, código 0. Primeira tentativa identificou cast texto/UUID incompatível e sofreu rollback; versão corrigida usa UUID.

Os dois arquivos de ensaio são exclusivamente locais e não constituem migração de produção. O ensaio não comprova backup/restauração remoto, permissões de produção, compatibilidade de autenticação ou fluxo financeiro.

## Sequência para execução remota

1. Obter acesso administrativo ao Render e conferir serviço, revisão, banco real e configuração; não imprimir segredos.
2. Provisionar os vínculos Supabase escolhidos pelo usuário; definir administrador proprietário, horários e política de assinatura dos salões existentes. Não ativar pagamentos ou enviar e-mails sem autorização específica.
3. Fazer backup privado verificável de schema e dados, incluindo dependências de identidade, políticas, funções e metadados necessários; conferir restauração isolada. O inventário agregado não é backup.
4. Congelar escritas do aplicativo legado durante cópia e validação; repetir auditoria e abortar se inventário/schema diferirem. Produzir manifesto de contagens e IDs antes/depois sem dados pessoais nos documentos versionados.
5. Criar schema e papéis mínimos, aplicar migrações explicitamente e importar por transação. Sem `DROP`, `TRUNCATE` ou atualização de `auth.users`; preservar originais.
6. Validar papéis/permissões, isolamento entre salões, login das contas existentes, horários, plano, estoque e reserva. Conferir contagens e campos, não apenas HTTP 200.
7. Publicar API em prévia com conexão e caminho corretos, CORS da prévia e `/health` identificando a revisão. Validar integração web antes de avaliar domínio de produção.
8. Liberar um único fluxo de escrita após aprovação dos critérios. Manter o legado preservado e documentar retenção. Se houver escritas novas, voltar a conexão para o legado exige reconciliação; não apresentar essa troca como rollback sem perda.

Nenhuma tabela, conta, política ou dado de negócio remoto foi alterado nesta avaliação. Não houve implantação da API nem troca da conexão do Render.
