import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Lock, 
  Eye, 
  Database, 
  FileCheck, 
  CheckCircle2, 
  Sparkles, 
  UserCheck, 
  Key, 
  Server, 
  Mail 
} from "lucide-react";
import { Button, Badge } from "@/components/ui";

export default function Privacy() {
  const navigate = useNavigate();

  const sections = [
    {
      id: "compromisso",
      title: "1. Nosso Compromisso com a Privacidade e Segurança",
      icon: ShieldCheck,
      content: (
        <>
          <p className="text-muted-foreground leading-relaxed">
            A <strong>Geevheit Technology</strong>, desenvolvedora e mantenedora da plataforma <strong>GeevheitHair</strong>, tem como pilar inegociável a segurança da informação, a confidencialidade e a privacidade dos dados de todos os usuários que interagem com o nosso ecossistema.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            Esta Política de Privacidade foi elaborada em estrita conformidade com a <strong>Lei Geral de Proteção de Dados Pessoais (LGPD - Lei Federal nº 13.709/2018)</strong>, com o <strong>Marco Civil da Internet (Lei Federal nº 12.965/2014)</strong> e com as melhores práticas internacionais de segurança da informação.
          </p>
        </>
      ),
    },
    {
      id: "papeis",
      title: "2. Definição de Papéis perante a LGPD",
      icon: UserCheck,
      content: (
        <>
          <p className="text-muted-foreground leading-relaxed">
            Para fins de clareza e transparência jurídica quanto às responsabilidades estabelecidas pelo art. 5º da LGPD:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="p-4 rounded-2xl border border-border bg-muted/20">
              <span className="font-semibold text-foreground text-sm block mb-1">
                O Salão / Estabelecimento é o CONTROLADOR
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                O salão parceiro (lojista) toma as decisões sobre a coleta e finalidade dos dados de seus clientes, como registro de contatos, histórico de atendimentos, agendamento de horários e cobrança de serviços.
              </p>
            </div>
            <div className="p-4 rounded-2xl border border-border bg-muted/20">
              <span className="font-semibold text-foreground text-sm block mb-1">
                O GeevheitHair é o OPERADOR
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                O GeevheitHair processa, armazena e protege os dados em nome do estabelecimento, fornecendo os recursos computacionais, automação de agendamentos e regras técnicas sem comercializar os dados para terceiros.
              </p>
            </div>
          </div>
        </>
      ),
    },
    {
      id: "dados-coletados",
      title: "3. Dados Coletados e Finalidade do Tratamento",
      icon: Database,
      content: (
        <>
          <p className="text-muted-foreground leading-relaxed">
            Coletamos apenas os dados <strong>estritamente necessários (princípio da necessidade e minimização)</strong> para a operacionalização dos serviços de agendamento e gestão:
          </p>
          <div className="space-y-3 mt-3">
            <div className="p-3.5 rounded-xl border border-border/80 bg-card">
              <strong className="text-sm text-foreground block">A. Dados dos Gestores e Salões (Contratantes):</strong>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Nome completo, e-mail comercial, senha cifrada, nome do estabelecimento, CNPJ/CPF (opcional para faturamento), horários de funcionamento e Chave PIX pública (para recebimento direto dos agendamentos e sinais).
              </p>
            </div>
            <div className="p-3.5 rounded-xl border border-border/80 bg-card">
              <strong className="text-sm text-foreground block">B. Dados dos Clientes Finais (Agendamento Online):</strong>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Nome e número de WhatsApp/Telefone para identificação do atendimento, envio automático de confirmação, lembretes de horário e verificação do status da reserva. Não solicitamos nem armazenamos biometria, dados de saúde ou informações sensíveis não pertinentes.
              </p>
            </div>
          </div>
        </>
      ),
    },
    {
      id: "bases-legais",
      title: "4. Bases Legais para o Tratamento (Art. 7º da LGPD)",
      icon: FileCheck,
      content: (
        <>
          <p className="text-muted-foreground leading-relaxed">
            Todo tratamento de dados realizado na plataforma apoia-se em fundamentos legais legítimos:
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-2 text-muted-foreground text-sm">
            <li>
              <strong>Execução de Contrato (Art. 7º, V):</strong> Viabilizar a contratação do plano SaaS pelo salão e efetivar a reserva de horário solicitada pelo cliente final.
            </li>
            <li>
              <strong>Legítimo Interesse (Art. 7º, IX):</strong> Prevenção a faltas injustificadas (no-show), aprimoramento da estabilidade do sistema e combate a fraudes e acessos não autorizados.
            </li>
            <li>
              <strong>Cumprimento de Obrigação Legal (Art. 7º, II):</strong> Guarda de registros eletrônicos de acesso à aplicação pelo prazo legal de 6 meses, conforme determina o Marco Civil da Internet (art. 15 da Lei nº 12.965/2014).
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "seguranca-tecnica",
      title: "5. Arquitetura de Segurança da Informação",
      icon: Lock,
      content: (
        <>
          <p className="text-muted-foreground leading-relaxed">
            O GeevheitHair adota medidas técnicas, organizacionais e criptográficas robustas para resguardar a integridade e sigilo dos dados:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <div className="p-3.5 rounded-2xl border border-border bg-card flex items-start gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-sm text-foreground block">Criptografia de Senhas</strong>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Senhas dos usuários são protegidas com algoritmos irreversíveis de dispersão (bcrypt com salt), tornando impossível a visualização em texto simples mesmo por administradores.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border border-border bg-card flex items-start gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-sm text-foreground block">Autenticação JWT</strong>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Comunicação autenticada via tokens JSON Web Tokens (JWT) assinados criptograficamente, com validação de expiração e escopo a cada requisição.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border border-border bg-card flex items-start gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-sm text-foreground block">Isolamento Multi-Tenant</strong>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Segregação lógica absoluta: todas as consultas do banco de dados são restritas pelo identificador do salão (<code className="text-[11px] bg-muted px-1 rounded">SalonID</code>), impedindo vazamento cruzado de informações.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border border-border bg-card flex items-start gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-sm text-foreground block">Tráfego HTTPS / TLS</strong>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Todo o tráfego de rede entre navegadores e nossos servidores opera sobre protocolo seguro HTTPS com certificados TLS modernos e criptografia de 256 bits.
                </p>
              </div>
            </div>
          </div>
        </>
      ),
    },
    {
      id: "pagamentos-pix",
      title: "6. Segurança em Pagamentos e PIX",
      icon: CheckCircle2,
      content: (
        <>
          <p className="text-muted-foreground leading-relaxed">
            A plataforma <strong>não armazena nem processa números de cartão de crédito</strong>, senhas bancárias ou códigos de segurança CVV em seus bancos de dados locais.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-2 text-sm">
            Os pagamentos da taxa de sinal e reservas são realizados via transferências instantâneas PIX diretamente para a chave cadastrada pelo estabelecimento ou liquidados por gateways autorizados pelo Banco Central do Brasil, garantindo a conformidade com as normas financeiras do BACEN.
          </p>
        </>
      ),
    },
    {
      id: "direitos-titular",
      title: "7. Direitos dos Titulares de Dados (Art. 18 da LGPD)",
      icon: Eye,
      content: (
        <>
          <p className="text-muted-foreground leading-relaxed">
            Em conformidade com o artigo 18 da LGPD, os titulares de dados pessoais podem exercer a qualquer momento perante a plataforma os seguintes direitos:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3 text-xs text-muted-foreground">
            <div className="p-2.5 rounded-xl border border-border bg-muted/20">
              <span className="font-semibold text-foreground">1. Confirmação e Acesso:</span> Saber se tratamos seus dados e quais dados possuímos.
            </div>
            <div className="p-2.5 rounded-xl border border-border bg-muted/20">
              <span className="font-semibold text-foreground">2. Correção:</span> Solicitar retificação de dados incorretos ou desatualizados.
            </div>
            <div className="p-2.5 rounded-xl border border-border bg-muted/20">
              <span className="font-semibold text-foreground">3. Eliminação e Anonimização:</span> Solicitar a exclusão de dados tratados sem base legal ou após o término da relação contratual.
            </div>
            <div className="p-2.5 rounded-xl border border-border bg-muted/20">
              <span className="font-semibold text-foreground">4. Revogação de Consentimento:</span> Retirar autorizações previamente concedidas de forma facilitada.
            </div>
          </div>
        </>
      ),
    },
    {
      id: "contato-dpo",
      title: "8. Encarregado pelo Tratamento de Dados (DPO)",
      icon: Mail,
      content: (
        <>
          <p className="text-muted-foreground leading-relaxed">
            Para exercer seus direitos de privacidade, esclarecer dúvidas sobre o tratamento de dados pessoais ou reportar qualquer incidente de segurança, entre em contato diretamente com o nosso canal de privacidade:
          </p>
          <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 mt-3 flex items-center justify-between flex-wrap gap-3">
            <div>
              <span className="text-sm font-semibold text-foreground block">
                Canal Oficial de Privacidade e DPO
              </span>
              <span className="text-xs text-muted-foreground">
                Geevheit Technology • Encarregado de Dados
              </span>
            </div>
            <a 
              href="mailto:geevheittecnology@gmail.com" 
              className="text-sm font-medium text-primary hover:underline flex items-center gap-1.5"
            >
              <Mail className="w-4 h-4" /> geevheittecnology@gmail.com
            </a>
          </div>
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate("/")} 
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Voltar ao Início</span>
            </button>
            <span className="text-border">|</span>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-serif text-lg font-semibold tracking-tight">GeevheitHair</span>
            </div>
          </div>

          <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs">
            Conforme LGPD • Lei 13.709/18
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-5 py-12 md:py-16 w-full animate-fade-up">
        {/* Hero Banner */}
        <div className="mb-10 text-center md:text-left border-b border-border pb-8">
          <Badge className="mb-4 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
            Segurança & Proteção de Dados
          </Badge>
          <h1 className="font-serif text-3xl md:text-5xl font-medium tracking-tight mb-4 text-foreground">
            Política de Privacidade e Segurança
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-3xl leading-relaxed">
            Transparência total sobre como tratamos, armazenamos e protegemos os seus dados e os dados dos clientes do seu salão de beleza no <strong>GeevheitHair</strong>.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span>Última atualização: Outubro de 2026</span>
            <span>•</span>
            <span>Em conformidade com a LGPD e Marco Civil da Internet</span>
          </div>
        </div>

        {/* Quick Topics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
          {sections.map((sec) => (
            <a 
              key={sec.id}
              href={`#${sec.id}`}
              className="p-3 text-xs rounded-xl border border-border bg-card/60 hover:bg-muted/80 hover:border-primary/40 transition-all font-medium text-muted-foreground hover:text-foreground text-center line-clamp-1"
            >
              {sec.title.split(". ")[1]}
            </a>
          ))}
        </div>

        {/* Sections List */}
        <div className="space-y-6">
          {sections.map((sec) => {
            const Icon = sec.icon;
            return (
              <section 
                key={sec.id} 
                id={sec.id} 
                className="scroll-mt-24 p-6 md:p-8 rounded-3xl border border-border bg-card shadow-sm hover:border-border/80 transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl md:text-2xl font-medium text-foreground">
                      {sec.title}
                    </h2>
                  </div>
                </div>
                <div className="pl-0 md:pl-14 text-sm md:text-base">
                  {sec.content}
                </div>
              </section>
            );
          })}
        </div>

        {/* Bottom Card */}
        <div className="mt-12 p-8 rounded-3xl border border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div>
            <h3 className="font-serif text-xl font-medium text-foreground mb-1">
              Deseja consultar ou excluir seus dados?
            </h3>
            <p className="text-muted-foreground text-sm">
              Você pode solicitar o exercício de qualquer direito previsto no art. 18 da LGPD através do nosso canal de privacidade.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Button variant="outline" onClick={() => navigate("/termos")}>
              Ver Termos de Uso
            </Button>
            <Button onClick={() => navigate("/")}>
              Voltar ao Início
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 mt-12">
        <div className="max-w-5xl mx-auto px-5 text-center text-xs text-muted-foreground">
          © 2026 Geevheith Software Solutions. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
