import { useState } from "react";
import { Sparkles, Calendar, CreditCard, BarChart3, Users, Store, Check, ArrowRight, Menu, X, ChevronRight } from "lucide-react";
import { Button, Badge } from "@/components/ui";

const HERO_IMG = "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1400&h=700&fit=crop&auto=format";
const BOOKING_IMG = "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=400&fit=crop&auto=format";
const PIX_IMG = "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop&auto=format";
const TEAM_IMG = "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600&h=400&fit=crop&auto=format";
const PAGE_IMG = "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&h=400&fit=crop&auto=format";
const MULTI_IMG = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop&auto=format";

const features = [
  { icon: Calendar, title: "Agendamento Online", desc: "Seus clientes agendam de qualquer lugar, sem instalar aplicativo.", img: BOOKING_IMG },
  { icon: CreditCard, title: "Pagamentos via PIX", desc: "Receba sinais e pagamentos via PIX. Confirmação automática.", img: PIX_IMG },
  { icon: BarChart3, title: "Gestão Completa", desc: "Agenda, clientes, equipe e financeiro em um só painel.", img: TEAM_IMG },
  { icon: Store, title: "Página Profissional", desc: "Tenha sua presença digital com agendamento integrado.", img: PAGE_IMG },
  { icon: Users, title: "Multi-unidade", desc: "Gerencie várias unidades e equipes em um só lugar.", img: MULTI_IMG },
];

const steps = [
  { n: "01", title: "Cadastre seu salão", desc: "Configure em minutos — nome, serviços, horários e profissionais." },
  { n: "02", title: "Configure seus serviços", desc: "Adicione preços, duração e fotos para cada serviço." },
  { n: "03", title: "Publique sua página", desc: "Seu link personalizado fica pronto para compartilhar." },
  { n: "04", title: "Comece a receber agendamentos", desc: "Seus clientes agendam e pagam direto pelo link." },
];

const plans = [
  { name: "Básico", price: "R$ XX", per: "/mês", highlight: false, features: ["1 profissional", "Agenda online", "Página do salão", "PIX básico", "50 agendamentos/mês"] },
  { name: "Profissional", price: "R$ XX", per: "/mês", highlight: true, features: ["Até 5 profissionais", "Tudo do Básico", "Financeiro", "Comissões", "Relatórios", "WhatsApp", "Sem limite de agendamentos"] },
  { name: "Premium", price: "R$ XX", per: "/mês", highlight: false, features: ["Até 15 profissionais", "Tudo do Profissional", "Múltiplas unidades (3)", "CRM avançado", "Personalização completa"] },
  { name: "Empresarial", price: "Sob consulta", per: "", highlight: false, features: ["Profissionais ilimitados", "Unidades ilimitadas", "API + integrações", "Suporte dedicado", "SLA garantido"] },
];

