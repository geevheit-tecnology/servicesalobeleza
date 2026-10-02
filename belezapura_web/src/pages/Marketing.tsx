import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Calendar, CreditCard, BarChart3, Users, Store, Check, ArrowRight, Menu, X, ChevronRight, ShieldCheck, Smartphone, Zap, Clock, TrendingUp, HelpCircle } from "lucide-react";
import { Button, Badge } from "@/components/ui";

const HERO_IMG = "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1400&h=700&fit=crop&auto=format";
const BOOKING_IMG = "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=400&fit=crop&auto=format";
const PIX_IMG = "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop&auto=format";
const TEAM_IMG = "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600&h=400&fit=crop&auto=format";

const features = [
  { icon: ShieldCheck, title: "Sinal Antecipado via PIX", desc: "Acabe com os furos na agenda. Exija o pagamento de um sinal no ato do agendamento. O dinheiro cai direto na sua conta, sem taxas intermediárias.", img: PIX_IMG },
  { icon: Smartphone, title: "Agendamento Automático 24h", desc: "Seu link exclusivo para a bio do Instagram. O cliente vê os horários livres, agenda e paga sozinho. Adeus horas perdidas respondendo mensagens.", img: BOOKING_IMG },
  { icon: BarChart3, title: "Comissões e Financeiro na Mão", desc: "Fechamento de caixa sem dor de cabeça. Calcule automaticamente a comissão de cada profissional e tenha o controle total do seu lucro mensal.", img: TEAM_IMG },
];

const steps = [
  { n: "01", title: "Crie sua conta grátis", desc: "Leva menos de 2 minutos e não exige cartão de crédito." },
  { n: "02", title: "Cadastre seus serviços", desc: "Coloque seus preços, duração e adicione seus profissionais." },
  { n: "03", title: "Ative o recebimento via PIX", desc: "Adicione sua chave PIX para começar a receber os sinais de reserva." },
  { n: "04", title: "Link na Bio", desc: "Coloque seu link no Instagram e veja a agenda encher sozinha!" },
];

const faqs = [
  { q: "Meus clientes precisam baixar algum aplicativo?", a: "Não! O cliente acessa o seu link pelo navegador do celular, de forma super leve e rápida, sem precisar baixar ou instalar nada." },
  { q: "O dinheiro do PIX vai para onde? Tem taxa?", a: "O dinheiro cai direto na chave PIX que você configurar (na sua conta bancária). Nós não cobramos NENHUMA taxa por agendamento." },
  { q: "Eu tenho carência ou multa se quiser cancelar?", a: "De forma alguma. O beautyOS é uma assinatura mensal sem contrato de fidelidade. Você cancela com um clique quando quiser." },
  { q: "Serve para quem trabalha sozinho (Autônomo)?", a: "Com certeza! Inclusive, é onde você mais sente a diferença, pois não precisará parar o atendimento para responder o WhatsApp." },
];

const plans = [
  { name: "Básico", price: "R$ 49,90", per: "/mês", highlight: false, features: ["1 profissional", "Agendamento Automático 24h", "Cobrança de Sinal (PIX)", "Página do salão (Link na Bio)", "Até 100 agendamentos/mês"] },
  { name: "Profissional", price: "R$ 97,00", per: "/mês", highlight: true, features: ["Até 5 profissionais", "Agendamentos Ilimitados", "Cálculo de Comissões", "Controle Financeiro", "Relatórios de Lucro", "Suporte Prioritário"] },
  { name: "Empresarial", price: "R$ 197,00", per: "/mês", highlight: false, features: ["Profissionais Ilimitados", "Múltiplas unidades (até 3)", "Tudo do plano Profissional", "Gestão de Estoque", "Acesso para Recepcionista"] },
];

