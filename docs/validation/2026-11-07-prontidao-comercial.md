# Revisão de prontidão comercial — 07/11/2026

Objetivo: preparar uso real em segunda-feira, 09/11/2026. Preservar Supabase e dados existentes. Esta revisão ainda não comprova liberação comercial.

## Alterações

- `belezapura_web/src/pages/Marketing.tsx`: textos centrais alinhados ao requisito; exemplos de clientes identificados como fictícios; Pix do mockup identificado como exemplo que não deve ser pago; ausência de automação WhatsApp explícita; confirmação condicionada à conferência do salão; cálculo apresentado como estimativa.
- `belezapura_web/src/pages/Contact.tsx`: formulário não envia nem persiste mensagens. Textos agora explicam que prepara um e-mail, que deve ser enviado pelo leitor de e-mail. Sem integração externa nova.
- `belezapura_web/e2e/marketing.spec.ts`: verificação de landing, calculadora em duas larguras, ausência de transbordamento, erros JavaScript e contato sem falso recebimento.
- `TASKS.md`: evidências atuais e pendências separadas da execução anterior.

Após autorização explícita do usuário para corrigir o cadastro completo, o escopo foi ampliado:

- `Onboarding.tsx`: envia endereço, Instagram, contatos, favorecido e configuração de sinal; normaliza chaves Pix conforme o tipo; valida etapas; o link exclusivo só é divulgado após o backend gerar o slug real. Planos carregados e selecionados por ID real.
- `ConfiguracoesView.tsx`: permite consultar e editar endereço, contato, favorecido e política de sinal após o cadastro.
- `ClientView.tsx`: apresenta endereço/contato e a política cadastrada; permite dispensar sinal opcional; usa o valor retornado pela API após reservar; remove nota fixa 5.0 e políticas não configuradas de atraso/cancelamento.
- `PlanCatalog.tsx`: oferta somente planos da API com preço, limite e ID efetivos; falha explícita se o catálogo estiver indisponível.
- API: persiste campos do cadastro, categorias e telefone privado da profissional; interpreta duração `1h30`/`1:30`/minutos e rejeita preço inválido; valida sinal fixo/percentual e registra o valor na reserva. Sinal obrigatório não pode ser removido pelo payload da cliente. Sinal fixo nunca supera o preço do serviço. A configuração e o preço são lidos sob bloqueio na transação de reserva; alterações de configuração usam o mesmo bloqueio de salão. A confirmação continua manual. Telefone privado da profissional não é exposto na página pública.
- `004_onboarding_details.sql`: migração aditiva explícita; contas existentes recebem sinal padrão de 20%, mantendo o comportamento anterior. Sem remoção de tabelas ou dados. O servidor exige a versão 004 antes de iniciar.
- `onboarding_configuration_test.go`: persistência, política obrigatória/opcional/sem sinal, percentual, teto do valor fixo, rejeição de entradas inválidas e proteção do telefone privado.
- `onboarding.spec.ts`: cadastro com endereço e telefone, duração de 1h30, sinal fixo, novo login, configuração persistente e reservas nos três modos.
- `subscriptions.spec.ts`: espera a resposta de solicitação antes de consultar a assinatura; corrige corrida no próprio teste.
- `recovery_test.go`: verifica restauração sem executar migrações nem seeds; permite comparar contagens exatas do manifesto para conjuntos menores, preservando o requisito padrão do conjunto de carga.

Fórmula da calculadora, autenticação e formato EMV/CRC do Pix foram preservados. Nenhum banco remoto, caminho de rota, cálculo de comissão ou configuração da Vercel foi alterado.

## Verificação local executada

PostgreSQL 17 descartável exclusivo `belezapura-release-20261107`, porta local 55437, banco `belezapura_release_test`. Credenciais e contas sintéticas. API 3051; frontend compilado servido pelo Vite preview em 5175.

