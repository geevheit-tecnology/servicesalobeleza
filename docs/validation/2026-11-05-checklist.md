# Continuação do checklist — 05/11/2026

Ambiente: máquina de desenvolvimento, PostgreSQL 17 no contêiner exclusivo `belezapura-checklist-20261105`, publicado somente em `127.0.0.1:55435`. Bancos `belezapura_checklist_test` e `belezapura_restore_test`. API de testes em 3051, Vite em 5175. Somente dados e credenciais sintéticos. Sem alteração remota, commit ou deploy.

## Integração e isolamento

Com `TEST_DATABASE_URL` apontando para o banco descartável, `go test -race -count=1 -v ./...` executou a integração que tinha sido ignorada na primeira rodada. Os dez cenários existentes passaram:

- isolamento de relações e permissões de administrador;
- 20 reservas concorrentes: uma aceita e 19 conflitos; sobreposição parcial rejeitada e horário adjacente aceito;
- persistência, isolamento e controle de versão do estoque;
- suspensão, solicitação sem autoativação, aprovação manual, referência bancária única, renovação e cancelamento;
- revogação, usuário bloqueado/excluído e tokens expirados/sem expiração;
- plano inválido e rollback do onboarding após falha forçada ao inserir serviço;
- limite concorrente de profissionais e reativação;
- rejeição de mudança administrativa parcial de plano;
- seed preservando preço administrativo;
- restrição de sobreposição aplicada diretamente pelo PostgreSQL.

Erros SQL de referência cruzada, pagamento duplicado, falha forçada e sobreposição aparecem no log intencionalmente: os testes exigem essas rejeições.

Acrescentado `TestTenantReadAndPublicBoundaries`, aprovado com `-race`: quatro endpoints de leitura sem IDs alheios, alteração/exclusão de agendamento de outro salão negadas, disponibilidade/reserva pública com serviço ou profissional alheio rejeitadas sem deixar cliente/reserva parcial, e token invalidado após mudança de papel ou salão.

```text
--- PASS: TestTenantReadAndPublicBoundaries (0.45s)
PASS
ok  belezapura_go_api 2.976s
```

Essa cobertura se aplica às rotas atuais. Novas rotas precisam manter os filtros e os testes de isolamento.

Após a última alteração no teste, a suíte completa foi reexecutada com banco isolado e `-race`, código 0: `TestIntegration` passou em 3.60s e `TestTenantReadAndPublicBoundaries` em 0.36s; pacote principal `ok belezapura_go_api 7.272s`, demais pacotes aprovados. `go vet ./...` retornou código 0 sem diagnósticos. Fixture de navegador, carga e restauração possuem habilitação explícita e foram executadas separadamente como descrito abaixo.

## Navegador

Fixture preparada por `TestPrepareBrowser` no banco sintético. Executado `BROWSER_FIXTURE_PATH=/tmp/belezapura-checklist-browser.json npm run test:e2e` com Playwright/Chromium, API local e frontend local:

```text
✓ estoque persiste após recarga e permanece isolado entre salões (7.5s)
✓ horários e bloqueios são salvos e respeitados pela API (3.2s)
✓ reserva pública apresenta Pix pendente sem afirmar recebimento (5.5s)
✓ assinatura solicita revisão e administrador confirma pagamento antes de liberar (5.8s)
✓ painel móvel abre estoque e horários sem erro ou transbordamento (3.5s)
5 passed (28.0s)
```

O pagamento foi sintético. Não houve acesso bancário ou confirmação de titularidade da chave Pix.

## Regressão breve de carga

Executado `TestCapacity` com `RUN_CAPACITY=1 CAPACITY_QUICK=1`, timeout de cinco minutos. Relatório completo em [capacity-quick-2026-11-05.json](capacity-quick-2026-11-05.json). Código 0, `PASS`, duração do teste 66.17s.

Dados criados: 50 salões, 250 profissionais, 1.500 clientes, 500 serviços e 15.000 agendamentos históricos. HTTP real contra `httptest.NewServer`; mistura 80% leituras e 20% criação de produtos, espera de um segundo entre operações por usuário.

| Usuários | Duração | Requisições | Erros | p95 geral | p95 leitura | p95 gravação |
| --- | --- | --- | --- | --- | --- | --- |
| 10 | 10s | 100 | 0 | 89.669ms | 89.796ms | 21.422ms |
| 25 | 10s | 250 | 0 | 168.107ms | 175.838ms | 14.419ms |
| 50 | 30s | 1464 | 0 | 203.895ms | 219.285ms | 19.382ms |
| 100 | 10s | 963 | 0 | 379.522ms | 399.144ms | 38.618ms |

Critérios automatizados: nenhum erro, p95 de leitura até 1s e de gravação até 2s. Até 20 conexões abertas. Este modo breve não substitui 30 minutos sustentados com 50 usuários, nem prova capacidade do host de produção. Os relatórios `capacity-local.json` e `capacity-process-summary.json` já existiam antes desta retomada e não foram apresentados como execuções novas.

## Backup, restauração e monitor

`pg_dump -Fc` gerou backup do banco sintético. Criado outro banco, restaurado com `pg_restore --exit-on-error`; ambos retornaram código 0. Contagens conferidas nos dois bancos antes de executar novos testes:

| Tabela | Origem | Restaurado |
| --- | --- | --- |
| salons | 57 | 57 |
| appointments | 15004 | 15004 |
| clients | 1508 | 1508 |
| products | 571 | 571 |
| payments | 3 | 3 |

`VERIFY_RESTORE=1 go test -run '^TestRestoredDatabase$' -count=1 -v .` no banco restaurado, código 0:

```text
Restored API healthy; 57 salons, 15004 appointments, no invalid tenant relationships.
--- PASS: TestRestoredDatabase (0.07s)
PASS
ok  belezapura_go_api 1.270s
```

`scripts/check-health.py` contra a API local retornou código 0 com revisão `checklist-local-20261105`. Com revisão esperada divergente, retornou código 1 e `status: failed`, razão `revisão publicada diferente da esperada`. Isso testa a sonda, sem ativar agendamento ou enviar alerta externo.

## Pendências para a liberação

- Ensaio sustentado no ambiente equivalente ao destino, com CPU/RAM, métricas do banco e critérios de infraestrutura.
- Backup automático, retenção, RPO/RTO acordados e recebimento real de alertas.
- Flutter fora deste ciclo web, conforme o escopo já documentado.
- Ambiente publicado: revisão, migrações, domínio, segredos, autenticação e assinatura assistida; aceitação bancária do Pix.

As mudanças de produto já presentes no checkout foram preservadas. Esta continuação ampliou testes de isolamento e atualizou evidências/checklist. A retirada das simulações de WhatsApp e repasse foi conferida no código atual: WhatsApp é apresentado como indisponível; comissões são estimativas sobre atendimentos reais concluídos e o repasse fica a cargo do salão.
