import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Sparkles, Calendar, CreditCard, BarChart3, Users, Store, Check, ArrowRight, 
  Menu, X, ChevronRight, ShieldCheck, Smartphone, Zap, Clock, TrendingUp, 
  HelpCircle, MessageSquare, DollarSign, UploadCloud, Scissors, Award, 
  CheckCircle2, ChevronDown, Copy, Play, CheckCheck, Heart, UserCheck
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

// Benefícios Centrais do BelezaPura (100% Originais)
const CORE_BENEFITS = [
  {
    icon: ShieldCheck,
    title: "Sinal Antecipado via PIX",
    subtitle: "Elimine o prejuízo de cadeiras vazias",
    desc: "A cliente confirma a reserva pagando uma porcentagem de sinal definida por você. O dinheiro cai instantaneamente na sua conta bancária sem retenção ou taxas da plataforma.",
    highlight: "Redução de até 40% nas faltas",
    color: "from-emerald-500/10 to-transparent",
    border: "border-emerald-500/20"
  },
  {
    icon: Smartphone,
    title: "Página Exclusiva para a Bio",
    subtitle: "Seu salão aberto 24 horas por dia",
    desc: "Um link elegante e ultrarrápido para colocar no Instagram e WhatsApp. Suas clientes escolhem os procedimentos, o especialista e o horário em segundos, até de madrugada.",
    highlight: "Agendamento automático 24/7",
    color: "from-rose-500/10 to-transparent",
    border: "border-rose-500/20"
  },
  {
    icon: Users,
    title: "Divisão Automática de Comissões",
    subtitle: "Transparência total com seus profissionais",
    desc: "Defina o percentual de cada parceiro por serviço ou produto. A cada atendimento fechado, o sistema rateia os valores sem erros na calculadora e sem atrito na equipe.",
    highlight: "Cálculo exato a cada comanda",
    color: "from-purple-500/10 to-transparent",
    border: "border-purple-500/20"
  },
  {
    icon: BarChart3,
    title: "Painel Financeiro & Lucro Líquido",
    subtitle: "Clareza sobre o faturamento real",
    desc: "Acompanhe faturamento diário, semanal e mensal, ticket médio por atendimento, faturamento por cadeira e previsão de fluxo de caixa em gráficos limpos e intuitivos.",
    highlight: "Visão estratégica em tempo real",
    color: "from-blue-500/10 to-transparent",
    border: "border-blue-500/20"
  },
  {
    icon: MessageSquare,
    title: "Lembretes Automáticos Anti-No Show",
    subtitle: "Clientes sempre avisadas com antecedência",
    desc: "Dispare confirmações automáticas com antecedência para garantir que a cliente não se esqueça da data. Caso precise remarcar, o horário é liberado para outra pessoa.",
    highlight: "Zero esquecimentos de horário",
    color: "from-amber-500/10 to-transparent",
    border: "border-amber-500/20"
  },
  {
    icon: Calendar,
    title: "Agenda Sincronizada sem Conflitos",
    subtitle: "Fim definitivo das folhas rasuradas",
    desc: "Cada profissional acessa sua própria agenda no celular com horários, intervalos de almoço e folgas configuráveis. Chega de dois clientes marcados na mesma hora.",
    highlight: "Sincronização em milissegundos",
    color: "from-pink-500/10 to-transparent",
    border: "border-pink-500/20"
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
  // Com o sinal antecipado, pelo menos 40% das faltas são evitadas e o sinal cobre o custo
  const faturamentoSalvo = Math.round(prejuizoAtual * 0.40);
  const custoPlanoStudio = 119.90;
  const lucroLiquidoExtra = faturamentoSalvo - custoPlanoStudio;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(activeScenario.pixCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  return (
    <div className="min-h-full bg-[#0B0D13] text-zinc-100 font-sans selection:bg-[#FF3D6B]/30 selection:text-white antialiased overflow-x-hidden">
      
      {/* Background glow suave */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[500px] bg-gradient-to-b from-[#FF3D6B]/15 via-[#E11D48]/10 to-transparent blur-[120px] rounded-full" />
        <div className="absolute top-[40%] -left-40 w-[500px] h-[400px] bg-purple-600/10 blur-[130px] rounded-full" />
      </div>

      {/* Top Banner Informativo */}
      <div className="relative z-50 bg-gradient-to-r from-[#FF3D6B] via-[#E11D48] to-[#9333EA] text-white py-2 px-4 text-center text-xs md:text-sm font-semibold tracking-wide flex items-center justify-center gap-2 shadow-md">
        <Sparkles className="w-4 h-4" />
        <span>Experimente o <strong>BelezaPura</strong> com 14 dias de demonstração gratuita. Sem taxas de adesão!</span>
        <button 
          onClick={() => navigate("/onboarding?planId=studio")}
          className="underline font-bold hover:text-white/80 cursor-pointer ml-1 hidden sm:inline"
        >
          Criar meu espaço &rarr;
        </button>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#0B0D13]/85 backdrop-blur-xl border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-5 h-20 flex items-center justify-between">
          
          {/* Logo BelezaPura */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#FF3D6B] to-[#FF7597] flex items-center justify-center shadow-lg shadow-[#FF3D6B]/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-2xl font-bold tracking-tight text-white">BelezaPura</span>
                <span className="brand-badge text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">Gestão</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-medium tracking-wider uppercase">Plataforma para Salões</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-zinc-300">
            <a href="#beneficios" className="hover:text-white transition-colors">Recursos</a>
            <a href="#demonstracao" className="hover:text-white transition-colors">Como Funciona</a>
            <a href="#calculadora" className="hover:text-white transition-colors">Calculadora de Retorno</a>
            <a href="#planos" className="hover:text-white transition-colors">Planos & Preços</a>
            <a href="#faq" className="hover:text-white transition-colors">Dúvidas Frequentes</a>
          </nav>

          {/* Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/login")} 
              className="text-zinc-300 hover:text-white hover:bg-zinc-800/80 font-medium"
            >
              Entrar
            </Button>
            <Button 
              size="md" 
              onClick={() => navigate("/onboarding?planId=studio")} 
              className="bg-gradient-to-r from-[#FF3D6B] to-[#E11D48] text-white hover:brightness-110 font-bold shadow-lg shadow-[#FF3D6B]/30 hover-lift rounded-xl px-5"
            >
              Testar 14 dias grátis <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button 
            className="lg:hidden p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white cursor-pointer" 
            onClick={() => setMobileMenu(v => !v)}
            aria-label="Menu"
          >
            {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenu && (
          <div className="lg:hidden bg-[#0F1118] border-b border-zinc-800 px-6 py-6 flex flex-col gap-4 text-base font-medium animate-fade-up">
            <a href="#beneficios" onClick={() => setMobileMenu(false)} className="text-zinc-200 hover:text-[#FF3D6B] py-1">Recursos</a>
            <a href="#demonstracao" onClick={() => setMobileMenu(false)} className="text-zinc-200 hover:text-[#FF3D6B] py-1">Como Funciona</a>
            <a href="#calculadora" onClick={() => setMobileMenu(false)} className="text-zinc-200 hover:text-[#FF3D6B] py-1">Calculadora de Retorno</a>
            <a href="#planos" onClick={() => setMobileMenu(false)} className="text-zinc-200 hover:text-[#FF3D6B] py-1">Planos & Preços</a>
            <a href="#faq" onClick={() => setMobileMenu(false)} className="text-zinc-200 hover:text-[#FF3D6B] py-1">Dúvidas Frequentes</a>
            
            <div className="pt-4 border-t border-zinc-800 flex flex-col gap-3">
              <Button 
                variant="outline" 
                className="w-full justify-center border-zinc-700 text-zinc-200 bg-zinc-900 hover:bg-zinc-800" 
                onClick={() => { setMobileMenu(false); navigate("/login"); }}
              >
                Acessar meu salão
              </Button>
              <Button 
                className="w-full justify-center bg-gradient-to-r from-[#FF3D6B] to-[#E11D48] text-white font-bold h-12 shadow-lg shadow-[#FF3D6B]/30" 
                onClick={() => { setMobileMenu(false); navigate("/onboarding?planId=studio"); }}
              >
                Começar 14 dias grátis
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-14 pb-20 md:pt-22 md:pb-28 max-w-7xl mx-auto px-5">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 flex flex-col items-start animate-fade-up">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF3D6B]/10 border border-[#FF3D6B]/30 text-[#FF3D6B] text-xs md:text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4 text-[#FF3D6B]" />
              <span>Seu salão. Sua agenda. Seu negócio.</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white leading-[1.08] mb-6">
              Agende, receba e organize seu salão{" "}
              <span className="brand-text-gradient">em um só lugar.</span>
            </h1>

            <p className="text-zinc-300 text-lg sm:text-xl leading-relaxed mb-8 max-w-2xl font-normal">
              O ecossistema definitivo para salões de beleza, barbearias e clínicas de estética: sua cliente agenda online 24h, garante a vaga com <strong>sinal no PIX</strong> e sua equipe atende sem atritos.
            </p>

            {/* CTAs */}
            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-4 mb-8">
              <Button 
                size="lg" 
                onClick={() => navigate("/onboarding?planId=studio")} 
                className="h-14 sm:h-16 px-8 bg-gradient-to-r from-[#FF3D6B] via-[#E11D48] to-[#BE185D] text-white font-bold text-base sm:text-lg rounded-2xl shadow-2xl shadow-[#FF3D6B]/40 hover:brightness-110 hover-lift justify-center"
              >
                Experimentar 14 dias grátis <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <a 
                href="#demonstracao"
                className="inline-flex items-center justify-center h-14 sm:h-16 px-6 rounded-2xl border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 font-semibold text-base transition-all backdrop-blur-md hover-lift gap-2"
              >
                <Play className="w-4 h-4 text-[#FF3D6B] fill-[#FF3D6B]" /> Ver demonstração
              </a>
            </div>

            {/* Guarantees */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs sm:text-sm text-zinc-400 font-medium">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> 14 dias sem custo
              </span>
              <span className="flex items-center gap-1.5 text-zinc-300">
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> Sem taxa de adesão
              </span>
              <span className="flex items-center gap-1.5 text-zinc-300">
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> Cancele quando quiser
              </span>
            </div>

          </div>

          {/* Hero Right Visual: Demonstrador do Agendamento BelezaPura */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end animate-fade-up">
            <div className="w-full max-w-[390px] relative">
              
              {/* Badge Flutuante de Segurança */}
              <div className="absolute -top-4 -left-6 z-20 bg-zinc-900/90 border border-zinc-700/80 rounded-2xl p-3 shadow-xl backdrop-blur-md hidden sm:flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Sinal no PIX Garantido</div>
                  <div className="text-[10px] text-zinc-400">Direto na sua conta bancária</div>
                </div>
              </div>

              {/* Moldura do Celular */}
              <div className="rounded-[44px] p-3.5 bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-950 shadow-2xl border-4 border-zinc-800 shadow-[#FF3D6B]/15">
                <div className="rounded-[36px] bg-[#0E151E] overflow-hidden border border-zinc-800 flex flex-col h-[540px]">
                  
                  {/* Top Bar do Agendamento */}
                  <div className="bg-[#1F2C34] px-4 py-3 flex items-center justify-between border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#FF3D6B] flex items-center justify-center text-white font-bold text-sm shadow">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-1.5">
                          Studio BelezaPura
                        </div>
                        <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                          ● agendamento online ativo
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mensagens e Confirmação */}
                  <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 text-xs font-normal bg-[#0c131a]">
                    
                    <div className="text-center my-1">
                      <span className="bg-[#182229] text-zinc-400 text-[10px] px-2.5 py-1 rounded-md shadow-sm">
                        Agendamento VIP via BelezaPura
                      </span>
                    </div>

                    {/* Mensagem da Cliente */}
                    <div className="flex justify-end">
                      <div className="max-w-[85%] bg-[#005c4b] text-white p-3 rounded-2xl rounded-tr-xs shadow-sm">
                        <p>{activeScenario.clientMessage}</p>
                        <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-emerald-200">
                          <span>14:02</span>
                          <CheckCheck className="w-3 h-3 text-sky-300" />
                        </div>
                      </div>
                    </div>

                    {/* Resposta do Salão */}
                    <div className="flex justify-start">
                      <div className="max-w-[90%] bg-[#202c33] text-zinc-100 p-3 rounded-2xl rounded-tl-xs shadow-sm border border-zinc-700/50 space-y-2.5">
                        <p className="leading-relaxed">{activeScenario.systemReply}</p>
                        
                        {/* Box do PIX */}
                        <div className="bg-[#111b21] p-2.5 rounded-xl border border-emerald-500/30 text-[11px] space-y-2">
                          <div className="flex items-center justify-between text-emerald-400 font-bold">
                            <span>Sinal para Reserva</span>
                            <Badge variant="success" className="text-[9px] px-1 py-0">PIX Direto</Badge>
                          </div>
                          
                          <div className="font-mono text-[9px] text-zinc-400 truncate bg-black/40 p-1.5 rounded border border-zinc-800">
                            {activeScenario.pixCode}
                          </div>

                          <button 
                            onClick={handleCopyPix}
                            className="w-full py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Copy className="w-3 h-3" /> {copiedPix ? "Chave Copiada!" : "Copiar Código PIX"}
                          </button>
                        </div>

                        <div className="text-[9px] text-zinc-400 text-right">14:02</div>
                      </div>
                    </div>

                    {/* Confirmação pós-pagamento */}
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5 text-center">
                      <span className="text-[11px] font-bold text-emerald-400">
                        ✓ Horário confirmado na agenda da {activeScenario.professional}!
                      </span>
                    </div>

                  </div>

                  {/* Seletor de Cenários */}
                  <div className="p-2.5 bg-[#1F2C34] border-t border-zinc-800 flex items-center gap-1.5 overflow-x-auto">
                    {BOOKING_SCENARIOS.map(sc => (
                      <button
                        key={sc.id}
                        onClick={() => setActiveScenario(sc)}
                        className={`text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                          activeScenario.id === sc.id
                            ? "bg-[#FF3D6B] text-white shadow-sm"
                            : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
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
      <section className="relative z-20 border-y border-zinc-800 bg-[#0F121A]/90 py-8 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-5 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          
          <div className="flex flex-col items-center">
            <span className="font-serif text-3xl sm:text-4xl font-extrabold text-white tracking-tight">100% Direto</span>
            <span className="text-zinc-400 text-xs sm:text-sm font-medium mt-1">
              O PIX cai na sua conta sem retenção
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="font-serif text-3xl sm:text-4xl font-extrabold text-white tracking-tight">24h / 7 dias</span>
            <span className="text-zinc-400 text-xs sm:text-sm font-medium mt-1">
              Recepção online ativa no link da bio
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="font-serif text-3xl sm:text-4xl font-extrabold text-emerald-400 tracking-tight">-40% Faltas</span>
            <span className="text-zinc-400 text-xs sm:text-sm font-medium mt-1">
              Sinal obrigatório que garante o horário
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="font-serif text-3xl sm:text-4xl font-extrabold text-[#FF3D6B] tracking-tight">14 Dias</span>
            <span className="text-zinc-400 text-xs sm:text-sm font-medium mt-1">
              Demonstração gratuita sem burocracia
            </span>
          </div>

        </div>
      </section>

      {/* Seção de Recursos Proprietários */}
      <section id="beneficios" className="relative z-10 py-24 max-w-7xl mx-auto px-5">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF3D6B]/10 border border-[#FF3D6B]/30 text-[#FF3D6B] text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Eficiência Operacional
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white mb-5">
            Tudo o que seu salão precisa para <span className="brand-text-gradient">faturar mais e organizar sua equipe</span>
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            Menos tempo respondendo mensagens repetitivas e calculando comissões no papel. Mais foco em atender bem suas clientes.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CORE_BENEFITS.map((item, idx) => (
            <div 
              key={idx}
              className={`rounded-3xl p-7 bg-[#11141F] border ${item.border} relative overflow-hidden flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 group shadow-lg`}
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-[#FF3D6B] flex items-center justify-center font-bold mb-5 shadow-sm group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6" />
                </div>

                <div className="text-xs font-semibold text-[#FF7597] uppercase tracking-wider mb-1">
                  {item.subtitle}
                </div>

                <h3 className="font-bold text-white text-xl mb-3 leading-snug">
                  {item.title}
                </h3>

                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  {item.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-800/80 text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Check className="w-4 h-4 stroke-[3]" /> {item.highlight}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Demonstração: Como Funciona o Fluxo */}
      <section id="demonstracao" className="relative z-10 py-24 bg-[#0D1018] border-y border-zinc-800">
        <div className="max-w-7xl mx-auto px-5">
          
          <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-up">
            <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white mb-5">
              Simples para o salão. <span className="brand-text-gradient">Encantador para a cliente.</span>
            </h2>
            <p className="text-zinc-400 text-base sm:text-lg">
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
              <div key={i} className="bg-[#121622] rounded-3xl p-6 border border-zinc-800 hover:border-zinc-700 transition-all shadow-md">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF3D6B] to-[#FF7597] text-white flex items-center justify-center font-bold text-sm mb-4 shadow">
                  {st.step}
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{st.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Calculadora de Retorno Real do BelezaPura */}
      <section id="calculadora" className="relative z-10 py-24 max-w-7xl mx-auto px-5">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-4">
            <DollarSign className="w-3.5 h-3.5" /> Retorno Real do Investimento
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white mb-5">
            O BelezaPura se paga <span className="brand-text-gradient">evitando um único furo</span>
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            Veja quanto seu salão perde hoje com cadeiras vazias e quanto você protege exigindo o sinal prévio.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
          
          {/* Controles da Calculadora */}
          <div className="lg:col-span-7 bg-[#121622] rounded-3xl p-6 sm:p-8 border border-zinc-800 shadow-xl space-y-6">
            
            {/* Profissionais */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-zinc-300">Profissionais na Equipe:</label>
                <span className="font-bold text-white bg-zinc-800 px-3 py-1 rounded-lg text-sm border border-zinc-700">
                  {numStaff} {numStaff === 1 ? "profissional" : "profissionais"}
                </span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="12" 
                value={numStaff}
                onChange={(e) => setNumStaff(Number(e.target.value))}
                className="w-full accent-[#FF3D6B] cursor-pointer"
              />
            </div>

            {/* Ticket Médio */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-zinc-300">Ticket Médio do Atendimento:</label>
                <span className="font-bold text-emerald-400 bg-zinc-800 px-3 py-1 rounded-lg text-sm border border-zinc-700">
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
                className="w-full accent-[#FF3D6B] cursor-pointer"
              />
            </div>

            {/* Faltas semanais */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-zinc-300">Faltas / No-Shows por Semana:</label>
                <span className="font-bold text-red-400 bg-zinc-800 px-3 py-1 rounded-lg text-sm border border-zinc-700">
                  {noShowsPerWeek} {noShowsPerWeek === 1 ? "falta/semana" : "faltas/semana"}
                </span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="15" 
                value={noShowsPerWeek}
                onChange={(e) => setNoShowsPerWeek(Number(e.target.value))}
                className="w-full accent-[#FF3D6B] cursor-pointer"
              />
            </div>

            <div className="pt-3 border-t border-zinc-800 text-xs text-zinc-400 leading-relaxed">
              * O cálculo considera a redução real de no-shows proporcionada pela confirmação de sinal via PIX antecipado.
            </div>

          </div>

          {/* Resultado */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#181C29] to-[#0E1119] rounded-3xl p-6 sm:p-8 border border-[#FF3D6B]/40 shadow-2xl flex flex-col justify-between">
            
            <div>
              <Badge className="bg-[#FF3D6B]/20 text-[#FF3D6B] border-[#FF3D6B]/40 font-bold mb-4">
                Proteção Financeira Mensal
              </Badge>

              <div className="space-y-4 mb-6">
                <div>
                  <div className="text-xs text-zinc-400">Prejuízo mensal estimado em faltas:</div>
                  <div className="text-xl font-bold text-red-400 line-through">
                    - R$ {prejuizoAtual.toLocaleString('pt-BR')},00 / mês
                  </div>
                </div>

                <div>
                  <div className="text-xs text-zinc-400">Faturamento protegido com o sinal PIX:</div>
                  <div className="text-3xl font-extrabold text-emerald-400 font-serif">
                    + R$ {faturamentoSalvo.toLocaleString('pt-BR')},00
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Investimento Plano Studio:</span>
                  <span className="font-bold text-white">R$ 119,90 / mês</span>
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center mb-6">
                <div className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                  Lucro Líquido Preservado no seu Bolso:
                </div>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  + R$ {lucroLiquidoExtra.toLocaleString('pt-BR')},00 / mês
                </div>
              </div>
            </div>

            <Button 
              onClick={() => navigate("/onboarding?planId=studio")} 
              className="w-full h-13 bg-gradient-to-r from-[#FF3D6B] to-[#E11D48] text-white font-bold text-base rounded-xl shadow-lg shadow-[#FF3D6B]/30 hover-lift justify-center"
            >
              Blindar minha agenda com 14 dias grátis &rarr;
            </Button>

          </div>

        </div>
      </section>

      {/* Planos Oficiais BelezaPura */}
      <section id="planos" className="relative z-10 py-24 bg-[#0D1018] border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-5">
          
          <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF3D6B]/10 border border-[#FF3D6B]/30 text-[#FF3D6B] text-xs font-semibold mb-4">
              <Award className="w-3.5 h-3.5" /> Planos Transparentes
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white mb-5">
              Escolha o plano ideal para a <span className="brand-text-gradient">fase do seu negócio</span>
            </h2>
            <p className="text-zinc-400 text-base sm:text-lg">
              Sem fidelidade, sem taxas de cancelamento. Teste 14 dias grátis no plano Studio sem compromisso.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            
            {/* Plano Essencial */}
            <div className="bg-[#11141F] rounded-3xl p-8 border border-zinc-800 flex flex-col justify-between hover:border-zinc-700 transition-all shadow-xl">
              <div>
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white mb-1">Essencial</h3>
                  <p className="text-xs text-zinc-400">Para quem atende sozinho e quer acabar com os furos.</p>
                </div>

                <div className="mb-6 flex items-baseline gap-1">
                  <span className="font-serif text-4xl font-extrabold text-white">R$ 59,90</span>
                  <span className="text-sm font-medium text-zinc-400">/mês</span>
                </div>

                <div className="h-px w-full bg-zinc-800 mb-6" />

                <ul className="space-y-3 mb-8 text-sm text-zinc-300">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>1 profissional</strong> atendendo</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Página exclusiva para bio do Instagram</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Cobrança de sinal obrigatório via PIX</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Lembretes automáticos para clientes</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Controle de clientes e agendamentos</span>
                  </li>
                </ul>
              </div>

              <Button 
                onClick={() => navigate("/onboarding?planId=essencial")} 
                variant="outline"
                className="w-full h-12 border-zinc-700 text-white hover:bg-zinc-800 font-bold rounded-xl"
              >
                Começar no Essencial
              </Button>
            </div>

            {/* Plano Studio (Destaque 14 Dias Grátis) */}
            <div className="bg-gradient-to-b from-[#1C2030] to-[#121624] rounded-3xl p-8 border-2 border-[#FF3D6B] flex flex-col justify-between shadow-2xl shadow-[#FF3D6B]/25 relative scale-105 z-10">
              
              <div className="absolute -top-4 left-0 right-0 flex justify-center">
                <span className="bg-gradient-to-r from-[#FF3D6B] to-[#E11D48] text-white text-xs font-black uppercase tracking-wider py-1.5 px-4 rounded-full shadow-md">
                  ⭐ Mais Escolhido • 14 Dias Grátis
                </span>
              </div>

              <div>
                <div className="mb-4 pt-2">
                  <h3 className="text-2xl font-black text-white mb-1">Studio</h3>
                  <p className="text-xs text-zinc-300">Para salões e barbearias com equipe e foco em crescimento.</p>
                </div>

                <div className="mb-6 flex items-baseline gap-1">
                  <span className="font-serif text-4xl sm:text-5xl font-black text-white">R$ 119,90</span>
                  <span className="text-sm font-medium text-zinc-300">/mês</span>
                </div>

                <div className="h-px w-full bg-zinc-700/80 mb-6" />

                <ul className="space-y-3 mb-8 text-sm text-zinc-100">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#FF3D6B] shrink-0 mt-0.5" />
                    <span><strong>Até 5 profissionais</strong> com acessos próprios</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#FF3D6B] shrink-0 mt-0.5" />
                    <span>Divisão e cálculo automático de comissões</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#FF3D6B] shrink-0 mt-0.5" />
                    <span>Painel financeiro com lucros e despesas</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#FF3D6B] shrink-0 mt-0.5" />
                    <span>Lembretes anti-no show no WhatsApp</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#FF3D6B] shrink-0 mt-0.5" />
                    <span>Controle completo de comandas e serviços</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#FF3D6B] shrink-0 mt-0.5" />
                    <span><strong>14 dias grátis</strong> para testar sem custo</span>
                  </li>
                </ul>
              </div>

              <div>
                <Button 
                  onClick={() => navigate("/onboarding?planId=studio")} 
                  className="w-full h-14 bg-gradient-to-r from-[#FF3D6B] via-[#E11D48] to-[#9333EA] text-white font-extrabold text-base rounded-xl shadow-lg shadow-[#FF3D6B]/40 hover:brightness-110 hover-lift justify-center"
                >
                  Experimentar 14 dias grátis &rarr;
                </Button>
                <p className="text-center text-[11px] text-zinc-400 mt-2">
                  Cancele quando quiser com 1 clique
                </p>
              </div>
            </div>

            {/* Plano Elite */}
            <div className="bg-[#11141F] rounded-3xl p-8 border border-zinc-800 flex flex-col justify-between hover:border-zinc-700 transition-all shadow-xl">
              <div>
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white mb-1">Elite</h3>
                  <p className="text-xs text-zinc-400">Para grandes operações, clínicas e redes de beleza.</p>
                </div>

                <div className="mb-6 flex items-baseline gap-1">
                  <span className="font-serif text-4xl font-extrabold text-white">R$ 249,90</span>
                  <span className="text-sm font-medium text-zinc-400">/mês</span>
                </div>

                <div className="h-px w-full bg-zinc-800 mb-6" />

                <ul className="space-y-3 mb-8 text-sm text-zinc-300">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Profissionais ilimitados</strong></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Automação completa no WhatsApp</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Controle de estoque e produtos de revenda</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Mensagens de retorno para clientes inativos</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Suporte prioritário VIP via WhatsApp</span>
                  </li>
                </ul>
              </div>

              <Button 
                onClick={() => navigate("/onboarding?planId=elite")} 
                variant="outline"
                className="w-full h-12 border-zinc-700 text-white hover:bg-zinc-800 font-bold rounded-xl"
              >
                Contratar Elite
              </Button>
            </div>

          </div>

        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative z-10 py-24 max-w-4xl mx-auto px-5">
        <div className="text-center mb-14 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-semibold mb-4">
            <HelpCircle className="w-3.5 h-3.5 text-[#FF3D6B]" /> Dúvidas Frequentes
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Perguntas & Respostas
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg">
            Tudo o que você precisa saber sobre a experiência BelezaPura.
          </p>
        </div>

        <div className="space-y-3.5">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <div 
                key={index}
                className="bg-[#121622] border border-zinc-800/80 rounded-2xl overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 text-white font-bold text-base sm:text-lg cursor-pointer hover:text-[#FF7597] transition-colors"
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`w-5 h-5 text-zinc-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#FF3D6B]" : ""}`} />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 text-zinc-300 text-sm sm:text-base leading-relaxed border-t border-zinc-800/60 pt-4 animate-fade-up">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative z-10 py-24 overflow-hidden border-t border-zinc-800">
        <div className="max-w-4xl mx-auto px-5 text-center relative z-10">
          <Badge className="bg-[#FF3D6B]/20 text-[#FF3D6B] border-[#FF3D6B]/40 font-bold mb-6 text-sm py-1.5 px-4">
            🚀 Comece hoje seu teste gratuito
          </Badge>

          <h2 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
            Sua agenda cheia e seu tempo de volta.
          </h2>

          <p className="text-zinc-300 text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Cadastre seu salão em menos de 3 minutos e comece a receber agendamentos com sinal garantido no PIX.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Button 
              size="lg" 
              onClick={() => navigate("/onboarding?planId=studio")} 
              className="h-16 px-10 bg-gradient-to-r from-[#FF3D6B] via-[#E11D48] to-[#9333EA] text-white font-extrabold text-lg rounded-2xl shadow-2xl shadow-[#FF3D6B]/40 hover:scale-105 transition-transform"
            >
              Iniciar meus 14 dias grátis agora &rarr;
            </Button>
          </div>

          <div className="text-xs text-zinc-400 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Configuração simples em 3 minutos • Sem taxas de cancelamento</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800/80 bg-[#090B10] py-14 text-zinc-400 text-sm">
        <div className="max-w-7xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[#FF3D6B] to-[#FF7597] flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-serif text-xl font-bold text-white tracking-tight">BelezaPura</span>
              <span className="text-xs text-zinc-500 font-medium">Tecnologia & Gestão</span>
            </div>
            <p className="text-xs text-zinc-500 max-w-sm mt-1">
              A plataforma inteligente para salões de beleza, barbearias, esmalterias e clínicas de estética no Brasil.
            </p>
            <p className="text-xs text-zinc-600 mt-2">
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
              className="hover:text-white transition-colors cursor-pointer text-zinc-500"
            >
              Portal Admin
            </button>
          </div>

        </div>
      </footer>

    </div>
  );
}
