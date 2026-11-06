# Preparação de backup e monitoramento

Estes arquivos são modelos para um host Linux com systemd. Não foram instalados ou ativados. Não configuram o provedor Render/Vercel nem enviam mensagens. Adapte caminhos e usuário ao destino autorizado; valide as units com `systemd-analyze verify` no host antes de ativar.

Pré-requisitos: Python 3.11+, ferramentas PostgreSQL compatíveis com a versão do banco, usuário de sistema `belezapura`, scripts em `/opt/belezapura/scripts`, diretório privado `/var/backups/belezapura` pertencente a esse usuário. O exemplo mantém sete arquivos verificados, com uma execução diária às 03h UTC (00h de São Paulo nesta data), com até cinco minutos de atraso aleatório.

Em `/etc/belezapura/backup.env`, protegido por permissão 0600, configurar `BACKUP_DATABASE_URL` com credencial própria de backup e SSL. Não copiar credenciais de teste. O serviço passa `--allow-remote` explicitamente; a rotina sem esse argumento aceita apenas banco local terminado em `_test`. Ela não executa migração, seed ou restauração.

Em `/etc/belezapura/monitor.env`, configurar `API_URL` e `APP_REVISION` com a revisão efetivamente publicada. O monitor retorna código 1 em falha, emite `event: incident` ao atingir três falhas consecutivas e `event: recovered` na primeira recuperação. Eventos repetidos do mesmo incidente não são emitidos a cada execução. O estado é gravado atomicamente e protegido por trava. Uma mudança de URL/revisão inicia uma contagem nova.

Os eventos aparecem no stdout/stderr e no journal do serviço. O responsável deve ligar esse sinal ao canal de alerta escolhido e comprovar o recebimento. Nenhum envio foi ativado. Sem um canal externo, a detecção local não garante que alguém será avisado.

Backup: a rotina gera arquivo custom do PostgreSQL com permissão 0600, confere seu catálogo, grava manifesto com SHA-256 e aplica retenção apenas aos pares de arquivo/manifesto próprios. Uma falha de `pg_dump` preserva cópias anteriores. O catálogo/checksum não substitui restauração: ensaiar periodicamente em banco separado e conferir dados, relações e `/health` da API restaurada.

Antes de ativar em produção, fornecer volume criptografado e cópia fora do host, definir retenção real e aprovar RPO/RTO. A retenção por número de arquivos é local; ela não é política de retenção ou criptografia do provedor. Proposta já documentada: RPO até 24h e RTO até 1h, ainda sem compromisso operacional validado.

Reprodução dos testes locais do monitor:

```sh
python3 -m unittest discover -s scripts/tests -v
```

Exemplo de backup de teste (a URL fica em variável de ambiente, sem segredo nos argumentos):

```sh
BACKUP_DATABASE_URL=URL_LOCAL_DESCARTAVEL python3 scripts/backup-postgres.py --directory /tmp/belezapura-backups --keep 7
```

Para recuperação, escolher um banco vazio separado, usar `pg_restore --exit-on-error` e verificar o resultado antes de qualquer retorno ao tráfego. Não configurar restauração automática sobre o banco operacional.
