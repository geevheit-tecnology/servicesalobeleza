# 🚀 Guia de Produção BelezaPura (Custo Zero: R$ 0,00)

Este projeto está 100% centralizado e pronto para produção em **Supabase**, **Vercel** e **Docker**, com custo **R$ 0,00** até o seu primeiro cliente pagante, sem nenhuma dependência do Render.

---

## 🏗️ 1. Arquitetura da Solução

* **Frontend Web:** [Vercel](https://vercel.com) (Plano Hobby Gratuito)
* **Banco de Dados & Auth:** [Supabase](https://supabase.com) (Projeto: `yugrmyjvespydrggutvo` - Plano Free)
* **Backend API & WhatsApp:** Docker Compose local / Cloudflare Tunnel / VPS Gratuita
* **Automação WhatsApp:** Evolution API v2 em Docker (sem custo por mensagem de intermediários)

---

## ⚡ 2. Passo 1: Executar o Banco no Supabase (1 Clique)

Toda a estrutura do banco de dados, tabelas, planos e a conta do Administrador Geral já foram consolidadas no arquivo:
👉 `supabase/migrations/20261107000000_belezapura_init.sql`

### Como rodar:
1. Acesse o painel do Supabase no projeto **`yugrmyjvespydrggutvo`**:
   🔗 [https://supabase.com/dashboard/project/yugrmyjvespydrggutvo/sql](https://supabase.com/dashboard/project/yugrmyjvespydrggutvo/sql)
2. Clique em **SQL Editor** > **New Query**;
3. Copie todo o conteúdo do arquivo `supabase/migrations/20261107000000_belezapura_init.sql`;
4. Cole e clique em **Run** (Executar).

Pronto! Todas as tabelas, planos e a conta do SuperAdmin serão criados instantaneamente.

---

## 🔐 3. Credenciais Prontas do Sistema

Após rodar o SQL acima, você já tem a conta mestre criada:

* **Painel SuperAdmin:** `/login-admin` ou `/superadmin`
* **E-mail:** `admin@belezapura.com.br`
* **Senha:** `AdminBelezaPura2026!`

---

## 🐳 4. Passo 2: Subir o Backend e WhatsApp com Docker

Os arquivos `.env` já estão configurados com o seu projeto Supabase. Só falta colocar a senha do seu banco:

1. Abra o arquivo `.env` (na raiz do projeto) e coloque a senha do banco em:
   ```env
   DATABASE_URL=postgres://postgres:[SUA_SENHA]@db.yugrmyjvespydrggutvo.supabase.co:5432/postgres?sslmode=require
   ```
2. No seu terminal, suba os containers:
   ```bash
   docker compose up -d
   ```
3. Os 3 serviços estarão rodando:
   * **`belezapura_api`**: API Go na porta `3050`
   * **`belezapura_whatsapp`**: Gateway WhatsApp na porta `8084`
   * **`belezapura_redis`**: Fila e sessões na porta `6379`

---

## 🌐 5. Passo 3: Publicar o Frontend na Vercel (Custo R$ 0,00)

1. Conecte o repositório na [Vercel](https://vercel.com);
2. Configure a pasta raiz como `belezapura_web`;
3. Em **Environment Variables**, adicione:
   * `VITE_API_URL`: URL onde sua API estiver rodando (ex: seu domínio ou URL do Cloudflare Tunnel);
4. Clique em **Deploy**.

---

## 📲 6. Passo 4: Conectar o WhatsApp do Salão

1. Acesse o painel do salão (`/admin`);
2. Clique no menu **WhatsApp & Bot**;
3. No seu WhatsApp do celular, vá em **Aparelhos Conectados** e escaneie o QR Code;
4. O bot está ativo! Todas as confirmações de novos agendamentos com chave Pix e lembretes serão disparados automaticamente com **custo zero** por mensagem.
