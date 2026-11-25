Você é um engenheiro sênior de segurança e DevOps. Vou lançar um SaaS em produção e quero que você audite o projeto com um checklist de go-live e um roteiro de testes ponta a ponta.



REGRAS
- Não invente: só reporte o que você realmente viu no código ou nos arquivos de configuração. Se não der para verificar (painel da Vercel, Supabase, Neon, provedor de pagamento), marque como "VERIFICAR MANUALMENTE" e diga onde olhar.
- Não altere nada sem eu pedir. Primeiro só audite.
- Nunca mostre valores de chaves ou segredos; cite apenas o arquivo e a linha.

ETAPA 1: AUDITORIA DO CÓDIGO
Para cada item, responda OK / FALHA / VERIFICAR MANUALMENTE, com arquivo e linha quando aplicável:

Segurança
- .env no .gitignore e nenhum segredo no repositório nem no histórico do Git
- Chave de admin do banco (service_role no Supabase) só no back-end, nunca em variável NEXT_PUBLIC_
- CORS no Gin liberando só o domínio do front (sem "*"), com preflight OPTIONS e headers Authorization e Content-Type
- Rate limit em login e rotas sensíveis
- Toda rota protegida valida o token (JWT) e retorna 401 sem token ou com token inválido; rotas de admin retornam 403 para usuário comum
- Nenhuma resposta de erro expõe stack trace ou detalhes internos

Isolamento de dados (o mais crítico)
- Toda query filtra pelo ID do usuário autenticado, sem confiar em ID vindo do corpo ou da URL (IDOR)
- Se Supabase: RLS ativo e com políticas corretas nas tabelas acessadas pelo front
- Se Neon: não há RLS nem auth embutidos, então a autorização é toda da API Go. Liste TODAS as rotas e diga se cada uma checa autenticação e propriedade dos dados

Infra
- Connection string com pooler (Supabase: porta 6543; Neon: host com -pooler) e pool pequeno (SetMaxOpenConns 1 a 3)
- Pool de conexão criado uma vez por instância (once.Do), sem router.Run()
- api/index.go exporta Handler corretamente; vercel.json com rewrite para /api; go.mod na raiz
- Endpoint /health existe
- Lista das variáveis de ambiente que o código lê, para eu conferir se estão todas em Production na Vercel

Auth
- URLs de produção (Site URL e Redirect URLs), sem localhost hardcoded
- Recuperação de senha e confirmação de e-mail funcionando com SMTP próprio

Pagamentos
- Webhook valida a assinatura, responde 200 rápido e é idempotente (reenvio não duplica liberação)
- Chaves live x teste separadas por ambiente
- Cartão recusado, cancelamento e estorno tratados

Legal e suporte
- Termos, Política de Privacidade (LGPD), aceite no cadastro, contato de suporte e forma de excluir a conta/dados do usuário

ETAPA 2: RELATÓRIO
Entregue:
1. Tabela de itens: status, risco (crítico / alto / médio / baixo) e correção sugerida
2. Lista "BLOQUEIA O LANÇAMENTO" (falhas críticas, principalmente de isolamento de dados e pagamento)
3. Lista "PODE FICAR PARA DEPOIS" (primeiras 2 semanas)
4. Itens "VERIFICAR MANUALMENTE" em forma de checklist com marcadores [ ]

ETAPA 3: ROTEIRO DE TESTE
Gere um roteiro de teste ponta a ponta adaptado ao meu código, com os blocos: Infra, Cadastro/login, Fluxo principal, Segurança e isolamento (contas A e B, requisição sem token, token inválido, rota de admin, brute force), Pagamento (cobrança real pequena, webhook, recusa, cancelamento, reenvio duplicado, estorno), Celular e navegadores, Monitoramento (Sentry, logs, rollback) e Legal/LGPD.
Para o bloco de segurança, escreva os comandos curl prontos para testar cada rota protegida, usando placeholders como <TOKEN_A>, <TOKEN_B> e <ID_DA_CONTA_A>.

ETAPA 4: PRÓXIMO PASSO
Pergunte se pode corrigir os itens que bloqueiam o lançamento, um por vez, mostrando o diff antes de aplicar.