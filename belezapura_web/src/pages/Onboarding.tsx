import { CurrencyInput, DurationInput } from "@/components/FormattedInputs";
import { formatCurrency, parseCurrency, parseDuration, formatDurationDisplay } from "@/utils/formatters";
import { planFeatures } from "@/components/PlanCatalog";
import { api } from "@/lib/api";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Store, Image, Scissors, UserCheck, Clock, CreditCard, Globe,
  Check, ArrowRight, ArrowLeft, Sparkles, Upload, Plus, X, ChevronRight, Lock
} from "lucide-react";
import { Button, Badge, Avatar } from "@/components/ui";
import { optimizeImage, PRESETS } from "@/utils/imageOptimizer";

const STEPS = [
  { id: 1, icon: Store, label: "Dados do salão", sub: "Informações básicas" },
  { id: 2, icon: Image, label: "Logo e fotos", sub: "Identidade visual" },
  { id: 3, icon: Scissors, label: "Serviços", sub: "O que você oferece" },
  { id: 4, icon: UserCheck, label: "Profissionais", sub: "Sua equipe" },
  { id: 5, icon: Clock, label: "Horários", sub: "Quando você atende" },
  { id: 6, icon: CreditCard, label: "PIX", sub: "Receba online" },
  { id: 7, icon: Globe, label: "Publicar", sub: "Sua página no ar" },
  { id: 8, icon: Lock, label: "Assinatura", sub: "Ativar plano" },
];

const serviceCategories = ["Cabelo", "Unhas", "Massagem", "Estética", "Maquiagem", "Sobrancelhas", "Bronzeamento", "Outros"];

interface OnboardingService {
  name: string;
  cat?: string;
  duration?: string;
  price: string;
  active: boolean;
}

interface OnboardingPro {
  name: string;
  specialty?: string;
  phone?: string;
  active: boolean;
}

const defaultServices: OnboardingService[] = [];
const defaultPros: OnboardingPro[] = [];

export const ONBOARDING_PLANS = [
  {
    id: "essencial",
    name: "Essencial",
    price: "R$ 59,90",
    period: "/mês",
    desc: "Para profissionais autônomos que atendem sozinhos",
    features: [
      "1 profissional",
      "Página exclusiva na Bio do Instagram",
      "Agendamento online 24h",
      "Sinal antecipado via PIX sem taxas",
      "Gestão de clientes",
      "Controle de atendimentos e clientes"
    ]
  },
  {
    id: "studio",
    name: "Studio",
    price: "R$ 119,90",
    period: "/mês",
    highlight: true,
    badge: "MAIS ESCOLHIDO",
    trialBadge: "🎁 14 DIAS GRÁTIS NO STUDIO COMPLETO",
    desc: "Para clínicas, studios e salões em equipe (até 5 profissionais)",
    features: [
      "Tudo do Essencial",
      "Até 5 profissionais",
      "Estimativa de comissões",
      "Painel financeiro com controle de entradas",
      "Agenda por profissional",
      "Controle de comandas e serviços",
      "🎁 14 dias de teste grátis"
    ]
  },
  {
    id: "elite",
    name: "Elite",
    price: "R$ 319,09",
    period: "/mês",
    desc: "Para grandes espaços, redes e clínicas (profissionais ilimitados)",
    features: [
      "Tudo do Studio",
      "Profissionais ilimitados",
      "Página de agendamento",
      "Histórico de atendimentos",
      "Controle de estoque e produtos",
      "Gestão do salão",
      "Suporte prioritário VIP"
    ]
  }
];

