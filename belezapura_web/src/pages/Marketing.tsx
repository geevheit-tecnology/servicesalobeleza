import { PlanCatalog } from "@/components/PlanCatalog";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Sparkles, Calendar, CreditCard, BarChart3, Users, Store, Check, ArrowRight, 
  Menu, X, ChevronRight, ShieldCheck, Smartphone, Zap, Clock, TrendingUp, 
  HelpCircle, MessageSquare, DollarSign, UploadCloud, Scissors, Award, 
  CheckCircle2, ChevronDown, Copy, Play, CheckCheck, Heart, UserCheck, Crown, Lock
} from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { formatCurrency } from "@/utils/formatters";

// Notificações de Atividade em Tempo Real (Social Proof Dinâmico)
const LIVE_NOTIFICATIONS = [
  { name: "Mariana S.", action: "agendou Alongamento em Gel com Rafaela", time: "há 2 min", value: "Sinal de R$ 36 no Pix" },
  { name: "Camila R.", action: "garantiu horário de Drenagem", time: "há 5 min", value: "Sinal de R$ 30 no Pix" },
  { name: "Juliana M.", action: "marcou Bronzeamento com Fita", time: "há 8 min", value: "Sinal de R$ 24 no Pix" },
  { name: "Studio Bella", action: "liberou 4 horários no Instagram", time: "há 11 min", value: "Link da bio ativo" }
];

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
    id: "alongamento",
    service: "Alongamento em gel",
    price: "R$ 180,00",
    duration: "3h",
    professional: "Rafaela",
    clientMessage: "Oi! Quero agendar alongamento em gel pra sábado às 14h com a Rafaela.",
    systemReply: "Horário reservado! Pra confirmar, o sinal de 20% (R$ 36,00) é no Pix. O resto você paga no dia.",
    pixCode: "00020126580014br.gov.bcb.pix0136belezapura-sinal-59102452040000530398654036.005802BR5913Studio Rafaela6009Sao Paulo62070503***6304A1B2"
  },
  {
    id: "drenagem",
    service: "Drenagem",
    price: "R$ 150,00",
    duration: "1h",
    professional: "Camila",
    clientMessage: "Olá! Gostaria de agendar uma drenagem na sexta às 16h com a Camila.",
    systemReply: "Horário reservado! Pra confirmar, o sinal de 20% (R$ 30,00) é no Pix. O resto você paga no dia.",
    pixCode: "00020126580014br.gov.bcb.pix0136belezapura-sinal-88419252040000530398654030.005802BR5913Studio Camila6009Sao Paulo62070503***6304F4C8"
  },
  {
    id: "bronzeamento",
    service: "Bronzeamento com fita",
    price: "R$ 120,00",
    duration: "1h30",
    professional: "Juliana",
    clientMessage: "Oi! Quero marcar bronzeamento com fita para quinta às 10h com a Juliana.",
    systemReply: "Horário reservado! Pra confirmar, o sinal de 20% (R$ 24,00) é no Pix. O resto você paga no dia.",
    pixCode: "00020126580014br.gov.bcb.pix0136belezapura-sinal-33491052040000530398654024.005802BR5913Studio Juliana6009Sao Paulo62070503***6304D9E1"
  }
];

