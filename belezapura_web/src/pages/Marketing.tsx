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

// Exemplos fictícios de uso, identificados como demonstração na interface
const DEMO_NOTIFICATIONS = [
  { name: "Mariana S.", action: "agendou Alongamento em Gel com Rafaela", time: "Exemplo fictício", value: "Sinal de R$ 36 no Pix" },
  { name: "Camila R.", action: "garantiu horário de Drenagem", time: "Exemplo fictício", value: "Sinal de R$ 30 no Pix" },
  { name: "Juliana M.", action: "marcou Bronzeamento com Fita", time: "Exemplo fictício", value: "Sinal de R$ 24 no Pix" },
  { name: "Studio Bella", action: "liberou 4 horários no Instagram", time: "Exemplo fictício", value: "Link da bio ativo" }
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
    title: "Faltou? Quem paga não é você.",
    subtitle: "Compromisso com o sinal",
    desc: "Uma progressiva ou um alongamento ocupam horas de cadeira. Com o sinal no Pix, a cliente só segura o horário se realmente pretende vir.",
    highlight: "Sinal no Pix direto na sua conta",
    border: "border-[#EFE4E6] hover:border-[#D98A98]"
  },
  {
    icon: Smartphone,
    title: "Link na bio que agenda de madrugada.",
    subtitle: "Agenda 24 horas",
    desc: "A cliente que pensou no assunto às 23h30 marca na hora, sem esperar você responder o direct.",
    highlight: "Agendamento direto sem esperar direct",
    border: "border-[#EFE4E6] hover:border-[#D98A98]"
  },
  {
    icon: Users,
    title: "Comissão sem caderninho.",
    subtitle: "Controle da equipe",
    desc: "No fim do mês você vê quanto cada profissional produziu e uma estimativa da comissão.",
    highlight: "Estimativa sobre serviços concluídos",
    border: "border-[#EFE4E6] hover:border-[#D98A98]"
  },
  {
    icon: MessageSquare,
    title: "Estoque que avisa.",
    subtitle: "Controle de materiais",
    desc: "Esmalte, gel, creme, óleo de bronzeamento: cadastre e veja o que está abaixo do mínimo.",
    highlight: "Alerta de itens abaixo do mínimo",
    border: "border-[#EFE4E6] hover:border-[#D98A98]"
  },
  {
    icon: Calendar,
    title: "Agenda que respeita o tempo de cada serviço.",
    subtitle: "Horários sem atropelo",
    desc: "Alongamento leva 3h, manutenção 1h30. O sistema considera a duração, o expediente e os dias bloqueados.",
    highlight: "Duração real e dias bloqueados",
    border: "border-[#EFE4E6] hover:border-[#D98A98]"
  }
];

// FAQs Oficiais BelezaPura
function getFaqItems(trialDays: number) {
  return [
    {
      q: `Como funciona a demonstração gratuita de ${trialDays} dias?`,
      a: `Você tem ${trialDays} dias para testar os recursos disponíveis no período de avaliação com suas clientes. Você cadastra seus serviços, equipe e chave Pix. Sem cartão de crédito e sem taxas de adesão.`
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
    q: "Como funciona a automação de WhatsApp e lembretes?",
    a: "No plano Elite (e sob demanda no Studio), a automação de WhatsApp e o bot dependem de ativação técnica prévia e estão sujeitos à franquia mensal contratada. Em todos os planos, você pode enviar lembretes e comprovantes com 1 clique diretamente pelo WhatsApp Web ou celular, sem custo adicional."
  },
  {
    q: "Já tenho clientes anotados em planilhas ou cadernos. Como migrar?",
    a: "Cadastre seus clientes, serviços e profissionais diretamente pelo painel em poucos minutos. A importação automática de planilhas ainda não está disponível."
  }
  ];
}

