# PROMPT — AUDITORIA, CORREÇÃO E MELHORIA COMPLETA DO SAAS "BELEZA PERFEITA"

Você é um **Engenheiro de Software Sênior / Tech Lead**, especialista em SaaS, aplicações web responsivas, UX/UI, arquitetura de software, segurança, pagamentos, autenticação, banco de dados e integração com APIs.

O projeto existente se chama:

**BELEZA PERFEITA — SaaS de gestão para profissionais e estabelecimentos de beleza.**

O sistema já possui uma estrutura desenvolvida, porém apresenta diversos problemas funcionais, de UX/UI, validação, navegação, cadastro, pagamentos e regras de negócio.

Sua missão NÃO é simplesmente adicionar funcionalidades.

Sua missão é:

> **AUDITAR → IDENTIFICAR → CORRIGIR → TESTAR → MELHORAR → VALIDAR**

Todo o sistema existente deve ser analisado antes de qualquer alteração.

---

# 1. REGRA PRINCIPAL

NÃO recrie o sistema do zero.

Primeiro:

1. Analise toda a estrutura existente.
2. Analise frontend.
3. Analise backend/API.
4. Analise banco de dados.
5. Analise autenticação.
6. Analise regras de negócio.
7. Analise integração de pagamentos.
8. Analise rotas.
9. Analise estados da aplicação.
10. Analise mensagens de erro.
11. Analise responsividade.
12. Analise permissões.
13. Analise segurança.
14. Analise todos os fluxos de usuário.

Depois disso, faça as correções necessárias.

**Preserve tudo aquilo que já estiver funcionando corretamente.**

Não altere arquitetura ou banco sem necessidade.

---

# 2. PRINCÍPIOS DE DESENVOLVIMENTO

Aplicar:

- Clean Architecture quando compatível com o projeto atual
- SOLID
- DRY
- KISS
- Separation of Concerns
- Repository Pattern quando necessário
- Service Layer
- DTOs quando necessários
- validação no frontend e backend
- tratamento centralizado de erros
- controle de estado consistente
- segurança por padrão
- responsividade
- acessibilidade
- UX moderna
- Design System consistente
- código reutilizável
- componentes reutilizáveis
- tipagem forte quando disponível
- tratamento de loading
- tratamento de empty states
- tratamento de erros
- tratamento de sucesso
- prevenção de duplicidade
- prevenção de operações concorrentes
- logs apropriados

Não criar código duplicado apenas para fazer uma funcionalidade funcionar.

---

# 3. AUDITORIA COMPLETA

Antes de começar a corrigir, faça uma auditoria geral.

Crie internamente uma lista de:

### CRÍTICO

Funcionalidades quebradas, perda de dados, falha de pagamento, falha de autenticação ou vulnerabilidade.

### ALTO

Funcionalidades importantes que não funcionam corretamente.

### MÉDIO

Problemas de UX, validação, navegação ou inconsistências.

### BAIXO

Melhorias visuais, otimizações e pequenos ajustes.

Priorize:

**CRÍTICO → ALTO → MÉDIO → BAIXO**

---

# 4. ÁREA DO MEU CLIENTE

Corrigir e validar completamente a área:

**Meu Cliente / Cliente**

O usuário deve conseguir:

- visualizar clientes
- cadastrar cliente
- editar cliente
- excluir cliente
- visualizar detalhes
- pesquisar cliente
- filtrar cliente
- visualizar histórico quando aplicável
- associar cliente aos serviços/agendamentos
- validar campos obrigatórios
- impedir cadastro duplicado quando aplicável

### Cadastro

Criar formulário robusto.

Validar:

- nome
- telefone
- e-mail
- CPF quando utilizado
- data de nascimento quando utilizada
- campos obrigatórios

Mensagens devem ser claras.

Nunca mostrar mensagens técnicas como:

`500 Internal Server Error`

ou

`Failed to fetch`

para o usuário final.

Converter erros técnicos para mensagens amigáveis.

---

# 5. INCLUSÃO DE SERVIÇOS

A inclusão de serviço atualmente apresenta problemas.

Corrigir completamente.

O usuário deve conseguir:

- criar serviço
- informar nome
- descrição
- duração
- preço
- categoria
- status
- profissional associado quando aplicável

Após salvar:

- persistir corretamente no banco
- atualizar a lista automaticamente
- mostrar confirmação de sucesso
- impedir envio duplicado
- mostrar loading durante o salvamento
- impedir múltiplos cliques
- tratar erro da API

Validar também:

- campos obrigatórios
- valores inválidos
- preço negativo
- duração inválida
- serviço duplicado

---

# 6. INCLUSÃO DE PROFISSIONAIS

A inclusão de profissional atualmente NÃO está funcionando.

