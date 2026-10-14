import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Calendar, CreditCard, BarChart3, Users, Store, Check, ArrowRight, Menu, X, ChevronRight, ShieldCheck, Smartphone, Zap, Clock, TrendingUp, HelpCircle } from "lucide-react";
import { Button, Badge } from "@/components/ui";

const HERO_IMG = "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1400&h=700&fit=crop&auto=format";
const BOOKING_IMG = "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=400&fit=crop&auto=format";
const PIX_IMG = "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop&auto=format";
const TEAM_IMG = "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600&h=400&fit=crop&auto=format";

const features = [
  { 
    icon: ShieldCheck, 
    title: "Sinal Inteligente com PIX Automático", 
    desc: "Compromisso real das suas clientes. O horário só é reservado com a confirmação do sinal creditado diretamente na sua chave bancária. Você elimina de vez as faltas e mantém o fluxo de caixa sempre protegido.", 
    img: PIX_IMG 
  },
  { 
    icon: Smartphone, 
    title: "Vitrine Digital & Agendamento VIP 24h", 
    desc: "Sua página exclusiva para a bio do Instagram. A cliente escolhe os procedimentos desejados, seleciona seu profissional favorito e fecha o horário em segundos, mesmo de madrugada.", 
    img: BOOKING_IMG 
  },
  { 
    icon: BarChart3, 
    title: "Gestão Estratégica & Repasse de Comissões", 
    desc: "Chega de perder noites com calculadoras. O GeevheitHair calcula o rateio exato da sua equipe, emite relatórios de lucro líquido e entrega clareza total sobre o crescimento do seu negócio.", 
    img: TEAM_IMG 
  },
];

const steps = [
  { n: "01", title: "Configure seu Espaço", desc: "Personalize o nome do seu salão, identidade visual, horários de funcionamento e dados de contato em instantes." },
  { n: "02", title: "Monte seu Catálogo", desc: "Insira seus tratamentos, tempos de procedimento, valores e vincule os especialistas responsáveis." },
  { n: "03", title: "Conecte sua Chave PIX", desc: "Defina o percentual de sinal e receba os pagamentos direto na conta do seu salão, sem intermediários nem cobrança de taxas." },
  { n: "04", title: "Divulgue seu Link Exclusivo", desc: "Adicione seu link de agendamento no Instagram, WhatsApp e veja sua recepção digital trabalhar por você 24h por dia." },
];

const faqs = [
  { 
    q: "Meus clientes precisam baixar algum aplicativo pesado?", 
    a: "Não! O GeevheitHair é 100% em nuvem e adaptado para qualquer smartphone. Tanto você quanto suas clientes acessam direto pelo navegador com carregamento ultra rápido e sem ocupar espaço no celular." 
  },
  { 
    q: "O dinheiro do sinal cai onde? Há retenção ou taxas?", 
    a: "O valor do sinal vai integralmente e em tempo real para a chave PIX da sua conta cadastrada. Nós não retemos seu dinheiro e não cobramos nenhuma comissão por agendamento realizado." 
  },
  { 
    q: "Existe contrato de fidelidade ou multa se eu quiser cancelar?", 
    a: "Nenhum. Nossa relação é baseada em valor e resultados. Você pode cancelar ou alterar seu plano a qualquer momento pelo painel, sem taxas de cancelamento ou burocracia." 
  },
  { 
    q: "Funciona bem para cabeleireiros e profissionais autônomos?", 
    a: "Com certeza! O plano Básico foi desenhado sob medida para quem atende sozinho e precisa de uma recepção digital ativa para não interromper os atendimentos respondendo mensagens." 
  },
  {
    q: "Como funciona o Chatbot WhatsApp IA do plano Premium?",
    a: "É uma assistente virtual inteligente conectada ao seu WhatsApp oficial que conversa com tom humanizado, tira dúvidas de horários, envia o link de agendamento e dispara lembretes antecipados contra furos."
  }
];

