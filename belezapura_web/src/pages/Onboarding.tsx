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
      "Lembretes automáticos para clientes",
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
    desc: "Para salões e barbearias em equipe (até 5 profissionais)",
    features: [
      "Tudo do Essencial",
      "Até 5 profissionais com acessos individuais",
      "Divisão e cálculo automático de comissões",
      "Painel financeiro com controle de entradas",
      "Lembretes anti-no show no WhatsApp",
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
      "Automação completa no WhatsApp",
      "Fidelização e mensagens de retorno",
      "Controle de estoque e produtos",
      "Multi-unidades (filiais)",
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
    return "studio"; // Padrão Studio com 14 dias grátis
  });

  const [step, setStep] = useState(1);
  const [salonName, setSalonName] = useState("Meu Salão");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [services, setServices] = useState(defaultServices);
  const [pros, setPros] = useState(defaultPros);
  const [schedule, setSchedule] = useState(defaultSchedule);
  const [pixKey, setPixKey] = useState("");
  const [pixType, setPixType] = useState("cpf");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceCat, setNewServiceCat] = useState("Cabelo");
  const [newServiceDur, setNewServiceDur] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");

  const [newProName, setNewProName] = useState("");
  const [newProSpec, setNewProSpec] = useState("");

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

  const [cardNumber, setCardNumber] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");
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
    if (loading) return; // Anti-double click
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
          services: services.filter(s => s.active),
          professionals: pros,
          schedule: schedule.filter(s => s.open),
          pixKey,
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
            setPaymentError('O cartão informado não foi autorizado. Verifique os dados ou utilize outro cartão.');
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
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-serif font-bold text-sm text-foreground">BelezaPura</span>
            </div>
            <div className="text-xs text-muted-foreground">Etapa {step} de {STEPS.length}</div>
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
                <label className="text-sm font-medium block mb-1.5">Nome do salão *</label>
                <input
                  value={salonName}
                  onChange={e => setSalonName(e.target.value)}
                  placeholder="Nome do seu negócio"
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
                <input placeholder="@seusalao" className="w-full h-11 rounded-xl border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 bg-card" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Categoria principal</label>
                <select className="w-full h-11 rounded-xl border border-border px-3 text-sm outline-none focus:border-primary bg-card appearance-none">
                  <option>Salão de beleza</option>
                  <option>Estética</option>
                  <option>Manicure</option>
                  <option>SPA</option>
                  <option>Barbearia</option>
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
                    <div className="text-xs text-muted-foreground">{s.cat} · {s.duration}</div>
                  </div>
                  <span className="text-primary font-semibold text-sm">{s.price}</span>
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
              <div className="grid grid-cols-3 gap-3">
                <input value={newServiceDur} onChange={e => setNewServiceDur(e.target.value)} placeholder="Duração" className="h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-card" />
                <input value={newServicePrice} onChange={e => setNewServicePrice(e.target.value)} placeholder="Preço" className="h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-card" />
                <Button size="sm" className="h-10" onClick={() => {
                  if (newServiceName && newServicePrice) {
                    setServices(prev => [...prev, { name: newServiceName, cat: newServiceCat, duration: newServiceDur || "60 min", price: newServicePrice, active: true }]);
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
                <input placeholder="Telefone / WhatsApp" className="h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-card" />
                <Button size="sm" className="h-10" onClick={() => {
                  if (newProName) {
                    setPros(prev => [...prev, { name: newProName, specialty: newProSpec, active: true }]);
                    setNewProName("");
                    setNewProSpec("");
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
              <div key={s.day} className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
                <button
                  onClick={() => setSchedule(prev => prev.map((d, j) => j === i ? { ...d, open: !d.open } : d))}
                  className={`w-10 h-5 rounded-full transition-all relative ${s.open ? "bg-primary" : "bg-muted"}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${s.open ? "left-5" : "left-0.5"}`} />
                </button>
                <span className={`text-sm font-medium w-20 ${s.open ? "text-foreground" : "text-muted-foreground"}`}>{s.day}</span>
                {s.open ? (
                  <div className="flex items-center gap-2 ml-auto">
                    <select defaultValue={s.start} className="h-8 px-2 rounded-lg border border-border text-sm outline-none focus:border-primary bg-card appearance-none">
                      {["07:00", "08:00", "09:00", "10:00"].map(t => <option key={t}>{t}</option>)}
                    </select>
                    <span className="text-muted-foreground text-sm">até</span>
                    <select defaultValue={s.end} className="h-8 px-2 rounded-lg border border-border text-sm outline-none focus:border-primary bg-card appearance-none">
                      {["17:00", "18:00", "19:00", "20:00", "21:00"].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                ) : (
                  <span className="ml-auto text-xs text-muted-foreground">Fechado</span>
                )}
              </div>
            ))}
            <div className="mt-4 p-3 bg-secondary rounded-xl text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Intervalo de agendamento:</span>{" "}
              <select className="bg-transparent border-b border-border outline-none ml-1 text-foreground cursor-pointer">
                <option>30 minutos</option>
                <option>15 minutos</option>
                <option>60 minutos</option>
              </select>
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
                {["CPF", "CNPJ", "E-mail", "Celular"].map(t => (
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
                placeholder={pixType === "cpf" ? "000.000.000-00" : pixType === "cnpj" ? "00.000.000/0000-00" : pixType === "e-mail" ? "seu@email.com" : "(11) 99999-0000"}
                className="w-full h-11 rounded-xl border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 bg-card font-mono"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Nome do favorecido (como aparece no PIX)</label>
              <input defaultValue={salonName} className="w-full h-11 rounded-xl border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 bg-card" />
            </div>

            <div className="bg-secondary rounded-2xl p-4 space-y-3">
              <div className="font-medium text-sm">Configurar sinal de reserva</div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-1">Valor do sinal</div>
                  <input defaultValue="R$ 30,00" className="w-full h-9 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-card" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-1">Exigir sinal?</div>
                  <select className="w-full h-9 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-card appearance-none">
                    <option>Sim, obrigatório</option>
                    <option>Opcional</option>
                    <option>Não exigir</option>
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

            <div className="bg-secondary rounded-2xl p-4">
              <div className="text-sm font-medium mb-2">Seu link de agendamento</div>
              <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2">
                <Globe className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm font-mono text-muted-foreground flex-1 truncate">
                  <span className="text-primary font-semibold">{window.location.origin}/agendar/{salonName.toLowerCase().replace(/\s/g, "-")}</span>
                </span>
                <button onClick={() => {
                  const slug = salonName.toLowerCase().replace(/\s/g, "-");
                  const link = `${window.location.origin}/agendar/${slug}`;
                  navigator.clipboard.writeText(link);
                  alert("Link copiado: " + link);
                }} className="text-xs text-primary font-medium hover:underline shrink-0">Copiar</button>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-sm text-primary/80">
              <strong className="text-primary">Tudo pronto para publicar!</strong>
              <p className="mt-1">Após publicar, seus clientes já poderão acessar sua página e fazer agendamentos diretamente pelo link.</p>
            </div>
          </div>
        )}

        {/* Step 8: Assinatura */}
        {step === 8 && (() => {
          const currentPlan = ONBOARDING_PLANS.find(p => p.id === selectedPlanId) || ONBOARDING_PLANS[1];
          return (
            <div className="space-y-6">
              <div className="text-center mb-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> Setup quase finalizado
                </div>
                <h3 className="font-bold text-2xl tracking-tight text-foreground">Comece seus 14 dias grátis</h3>
                <p className="text-muted-foreground text-xs sm:text-sm max-w-md mx-auto mt-1">
                  Teste todas as funcionalidades sem compromisso. Cancele com 1 clique antes do 15º dia e nada será cobrado.
                </p>
              </div>

              {/* Seletor rápido de planos */}
              <div className="grid grid-cols-3 gap-2 p-1.5 bg-muted/60 rounded-2xl border border-border">
                {ONBOARDING_PLANS.map(p => (
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
                    Cobrança no valor de {currentPlan.price} somente após 14 dias se você decidir continuar.
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

              {/* Formulário do Cartão 100% alinhado */}
              <div className="bg-card rounded-2xl p-4 sm:p-5 border border-border shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary" /> Dados do Cartão para o Trial
                  </span>
                  <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded font-medium">Anti-bot</span>
                </div>

                {paymentError && (
                  <div className="mb-4 p-3 text-xs font-medium text-red-700 bg-red-100 border border-red-200 rounded-xl">
                    {paymentError}
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">Número do cartão</label>
                    <input 
                      placeholder="0000 0000 0000 0000" 
                      maxLength={19}
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 '))}
                      className="w-full h-11 rounded-xl border border-border px-3 text-sm bg-background transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-mono" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="min-w-0">
                      <label className="text-[11px] font-medium text-muted-foreground block mb-1">Validade (MM/AA)</label>
                      <input 
                        placeholder="MM/AA" 
                        maxLength={5}
                        value={cardExp}
                        onChange={e => {
                          let val = e.target.value.replace(/\D/g, '');
                          if (val.length > 2) val = val.substring(0,2) + '/' + val.substring(2);
                          setCardExp(val);
                        }}
                        className="w-full h-11 rounded-xl border border-border px-3 text-sm bg-background text-center transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-mono" 
                      />
                    </div>
                    <div className="min-w-0">
                      <label className="text-[11px] font-medium text-muted-foreground block mb-1">CVC / Segurança</label>
                      <input 
                        placeholder="123" 
                        maxLength={4}
                        value={cardCvc}
                        onChange={e => setCardCvc(e.target.value.replace(/\D/g, ''))}
                        className="w-full h-11 rounded-xl border border-border px-3 text-sm bg-background text-center transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-mono" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">Nome impresso no cartão</label>
                    <input 
                      placeholder="NOME COMO NO CARTÃO" 
                      value={cardName}
                      onChange={e => setCardName(e.target.value)}
                      className="w-full h-11 rounded-xl border border-border px-3 text-sm bg-background uppercase transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" 
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mt-4 text-[10px] text-muted-foreground justify-center">
                  <Lock className="w-3 h-3 text-emerald-500" /> Criptografia de 256 bits · Cancelamento sem multa a qualquer momento
                </div>
              </div>
            </div>
          );
        })()}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <Button variant="ghost" onClick={back} disabled={step === 1}>
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{step} / {STEPS.length}</span>
            <Button onClick={next} disabled={loading}>
              {step === 8 ? (
                <><Sparkles className="w-4 h-4" /> {loading ? "Processando..." : "Pagar e Publicar"}</>
              ) : (
                <>Continuar <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
