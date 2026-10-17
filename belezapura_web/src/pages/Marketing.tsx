import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Sparkles, Calendar, CreditCard, BarChart3, Users, Store, Check, ArrowRight, 
  Menu, X, ChevronRight, ShieldCheck, Smartphone, Zap, Clock, TrendingUp, 
  HelpCircle, MessageSquare, DollarSign, UploadCloud, Scissors, Award, 
  CheckCircle2, ChevronDown, Copy, Play, CheckCheck, Heart, UserCheck, Crown, Lock
} from "lucide-react";
import { Button, Badge } from "@/components/ui";

// Cenários da Demonstração Interativa do BelezaPura
interface BookingScenario {
  id: string;
  service: string;
  price: string;
  duration: string;
  professional: string;
  clientMessage: string;
  systemReply: string;
  pixCode: string;
}

const BOOKING_SCENARIOS: BookingScenario[] = [
  {
    id: "mechas",
    service: "Mechas & Tratamento Reconstrutor",
    price: "R$ 380,00",
    duration: "2h30",
    professional: "Rafaela Silva",
    clientMessage: "Olá! Gostaria de agendar mechas e tratamento para este sábado às 14h com a Rafaela.",
    systemReply: "Horário reservado com sucesso no BelezaPura! Segue o PIX do sinal de 20% (R$ 76,00) para confirmar sua cadeira. O restante é pago no dia:",
    pixCode: "00020126580014br.gov.bcb.pix0136belezapura-sinal-59102452040000530398654076.005802BR5913Studio Rafaela6009Sao Paulo62070503***6304A1B2"
  },
  {
    id: "barba",
    service: "Corte Degradê & Barba Terapia",
    price: "R$ 85,00",
    duration: "50 min",
    professional: "Marcos Vinicius",
    clientMessage: "Opa, tudo bem? Quero agendar cabelo e barba hoje às 18h30.",
    systemReply: "Cadeira reservada com Marcos! Para garantir o horário e evitar no-shows, realize o sinal de R$ 25,00 via PIX:",
    pixCode: "00020126580014br.gov.bcb.pix0136belezapura-sinal-88419252040000530398654025.005802BR5913Barber Club6009Sao Paulo62070503***6304F4C8"
  },
  {
    id: "manicure",
    service: "Unhas em Gel & Esmaltação",
    price: "R$ 130,00",
    duration: "1h15",
    professional: "Camila Santos",
    clientMessage: "Boa tarde! Tem horário para unhas em gel na sexta às 16h?",
    systemReply: "Perfeito Camila! Horário disponível com a Camila Santos. Sinal de garantia de R$ 30,00 via PIX:",
    pixCode: "00020126580014br.gov.bcb.pix0136belezapura-sinal-33491052040000530398654030.005802BR5913Esmalteria VIP6009Sao Paulo62070503***6304D9E1"
  }
];

// Benefícios Centrais do BelezaPura
const CORE_BENEFITS = [
  {
    icon: ShieldCheck,
    title: "Sinal Antecipado via PIX",
    subtitle: "Elimine o prejuízo de cadeiras vazias",
    desc: "A cliente confirma a reserva pagando uma porcentagem de sinal definida por você. O dinheiro cai instantaneamente na sua conta bancária sem retenção ou taxas da plataforma.",
    highlight: "Redução de até 40% nas faltas",
    border: "border-[#E5E7EB] hover:border-[#E5A991]"
  },
  {
    icon: Smartphone,
    title: "Página Exclusiva para a Bio",
    subtitle: "Seu salão aberto 24 horas por dia",
    desc: "Um link elegante e ultrarrápido para colocar no Instagram e WhatsApp. Suas clientes escolhem os procedimentos, o especialista e o horário em segundos, até de madrugada.",
    highlight: "Agendamento automático 24/7",
    border: "border-[#E5E7EB] hover:border-[#111827]"
  },
  {
    icon: Users,
    title: "Divisão Automática de Comissões",
    subtitle: "Transparência total com seus profissionais",
    desc: "Defina o percentual de cada parceiro por serviço ou produto. A cada atendimento fechado, o sistema rateia os valores sem erros na calculadora e sem atrito na equipe.",
    highlight: "Cálculo exato a cada comanda",
    border: "border-[#E5E7EB] hover:border-[#E5A991]"
  },
  {
    icon: BarChart3,
    title: "Painel Financeiro & Lucro Líquido",
    subtitle: "Clareza sobre o faturamento real",
    desc: "Acompanhe faturamento diário, semanal e mensal, ticket médio por atendimento, faturamento por cadeira e previsão de fluxo de caixa em gráficos limpos e intuitivos.",
    highlight: "Visão estratégica em tempo real",
    border: "border-[#E5E7EB] hover:border-[#111827]"
  },
  {
    icon: MessageSquare,
    title: "Lembretes Automáticos Anti-No Show",
    subtitle: "Clientes sempre avisadas com antecedência",
    desc: "Dispare confirmações automáticas com antecedência para garantir que a cliente não se esqueça da data. Caso precise remarcar, o horário é liberado para outra pessoa.",
    highlight: "Zero esquecimentos de horário",
    border: "border-[#E5E7EB] hover:border-[#E5A991]"
  },
  {
    icon: Calendar,
    title: "Agenda Sincronizada sem Conflitos",
    subtitle: "Fim definitivo das folhas rasuradas",
    desc: "Cada profissional acessa sua própria agenda no celular com horários, intervalos de almoço e folgas configuráveis. Chega de dois clientes marcados na mesma hora.",
    highlight: "Sincronização em milissegundos",
    border: "border-[#E5E7EB] hover:border-[#111827]"
  }
];