const plans = [
  { 
    name: "Básico", 
    price: "R$ 49,99", 
    per: "/mês", 
    highlight: false, 
    features: [
      "1 profissional", 
      "Página do salão (Link na Bio)", 
      "Agendamento Automático 24h", 
      "Cobrança de Sinal (PIX)", 
      "Apenas 10 vagas disponíveis"
    ] 
  },
  { 
    name: "Profissional", 
    price: "R$ 99,99", 
    per: "/mês", 
    highlight: true, 
    features: [
      "Tudo do plano Básico, mais:", 
      "Até 5 profissionais", 
      "Agendamentos Ilimitados", 
      "Cálculo de Comissões", 
      "Controle Financeiro", 
      "Suporte VIP", 
      "Apenas 10 vagas disponíveis"
    ] 
  },
  { 
    name: "Premium", 
    price: "R$ 219,99", 
    per: "/mês", 
    highlight: false, 
    badge: "🤖 CHATBOT WHATSAPP INCLUSO",
    features: [
      "Tudo do plano Profissional, mais:", 
      "🤖 Chatbot WhatsApp IA (Atendente 24h)", 
      "💬 Agendamento e Cobrança no WhatsApp", 
      "⏰ Lembrete Anti-Furo 2h Antes", 
      "Profissionais Ilimitados", 
      "Múltiplas unidades (até 3)", 
      "Gestão de Estoque Completa", 
      "Apenas 5 vagas exclusivas"
    ] 
  },
];