Investigue a causa real.

Não simplesmente faça um workaround no frontend.

Verifique:

- formulário
- validação
- endpoint/API
- autenticação
- autorização
- payload enviado
- estrutura do banco
- foreign keys
- RLS/permissões
- tratamento de erro
- resposta da API
- atualização da lista

O cadastro deve permitir, quando previsto pelo modelo atual:

- nome
- telefone
- e-mail
- especialidade
- serviços
- status
- foto, se existente

Após cadastro:

1. salvar no backend;
2. retornar resposta correta;
3. atualizar interface;
4. mostrar sucesso;
5. manter dados após recarregar a página.

---

# 7. EXCLUSÃO DE SERVIÇOS

A exclusão de serviços atualmente não funciona.

Corrigir.

Antes de excluir:

mostrar confirmação:

> "Tem certeza que deseja excluir este serviço?"

Se o serviço estiver vinculado a agendamentos ou outros registros importantes:

NÃO excluir silenciosamente.

Avaliar utilização de:

**Soft Delete**

quando necessário.

Exemplo:

`deleted_at`

ou

`active = false`

A exclusão deve respeitar integridade referencial.

Após excluir:

- atualizar lista
- mostrar confirmação
- remover item da interface
- não exigir refresh manual

---

# 8. EXCLUSÃO DE PROFISSIONAIS

Corrigir o mesmo problema para profissionais.

Antes de excluir:

confirmar ação.

Verificar vínculos com:

- agendamentos
- serviços
- clientes
- histórico
- pagamentos

Se houver dependências, utilizar desativação/soft delete quando necessário.

Nunca permitir exclusão que cause corrupção ou perda indevida de dados.

---

# 9. COPIAR LINK

A função:

**COPIAR LINK**

não está funcionando corretamente.

Corrigir.

Deve funcionar em:

- Chrome
- Edge
- Safari
- Firefox
- desktop
- celular

Utilizar a API adequada do navegador com fallback quando necessário.

Após copiar:

mostrar:

> "Link copiado!"

Não mostrar apenas um erro técnico.

Também verificar:

- HTTPS
- URL correta
- link público
- link do estabelecimento/profissional
- slug/id correto
- rota de destino

Testar o link copiado em uma nova aba.

---

# 10. CARTÃO DE CRÉDITO / CVC

O campo CVC está visualmente muito grande e existe falta de responsividade/recursividade no componente.

Corrigir o componente de pagamento.

O campo CVC deve ter:

- largura adequada
- altura consistente
- máscara apropriada
- limite de caracteres
- input numérico
- autocomplete apropriado
- validação
- responsividade

Não deixar o campo ocupar espaço desnecessário.

Revisar também:

- número do cartão
- validade
- CVC
- nome do titular
- mensagens de validação
- layout mobile
- layout desktop

IMPORTANTE:

Não armazenar dados sensíveis do cartão no banco da aplicação.

Utilizar tokenização/provedor de pagamento quando aplicável.

---

# 11. PAGAMENTO

Existe atualmente um erro semelhante a:

> "Erro na conexão / falha"

ao tentar pagar.

Investigar a causa real.

Não esconder o erro.

Verificar:

- frontend
- backend
- API
- gateway de pagamento
- ambiente
- chaves
- variáveis de ambiente
- CORS
- timeout
- webhook
- resposta HTTP
- tratamento de exceções
- autenticação

Criar mensagens específicas:

### Erro de conexão

> "Não foi possível conectar ao serviço de pagamento. Verifique sua conexão e tente novamente."

### Cartão recusado

> "O pagamento não foi autorizado pela operadora. Verifique os dados ou utilize outro cartão."

### Erro interno

> "Não conseguimos concluir o pagamento neste momento. Tente novamente em alguns instantes."

Nunca exibir stack trace para o usuário.

---

# 12. ESCOLHA DO PLANO

Atualmente não está sendo possível escolher o plano.

Corrigir completamente o fluxo.

O usuário deve conseguir:

1. visualizar planos;
2. comparar planos;
3. escolher um plano;
4. clicar em contratar;
5. criar conta ou entrar;
6. confirmar plano;
7. iniciar período gratuito quando aplicável;
8. cadastrar pagamento quando necessário;
9. finalizar contratação;
10. visualizar o plano ativo.

O plano escolhido deve permanecer associado à conta correta.

Não permitir que o frontend sozinho determine o preço.

O backend deve validar:

- plano
- preço
- status
- período
- permissões

---

# 13. PERÍODO GRATUITO

Atualmente o período gratuito não está sendo liberado.

Corrigir a regra de negócio.

Definir claramente:

- duração do trial;
- data de início;
- data de término;
- plano durante trial;
- funcionalidades disponíveis;
- status da assinatura;
- comportamento após término.

Exemplo:

`trialing`

→ `active`

ou

`trialing`

→ `expired`

O período gratuito deve ser controlado pelo backend.

Não confiar somente na data armazenada no frontend.

Evitar que o usuário consiga reiniciar o período gratuito simplesmente criando estados artificiais no cliente.

---

# 14. CRIAÇÃO DE CONTA

Existe erro ao criar conta.

Investigar completamente.

Verificar:

- formulário
- validações
- autenticação
- criação do usuário
- criação do perfil
- criação da empresa/estabelecimento
- relacionamento entre tabelas
- permissões
- RLS
- sessão
- redirecionamento
- tratamento de erro

Fluxo esperado:

### Criar conta

↓

Validar dados

↓

Criar usuário

↓

Criar perfil

↓

Criar estabelecimento/conta

↓

Associar plano/trial

↓

Criar dados iniciais necessários

↓

Criar sessão

↓

Redirecionar para dashboard

Tudo deve ocorrer de maneira consistente.

Se alguma etapa falhar, não deixar registros incompletos.

Quando necessário, utilizar transação no backend/banco.

---

# 15. LOGIN

Auditar completamente o login.

Testar:

- usuário correto
- senha incorreta
- usuário inexistente
- sessão expirada
- logout
- refresh da página
- acesso direto a rotas protegidas
- recuperação de senha
- persistência de sessão

Mensagens amigáveis.

---

# 16. DASHBOARD

Auditar o dashboard.

Verificar:

- carregamento
- informações corretas
- números reais do banco
- estados vazios
- loading
- erros
- responsividade
- performance

Não utilizar dados mockados em funcionalidades que deveriam utilizar dados reais.

---

# 17. NAVEGAÇÃO

Testar TODAS as rotas.

Para cada rota:

- abrir diretamente
- atualizar página
- navegar pelo menu
- voltar
- avançar
- acessar sem autenticação
- acessar com autenticação
- acessar sem permissão

Não permitir telas quebradas ou páginas em branco.

Criar:

- loading
- 404
- erro
- acesso negado

quando necessário.

---

# 18. RESPONSIVIDADE

Testar no mínimo:

### Desktop

1920px  
1440px  
1280px

### Tablet

1024px  
768px

### Mobile

430px  
390px  
375px

Corrigir:

- campos grandes
- botões quebrados
- tabelas
- menus
- modais
- cards
- formulários
- pagamentos
- navegação

Priorizar experiência mobile.

---

# 19. UX/UI

Faça uma revisão visual completa.

Manter identidade visual do projeto.

Corrigir:

- espaçamentos
- tamanhos
- alinhamento
- tipografia
- hierarquia visual
- botões
- inputs
- modais
- cards
- tabelas
- mensagens
- estados de loading
- estados vazios

Criar componentes consistentes.

Não criar um estilo diferente para cada tela.

---

# 20. TRATAMENTO DE ERROS

Criar uma estratégia global de erros.

Categorias:

- validação
- autenticação
- autorização
- conexão
- API
- banco
- pagamento
- timeout
- recurso inexistente
- conflito
- erro inesperado

O usuário deve receber mensagens claras.

O desenvolvedor deve ter informações suficientes nos logs para descobrir o problema.

---

# 21. BANCO DE DADOS

Auditar o banco.

Verificar:

- tabelas
- relacionamentos
- foreign keys
- índices
- constraints
- dados duplicados
- dados órfãos
- permissões
- RLS
- políticas
- integridade

Não apagar dados existentes.

Não alterar estrutura de produção de forma destrutiva.

Quando necessário:

- criar migration;
- documentar alteração;
- testar migration;
- validar rollback quando aplicável.

---

# 22. SEGURANÇA

Auditar:

- autenticação
- autorização
- RLS
- exposição de dados
- APIs
- secrets
- variáveis de ambiente
- XSS
- CSRF quando aplicável
- validação de entrada
- SQL injection
- controle de acesso
- dados financeiros

Nunca colocar:

- secret keys
- service role keys
- senhas
- tokens privados

no frontend.

---

# 23. PERFORMANCE

Verificar:

- chamadas API desnecessárias
- consultas duplicadas
- carregamentos repetidos
- imagens
- bundle
- componentes
- cache
- paginação
- debounce
- índices do banco

O sistema deve ser leve.

Evitar carregar dados desnecessários.

---

# 24. DADOS MOCKADOS

Faça uma varredura procurando:

- mocks
- dados fictícios
- valores hardcoded
- preços fixos no frontend
- IDs fixos
- usuários fictícios
- respostas simuladas

Se uma funcionalidade deveria funcionar em produção, substituir o mock pela integração real.