- `npm run build`: aprovado, TypeScript obrigatório e Vite 8.3.5. Primeiro ensaio no sandbox falhou no chaveiro macOS; repetição fora dele aprovada. Para navegador foi compilado com `VITE_API_URL=http://127.0.0.1:3051`; esse artefato local não deve ser publicado como produção.
- `go test -race -count=1 -v ./...`: aprovado; `TestIntegration` 5.35s, `TestTenantReadAndPublicBoundaries` 1.51s, `TestSupabaseIdentityIntegration` 0.37s; pacote principal 13.582s. Integração Supabase usa provedor simulado, não login real.
- `go vet ./...`: aprovado, sem diagnósticos.
- Formatação: 240 verificações com equipes 0/1/3/10, tickets 0/1/85/120.55/1000 e faltas 0/1/4/10; três resultados monetários por combinação. `424.1` produz `R$ 424,10`. A equipe não participa da fórmula existente; o controle na UI admite 1 a 12 profissionais e foi preservado.
- Playwright `subscriptions.spec.ts`: **5 passed (18.3s)**. Estoque persistido/isolado, horário bloqueado, reserva pública/Pix pendente, assinatura com aprovação manual e suspensão, painel móvel.
- Playwright `marketing.spec.ts`: **3 passed (10.0s)**. Landing/calculadora em 390/1440 px e contato. Um seletor inicialmente ambíguo no teste desktop foi corrigido; repetição aprovada.

## Validação final após ampliação autorizada

- `go test -race -count=1 -v ./...`: código 0; `TestIntegration` 3.67s; `TestTenantReadAndPublicBoundaries` 0.38s; `TestOnboardingConfiguration` 1.21s; `TestSupabaseIdentityIntegration` 0.22s; pacote principal 8.786s. Provedor Supabase permanece simulado nessa integração.
- `npm run build`: código 0 com TypeScript e Vite.
- `go vet ./...`: código 0.
- `npm audit --omit=dev`: `found 0 vulnerabilities`.
- Playwright completo: **11 passed (46.4s)** na versão compilada local. Dois cenários de catálogo usam respostas simuladas para verificar erro e fidelidade ao contrato; cadastro, reservas, estoque, assinatura e configuração usam API e PostgreSQL reais locais com dados sintéticos.
- A primeira execução ampliada identificou seletor sem nome acessível estável e corrida no teste de assinatura. Nomes acessíveis e espera por HTTP 202 foram corrigidos; suíte completa repetida e aprovada.
- Backup `pg_dump -Fc`, restauração em `belezapura_release_restore_test`: 13 tabelas com contagens e hashes de conteúdo idênticos. Manifesto sem registros pessoais: [origem/restaurado](2026-11-07-restore-manifest.json).
- Primeiro verificador de restauração exigia os 50 salões/15 mil agendamentos do ensaio anterior e rejeitou o conjunto atual de 29 salões/28 agendamentos. A verificação agora exige contagens exatas declaradas da origem para esse conjunto e não repara o banco antes de validá-lo. Execução com `VERIFY_RESTORE=1 RESTORE_EXPECTED_SALONS=29 RESTORE_EXPECTED_APPOINTMENTS=28`: **PASS**, API saudável e relações íntegras.

Carga sustentada no destino e restauração gerenciada remota não foram executadas nesta revisão.

## Verificação remota somente leitura

- Site `https://servicesalobeleza.vercel.app`: HTTP 200.
- API histórica `https://servicesalobeleza-5pjc.onrender.com/health`: timeout de 45s, zero bytes. O usuário forneceu serviço Render `srv-davihg5g1s2s73alboag`; vínculo com essa URL ainda precisa ser confirmado pelo acesso administrativo.
- Supabase: CLI autenticada, projeto `yugrmyjvespydrggutvo` / `beautifullcare` / `us-west-2` em estado `ACTIVE_HEALTHY`.
- Inventário agregado atual: 3 tenants, 1 profile, 1 usuário Auth, 1 profissional, 1 serviço, 0 agendamentos; schema `belezapura` ausente. As contagens divergem do inventário de 06/11, portanto o plano de importação antigo não deve ser executado sem revisão.

Auditoria remota somente leitura repetida: zero referências órfãs nas verificações de perfis, serviços, profissionais e clientes; zero serviços/agendamentos inválidos e zero vínculos cruzados de agendamento. O arquivo completo de estrutura permanece privado na pasta temporária da sessão.

Vercel: sessão autenticada; produção atual identificada como `dpl_BuqksJ5RFSCFLAe7uiRbft2GfTJK`, Ready de 07/11/2026 01:28 -03, com alias `servicesalobeleza.vercel.app`. Esse deploy é anterior às correções desta revisão e não certifica a API. Raiz local `.vercel` aponta para `servicesalobeleza`; o vínculo dentro de `belezapura_web` aponta para outro projeto e não deve ser usado para esta entrega.

