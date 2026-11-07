Você é um engenheiro de software sênior trabalhando no repositório aberto, um SaaS de agendamento chamado BelezaPura (publicado na Vercel). O sistema JÁ FUNCIONA em produção. Sua missão é redirecionar o posicionamento e o texto do site para um novo público, SEM quebrar nenhuma funcionalidade existente, e deixar o projeto pronto para publicar.

REGRA Nº 1: NÃO QUEBRAR NADA
- Antes de qualquer mudança, rode git status e git log -5. Se houver alterações não commitadas, pare e me avise.
- Crie uma branch nova: git checkout -b ajuste-posicionamento. Nunca trabalhe direto na main.
- NÃO altere: lógica de agendamento, geração do código/QR do Pix, autenticação, banco de dados, esquemas, rotas de API, variáveis de ambiente, cálculo de comissão, estoque, nem configurações da Vercel.
- Se uma mudança de texto exigir mexer em lógica, pare e me pergunte antes.
- Faça mudanças pequenas, uma por vez, e rode o build/lint/testes (se existirem) após cada etapa. Se algo falhar, reverta aquela etapa e me explique.

ETAPA 0: RECONHECIMENTO (somente leitura, nada de edição)
1. Leia a estrutura do projeto, o package.json, o framework usado e como o build funciona.
2. Descubra onde ficam: a landing page, o mockup do WhatsApp, a calculadora de retorno, a seção de planos, o FAQ, o rodapé, o título e a meta description do HTML.
3. Mostre um resumo curto do que encontrou e a lista de arquivos que pretende editar. Aguarde meu "ok" antes de continuar.

NOVO FOCO DO PRODUTO
Antes: "salões, barbearias e clínicas de estética".
Agora: clínicas e salões de ESTÉTICA, studios de BRONZEAMENTO e NAIL DESIGNERS (unha de gel, manicure, pedicure), com foco no público feminino. Não é mais para barbearia.

ETAPA 1: TEXTO (só conteúdo, sem tocar em lógica)
Substitua os textos conforme abaixo, mantendo componentes, classes, estilos e comportamento.

- Faixa do topo: "14 dias grátis, sem cartão. Você testa com suas clientes de verdade."
- Título principal: "Cliente marcou, pagou o sinal, veio."
- Subtítulo: "Agenda online para estética, bronzeamento e unhas. Sua cliente escolhe o serviço e a profissional pelo link do Instagram, paga o sinal no Pix e o horário fica reservado."
- Botões: "Testar 14 dias grátis" e "Ver como a cliente agenda".
- Mockup do WhatsApp: trocar por "Oi! Quero agendar alongamento em gel pra sábado às 14h com a Rafaela." / "Horário reservado! Pra confirmar, o sinal de 20% (R$ 36,00) é no Pix. O resto você paga no dia." Trocar os chips de serviço por: Alongamento em gel, Drenagem, Bronzeamento com fita. Remover qualquer menção a "Corte Degradê" e a barbearia.
- Selo "Sinal no PIX Garantido": trocar por "Sinal no Pix, direto na sua conta".
- Selo "-40% Faltas": trocar por "Menos faltas com o sinal" (sem número, até eu ter dados reais de clientes).
- Blocos de benefícios (nesta ordem):
  1. "Faltou? Quem paga não é você." / "Uma progressiva ou um alongamento ocupam horas de cadeira. Com o sinal no Pix, a cliente só segura o horário se realmente pretende vir."
  2. "Link na bio que agenda de madrugada." / "A cliente que pensou no assunto às 23h30 marca na hora, sem esperar você responder o direct."
  3. "Comissão sem caderninho." / "No fim do mês você vê quanto cada profissional produziu e uma estimativa da comissão."
  4. "Estoque que avisa." / "Esmalte, gel, creme, óleo de bronzeamento: cadastre e veja o que está abaixo do mínimo."
  5. "Agenda que respeita o tempo de cada serviço." / "Alongamento leva 3h, manutenção 1h30. O sistema considera a duração, o expediente e os dias bloqueados."
- "Como funciona", 4 passos: 1) Ela abre o link da sua bio. 2) Escolhe o serviço, a profissional e o horário. 3) Paga o sinal no Pix. 4) Você confere no banco e confirma.
- Título da calculadora: "Quanto as faltas custam pra você?". Aviso abaixo: "Estimativa: considera que o sinal reduz as faltas em 40%. Seu resultado pode variar."
- Chamada final: "Comece hoje. Cadastre seus serviços e sua chave Pix em uns 3 minutos e mande o link pras clientes."
- Rodapé: "Plataforma de agendamento para estética, bronzeamento e nail designers." Deixe um espaço editável para "Feito por [SEU NOME], em [SUA CIDADE]. Fale comigo no WhatsApp: [NÚMERO]". Não invente nome nem número; deixe como placeholder e me avise.
- Remova palavras genéricas: "ecossistema definitivo", "Sinal Inteligente", "blindar", "Visão estratégica em tempo real", "Eficiência Operacional", "elegância e controle". Substitua por frases simples e concretas.
- Atualize o <title> e a meta description do HTML para o novo foco (estética, bronzeamento e unhas).

ETAPA 2: BUG DA CALCULADORA (investigar com cuidado)
- A calculadora exibe "R$ 424,1,00 / mês" quando o certo seria "R$ 424,10". Encontre a causa (provavelmente formatação de moeda) e corrija SOMENTE a formatação.
- Teste com vários valores (0, 1, 3, 10 profissionais; tickets e faltas diferentes) e confirme que nenhum resultado aparece com formato quebrado. Não altere a fórmula de cálculo.

ETAPA 3: CONSISTÊNCIA
- Faça uma busca por "barbearia", "barbeiro", "degradê" e "barba" em todo o projeto (incluindo textos de demonstração, metadados e FAQ) e me liste o que encontrar. Troque somente o que for texto visível ao público e me avise do restante.
- Confira se o FAQ tem respostas coerentes com o fluxo real (principalmente: para onde vai o dinheiro do sinal, e que o salão confere o recebimento e confirma manualmente). Não prometa integração automática com WhatsApp, repasses bancários ou multiunidades, pois não existem nesta versão.

ETAPA 4: VERIFICAÇÃO ANTES DE PUBLICAR
1. Rode build, lint e testes. Corrija apenas o que as minhas mudanças causaram.
2. Teste no navegador (mobile e desktop): landing, cadastro, login, criar serviço, agendamento pelo link público e geração do Pix.
3. Confirme que não há links quebrados, textos cortados ou erros no console.
4. Gere um resumo (diff) em linguagem simples do que mudou, arquivo por arquivo.
5. Faça commits pequenos e com mensagens claras.

PUBLICAÇÃO
- NÃO faça merge na main nem deploy em produção sozinho. Faça push da branch e me passe o link de preview da Vercel para eu revisar.
- Só depois do meu "aprovado", explique o passo a passo para o merge e o deploy.

REGRAS GERAIS
- Se algo estiver ambíguo, pergunte antes de agir.
- Não instale dependências novas sem me avisar.
- Não exponha chaves, tokens ou dados sensíveis em nenhum arquivo ou resposta.
- Mantenha a identidade visual atual nesta rodada; só alteramos texto e o bug da calculadora.