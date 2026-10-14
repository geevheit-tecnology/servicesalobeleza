import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  CreditCard, 
  UserCheck, 
  Scale, 
  AlertCircle 
} from "lucide-react";
import { Button, Badge } from "@/components/ui";

export default function Terms() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("todos");

  const sections = [
    {
      id: "objeto",
      title: "1. Objeto e Definição da Plataforma",
      icon: FileText,
      content: (
        <>
          <p className="text-muted-foreground leading-relaxed">
            A plataforma <strong>GeevheitHair</strong> (desenvolvida e operada por <em>Geevheit Technology</em>) é um software como serviço (SaaS) especializado na gestão operacional, controle de horários, catálogo de serviços e agendamento online inteligente para salões de beleza, barbearias, esmalterias, clínicas de estética e profissionais autônomos.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            O GeevheitHair atua como facilitador tecnológico e ponte de comunicação entre os estabelecimentos de beleza (Contratantes/Lojistas) e seus respectivos clientes finais (Usuários Agendadores). O serviço abrange painel administrativo, link público de agendamento personalizado (<code className="text-xs bg-muted px-1.5 py-0.5 rounded text-foreground">/agendar/:slug</code>), gestão de profissionais e regras automáticas de confirmação e lembretes.
          </p>
        </>
      ),
    },
    {
      id: "cadastro",
      title: "2. Cadastro, Acesso e Segurança da Conta",
      icon: UserCheck,
      content: (
        <>
          <p className="text-muted-foreground leading-relaxed">
            Para utilizar os recursos completos de gestão, o estabelecimento deve efetuar o cadastro através do fluxo de integração (Onboarding), fornecendo informações verídicas e atualizadas, como nome do estabelecimento, e-mail de contato, senha e documento (CPF/CNPJ).
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-2 text-muted-foreground">
            <li>
              <strong>Sigilo das Credenciais:</strong> O acesso ao painel é pessoal e intransferível. As senhas são criptografadas por algoritmos de dispersão unidirecional (bcrypt). O usuário é o único responsável pela guarda e confidencialidade de sua senha.
            </li>
            <li>
              <strong>Perfis de Acesso:</strong> O sistema dispõe de separação estrita de papéis: administradores de salão (<code className="text-xs bg-muted px-1.5 py-0.5 rounded text-foreground">owner</code>) gerenciam apenas seu próprio ambiente e clientes, enquanto a gestão global da plataforma é restrita à administração técnica (<code className="text-xs bg-muted px-1.5 py-0.5 rounded text-foreground">superadmin</code>).
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "planos",
      title: "3. Período de Testes (Trial de 10 Dias) e Planos",
      icon: CreditCard,
      content: (
        <>
          <p className="text-muted-foreground leading-relaxed">
            O GeevheitHair concede a novos estabelecimentos um período de avaliação gratuita de <strong>10 (dez) dias corridos</strong>, sem necessidade de inserção prévia de dados de cartão de crédito.
          </p>
          <div className="bg-muted/40 border border-border/80 rounded-2xl p-4 mt-3 space-y-2">
            <p className="text-foreground text-sm font-medium">Condições do Período de Testes:</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Durante o trial, o estabelecimento tem acesso a todas as funcionalidades essenciais do plano selecionado. Ao término dos 10 dias, caso não ocorra a migração para um plano pago ativo, os agendamentos online e acessos de gestão serão temporariamente suspensos até a confirmação da assinatura.
            </p>
          </div>
          <p className="text-muted-foreground leading-relaxed mt-3">
            O cancelamento do plano pode ser solicitado a qualquer momento pelo gestor do estabelecimento, sem aplicação de multas rescisórias ou fidelidade obrigatória, permanecendo o acesso ativo até o encerramento do ciclo mensal já quitado.
          </p>
        </>
      ),
    },
    {
      id: "antifuro",
      title: "4. Política de Sinal PIX e Prevenção de Faltas (Anti-Furo)",
      icon: Calendar,
      content: (
        <>
          <p className="text-muted-foreground leading-relaxed">
            Um dos recursos centrais do GeevheitHair é a funcionalidade de <strong>Sinal PIX Anti-Furo</strong>, desenvolvida para resguardar o faturamento e a agenda do profissional de beleza contra ausências imprevistas (<em>no-show</em>).
          </p>
          <div className="border border-indigo-200/50 bg-indigo-50/30 dark:bg-indigo-950/20 rounded-2xl p-4 mt-3 space-y-3">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4" /> Regras de Funcionamento do Sinal:
            </div>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
              <li>
                <strong>Definição do Estabelecimento:</strong> Cada salão tem autonomia para ativar ou desativar a exigência de taxa de sinal, bem como determinar o percentual ou valor fixo correspondente ao serviço.
              </li>
              <li>
                <strong>Natureza Jurídica de Arras/Sinal:</strong> Nos moldes do art. 420 do Código Civil Brasileiro, o valor do sinal pago pelo cliente final destina-se a garantir a reserva irrevogável do horário e do profissional na agenda.
              </li>
              <li>
                <strong>Cancelamento e Remarcação:</strong> O salão define sua política de tolerância de atrasos e antecedência mínima de cancelamento (ex.: até 2 a 4 horas antes). Havendo cancelamento dentro do prazo estipulado pelo salão, o crédito ou estorno deve ser tratado diretamente entre o cliente e o estabelecimento.
              </li>
              <li>
                <strong>Não comparecimento (No-Show):</strong> O não comparecimento injustificado do cliente final no horário reservado faculta ao estabelecimento a retenção do valor do sinal a título de compensação pelo período bloqueado na agenda.
              </li>
            </ul>
          </div>
        </>
      ),
    },
    {
      id: "responsabilidades",
      title: "5. Limitação de Responsabilidade e Relação de Consumo",
      icon: Scale,
      content: (
        <>
          <p className="text-muted-foreground leading-relaxed">
            O GeevheitHair é estritamente um <strong>provedor de infraestrutura tecnológica e software de gestão</strong>.
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-2 text-muted-foreground">
            <li>
              <strong>Serviços de Beleza e Estética:</strong> A execução técnica, qualidade, segurança física, aplicação de produtos cosméticos, biossegurança e pontualidade dos procedimentos realizados no salão são de responsabilidade exclusiva do estabelecimento prestador e de seus profissionais.
            </li>
            <li>
              <strong>Transações Financeiras Diretas:</strong> As transações de PIX e pagamentos presenciais ocorrem diretamente entre o cliente final e a conta receptora configurada pelo salão. O GeevheitHair não custodia valores e não atua como instituição financeira ou emissora de moeda eletrônica.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "sla",
      title: "6. Disponibilidade do Sistema (SLA) e Suporte Técnico",
      icon: ShieldCheck,
      content: (
        <>
          <p className="text-muted-foreground leading-relaxed">
            Empreendemos os melhores esforços técnicos para manter a disponibilidade da plataforma em nível superior a 99% (noventa e nove por cento) ao ano.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            Eventuais janelas de manutenção preventiva e atualizações de infraestrutura serão priorizadas em períodos de baixo tráfego (madrugadas ou finais de noite), buscando minimizar qualquer impacto no fluxo de agendamentos.
          </p>
        </>
      ),
    },
    {
      id: "rescisao",
      title: "7. Cancelamento, Encerramento e Exportação de Dados",
      icon: AlertCircle,
      content: (
        <>
          <p className="text-muted-foreground leading-relaxed">
            O Contratante pode encerrar sua assinatura a qualquer momento através do painel de administração. Após a solicitação de cancelamento:
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-2 text-muted-foreground">
            <li>
              Os dados de clientes, histórico de serviços e faturamento do estabelecimento permanecerão guardados de forma segura por um período de 30 (trinta) dias para viabilizar eventual reativação ou exportação de relatórios pelo lojista.
            </li>
            <li>
              Decorrido esse prazo, o titular poderá solicitar a exclusão permanente dos dados, ressalvadas as obrigações legais de guarda fiscal e cumprimento de ordens judiciais.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "foro",
      title: "8. Legislação Aplicável e Foro de Eleição",
      icon: FileText,
      content: (
        <>
          <p className="text-muted-foreground leading-relaxed">
            Estes Termos de Uso são regidos e interpretados em conformidade com as Leis da República Federativa do Brasil, em especial o Marco Civil da Internet (Lei nº 12.965/2014) e a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            Fica eleito o Foro da Comarca da sede da empresa desenvolvedora para dirimir quaisquer dúvidas ou litígios decorrentes destes termos, com renúncia expressa a qualquer outro, por mais privilegiado que seja.
          </p>
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

          <Badge variant="outline" className="border-primary/20 text-xs text-muted-foreground">
            Versão Vigente • 2026
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-5 py-12 md:py-16 w-full animate-fade-up">
        {/* Hero Banner */}
        <div className="mb-10 text-center md:text-left border-b border-border pb-8">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            Jurídico & Compliance
          </Badge>
          <h1 className="font-serif text-3xl md:text-5xl font-medium tracking-tight mb-4 text-foreground">
            Termos e Condições de Uso
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-3xl leading-relaxed">
            Bem-vindo ao <strong>GeevheitHair</strong>. Estes termos detalham os direitos, responsabilidades e normas de convivência comercial entre nossa plataforma, os estabelecimentos cadastrados e seus clientes finais.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span>Última atualização: Outubro de 2026</span>
            <span>•</span>
            <span>Aplicável a: Salões, Barbearias, Clínicas e Clientes</span>
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
                  <div className="h-10 w-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
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
        <div className="mt-12 p-8 rounded-3xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-serif text-xl font-medium text-foreground mb-1">
              Dúvidas sobre os nossos termos?
            </h3>
            <p className="text-muted-foreground text-sm">
              Nossa equipe jurídica e de suporte está sempre disponível para esclarecer dúvidas sobre contratos e operação.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Button variant="outline" onClick={() => navigate("/privacidade")}>
              Ver Política de Privacidade
            </Button>
            <Button onClick={() => navigate("/")}>
              Voltar à Página Principal
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
