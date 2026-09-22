import { useState } from "react";
import {
  Store, Image, Scissors, UserCheck, Clock, CreditCard, Globe,
  Check, ArrowRight, ArrowLeft, Sparkles, Upload, Plus, X, ChevronRight
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
];

const serviceCategories = ["Cabelo", "Unhas", "Massagem", "Estética", "Maquiagem", "Sobrancelhas", "Bronzeamento", "Outros"];

const defaultServices = [
  { name: "Manicure", cat: "Unhas", duration: "45 min", price: "R$ 50", active: true },
  { name: "Escova", cat: "Cabelo", duration: "60 min", price: "R$ 80", active: true },
  { name: "Massagem Relaxante", cat: "Massagem", duration: "60 min", price: "R$ 120", active: false },
];

const defaultPros = [
  { name: "Ana Carvalho", specialty: "Cabelos", active: true },
  { name: "Mariana Souza", specialty: "Unhas", active: true },
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

export default function Onboarding({ onFinish }: { onFinish: () => void }) {
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

  const next = async () => {
    if (step < 7) {
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
          pixKey
        };

        const res = await fetch('http://localhost:3050/api/public/onboarding', {
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
          alert('Erro ao criar conta');
        }
      } catch (e) {
        alert('Erro de conexão');
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
          beautyos.app/<span className="text-primary font-semibold">{salonName.toLowerCase().replace(/\s/g, "-")}</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <Button size="lg" onClick={onFinish}>
            <Globe className="w-4 h-4" /> Publicar meu salão
          </Button>
          <Button variant="outline" size="lg" onClick={onFinish}>
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
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Nome do salão *</label>
                <input
                  value={salonName}
                  onChange={e => setSalonName(e.target.value)}
                  className="w-full h-11 rounded-xl border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 bg-card"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Telefone / WhatsApp *</label>
                <input placeholder="(11) 99999-0000" className="w-full h-11 rounded-xl border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 bg-card" />
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
                  placeholder="Sua senha" 
                  className="w-full h-11 rounded-xl border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 bg-card" 
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Descrição curta</label>
              <textarea rows={3} placeholder="Ex: Salão especializado em cabelos e unhas. Atendemos com hora marcada." className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 bg-card resize-none" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Endereço completo</label>
              <input placeholder="Rua, número, bairro, cidade" className="w-full h-11 rounded-xl border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 bg-card" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
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
              <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary/40 transition-colors cursor-pointer bg-muted/30">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-7 h-7 text-primary" />
                </div>
                <p className="text-sm font-medium mb-1">Clique para enviar sua logo</p>
                <p className="text-xs text-muted-foreground">PNG ou SVG recomendado · até 5MB</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Foto de capa</label>
              <div className="border-2 border-dashed border-border rounded-2xl overflow-hidden cursor-pointer hover:border-primary/40 transition-colors relative h-44 bg-muted/30 group">
                <img
                  src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=300&fit=crop&auto=format"
                  alt="Capa"
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-70 transition-opacity"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <div className="bg-white/80 rounded-xl px-4 py-2 flex items-center gap-2 text-sm font-medium shadow">
                    <Upload className="w-4 h-4 text-primary" /> Trocar foto de capa
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Galeria do salão</label>
                <button className="text-xs text-primary font-medium flex items-center gap-1"><Plus className="w-3 h-3" /> Adicionar foto</button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&h=200&fit=crop&auto=format",
                  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop&auto=format",
                  "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=200&h=200&fit=crop&auto=format",
                ].map((img, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden relative group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <div className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/40 transition-colors bg-muted/30">
                  <Plus className="w-5 h-5 text-muted-foreground" />
                </div>
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
                  <button key={c.color} title={c.label} className={`w-9 h-9 rounded-full border-3 hover:scale-110 transition-transform shadow-sm ${c.color === "#B8614A" ? "ring-2 ring-offset-2 ring-primary" : ""}`}
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
                  <button className="p-1 rounded hover:bg-muted"><X className="w-4 h-4 text-muted-foreground" /></button>
                </div>
              ))}
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><Plus className="w-4 h-4 text-primary" /> Adicionar serviço</h4>
              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                <input placeholder="Nome do serviço" className="h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-card" />
                <select className="h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-card appearance-none">
                  {serviceCategories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <input placeholder="Duração" className="h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-card" />
                <input placeholder="Preço" className="h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-card" />
                <Button size="sm" className="h-10">Adicionar</Button>
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
                  <button className="p-1 rounded hover:bg-muted"><X className="w-4 h-4 text-muted-foreground" /></button>
                </div>
              ))}
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><Plus className="w-4 h-4 text-primary" /> Adicionar profissional</h4>
              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                <input placeholder="Nome completo" className="h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-card" />
                <input placeholder="Especialidade" className="h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-card" />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <input placeholder="Telefone / WhatsApp" className="h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-card" />
                <Button size="sm" className="h-10">Adicionar</Button>
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
                  beautyos.app/<span className="text-primary font-semibold">{salonName.toLowerCase().replace(/\s/g, "-")}</span>
                </span>
                <button className="text-xs text-primary font-medium hover:underline shrink-0">Copiar</button>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-sm text-primary/80">
              <strong className="text-primary">Tudo pronto para publicar!</strong>
              <p className="mt-1">Após publicar, seus clientes já poderão acessar sua página e fazer agendamentos diretamente pelo link.</p>
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
              {step === 7 ? (
                <><Sparkles className="w-4 h-4" /> {loading ? "Publicando..." : "Publicar meu salão"}</>
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
