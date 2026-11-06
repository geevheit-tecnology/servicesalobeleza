# Auditoria para comercialização — 50 clientes

Data: 04/11/2026. Parecer: **não liberar comercialmente no estado auditado**.

Escopo adotado: 50 salões assinantes independentes, cada um com seus profissionais e clientes finais. Isso não equivale a 50 usuários simultâneos. Confirmar o perfil de uso antes do dimensionamento final.

Análise local do código atual com CodeGraph, compilação, TypeScript, vet e auditoria npm. Não houve acesso ao banco, execução de migrações, pagamento, carga, navegador ou alteração de produção. Nenhuma correção de produto foi feita nesta auditoria. A alteração preexistente em relatório Android foi preservada.

## Bloqueadores encontrados

| Prioridade | Evidência | Impacto e correção necessária |
| --- | --- | --- |
| Crítica | `belezapura_go_api/internal/handler/salon.go:191-267`, `UpgradePlan` | Um assinante pode solicitar um plano e receber `ACTIVE` sem evidência de pagamento. A troca também não atualiza `Price`. Criar solicitação pendente e só ativar com confirmação confiável no servidor; definir cobrança manual ou provedor, vencimento, renovação, cancelamento e conciliação. |
| Crítica | `belezapura_go_api/internal/middleware/auth.go:20-25,71-79` | Segredo JWT previsível quando a variável está ausente e tokens gerados sem expiração. Exigir segredo configurado, expiração e algoritmo permitido; prever revogação. A exploração depende da configuração do ambiente, não verificada nesta análise. |
| Crítica | `belezapura_go_api/internal/handler/appointments.go:14-59` | Criação autenticada recebe IDs de cliente/profissional/serviço sem validar pertencimento ao salão; serviço é consultado apenas por ID. Validar todas as relações e status no servidor e testar duas contas distintas. Não houve exploração em banco real. |
| Alta | `belezapura_go_api/internal/middleware/security.go:67-103`; `internal/handler/public.go:28-43,131-143` | A restrição trata `EXPIRED` e trial vencido, mas não `BLOCKED`, `CANCELED` e `LATE`. Ausência de assinatura/erro de consulta deixa a requisição seguir. As rotas públicas escolhem a primeira assinatura sem ordenação explícita. Unificar a política de acesso e definir regras para leitura, escrita, regularização e indisponibilidade do banco. |
| Alta | `belezapura_go_api/internal/handler/auth.go:19-64`; `internal/middleware/auth.go:29-56` | Login não consulta o status ativo; autenticação de requisições usa apenas claims. Bloqueio/exclusão de usuário e mudança de papel não invalidam automaticamente tokens existentes. Verificar usuário ativo e autorização atual no servidor. |
| Alta | `internal/handler/appointments.go:34-53`; `internal/handler/public.go:145-195`; `internal/db/models.go:136-153` | Consulta de conflito seguida de inserção permite corrida entre reservas simultâneas. O conflito considera apenas início idêntico, sem duração. Implementar proteção transacional e no banco para intervalos sobrepostos; testar disputa pelo mesmo horário. |
| Alta | `internal/handler/public.go:47-98` | Disponibilidade usa 08h–20h em intervalos de 30 minutos e início exato das reservas; não considera duração do serviço nem o expediente configurado. Definir fuso do salão, bloqueios, duração e validação no momento da gravação. |
| Alta | `internal/handler/public.go:197-209`; `belezapura_web/src/pages/ClientView.tsx:295-298,1101-1104` | Pix montado por concatenação, com campos fixos, sem cálculo de CRC no código e com chave de exemplo como fallback. O botão “Já realizei o pagamento” avança a interface sem conciliação. Validar geração do payload e distinguir declaração do cliente de pagamento confirmado. É o sinal do agendamento, separado da assinatura SaaS. |
| Alta | `belezapura_web/src/pages/dashboard/views/EstoqueView.tsx:19-34,51-53` | Estoque inicia com produtos de exemplo e persiste em `localStorage` sob a mesma chave `salon_estoque` para todas as contas. Não sincroniza entre dispositivos; contas no mesmo navegador podem visualizar os mesmos dados locais. Persistir por salão no backend com autorização. |
| Alta | `belezapura_web/src/pages/dashboard/views/ChatbotWhatsAppView.tsx:21-54,96-116`; `ComissoesView.tsx:19-44` | WhatsApp começa como conectado e responde com simulação; comissões iniciam com receita zerada e o repasse apenas exibe alerta. Implementar e verificar o serviço real ou retirar essas promessas dos planos comercializados. |
| Alta | `belezapura_go_api/internal/handler/onboarding.go:190-283` | Inserções de serviços/profissionais/assinatura e commit não verificam todos os erros. Pode haver resposta de sucesso sem garantir persistência completa. Tratar início, operações e commit da transação e validar plano obrigatório. |
| Alta | `belezapura_go_api/internal/db/db.go:61-126`; `main.go:30-33` | Cada inicialização executa migração e reescreve preços, limites e funcionalidades dos planos existentes. Alterações administrativas podem ser sobrescritas. Separar migrações versionadas e seed inicial da inicialização da API. |
| Alta | `npx tsc --noEmit` | 19 erros em ClientView, AgendaView, EstoqueView e HorariosView. `defaultSchedule` não existe na tela de horários, podendo causar falha ao abri-la. O build Vite não impede esses erros. |