Nenhuma alteração remota de negócio, migração ou envio de mensagem foi realizado nesta revisão. Publicação de prévia é registrada separadamente quando concluída.

## Backup Supabase e ensaio com a cópia real

A sessão da CLI permitiu obter backups SQL de estrutura e dados dos schemas `public`, `auth` e `storage`. Arquivos privados fora do repositório, modo `0600`, na pasta temporária local. [Evidência agregada e hashes dos arquivos](2026-11-07-supabase-backup.json).

Restauração realizada em banco exclusivo `belezapura_supabase_verified_test`, PostgreSQL 17 local. Contagens e hashes de todas as linhas coincidiram em **42 das 44 tabelas**, incluindo todos os dados de negócio e as contas de identidade. Duas tabelas internas da plataforma (`auth.schema_migrations`, 82 registros, e `storage.migrations`, 80) ficaram vazias no dump de dados da CLI; não tratar como cópia integral do estado gerenciado. O projeto não tem objetos de arquivo em `storage.objects`, portanto não houve arquivo binário a copiar nesse inventário.

Primeiras tentativas na imagem Supabase local esbarraram nas permissões dos papéis administrativos e no papel `dashboard_user`. O ensaio conclusivo usou PostgreSQL 17 descartável com os papéis referenciados pelo dump. Estrutura e dados foram carregados com `ON_ERROR_STOP=1` e código 0. Isso prova a restauração SQL local no escopo descrito, sem certificar os serviços gerenciados de Auth/Storage nem a política de recuperação do provedor.

Sobre essa cópia privada local, foi criado somente o schema `belezapura` e executado o comando real `go run ./cmd/migrate` com `search_path=belezapura,public`: código 0, versões 001–004. O comando foi repetido com código 0, confirmando idempotência. Os hashes/contagens dos 42 conjuntos de dados legados permaneceram iguais ao remoto. Nenhum import de conta, ativação de assinatura ou alteração de tabela remota foi feito.

Este backup local ainda exige cópia externa privada, retenção, verificação no ambiente gerenciado e atualização consistente no momento do corte. Não é rotina de backup de produção ativada.

## Prévia de revisão e Git

- Branch: `ajuste-posicionamento-revisao-20261107`.
- Backend: commit `288ff81`, cadastro persistente, política de sinal e verificação de restauração.
- Web: commit `91bcc01`, interface e testes aprovados.
- Prévia: https://servicesalobeleza-4rw2yhmfh-geevheits-projects.vercel.app
- Deploy: `dpl_AQbwJPBdeYqmiKtLvJp3Ndmazqv3`, `readyState: READY`, `target: null` (prévia), build remoto com TypeScript e Vite aprovado.
- Nenhuma promoção para produção nem alteração do alias principal. A prévia ainda usa a configuração da API existente; não comprova integração com o backend corrigido.
- A URL de prévia não foi acessada automaticamente após a publicação; a validação de navegador registrada foi local.

## Descobertas que exigem continuação

O usuário autorizou a correção completa do cadastro. Os campos identificados foram ligados ao payload/API e validados localmente. A nova migração 004 ainda precisa integrar o procedimento remoto de preservação e corte; a existência do código não prova aplicação no Supabase.

Busca de termos no código de produto: nenhuma referência textual de barbearia no frontend web. `Degradê` em `ClientView.tsx` é comentário sobre fundo visual. Duas telas legadas Flutter contêm exemplo `Barbearia Vintage`; aplicativo não foi alterado nem validado nesta revisão web.

## Ordem necessária para o corte

1. Obter acesso Render e confirmar serviço, revisão e banco efetivos.
2. Atualizar inventário e integridade Supabase, definir proprietário e vínculos de salões; obter backup privado e comprovar restauração isolada.
3. Revisar migração separada, privilégios mínimos e preservação do legado; não executar fixtures nem migrações automáticas na inicialização.
4. Validar API de prévia saudável, CORS e revisão; publicar frontend de prévia com endpoint correto.
5. Validar login real e fluxo completo com conta de homologação autorizada; confirmar titularidade/aceitação bancária do Pix e aprovação manual.
6. Confirmar capacidade no destino, backup programado e alertas recebidos; obter aprovação da prévia antes de produção conforme os requisitos.