const testimonials = [
  { name: "Fernanda Lima", role: "Salão Rosé — Moema, SP", rating: 5, text: "Reduzi em 80% os cancelamentos por falta de lembretes. Meus clientes adoram o link de agendamento.", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&auto=format" },
  { name: "Carla Mendes", role: "Studio Carla — Campinas, SP", rating: 5, text: "Antes eu controlava tudo no papel. Hoje tenho relatório de tudo com um clique. Salvou meu negócio.", avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&h=80&fit=crop&auto=format" },
  { name: "Patricia Souza", role: "Rede Bella — 4 unidades", rating: 5, text: "Com o multi-unidade consigo ver o faturamento de todas as lojas em tempo real. Incrível.", avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&auto=format" },
];

import { useNavigate } from "react-router-dom";

export default function Marketing() {
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activePlan, setActivePlan] = useState(1);

  return (
    <div className="min-h-full bg-background font-sans">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif text-xl font-medium text-foreground">beautyOS</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Funcionalidades</a>
            <a href="#como-funciona" className="hover:text-foreground transition-colors">Como funciona</a>
            <a href="#planos" className="hover:text-foreground transition-colors">Planos</a>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>Entrar</Button>
            <Button size="sm" onClick={() => navigate("/onboarding")}>Começar grátis</Button>
          </div>
          <button className="md:hidden p-2 rounded-lg hover:bg-muted" onClick={() => setMobileMenu(v => !v)}>
            {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {mobileMenu && (
          <div className="md:hidden border-t border-border bg-background px-5 py-4 flex flex-col gap-4 text-sm">
            <a href="#features" className="text-muted-foreground">Funcionalidades</a>
            <a href="#como-funciona" className="text-muted-foreground">Como funciona</a>
            <a href="#planos" className="text-muted-foreground">Planos</a>
            <Button variant="outline" size="sm" onClick={() => navigate("/login")}>Entrar</Button>
            <Button size="sm" onClick={() => navigate("/onboarding")}>Começar grátis</Button>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="Salão de beleza" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-transparent" />
        </div>
        <div className="relative max-w-6xl mx-auto px-5 py-28 md:py-40">
          <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
            <Sparkles className="w-3 h-3" /> Nova plataforma para salões de beleza
          </Badge>
          <h1 className="font-serif text-4xl md:text-6xl font-medium text-white leading-tight max-w-2xl mb-6">
            Seu salão mais organizado.<br />
            <em className="italic font-light">Seus clientes mais conectados.</em>
          </h1>
          <p className="text-white/80 text-lg max-w-xl mb-8 leading-relaxed">
            Agende, receba, organize e acompanhe seu salão em um só lugar. Sem aplicativo para instalar.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={() => navigate("/onboarding")} className="bg-white text-foreground! hover:bg-white/95 shadow-lg font-semibold">
              Começar agora <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/agendar/beleza-pura-matriz")} className="border-white/40 text-white hover:bg-white/10">
              Ver demonstração do cliente
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-6 mt-10 text-white/70 text-sm">
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-400" /> 14 dias grátis</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-400" /> Sem cartão de crédito</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-400" /> Configuração em minutos</span>
          </div>
        </div>
      </section>

      {/* Benefits band */}
      <section className="bg-secondary border-y border-border">
        <div className="max-w-6xl mx-auto px-5 py-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {[
            { icon: Calendar, label: "Agendamento online" },
            { icon: CreditCard, label: "Pagamento via PIX" },
            { icon: Users, label: "Gestão de clientes" },
            { icon: Sparkles, label: "Gestão de equipe" },
            { icon: BarChart3, label: "Controle financeiro" },
            { icon: Store, label: "Página profissional" },
          ].map(b => (
            <div key={b.label} className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <b.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground leading-tight">{b.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 max-w-6xl mx-auto px-5">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-secondary text-muted-foreground">Funcionalidades</Badge>
          <h2 className="font-serif text-3xl md:text-4xl font-medium mb-4">Tudo que seu salão precisa</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">Uma plataforma completa para gestão de salões de beleza, estética e bem-estar.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={f.title} className={`group rounded-2xl overflow-hidden border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 ${i === 0 ? "md:col-span-2 lg:col-span-1" : ""}`}>
              <div className="aspect-video overflow-hidden">
                <img src={f.img} alt={f.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 rounded-lg bg-secondary flex items-center justify-center">
                    <f.icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">{f.title}</h3>
                </div>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="py-24 bg-secondary/50">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-white text-muted-foreground border-border">Como funciona</Badge>
            <h2 className="font-serif text-3xl md:text-4xl font-medium mb-4">Em 4 passos, seu salão online</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.n} className="relative bg-card border border-border rounded-2xl p-6">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 -right-3 z-10">
                    <ChevronRight className="w-5 h-5 text-border" />
                  </div>
                )}
                <div className="font-mono text-4xl font-medium text-primary/20 mb-4 font-[JetBrains_Mono]">{s.n}</div>
                <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 max-w-6xl mx-auto px-5">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-medium mb-4">O que dizem nossos clientes</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map(t => (
            <div key={t.name} className="bg-card border border-border rounded-2xl p-6">
              <div className="text-amber-400 text-lg mb-3">{"★".repeat(t.rating)}</div>
              <p className="text-foreground text-sm leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <div className="font-medium text-sm">{t.name}</div>
                  <div className="text-muted-foreground text-xs">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="py-24 bg-secondary/30">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-medium mb-4">Planos para cada negócio</h2>
            <p className="text-muted-foreground">Comece grátis. Sem cartão. Cancele quando quiser.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((p, i) => (
              <div
                key={p.name}
                onClick={() => setActivePlan(i)}
                className={`relative rounded-2xl p-6 cursor-pointer transition-all duration-200 border ${
                  p.highlight
                    ? "bg-primary text-primary-foreground border-primary shadow-xl scale-105"
                    : "bg-card border-border hover:border-primary/30"
                }`}
              >
                {p.highlight && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 border-0">Mais popular</Badge>
                )}
                <div className={`text-sm font-medium mb-1 ${p.highlight ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{p.name}</div>
                <div className="flex items-end gap-1 mb-4">
                  <span className={`font-serif text-3xl font-medium ${p.highlight ? "text-primary-foreground" : "text-foreground"}`}>{p.price}</span>
                  <span className={`text-sm mb-1 ${p.highlight ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{p.per}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {p.features.map(f => (
                    <li key={f} className={`flex items-start gap-2 text-sm ${p.highlight ? "text-primary-foreground/90" : "text-foreground"}`}>
                      <Check className={`w-4 h-4 shrink-0 mt-0.5 ${p.highlight ? "text-white" : "text-emerald-500"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${
                  p.highlight
                    ? "bg-white text-primary hover:bg-white/90"
                    : "border border-border hover:bg-muted text-foreground"
                }`}>
                  Começar agora
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <h2 className="font-serif text-3xl md:text-5xl font-medium mb-6 leading-tight">
            Seu salão. Sua agenda.<br />
            <em className="italic font-light text-primary">Seu negócio.</em>
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Junte-se a mais de 2.400 salões que já usam o beautyOS.
          </p>
          <Button size="lg" onClick={() => navigate("/onboarding")}>
            Começar grátis por 14 dias <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/40 py-10">
        <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="font-serif text-foreground">beautyOS</span>
          </div>
          <p>© 2024 beautyOS. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground">Termos</a>
            <a href="#" className="hover:text-foreground">Privacidade</a>
            <a href="#" className="hover:text-foreground">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