// FAQs Oficiais BelezaPura
const FAQ_ITEMS = [
  {
    q: "Como funciona a demonstração gratuita de 14 dias?",
    a: "Você tem acesso irrestrito a todas as ferramentas do plano Studio durante 14 dias completos. Você cadastra seus serviços, equipe e chave PIX para testar na prática com suas clientes. Se decidir não continuar, basta cancelar antes do 15º dia e nada será cobrado."
  },
  {
    q: "Para onde vai o dinheiro do sinal cobrado no PIX?",
    a: "O valor do sinal vai 100% diretamente para a chave PIX bancária configurada pelo seu salão. O BelezaPura não retém seus valores e não cobra porcentagem sobre o faturamento dos seus agendamentos."
  },
  {
    q: "Minhas clientes precisam baixar algum aplicativo?",
    a: "Não! O agendamento é feito de forma instantânea através do link exclusivo do seu salão no navegador do celular (ideal para colocar na bio do Instagram e WhatsApp). É rápido, leve e não ocupa memória do aparelho."
  },
  {
    q: "O BelezaPura serve para profissionais que atendem sozinhos?",
    a: "Com certeza! O Plano Essencial (R$ 59,90) foi desenhado sob medida para quem atende de forma autônoma e precisa de uma recepção digital trabalhando enquanto você está com a mão no procedimento."
  },
  {
    q: "Como funciona o cálculo e rateio de comissões da equipe?",
    a: "Você define a regra de comissão de cada profissional (por exemplo: 50% em químicas, 60% em cortes, 10% em produtos). O sistema divide automaticamente cada atendimento e gera relatórios individuais prontos para prestação de contas."
  },
  {
    q: "Já tenho clientes anotados em planilhas ou cadernos. Como migrar?",
    a: "Nosso importador inteligente lê seus dados em formato CSV ou planilhas do Excel em instantes. Nossa equipe de suporte também está pronta para ajudar você a cadastrar seus serviços e horários sem complicação."
  }
];

