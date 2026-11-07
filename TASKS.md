# Liberação comercial — 50 salões assinantes

Referência: [auditoria de 04/11/2026](AUDITORIA_ASSINATURAS_50_CLIENTES.md).

## Revisão de 07/11/2026 — preparação para uso em 09/11

Branch: `ajuste-posicionamento-revisao-20261107`. Evidências: [revisão atual](docs/validation/2026-11-07-prontidao-comercial.md).

- [x] Revisar `melhorias.md`, histórico Git e implementação atual pelo CodeGraph; preservar o arquivo de requisitos não rastreado.
- [x] Identificar exemplos fictícios na landing e no mockup Pix; explicitar ausência de automação WhatsApp e confirmação manual.
- [x] Retirar afirmação de recebimento inexistente no contato: formulário prepara mensagem para envio pelo leitor de e-mail.
- [x] Validar moeda em 240 casos, incluindo `R$ 424,10`, sem alterar fórmula.
- [x] Executar integração Go com PostgreSQL descartável e detector de corrida; `go vet` aprovado.
- [x] Validar cinco fluxos de navegador existentes na versão compilada local.
- [x] Validar landing/calculadora em 390 e 1440 px e contato: três testes adicionais aprovados.
- [x] Confirmar Supabase `beautifullcare` ativo por consulta atual; manter dados existentes.
- [x] Corrigir cadastro completo após autorização: endereço, Instagram, contato, categoria, duração, favorecido e política de sinal persistidos; configuração editável; reservas verificadas no navegador.
- [x] Testar migração aditiva `004_onboarding_details.sql` no banco descartável; restaurar backup e comparar contagens/hashes das 13 tabelas.
- [x] Executar suíte final: 11 testes de navegador, integração Go com detector de corrida e auditoria npm de produção sem vulnerabilidades.
- [ ] Conectar Render e inspecionar serviço `srv-davihg5g1s2s73alboag`, revisão, logs e conexão real.
- [x] Atualizar auditoria de integridade e obter backup privado Supabase; restaurar localmente os dados de negócio/identidade e ensaiar migrações 001–004 em schema separado, preservando os legados.
- [ ] Comprovar restauração gerenciada, cópia externa/retida do backup e corte consistente; exportação CLI não inclui registros de duas tabelas internas de migração da plataforma.
- [ ] Comprovar login real e migração em ambiente publicado, incluindo cadastro, serviço, profissional, horário, reserva, Pix e confirmação manual.
- [x] Publicar prévia web Ready: [revisão de 07/11](https://servicesalobeleza-4rw2yhmfh-geevheits-projects.vercel.app), deploy `dpl_AQbwJPBdeYqmiKtLvJp3Ndmazqv3`.
- [ ] Integrar prévia com API atualizada; produção depende da aprovação prevista em `melhorias.md`.
- [ ] Validar capacidade no destino, rotina de backup, alertas e operação assistida antes de abrir vendas.

Não há liberação comercial comprovada. O frontend público retornou HTTP 200; a API histórica não respondeu em 45 segundos. Testes locais não encerram os itens remotos.

## Execução anterior — retomada até o deploy em 05/11/2026

- [x] Conferir projeto Vercel correto e corrigir vínculo local/empacotamento.
- [x] Publicar prévia web com TypeScript obrigatório: [prévia Ready](https://servicesalobeleza-8dkoptd5t-geevheits-projects.vercel.app), deploy `dpl_CpYYhYdwDj9KXAPdAkdWk3UdCPT9`.
- [x] Acrescentar diagnóstico de erros e latência por rota à carga; manter os critérios de aceite.
- [x] Preparar configuração de prévia da API e inicialização com revisão do commit, sem migração automática: `docs/operations/RENDER_API.md`.
- [x] Repetir o protocolo completo de carga local com diagnóstico: 112.500 requisições, zero erros; critérios agregados aprovados. Resultado anterior preservado.
- [ ] Validar capacidade no ambiente equivalente ao destino antes da liberação comercial.
- [x] Auditar o Supabase de destino e ensaiar migração em schema separado com dados sintéticos, preservando o legado: `docs/operations/SUPABASE_MIGRACAO_PRESERVANDO_DADOS.md`.
- [x] Preparar adaptação da API para preservar Supabase Auth, com autorização local e testes em banco isolado/provedor simulado.
- [ ] Validar login real das duas contas, provisionamento e backup/restauração remoto antes da migração.
- [ ] Concluir conexão do Render, verificar logs/banco e preparar o deploy da API.
- [ ] Comprovar integração da prévia com a API atualizada; só então avaliar publicação de produção.

A prévia usa a URL pública da API existente. A API ainda não respondeu à consulta de saúde nesta retomada; o estado Ready do frontend não prova login, agenda ou assinatura funcionando. A conexão do Render foi solicitada pelo usuário, mas ainda não foi confirmada nesta sessão. Evidências: [retomada do deploy](docs/validation/2026-11-05-deploy-preview.md).

## Checklist de liberação

- [x] Mapear código atual com CodeGraph.
- [x] Executar build web, TypeScript, compilação Go, vet e auditoria npm de produção.
- [x] Documentar bloqueadores e limites das evidências.
- [x] Corrigir os 19 erros TypeScript e tornar a checagem obrigatória no build/CI.
- [x] Exigir segredo JWT, expiração e verificação de usuário ativo/revogação.
- [x] Validar isolamento entre salões em todas as relações e endpoints.
- [x] Definir cobrança manual ou integrada; impedir autoativação sem confirmação.
- [x] Implementar vencimento, renovação, cancelamento e política única de suspensão.
- [x] Proteger reservas simultâneas e sobrepostas com duração e fuso corretos.
- [x] Validar Pix e diferenciar declaração de pagamento de confirmação administrativa/bancária.
- [x] Persistir estoque por salão no backend.
- [x] Implementar ou retirar da oferta automações e repasses simulados.
- [x] Garantir tratamento de erros e atomicidade do onboarding.
- [x] Separar migrações e seeds da inicialização e preservar planos administrativos.
- [x] Executar testes comportamentais com banco isolado e testes de navegador.
- [x] Validar Flutter separadamente se fizer parte do lançamento.
- [x] Executar carga local com 50 salões e registrar métricas e critérios de aceite; validação no destino permanece pendente.
- [ ] Comprovar backup/restauração, monitoramento e recuperação.
- [ ] Verificar ambiente publicado, versão, migrações e fluxo real de assinatura antes de liberar.

## Pausa anterior em 05/11/2026 — encerrada pela retomada até o deploy

A execução havia sido pausada pelo usuário. A solicitação posterior de continuar até o deploy encerrou a pausa. Naquele ponto, carga e coleta de métricas foram interrompidas, preservando os dados sintéticos.

- Carga sustentada: etapa de 50 usuários completou 30 minutos e **reprovou**: 72.242 requisições, 10 erros, p95 de leitura 1.398,142 ms (limite 1.000 ms) e p95 de gravação 1.049,460 ms. O teste automatizado exige zero erros. O pico de 100 usuários foi interrompido e não tem resultado consolidado.
- Evidências preservadas em `docs/validation/capacity-sustained-2026-11-05.json` e `capacity-infra-2026-11-05.jsonl`. Houve builds Flutter e emulador concorrentes na máquina de desenvolvimento; investigar os erros e a influência da disputa por recursos antes de atribuir a causa ou repetir o ensaio em ambiente controlado.
- Flutter concluído localmente: análise limpa, 13 testes, dois testes Android com API real sintética e builds Android/iOS de desenvolvimento aprovados.
- Próxima retomada: investigar a reprovação de carga; confirmar a disponibilidade da API pública; concluir a configuração operacional no destino autorizado. Não há liberação comercial comprovada.

## Retomada de 05/11/2026

Evidências: [validação local](docs/validation/2026-11-05-retomada.md).

- Web: `npm run build` aprovado, executando `tsc --noEmit && vite build`. O workflow `validate.yml` exige esse build; execução remota do CI ainda não verificada.
- Continuação: [integração, navegador e recuperação local](docs/validation/2026-11-05-checklist.md). Os itens marcados nesta retomada representam implementação e validação **local com dados sintéticos**, sem homologação bancária ou de produção.
- Autenticação e isolamento: integração aprovada com PostgreSQL 17 descartável e detector de corrida; cobertura ampliada para leituras, agendamentos alheios, referências públicas cruzadas e alterações de papel/salão.
- Navegador: cinco cenários aprovados, incluindo cobrança manual, estoque entre contas e painel móvel. Pix validado quanto ao payload e à apresentação pendente; titularidade da chave e aceitação bancária continuam pendentes na validação publicada.
- Carga: regressão breve aprovada com 50 salões, 15 mil agendamentos e etapas de até 100 usuários. O ensaio sustentado no ambiente equivalente ao destino e as métricas de infraestrutura permanecem pendentes; o relatório sustentado preexistente é evidência histórica local.
- Recuperação: backup/restauração e saúde da API restaurada aprovados localmente. Monitor detectou revisão divergente. Backup automático, retenção e alerta externo continuam pendentes, por isso o item operacional não foi encerrado.
- Flutter foi incluído pelo usuário nesta continuação: análise limpa, 13 testes aprovados, APK Android debug, build iOS para simulador e dois testes de integração no Android com API local real aprovados. Assinatura de distribuição, aparelhos físicos e execução iOS em dispositivo não estão certificados.
- Operação: rotina de backup/retenção e monitor com eventos de incidente/recuperação implementados e testados localmente; modelos de timers preparados em `docs/operations`, sem ativação em produção.
- Evidências adicionais: [Flutter, backup, monitor e publicação](docs/validation/2026-11-05-flutter-operacao.md).
- Ambiente informado pelo usuário: `https://servicesalobeleza.vercel.app`, frontend Ready de 17/10/2026. A API identificada no bundle público não respondeu a duas consultas de 90s e uma nova consulta de saúde de 45s. Revisão, migrações e assinatura real não puderam ser comprovadas.
