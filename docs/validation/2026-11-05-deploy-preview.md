# Retomada até o deploy — 05/11/2026

## Prévia web publicada

Projeto confirmado por `vercel project inspect servicesalobeleza`: `prj_e29ZclzBD6KD8cgyfljYm5UjJM9p`, equipe `geevheits-projects`, raiz `belezapura_web`, Node 24.x. O vínculo local raiz apontava para outro projeto e foi corrigido, sem relinkar o domínio de produção.

Preparado `.vercelignore` para excluir APIs, Flutter, banco do CodeGraph, caches, ambientes e relatórios do upload do projeto web. O primeiro empacotamento foi rejeitado por excluir a pasta raiz; corrigido antes do envio concluído. Upload final: 602,8 KB, 67 arquivos. Nenhum commit ou push foi necessário para a prévia.

Comando autorizado:

```text
vercel deploy -y --build-env VITE_API_URL=https://servicesalobeleza-5pjc.onrender.com
```

Resultado da Vercel, código 0:

```text
> tsc --noEmit && vite build
✓ 2493 modules transformed.
✓ built in 2.41s
Build Completed in /vercel/output [18s]
Deployment completed
readyState: READY
id: dpl_CpYYhYdwDj9KXAPdAkdWk3UdCPT9
url: https://servicesalobeleza-8dkoptd5t-geevheits-projects.vercel.app
```

Confirmado também por `vercel inspect`: target `preview`, status `Ready`, criada em 05/11/2026 às 22:02:24, horário de São Paulo. Não houve promoção ao domínio de produção. O build local foi reexecutado fora do sandbox após falha do chaveiro macOS no ambiente restrito: código 0, 2493 módulos, `built in 3.26s`.

A verificação nesta etapa usa o resultado do build/deploy e os metadados da Vercel. Não certifica os fluxos com a API remota. A prévia aponta para a API já existente; ela continuou sem responder a `/health` em 20s, embora o TLS tenha sido estabelecido em aproximadamente 60ms.

`vercel inspect https://servicesalobeleza.vercel.app` confirmou que o alias de produção permaneceu em `dpl_FpGFDc47uW7BaJ7VcmPK9tQfLxnm`, publicado em 17/10/2026. A prévia não substituiu esse alias.

## Diagnóstico de capacidade

Ampliado `capacity_test.go` para registrar contagem de erros por tipo/status, p95 e erros por rota e falhas durante leitura do corpo HTTP. Critérios preservados: zero erros, p95 de leitura até 1s e gravação até 2s. Não foram alterados os tempos do protocolo sustentado.

A nova regressão breve, com dados sintéticos no Docker local, terminou com código 1, sem erros HTTP/transporte, mas reprovou latência. Relatório: `capacity-deploy-diagnostic-2026-11-05.json`.

| Usuários | Requisições | Erros | p95 leitura | p95 gravação |
| --- | --- | --- | --- | --- |
| 10 | 68 | 0 | 1836,638 ms | sem escritas executadas |
| 25 | 151 | 0 | 2223,912 ms | sem escritas executadas |
| 50 | 1125 | 0 | 1975,697 ms | 360,271 ms |
| 100 | 698 | 0 | 4275,169 ms | 2150,656 ms |

Em 50 usuários, a listagem de agendamentos teve p95 de 3294,167ms. As etapas curtas iniciais não chegaram às escritas devido à lentidão; não servem como evidência de desempenho de gravação. O teste sustentado anterior continua reprovado e não foi substituído por esta regressão.

Medição separada de `SELECT 1`, com o mesmo teto de 20 conexões, somente no banco descartável:

| Concorrência | Consultas | Erros | p95 |
| --- | --- | --- | --- |
| 1 | 20 | 0 | 1,761 ms |
| 10 | 200 | 0 | 8,869 ms |
| 50 | 1000 | 0 | 19,308 ms |

Isso direciona a investigação, sem atribuir a causa final. Não comprova latência das consultas reais ou capacidade do host de produção. O relatório antigo de infraestrutura registrou carga do host de até 352,53 e nenhuma espera por trava no PostgreSQL; não há evidência para atribuir todos os erros anteriores ao código ou ao host.

