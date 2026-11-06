# Operação da versão web

As mudanças deste ciclo são locais. Migrações, credenciais e publicação do ambiente de clientes não foram alteradas. Flutter foi incluído pelo usuário em 05/11/2026 e validado com análise, testes, builds de desenvolvimento Android/iOS e integração Android com API local. Distribuição em loja e aparelhos físicos continuam fora da evidência local.

## Cobrança e acesso

A cobrança é manual. O salão solicita um plano ou renovação; isso preserva seu estado de acesso e grava o plano e preço solicitados. O administrador confere o crédito na conta bancária da plataforma e informa referência única e valor recebido na aba Assinaturas. A aprovação grava um recebimento e libera um mês de acesso. Uma referência repetida não pode renovar novamente.

Renovação de uma assinatura ainda vigente adiciona um mês ao vencimento existente. Assinaturas vencidas iniciam um novo período na data da aprovação. Cancelamento e bloqueio suspendem novas gravações e a página pública; o responsável ainda pode consultar seus dados e solicitar regularização. Uma assinatura sem vencimento válido não libera novas operações. Trial de 14 dias não pode ser reiniciado pelo endpoint administrativo de status.

O Pix do agendamento pertence ao salão e é diferente da mensalidade da plataforma. É um código estático de sinal de 20%, com campos EMV e CRC16 testados localmente. Registrar a reserva ou copiar o código não comprova pagamento. O salão confere o recebimento antes de confirmar o atendimento. Sem chave Pix, a reserva é registrada sem sinal. A existência/titularidade da chave no banco e a aceitação por aplicativos bancários precisam de validação assistida; não houve transferência bancária nesta rodada.

WhatsApp automático, repasses bancários automáticos, avaliações sem backend, importação automática e multiunidades não fazem parte da oferta validada. Estoque é persistido por salão com controle de versão para impedir perda silenciosa de atualizações concorrentes. Não há migração automática dos antigos dados locais do navegador, pois a chave antiga era compartilhada entre contas e não permite atribuir os dados a um salão com segurança.

## Preparação da publicação

1. Fazer backup do banco existente e ensaiar a restauração em ambiente isolado equivalente ao destino.
2. Trocar os segredos que já estiveram versionados, especialmente os do antigo `.env` da API. O arquivo foi retirado do índice, mas o histórico Git não foi reescrito; remover do índice não revoga credenciais existentes. Conferir e trocar também senhas administrativas originadas pelos antigos seeds.
3. Configurar `DATABASE_URL`, `JWT_SECRET` aleatório de pelo menos 32 caracteres, `CORS_ORIGINS` com os domínios corretos, `GIN_MODE=release` e `APP_REVISION` com a versão entregue. O modelo não contém segredo funcional. Configurar `VITE_API_URL` no build web.
4. Levantar assinaturas ACTIVE sem vencimento e agendamentos históricos sobrepostos ou com relações entre salões. Reconciliar os registros com o responsável; não inventar vencimentos pagos nem excluir histórico automaticamente.
5. Aplicar `go run ./cmd/migrate` com a credencial de migração no destino autorizado. A API não executa DDL ou seeds ao iniciar. As migrações possuem histórico e rodam em transação com trava. A proteção de sobreposição exige a extensão PostgreSQL `btree_gist`; dados históricos incompatíveis fazem a migração falhar e reverter, para revisão assistida.
6. Em banco novo, usar `go run ./cmd/seed` com `ADMIN_EMAIL`, `ADMIN_PASSWORD` (mínimo 12 caracteres) e opcionalmente `ADMIN_NAME`. O seed insere somente planos ausentes e preserva valores administrativos. Não o executar para substituir usuários ou pagamentos existentes.
7. Subir a API com o schema atualizado e só depois construir/publicar o frontend. Confirmar `/health`, revisão, domínio HTTPS, login e fluxos de assinatura em ambiente assistido antes da liberação comercial.

A mudança de autenticação exige novo login dos usuários. Tokens expiram em oito horas; bloqueio, exclusão e alterações administrativas revogam a sessão no servidor. O pool tem até 20 conexões por processo. O limite total do banco e o número de réplicas devem ser compatíveis com esse orçamento.

A API não confia em cabeçalhos de proxy enviados pelo cliente. Os limites por IP precisam ser verificados no host real, pois um proxy pode agrupar múltiplos usuários sob um IP. Não habilitar confiança irrestrita em proxies para contornar esse comportamento. O ambiente publicado ainda não foi certificado nesta rodada.

## Verificação de dados antes da migração

Consultas somente de leitura, a executar no ambiente autorizado:

```sql
SELECT id, salon_id, status FROM subscriptions
WHERE status = 'ACTIVE';

SELECT a.id, a.salon_id FROM appointments a
JOIN clients c ON c.id = a.client_id::uuid
JOIN services s ON s.id = a.service_id::uuid
JOIN professionals p ON p.id = a.professional_id::uuid
WHERE c.salon_id <> a.salon_id OR s.salon_id <> a.salon_id
   OR p.salon_id <> a.salon_id;
```

No schema antigo, calcular o fim dos agendamentos com a duração de seus serviços para identificar sobreposições antes de aplicar a restrição. A auditoria deve considerar registros não cancelados e não excluídos. O schema novo registra o fim no momento da reserva, evitando que uma alteração posterior na duração do serviço mude o histórico.

## Recuperação e monitoramento

O procedimento local usou `pg_dump -Fc`, restauração com `pg_restore --exit-on-error` em outro banco e verificação de relações, contagens e saúde da API restaurada. Isso não comprova backup automático nem retenção no provedor de produção.

Para produção, configurar backup automático com criptografia, retenção definida, acesso restrito e cópia fora do host da aplicação. Definir RPO e RTO com o responsável; proposta inicial: RPO de até 24 horas e RTO de até uma hora. Esses são objetivos operacionais, não garantias demonstradas pelo teste local.

A rotina `python3 scripts/check-health.py https://API --expected-revision REVISAO` retorna código 0 somente com banco acessível, status saudável e revisão correspondente. Configurar sua execução no monitor externo e testar o disparo e recebimento do alerta. Não há agendamento nem envio de mensagem automática ativados neste checkout.

Com `--state-file CAMINHO --failure-threshold 3`, a sonda registra falhas consecutivas, emite evento local `incident` uma vez por incidente e `recovered` na recuperação. A gravação de estado usa trava e substituição atômica. Os três testes automatizados cobrem incidente/recuperação, revisão divergente e estado corrompido.

`scripts/backup-postgres.py` usa `BACKUP_DATABASE_URL`, gera arquivo custom privado e manifesto SHA-256, verifica o catálogo do arquivo e aplica retenção configurável com `--keep`. Por padrão só aceita bancos locais `_test`; um destino remoto exige `--allow-remote`. Os [modelos operacionais](operations/README.md) preparam timers systemd para backup diário e monitoramento por minuto. Eles não foram instalados no destino nem substituem criptografia, cópia fora do host e canal real de alerta.

Na checagem pública de 05/11/2026, `servicesalobeleza.vercel.app` apontava para deploy Vercel Ready de 17/10/2026. O bundle ainda apontava para `https://servicesalobeleza-5pjc.onrender.com`. Duas consultas de 90s e uma nova tentativa de saúde de 45s terminaram sem resposta; não houve comprovação de saúde, revisão, migrações ou assinatura real. Não publicar o frontend atualizado antes de resolver e verificar a API.

Em falha de publicação, retirar a revisão defeituosa do tráfego e manter o banco preservado. Restaurar backup somente em destino isolado, validar a cópia e planejar o retorno ao tráfego; não sobrescrever o banco operacional por tentativa. A versão antiga da API é incompatível com a exigência de `ends_at`; não fazer rollback apenas do binário sem um plano compatível de schema e gravações.

## Reprodução local

Todos os comandos de integração exigem banco descartável no localhost com nome terminado em `_test`:

```sh
cd belezapura_go_api
TEST_DATABASE_URL=URL_DO_BANCO_LOCAL_TEST go test -race -count=1 -v ./...
TEST_DATABASE_URL=URL_DO_BANCO_LOCAL_TEST RUN_CAPACITY=1 CAPACITY_REPORT_PATH=/tmp/capacity.json go test -run '^TestCapacity$' -count=1 -timeout 45m -v .
```

O teste completo faz rampas de 10 e 25 usuários por um minuto, 50 por 30 minutos e 100 por cinco minutos. Cria 50 salões adicionais a cada execução. O modo `CAPACITY_QUICK=1` é apenas regressão breve e não substitui o ensaio sustentado. Os clientes sintéticos têm tempo de espera de um segundo e mistura documentada no relatório.

Preparar fixtures pelo teste `TestPrepareBrowser`, iniciar uma API exclusivamente de testes e o Vite apontado para ela; executar `npm run test:e2e` em `belezapura_web`. Os testes de navegador não recebem credenciais de clientes reais. O workflow `.github/workflows/validate.yml` foi preparado, mas sua execução remota depende de publicação no repositório e não foi alegada como concluída.