// Benefícios Centrais do BelezaPura
const CORE_BENEFITS = [
  {
    icon: ShieldCheck,
    title: "Segurança para o seu studio e para o seu dia.",
    subtitle: "Compromisso com o sinal",
    desc: "Procedimentos como alongamento e drenagem ocupam horas de cadeira. Com a reserva confirmada no Pix, sua cliente se compromete com o horário e seu tempo é valorizado.",
    highlight: "Sinal no Pix direto na sua conta",
    border: "border-[#E5E7EB] hover:border-[#E5A991]"
  },
  {
    icon: Smartphone,
    title: "Link na bio que agenda de madrugada.",
    subtitle: "Agenda 24 horas",
    desc: "A cliente que pensou no assunto às 23h30 marca na hora, sem esperar você responder o direct.",
    highlight: "Agendamento direto sem esperar direct",
    border: "border-[#E5E7EB] hover:border-[#111827]"
  },
  {
    icon: Users,
    title: "Comissão sem caderninho.",
    subtitle: "Controle da equipe",
    desc: "No fim do mês você vê quanto cada profissional produziu e uma estimativa da comissão.",
    highlight: "Estimativa sobre serviços concluídos",
    border: "border-[#E5E7EB] hover:border-[#E5A991]"
  },
  {
    icon: MessageSquare,
    title: "Estoque que avisa.",
    subtitle: "Controle de materiais",
    desc: "Esmalte, gel, creme, óleo de bronzeamento: cadastre e veja o que está abaixo do mínimo.",
    highlight: "Alerta de itens abaixo do mínimo",
    border: "border-[#E5E7EB] hover:border-[#111827]"
  },
  {
    icon: Calendar,
    title: "Agenda que respeita o tempo de cada serviço.",
    subtitle: "Horários sem atropelo",
    desc: "Alongamento leva 3h, manutenção 1h30. O sistema considera a duração, o expediente e os dias bloqueados.",
    highlight: "Duração real e dias bloqueados",
    border: "border-[#E5E7EB] hover:border-[#E5A991]"
  }
];

// FAQs Oficiais BelezaPura
const FAQ_ITEMS = [
  {
    q: "Como funciona a demonstração gratuita de 14 dias?",
    a: "Você tem acesso irrestrito a todas as ferramentas durante 14 dias completos para testar na prática com suas clientes. Você cadastra seus serviços, equipe e chave Pix. Sem cartão de crédito e sem taxas de adesão."
  },
  {
    q: "Para onde vai o dinheiro do sinal cobrado no Pix?",
    a: "O valor do sinal vai 100% diretamente para a sua chave Pix bancária cadastrada. O BelezaPura não retém seu dinheiro e não cobra porcentagem sobre o agendamento. Você confere o recebimento no seu aplicativo bancário e confirma a reserva no painel."
  },
  {
    q: "Minhas clientes precisam baixar algum aplicativo?",
    a: "Não! O agendamento é feito pelo navegador do celular através do link exclusivo da sua bio do Instagram ou WhatsApp. É rápido, leve e não ocupa memória do aparelho."
  },
  {
    q: "O BelezaPura serve para profissionais que atendem sozinhas?",
    a: "Com certeza! É ideal para nail designers, esteticistas e profissionais de bronzeamento que atendem de forma autônoma e precisam que a agenda trabalhe enquanto estão com a mão no procedimento."
  },
  {
    q: "Como funciona o cálculo e rateio de comissões da equipe?",
    a: "O painel calcula uma estimativa de comissão para cada profissional com base nos atendimentos concluídos e na porcentagem definida. O repasse financeiro é feito pelo salão fora do sistema."
  },
  {
    q: "Já tenho clientes anotados em planilhas ou cadernos. Como migrar?",
    a: "Cadastre seus clientes, serviços e profissionais diretamente pelo painel em poucos minutos. A importação automática de planilhas ainda não está disponível."
  }
];