const testimonials = [
  { name: "Fernanda Lima", role: "Salão Rosé — São Paulo", rating: 5, text: "Eu perdia cerca de 3 a 4 clientes por semana que marcavam e não iam. Desde que ativei o sinal via PIX no beautyOS, NUNCA mais levei calote.", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&auto=format" },
  { name: "Carla Mendes", role: "Studio Carla (Lash Designer)", rating: 5, text: "Eu trabalhava o dia todo e passava a noite respondendo WhatsApp pra agendar clientes pro dia seguinte. Hoje elas agendam sozinhas de madrugada!", avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&h=80&fit=crop&auto=format" },
  { name: "Roberto Silva", role: "Barbearia do Beto", rating: 5, text: "O fechamento das comissões dos barbeiros demorava horas no fim de semana. Agora o sistema me dá tudo mastigado. Vale cada centavo.", avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&auto=format" },
];

export default function Marketing() {
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [plansList, setPlansList] = useState<any[]>(plans);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/public/plans`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setPlansList(data);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-full bg-background font-sans selection:bg-primary/20 selection:text-primary">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif text-xl font-medium text-foreground tracking-tight">beautyOS</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#beneficios" className="hover:text-primary transition-colors">Vantagens</a>
            <a href="#como-funciona" className="hover:text-primary transition-colors">Como funciona</a>
            <a href="#depoimentos" className="hover:text-primary transition-colors">Depoimentos</a>
            <a href="#planos" className="hover:text-primary transition-colors">Planos</a>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="font-medium">Entrar</Button>
            <Button size="sm" onClick={() => navigate("/onboarding")} className="font-semibold shadow-md">Criar conta grátis</Button>
          </div>
          <button className="md:hidden p-2 rounded-lg hover:bg-muted" onClick={() => setMobileMenu(v => !v)}>
            {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {mobileMenu && (
          <div className="md:hidden border-t border-border bg-background px-5 py-6 flex flex-col gap-5 text-sm font-medium">
            <a href="#beneficios" onClick={() => setMobileMenu(false)} className="text-foreground">Vantagens</a>
            <a href="#como-funciona" onClick={() => setMobileMenu(false)} className="text-foreground">Como funciona</a>
            <a href="#planos" onClick={() => setMobileMenu(false)} className="text-foreground">Planos</a>
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
          <img src={HERO_IMG} alt="Salão de beleza" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-900/80 to-zinc-900/40" />
        </div>
        <div className="relative max-w-6xl mx-auto px-5 py-24 md:py-36">
          <Badge className="mb-6 text-white border-primary/50 bg-primary/20 backdrop-blur-md px-3 py-1 font-medium text-xs tracking-wide">
            🔥 O fim dos clientes que marcam e não vão
          </Badge>
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-medium text-white leading-[1.1] max-w-3xl mb-6">
            Acabe com os furos na agenda e <span className="text-primary-foreground italic font-light">zere o tempo perdido no WhatsApp.</span>
          </h1>
          <p className="text-zinc-300 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
            O sistema que funciona como uma secretária 24 horas: agenda, cobra um sinal via PIX automaticamente e lota o seu salão enquanto você foca apenas em atender.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-xl">
            <div className="flex-1">
              <Button size="lg" onClick={() => navigate("/onboarding")} className="w-full h-14 bg-white text-zinc-950 hover:bg-zinc-100 shadow-xl font-bold text-base transition-transform hover:scale-[1.02]">
                Criar minha conta grátis <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-zinc-400 text-xs mt-3 text-center sm:text-left flex items-center justify-center sm:justify-start gap-1.5 font-medium">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> 14 dias grátis • Não exige cartão de crédito
              </p>
            </div>
            <Button size="lg" variant="outline" onClick={() => navigate("/agendar/beleza-pura-matriz")} className="h-14 border-zinc-600 text-white hover:bg-zinc-800 hover:text-white backdrop-blur-sm bg-zinc-900/30">
              Ver a visão do cliente
            </Button>
          </div>
        </div>
      </section>

      {/* Trust / Stats Band */}
      <section className="bg-primary text-primary-foreground py-8 border-y border-primary/80">
        <div className="max-w-6xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x divide-primary-foreground/20">
          <div className="flex flex-col gap-1">
            <span className="font-bold text-2xl lg:text-3xl">Zero</span>
            <span className="text-primary-foreground/80 text-sm font-medium">Furos na agenda</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-bold text-2xl lg:text-3xl">24h</span>
            <span className="text-primary-foreground/80 text-sm font-medium">Agendamento automático</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-bold text-2xl lg:text-3xl">+40%</span>
            <span className="text-primary-foreground/80 text-sm font-medium">Aumento no faturamento médio</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-bold text-2xl lg:text-3xl">0%</span>
            <span className="text-primary-foreground/80 text-sm font-medium">Taxas sobre o seu PIX</span>
          </div>
        </div>
      </section>

      {/* Features - Pain Point Focus */}
      <section id="beneficios" className="py-24 max-w-6xl mx-auto px-5">
        <div className="text-center mb-16 md:mb-20">
          <Badge className="mb-4 bg-secondary text-primary hover:bg-secondary">O problema que resolvemos</Badge>
          <h2 className="font-serif text-3xl md:text-5xl font-medium mb-5 tracking-tight text-zinc-900 dark:text-white">Pare de perder dinheiro e tempo.</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Trabalhar muito e sobrar pouco no fim do mês acabou. O beautyOS foi desenhado para eliminar os piores gargalos do seu salão.</p>
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

      {/* Comparison Section (Before/After) */}
      <section className="py-20 bg-secondary/30 border-y border-border">
        <div className="max-w-4xl mx-auto px-5">
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-center mb-12">A diferença na prática</h2>
          <div className="grid md:grid-cols-2 gap-6 lg:gap-12">
            <div className="bg-card border border-red-100 dark:border-red-900/30 rounded-2xl p-6 md:p-8 shadow-sm">
              <h3 className="font-bold text-red-500 mb-6 flex items-center gap-2 text-lg">
                <X className="w-5 h-5" /> Sem o beautyOS
              </h3>
              <ul className="space-y-4">
                {["Cliente marca e não aparece (você fica no prejuízo)", "Passar o domingo respondendo WhatsApp", "Não saber exatamente o lucro no fim do mês", "Calculadora para fazer comissões da equipe", "Agenda de papel bagunçada e com rasuras"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground">
                    <X className="w-4 h-4 text-red-400 shrink-0 mt-1" /> <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 md:p-8 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10" />
              <h3 className="font-bold text-primary mb-6 flex items-center gap-2 text-lg">
                <Check className="w-5 h-5" /> Com o beautyOS
              </h3>
              <ul className="space-y-4 relative z-10">
                {["Sinal antecipado no PIX (Garante o comparecimento)", "Agenda roda no piloto automático 24h/dia", "Dashboard mostrando seu faturamento real", "Comissões calculadas num clique", "Tudo organizado na palma da sua mão"].map((item, i) => (
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
            <h2 className="font-serif text-3xl md:text-5xl font-medium mb-4 tracking-tight">Em 4 passos, sua vida muda.</h2>
            <p className="text-muted-foreground text-lg">Mais simples do que fazer uma escova. Sem complicações técnicas.</p>
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
            <Button size="lg" onClick={() => navigate("/onboarding")} className="font-bold px-8">Começar a configurar agora</Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="depoimentos" className="py-24 bg-zinc-950 text-white">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-5xl font-medium mb-5">Quem usa, não larga mais.</h2>
            <p className="text-zinc-400 text-lg">Junte-se a centenas de salões que pararam de perder dinheiro.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 hover:bg-zinc-800/80 transition-colors">
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: t.rating }).map((_, i) => <Sparkles key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-zinc-300 text-base leading-relaxed mb-8 italic">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-zinc-700" />
                  <div>
                    <div className="font-bold text-sm text-white">{t.name}</div>
                    <div className="text-zinc-500 text-xs mt-0.5">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="py-24 bg-secondary/30">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-5xl font-medium mb-5 tracking-tight">O sistema que se paga sozinho.</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Se o beautyOS evitar que você tome <strong>um único furo na agenda</strong> no mês inteiro, ele já pagou a mensalidade e deu lucro.
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
                      A Escolha Mais Inteligente
                    </Badge>
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className={`text-xl font-bold mb-2 ${p.highlight ? "text-white" : "text-foreground"}`}>{p.name}</h3>
                  <div className="flex items-end gap-1">
                    <span className={`font-serif text-4xl font-medium tracking-tight ${p.highlight ? "text-white" : "text-foreground"}`}>
                      {p.price.toString().startsWith('R$') ? p.price : `R$ ${p.price}`}
                    </span>
                    <span className={`text-sm mb-1.5 font-medium ${p.highlight ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{p.period || p.per || '/mês'}</span>
                  </div>
                </div>

                <div className={`h-[1px] w-full mb-6 ${p.highlight ? 'bg-primary-foreground/20' : 'bg-border'}`} />

                <ul className="space-y-4 mb-8 flex-1">
                  {(p.features || []).map((f: string) => (
                    <li key={f} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 shrink-0 mt-0.5 ${p.highlight ? "text-emerald-300" : "text-emerald-500"}`} />
                      <span className={`text-sm font-medium leading-tight ${p.highlight ? "text-white" : "text-muted-foreground"}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => navigate(`/onboarding${p.id ? `?planId=${p.id}` : ''}`)}
                  variant={p.highlight ? "secondary" : "default"}
                  className={`w-full h-12 font-bold text-base ${p.highlight ? 'bg-white text-primary hover:bg-zinc-100' : ''}`}
                >
                  Testar 14 dias grátis
                </Button>
                <p className={`text-center text-xs mt-3 font-medium ${p.highlight ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
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
            <p className="text-muted-foreground">Tudo que você precisa saber antes de começar.</p>
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
            Risco Zero
          </Badge>
          <h2 className="font-serif text-4xl md:text-6xl font-medium mb-6 leading-tight tracking-tight text-foreground">
            Sua paz de espírito e sua agenda lotada a um clique.
          </h2>
          <p className="text-muted-foreground text-xl mb-10 max-w-2xl mx-auto">
            Crie sua conta agora, não precisa colocar cartão. Teste na prática como é ter um salão organizado e lucrativo.
          </p>
          <div className="flex flex-col items-center gap-4">
            <Button size="lg" onClick={() => navigate("/onboarding")} className="h-16 px-10 text-lg font-bold shadow-xl hover:scale-105 transition-transform">
              Criar minha conta grátis agora
            </Button>
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Teste grátis por 14 dias. Cancele quando quiser.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-serif text-lg text-foreground font-medium">beautyOS</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2024 beautyOS Tecnologia. Todos os direitos reservados.</p>
          </div>
          <div className="flex gap-6 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-primary transition-colors">Privacidade</a>
            <a href="#" className="hover:text-primary transition-colors">Contato e Suporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