export default function Marketing() {
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);
  const plansList = plans;

  return (
    <div className="min-h-full bg-background font-sans selection:bg-primary/20 selection:text-primary">
      {/* Nav */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif text-xl font-medium text-foreground tracking-tight">GeevheitHair</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#beneficios" className="hover:text-primary transition-colors">Vantagens</a>
            <a href="#como-funciona" className="hover:text-primary transition-colors">Como funciona</a>
            <a href="#planos" className="hover:text-primary transition-colors">Planos</a>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="font-medium hover-lift">Entrar</Button>
            <Button size="sm" onClick={() => navigate("/onboarding")} className="font-semibold shadow-md hover-lift">Criar conta grátis</Button>
          </div>
          <button className="md:hidden p-2 rounded-lg hover:bg-muted" onClick={() => setMobileMenu(v => !v)}>
            {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {mobileMenu && (
          <div className="md:hidden border-t border-border bg-background px-5 py-6 flex flex-col gap-4 text-sm font-medium animate-fade-up">
            <a href="#beneficios" onClick={() => setMobileMenu(false)} className="text-foreground hover:text-primary transition-colors py-1">Vantagens</a>
            <a href="#como-funciona" onClick={() => setMobileMenu(false)} className="text-foreground hover:text-primary transition-colors py-1">Como funciona</a>
            <a href="#planos" onClick={() => setMobileMenu(false)} className="text-foreground hover:text-primary transition-colors py-1">Planos</a>
            <button 
              onClick={() => { setMobileMenu(false); navigate("/contato"); }} 
              className="text-left text-foreground hover:text-primary transition-colors py-1 cursor-pointer"
            >
              Contato & Suporte
            </button>
            <div className="pt-4 border-t border-border flex flex-col gap-3">
              <Button variant="outline" className="w-full justify-center" onClick={() => navigate("/login")}>Entrar na minha conta</Button>
              <Button className="w-full justify-center" onClick={() => navigate("/onboarding")}>Criar conta grátis agora</Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="Salão de beleza de alto padrão" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-900/80 to-zinc-900/40" />
        </div>
        <div className="relative max-w-6xl mx-auto px-5 py-24 md:py-36 animate-fade-up">
          <Badge className="mb-6 text-white border-primary/50 bg-primary/20 backdrop-blur-md px-3 py-1 font-medium text-xs tracking-wide animate-pulse-soft">
            ✨ O Ecossistema Inteligente para Salões e Especialistas da Beleza
          </Badge>
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-medium text-white leading-[1.1] max-w-3xl mb-6">
            Transforme seu talento em um negócio de elite com <span className="font-semibold text-[#5558e3]">sinal garantido e agenda cheia.</span>
          </h1>
          <p className="text-zinc-300 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
            O GeevheitHair eleva o padrão de atendimento do seu salão: sua cliente agenda sozinha pelo celular, confirma com PIX instantâneo e sua equipe atende com foco total na excelência.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-xl">
            <div className="flex-1">
              <Button size="lg" onClick={() => navigate("/onboarding")} className="w-full h-14 bg-white text-zinc-950 hover:bg-zinc-100 shadow-xl font-bold text-base hover-lift">
                Experimentar 10 dias grátis <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-zinc-400 text-xs mt-3 text-center sm:text-left flex items-center justify-center sm:justify-start gap-1.5 font-medium">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> 10 dias sem custo • Não exige cartão de crédito
              </p>
            </div>
            <Button size="lg" variant="outline" onClick={() => navigate("/agendar/geevheithair-studio")} className="h-14 border-zinc-600 text-white hover:bg-zinc-800 hover:text-white backdrop-blur-sm bg-zinc-900/30 hover-lift">
              Ver demonstração da cliente
            </Button>
          </div>
        </div>
      </section>

      {/* Trust / Stats Band */}
      <section className="bg-primary text-primary-foreground py-8 border-y border-primary/80">
        <div className="max-w-6xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x divide-primary-foreground/20">
          <div className="flex flex-col gap-1">
            <span className="font-bold text-2xl lg:text-3xl">100% Blindado</span>
            <span className="text-primary-foreground/80 text-sm font-medium">Sinal antecipado via PIX</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-bold text-2xl lg:text-3xl">24h / 7 dias</span>
            <span className="text-primary-foreground/80 text-sm font-medium">Recepção digital automática</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-bold text-2xl lg:text-3xl">+35%</span>
            <span className="text-primary-foreground/80 text-sm font-medium">Aumento real na taxa de presença</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-bold text-2xl lg:text-3xl">0% Taxa</span>
            <span className="text-primary-foreground/80 text-sm font-medium">O PIX cai direto na sua conta</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="beneficios" className="py-24 max-w-6xl mx-auto px-5">
        <div className="text-center mb-16 md:mb-20 animate-fade-up">
          <Badge className="mb-4 bg-secondary text-primary hover:bg-secondary">O Padrão GeevheitHair</Badge>
          <h2 className="font-serif text-3xl md:text-5xl font-medium mb-5 tracking-tight text-zinc-900 dark:text-white">Menos tempo no operacional, <span className="font-bold">mais faturamento no bolso.</span></h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Trabalhar muito e sobrar pouco no fim do mês ficou para trás. O GeevheitHair foi projetado para elevar a autoridade do seu salão e organizar sua equipe.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={f.title} className="flex flex-col group">
              <div className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm mb-6 aspect-[4/3] relative">
                <img src={f.img} alt={f.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-lg shrink-0">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-white text-lg leading-tight text-shadow-sm">{f.title}</h3>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 bg-gradient-premium border-y border-border">
        <div className="max-w-4xl mx-auto px-5 animate-fade-up">
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-center mb-12">O modelo tradicional vs. O ecossistema GeevheitHair</h2>
          <div className="grid md:grid-cols-2 gap-6 lg:gap-12">
            <div className="bg-card border border-red-100 dark:border-red-900/30 rounded-2xl p-6 md:p-8 shadow-sm">
              <h3 className="font-bold text-red-500 mb-6 flex items-center gap-2 text-lg">
                <X className="w-5 h-5" /> Sem o GeevheitHair
              </h3>
              <ul className="space-y-4">
                {[
                  "Cadeira vazia e prejuízo com clientes que desmarcam de última hora", 
                  "Horas perdidas respondendo mensagens repetitivas no WhatsApp à noite", 
                  "Dúvida sobre o lucro líquido no fim do mês por falta de controle", 
                  "Cálculo manual de comissões gerando conflitos com a equipe", 
                  "Caderno de agendamentos rasurado e com sobreposição de horários"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground">
                    <X className="w-4 h-4 text-red-400 shrink-0 mt-1" /> <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 md:p-8 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10" />
              <h3 className="font-bold text-primary mb-6 flex items-center gap-2 text-lg">
                <Check className="w-5 h-5" /> Com o GeevheitHair
              </h3>
              <ul className="space-y-4 relative z-10">
                {[
                  "Sinal antecipado via PIX garantindo a assiduidade e o faturamento", 
                  "Recepção digital online 24h fechando reservas no piloto automático", 
                  "Painel financeiro em tempo real com visão clara de lucros e despesas", 
                  "Divisão exata de comissões por profissional calculada em um clique", 
                  "Posicionamento moderno e sofisticado que valoriza o preço do seu serviço"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-foreground font-medium">
                    <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /> <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="py-24">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-5xl font-medium mb-4 tracking-tight">Ativação simplificada em 4 etapas</h2>
            <p className="text-muted-foreground text-lg">Sem burocracia ou complexidades técnicas. Seu salão pronto para faturar.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            <div className="hidden lg:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10 -z-10" />
            {steps.map((s, i) => (
              <div key={s.n} className="bg-card border border-border hover:border-primary/50 transition-colors rounded-2xl p-6 relative group">
                <div className="w-12 h-12 bg-secondary group-hover:bg-primary group-hover:text-white transition-colors rounded-full flex items-center justify-center font-bold text-lg text-primary mb-6 shadow-sm">
                  {s.n}
                </div>
                <h3 className="font-bold text-foreground mb-3 text-lg">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-16 text-center">
            <Button size="lg" onClick={() => navigate("/onboarding")} className="font-bold px-8">Começar a configurar meu salão</Button>
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="py-24 bg-secondary/30">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-5xl font-medium mb-5 tracking-tight">O investimento que se paga sozinho.</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Se o GeevheitHair evitar que você tome <strong>um único furo na agenda</strong> no mês inteiro, ele já cobriu a mensalidade e gerou lucro líquido.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plansList.map((p, i) => (
              <div
                key={p.name}
                className={`relative rounded-3xl p-8 flex flex-col transition-transform duration-300 hover:-translate-y-1 ${
                  p.highlight
                    ? "bg-primary text-primary-foreground border-primary shadow-2xl scale-105 z-10"
                    : "bg-card border border-border shadow-md"
                }`}
              >
                {p.highlight && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <Badge className="bg-amber-400 text-amber-950 hover:bg-amber-400 border-none font-bold px-4 py-1.5 shadow-sm text-xs uppercase tracking-wider">
                      Mais Escolhido pelos Salões
                    </Badge>
                  </div>
                )}
                {!(p as any).highlight && (p as any).badge && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-none font-extrabold px-3 py-1 shadow-md text-[10px] uppercase tracking-wider">
                      {(p as any).badge}
                    </Badge>
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className={`text-xl font-bold mb-2 ${(p as any).highlight ? "text-white" : "text-foreground"}`}>{(p as any).name}</h3>
                  <div className="flex items-end gap-1">
                    <span className={`font-serif text-4xl font-medium tracking-tight ${(p as any).highlight ? "text-white" : "text-foreground"}`}>
                      {(p as any).price.toString().startsWith('R$') ? (p as any).price : `R$ ${(p as any).price}`}
                    </span>
                    <span className={`text-sm mb-1.5 font-medium ${(p as any).highlight ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{(p as any).period || (p as any).per || '/mês'}</span>
                  </div>
                </div>

                <div className={`h-[1px] w-full mb-6 ${(p as any).highlight ? 'bg-primary-foreground/20' : 'bg-border'}`} />

                <ul className="space-y-4 mb-8 flex-1">
                  {((p as any).features || []).map((f: string) => (
                    <li key={f} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 shrink-0 mt-0.5 ${(p as any).highlight ? "text-emerald-300" : "text-emerald-500"}`} />
                      <span className={`text-sm font-medium leading-tight ${(p as any).highlight ? "text-white" : "text-muted-foreground"}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => navigate(`/onboarding${(p as any).id ? `?planId=${(p as any).id}` : ''}`)}
                  variant={(p as any).highlight ? "secondary" : "primary"}
                  className={`w-full h-12 font-bold text-base ${(p as any).highlight ? 'bg-white text-primary hover:bg-zinc-100' : ''}`}
                >
                  Testar 10 dias grátis
                </Button>
                <p className={`text-center text-xs mt-3 font-medium ${(p as any).highlight ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  Sem cartão de crédito
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-card border-y border-border">
        <div className="max-w-3xl mx-auto px-5">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-medium mb-4">Dúvidas Frequentes</h2>
            <p className="text-muted-foreground">Tudo o que você precisa saber sobre a experiência GeevheitHair.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-secondary/50 border border-border rounded-2xl p-6">
                <h3 className="font-bold text-foreground text-lg mb-2 flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  {faq.q}
                </h3>
                <p className="text-muted-foreground pl-8 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="max-w-4xl mx-auto px-5 text-center relative z-10">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10 text-sm py-1.5 px-4">
            Garantia de 10 Dias Sem Riscos
          </Badge>
          <h2 className="font-serif text-4xl md:text-6xl font-medium mb-6 leading-tight tracking-tight text-foreground">
            Sua agenda cheia e sua equipe organizada a um clique.
          </h2>
          <p className="text-muted-foreground text-xl mb-10 max-w-2xl mx-auto">
            Crie sua conta em menos de 2 minutos sem precisar de cartão. Viva a experiência de gerenciar seu salão com o padrão GeevheitHair.
          </p>
          <div className="flex flex-col items-center gap-4">
            <Button size="lg" onClick={() => navigate("/onboarding")} className="h-16 px-10 text-lg font-bold shadow-xl hover:scale-105 transition-transform">
              Iniciar meus 10 dias grátis agora
            </Button>
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Demonstração gratuita por 10 dias. Cancele quando quiser.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-serif text-lg text-foreground font-medium">GeevheitHair</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2026 Geevheit Technology. Todos os direitos reservados.</p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-end gap-5 sm:gap-6 text-sm font-medium text-muted-foreground items-center">
            <button 
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                navigate("/termos");
              }} 
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Termos de Uso
            </button>
            <button 
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                navigate("/privacidade");
              }} 
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Privacidade
            </button>
            <button 
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                navigate("/contato");
              }} 
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Contato
            </button>
            <button 
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                navigate("/login-admin");
              }} 
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Portal Admin
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
