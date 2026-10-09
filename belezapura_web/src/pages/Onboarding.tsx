import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Store, Image, Scissors, UserCheck, Clock, CreditCard, Globe,
  Check, ArrowRight, ArrowLeft, Sparkles, Upload, Plus, X, ChevronRight, Lock
} from "lucide-react";
import { Button, Badge, Avatar } from "@/components/ui";

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

const defaultServices: any[] = [];
const defaultPros: any[] = [];

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
    <div className="flex items-center gap-0">
      {STEPS.map((s, i) => (
        <div key={s.id} className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-all ${
            s.id < current ? "bg-emerald-500 text-white" :
            s.id === current ? "bg-primary text-primary-foreground shadow-md" :
            "bg-muted text-muted-foreground"
          }`}>
            {s.id < current ? <Check className="w-4 h-4" /> : s.id}
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-0.5 w-8 mx-0.5 transition-all ${s.id < current ? "bg-emerald-400" : "bg-border"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new window.Image();
    img.src = event.target?.result as string;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const MAX_SIZE = 800;
      let width = img.width;
      let height = img.height;
      if (width > height && width > MAX_SIZE) {
        height *= MAX_SIZE / width;
        width = MAX_SIZE;
      } else if (height > MAX_SIZE) {
        width *= MAX_SIZE / height;
        height = MAX_SIZE;
      }
      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
      callback(dataUrl);
    };
  };
  reader.readAsDataURL(file);
};

export default function Onboarding({ onFinish }: { onFinish: () => void }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const planId = searchParams.get("planId");

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
  const [cover, setCover] = useState<string>("https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=300&fit=crop&auto=format");
  const [gallery, setGallery] = useState<string[]>([
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&h=200&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=200&h=200&fit=crop&auto=format"
  ]);
  const [mainColor, setMainColor] = useState<string>("#B8614A");

  const [tipoConta, setTipoConta] = useState("PJ");
  const [documento, setDocumento] = useState("");
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
    if (step < 8) {
      setStep(s => s + 1);
    } else {
      setLoading(true);
      try {
        const payload = {
          salonName,
          email,
          password,
          services: services.filter(s => s.active),
          professionals: pros,
          schedule: schedule.filter(s => s.open),
          pixKey,
          logo,
          cover,
          gallery,
          mainColor,
          planId
        };

        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/public/onboarding`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          localStorage.setItem('token', data.token);
          if (data.user?.salonSlug) {
            localStorage.setItem('salonSlug', data.user.salonSlug);
          }
          if (data.user?.role) {
            localStorage.setItem('role', data.user.role);
          }
          setDone(true);
        } else {
          if (res.status === 402) {
            setPaymentError('O pagamento não foi autorizado pela operadora. Verifique os dados ou utilize outro cartão.');
          } else {
            const errData = await res.json().catch(()=>({}));
            setPaymentError(errData.error || 'Não conseguimos concluir o pagamento neste momento. Tente novamente em alguns instantes.');
          }
        }
      } catch (e) {
        setPaymentError('Não foi possível conectar ao serviço de pagamento. Verifique sua conexão e tente novamente.');
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
              <span className="font-serif font-medium text-sm">beautyOS</span>
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
                <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, setCover)} />
                <img
                  src={cover}
                  alt="Capa"
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-70 transition-opacity"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <div className="bg-white/80 rounded-xl px-4 py-2 flex items-center gap-2 text-sm font-medium shadow text-black">
                    <Upload className="w-4 h-4 text-primary" /> Trocar foto de capa
                  </div>
                </div>
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
                  { color: "#B8614A", label: "Terracota" },
                  { color: "#9B7EA8", label: "Lavanda" },
                  { color: "#5B8DB8", label: "Azul" },
                  { color: "#7DC198", label: "Verde" },
                  { color: "#E87B4A", label: "Laranja" },
                  { color: "#3D3D3D", label: "Carvão" },
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
        {step === 8 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="font-serif text-2xl font-medium">Assine e comece a faturar</h3>
              <p className="text-muted-foreground text-sm">Falta pouco para liberar seu painel completo.</p>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-lg text-primary">Plano Escolhido</span>
                <span className="font-serif text-2xl font-medium text-foreground">
                  {planId === '2' ? 'R$ 97/mês' : planId === '3' ? 'R$ 197/mês' : 'Básico'}
                </span>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-emerald-500" /> Agenda online 24h (Página web)</li>
                <li className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-emerald-500" /> Cobrança via PIX (Sinal)</li>
                <li className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-emerald-500" /> Painel de gestão inteligente</li>
              </ul>
              
              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="text-sm font-medium mb-3">Cartão de Crédito</div>
                {paymentError && (
                  <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg">
                    {paymentError}
                  </div>
                )}
                <div className="space-y-3">
                  <input 
                    placeholder="0000 0000 0000 0000" 
                    maxLength={19}
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 '))}
                    className="w-full h-11 rounded-lg border border-border px-3 text-sm bg-background transition-colors focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
                  />
                  <div className="flex gap-3">
                    <input 
                      placeholder="MM/AA" 
                      maxLength={5}
                      value={cardExp}
                      onChange={e => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length > 2) val = val.substring(0,2) + '/' + val.substring(2);
                        setCardExp(val);
                      }}
                      className="flex-1 h-11 rounded-lg border border-border px-3 text-sm bg-background transition-colors focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
                    />
                    <input 
                      placeholder="CVC" 
                      maxLength={4}
                      value={cardCvc}
                      onChange={e => setCardCvc(e.target.value.replace(/\D/g, ''))}
                      className="w-24 min-w-[80px] h-11 rounded-lg border border-border px-3 text-sm bg-background text-center transition-colors focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
                    />
                  </div>
                  <input 
                    placeholder="Nome impresso no cartão" 
                    value={cardName}
                    onChange={e => setCardName(e.target.value)}
                    className="w-full h-11 rounded-lg border border-border px-3 text-sm bg-background uppercase transition-colors focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
                  />
                </div>
              </div>
            </div>
          </div>
        )}

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