Repetição com perfil de CPU, após estabilização do host: `TestCapacity` em modo breve passou, código 0, 67,07s de teste. Relatório separado `capacity-deploy-profile-2026-11-05.json`. p95 de leitura em 10/25/50/100 usuários: 87,640 / 190,432 / 933,319 / 681,865 ms; zero erros em todas as etapas. Em 50 usuários, a rota de agendamentos isolada ainda teve p95 de 1252,560ms, mesmo com o p95 agregado aprovado. Isso permanece visível no relatório, sem alterar o critério original.

O perfil coletou 19,80s de CPU em 67,18s. Entre os custos visíveis: chamadas de sistema 25,25%, `runtime.madvise` 10,81%, `runtime.kevent` 7,88% e codificação de structs JSON 9,70% cumulativos. Não foi identificado um único trecho da aplicação que explique sozinho a oscilação. O ensaio breve aprovado não substitui os 30 minutos sustentados reprovados.

Preparado banco descartável novo `belezapura_capacity_deploy_test` para repetir o protocolo completo sem os salões sintéticos acumulados das execuções anteriores. Nenhum dado existente foi apagado.

Ensaio completo iniciado às 22:10:30 em banco novo, acompanhado por `observe-capacity.py`. As rampas de um minuto com 10 e 25 usuários passaram sem erros, p95 de leitura de 88,871ms e 236,187ms, respectivamente. A etapa de 50 usuários/30 minutos e o pico de 100 usuários ainda estão em execução neste checkpoint; não há resultado final alegado. Relatórios novos: `capacity-deploy-full-2026-11-05.json` e `capacity-deploy-infra-2026-11-05.jsonl`.

Regressão Go executada antes do ensaio completo: `go test -race -count=1 ./...`, código 0; pacote principal aprovado em 10,429s e pacotes de banco, handlers e middleware também aprovados.

## Acesso ao backend e pendências

O usuário escolheu conectar o Render. O plugin foi localizado e a instalação/conexão foi solicitada; não há conexão confirmada nem ferramentas do Render disponíveis até este registro. Nenhuma credencial foi exibida ou enviada à API do Render. Não foram alterados serviços, banco ou variáveis remotos.

O objetivo completo permanece em andamento: diagnosticar a capacidade, obter acesso ao serviço da API, verificar backup/schema/segredos e concluir uma integração publicada comprovada. A prévia do frontend está publicada; isso não é liberação comercial da plataforma.

## Preparação da API durante a carga

Criados `belezapura_go_api/scripts/start-render.sh`, `docs/operations/render-api.example.yaml` e `docs/operations/RENDER_API.md`. O modelo define uma prévia separada, runtime Go, raiz `belezapura_go_api`, health check `/health`, autodeploy desabilitado e variáveis de ambiente sem credenciais reais. O script publica em `APP_REVISION` o `RENDER_GIT_COMMIT` disponível e executa o binário, sem DDL ou seeds.

Validações locais: `sh -n` aprovado; YAML lido pelo Ruby com conferência da raiz e do autodeploy; `git diff --check` aprovado. Não houve build adicional da API durante o ensaio de carga, importação do Blueprint, alteração de serviço ou criação de banco remoto. A estrutura não foi submetida ao validador autenticado do Render.

