# Flutter, operação e ambiente publicado — 05/11/2026

Escopo autorizado nesta continuação: incluir Flutter e avançar nas pendências do checklist. Somente bancos descartáveis e credenciais sintéticas foram usados nos testes. A consulta pública foi de leitura; não houve deploy, migração remota, commit ou envio de alerta a terceiros.

## Flutter

SDK instalado: Flutter 3.38.9 stable / Dart 3.10.8. A análise inicial apontou 20 avisos de estilo (`curly_braces_in_flow_control_structures`). Aplicada somente a correção de chaves nos quatro arquivos apontados; análise final:

```text
flutter analyze
No issues found! (ran in 23.6s)
```

Os 11 testes existentes passaram. Acrescentados dois testes que percorrem o formulário público até a resposta da API simulada: reserva aceita mantém Pix pendente; conflito não apresenta sucesso ou código Pix. Validam IDs, dados do cliente e horário com offset. Suíte completa:

```text
flutter test --reporter expanded
00:30 +13: All tests passed!
```

O primeiro build Android foi impedido pelo AGP 8.1.0, abaixo do mínimo aceito pelo Flutter. Atualizados AGP para 8.11.1, Kotlin para 2.1.20 e NDK para o valor do SDK Flutter. Gradle 8.14 já estava configurado. A [documentação Android](https://developer.android.com/build/releases/agp-8-11-0-release-notes) informa suporte a API 36 e mínimo Gradle 8.13/JDK 17 para AGP 8.11. O build usou JDK 17 por `GRADLE_OPTS`, sem alterar a configuração global do Flutter.

```text
flutter build apk --debug --dart-define=API_BASE_URL=http://10.0.2.2:3051
Running Gradle task 'assembleDebug'... 776,6s
✓ Built build/app/outputs/flutter-apk/app-debug.apk

flutter build ios --simulator --debug --dart-define=API_BASE_URL=http://127.0.0.1:3051
Xcode build done. 374,4s
✓ Built build/ios/iphonesimulator/Runner.app
```

Novos testes em `integration_test/local_api_test.dart` executados no emulador Android Pixel 9a/API 36, contra API Go na porta 3051 e PostgreSQL local na porta 55435, com fixture exclusiva preparada por `TestPrepareBrowser`:

```text
flutter test integration_test/local_api_test.dart -d emulator-5554 --dart-define-from-file=/tmp/belezapura-flutter-defines.json --reporter expanded
00:00 +0: login, estoque persistido e isolamento em duas contas reais de teste
01:48 +1: reserva pública na API real permanece aguardando conferência
02:29 +2: (tearDownAll)
02:42 +2: All tests passed!
```

O primeiro cenário usa a UI para login e criação de produto, confirma persistência por uma segunda sessão HTTP e verifica ausência do produto após entrar no outro salão. O segundo preenche o agendamento público e confere no backend que o cliente foi gravado com status `waiting`. A suíte recusa hosts não locais e contas fora de `@example.test`.

O emulador teve inicialização lenta e a captura após os testes mostrou ANR do Pixel Launcher. Isso é limitação do ambiente de emulação; a captura não foi usada como prova visual do aplicativo. Os dois cenários foram concluídos com sucesso pelo runner. Não houve aparelho físico, execução iOS em simulador/dispositivo, assinatura de distribuição, TestFlight ou publicação em loja. Os builds são de desenvolvimento.

Após a integração, o APK principal foi recompilado para substituir o artefato com entrada dos testes: código 0, `assembleDebug 34,1s`, `Built build/app/outputs/flutter-apk/app-debug.apk`. O emulador foi encerrado; os dados sintéticos e as evidências foram preservados.

O CI agora inclui análise/testes Flutter e testes Python do monitor. O workflow remoto não foi executado nesta rodada.

## Backup, retenção e recuperação

Implementada `scripts/backup-postgres.py`, testada contra `belezapura_restore_test`. São arquivos locais sem criptografia do provedor ou upload externo; a rotina não foi agendada em produção.

- Primeira execução: código 0, arquivo 620553 bytes, `removedArchives: 0`.
- Segunda execução, `--keep 1`: código 0, `removedArchives: 1`.
- Senha inválida: código 1, `status: failed`; última cópia válida preservada, checksum correto, permissão 0600 e nenhum parcial restante.
- Arquivo produzido restaurado com `pg_restore --exit-on-error` em outro banco vazio: `belezapura_automated_restore_test`.

Reforçada a checagem de recuperação para falhar em erro de contagem, referências ausentes e fim de agendamento nulo, além de relações entre salões e intervalos inválidos. Validação no banco restaurado:

```text
VERIFY_RESTORE=1 go test -race -run '^TestRestoredDatabase$' -count=1 -v .
Restored API healthy; 57 salons, 15004 appointments, no invalid tenant relationships.
--- PASS: TestRestoredDatabase (0.50s)
PASS
ok  belezapura_go_api 4.319s
```

## Monitoramento

A sonda agora admite estado persistente com trava, falhas consecutivas e eventos locais `incident`/`recovered`, sem repetir o incidente a cada execução. Os testes usam servidor HTTP local e processo real da sonda. Primeira tentativa impedida pelo sandbox ao abrir o servidor; reexecução autorizada:

```text
python3 -m unittest discover -s scripts/tests -v
test_incident_is_emitted_once_and_recovery_clears_failures ... ok
test_unreadable_state_cannot_report_success ... ok
test_wrong_revision_is_a_failure ... ok
Ran 3 tests in 8.316s
OK
```

Modelos de timers e serviços em `docs/operations/`, para host Linux com systemd. Preparados e não ativados; `systemd-analyze` não está disponível neste macOS. Ativação, retenção/criptografia no destino, cópia fora do host, RPO/RTO acordados e recebimento real de alerta continuam pendentes.

## Consulta do ambiente publicado

Domínio fornecido pelo usuário: `https://servicesalobeleza.vercel.app/`. HTML e bundle públicos acessíveis por HTTPS. Metadados obtidos com `vercel inspect`:

```text
id: dpl_FpGFDc47uW7BaJ7VcmPK9tQfLxnm
name: servicesalobeleza
target: production
status: Ready
url: https://servicesalobeleza-6eq4502zf-geevheits-projects.vercel.app
created: 17/10/2026 02:19:06 America/Sao_Paulo
alias: https://servicesalobeleza.vercel.app
```

Os vínculos `.vercel` locais apontam para projetos diferentes/sem acesso; eles não foram relinkados. O domínio informado foi inspecionado diretamente. Bundle publicado `index-DFDZ00_J.js` aponta para `https://servicesalobeleza-5pjc.onrender.com`.

`GET /health` e `GET /api/public/plans` terminaram em timeout de 90s sem receber bytes. Nova tentativa de `/health` após esse período terminou em timeout de 45s. Isso comprova indisponibilidade dessas consultas a partir deste ambiente, sem atribuir a causa ao código ou declarar o estado do banco. Não foi possível verificar revisão, migrações ou fluxo real de assinatura.

O HTML público ainda anunciava IA no WhatsApp. A mesma promessa residual foi retirada de `belezapura_web/index.html` local. O build web após a correção passou: TypeScript, 2493 módulos, `built in 3.44s`. Essa correção não foi publicada.

## Carga sustentada e pausa

O usuário solicitou pausa após a etapa de 50 usuários. Processos de carga e coleta foram interrompidos; o banco sintético foi preservado. Relatório parcial em `capacity-sustained-2026-11-05.json` e amostras em `capacity-infra-2026-11-05.jsonl`.

A etapa sustentada terminou 1800 segundos com 72.242 requisições e 10 erros. p95 geral: 1311,111 ms; leitura: 1398,142 ms; gravação: 1049,460 ms. Reprovou os critérios automatizados de zero erros e leitura até 1000 ms. O pico de 100 usuários foi interrompido sem consolidação; o comando terminou com `signal: interrupt`, código 1, após 1984,091s.

Os builds e a emulação Flutter compartilharam a máquina durante parte do ensaio. Essa concorrência limita a interpretação, mas não elimina a reprovação observada. O teste atual agrega erros sem separar causa/status; a retomada deve melhorar esse diagnóstico e avaliar a influência dos recursos do host antes de concluir se há defeito da aplicação ou dimensionamento insuficiente. Nenhuma capacidade de produção foi certificada.