export default function Marketing() {
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);
  
  // Ciclo de cobrança (Mensal vs Anual)
  
  // Demonstrador interativo
  const [activeScenario, setActiveScenario] = useState<BookingScenario>(BOOKING_SCENARIOS[0]);
  const [copiedPix, setCopiedPix] = useState(false);

  // Notificações flutuantes dinâmicas
  const [liveNotifIndex, setLiveNotifIndex] = useState(0);
  const [showLiveNotif, setShowLiveNotif] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveNotifIndex((prev) => (prev + 1) % LIVE_NOTIFICATIONS.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

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
    <div className="min-h-full bg-[#FAFAFA] text-[#111827] font-sans selection:bg-[#E5A991]/30 selection:text-[#111827] antialiased overflow-x-hidden relative">
      
      {/* Background dinâmico, malha de textura e orbes luminosas */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 mesh-grid opacity-50" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-b from-[#E5A991]/20 via-[#F5D0C5]/15 to-transparent blur-[130px] rounded-full animate-pulse-soft" />
        <div className="absolute top-[25%] -left-32 w-[550px] h-[550px] bg-gradient-to-tr from-[#E5A991]/15 via-[#FCE7F3]/25 to-transparent blur-[140px] rounded-full animate-float-slow" />
        <div className="absolute top-[60%] -right-32 w-[600px] h-[600px] bg-gradient-to-bl from-[#FEF3C7]/20 via-[#E5A991]/10 to-transparent blur-[140px] rounded-full animate-float-delay" />
      </div>

      {/* Top Banner Elegante Preto Profundo */}
      <div className="relative z-50 bg-[#111827] text-white py-2.5 px-4 text-center text-xs md:text-sm font-medium tracking-wide flex items-center justify-center gap-2 shadow-xs">
        <Sparkles className="w-4 h-4 text-[#E5A991]" />
        <span>14 dias grátis, sem cartão. Você testa com suas clientes de verdade.</span>
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
              <span className="text-[10px] text-[#6B7280] font-medium tracking-wider uppercase">Estética, Bronze & Unhas</span>
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
                Testar 14 dias grátis
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
              <span>Seu espaço. Sua agenda. Suas clientes.</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-[#111827] leading-[1.08] mb-6">
              Sua agenda organizada e sem furos de última hora.
            </h1>

            <p className="text-[#4B5563] text-lg sm:text-xl leading-relaxed mb-8 max-w-2xl font-normal">
              Agenda online para estética, bronzeamento e unhas. Sua cliente escolhe o serviço e a profissional pelo link do Instagram, paga o sinal no Pix e o horário fica reservado.
            </p>

            {/* CTAs */}
            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-4 mb-8">
              <Button 
                size="lg" 
                onClick={() => navigate("/onboarding?planId=studio")} 
                className="btn-sheen h-14 sm:h-16 px-8 bg-[#111827] hover:bg-[#1F2937] text-white font-bold text-base sm:text-lg rounded-2xl shadow-xl shadow-[#111827]/15 hover-lift justify-center"
              >
                Testar 14 dias grátis <ArrowRight className="w-5 h-5 ml-2 text-[#E5A991]" />
              </Button>
              <a 
                href="#demonstracao"
                className="inline-flex items-center justify-center h-14 sm:h-16 px-6 rounded-2xl border border-[#E5E7EB] bg-white hover:bg-stone-50 text-[#111827] font-semibold text-base transition-all shadow-xs hover-lift gap-2"
              >
                <Play className="w-4 h-4 text-[#111827] fill-[#111827]" /> Ver como a cliente agenda
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
            <div className="w-full max-w-[390px] relative animate-float-gentle">
              
              {/* Badge Flutuante Superior */}
              <div className="absolute -top-4 -left-6 z-20 bg-white/95 border border-[#E5E7EB] rounded-2xl p-3 shadow-xl backdrop-blur-md hidden sm:flex items-center gap-3 animate-float-delay">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#111827]">Sinal no Pix, direto na sua conta</div>
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
                        <div className="text-[11px] text-emerald-100 flex items-center gap-1.5">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300"></span>
                          </span>
                          agendamento online ativo
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
            <span className="font-serif text-2xl sm:text-3xl font-extrabold text-emerald-700 tracking-tight">Menos faltas com o sinal</span>
            <span className="text-[#6B7280] text-xs sm:text-sm font-medium mt-1">
              Horário garantido pelo Pix antecipado
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
            <Sparkles className="w-3.5 h-3.5 text-[#C47F65]" /> Mais praticidade no seu dia a dia
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#111827] mb-5">
            Tudo o que seu espaço precisa para <span className="brand-text-gradient">atender com tranquilidade</span>
          </h2>
          <p className="text-[#4B5563] text-base sm:text-lg leading-relaxed">
            Menos tempo respondendo mensagens repetitivas e calculando comissões no papel. Mais foco em atender bem suas clientes.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CORE_BENEFITS.map((item, idx) => (
            <div 
              key={idx}
              className={`rounded-3xl p-7 bg-white/95 backdrop-blur-xs border ${item.border} relative overflow-hidden flex flex-col justify-between hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 group shadow-xs hover:shadow-xl`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#E5A991]/10 to-transparent rounded-bl-full pointer-events-none group-hover:from-[#E5A991]/25 transition-all duration-500" />
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB] text-[#111827] flex items-center justify-center font-bold mb-5 shadow-xs group-hover:scale-110 group-hover:rotate-3 group-hover:bg-[#111827] group-hover:text-white transition-all duration-300">
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
              Simples para o seu negócio. <span className="brand-text-gradient">Prático para a cliente.</span>
            </h2>
            <p className="text-[#4B5563] text-base sm:text-lg">
              Em menos de 1 minuto sua cliente escolhe o procedimento, agenda e paga o sinal.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Link na bio",
                desc: "Ela abre o link da sua bio."
              },
              {
                step: "02",
                title: "Serviço e profissional",
                desc: "Escolhe o serviço, a profissional e o horário."
              },
              {
                step: "03",
                title: "Sinal no Pix",
                desc: "Paga o sinal no Pix."
              },
              {
                step: "04",
                title: "Conferência e confirmação",
                desc: "Você confere no banco e confirma."
              }
            ].map((st, i) => (
              <div key={i} className="bg-white/95 rounded-3xl p-6 border border-[#E5E7EB] hover:border-[#E5A991] hover:-translate-y-1.5 transition-all duration-300 shadow-xs hover:shadow-xl group">
                <div className="w-10 h-10 rounded-xl bg-[#111827] text-[#E5A991] flex items-center justify-center font-bold text-sm mb-4 shadow-xs group-hover:scale-110 group-hover:bg-[#E5A991] group-hover:text-[#111827] transition-all duration-300">
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
            <DollarSign className="w-3.5 h-3.5" /> Retorno do Investimento
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#111827] mb-5">
            Quanto as faltas custam pra você?
          </h2>
          <p className="text-[#4B5563] text-base sm:text-lg leading-relaxed">
            Veja quanto seu espaço deixa de perder exigindo o sinal prévio no Pix.
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
                  {formatCurrency(ticketMedio)}
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
                <label className="text-sm font-semibold text-[#111827]">Faltas por Semana:</label>
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
              Estimativa: considera que o sinal reduz as faltas em 40%. Seu resultado pode variar.
            </div>

          </div>

          {/* Resultado Empresarial */}
          <div className="lg:col-span-5 bg-[#111827] rounded-3xl p-6 sm:p-8 border border-[#E5A991]/40 shadow-2xl flex flex-col justify-between text-white">
            
            <div>
              <Badge className="bg-[#E5A991]/20 text-[#E5A991] border-[#E5A991]/40 font-bold mb-4">
                Proteção Financeira Mensal
              </Badge>

              <div className="space-y-4 mb-6">
                <div>
                  <div className="text-xs text-stone-400">Prejuízo mensal estimado em faltas:</div>
                  <div className="text-xl font-bold text-rose-300 line-through">
                    - {formatCurrency(prejuizoAtual)} / mês
                  </div>
                </div>

                <div>
                  <div className="text-xs text-stone-400">Faturamento protegido com o sinal no Pix:</div>
                  <div className="text-3xl font-extrabold text-emerald-400 font-serif">
                    + {formatCurrency(faturamentoSalvo)}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-stone-800 flex justify-between items-center text-xs">
                  <span className="text-stone-400">Investimento Plano Studio:</span>
                  <span className="font-bold text-white">{formatCurrency(custoPlanoStudio)} / mês</span>
                </div>
              </div>

              <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-2xl p-4 text-center mb-6">
                <div className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                  Lucro Líquido Preservado no seu Bolso:
                </div>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  {lucroLiquidoExtra >= 0 ? `+ ${formatCurrency(lucroLiquidoExtra)}` : formatCurrency(lucroLiquidoExtra)} / mês
                </div>
              </div>
            </div>

            <button 
              onClick={() => navigate("/onboarding?planId=studio")} 
              className="w-full h-13 bg-[#E5A991] hover:bg-[#D89981] text-[#111827] font-extrabold text-base rounded-xl shadow-lg hover-lift justify-center flex items-center cursor-pointer transition-all"
            >
              Testar 14 dias grátis &rarr;
            </button>

          </div>

        </div>
      </section>

      {/* Planos Oficiais BelezaPura */}
      <PlanCatalog />

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
            🚀 14 dias grátis, sem cartão
          </Badge>

          <h2 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-[#111827] mb-6 leading-tight">
            Comece hoje.
          </h2>

          <p className="text-[#4B5563] text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Cadastre seus serviços e sua chave Pix em uns 3 minutos e mande o link pras clientes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Button 
              size="lg" 
              onClick={() => navigate("/onboarding?planId=studio")} 
              className="h-16 px-10 bg-[#111827] hover:bg-[#1F2937] text-white font-extrabold text-lg rounded-2xl shadow-xl shadow-[#111827]/25 hover:scale-105 transition-transform"
            >
              Testar 14 dias grátis <ArrowRight className="w-5 h-5 ml-2 text-[#E5A991]" />
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
              <span className="text-xs text-[#E5A991] font-medium">Estética & Unhas</span>
            </div>
            <p className="text-xs text-stone-400 max-w-sm mt-1">
              Plataforma de agendamento para estética, bronzeamento e nail designers.
            </p>
            <p className="text-xs text-stone-400 mt-2">
              Desenvolvido por{" "}
              <a 
                href="https://geevheith-site.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#E5A991] hover:underline font-medium"
              >
                Geevheith Software Solutions
              </a>
              {" "}• Nosso contato:{" "}
              <a 
                href="https://geevheith-site.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-stone-300 hover:text-white underline transition-colors"
              >
                geevheith-site.vercel.app
              </a>
            </p>
            <p className="text-xs text-stone-500 mt-2">
              © 2026 BelezaPura. Todos os direitos reservados.
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

      {/* Notificação Flutuante de Atividade em Tempo Real (Social Proof) */}
      {showLiveNotif && (
        <div className="fixed bottom-6 left-6 z-40 hidden sm:flex items-center gap-3 bg-white/95 border border-[#E5E7EB] p-3.5 rounded-2xl shadow-2xl backdrop-blur-md animate-fade-up max-w-sm transition-all duration-300 hover:scale-[1.02]">
          <div className="w-10 h-10 rounded-xl bg-[#E5A991]/20 text-[#9C5A42] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-[#C47F65]" />
          </div>
          <div className="flex-1 pr-2">
            <div className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
              <span>{LIVE_NOTIFICATIONS[liveNotifIndex].name}</span>
              <span className="text-[10px] font-normal text-[#6B7280]">
                • {LIVE_NOTIFICATIONS[liveNotifIndex].time}
              </span>
            </div>
            <div className="text-[11px] text-[#4B5563] truncate">
              {LIVE_NOTIFICATIONS[liveNotifIndex].action}
            </div>
            <div className="text-[10px] font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
              <Check className="w-3 h-3 stroke-[3]" />
              {LIVE_NOTIFICATIONS[liveNotifIndex].value}
            </div>
          </div>
          <button 
            onClick={() => setShowLiveNotif(false)}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-md cursor-pointer"
            aria-label="Fechar notificação"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
}