O modelo e os comandos foram conferidos na documentação oficial de [runtimes](https://render.com/docs/language-support), [Blueprints](https://render.com/docs/blueprint-spec), [deploy](https://render.com/docs/deploys) e [health checks](https://render.com/docs/health-checks). O runtime Go nativo não aceita pin de versão; o modelo não usa `GO_VERSION`. O recurso de pre-deploy é restrito a serviços pagos, por isso não foi usado no exemplo free e as migrações permanecem explícitas.

No checkpoint desta continuação, os processos de carga e coleta continuam confirmados vivos pelas sessões em execução. As rampas de 10 e 25 usuários permanecem aprovadas; a etapa sustentada ainda não produziu resultado consolidado. O Render continua sem ferramenta/conexão confirmada nesta sessão.

## Rede e autenticação do banco

O usuário informou `74.220.48.0/24` e `74.220.56.0/24` e confirmou que são os intervalos Outbound do serviço Render e que o banco atual continua no Supabase. O host histórico foi identificado sem imprimir URL completa ou credenciais: pooler Supabase em São Paulo.

A CLI Supabase 2.84.2 está instalada e oferece leitura de restrições e atualização com `--append`. A consulta somente de leitura ao projeto histórico não foi executada pelo provedor: a CLI retornou `Access token not provided`. Nenhuma allowlist foi modificada, nem a hipótese de bloqueio por IP foi comprovada.

O usuário solicitou instruções de acesso. Orientado a executar `supabase login` no próprio terminal e concluir a autenticação localmente, sem enviar tokens/senhas/códigos pelo chat. Após o login, consultar primeiro as regras atuais; qualquer acréscimo deve preservar a lista existente e usar somente os intervalos confirmados. A conexão administrativa do Render continua sendo uma pendência separada.

Última consulta pública adicional de `/health`: timeout de 20s sem resposta HTTP, TLS estabelecido em aproximadamente 66ms. No checkpoint das 22:38 de São Paulo, a carga e o coletor continuam confirmados vivos e há 92 amostras sem falha de coleta ou espera por trava no banco; ainda não há resultado final.


### Login Supabase e etapa sustentada concluída

O usuário concluiu `supabase login`. A sessão autenticada foi reconhecida em execução fora do sandbox. A consulta `network-restrictions get --experimental` ao projeto histórico retornou falta de privilégios. `projects list --output json` foi aprovado e retornou dois projetos visíveis, nenhum com o identificador histórico da API. Isso não comprova bloqueio por IP nem exclusão do projeto; a conta/organização ou a configuração atual podem ser diferentes. Solicitada a URL do painel do projeto atual para identificar o alvo antes de qualquer alteração. Nenhuma regra remota foi modificada.

A etapa local sustentada de 50 usuários terminou 1800 segundos com 84.196 requisições, zero erros, p95 de leitura de 282,392ms e escrita de 186,455ms. A rota de agendamentos teve p95 de 304,160ms; dashboard, 445,690ms. A etapa de pico com 100 usuários permanece em execução; o protocolo completo ainda não foi declarado aprovado. Esses números pertencem ao banco descartável e não comprovam capacidade de produção.


### Resultado final local e identificação do Supabase atual

`TestCapacity` terminou com código 0: PASS em 2227,79s (pacote 2229,442s), quatro etapas, 112.500 requisições e zero erros. No pico de 100 usuários/301,93s: 26.299 requisições, p95 de leitura 614,517ms e escrita 269,382ms. O dashboard isolado teve p95 de 1083,434ms; o critério agregado passou sem ocultar essa rota. Coletor terminou com código 0, 125 amostras, máximo de 21 conexões no banco incluindo a coleta, nenhuma espera por trava registrada. O resultado anterior reprovado permanece preservado. A variação entre ensaios não identifica uma causa única e não certifica infraestrutura de produção.

O usuário informou o endereço público do projeto Supabase atual: `yugrmyjvespydrggutvo`. Consulta autenticada confirmou nome `beautifullcare`, região `us-west-2`, estado `ACTIVE_HEALTHY`. As regras atuais retornaram `0.0.0.0/0` e `::/0`, com aplicação bem-sucedida: ambas as faixas Render já estão permitidas. Nenhuma atualização de rede foi necessária ou executada. O projeto difere do alvo histórico em São Paulo; é necessário conferir estrutura e configuração real da API antes de qualquer vinculação ou migração.


### Avaliação da migração em 06/11/2026

Destino confirmado pelo usuário. Auditoria remota: 2 tenants, 2 profiles/contas, 1 profissional, 1 serviço, demais tabelas de negócio vazias; verificações agregadas de integridade com zero inconsistências. Ensaio local com schema separado aprovado: migrações aplicadas e reaplicadas, legado sintético com dump idêntico, cópia com preservação de UUIDs/vínculos/valores aprovada. Plano e limites em `docs/operations/SUPABASE_MIGRACAO_PRESERVANDO_DADOS.md`. Autenticação Supabase e autenticação própria da API ainda exigem transição definida. Nenhuma migração remota executada; Render continua sem acesso administrativo confirmado.


O usuário escolheu preservar Supabase Auth. Adaptador implementado e validado localmente com provedor HTTPS simulado e PostgreSQL isolado; regressão Go com detector de corrida e vet aprovados. Migração 003 preparada, sem aplicação remota. Evidência: `2026-11-06-supabase-auth.md`. Login real, backup/restauração remoto e acesso Render continuam pendentes.
