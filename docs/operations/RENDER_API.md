# Entrega da API no Render

Preparação local, ainda sem criação ou alteração de serviço remoto. A configuração em `render-api.example.yaml` é um exemplo de **prévia separada**, não um vínculo comprovado com `servicesalobeleza-5pjc.onrender.com`. Conferir serviço, repositório e branch após conectar o Render. O código local ainda precisa estar disponível na branch escolhida antes de um deploy baseado em Git.

O exemplo usa plano free para não selecionar um plano pago implicitamente. Ele não comprova capacidade de produção. Autodeploy está desabilitado no exemplo; importar o Blueprint e iniciar deploy continuam sendo ações remotas separadas.

## Comandos e revisão

- Raiz: `belezapura_go_api`.
- Build: `go build -trimpath -o server .`.
- Inicialização: `sh scripts/start-render.sh`.
- Saúde: `/health`, verificando status `ok` e a revisão esperada.

O script de inicialização usa `RENDER_GIT_COMMIT` para preencher `APP_REVISION` quando disponível e executa somente a API. Não executa seed nem migração. A aplicação já exige segredo JWT e schema compatível antes de aceitar tráfego.

O runtime Go nativo usa a versão estável disponibilizada pelo Render; não há pin por `GO_VERSION`. Conferir no log de build se a ferramenta atende ao mínimo `go 1.26.10` declarado no módulo. Se for necessário fixar a ferramenta exata, preparar e validar imagem Docker como etapa própria. [Referência oficial de runtimes](https://render.com/docs/language-support).

## Banco e ativação

1. Identificar o destino da API e o banco real sem expor credenciais em logs. Para prévia, usar banco isolado; não executar fixtures ou testes de carga no banco operacional.
2. No destino existente, fazer backup verificável e ensaiar restauração separada. Auditar assinaturas sem vencimento, relações cruzadas e sobreposições antes da migração, conforme `../OPERACAO_ASSINATURAS.md`.
3. Aplicar migrações explicitamente com credencial autorizada e registrar a versão. A API de runtime não precisa receber permissão de DDL para executar migrações ao iniciar.
4. Em banco novo de prévia, criar usuário/planos sintéticos pelo seed explícito. Não substituir usuários, planos ou pagamentos existentes. Usar credenciais de teste próprias e privadas.
5. Configurar `DATABASE_URL`, segredo JWT novo e `CORS_ORIGINS` com a origem exata da prévia. O exemplo já inclui a prévia web atual e o domínio informado. Uma nova URL de prévia pode exigir atualização explícita da lista.
6. Fazer o deploy da API e confirmar a revisão em `/health`. Só então construir outra prévia web com `VITE_API_URL` apontando para a API nova e executar o fluxo completo com conta sintética autorizada.

O exemplo não define `preDeployCommand`: a documentação do Render limita esse recurso a serviços pagos. Migrações continuam separadas da inicialização e não foram movidas para o build como contorno. [Referência oficial de deploy](https://render.com/docs/deploys).

Configurar health check HTTP é necessário para avaliar a API e o banco; aceitar a conexão TCP não prova esses dois componentes. O resultado esperado continua sendo `/health` com banco acessível e revisão correspondente. [Referência oficial de saúde](https://render.com/docs/health-checks).

## Rede informada pelo usuário

O usuário forneceu `74.220.48.0/24` e `74.220.56.0/24` e confirmou que vieram da aba Connect → Outbound do serviço Render atual. Esses intervalos podem ser necessários na allowlist do banco externo. Não substituem a URL da API nem autorizam acesso administrativo à conta. [Referência oficial de IPs de saída](https://render.com/docs/outbound-ip-addresses).

A configuração histórica usava outro projeto Supabase em São Paulo. Após login na CLI, o usuário confirmou como destino `yugrmyjvespydrggutvo` (`beautifullcare`, `us-west-2`). Esse destino está `ACTIVE_HEALTHY` e permite `0.0.0.0/0` e `::/0`; as duas faixas Render já estão incluídas. Nenhuma restrição foi alterada. A conexão realmente instalada no Render ainda precisa ser conferida.

## Contas Supabase existentes

O usuário escolheu preservar Supabase Auth. O adaptador local usa `SUPABASE_URL` (HTTPS, sem caminho) e `SUPABASE_PUBLISHABLE_KEY` (publicável ou anon legada; não usar service_role/secret). As duas variáveis são opcionais para contas locais; uma conta marcada como Supabase falha sem configuração válida, sem fallback para senha local.

Aplicar explicitamente a migração `003_auth_provider.sql`. Contas existentes não são convertidas por essa migração: recebem `local` por padrão. Provisionar as contas migradas com ID idêntico ao `auth.users.id`, vínculo de salão confirmado, `auth_provider='supabase'`, papel/status locais revisados e senha local inutilizável; não copiar hashes nem atribuir superadmin a partir de metadados. A importação remota ainda não foi executada.

O login da API encaminha a senha ao endpoint password do projeto configurado e devolve o access token Supabase após confirmar a identidade. Cada chamada protegida consulta `/auth/v1/user` e confere usuário ativo, provedor, salão e papel no banco da API. Timeout, erro do provedor e configuração ausente fecham o acesso. Não são retornados refresh tokens; ao expirar a sessão, os clientes atuais precisam entrar novamente. OAuth, MFA, renovação automática e logout global não foram implementados por esse adaptador. Consultar `/user` não constitui prova de revogação instantânea de todos os JWTs após logout; validar a política operacional do Supabase antes do corte.

As contas locais continuam com o fluxo anterior. O painel não altera senha/e-mail de conta externa, para evitar informar uma troca que não ocorreu no Supabase. A configuração ainda não foi aplicada ao Render nem validada com credenciais das contas reais. Plano e evidências: [migração preservando dados](SUPABASE_MIGRACAO_PRESERVANDO_DADOS.md). Endpoints conferidos na [documentação oficial do Auth](https://supabase.github.io/auth/) e na [documentação de JWTs](https://supabase.com/docs/guides/auth/jwts).

Se Supabase continuar sendo o destino e houver restrições de rede, consultar primeiro as regras atuais e acrescentar os intervalos autorizados sem remover as permissões existentes. A documentação informa que o update padrão substitui as regras e que restrições se aplicam tanto ao Postgres quanto ao pooler. Conferir suporte a append na ferramenta usada antes de aplicar uma mudança. [Referência oficial de restrições Supabase](https://supabase.com/docs/guides/platform/network-restrictions).

## Gates antes da produção

Conexão e serviço Render corretos, backup/restauração, migrações, segredos revogados/rotacionados, revisão saudável, CORS, login, agenda, assinatura aprovada/suspensa e monitoramento com recebimento real de alerta precisam de evidência no ambiente de destino. A prévia web Ready, um exemplo YAML ou build local não encerram esses gates.