export default function Marketing() {
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);
  
  // Ciclo de cobrança (Mensal vs Anual)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  
  // Demonstrador interativo
  const [activeScenario, setActiveScenario] = useState<BookingScenario>(BOOKING_SCENARIOS[0]);
  const [copiedPix, setCopiedPix] = useState(false);

  // Calculadora de Retorno do BelezaPura
  const [numStaff, setNumStaff] = useState<number>(3);
  const [ticketMedio, setTicketMedio] = useState<number>(85);
  const [noShowsPerWeek, setNoShowsPerWeek] = useState<number>(4);

  // FAQ Accordion
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Cálculos do retorno real
  const totalNoShowsMonthly = noShowsPerWeek * 4;
  const prejuizoAtual = totalNoShowsMonthly * ticketMedio;
  const faturamentoSalvo = Math.round(prejuizoAtual * 0.40);
  const custoPlanoStudio = 119.90;
  const lucroLiquidoExtra = faturamentoSalvo - custoPlanoStudio;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(activeScenario.pixCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  return (
    <div className="min-h-full bg-[#FAFAFA] text-[#111827] font-sans selection:bg-[#E5A991]/30 selection:text-[#111827] antialiased overflow-x-hidden">
      
      {/* Background glow ultra-suave */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[500px] bg-gradient-to-b from-[#E5A991]/10 via-[#111827]/5 to-transparent blur-[140px] rounded-full" />
      </div>

      {/* Top Banner Elegante Preto Profundo */}
      <div className="relative z-50 bg-[#111827] text-white py-2.5 px-4 text-center text-xs md:text-sm font-medium tracking-wide flex items-center justify-center gap-2 shadow-xs">
        <Sparkles className="w-4 h-4 text-[#E5A991]" />
        <span>Experimente o <strong>BelezaPura</strong> com 14 dias de demonstração gratuita. Sem taxas de adesão!</span>
        <button 
          onClick={() => navigate("/onboarding?planId=studio")}
          className="underline font-bold text-[#E5A991] hover:text-white cursor-pointer ml-1 hidden sm:inline"
        >
          Criar meu espaço &rarr;
        </button>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#FAFAFA]/90 backdrop-blur-xl border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-5 h-20 flex items-center justify-between">
          
          {/* Logo BelezaPura */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
            <div className="h-10 w-10 rounded-xl bg-[#111827] text-[#E5A991] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-[#E5A991]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-2xl font-bold tracking-tight text-[#111827]">BelezaPura</span>
                <span className="brand-badge text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">Gestão</span>
              </div>
              <span className="text-[10px] text-[#6B7280] font-medium tracking-wider uppercase">Plataforma para Salões</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#4B5563]">
            <a href="#beneficios" className="hover:text-[#111827] transition-colors">Recursos</a>
            <a href="#demonstracao" className="hover:text-[#111827] transition-colors">Como Funciona</a>
            <a href="#calculadora" className="hover:text-[#111827] transition-colors">Calculadora de Retorno</a>
            <a href="#planos" className="hover:text-[#111827] transition-colors">Planos & Preços</a>
            <a href="#faq" className="hover:text-[#111827] transition-colors">Dúvidas Frequentes</a>
          </nav>

          {/* Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/login")} 
              className="text-[#111827] hover:text-black hover:bg-stone-100 font-medium"
            >
              Entrar
            </Button>
            <Button 
              size="md" 
              onClick={() => navigate("/onboarding?planId=studio")} 
              className="bg-[#111827] hover:bg-[#1F2937] text-white font-bold shadow-md shadow-[#111827]/15 hover-lift rounded-xl px-5"
            >
              Testar 14 dias grátis <ArrowRight className="w-4 h-4 ml-1 text-[#E5A991]" />
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button 
            className="lg:hidden p-2.5 rounded-xl bg-white border border-[#E5E7EB] text-[#111827] hover:bg-stone-50 cursor-pointer shadow-xs" 
            onClick={() => setMobileMenu(v => !v)}
            aria-label="Menu"
          >
            {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenu && (
          <div className="lg:hidden bg-white border-b border-[#E5E7EB] px-6 py-6 flex flex-col gap-4 text-base font-medium animate-fade-up shadow-lg">
            <a href="#beneficios" onClick={() => setMobileMenu(false)} className="text-[#4B5563] hover:text-[#111827] py-1">Recursos</a>
            <a href="#demonstracao" onClick={() => setMobileMenu(false)} className="text-[#4B5563] hover:text-[#111827] py-1">Como Funciona</a>
            <a href="#calculadora" onClick={() => setMobileMenu(false)} className="text-[#4B5563] hover:text-[#111827] py-1">Calculadora de Retorno</a>
            <a href="#planos" onClick={() => setMobileMenu(false)} className="text-[#4B5563] hover:text-[#111827] py-1">Planos & Preços</a>
            <a href="#faq" onClick={() => setMobileMenu(false)} className="text-[#4B5563] hover:text-[#111827] py-1">Dúvidas Frequentes</a>
            
            <div className="pt-4 border-t border-[#E5E7EB] flex flex-col gap-3">
              <Button 
                variant="outline" 
                className="w-full justify-center border-[#E5E7EB] text-[#111827] bg-white hover:bg-stone-50 font-semibold" 
                onClick={() => { setMobileMenu(false); navigate("/login"); }}
              >
                Acessar meu salão
              </Button>
              <Button 
                className="w-full justify-center bg-[#111827] hover:bg-[#1F2937] text-white font-bold h-12 shadow-md" 
                onClick={() => { setMobileMenu(false); navigate("/onboarding?planId=studio"); }}
              >
                Começar 14 dias grátis
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-14 pb-20 md:pt-20 md:pb-26 max-w-7xl mx-auto px-5">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 flex flex-col items-start animate-fade-up">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5A991]/15 border border-[#E5A991]/40 text-[#9C5A42] text-xs md:text-sm font-semibold mb-6 shadow-xs">
              <Sparkles className="w-4 h-4 text-[#C47F65]" />
              <span>Seu salão. Sua agenda. Seu negócio.</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-[#111827] leading-[1.08] mb-6">
              Agende, receba e organize seu salão{" "}
              <span className="brand-text-gradient">com elegância e controle.</span>
            </h1>

            <p className="text-[#4B5563] text-lg sm:text-xl leading-relaxed mb-8 max-w-2xl font-normal">
              O ecossistema definitivo para salões de beleza, barbearias e clínicas de estética: sua cliente agenda online 24h, garante a vaga com <strong>sinal no PIX</strong> e sua equipe atende sem atritos.
            </p>

            {/* CTAs */}
            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-4 mb-8">
              <Button 
                size="lg" 
                onClick={() => navigate("/onboarding?planId=studio")} 
                className="h-14 sm:h-16 px-8 bg-[#111827] hover:bg-[#1F2937] text-white font-bold text-base sm:text-lg rounded-2xl shadow-xl shadow-[#111827]/15 hover-lift justify-center"
              >
                Experimentar 14 dias grátis <ArrowRight className="w-5 h-5 ml-2 text-[#E5A991]" />
              </Button>
              <a 
                href="#demonstracao"
                className="inline-flex items-center justify-center h-14 sm:h-16 px-6 rounded-2xl border border-[#E5E7EB] bg-white hover:bg-stone-50 text-[#111827] font-semibold text-base transition-all shadow-xs hover-lift gap-2"
              >
                <Play className="w-4 h-4 text-[#111827] fill-[#111827]" /> Ver demonstração
              </a>
            </div>

            {/* Guarantees */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs sm:text-sm text-[#4B5563] font-medium">
              <span className="flex items-center gap-1.5 text-[#111827]">
                <Check className="w-4 h-4 text-emerald-700 stroke-[3]" /> 14 dias sem custo
              </span>
              <span className="flex items-center gap-1.5 text-[#111827]">
                <Check className="w-4 h-4 text-emerald-700 stroke-[3]" /> Sem taxa de adesão
              </span>
              <span className="flex items-center gap-1.5 text-[#111827]">
                <Check className="w-4 h-4 text-emerald-700 stroke-[3]" /> Cancele quando quiser
              </span>
            </div>

          </div>

          {/* Hero Right Visual: Demonstrador do Agendamento BelezaPura */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end animate-fade-up">
            <div className="w-full max-w-[390px] relative">
              
              {/* Badge Flutuante de Segurança */}
              <div className="absolute -top-4 -left-6 z-20 bg-white/95 border border-[#E5E7EB] rounded-2xl p-3 shadow-xl backdrop-blur-md hidden sm:flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#111827]">Sinal no PIX Garantido</div>
                  <div className="text-[10px] text-[#6B7280]">Direto na sua conta bancária</div>
                </div>
              </div>

              {/* Moldura do Celular */}
              <div className="rounded-[44px] p-3.5 bg-gradient-to-b from-[#E5E7EB] via-stone-300 to-[#111827] shadow-2xl border-4 border-[#E5E7EB]">
                <div className="rounded-[36px] bg-[#EFEAE2] overflow-hidden border border-[#E5E7EB] flex flex-col h-[540px]">
                  
                  {/* Top Bar do Agendamento */}
                  <div className="bg-[#128C7E] px-4 py-3 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-1.5">
                          Studio BelezaPura
                        </div>
                        <div className="text-[11px] text-emerald-100 flex items-center gap-1">
                          ● agendamento online ativo
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mensagens e Confirmação */}
                  <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 text-xs font-normal bg-[#EFEAE2]">
                    
                    <div className="text-center my-1">
                      <span className="bg-white/80 text-stone-600 text-[10px] px-2.5 py-1 rounded-md shadow-2xs font-medium">
                        Agendamento VIP via BelezaPura
                      </span>
                    </div>

                    {/* Mensagem da Cliente */}
                    <div className="flex justify-end">
                      <div className="max-w-[85%] bg-white text-stone-900 p-3 rounded-2xl rounded-tr-xs shadow-xs border border-stone-100">
                        <p>{activeScenario.clientMessage}</p>
                        <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-stone-400">
                          <span>14:02</span>
                          <CheckCheck className="w-3 h-3 text-sky-500" />
                        </div>
                      </div>
                    </div>

                    {/* Resposta do Salão */}
                    <div className="flex justify-start">
                      <div className="max-w-[90%] bg-[#DCF8C6] text-stone-900 p-3 rounded-2xl rounded-tl-xs shadow-xs border border-emerald-200/60 space-y-2.5">
                        <p className="leading-relaxed">{activeScenario.systemReply}</p>
                        
                        {/* Box do PIX */}
                        <div className="bg-white p-2.5 rounded-xl border border-emerald-300 text-[11px] space-y-2 shadow-2xs">
                          <div className="flex items-center justify-between text-emerald-800 font-bold">
                            <span>Sinal para Reserva</span>
                            <Badge variant="success" className="text-[9px] px-1.5 py-0 bg-emerald-100 text-emerald-800 border-emerald-200">PIX Direto</Badge>
                          </div>
                          
                          <div className="font-mono text-[9px] text-stone-600 truncate bg-stone-50 p-1.5 rounded border border-stone-200">
                            {activeScenario.pixCode}
                          </div>

                          <button 
                            onClick={handleCopyPix}
                            className="w-full py-1.5 px-2 rounded-lg bg-[#128C7E] hover:bg-[#0f7267] text-white font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Copy className="w-3 h-3" /> {copiedPix ? "Chave Copiada!" : "Copiar Código PIX"}
                          </button>
                        </div>

                        <div className="text-[9px] text-stone-500 text-right">14:02</div>
                      </div>
                    </div>

                    {/* Confirmação pós-pagamento */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-center shadow-2xs">
                      <span className="text-[11px] font-bold text-emerald-800">
                        ✓ Horário confirmado na agenda da {activeScenario.professional}!
                      </span>
                    </div>

                  </div>

                  {/* Seletor de Cenários */}
                  <div className="p-2.5 bg-white border-t border-[#E5E7EB] flex items-center gap-1.5 overflow-x-auto">
                    {BOOKING_SCENARIOS.map(sc => (
                      <button
                        key={sc.id}
                        onClick={() => setActiveScenario(sc)}
                        className={`text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                          activeScenario.id === sc.id
                            ? "bg-[#111827] text-[#E5A991] shadow-xs"
                            : "bg-[#F3F4F6] text-[#4B5563] hover:bg-stone-200"
                        }`}
                      >
                        {sc.service.split("&")[0]}
                      </button>
                    ))}
                  </div>

                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Faixa de Métricas Centrais */}
      <section className="relative z-20 border-y border-[#E5E7EB] bg-white py-9 shadow-xs">
        <div className="max-w-7xl mx-auto px-5 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          
          <div className="flex flex-col items-center">
            <span className="font-serif text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight">100% Direto</span>
            <span className="text-[#6B7280] text-xs sm:text-sm font-medium mt-1">
              O PIX cai na sua conta sem retenção
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="font-serif text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight">24h / 7 dias</span>
            <span className="text-[#6B7280] text-xs sm:text-sm font-medium mt-1">
              Recepção online ativa no link da bio
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="font-serif text-3xl sm:text-4xl font-extrabold text-emerald-700 tracking-tight">-40% Faltas</span>
            <span className="text-[#6B7280] text-xs sm:text-sm font-medium mt-1">
              Sinal obrigatório que garante o horário
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="font-serif text-3xl sm:text-4xl font-extrabold text-[#9C5A42] tracking-tight">14 Dias</span>
            <span className="text-[#6B7280] text-xs sm:text-sm font-medium mt-1">
              Demonstração gratuita sem burocracia
            </span>
          </div>

        </div>
      </section>

      {/* Seção de Recursos Proprietários */}
      <section id="beneficios" className="relative z-10 py-24 max-w-7xl mx-auto px-5">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5A991]/15 border border-[#E5A991]/40 text-[#9C5A42] text-xs font-semibold mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C47F65]" /> Eficiência Operacional
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#111827] mb-5">
            Tudo o que seu salão precisa para <span className="brand-text-gradient">faturar mais e organizar sua equipe</span>
          </h2>
          <p className="text-[#4B5563] text-base sm:text-lg leading-relaxed">
            Menos tempo respondendo mensagens repetitivas e calculando comissões no papel. Mais foco em atender bem suas clientes.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CORE_BENEFITS.map((item, idx) => (
            <div 
              key={idx}
              className={`rounded-3xl p-7 bg-white border ${item.border} relative overflow-hidden flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 group shadow-xs hover:shadow-md`}
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB] text-[#111827] flex items-center justify-center font-bold mb-5 shadow-xs group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6" />
                </div>

                <div className="text-xs font-semibold text-[#9C5A42] uppercase tracking-wider mb-1">
                  {item.subtitle}
                </div>

                <h3 className="font-bold text-[#111827] text-xl mb-3 leading-snug">
                  {item.title}
                </h3>

                <p className="text-[#4B5563] text-sm leading-relaxed mb-6">
                  {item.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-[#E5E7EB] text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <Check className="w-4 h-4 stroke-[3]" /> {item.highlight}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Demonstração: Como Funciona o Fluxo */}
      <section id="demonstracao" className="relative z-10 py-24 bg-[#F3F4F6]/70 border-y border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-5">
          
          <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-up">
            <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#111827] mb-5">
              Simples para o salão. <span className="brand-text-gradient">Encantador para a cliente.</span>
            </h2>
            <p className="text-[#4B5563] text-base sm:text-lg">
              Em menos de 1 minuto sua cliente escolhe o procedimento, agenda e confirma o sinal.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Acesso pelo Link",
                desc: "A cliente clica no link exclusivo da sua bio do Instagram ou recebe no WhatsApp."
              },
              {
                step: "02",
                title: "Procedimento & Especialista",
                desc: "Ela vê os preços, durações e escolhe o profissional que prefere para o atendimento."
              },
              {
                step: "03",
                title: "Sinal Inteligente",
                desc: "Paga uma porcentagem simbólica de sinal via PIX para blindar o horário contra faltas."
              },
              {
                step: "04",
                title: "Agenda Confirmada",
                desc: "O horário entra automaticamente na agenda do profissional e ambos recebem a confirmação."
              }
            ].map((st, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-[#E5E7EB] hover:border-[#E5A991] transition-all shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#111827] text-[#E5A991] flex items-center justify-center font-bold text-sm mb-4 shadow-xs">
                  {st.step}
                </div>
                <h3 className="font-bold text-[#111827] text-lg mb-2">{st.title}</h3>
                <p className="text-[#4B5563] text-sm leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Calculadora de Retorno Real do BelezaPura */}
      <section id="calculadora" className="relative z-10 py-24 max-w-7xl mx-auto px-5">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-4 shadow-xs">
            <DollarSign className="w-3.5 h-3.5" /> Retorno Real do Investimento
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#111827] mb-5">
            O BelezaPura se paga <span className="brand-text-gradient">evitando um único furo</span>
          </h2>
          <p className="text-[#4B5563] text-base sm:text-lg leading-relaxed">
            Veja quanto seu salão perde hoje com cadeiras vazias e quanto você protege exigindo o sinal prévio.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
          
          {/* Controles da Calculadora */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-sm space-y-6">
            
            {/* Profissionais */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-[#111827]">Profissionais na Equipe:</label>
                <span className="font-bold text-[#111827] bg-[#F3F4F6] px-3 py-1 rounded-lg text-sm border border-[#E5E7EB]">
                  {numStaff} {numStaff === 1 ? "profissional" : "profissionais"}
                </span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="12" 
                value={numStaff}
                onChange={(e) => setNumStaff(Number(e.target.value))}
                className="w-full accent-[#111827] cursor-pointer"
              />
            </div>

            {/* Ticket Médio */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-[#111827]">Ticket Médio do Atendimento:</label>
                <span className="font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg text-sm border border-emerald-200">
                  R$ {ticketMedio},00
                </span>
              </div>
              <input 
                type="range" 
                min="40" 
                max="250" 
                step="5"
                value={ticketMedio}
                onChange={(e) => setTicketMedio(Number(e.target.value))}
                className="w-full accent-[#111827] cursor-pointer"
              />
            </div>

            {/* Faltas semanais */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-[#111827]">Faltas / No-Shows por Semana:</label>
                <span className="font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-lg text-sm border border-rose-200">
                  {noShowsPerWeek} {noShowsPerWeek === 1 ? "falta/semana" : "faltas/semana"}
                </span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="15" 
                value={noShowsPerWeek}
                onChange={(e) => setNoShowsPerWeek(Number(e.target.value))}
                className="w-full accent-[#111827] cursor-pointer"
              />
            </div>

            <div className="pt-3 border-t border-[#E5E7EB] text-xs text-[#6B7280] leading-relaxed">
              * O cálculo considera a redução real de no-shows proporcionada pela confirmação de sinal via PIX antecipado.
            </div>

          </div>

          {/* Resultado Empresarial com Classe */}
          <div className="lg:col-span-5 bg-[#111827] rounded-3xl p-6 sm:p-8 border border-[#E5A991]/40 shadow-2xl flex flex-col justify-between text-white">
            
            <div>
              <Badge className="bg-[#E5A991]/20 text-[#E5A991] border-[#E5A991]/40 font-bold mb-4">
                Proteção Financeira Mensal
              </Badge>

              <div className="space-y-4 mb-6">
                <div>
                  <div className="text-xs text-stone-400">Prejuízo mensal estimado em faltas:</div>
                  <div className="text-xl font-bold text-rose-300 line-through">
                    - R$ {prejuizoAtual.toLocaleString('pt-BR')},00 / mês
                  </div>
                </div>

                <div>
                  <div className="text-xs text-stone-400">Faturamento protegido com o sinal PIX:</div>
                  <div className="text-3xl font-extrabold text-emerald-400 font-serif">
                    + R$ {faturamentoSalvo.toLocaleString('pt-BR')},00
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-stone-800 flex justify-between items-center text-xs">
                  <span className="text-stone-400">Investimento Plano Studio:</span>
                  <span className="font-bold text-white">R$ 119,90 / mês</span>
                </div>
              </div>

              <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-2xl p-4 text-center mb-6">
                <div className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                  Lucro Líquido Preservado no seu Bolso:
                </div>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  + R$ {lucroLiquidoExtra.toLocaleString('pt-BR')},00 / mês
                </div>
              </div>
            </div>

            <button 
              onClick={() => navigate("/onboarding?planId=studio")} 
              className="w-full h-13 bg-[#E5A991] hover:bg-[#D89981] text-[#111827] font-extrabold text-base rounded-xl shadow-lg hover-lift justify-center flex items-center cursor-pointer transition-all"
            >
              Blindar minha agenda com 14 dias grátis &rarr;
            </button>

          </div>

        </div>
      </section>

      {/* Planos Oficiais BelezaPura */}
      <section id="planos" className="relative z-10 py-24 bg-[#FAFAFA] border-t border-[#E5E7EB] overflow-hidden">
        
        {/* Elemento de iluminação ambiente no fundo da seção */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[550px] bg-gradient-to-tr from-[#E5A991]/10 via-[#111827]/5 to-transparent blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-5 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-10 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5A991]/15 border border-[#E5A991]/40 text-[#9C5A42] text-xs font-bold mb-4 shadow-xs">
              <Award className="w-3.5 h-3.5 text-[#C47F65]" /> Planos Transparentes & Sem Pegadinhas
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#111827] mb-5">
              Escolha o plano ideal para a <span className="brand-text-gradient">fase do seu negócio</span>
            </h2>
            <p className="text-[#4B5563] text-base sm:text-lg">
              Sem taxas ocultas, sem fidelidade obrigatória. Experimente o plano Studio por 14 dias inteiramente por nossa conta.
            </p>
          </div>

          {/* Toggle Interativo Mensal / Anual */}
          <div className="flex items-center justify-center mb-14">
            <div className="bg-white p-1.5 rounded-2xl flex items-center shadow-md border border-[#E5E7EB]">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${
                  billingCycle === "monthly"
                    ? "bg-[#111827] text-white shadow-md scale-100"
                    : "text-[#6B7280] hover:text-[#111827]"
                }`}
              >
                Cobrança Mensal
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("annual")}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  billingCycle === "annual"
                    ? "bg-[#111827] text-white shadow-md scale-100"
                    : "text-[#6B7280] hover:text-[#111827]"
                }`}
              >
                <span>Cobrança Anual</span>
                <span className="bg-[#E5A991] text-[#111827] text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs tracking-wider animate-pulse">
                  -20% OFF
                </span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            
            {/* Plano Essencial */}
            <div className="group relative bg-white rounded-3xl p-8 border border-[#E5E7EB] hover:border-[#111827] transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-stone-100 text-[#111827] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#E5A991]/25 transition-all duration-300 shadow-xs">
                    <Scissors className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-[#6B7280] bg-stone-100 px-3 py-1 rounded-full">
                    Autônomos
                  </span>
                </div>

                <div className="mb-4">
                  <h3 className="text-2xl font-black text-[#111827] mb-1">Essencial</h3>
                  <p className="text-xs text-[#6B7280]">Para quem atende sozinho e quer parar de perder dinheiro com furos.</p>
                </div>

                <div className="mb-2 flex items-baseline gap-1.5">
                  <span className="font-serif text-4xl sm:text-5xl font-black text-[#111827] tracking-tight transition-all duration-300">
                    {billingCycle === "annual" ? "R$ 47,90" : "R$ 59,90"}
                  </span>
                  <span className="text-sm font-medium text-[#6B7280]">/mês</span>
                </div>
                <p className="text-xs text-[#9C5A42] font-semibold mb-6 min-h-[18px]">
                  {billingCycle === "annual" ? "Faturado R$ 574,80/ano (economia de R$ 144)" : "Sem fidelidade, cancele a qualquer mês"}
                </p>

                <div className="h-px w-full bg-[#E5E7EB] mb-6" />

                <ul className="space-y-3.5 mb-8 text-sm text-[#374151]">
                  <li className="flex items-start gap-2.5 group/item">
                    <div className="w-5 h-5 rounded-full bg-stone-100 text-[#111827] group-hover/item:bg-[#111827] group-hover/item:text-white flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span><strong>1 profissional</strong> atendendo</span>
                  </li>
                  <li className="flex items-start gap-2.5 group/item">
                    <div className="w-5 h-5 rounded-full bg-stone-100 text-[#111827] group-hover/item:bg-[#111827] group-hover/item:text-white flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>Página exclusiva para bio do Instagram</span>
                  </li>
                  <li className="flex items-start gap-2.5 group/item">
                    <div className="w-5 h-5 rounded-full bg-stone-100 text-[#111827] group-hover/item:bg-[#111827] group-hover/item:text-white flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>Cobrança de sinal obrigatório via PIX</span>
                  </li>
                  <li className="flex items-start gap-2.5 group/item">
                    <div className="w-5 h-5 rounded-full bg-stone-100 text-[#111827] group-hover/item:bg-[#111827] group-hover/item:text-white flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>Lembretes automáticos para clientes</span>
                  </li>
                  <li className="flex items-start gap-2.5 group/item">
                    <div className="w-5 h-5 rounded-full bg-stone-100 text-[#111827] group-hover/item:bg-[#111827] group-hover/item:text-white flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>Controle completo de clientes e histórico</span>
                  </li>
                </ul>
              </div>

              <button 
                type="button"
                onClick={() => navigate("/onboarding?planId=essencial")} 
                className="w-full h-13 border-2 border-[#111827] text-[#111827] hover:bg-[#111827] hover:text-white font-extrabold text-sm rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center shadow-xs"
              >
                Começar no Essencial &rarr;
              </button>
            </div>

            {/* Plano Studio (Destaque Principal Animado) */}
            <div className="relative group md:-mt-4">
              
              {/* Aura / Halo pulsante em Rose Gold e Grafite */}
              <div className="absolute -inset-1.5 rounded-[36px] bg-gradient-to-r from-[#E5A991] via-[#111827] to-[#E5A991] opacity-75 blur-xl group-hover:opacity-100 animate-glow-pulse transition-all duration-500" />
              
              <div className="relative bg-white rounded-[32px] p-8 sm:p-9 border-2 border-[#111827] shadow-2xl flex flex-col justify-between transition-all duration-300 group-hover:-translate-y-2 h-full">
                
                {/* Badge Topo Flutuante Animado */}
                <div className="absolute -top-5 left-0 right-0 flex justify-center">
                  <div className="bg-[#111827] text-[#E5A991] border border-[#E5A991]/70 text-xs font-black uppercase tracking-wider py-1.5 px-5 rounded-full shadow-xl flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#E5A991] animate-spin" style={{ animationDuration: "6s" }} />
                    <span>Mais Escolhido • 14 Dias Grátis</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4 pt-2">
                    <div className="w-11 h-11 rounded-2xl bg-[#111827] text-[#E5A991] flex items-center justify-center shadow-md">
                      <Zap className="w-5 h-5 fill-[#E5A991]" />
                    </div>
                    <span className="text-xs font-bold text-[#111827] bg-[#E5A991]/25 px-3 py-1 rounded-full border border-[#E5A991]/50">
                      Recomendado
                    </span>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-2xl sm:text-3xl font-black text-[#111827] mb-1">Studio</h3>
                    <p className="text-xs text-[#6B7280]">Para salões, estúdios e barbearias com equipe e foco em lucro.</p>
                  </div>

                  <div className="mb-2 flex items-baseline gap-1.5">
                    <span className="font-serif text-4xl sm:text-5xl font-black text-[#111827] tracking-tight transition-all duration-300">
                      {billingCycle === "annual" ? "R$ 95,90" : "R$ 119,90"}
                    </span>
                    <span className="text-sm font-medium text-[#6B7280]">/mês</span>
                  </div>
                  <p className="text-xs text-[#9C5A42] font-bold mb-6 min-h-[18px]">
                    {billingCycle === "annual" ? "Faturado R$ 1.150,80/ano (economia de R$ 288)" : "14 dias sem pagar nada • Cancele quando quiser"}
                  </p>

                  {/* Banner de destaque interno do teste */}
                  <div className="bg-gradient-to-r from-[#E5A991]/20 via-[#FAFAFA] to-[#E5A991]/15 border border-[#E5A991]/50 rounded-2xl p-3 mb-6 flex items-center gap-3 shadow-xs">
                    <div className="w-7 h-7 rounded-full bg-[#111827] text-[#E5A991] flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="text-[11px] leading-tight">
                      <p className="font-bold text-[#111827]">Teste Completo Sem Risco</p>
                      <p className="text-[#6B7280]">Não pedimos cartão para começar</p>
                    </div>
                  </div>

                  <div className="h-px w-full bg-[#E5E7EB] mb-6" />

                  <ul className="space-y-3.5 mb-8 text-sm text-[#111827]">
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[#E5A991]/25 text-[#9C5A42] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                      <span><strong>Até 5 profissionais</strong> com login próprio</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[#E5A991]/25 text-[#9C5A42] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                      <span>Divisão e cálculo automático de comissões</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[#E5A991]/25 text-[#9C5A42] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                      <span>Painel financeiro com faturamento e despesas</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[#E5A991]/25 text-[#9C5A42] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                      <span>Lembretes anti-no show automáticos no WhatsApp</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[#E5A991]/25 text-[#9C5A42] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                      <span>Controle completo de comandas e caixa</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[#111827] text-[#E5A991] flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <span><strong>14 dias grátis</strong> liberados imediatamente</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <button 
                    type="button"
                    onClick={() => navigate("/onboarding?planId=studio")} 
                    className="relative overflow-hidden w-full h-14 bg-[#111827] hover:bg-[#1F2937] text-white font-extrabold text-base rounded-2xl shadow-xl shadow-[#111827]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer group/cta"
                  >
                    {/* Efeito feixe de luz brilhante passando pelo botão */}
                    <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-shimmer pointer-events-none" />
                    <span className="relative z-10">Experimentar 14 dias grátis</span>
                    <ArrowRight className="w-4 h-4 relative z-10 group-hover/cta:translate-x-1 transition-transform" />
                  </button>
                  <p className="text-center text-[11px] text-[#6B7280] mt-2.5 flex items-center justify-center gap-1.5">
                    <Lock className="w-3 h-3 text-[#9C5A42]" /> Cancelamento em 1 clique • Sem fidelidade
                  </p>
                </div>
              </div>
            </div>

            {/* Plano Elite (Black Card VIP) */}
            <div className="group relative bg-[#111827] rounded-3xl p-8 border border-stone-800 hover:border-[#E5A991]/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col justify-between text-white overflow-hidden">
              
              {/* Efeito suave de luz no canto superior do Black Card */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#E5A991]/15 blur-3xl rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-700" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-stone-800 text-[#E5A991] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#E5A991]/20 transition-all duration-300 shadow-inner">
                    <Crown className="w-5 h-5 text-[#E5A991]" />
                  </div>
                  <span className="text-xs font-bold text-[#E5A991] bg-[#E5A991]/15 px-3 py-1 rounded-full border border-[#E5A991]/30">
                    VIP & Redes
                  </span>
                </div>

                <div className="mb-4">
                  <h3 className="text-2xl font-black text-white mb-1">Elite</h3>
                  <p className="text-xs text-stone-400">Para clínicas, barbearias premium e salões de alto padrão.</p>
                </div>

                <div className="mb-2 flex items-baseline gap-1.5">
                  <span className="font-serif text-4xl sm:text-5xl font-black text-white tracking-tight transition-all duration-300">
                    {billingCycle === "annual" ? "R$ 255,27" : "R$ 319,09"}
                  </span>
                  <span className="text-sm font-medium text-stone-400">/mês</span>
                </div>
                <p className="text-xs text-[#E5A991] font-semibold mb-6 min-h-[18px]">
                  {billingCycle === "annual" ? "Faturado R$ 3.063,24/ano (economia de R$ 765,84)" : "Infraestrutura dedicada de alta capacidade"}
                </p>

                <div className="h-px w-full bg-stone-800 mb-6" />

                <ul className="space-y-3.5 mb-8 text-sm text-stone-300">
                  <li className="flex items-start gap-2.5 group/item">
                    <div className="w-5 h-5 rounded-full bg-stone-800 text-[#E5A991] group-hover/item:bg-[#E5A991] group-hover/item:text-[#111827] flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span><strong>Profissionais ilimitados</strong></span>
                  </li>
                  <li className="flex items-start gap-2.5 group/item">
                    <div className="w-5 h-5 rounded-full bg-stone-800 text-[#E5A991] group-hover/item:bg-[#E5A991] group-hover/item:text-[#111827] flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>Automação completa no WhatsApp</span>
                  </li>
                  <li className="flex items-start gap-2.5 group/item">
                    <div className="w-5 h-5 rounded-full bg-stone-800 text-[#E5A991] group-hover/item:bg-[#E5A991] group-hover/item:text-[#111827] flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>Controle de estoque e produtos de revenda</span>
                  </li>
                  <li className="flex items-start gap-2.5 group/item">
                    <div className="w-5 h-5 rounded-full bg-stone-800 text-[#E5A991] group-hover/item:bg-[#E5A991] group-hover/item:text-[#111827] flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>Campanhas de retorno para clientes inativos</span>
                  </li>
                  <li className="flex items-start gap-2.5 group/item">
                    <div className="w-5 h-5 rounded-full bg-stone-800 text-[#E5A991] group-hover/item:bg-[#E5A991] group-hover/item:text-[#111827] flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>Suporte prioritário VIP via WhatsApp</span>
                  </li>
                </ul>
              </div>

              <button 
                type="button"
                onClick={() => navigate("/onboarding?planId=elite")} 
                className="relative overflow-hidden w-full h-13 bg-[#E5A991] hover:bg-[#D89981] text-[#111827] font-extrabold text-sm rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 group/eliteBtn"
              >
                <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 animate-shimmer pointer-events-none" />
                <span className="relative z-10">Contratar Plano Elite</span>
                <ArrowRight className="w-4 h-4 relative z-10 group-hover/eliteBtn:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>

          {/* Plano Especial / Sob Medida - Redes & Franquias */}
          <div className="mt-10 max-w-6xl mx-auto bg-gradient-to-br from-[#111827] via-stone-900 to-[#111827] border-2 border-[#E5A991]/30 rounded-[32px] p-6 sm:p-10 shadow-2xl relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#E5A991]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="max-w-2xl text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E5A991]/20 border border-[#E5A991]/40 text-[#E5A991] text-xs font-bold mb-3 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#E5A991]" /> Plano Especial & Sob Medida
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
                  Gerencia uma rede de salões, barbearias ou franquia?
                </h3>
                <p className="text-stone-300 text-sm sm:text-base leading-relaxed mb-6">
                  Se você precisa de condições comerciais diferenciadas, migração assistida do seu sistema anterior ou integração de múltiplas filiais, <strong>montamos um plano sob consulta</strong>, com acompanhamento direto da nossa diretoria.
                </p>

                <div className="grid sm:grid-cols-2 gap-3 text-xs sm:text-sm text-stone-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#E5A991] shrink-0" />
                    <span>Múltiplas unidades integradas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#E5A991] shrink-0" />
                    <span>Migração assistida do sistema antigo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#E5A991] shrink-0" />
                    <span>Gerente de contas e WhatsApp VIP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#E5A991] shrink-0" />
                    <span>Treinamento ao vivo para sua equipe</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex flex-col items-center gap-3 w-full lg:w-auto">
                <div className="text-center lg:text-right mb-1">
                  <span className="text-xs font-semibold text-[#E5A991] uppercase tracking-wider block">Valores e Condições</span>
                  <span className="text-2xl sm:text-3xl font-black text-white">Sob Consulta</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const msg = encodeURIComponent("Olá! Gostaria de uma proposta de plano especial sob medida para meu salão / rede no BelezaPura.");
                    window.open(`https://wa.me/5511999999999?text=${msg}`, "_blank");
                  }}
                  className="w-full sm:w-auto px-8 h-13 bg-[#E5A991] hover:bg-[#D89981] text-[#111827] font-extrabold text-sm rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Consulte Nossa Equipe &rarr;</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/contato")}
                  className="text-xs text-stone-400 hover:text-white transition-colors underline underline-offset-4 cursor-pointer"
                >
                  Ou fale pelo formulário de contato
                </button>
              </div>
            </div>
          </div>

          {/* Garantia e Segurança embaixo dos cards */}
          <div className="mt-12 text-center flex flex-wrap items-center justify-center gap-6 text-xs text-[#6B7280]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C47F65]" />
              <span>Sem fidelidade ou multas rescisórias</span>
            </div>
            <span className="hidden sm:inline text-stone-300">•</span>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C47F65]" />
              <span>Ativação imediata em menos de 3 minutos</span>
            </div>
            <span className="hidden sm:inline text-stone-300">•</span>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#C47F65]" />
              <span>Seus dados e finanças 100% seguros</span>
            </div>
          </div>

        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative z-10 py-24 max-w-4xl mx-auto px-5">
        <div className="text-center mb-14 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E5E7EB] text-[#111827] text-xs font-semibold mb-4 shadow-xs">
            <HelpCircle className="w-3.5 h-3.5 text-[#C47F65]" /> Dúvidas Frequentes
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#111827] mb-4">
            Perguntas & Respostas
          </h2>
          <p className="text-[#4B5563] text-base sm:text-lg">
            Tudo o que você precisa saber sobre a experiência BelezaPura.
          </p>
        </div>

        <div className="space-y-3.5">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <div 
                key={index}
                className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden transition-all duration-200 shadow-2xs"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 text-[#111827] font-bold text-base sm:text-lg cursor-pointer hover:text-[#C47F65] transition-colors"
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`w-5 h-5 text-stone-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#C47F65]" : ""}`} />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 text-[#4B5563] text-sm sm:text-base leading-relaxed border-t border-[#E5E7EB] pt-4 animate-fade-up">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative z-10 py-24 overflow-hidden border-t border-[#E5E7EB] bg-gradient-to-b from-[#FAFAFA] to-[#F3F4F6]">
        <div className="max-w-4xl mx-auto px-5 text-center relative z-10">
          <Badge className="bg-[#E5A991]/20 text-[#9C5A42] border border-[#E5A991]/40 font-bold mb-6 text-sm py-1.5 px-4">
            🚀 Comece hoje seu teste gratuito
          </Badge>

          <h2 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-[#111827] mb-6 leading-tight">
            Sua agenda cheia e seu tempo de volta.
          </h2>

          <p className="text-[#4B5563] text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Cadastre seu salão em menos de 3 minutos e comece a receber agendamentos com sinal garantido no PIX.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Button 
              size="lg" 
              onClick={() => navigate("/onboarding?planId=studio")} 
              className="h-16 px-10 bg-[#111827] hover:bg-[#1F2937] text-white font-extrabold text-lg rounded-2xl shadow-xl shadow-[#111827]/25 hover:scale-105 transition-transform"
            >
              Iniciar meus 14 dias grátis agora &rarr;
            </Button>
          </div>

          <div className="text-xs text-[#6B7280] flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Configuração simples em 3 minutos • Sem taxas de cancelamento</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-stone-800 bg-[#111827] py-14 text-stone-400 text-sm">
        <div className="max-w-7xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-[#E5A991]" />
              </div>
              <span className="font-serif text-xl font-bold text-white tracking-tight">BelezaPura</span>
              <span className="text-xs text-[#E5A991] font-medium">Tecnologia & Gestão</span>
            </div>
            <p className="text-xs text-stone-400 max-w-sm mt-1">
              A plataforma inteligente para salões de beleza, barbearias, esmalterias e clínicas de estética no Brasil.
            </p>
            <p className="text-xs text-stone-500 mt-2">
              © 2026 BelezaPura Tecnologia. Todos os direitos reservados.
            </p>
          </div>

          {/* Footer Links */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-6 text-sm font-medium">
            <button 
              onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); navigate("/termos"); }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Termos de Uso
            </button>
            <button 
              onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); navigate("/privacidade"); }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Privacidade
            </button>
            <button 
              onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); navigate("/contato"); }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Fale Conosco
            </button>
            <button 
              onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); navigate("/login"); }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Login Salão
            </button>
            <button 
              onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); navigate("/login-admin"); }}
              className="hover:text-white transition-colors cursor-pointer text-stone-400 hover:text-stone-200"
            >
              Portal Admin
            </button>
          </div>

        </div>
      </footer>

    </div>
  );
}