export default function Marketing() {
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [trialDays, setTrialDays] = useState<number>(14);
  const faqItems = getFaqItems(trialDays);
  
  // Ciclo de cobrança (Mensal vs Anual)
  
  // Demonstrador interativo
  const [activeScenario, setActiveScenario] = useState<BookingScenario>(BOOKING_SCENARIOS[0]);
  const [copiedPix, setCopiedPix] = useState(false);
  const [demoTab, setDemoTab] = useState<"agenda" | "pix" | "equipe">("agenda");

  // Rotação automática suave dos cenários do celular no Hero
  useEffect(() => {
    const scenarioTimer = setInterval(() => {
      setActiveScenario(prev => {
        const idx = BOOKING_SCENARIOS.findIndex(s => s.id === prev.id);
        return BOOKING_SCENARIOS[(idx + 1) % BOOKING_SCENARIOS.length];
      });
    }, 6500);
    return () => clearInterval(scenarioTimer);
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
    <div className="min-h-full bg-[#FDFBF9] text-[#1F1A1C] font-sans selection:bg-rose-200/50 selection:text-[#6E2F3B] antialiased overflow-x-hidden relative">
      
      {/* Background dinâmico suave, malha de textura e orbes blush/champagne */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 mesh-grid opacity-35" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-b from-rose-200/35 via-pink-100/25 to-transparent blur-[135px] rounded-full animate-pulse-soft" />
        <div className="absolute top-[25%] -left-32 w-[550px] h-[550px] bg-gradient-to-tr from-rose-100/40 via-pink-100/30 to-transparent blur-[140px] rounded-full animate-float-slow" />
        <div className="absolute top-[60%] -right-32 w-[600px] h-[600px] bg-gradient-to-bl from-amber-50/40 via-rose-100/30 to-transparent blur-[140px] rounded-full animate-float-delay" />
      </div>

      {/* Top Banner Delicado Rose Blush */}
      <div className="relative z-50 bg-gradient-to-r from-[#FAF0F2] via-[#FDF6F7] to-[#FAF0F2] text-[#6E2F3B] border-b border-rose-200/60 py-2.5 px-4 text-center text-xs md:text-sm font-medium tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 text-[#C86D7D]" />
        <span>{trialDays} dias grátis, sem cartão. Você testa com suas clientes de verdade.</span>
        <button 
          onClick={() => navigate("/onboarding?planId=studio")}
          className="underline font-bold text-[#9F4356] hover:text-[#6E2F3B] cursor-pointer ml-1 hidden sm:inline"
        >
          Criar meu espaço &rarr;
        </button>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#FDFBF9]/85 backdrop-blur-xl border-b border-[#EFE4E6]">
        <div className="max-w-7xl mx-auto px-5 h-20 flex items-center justify-between">
          
          {/* Logo BelezaPura */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#D98A98] to-[#B55969] text-white flex items-center justify-center shadow-md shadow-rose-200/60 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-2xl font-bold tracking-tight text-[#1F1A1C]">BelezaPura</span>
                <span className="brand-badge text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Atelier</span>
              </div>
              <span className="text-[10px] text-[#8C7A7F] font-medium tracking-wider uppercase">Estética, Bronze & Unhas</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#5E5054]">
            <a href="#beneficios" className="hover:text-[#9F4356] transition-colors">Recursos</a>
            <a href="#demonstracao" className="hover:text-[#9F4356] transition-colors">Como Funciona</a>
            <a href="#calculadora" className="hover:text-[#9F4356] transition-colors">Simulador de Retorno</a>
            <a href="#planos" className="hover:text-[#9F4356] transition-colors">Planos & Preços</a>
            <a href="#faq" className="hover:text-[#9F4356] transition-colors">Dúvidas Frequentes</a>
          </nav>

          {/* Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/login")} 
              className="text-[#5E5054] hover:text-[#9F4356] hover:bg-rose-50/70 font-medium"
            >
              Entrar
            </Button>
            <Button 
              size="md" 
              onClick={() => navigate("/onboarding?planId=studio")} 
              className="bg-gradient-to-r from-[#C86D7D] to-[#B55969] hover:opacity-95 text-white border-0 font-bold shadow-md shadow-rose-300/40 hover-lift rounded-xl px-5"
            >
              Testar {trialDays} dias grátis <ArrowRight className="w-4 h-4 ml-1 text-rose-100" />
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button 
            className="lg:hidden p-2.5 rounded-xl bg-white border border-[#EFE4E6] text-[#1F1A1C] hover:bg-rose-50/50 cursor-pointer shadow-2xs" 
            onClick={() => setMobileMenu(v => !v)}
            aria-label="Menu"
          >
            {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenu && (
          <div className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-[#EFE4E6] px-6 py-6 flex flex-col gap-4 text-base font-medium animate-fade-up shadow-lg">
            <a href="#beneficios" onClick={() => setMobileMenu(false)} className="text-[#5E5054] hover:text-[#9F4356] py-1">Recursos</a>
            <a href="#demonstracao" onClick={() => setMobileMenu(false)} className="text-[#5E5054] hover:text-[#9F4356] py-1">Como Funciona</a>
            <a href="#calculadora" onClick={() => setMobileMenu(false)} className="text-[#5E5054] hover:text-[#9F4356] py-1">Simulador de Retorno</a>
            <a href="#planos" onClick={() => setMobileMenu(false)} className="text-[#5E5054] hover:text-[#9F4356] py-1">Planos & Preços</a>
            <a href="#faq" onClick={() => setMobileMenu(false)} className="text-[#5E5054] hover:text-[#9F4356] py-1">Dúvidas Frequentes</a>
            
            <div className="pt-4 border-t border-[#EFE4E6] flex flex-col gap-3">
              <Button 
                variant="outline" 
                className="w-full justify-center border-[#EFE4E6] text-[#1F1A1C] bg-white hover:bg-rose-50/50 font-semibold" 
                onClick={() => { setMobileMenu(false); navigate("/login"); }}
              >
                Acessar meu salão
              </Button>
              <Button 
                className="w-full justify-center bg-gradient-to-r from-[#C86D7D] to-[#B55969] text-white border-0 font-bold h-12 shadow-md shadow-rose-300/40" 
                onClick={() => { setMobileMenu(false); navigate("/onboarding?planId=studio"); }}
              >
                Testar {trialDays} dias grátis
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
            
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-rose-50/90 border border-rose-200/70 text-[#9F4356] text-xs md:text-sm font-semibold mb-6 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 beacon-dot" />
              <Sparkles className="w-4 h-4 text-[#C86D7D]" />
              <span>Seu espaço • Sua agenda 24h • Sinal direto no seu PIX</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-[#1F1A1C] leading-[1.06] mb-6">
              Cliente marcou,{" "}
              <span className="brand-text-gradient animate-text-shimmer">pagou o sinal</span>, veio.
            </h1>

            <p className="text-[#5E5054] text-lg sm:text-xl leading-relaxed mb-6 max-w-2xl font-normal">
              Transforme o link da sua bio e o seu Google Maps em uma recepção delicada e inteligente 24h. Sua cliente escolhe o procedimento, paga o sinal no Pix direto na sua conta e o horário fica reservado com elegância.
            </p>

            {/* Pílulas de Nichos com Efeito Hover Suave */}
            <div className="flex flex-wrap items-center gap-2 mb-8">
              {[
                "✨ Clínicas de Estética",
                "💅 Nail Designers & Esmalterias",
                "☀️ Studios de Bronzeamento",
                "💇‍♀️ Salões & Cílios",
                "💆‍♀️ Massoterapia & SPA"
              ].map((niche) => (
                <span
                  key={niche}
                  className="text-xs font-medium px-3.5 py-1.5 rounded-full bg-white/90 border border-[#EFE4E6] text-[#5E5054] shadow-2xs hover:border-[#D98A98] hover:text-[#9F4356] hover:bg-rose-50/40 hover:-translate-y-0.5 transition-all"
                >
                  {niche}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-4 mb-8">
              <Button 
                size="lg" 
                onClick={() => navigate("/onboarding?planId=studio")} 
                className="btn-sheen min-h-14 sm:min-h-16 py-3.5 px-6 sm:px-8 bg-gradient-to-r from-[#C86D7D] to-[#B55969] hover:opacity-95 text-white border-0 font-bold text-base sm:text-lg rounded-2xl shadow-xl shadow-rose-300/50 hover-lift justify-center"
              >
                Testar {trialDays} dias grátis <ArrowRight className="w-5 h-5 ml-2 text-rose-100" />
              </Button>
              <a 
                href="#demonstracao"
                className="inline-flex items-center justify-center min-h-14 sm:min-h-16 py-3.5 px-6 rounded-2xl border border-[#EFE4E6] bg-white/90 hover:bg-rose-50/50 hover:border-rose-200 text-[#1F1A1C] font-semibold text-base transition-all shadow-2xs hover-lift gap-2 text-center"
              >
                <Play className="w-4 h-4 text-[#C86D7D] fill-[#C86D7D]" /> Ver como a cliente agenda
              </a>
            </div>

            {/* Guarantees */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs sm:text-sm text-[#5E5054] font-medium">
              <span className="flex items-center gap-1.5 text-[#1F1A1C]">
                <Check className="w-4 h-4 text-[#C86D7D] stroke-[3]" /> {trialDays} dias sem custo
              </span>
              <span className="flex items-center gap-1.5 text-[#1F1A1C]">
                <Check className="w-4 h-4 text-[#C86D7D] stroke-[3]" /> Sem taxa de adesão
              </span>
              <span className="flex items-center gap-1.5 text-[#1F1A1C]">
                <Check className="w-4 h-4 text-[#C86D7D] stroke-[3]" /> Cancele quando quiser
              </span>
            </div>

          </div>

          {/* Hero Right Visual: Demonstrador do Agendamento BelezaPura */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end animate-fade-up">
            <div className="w-full max-w-[390px] relative animate-float-gentle">
              
              {/* Badge Flutuante Superior */}
              <div className="absolute -top-4 -left-6 z-20 bg-white/95 border border-rose-200/70 rounded-2xl p-3 shadow-xl shadow-rose-200/30 backdrop-blur-md hidden sm:flex items-center gap-3 animate-float-delay">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#C86D7D] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1F1A1C]">Sinal no Pix, direto na sua conta</div>
                  <div className="text-[10px] text-[#6E6266]">0% de taxa sobre os agendamentos</div>
                </div>
              </div>

              {/* Badge Flutuante Inferior Direito (Suave & Delicado) */}
              <div className="absolute -bottom-5 -right-5 z-20 bg-white/95 text-[#1F1A1C] border border-rose-200/80 rounded-2xl p-3.5 shadow-xl shadow-rose-200/40 backdrop-blur-md hidden sm:flex items-center gap-3 animate-float-slow">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1F1A1C]">+R$ 1.840 protegidos</div>
                  <div className="text-[10px] text-[#9F4356] font-medium">Agenda protegida contra faltas</div>
                </div>
              </div>

              {/* Moldura do Celular em Rose Champagne Suave */}
              <div className="rounded-[44px] p-3.5 bg-gradient-to-b from-white via-[#F9E8EC] to-[#EBCAD1] shadow-2xl shadow-rose-200/50 border-4 border-white">
                <div className="rounded-[36px] bg-[#FDF8F9] overflow-hidden border border-rose-100 flex flex-col h-[540px]">
                  
                  {/* Top Bar do Agendamento Delicada */}
                  <div className="bg-gradient-to-r from-[#C86D7D] to-[#D98A98] px-4 py-3.5 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-white/25 flex items-center justify-center text-white font-bold text-sm shadow-2xs">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-serif font-bold text-white flex items-center gap-1.5">
                          Studio BelezaPura
                        </div>
                        <div className="text-[11px] text-rose-50 flex items-center gap-1.5">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300"></span>
                          </span>
                          recepção online 24h
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mensagens e Confirmação */}
                  <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 text-xs font-normal bg-gradient-to-b from-[#FDF8F9] to-[#FAF0F2]/60">
                    
                    <div className="text-center my-1">
                      <span className="bg-white/90 text-[#8C7A7F] border border-rose-100 text-[10px] px-3 py-1 rounded-full shadow-2xs font-medium">
                        Simulação interativa de agendamento
                      </span>
                    </div>

                    {/* Mensagem da Cliente */}
                    <div className="flex justify-end">
                      <div className="max-w-[85%] bg-white text-[#1F1A1C] p-3.5 rounded-2xl rounded-tr-xs shadow-2xs border border-rose-100">
                        <p>{activeScenario.clientMessage}</p>
                        <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-[#8C7A7F]">
                          <span>14:02</span>
                          <CheckCheck className="w-3 h-3 text-[#C86D7D]" />
                        </div>
                      </div>
                    </div>

                    {/* Resposta do Salão */}
                    <div className="flex justify-start">
                      <div className="max-w-[90%] bg-[#FFF5F7] text-[#1F1A1C] p-3.5 rounded-2xl rounded-tl-xs shadow-2xs border border-rose-200/70 space-y-2.5">
                        <p className="leading-relaxed">{activeScenario.systemReply}</p>
                        
                        {/* Box do PIX */}
                        <div className="bg-white p-3 rounded-xl border border-rose-200/80 text-[11px] space-y-2 shadow-2xs">
                          <div className="flex items-center justify-between text-[#9F4356] font-bold">
                            <span>Sinal via Pix Copia e Cola</span>
                            <Badge variant="success" className="text-[9px] px-1.5 py-0 bg-rose-50 text-[#9F4356] border-rose-200">PIX Direto</Badge>
                          </div>
                          
                          <div className="font-mono text-[9px] text-[#6E6266] truncate bg-[#FDFBF9] p-1.5 rounded border border-[#EFE4E6]">
                            {activeScenario.pixCode}
                          </div>

                          <button 
                            onClick={handleCopyPix}
                            className="w-full py-2 px-2 rounded-lg bg-gradient-to-r from-[#C86D7D] to-[#D98A98] hover:opacity-95 text-white font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                          >
                            <Copy className="w-3 h-3" /> {copiedPix ? "Código copiado!" : "Testar cópia do Pix"}
                          </button>
                        </div>

                        <div className="text-[9px] text-[#8C7A7F] text-right">14:02</div>
                      </div>
                    </div>

                    {/* Confirmação pós-pagamento */}
                    <div className="bg-emerald-50/80 border border-emerald-200/70 rounded-xl p-2.5 text-center shadow-2xs">
                      <span className="text-[11px] font-semibold text-emerald-800">
                        ✨ Horário reservado com {activeScenario.professional}
                      </span>
                    </div>

                  </div>

                  {/* Seletor de Cenários */}
                  <div className="p-2.5 bg-white border-t border-rose-100 flex items-center gap-1.5 overflow-x-auto">
                    {BOOKING_SCENARIOS.map(sc => (
                      <button
                        key={sc.id}
                        onClick={() => setActiveScenario(sc)}
                        className={`text-[10px] font-semibold px-3 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                          activeScenario.id === sc.id
                            ? "bg-gradient-to-r from-[#C86D7D] to-[#D98A98] text-white shadow-2xs"
                            : "bg-[#FAF3F4] text-[#6E6266] hover:bg-rose-100/60"
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

      {/* Faixa Dinâmica Marquee Delicada em Rose Blush */}
      <div className="relative z-20 bg-gradient-to-r from-[#FAF0F2] via-[#FFF7F8] to-[#FAF0F2] py-3.5 border-t border-rose-200/60 overflow-hidden">
        <div className="flex items-center gap-10 whitespace-nowrap animate-marquee text-xs font-semibold tracking-wider uppercase">
          {[
            "✦ Agendamento Online 24h na Bio",
            "✦ Sinal Anti-Furo no PIX (0% de taxa)",
            "✦ Link Direto no Google Maps",
            "✦ Controle de Comissões da Equipe",
            "✦ Alerta de Estoque Mínimo",
            "✦ Mural de Avaliações 5 Estrelas",
            "✦ Agendamento Online 24h na Bio",
            "✦ Sinal Anti-Furo no PIX (0% de taxa)",
            "✦ Link Direto no Google Maps",
            "✦ Controle de Comissões da Equipe",
            "✦ Alerta de Estoque Mínimo",
            "✦ Mural de Avaliações 5 Estrelas",
          ].map((item, idx) => (
            <span key={idx} className="inline-flex items-center gap-3 text-[#9F4356]">
              <span>{item}</span>
            </span>
          ))}
        </div>
      </div>

      <section className="relative z-20 border-y border-[#EFE4E6] bg-white/90 backdrop-blur-sm py-10 shadow-2xs">
        <div className="max-w-7xl mx-auto px-5 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          
          <div className="flex flex-col items-center">
            <span className="font-serif text-3xl sm:text-4xl font-extrabold text-[#1F1A1C] tracking-tight">100% Direto</span>
            <span className="text-[#6E6266] text-xs sm:text-sm font-medium mt-1">
              O PIX cai na sua conta sem retenção
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="font-serif text-3xl sm:text-4xl font-extrabold text-[#C86D7D] tracking-tight">24h / 7 dias</span>
            <span className="text-[#6E6266] text-xs sm:text-sm font-medium mt-1">
              Recepção online ativa no link da bio
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="font-serif text-2xl sm:text-3xl font-extrabold text-emerald-700 tracking-tight">Zero Furos</span>
            <span className="text-[#6E6266] text-xs sm:text-sm font-medium mt-1">
              Horário garantido pelo Pix antecipado
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="font-serif text-3xl sm:text-4xl font-extrabold text-[#9F4356] tracking-tight">{trialDays} Dias</span>
            <span className="text-[#6E6266] text-xs sm:text-sm font-medium mt-1">
              Demonstração gratuita sem burocracia
            </span>
          </div>

        </div>
      </section>

      {/* Seção de Recursos Proprietários */}
      <section id="beneficios" className="relative z-10 py-24 max-w-7xl mx-auto px-5">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200/70 text-[#9F4356] text-xs font-semibold mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C86D7D]" /> Mais leveza no seu dia a dia
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#1F1A1C] mb-5">
            Tudo o que seu espaço precisa para <span className="brand-text-gradient">atender com tranquilidade</span>
          </h2>
          <p className="text-[#5E5054] text-base sm:text-lg leading-relaxed">
            Menos tempo respondendo mensagens repetitivas e calculando comissões no papel. Mais foco em encantar suas clientes.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CORE_BENEFITS.map((item, idx) => (
            <div 
              key={idx}
              className={`card-spotlight rounded-3xl p-7 bg-white/95 backdrop-blur-xs border ${item.border} relative overflow-hidden flex flex-col justify-between group shadow-2xs`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-rose-100/50 to-transparent rounded-bl-full pointer-events-none group-hover:from-rose-200/60 transition-all duration-500" />
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#FAF3F4] border border-rose-200/60 text-[#C86D7D] flex items-center justify-center font-bold mb-5 shadow-2xs group-hover:scale-110 group-hover:rotate-3 group-hover:bg-gradient-to-br group-hover:from-[#C86D7D] group-hover:to-[#D98A98] group-hover:text-white transition-all duration-300">
                  <item.icon className="w-6 h-6" />
                </div>

                <div className="text-xs font-semibold text-[#C86D7D] uppercase tracking-wider mb-1">
                  {item.subtitle}
                </div>

                <h3 className="font-serif font-bold text-[#1F1A1C] text-xl mb-3 leading-snug">
                  {item.title}
                </h3>

                <p className="text-[#5E5054] text-sm leading-relaxed mb-6">
                  {item.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-[#EFE4E6] text-xs font-semibold text-[#9F4356] flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#C86D7D] stroke-[3]" /> {item.highlight}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Demonstração: Como Funciona o Fluxo */}
      <section id="demonstracao" className="relative z-10 py-24 bg-gradient-to-b from-[#FAF3F4]/70 via-[#FDF8F9] to-[#FDFBF9] border-y border-[#EFE4E6]">
        <div className="max-w-7xl mx-auto px-5">
          
          <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-up">
            <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#1F1A1C] mb-5">
              Simples para o seu negócio. <span className="brand-text-gradient">Delicado para a cliente.</span>
            </h2>
            <p className="text-[#5E5054] text-base sm:text-lg">
              Sua cliente escolhe o procedimento e reserva pelo link. Você confere o sinal no banco e confirma no painel.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
            {[
              {
                step: "01",
                title: "Link na bio & Google",
                desc: "Sua cliente toca no link exclusivo do seu Instagram ou botão Agendar do Google Maps."
              },
              {
                step: "02",
                title: "Serviço e profissional",
                desc: "Escolhe o procedimento, a especialista disponível e o horário livre em tempo real."
              },
              {
                step: "03",
                title: "Sinal no Pix",
                desc: "Copia o código Pix do sinal configurado por você e paga direto para a sua conta."
              },
              {
                step: "04",
                title: "Agenda confirmada",
                desc: "Você confere o Pix no banco, confirma com 1 clique e o painel já calcula caixa e comissão."
              }
            ].map((st, i) => (
              <div key={i} className="card-spotlight bg-white/95 rounded-3xl p-6 border border-[#EFE4E6] hover:border-[#D98A98] group">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200/70 text-[#C86D7D] flex items-center justify-center font-bold text-sm mb-4 shadow-2xs group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-[#C86D7D] group-hover:to-[#D98A98] group-hover:text-white transition-all duration-300">
                  {st.step}
                </div>
                <h3 className="font-serif font-bold text-[#1F1A1C] text-lg mb-2">{st.title}</h3>
                <p className="text-[#5E5054] text-sm leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>

          {/* Vitrine Interativa Suave & Luminosa do Painel do Salão */}
          <div className="bg-white/95 backdrop-blur-md text-[#1F1A1C] rounded-[2rem] p-6 sm:p-10 border border-rose-200/70 shadow-xl shadow-rose-100/60 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-rose-100/60 blur-[100px] pointer-events-none animate-aurora" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-[#EFE4E6]">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#C86D7D] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Visão por dentro do sistema
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1A1C] mt-1">
                  Veja o que você controla no seu painel
                </h3>
              </div>

              <div className="flex flex-wrap gap-2 bg-[#FAF3F4] p-1.5 rounded-2xl border border-rose-200/50">
                {[
                  { id: "agenda" as const, label: "📅 Agenda & Sinal PIX" },
                  { id: "pix" as const, label: "🌐 Sua Landing Page Exclusiva" },
                  { id: "equipe" as const, label: "💸 Comissões & Financeiro" },
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setDemoTab(t.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      demoTab === t.id
                        ? "bg-gradient-to-r from-[#C86D7D] to-[#D98A98] text-white shadow-sm"
                        : "text-[#6E6266] hover:text-[#9F4356]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {demoTab === "agenda" && (
              <div className="relative z-10 grid md:grid-cols-3 gap-4 pt-8 animate-fade-in">
                {[
                  { time: "09:00 • 12:00", client: "Mariana Costa", service: "Alongamento Fibra de Vidro", pro: "Rafaela", price: "R$ 180,00", deposit: "Sinal R$ 36,00 pago", status: "Confirmado", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                  { time: "14:00 • 15:30", client: "Fernanda Lima", service: "Bronzeamento Natural com Fita", pro: "Juliana", price: "R$ 140,00", deposit: "Sinal R$ 28,00 pago", status: "Confirmado", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                  { time: "16:00 • 17:00", client: "Beatriz Souza", service: "Limpeza de Pele Profunda", pro: "Camila", price: "R$ 150,00", deposit: "Aguardando conferência", status: "Pré-reserva", color: "bg-amber-50 text-amber-700 border-amber-200" },
                ].map((card, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-[#FDFBF9] border border-[#EFE4E6] hover:border-rose-300 transition-all space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-[#8C7A7F]">{card.time}</span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${card.color}`}>
                        {card.status}
                      </span>
                    </div>
                    <div>
                      <div className="font-serif font-bold text-[#1F1A1C] text-base">{card.client}</div>
                      <div className="text-xs text-[#6E6266] mt-0.5">{card.service}</div>
                    </div>
                    <div className="pt-3 border-t border-[#EFE4E6] flex items-center justify-between text-xs">
                      <span className="text-[#6E6266]">Profissional: <strong className="text-[#1F1A1C]">{card.pro}</strong></span>
                      <span className="font-bold text-[#9F4356]">{card.price}</span>
                    </div>
                    <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> {card.deposit}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {demoTab === "pix" && (
              <div className="relative z-10 grid md:grid-cols-3 gap-4 pt-8 animate-fade-in">
                <div className="p-5 rounded-2xl bg-[#FDFBF9] border border-[#EFE4E6] space-y-2 shadow-2xs">
                  <div className="text-xs font-bold text-[#C86D7D] uppercase">1. Sua Marca e Cores</div>
                  <div className="font-serif font-bold text-[#1F1A1C] text-base">Página com a identidade do seu espaço</div>
                  <p className="text-xs text-[#6E6266] leading-relaxed">
                    Foto de capa, logo, galeria de transformações com zoom, mural de avaliações 5 estrelas e botão direto para o seu WhatsApp e Google Maps.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-[#FDFBF9] border border-[#EFE4E6] space-y-2 shadow-2xs">
                  <div className="text-xs font-bold text-[#C86D7D] uppercase">2. Horários Inteligentes</div>
                  <div className="font-serif font-bold text-[#1F1A1C] text-base">Zero choque de agenda</div>
                  <p className="text-xs text-[#6E6266] leading-relaxed">
                    O sistema calcula sozinho a duração de cada procedimento e bloqueia o intervalo da profissional escolhida em tempo real.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-[#FDFBF9] border border-[#EFE4E6] space-y-2 shadow-2xs">
                  <div className="text-xs font-bold text-[#C86D7D] uppercase">3. Regra de Sinal Flexível</div>
                  <div className="font-serif font-bold text-[#1F1A1C] text-base">Você escolhe como cobrar</div>
                  <p className="text-xs text-[#6E6266] leading-relaxed">
                    Defina sinal obrigatório (ex: 20% ou R$ 30 fixos), opcional ou desativado. O código Pix Copia e Cola é gerado na hora para a cliente.
                  </p>
                </div>
              </div>
            )}

            {demoTab === "equipe" && (
              <div className="relative z-10 grid md:grid-cols-3 gap-4 pt-8 animate-fade-in">
                {[
                  { name: "Rafaela (Nail Designer)", services: "28 atendimentos concluídos", total: "R$ 4.760,00 produzidos", comm: "R$ 1.904,00 (40% comissão)" },
                  { name: "Juliana (Bronze & Corpo)", services: "34 atendimentos concluídos", total: "R$ 4.420,00 produzidos", comm: "R$ 1.768,00 (40% comissão)" },
                  { name: "Camila (Estética Facial)", services: "22 atendimentos concluídos", total: "R$ 3.520,00 produzidos", comm: "R$ 1.408,00 (40% comissão)" },
                ].map((pro, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-[#FDFBF9] border border-[#EFE4E6] space-y-2.5 shadow-2xs">
                    <div className="font-serif font-bold text-[#1F1A1C] text-base">{pro.name}</div>
                    <div className="text-xs text-[#6E6266]">{pro.services}</div>
                    <div className="text-sm font-semibold text-[#1F1A1C]">{pro.total}</div>
                    <div className="pt-2 border-t border-[#EFE4E6] text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> {pro.comm}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Calculadora de Retorno Real do BelezaPura */}
      <section id="calculadora" className="relative z-10 py-24 max-w-7xl mx-auto px-5">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200/70 text-[#9F4356] text-xs font-semibold mb-4 shadow-2xs">
            <DollarSign className="w-3.5 h-3.5 text-[#C86D7D]" /> Simulador de Retorno
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#1F1A1C] mb-5">
            Quanto as faltas custam para o seu espaço?
          </h2>
          <p className="text-[#5E5054] text-base sm:text-lg leading-relaxed">
            Simule quanto você recupera todos os meses protegendo sua agenda com o sinal no Pix.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
          
          {/* Controles da Calculadora */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#EFE4E6] shadow-xs space-y-6">
            
            {/* Profissionais */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-[#1F1A1C]">Profissionais na Equipe:</label>
                <span className="font-bold text-[#9F4356] bg-rose-50 px-3 py-1 rounded-lg text-sm border border-rose-200/70">
                  {numStaff} {numStaff === 1 ? "profissional" : "profissionais"}
                </span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="12" 
                value={numStaff}
                onChange={(e) => setNumStaff(Number(e.target.value))}
                className="w-full accent-[#C86D7D] cursor-pointer"
              />
            </div>

            {/* Ticket Médio */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-[#1F1A1C]">Ticket Médio do Atendimento:</label>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg text-sm border border-emerald-200">
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
                className="w-full accent-[#C86D7D] cursor-pointer"
              />
            </div>

            {/* Faltas semanais */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-[#1F1A1C]">Faltas por Semana:</label>
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
                className="w-full accent-[#C86D7D] cursor-pointer"
              />
            </div>

            <div className="pt-3 border-t border-[#EFE4E6] text-xs text-[#6E6266] leading-relaxed">
              Estimativa: considera que o sinal reduz as faltas em 40%. Seu resultado pode variar.
            </div>

          </div>

          {/* Resultado Empresarial Suave & Elegante */}
          <div className="lg:col-span-5 bg-gradient-to-b from-white via-[#FFF8F9] to-[#FCEEF1] rounded-3xl p-6 sm:p-8 border-2 border-rose-200/80 shadow-xl shadow-rose-100/70 flex flex-col justify-between text-[#1F1A1C]">
            
            <div>
              <Badge className="bg-rose-100/80 text-[#9F4356] border-rose-200 font-bold mb-4">
                Proteção Financeira Mensal
              </Badge>

              <div className="space-y-4 mb-6">
                <div>
                  <div className="text-xs text-[#6E6266]">Perda mensal estimada com faltas:</div>
                  <div className="text-xl font-bold text-rose-500 line-through">
                    - {formatCurrency(prejuizoAtual)} / mês
                  </div>
                </div>

                <div>
                  <div className="text-xs text-[#6E6266]">Faturamento protegido com o sinal no Pix:</div>
                  <div className="text-3xl font-extrabold text-emerald-700 font-serif">
                    + {formatCurrency(faturamentoSalvo)}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/90 border border-rose-200/60 flex justify-between items-center text-xs">
                  <span className="text-[#6E6266]">Investimento Plano Studio:</span>
                  <span className="font-bold text-[#1F1A1C]">{formatCurrency(custoPlanoStudio)} / mês</span>
                </div>
              </div>

              <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 text-center mb-6">
                <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                  Ganho líquido estimado:
                </div>
                <div className="text-2xl font-black text-emerald-700 mt-1">
                  {lucroLiquidoExtra >= 0 ? `+ ${formatCurrency(lucroLiquidoExtra)}` : formatCurrency(lucroLiquidoExtra)} / mês
                </div>
              </div>
            </div>

            <button 
              onClick={() => navigate("/onboarding?planId=studio")} 
              className="btn-sheen w-full min-h-12 py-3.5 px-4 bg-gradient-to-r from-[#C86D7D] to-[#B55969] hover:opacity-95 text-white font-bold text-base rounded-xl shadow-md shadow-rose-300/50 hover-lift justify-center flex items-center cursor-pointer transition-all"
            >
              Testar {trialDays} dias grátis &rarr;
            </button>

          </div>

        </div>
      </section>

      {/* Planos Oficiais BelezaPura */}
      <PlanCatalog onTrialDaysLoaded={setTrialDays} />

      {/* FAQ */}
      <section id="faq" className="relative z-10 py-24 max-w-4xl mx-auto px-5">
        <div className="text-center mb-14 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200/70 text-[#9F4356] text-xs font-semibold mb-4 shadow-2xs">
            <HelpCircle className="w-3.5 h-3.5 text-[#C86D7D]" /> Dúvidas Frequentes
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#1F1A1C] mb-4">
            Perguntas & Respostas
          </h2>
          <p className="text-[#5E5054] text-base sm:text-lg">
            Tudo o que você precisa saber sobre a experiência BelezaPura.
          </p>
        </div>

        <div className="space-y-3.5">
          {faqItems.map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <div 
                key={index}
                className="bg-white border border-[#EFE4E6] hover:border-rose-200 rounded-2xl overflow-hidden transition-all duration-200 shadow-2xs"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 text-[#1F1A1C] font-bold text-base sm:text-lg cursor-pointer hover:text-[#9F4356] transition-colors"
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`w-5 h-5 text-[#8C7A7F] shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#C86D7D]" : ""}`} />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 text-[#5E5054] text-sm sm:text-base leading-relaxed border-t border-[#EFE4E6] pt-4 animate-fade-up">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Final Suave */}
      <section className="relative z-10 py-24 overflow-hidden border-t border-[#EFE4E6] bg-gradient-to-b from-[#FDFBF9] via-[#FFF6F8] to-[#FAF0F2]">
        <div className="max-w-4xl mx-auto px-5 text-center relative z-10">
          <Badge className="bg-rose-100/80 text-[#9F4356] border border-rose-200 font-bold mb-6 text-sm py-1.5 px-4">
            ✨ {trialDays} dias grátis, sem cartão
          </Badge>

          <h2 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-[#1F1A1C] mb-6 leading-tight">
            Comece hoje com leveza.
          </h2>

          <p className="text-[#5E5054] text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Cadastre seus serviços e sua chave Pix em 3 minutos e compartilhe seu novo link exclusivo com as clientes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Button 
              size="lg" 
              onClick={() => navigate("/onboarding?planId=studio")} 
              className="btn-sheen h-16 px-10 bg-gradient-to-r from-[#C86D7D] to-[#B55969] hover:opacity-95 text-white border-0 font-extrabold text-lg rounded-2xl shadow-xl shadow-rose-300/50 hover:scale-105 transition-transform"
            >
              Testar {trialDays} dias grátis <ArrowRight className="w-5 h-5 ml-2 text-rose-100" />
            </Button>
          </div>

          <div className="text-xs text-[#6E6266] flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C86D7D]" />
            <span>Configuração simples em 3 minutos • Sem taxas de cancelamento</span>
          </div>
        </div>
      </section>

      {/* Footer Suave & Elegante */}
      <footer className="relative z-10 border-t border-[#EFE4E6] bg-[#FAF3F4] py-14 text-[#6E6266] text-sm">
        <div className="max-w-7xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#D98A98] to-[#B55969] flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-serif text-xl font-bold text-[#1F1A1C] tracking-tight">BelezaPura</span>
              <span className="text-xs text-[#9F4356] font-semibold">Estética & Unhas</span>
            </div>
            <p className="text-xs text-[#6E6266] max-w-sm mt-1">
              Plataforma de agendamento para estética, bronzeamento e nail designers.
            </p>
            <p className="text-xs text-[#6E6266] mt-2">
              Desenvolvido por{" "}
              <a 
                href="https://geevheith-site.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#9F4356] hover:underline font-semibold"
              >
                Geevheith Software Solutions
              </a>
              {" "}• Nosso contato:{" "}
              <a 
                href="https://geevheith-site.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#5E5054] hover:text-[#9F4356] underline transition-colors"
              >
                geevheith-site.vercel.app
              </a>
            </p>
            <p className="text-xs text-[#8C7A7F] mt-2">
              © 2026 BelezaPura. Todos os direitos reservados.
            </p>
          </div>

          {/* Footer Links */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-6 text-sm font-medium text-[#5E5054]">
            <button 
              onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); navigate("/termos"); }}
              className="hover:text-[#9F4356] transition-colors cursor-pointer"
            >
              Termos de Uso
            </button>
            <button 
              onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); navigate("/privacidade"); }}
              className="hover:text-[#9F4356] transition-colors cursor-pointer"
            >
              Privacidade
            </button>
            <button 
              onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); navigate("/contato"); }}
              className="hover:text-[#9F4356] transition-colors cursor-pointer"
            >
              Fale Conosco
            </button>
            <button 
              onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); navigate("/login"); }}
              className="hover:text-[#9F4356] transition-colors cursor-pointer"
            >
              Login Salão
            </button>
            <button 
              onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); navigate("/login-admin"); }}
              className="hover:text-[#9F4356] transition-colors cursor-pointer text-[#8C7A7F]"
            >
              Portal Admin
            </button>
          </div>

        </div>
      </footer>

    </div>
  );
}