const weekDays = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const defaultSchedule = [
  { day: "Segunda", open: true, start: "09:00", end: "19:00" },
  { day: "Terça", open: true, start: "09:00", end: "19:00" },
  { day: "Quarta", open: true, start: "09:00", end: "19:00" },
  { day: "Quinta", open: true, start: "09:00", end: "19:00" },
  { day: "Sexta", open: true, start: "09:00", end: "19:00" },
  { day: "Sábado", open: true, start: "09:00", end: "17:00" },
  { day: "Domingo", open: false, start: "—", end: "—" },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <>
      {/* Mobile progress: compact and never overflows */}
      <div className="sm:hidden w-full">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-foreground">{STEPS[current - 1]?.label}</span>
          <span className="text-muted-foreground font-mono">{current} / {STEPS.length}</span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-300" 
            style={{ width: `${(current / STEPS.length) * 100}%` }} 
          />
        </div>
      </div>

      {/* Desktop progress */}
      <div className="hidden sm:flex items-center justify-center gap-0 overflow-x-auto py-1">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center shrink-0">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-all ${
              s.id < current ? "bg-emerald-500 text-white" :
              s.id === current ? "bg-primary text-primary-foreground shadow-md ring-4 ring-primary/20" :
              "bg-muted text-muted-foreground"
            }`}>
              {s.id < current ? <Check className="w-4 h-4" /> : s.id}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-6 lg:w-8 mx-0.5 transition-all ${s.id < current ? "bg-emerald-400" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>
    </>
  );
}

const handleImageUpload = async (
  e: React.ChangeEvent<HTMLInputElement>,
  callback: (base64: string) => void,
  preset?: { maxWidth: number; maxHeight: number; quality: number }
) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const optimized = await optimizeImage(file, preset || PRESETS.gallery);
    callback(optimized);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro ao processar imagem.";
    alert(msg);
  }
};

export default function Onboarding({ onFinish }: { onFinish: () => void }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [selectedPlanId, setSelectedPlanId] = useState<string>(() => {
    const p = (searchParams.get("planId") || "").toLowerCase();
    if (p === "1" || p === "essencial" || p === "starter" || p === "basico" || p === "básico") return "essencial";
    if (p === "3" || p === "elite" || p === "business" || p === "premium") return "elite";
    return p || "studio";
  });

  const [planCatalog, setPlanCatalog] = useState<typeof ONBOARDING_PLANS>([]);
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const [catalogError, setCatalogError] = useState("");
  useEffect(() => { api<any[]>("/public/plans").then(plans => {
    if (!Array.isArray(plans) || plans.length === 0) throw new Error("Não há planos disponíveis. Entre em contato antes de iniciar o cadastro.");
    setPlanCatalog(plans.map(p => ({ ...p, period: "/mês", price: Number(p.price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), desc: "Assinatura mensal com conferência manual", features: planFeatures(p) })));
    setSelectedPlanId(current => (plans.find(p => p.id === current || p.name.toLowerCase() === current) || plans[0]).id);
    setCatalogLoaded(true);
  }).catch(error => setCatalogError(error.message)); }, []);
  const [step, setStep] = useState(1);
  const [salonName, setSalonName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [services, setServices] = useState(defaultServices);
  const [pros, setPros] = useState(defaultPros);
  const [schedule, setSchedule] = useState(defaultSchedule);
  const [pixKey, setPixKey] = useState("");
  const [pixType, setPixType] = useState("cpf");
  const [pixName, setPixName] = useState("");
  const [depositPolicy, setDepositPolicy] = useState("required");
  const [depositType, setDepositType] = useState("percentage");
  const [depositValue, setDepositValue] = useState("20");
  const [instagram, setInstagram] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceCat, setNewServiceCat] = useState("Cabelo");
  const [newServiceDur, setNewServiceDur] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");

  const [newProName, setNewProName] = useState("");
  const [newProSpec, setNewProSpec] = useState("");
  const [newProPhone, setNewProPhone] = useState("");

  const [logo, setLogo] = useState<string | null>(null);
  const [cover, setCover] = useState<string>("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [mainColor, setMainColor] = useState<string>("#B83E58");

  const [tipoConta, setTipoConta] = useState("PJ");
  const [documento, setDocumento] = useState("");
  const [phone, setPhone] = useState("");
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  const [paymentError, setPaymentError] = useState("");

  const consultarCNPJ = async () => {
    const limpo = documento.replace(/\D/g, '');
    if (limpo.length !== 14) return alert("CNPJ inválido. Digite 14 números.");
    try {
      setLoading(true);
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${limpo}`);
      const data = await res.json();
      
      if (data.nome_fantasia || data.razao_social) {
        setSalonName(data.nome_fantasia || data.razao_social);
      }
      
      if (data.cep) {
        setCep(data.cep);
        buscarCEP(data.cep);
        setNumero(data.numero || "");
      }
    } catch (e) {
      alert("Erro ao consultar CNPJ. Verifique se o número está correto.");
    } finally {
      setLoading(false);
    }
  };

  const buscarCEP = async (cepInput: string) => {
    const limpo = cepInput.replace(/\D/g, '');
    if (limpo.length !== 8) return;
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cep/v1/${limpo}`);
      const data = await res.json();
      if (data.street) setEndereco(data.street);
      if (data.neighborhood) setBairro(data.neighborhood);
      if (data.city) setCidade(data.city);
      if (data.state) setEstado(data.state);
    } catch (e) {
      console.error(e);
    }
  };

  const next = async () => {
    if (loading || !catalogLoaded) return; // Anti-double click
    setPaymentError("");
    if (step === 1 && (!salonName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || password.length < 6)) {
      setPaymentError("Preencha o nome do espaço, um e-mail válido e uma senha com pelo menos 6 caracteres."); return;
    }
    if (step === 3 && !services.some(s => s.active)) { setPaymentError("Adicione ao menos um serviço ativo."); return; }
    if (step === 4 && pros.length === 0) { setPaymentError("Adicione ao menos uma profissional."); return; }
    if (step === 5 && !schedule.some(s => s.open)) { setPaymentError("Abra ao menos um dia de atendimento."); return; }
    if (step === 6 && depositPolicy !== "none" && (!pixKey.trim() || !Number.isFinite(parseCurrency(depositValue)) || parseCurrency(depositValue) <= 0 || (depositType === "percentage" && parseCurrency(depositValue) > 100))) {
      setPaymentError("Informe a chave Pix e um sinal positivo. O percentual deve ser de até 100%."); return;
    }
    if (step < 8) {
      setStep(s => s + 1);
    } else {
      setLoading(true);
      setPaymentError("");
      try {
        const payload = {
          salonName,
          email: email.trim().toLowerCase(),
          password,
          document: documento,
          phone,
          address: { zipCode: cep, street: endereco, number: numero, district: bairro, city: cidade, state: estado.toUpperCase() },
          instagram,
          pixName: pixName.trim() || salonName,
          depositPolicy,
          depositType,
          depositValue: parseCurrency(depositValue),
          services: services.filter(s => s.active),
          professionals: pros,
          schedule: schedule,
          pixKey: ["cpf", "cnpj"].includes(pixType) ? pixKey.replace(/\D/g, "") : pixType === "celular" ? (pixKey.startsWith("+") ? "+" + pixKey.replace(/\D/g, "") : "+55" + pixKey.replace(/\D/g, "")) : pixKey.trim(),
          logo,
          cover,
          gallery,
          mainColor,
          planId: selectedPlanId
        };

        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/public/onboarding`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          localStorage.setItem('token', data.token);
          localStorage.setItem('hasUsedTrial', 'true');
          localStorage.setItem('role', data.user?.role || 'owner');
          localStorage.setItem('userName', data.user?.name || salonName);
          if (data.user?.salonSlug) {
            localStorage.setItem('salonSlug', data.user.salonSlug);
          }
          setDone(true);
        } else {
          const errData = await res.json().catch(()=>({}));
          if (res.status === 409) {
            setPaymentError(errData.error || 'Este CPF/CNPJ ou e-mail já possui uma conta cadastrada. Faça login para continuar.');
          } else if (res.status === 403) {
            setPaymentError(errData.error || 'Não foi possível selecionar este plano no momento. Escolha outro plano.');
          } else if (res.status === 402) {
            setPaymentError('Não foi possível concluir o cadastro. Revise os dados.');
          } else {
            setPaymentError(errData.error || 'Não conseguimos concluir o cadastro neste momento. Tente novamente em instantes.');
          }
        }
      } catch (e) {
        setPaymentError('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
      } finally {
        setLoading(false);
      }
    }
  };
  const back = () => step > 1 && setStep(s => s - 1);
  const currentStep = STEPS[step - 1];

  if (done) {
    return (
      <div className="min-h-full bg-background flex flex-col items-center justify-center px-5 py-16 text-center">
        <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-12 h-12 text-emerald-600" />
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-medium mb-3">
          {salonName} está pronto!
        </h1>
        <p className="text-muted-foreground text-lg mb-2">
          Seu salão está pronto para receber agendamentos.
        </p>
        <div className="flex items-center gap-2 bg-secondary border border-border rounded-xl px-4 py-2 mb-8 text-sm font-mono">
          <Globe className="w-4 h-4 text-primary" />
          <span className="text-primary font-semibold">{window.location.origin}/agendar/{localStorage.getItem('salonSlug') || salonName.toLowerCase().replace(/\s/g, "-")}</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <Button size="lg" onClick={() => navigate(`/agendar/${localStorage.getItem('salonSlug') || salonName.toLowerCase().replace(/\s/g, "-")}`)}>
            <Globe className="w-4 h-4" /> Ver página do salão
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/admin')}>
            Ver painel do salão
          </Button>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 max-w-xl w-full">
          {[
            { icon: Globe, title: "Sua página pública", desc: "Compartilhe o link com seus clientes" },
            { icon: Scissors, title: `${services.filter(s => s.active).length} serviços ativos`, desc: "Prontos para agendamento" },
            { icon: UserCheck, title: `${pros.length} profissionais`, desc: "Agenda configurada" },
          ].map(c => (
            <div key={c.title} className="bg-card border border-border rounded-2xl p-4 text-left">
              <c.icon className="w-6 h-6 text-primary mb-2" />
              <div className="font-semibold text-sm">{c.title}</div>
              <div className="text-xs text-muted-foreground mt-1">{c.desc}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur border-b border-border z-10">
        <div className="max-w-2xl mx-auto px-5 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity bg-transparent border-0 p-0 text-left"
              title="Voltar para a página inicial"
            >
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-serif font-bold text-sm text-foreground">BelezaPura</span>
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao site
              </button>
              <span className="text-muted-foreground/40">•</span>
              <div className="text-xs text-muted-foreground">Etapa {step} de {STEPS.length}</div>
            </div>
          </div>
          <StepIndicator current={step} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-8">
        {/* Step header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <currentStep.icon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-medium">{currentStep.label}</h2>
            <p className="text-muted-foreground text-sm">{currentStep.sub}</p>
          </div>
        </div>

        {/* Step 1: Salon data */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex gap-6 mb-2 bg-secondary/50 p-3 rounded-xl border border-border">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                <input type="radio" name="tipo" checked={tipoConta === 'PJ'} onChange={() => setTipoConta('PJ')} className="accent-primary" /> Pessoa Jurídica (CNPJ)
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                <input type="radio" name="tipo" checked={tipoConta === 'PF'} onChange={() => setTipoConta('PF')} className="accent-primary" /> Pessoa Física (CPF)
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">{tipoConta === 'PJ' ? 'CNPJ' : 'CPF'} *</label>
                <div className="flex gap-2">
                  <input
                    value={documento}
                    onChange={e => setDocumento(e.target.value)}
                    placeholder={tipoConta === 'PJ' ? '00.000.000/0000-00' : '000.000.000-00'}
                    className="w-full h-11 rounded-xl border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 bg-card"
                  />
                  {tipoConta === 'PJ' && (
                    <Button type="button" onClick={consultarCNPJ} disabled={loading} className="shrink-0 h-11 px-4">Consultar</Button>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Nome do seu espaço *</label>
                <input
                  value={salonName}
                  onChange={e => setSalonName(e.target.value)}
                  placeholder="Ex: Studio Bella Estética"
                  className="w-full h-11 rounded-xl border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 bg-card"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">E-mail (Seu login) *</label>
                <input 
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com" 
                  className="w-full h-11 rounded-xl border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 bg-card" 
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Senha *</label>
                <input 
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres" 
                  className="w-full h-11 rounded-xl border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 bg-card" 
                />
              </div>
            </div>

            <label className="block text-sm font-medium">Telefone do espaço
              <input value={phone} onChange={e => setPhone(e.target.value)} aria-label="Telefone do espaço" placeholder="(11) 99999-9999" className="w-full h-11 mt-1 rounded-xl border border-border px-3 text-sm bg-card" />
            </label>

            <div className="pt-2 border-t border-border mt-2">
              <h3 className="text-sm font-semibold mb-3">Endereço</h3>
              <div className="grid sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5">CEP</label>
                  <input 
                    value={cep} 
                    onChange={e => {
                      setCep(e.target.value); 
                      if(e.target.value.replace(/\D/g, '').length === 8) buscarCEP(e.target.value);
                    }} 
                    onBlur={e => buscarCEP(e.target.value)} 
                    placeholder="00000-000" 
                    className="w-full h-11 rounded-xl border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 bg-card" 
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium block mb-1.5">Logradouro</label>
                  <input value={endereco} onChange={e => setEndereco(e.target.value)} placeholder="Rua, Avenida..." className="w-full h-11 rounded-xl border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 bg-card" />
                </div>
              </div>

              <div className="grid sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5">Número</label>
                  <input value={numero} onChange={e => setNumero(e.target.value)} placeholder="123" className="w-full h-11 rounded-xl border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 bg-card" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Bairro</label>
                  <input value={bairro} onChange={e => setBairro(e.target.value)} placeholder="Bairro" className="w-full h-11 rounded-xl border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 bg-card" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Cidade</label>
                  <input value={cidade} onChange={e => setCidade(e.target.value)} placeholder="Cidade" className="w-full h-11 rounded-xl border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 bg-card" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">UF</label>
                  <input value={estado} onChange={e => setEstado(e.target.value)} placeholder="SP" className="w-full h-11 rounded-xl border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 bg-card" />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-border mt-2">
              <div>
                <label className="text-sm font-medium block mb-1.5">Instagram</label>
                <input value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@seusalao" className="w-full h-11 rounded-xl border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 bg-card" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Categoria principal</label>
                <select className="w-full h-11 rounded-xl border border-border px-3 text-sm outline-none focus:border-primary bg-card appearance-none">
                  <option>Estética</option>
                  <option>Nail Designer / Manicure</option>
                  <option>Studio de Bronzeamento</option>
                  <option>Salão de beleza</option>
                  <option>SPA</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Logo & photos */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium block mb-2">Logo do salão</label>
              <label className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary/40 transition-colors cursor-pointer bg-muted/30 block relative overflow-hidden">
                <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, setLogo)} />
                {logo ? (
                  <img src={logo} alt="Logo" className="absolute inset-0 w-full h-full object-contain bg-white" />
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="w-7 h-7 text-primary" />
                    </div>
                    <p className="text-sm font-medium mb-1">Clique para enviar sua logo</p>
                    <p className="text-xs text-muted-foreground">PNG ou SVG recomendado · até 5MB</p>
                  </>
                )}
              </label>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Foto de capa</label>
              <label className="border-2 border-dashed border-border rounded-2xl overflow-hidden cursor-pointer hover:border-primary/40 transition-colors relative h-44 bg-muted/30 group block">
                <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, setCover, PRESETS.cover)} />
                {cover ? (
                  <>
                    <img
                      src={cover}
                      alt="Capa"
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-90 transition-opacity"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <div className="bg-white/90 rounded-xl px-4 py-2 flex items-center gap-2 text-sm font-medium shadow text-black">
                        <Upload className="w-4 h-4 text-primary" /> Trocar foto de capa
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <Upload className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-sm font-medium">Clique para enviar a foto de capa</p>
                    <p className="text-xs text-muted-foreground">Recomendado 1000x500 · Fachada ou interior do salão</p>
                  </div>
                )}
              </label>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Galeria do salão (Máximo 6)</label>
                {gallery.length < 6 && (
                  <label className="text-xs text-primary font-medium flex items-center gap-1 cursor-pointer">
                    <Plus className="w-3 h-3" /> Adicionar foto
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, (base64) => setGallery([...gallery, base64]))} />
                  </label>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {gallery.map((img, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden relative group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => setGallery(gallery.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {gallery.length < 6 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/40 transition-colors bg-muted/30">
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, (base64) => setGallery([...gallery, base64]))} />
                    <Plus className="w-5 h-5 text-muted-foreground" />
                  </label>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Cor principal da sua página</label>
              <div className="flex gap-3 flex-wrap">
                {[
                  { color: "#B83E58", label: "Marsala Rose" },
                  { color: "#C5A059", label: "Champagne Dourado" },
                  { color: "#B8614A", label: "Terracota" },
                  { color: "#9B7EA8", label: "Lavanda" },
                  { color: "#5B8DB8", label: "Azul Seda" },
                  { color: "#7DC198", label: "Sálvia" },
                  { color: "#292524", label: "Espresso" },
                ].map(c => (
                  <button key={c.color} onClick={() => setMainColor(c.color)} title={c.label} className={`w-9 h-9 rounded-full border-3 hover:scale-110 transition-transform shadow-sm ${c.color === mainColor ? "ring-2 ring-offset-2 ring-primary" : ""}`}
                    style={{ background: c.color, borderColor: "white", borderWidth: 3 }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Services */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Adicione os serviços que seu salão oferece. Você poderá editar depois.</p>

            <div className="space-y-2">
              {services.map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-card border border-border rounded-2xl">
                  <button
                    onClick={() => setServices(prev => prev.map((sv, j) => j === i ? { ...sv, active: !sv.active } : sv))}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${s.active ? "bg-primary border-primary" : "border-border"}`}
                  >
                    {s.active && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.cat} · {formatDurationDisplay(s.duration)}</div>
                  </div>
                  <span className="text-primary font-semibold text-sm">{formatCurrency(s.price)}</span>
                  <button onClick={() => setServices(prev => prev.filter((_, j) => j !== i))} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4 text-muted-foreground" /></button>
                </div>
              ))}
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><Plus className="w-4 h-4 text-primary" /> Adicionar serviço</h4>
              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                <input value={newServiceName} onChange={e => setNewServiceName(e.target.value)} placeholder="Nome do serviço" className="h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-card" />
                <select value={newServiceCat} onChange={e => setNewServiceCat(e.target.value)} className="h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-card appearance-none">
                  {serviceCategories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <label className="text-xs font-medium space-y-1"><span>Duração (horas:minutos)</span><DurationInput value={newServiceDur} onValueChange={setNewServiceDur} aria-label="Duração do serviço" className="h-10 rounded-lg border border-border px-3 text-sm bg-card" /></label>
                <label className="text-xs font-medium space-y-1"><span>Preço do serviço</span><CurrencyInput value={newServicePrice} onValueChange={setNewServicePrice} aria-label="Preço do serviço" placeholder="0,00" className="h-10 rounded-lg border border-border px-3 text-sm bg-card" /></label>
                <Button size="sm" className="h-10" onClick={() => {
                  if (newServiceName.trim() && parseCurrency(newServicePrice) > 0 && parseDuration(newServiceDur) > 0 && newServiceDur) {
                    setServices(prev => [...prev, { name: newServiceName, cat: newServiceCat, duration: newServiceDur, price: parseCurrency(newServicePrice).toFixed(2).replace(".", ","), active: true }]);
                    setNewServiceName("");
                    setNewServiceDur("");
                    setNewServicePrice("");
                  }
                }}>Adicionar</Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Professionals */}
        {step === 4 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Cadastre os profissionais que irão atender seus clientes.</p>

            <div className="space-y-2">
              {pros.map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-card border border-border rounded-2xl">
                  <Avatar name={p.name} size="md" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.specialty}</div>
                  </div>
                  <Badge variant="success">Ativo</Badge>
                  <button onClick={() => setPros(prev => prev.filter((_, j) => j !== i))} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4 text-muted-foreground" /></button>
                </div>
              ))}
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><Plus className="w-4 h-4 text-primary" /> Adicionar profissional</h4>
              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                <input value={newProName} onChange={e => setNewProName(e.target.value)} placeholder="Nome completo" className="h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-card" />
                <input value={newProSpec} onChange={e => setNewProSpec(e.target.value)} placeholder="Especialidade" className="h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-card" />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <input value={newProPhone} onChange={e => setNewProPhone(e.target.value)} placeholder="Telefone / WhatsApp" className="h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-card" />
                <Button size="sm" className="h-10" onClick={() => {
                  if (newProName) {
                    setPros(prev => [...prev, { name: newProName, specialty: newProSpec, phone: newProPhone, active: true }]);
                    setNewProName("");
                    setNewProSpec("");
                    setNewProPhone("");
                  }
                }}>Adicionar</Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Schedule */}
        {step === 5 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">Configure os horários de funcionamento do seu salão.</p>
            {schedule.map((s, i) => (
              <div key={s.day} className="flex flex-wrap items-center gap-3 p-3 bg-card border border-border rounded-xl">
                <button
                  onClick={() => setSchedule(prev => prev.map((d, j) => j === i ? { ...d, open: !d.open } : d))}
                  className={`shrink-0 w-10 h-5 rounded-full transition-all relative ${s.open ? "bg-primary" : "bg-muted"}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${s.open ? "left-5" : "left-0.5"}`} />
                </button>
                <span className={`text-sm font-medium w-20 ${s.open ? "text-foreground" : "text-muted-foreground"}`}>{s.day}</span>
                {s.open ? (
                  <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 w-full sm:w-auto sm:ml-auto">
                    <input type="time" aria-label={`Abertura ${s.day}`} value={s.start} onChange={e => setSchedule(prev => prev.map((d, j) => j === i ? { ...d, start: e.target.value } : d))} className="w-full min-w-0 h-10 px-2 rounded-lg border border-border text-sm bg-card" />
                    <span className="text-muted-foreground text-sm">até</span>
                    <input type="time" aria-label={`Fechamento ${s.day}`} value={s.end} onChange={e => setSchedule(prev => prev.map((d, j) => j === i ? { ...d, end: e.target.value } : d))} className="w-full min-w-0 h-10 px-2 rounded-lg border border-border text-sm bg-card" />
                  </div>
                ) : (
                  <span className="ml-auto text-xs text-muted-foreground">Fechado</span>
                )}
              </div>
            ))}
            <div className="mt-4 p-3 bg-secondary rounded-xl text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Consulta de horários:</span>{" "}
              <span>30 minutos, respeitando a duração do serviço e o expediente.</span>
            </div>
          </div>
        )}

        {/* Step 6: PIX */}
        {step === 6 && (
          <div className="space-y-5">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-sm text-emerald-800">
              <strong>Por que configurar o PIX?</strong>
              <p className="mt-1 text-emerald-700">Seus clientes poderão pagar um sinal para garantir o horário. Você recebe direto na sua conta, sem intermediários.</p>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Tipo de chave PIX</label>
              <div className="grid grid-cols-4 gap-2">
                {["CPF", "CNPJ", "E-mail", "Celular", "Aleatória"].map(t => (
                  <button
                    key={t}
                    onClick={() => setPixType(t.toLowerCase())}
                    className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${pixType === t.toLowerCase() ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/30 bg-card"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Chave PIX ({pixType})</label>
              <input
                value={pixKey}
                onChange={e => setPixKey(e.target.value)}
                placeholder={pixType === "cpf" ? "000.000.000-00" : pixType === "cnpj" ? "00.000.000/0000-00" : pixType === "e-mail" ? "seu@email.com" : pixType === "aleatória" ? "Chave aleatória cadastrada no seu banco" : "(11) 99999-0000"}
                className="w-full h-11 rounded-xl border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 bg-card font-mono"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Nome do favorecido (como aparece no PIX)</label>
              <input value={pixName} placeholder={salonName} onChange={e => setPixName(e.target.value)} aria-label="Nome do favorecido Pix" className="w-full h-11 rounded-xl border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 bg-card" />
            </div>

            <div className="bg-secondary rounded-2xl p-4 space-y-3">
              <div className="font-medium text-sm">Configurar sinal de reserva</div>
              <label className="block text-xs">Tipo do sinal
                <select aria-label="Tipo do sinal" value={depositType} onChange={e => { setDepositType(e.target.value); setDepositValue(e.target.value === "percentage" ? "20" : "30"); }} className="w-full h-9 rounded-lg border border-border px-3 mt-1 bg-card">
                  <option value="percentage">Percentual do serviço (%)</option>
                  <option value="fixed">Valor fixo (R$)</option>
                </select>
              </label>
              <p className="text-xs text-muted-foreground">O sinal é descontado do atendimento e nunca supera o preço do serviço. Você confere o recebimento no banco e confirma no painel.</p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-1">Valor do sinal</div>
                  {depositType === "fixed" ? <CurrencyInput aria-label="Valor do sinal" required value={depositValue} onValueChange={setDepositValue} className="h-10 rounded-lg border border-border px-3 text-sm bg-card" /> : <input type="number" min="0.01" max="100" step="0.01" value={depositValue} onChange={e => setDepositValue(e.target.value)} aria-label="Valor do sinal" inputMode="decimal" className="w-full h-9 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-card" />}
                </div>
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-1">Exigir sinal?</div>
                  <select value={depositPolicy} onChange={e => setDepositPolicy(e.target.value)} aria-label="Exigir sinal" className="w-full h-9 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-card appearance-none">
                    <option value="required">Sim, obrigatório</option>
                    <option value="optional">Opcional</option>
                    <option value="none">Não exigir</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 7: Publish */}
        {step === 7 && (
          <div className="space-y-5">
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <h3 className="font-semibold">Resumo do seu salão</h3>
              <div className="space-y-3">
                {[
                  { label: "Nome", value: salonName, icon: Store, ok: true },
                  { label: "Serviços", value: `${services.filter(s => s.active).length} configurados`, icon: Scissors, ok: services.filter(s => s.active).length > 0 },
                  { label: "Profissionais", value: `${pros.length} cadastrados`, icon: UserCheck, ok: pros.length > 0 },
                  { label: "Horários", value: `${schedule.filter(s => s.open).length} dias configurados`, icon: Clock, ok: true },
                  { label: "PIX", value: pixKey ? "Configurado" : "Pendente", icon: CreditCard, ok: !!pixKey },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.ok ? "bg-emerald-100" : "bg-amber-100"}`}>
                      {item.ok ? <Check className="w-4 h-4 text-emerald-600" /> : <item.icon className="w-4 h-4 text-amber-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.value}</div>
                    </div>
                    <Badge variant={item.ok ? "success" : "warning"}>{item.ok ? "Pronto" : "Pendente"}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-secondary rounded-2xl p-4 text-sm">
              Seu link exclusivo será gerado ao concluir o cadastro. Depois, você poderá copiá-lo na página do salão.
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-sm text-primary/80">
              <strong className="text-primary">Tudo pronto para publicar!</strong>
              <p className="mt-1">Após publicar, seus clientes já poderão acessar sua página e fazer agendamentos diretamente pelo link.</p>
            </div>
          </div>
        )}

        {/* Step 8: Assinatura */}
        {step === 8 && (() => {
          const currentPlan = planCatalog.find(p => p.id === selectedPlanId || p.name.toLowerCase() === selectedPlanId) || planCatalog[0];
          return (
            <div className="space-y-6">
              <div className="text-center mb-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> Setup quase finalizado
                </div>
                <h3 className="font-bold text-2xl tracking-tight text-foreground">Comece seus 14 dias grátis</h3>
                <p className="text-muted-foreground text-xs sm:text-sm max-w-md mx-auto mt-1">
                  Teste os recursos disponíveis no seu plano por 14 dias, sem cartão. Para continuar, solicite a assinatura e aguarde a conferência manual do pagamento.
                </p>
              </div>

              {/* Seletor rápido de planos */}
              <div className="grid grid-cols-3 gap-2 p-1.5 bg-muted/60 rounded-2xl border border-border">
                {planCatalog.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlanId(p.id)}
                    className={`py-2 px-1 text-center rounded-xl transition-all cursor-pointer ${
                      selectedPlanId === p.id 
                        ? "bg-card text-foreground font-bold shadow-sm border border-border/80" 
                        : "text-muted-foreground hover:text-foreground text-xs"
                    }`}
                  >
                    <div className="text-xs sm:text-sm leading-tight">{p.name}</div>
                    <div className="text-[11px] font-mono text-primary font-semibold">{p.price}</div>
                  </button>
                ))}
              </div>

              {/* Detalhes do plano ativo */}
              <div className="rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5 sm:p-6 shadow-lg shadow-primary/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg sm:text-xl text-foreground">Plano {currentPlan.name}</span>
                      {currentPlan.badge && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-primary text-white px-2 py-0.5 rounded-full shadow-sm">
                          {currentPlan.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{currentPlan.desc}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-2xl sm:text-3xl font-black text-foreground font-mono">{currentPlan.price}</span>
                    <span className="text-xs text-muted-foreground font-medium">{currentPlan.period}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold py-1 px-3 rounded-lg">
                    🎁 14 Dias de Demonstração Gratuita Inclusos
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    Assinatura de {currentPlan.price} por mês, somente se você solicitar e o administrador confirmar o pagamento. Sem débito automático.
                  </p>
                </div>

                <ul className="space-y-2 mb-2 pt-3 border-t border-border/50">
                  {currentPlan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs sm:text-sm text-foreground/90">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-card rounded-2xl p-5 border space-y-3">
                <h3 className="font-semibold">14 dias para testar, sem cartão</h3>
                <p className="text-sm text-muted-foreground">Ao concluir, seu salão inicia o período gratuito. A assinatura é solicitada no painel e liberada após a conferência manual do pagamento pelo administrador. Não há débito automático.</p>
                {paymentError && <p role="alert" className="text-red-600">{paymentError}</p>}
              </div>
            </div>
          );
        })()}

        {paymentError && step !== 8 && <p role="alert" className="mt-4 text-sm text-red-600">{paymentError}</p>}
        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          {step === 1 ? (
            <Button variant="ghost" onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-1" /> Voltar ao site
            </Button>
          ) : (
            <Button variant="ghost" onClick={back}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
            </Button>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{step} / {STEPS.length}</span>
            {catalogError && <p role="alert">{catalogError}</p>}
            <Button onClick={next} disabled={loading || !catalogLoaded}>
              {step === 8 ? (
                <><Sparkles className="w-4 h-4 mr-1" /> {loading ? "Processando..." : "Iniciar teste gratuito"}</>
              ) : (
                <>Continuar <ArrowRight className="w-4 h-4 ml-1" /></>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