---

# 25. TESTE DOS FLUXOS PRINCIPAIS

Depois das correções, testar de ponta a ponta:

### FLUXO 1

Visitante

→ Landing Page

→ Planos

→ Escolhe plano

→ Criar conta

→ Trial

→ Dashboard

### FLUXO 2

Cliente

→ Login

→ Dashboard

→ Clientes

→ Criar cliente

→ Editar

→ Excluir

### FLUXO 3

Administrador

→ Serviços

→ Criar serviço

→ Editar

→ Excluir

### FLUXO 4

Administrador

→ Profissionais

→ Criar profissional

→ Editar

→ Excluir

### FLUXO 5

Usuário

→ Escolher plano

→ Pagamento

→ Confirmação

→ Assinatura ativa

### FLUXO 6

Usuário

→ Copiar link público

→ Abrir link em aba anônima

→ Ver página pública

---

# 26. REGRA PARA NÃO QUEBRAR FUNCIONALIDADES

Antes de modificar uma funcionalidade existente:

1. identificar dependências;
2. entender o fluxo;
3. corrigir a causa;
4. testar impacto;
5. testar funcionalidades relacionadas.

Não fazer alterações aleatórias.

Não substituir uma implementação funcional sem necessidade.

---

# 27. CRITÉRIO DE ACEITE

Uma funcionalidade somente deve ser considerada concluída quando:

- funciona;
- salva corretamente;
- recupera corretamente;
- funciona após refresh;
- funciona no mobile;
- funciona no desktop;
- trata erros;
- possui loading;
- possui confirmação;
- respeita permissões;
- não gera duplicidade;
- não quebra outra funcionalidade.

---

# 28. DOCUMENTAÇÃO DAS CORREÇÕES

Ao final, gerar um relatório contendo:

### Corrigido

Lista de todos os problemas encontrados e corrigidos.

### Melhorado

Lista das melhorias realizadas.

### Problemas encontrados

Lista de problemas que existiam.

### Problemas ainda pendentes

Somente se realmente houver algo que não possa ser concluído.

### Banco de dados

Informar alterações realizadas.

### API

Informar endpoints corrigidos/criados.

### Segurança

Informar vulnerabilidades corrigidas.

### Pagamento

Informar o fluxo validado.

### Testes

Informar quais fluxos foram testados.

---

# 29. REGRA IMPORTANTE SOBRE "E VAI SABER MAIS O QUE ESTÁ RUIM"

Não limitar a auditoria aos problemas descritos neste prompt.

Os problemas listados são apenas os problemas já identificados.

Faça uma:

**AUDITORIA FUNCIONAL COMPLETA DO SISTEMA**

Procure também por:

- botões que não fazem nada;
- links quebrados;
- telas incompletas;
- formulários sem validação;
- APIs quebradas;
- erros silenciosos;
- dados que não persistem;
- dados que desaparecem após refresh;
- inconsistências de estado;
- problemas de autenticação;
- problemas de autorização;
- problemas de RLS;
- problemas de responsividade;
- problemas de acessibilidade;
- problemas de performance;
- problemas de UX;
- dados mockados;
- problemas de pagamento;
- problemas de assinatura;
- problemas de trial;
- problemas de recuperação de senha;
- problemas de sessão;
- problemas de cadastro;
- problemas de exclusão;
- problemas de edição;
- problemas de pesquisa;
- problemas de filtros;
- problemas de paginação;
- problemas de notificações;
- problemas de mensagens;
- problemas de integração.

---

# 30. NÃO FINALIZE SEM TESTAR

Depois de implementar as correções:

**TESTE NOVAMENTE TODO O SISTEMA.**

Não assumir que uma funcionalidade funciona apenas porque o código não apresenta erro.

Simular o comportamento real de um usuário.

Testar:

**Criar → Editar → Excluir → Recarregar → Login novamente → Verificar persistência.**

Também testar:

**Cadastro → Trial → Escolha de plano → Pagamento → Assinatura → Dashboard.**

---

# RESULTADO ESPERADO

Entregar o **BELEZA PERFEITA** em estado de:

### PRODUÇÃO

com:

- funcionalidades funcionando;
- cadastro funcionando;
- clientes funcionando;
- profissionais funcionando;
- serviços funcionando;
- exclusões funcionando;
- links funcionando;
- planos funcionando;
- trial funcionando;
- pagamento funcionando;
- mensagens de erro adequadas;
- segurança adequada;
- banco consistente;
- responsividade;
- boa UX;
- boa performance.

**Não apenas corrigir os problemas relatados.**

Faça uma verdadeira **auditoria de qualidade e correção completa do SaaS** e entregue o sistema com padrão profissional de produção.