## Verificações executadas

| Comando / diretório | Resultado real |
| --- | --- |
| `npm run build`, `belezapura_web` | Aprovado: Vite 8.3.0, 2491 módulos, `built in 1.03s`. |
| `npx tsc --noEmit`, `belezapura_web` | Reprovado, código 2: 19 erros. |
| `go test ./...`, `belezapura_go_api` | Código 0; todos os cinco pacotes retornaram `[no test files]`. Comprova compilação, não comportamento. |
| `go vet ./...`, `belezapura_go_api` | Código 0, sem diagnósticos. |
| `npm audit --omit=dev --json`, `belezapura_web` | Código 0; `vulnerabilities.total: 0`. Limitado ao registro npm e às dependências de produção verificadas. |

Tentativas iniciais foram impedidas pelo sandbox: Go sem acesso ao cache e npm com `SecItemCopyMatching failed -50`/código 139. Reexecuções autorizadas fora do sandbox produziram os resultados acima. A falha TypeScript persistiu no ambiente autorizado e é do código.

Erros TypeScript: ClientView:478,479,486 (tipos `unknown`); AgendaView:455,464,473 (`variant="default"` incompatível); EstoqueView:236 (`title` incompatível no ícone); HorariosView:8 (`defaultSchedule` ausente) e 11 parâmetros implicitamente `any` derivados.

Flutter teve inspeção parcial do fluxo público, que usa localhost e `simulatePayment`; build, análise e testes Flutter não foram executados nesta rodada. A liberação mobile exige validação própria.

## Capacidade para 50 salões

Não comprovada. O pool da API permite 20 conexões abertas e 5 ociosas (`internal/db/db.go:45-47`); esses valores não demonstram capacidade nem representam limite de salões. Faltam CPU/RAM do host, limite total do banco, latência, volume de dados, profissionais por salão e pico de acessos.

Protocolo proposto, ainda não executado, em ambiente isolado equivalente à produção:

1. Criar 50 salões sintéticos independentes, com usuários, serviços, profissionais e histórico representativo; documentar volumes.
2. Executar fluxos completos de cadastro, login, CRUD, agenda pública/interna, cobrança, bloqueio e reativação. Verificar persistência em outro navegador.
3. Exercitar 10, 25 e 50 usuários simultâneos, com rampa e pelo menos 30 minutos sustentados; depois pico de 100 por 5 minutos. Registrar mistura de operações e credenciais por salão. Ajustar esses alvos ao pico comercial previsto.
4. Medir p50/p95/p99, erros inesperados, CPU, memória, conexões e consultas lentas. Alvos iniciais de aceite: p95 até 1 segundo para leituras e até 2 segundos para gravações, erros inesperados abaixo de 1%, sem crescimento contínuo de memória ou saturação sustentada. São critérios propostos, não resultados.
5. Disputar o mesmo intervalo com múltiplas requisições: exatamente uma reserva aceita; demais recebem conflito previsto. Testar duração e fusos.
6. Testar troca de IDs entre salões em todas as relações; nenhuma leitura/gravação indevida. Testar tokens expirados, usuários bloqueados e assinaturas suspensas.
7. Demonstrar backup e restauração em ambiente isolado, definir perda máxima de dados e prazo de recuperação; verificar alertas e procedimento de reversão.

Nenhuma carga deve ser executada contra clientes reais sem delimitar ambiente e janela. Nenhum pagamento real é necessário para os testes automatizados; homologação de cobrança e produção devem ser comprovadas separadamente.

## Condição de liberação

Corrigir os bloqueadores, passar testes comportamentais com PostgreSQL isolado e testes de navegador, validar carga e recuperação e então executar verificação assistida do ambiente publicado. Registrar versão, migração, saúde da API, domínio HTTPS e evidência de assinatura aprovada e suspensa. Não atribuir percentual de prontidão com base apenas em telas ou compilação.
