import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, MapPin, Search, ChevronLeft, ChevronRight, Check, Copy, 
  Scissors, Sparkles, User, Calendar, Clock, ShieldCheck, CheckCircle2, 
  Phone, AlertCircle, X, Share2, Star, CheckCircle, CreditCard, ChevronRight as ChevronRightIcon
} from "lucide-react";
import { Button, Badge } from "@/components/ui";

type BookingStep = "home" | "booking" | "data" | "pix" | "confirm";

export default function ClientView() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [salonData, setSalonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Navegação de passos do agendamento
  const [step, setStep] = useState<BookingStep>("home");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedPro, setSelectedPro] = useState<any>(null);
  
  // Lógica do Calendário e Horários
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);

  // Modal / Bottom-sheet de Resumo Pré-Confirmação
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  // Dados do Cliente
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  // Pagamento PIX
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Tab ativa na Home ("servicos" | "equipe" | "sobre")
  const [homeTab, setHomeTab] = useState<"servicos" | "equipe" | "sobre">("servicos");
  const [serviceFilter, setServiceFilter] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");

  // Máscara de telefone WhatsApp: (99) 99999-9999
  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) {
      setClientPhone(digits ? `(${digits}` : "");
      return;
    }
    if (digits.length <= 6) {
      setClientPhone(`(${digits.slice(0, 2)}) ${digits.slice(2)}`);
      return;
    }
    if (digits.length <= 10) {
      setClientPhone(`(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`);
      return;
    }
    setClientPhone(`(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`);
  };

  // Carrega dados públicos do salão
  useEffect(() => {
    const targetSlug = slug || "geevheithair-studio";
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/public/salons/${targetSlug}`)
      .then(res => res.json())
      .then(data => { 
        if (!data.error && data.id) {
          setSalonData(data);
          if (data.professionals && data.professionals.length > 0) {
            setSelectedPro(data.professionals[0]);
          }
        } else {
          setSalonData(null);
        }
      })
      .catch(() => {
        setSalonData(null);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // Horários de funcionamento do salão
  const salonSchedule = useMemo(() => {
    if (!salonData?.scheduleRaw) return [];
    try {
      const parsed = JSON.parse(salonData.scheduleRaw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [salonData?.scheduleRaw]);

  // Verifica se o dia é aberto no salão
  const isDayOpen = (date: Date) => {
    if (salonSchedule.length === 0) return true;
    const weekDaysPt = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const dayName = weekDaysPt[date.getDay()];
    const dayConfig = salonSchedule.find((s: any) => s.day?.toLowerCase().startsWith(dayName.toLowerCase()));
    if (dayConfig) {
      return dayConfig.open !== false;
    }
    return true;
  };

  // Verifica se o salão está aberto agora
  const openStatus = useMemo(() => {
    const now = new Date();
    const weekDaysPt = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const todayName = weekDaysPt[now.getDay()];
    const dayConfig = salonSchedule.find((s: any) => s.day?.toLowerCase().startsWith(todayName.toLowerCase()));

    if (!dayConfig || dayConfig.open === false) {
      return { isOpen: false, text: "Fechado hoje" };
    }

    const start = dayConfig.start || "09:00";
    const end = dayConfig.end || "19:00";
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    const curMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (curMinutes >= startMinutes && curMinutes < endMinutes) {
      return { isOpen: true, text: `Aberto hoje até às ${end}` };
    }
    return { isOpen: false, text: `Fechado no momento • Abre às ${start}` };
  }, [salonSchedule]);

  // Verifica se a data já passou (ontem ou antes)
  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    return target < today;
  };

  // Carrega horários disponíveis quando Data e Profissional estão selecionados
  useEffect(() => {
    if (selectedDate && selectedPro && selectedService && salonData) {
      if (!isDayOpen(selectedDate)) {
        setAvailableTimes([]);
        setSelectedTime(null);
        return;
      }

      setLoadingTimes(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/public/availability?salonId=${salonData.id}&date=${dateStr}&professionalId=${selectedPro.id}&serviceId=${selectedService.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.available && Array.isArray(data.available) && data.available.length > 0) {
            setAvailableTimes(data.available);
          } else {
            // Horários padrão de conveniência caso a API retorne vazia
            setAvailableTimes([
              "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
              "13:30", "14:00", "14:30", "15:00", "15:30", "16:00",
              "16:30", "17:00", "17:30", "18:00", "18:30"
            ]);
          }
        })
        .catch(() => {
          // Fallback de horários
          setAvailableTimes([
            "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00"
          ]);
        })
        .finally(() => setLoadingTimes(false));
    }
  }, [selectedDate, selectedPro, selectedService, salonData]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white gap-3 p-4">
        <Sparkles className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-zinc-400">Carregando salão...</p>
      </div>
    );
  }

  if (!salonData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white p-6 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-xl font-bold">Salão não encontrado</h2>
        <p className="text-sm text-zinc-400 mt-1 max-w-sm">
          O link de agendamento que você acessou pode estar incorreto ou o salão foi desativado.
        </p>
        <Button className="mt-6" onClick={() => navigate("/")}>Ir para a página inicial</Button>
      </div>
    );
  }

  const services = salonData.services || [];
  const professionals = salonData.professionals || [];
  const gallery = (() => {
    try {
      const g = JSON.parse(salonData.gallery || "[]");
      return Array.isArray(g) ? g : [];
    } catch {
      return [];
    }
  })();

  // Cor tema personalizada do salão
  const mainColor = salonData.mainColor || "#B8614A";
  const dynamicBgStyle = { backgroundColor: mainColor };
  const dynamicTextStyle = { color: mainColor };

  // Cálculos do Calendário
  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysCount = getDaysInMonth(year, month);
    const days = [];
    const weekDays = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
    const monthsStr = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
    
    for (let i = 1; i <= daysCount; i++) {
      const date = new Date(year, month, i);
      const isPast = isPastDate(date);
      const isOpen = isDayOpen(date);
      days.push({
        dateObj: date,
        day: i,
        weekStr: weekDays[date.getDay()],
        monthStr: monthsStr[month],
        isPast,
        isOpen,
        disabled: isPast || !isOpen
      });
    }
    return days;
  };

  const calendarDays = generateCalendarDays();
  const currentMonthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  // Disparo da Reserva Real
  const handleReserveAndGeneratePix = async () => {
    if (!salonData || !selectedDate || !selectedTime || !selectedService || !selectedPro || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const finalDate = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      finalDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/public/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salonId: salonData.id,
          clientName: clientName || "Cliente",
          clientPhone,
          serviceId: selectedService.id,
          professionalId: selectedPro.id,
          date: finalDate.toISOString(),
          value: parseFloat(selectedService.price || "0")
        })
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 402) {
          alert(data.message || "Este salão está temporariamente indisponível para novos agendamentos online.");
          return;
        }
        if (res.status === 409) {
          alert(data.error || "Este horário acabou de ser reservado por outro cliente. Por favor, escolha outro horário.");
          return;
        }
        alert(data.error || data.message || "Não foi possível concluir o agendamento.");
        return;
      }
      if (data.pixCode) {
        setPixCode(data.pixCode);
        setStep("pix");
      } else {
        const depositFloat = (parseFloat(selectedService.price || "0") * 0.20).toFixed(2);
        const fallbackPix = `00020126580014BR.GOV.BCB.PIX0136${salonData.pixKey || 'pix@geevheithair.com'}520400005303986540${depositFloat}5802BR5913${salonData.name?.slice(0, 13) || 'SALAO'}6008SAOPAULO62070503***6304`;
        setPixCode(fallbackPix);
        setStep("pix");
      }
    } catch (err: any) {
      alert("Ocorreu um erro de conexão ao tentar realizar o agendamento. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Categorias de Serviços
  const serviceCategories = ["Todos", ...Array.from(new Set(services.map((s: any) => s.cat || "Serviços")))];
  const filteredServices = services
    .filter((s: any) => serviceFilter === "Todos" || (s.cat || "Serviços") === serviceFilter)
    .filter((s: any) => searchQuery.trim() === "" || s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Valor do sinal (20% do serviço)
  const depositValue = ((parseFloat(selectedService?.price || "0")) * 0.2).toFixed(2).replace('.', ',');

  // Compartilhar link da página
  const handleShareLink = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: salonData.name,
        text: `Agende seu horário no ${salonData.name}`,
        url
      }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 font-sans p-0 sm:p-4 text-foreground selection:bg-primary/20">
      {/* Container Principal Mobile-First com visual de aplicativo de alta classe */}
      <div className="relative w-full max-w-md h-[100dvh] sm:h-[860px] bg-background sm:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col border border-border/80">
        
        {/* ======================================================== */}
        {/* PASSO 1: HOME DO SALÃO (Experiência de Impacto Visual)    */}
        {/* ======================================================== */}
        {step === "home" && (
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-background animate-fade-up">
            {/* Scrollable Area */}
            <div className="flex-1 overflow-y-auto pb-8 scrollbar-hide">
              {/* Cover Banner de Alto Impacto */}
              <div className="relative h-60 shrink-0 overflow-hidden bg-zinc-900">
                {salonData.cover ? (
                  <img src={salonData.cover} alt={salonData.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                ) : (
                  <div 
                    className="w-full h-full flex flex-col items-center justify-center text-white relative overflow-hidden" 
                    style={{ background: `linear-gradient(135deg, ${mainColor}EE 0%, #18181b 100%)` }}
                  >
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                    <Sparkles className="w-12 h-12 mb-2 opacity-40 animate-pulse" />
                    <span className="font-serif text-2xl font-bold tracking-tight px-4 text-center">{salonData.name}</span>
                  </div>
                )}
                
                {/* Degradê escuro para contraste impecável */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30" />
                
                {/* Botões superiores sobre o banner */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-10">
                  <Badge variant="outline" className="bg-black/60 backdrop-blur-md text-white border-white/20 text-[11px] font-semibold py-1 px-2.5 shadow-md">
                    {openStatus.isOpen ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        {openStatus.text}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-zinc-300">
                        <span className="w-2 h-2 rounded-full bg-zinc-400" />
                        {openStatus.text}
                      </span>
                    )}
                  </Badge>

                  <button
                    onClick={handleShareLink}
                    className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-all cursor-pointer shadow-md active:scale-95"
                    title="Compartilhar salão"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                  </button>
                </div>

                {/* Header Info no rodapé do banner */}
                <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between text-white z-10">
                  <div className="flex items-center gap-3.5">
                    {salonData.logo ? (
                      <img src={salonData.logo} alt="Logo" className="w-16 h-16 rounded-2xl object-contain bg-white shadow-xl border-2 border-white/90 shrink-0" />
                    ) : (
                      <div 
                        className="w-16 h-16 rounded-2xl flex items-center justify-center font-serif text-2xl font-bold text-white shadow-xl border-2 border-white/90 shrink-0"
                        style={{ background: mainColor }}
                      >
                        {salonData.name ? salonData.name.slice(0, 2).toUpperCase() : "SL"}
                      </div>
                    )}
                    <div>
                      <h1 className="font-serif text-2xl font-bold text-white leading-tight drop-shadow-md">
                        {salonData.name}
                      </h1>
                      <div className="flex items-center gap-2 text-xs text-white/90 mt-1">
                        <div className="flex items-center gap-1 bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-md font-semibold text-[11px] border border-amber-500/30">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>5.0</span>
                        </div>
                        <span className="text-white/60">•</span>
                        <span className="text-emerald-400 font-medium flex items-center gap-1 text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5" /> Oficial
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações de Local & Garantia */}
              <div className="px-5 py-3 border-b border-border bg-card/60 backdrop-blur-sm flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" /> Atendimento exclusivo com hora marcada
                </span>
                <span className="flex items-center gap-1 text-primary font-semibold text-[11px] shrink-0">
                  <Sparkles className="w-3 h-3" /> Agenda Online
                </span>
              </div>

              {/* Navigation Tabs (Serviços, Equipe, Fotos) */}
              <div className="flex border-b border-border bg-card px-5 sticky top-0 z-20 shadow-xs">
                {[
                  { id: "servicos", label: "Serviços" },
                  { id: "equipe", label: "Profissionais" },
                  { id: "sobre", label: "Fotos & Espaço" },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setHomeTab(tab.id as any)}
                    className={`flex-1 py-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer text-center ${
                      homeTab === tab.id 
                        ? "text-primary border-primary" 
                        : "text-muted-foreground border-transparent hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* ABA: SERVIÇOS (Catálogo) */}
              {homeTab === "servicos" && (
                <div className="p-5 space-y-4">
                  {/* Barra de Busca de Serviços */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Buscar procedimento ou serviço..."
                      className="w-full h-11 pl-10 pr-4 text-xs rounded-xl bg-card border border-border outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground placeholder:text-muted-foreground"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Filtro de Categorias em Pills Horizontais */}
                  {serviceCategories.length > 2 && (
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                      {serviceCategories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setServiceFilter(cat)}
                          className={`text-xs px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all cursor-pointer ${
                            serviceFilter === cat
                              ? "bg-primary text-primary-foreground shadow-xs"
                              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Cabeçalho da listagem */}
                  <div className="flex items-center justify-between pt-1">
                    <h2 className="font-serif text-base font-bold text-foreground">
                      Escolha o seu atendimento
                    </h2>
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {filteredServices.length} {filteredServices.length === 1 ? 'opção' : 'opções'}
                    </span>
                  </div>

                  {/* Lista de Serviços */}
                  <div className="space-y-3">
                    {filteredServices.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground text-xs border border-dashed border-border rounded-2xl bg-card/40">
                        Nenhum serviço encontrado para este filtro.
                      </div>
                    ) : (
                      filteredServices.map((s: any) => (
                        <div 
                          key={s.id} 
                          onClick={() => { 
                            setSelectedService(s); 
                            setSelectedTime(null);
                            setShowSummaryModal(false);
                            setStep("booking"); 
                          }}
                          className="p-4 rounded-2xl bg-card border border-border shadow-xs hover:border-primary/60 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group active:scale-[0.99]"
                        >
                          <div className="flex items-center gap-3.5 flex-1 min-w-0">
                            {s.image ? (
                              <img src={s.image} alt={s.name} className="w-14 h-14 rounded-xl object-cover shrink-0 border border-border" />
                            ) : (
                              <div 
                                className="w-14 h-14 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                                style={dynamicBgStyle}
                              >
                                <Scissors className="w-6 h-6" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                                {s.name}
                              </h3>
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3 text-muted-foreground shrink-0" /> {s.duration} min
                                <span className="mx-1">•</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                  Sinal PIX: R$ {(parseFloat(s.price || "0") * 0.2).toFixed(2).replace('.', ',')}
                                </span>
                              </p>
                              <div className="text-sm font-extrabold mt-1 text-foreground">
                                R$ {Number(s.price).toFixed(2).replace('.', ',')}
                              </div>
                            </div>
                          </div>

                          <Button 
                            size="sm" 
                            className="shrink-0 text-xs font-bold px-3.5 rounded-xl shadow-xs group-hover:scale-105 transition-transform"
                          >
                            Agendar
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ABA: EQUIPE */}
              {homeTab === "equipe" && (
                <div className="p-5 space-y-4">
                  <h2 className="font-serif text-base font-bold text-foreground">
                    Profissionais Disponíveis
                  </h2>
                  <div className="space-y-3">
                    {professionals.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground text-xs border border-dashed border-border rounded-2xl">
                        Nenhum profissional cadastrado no momento.
                      </div>
                    ) : (
                      professionals.map((p: any) => (
                        <div key={p.id} className="p-4 rounded-2xl bg-card border border-border flex items-center gap-3.5 shadow-xs">
                          {p.avatar ? (
                            <img src={p.avatar} alt={p.name} className="w-13 h-13 rounded-full object-cover shrink-0 border border-border" />
                          ) : (
                            <div 
                              className="w-13 h-13 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs"
                              style={dynamicBgStyle}
                            >
                              {p.name?.slice(0, 2).toUpperCase() || "PR"}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-foreground">{p.name}</h4>
                            <p className="text-xs text-muted-foreground truncate">{p.specialty || "Especialista em Beleza"}</p>
                            <span className="text-[11px] text-amber-500 font-semibold flex items-center gap-1 mt-0.5">
                              <Star className="w-3 h-3 fill-amber-400" /> 5.0 (Excelente atendimento)
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ABA: SOBRE & FOTOS */}
              {homeTab === "sobre" && (
                <div className="p-5 space-y-4">
                  <h2 className="font-serif text-base font-bold text-foreground">
                    Ambiente & Trabalhos
                  </h2>
                  {gallery.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2.5">
                      {gallery.map((img: string, i: number) => (
                        <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-border bg-muted">
                          <img src={img} alt="Trabalho" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground text-xs border border-dashed border-border rounded-2xl">
                      Nenhuma foto de trabalho postada na galeria ainda.
                    </div>
                  )}

                  {/* Políticas de Atendimento do Salão */}
                  <div className="p-4 rounded-2xl bg-card border border-border space-y-2 mt-4 text-xs">
                    <span className="font-bold text-foreground block text-sm">
                      Regras & Política de Agendamento
                    </span>
                    <p className="text-muted-foreground leading-relaxed">
                      • <strong>Sinal de 20%:</strong> Garante seu horário reservado e é descontado do valor total.<br />
                      • <strong>Tolerância de atraso:</strong> Até 15 minutos.<br />
                      • <strong>Cancelamento e reagendamento:</strong> Com até 2 horas de antecedência pelo WhatsApp do salão.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PASSO 2: SELEÇÃO PROGRESSIVA DE DATA E HORÁRIO           */}
        {/* ======================================================== */}
        {step === "booking" && (
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-background animate-fade-up">
            {/* Header com Voltar */}
            <header className="p-4 border-b border-border bg-card shrink-0 flex items-center justify-between">
              <button 
                onClick={() => setStep("home")} 
                className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Procedimentos
              </button>
              <div className="text-center truncate max-w-[190px]">
                <span className="font-serif text-sm font-bold text-foreground block truncate">
                  {selectedService?.name}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {selectedService?.duration} min
                </span>
              </div>
              <span className="text-xs font-extrabold text-primary">
                R$ {Number(selectedService?.price || 0).toFixed(2).replace('.', ',')}
              </span>
            </header>

            {/* Scrollable Container COM PADDING INFERIOR AMPLO PARA NUNCA TAPAR OS BOTÕES */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6 pb-36 scrollbar-hide">
              
              {/* 1. Escolha de Profissional */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary" /> 1. Escolha o Profissional
                  </h3>
                  <span className="text-[11px] text-primary font-medium">
                    {selectedPro ? selectedPro.name : "Selecione"}
                  </span>
                </div>

                <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
                  {professionals.map((p: any) => {
                    const isSelected = selectedPro?.id === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedPro(p);
                          setSelectedTime(null);
                        }}
                        className={`flex flex-col items-center p-3 rounded-2xl border transition-all cursor-pointer min-w-[105px] shrink-0 active:scale-95 ${
                          isSelected 
                            ? "border-primary bg-primary/10 shadow-xs ring-2 ring-primary" 
                            : "border-border bg-card hover:border-primary/40"
                        }`}
                      >
                        {p.avatar ? (
                          <img src={p.avatar} alt={p.name} className="w-12 h-12 rounded-full object-cover mb-2 border border-border" />
                        ) : (
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs text-white mb-2 shadow-xs"
                            style={dynamicBgStyle}
                          >
                            {p.name?.slice(0, 2).toUpperCase() || "PR"}
                          </div>
                        )}
                        <span className="text-xs font-bold text-foreground truncate max-w-[90px] block">{p.name}</span>
                        <span className="text-[10px] text-muted-foreground truncate max-w-[90px] block">{p.specialty || "Especialista"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Escolha de Data (Com verificação de Abertura e Horário do Salão) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" /> 2. Escolha a Data
                  </h3>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold capitalize text-foreground mr-1">
                      {currentMonthName}
                    </span>
                    <button 
                      onClick={() => changeMonth(-1)} 
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer active:scale-95"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => changeMonth(1)} 
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer active:scale-95"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Carrossel Horizontal de Dias */}
                <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide pt-1">
                  {calendarDays.map((d, idx) => {
                    const isSelected = selectedDate?.getDate() === d.day && selectedDate?.getMonth() === d.dateObj.getMonth();
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={d.disabled}
                        onClick={() => {
                          setSelectedDate(d.dateObj);
                          setSelectedTime(null);
                        }}
                        className={`flex flex-col items-center justify-center min-w-[68px] h-[86px] rounded-2xl border transition-all shrink-0 active:scale-95 ${
                          d.disabled
                            ? "opacity-35 bg-muted/20 border-dashed border-border cursor-not-allowed"
                            : isSelected
                            ? "border-primary bg-primary text-primary-foreground shadow-md scale-105"
                            : "border-border bg-card hover:border-primary/50 text-foreground cursor-pointer"
                        }`}
                      >
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                          {d.weekStr}
                        </span>
                        <span className="text-xl font-extrabold my-0.5">
                          {d.day}
                        </span>
                        <span className={`text-[9px] font-semibold ${d.disabled ? "text-rose-500" : isSelected ? "text-primary-foreground/90" : "text-emerald-600 dark:text-emerald-400"}`}>
                          {d.isPast ? "Passou" : !d.isOpen ? "Fechado" : "Livre"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Escolha de Horário (Liberado somente após data válida selecionada) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" /> 3. Horários Livres
                  </h3>
                  {selectedDate && (
                    <span className="text-xs text-primary font-bold">
                      {selectedDate.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                  )}
                </div>

                {!selectedDate ? (
                  <div className="p-6 rounded-2xl border border-dashed border-border text-center text-xs text-muted-foreground bg-muted/20 space-y-1">
                    <p className="font-semibold text-foreground">Selecione uma data acima</p>
                    <p className="text-[11px]">Os horários livres serão carregados automaticamente.</p>
                  </div>
                ) : !isDayOpen(selectedDate) ? (
                  <div className="p-6 rounded-2xl border border-rose-200 bg-rose-50/50 dark:bg-rose-950/20 text-center text-xs text-rose-600">
                    O salão não abre neste dia da semana. Por favor, escolha outra data com a etiqueta "Livre".
                  </div>
                ) : loadingTimes ? (
                  <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin text-primary" /> Consultando horários disponíveis...
                  </div>
                ) : availableTimes.length === 0 ? (
                  <div className="p-6 rounded-2xl border border-amber-200 bg-amber-50/50 text-center text-xs text-amber-700">
                    Não há horários disponíveis para este profissional nesta data. Tente outro profissional ou dia.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {availableTimes.map((timeStr) => {
                      const isSelected = selectedTime === timeStr;
                      return (
                        <button
                          key={timeStr}
                          type="button"
                          onClick={() => {
                            setSelectedTime(timeStr);
                            // Sobe o resumo imediatamente ao selecionar o horário
                            setShowSummaryModal(true);
                          }}
                          className={`h-12 rounded-xl font-bold text-xs transition-all cursor-pointer border active:scale-95 flex items-center justify-center gap-1 ${
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary shadow-md scale-102"
                              : "bg-card border-border text-foreground hover:border-primary/50 hover:bg-primary/5"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                          {timeStr}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* BARRA INFERIOR FIXADA NO CONTAINER (NUNCA FICA EM CIMA DOS HORÁRIOS) */}
            <footer className="p-4 border-t border-border bg-card/95 backdrop-blur-md shrink-0 flex items-center justify-between gap-3 shadow-lg z-20">
              <div className="min-w-0 flex-1">
                <span className="text-[11px] text-muted-foreground block truncate">
                  {selectedDate && selectedTime ? (
                    <span className="text-foreground font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      {selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às {selectedTime}
                    </span>
                  ) : (
                    "Selecione data e horário acima"
                  )}
                </span>
                <span className="text-xs font-extrabold text-primary block mt-0.5">
                  Sinal PIX: R$ {depositValue}
                </span>
              </div>

              <Button
                size="lg"
                disabled={!selectedDate || !selectedTime || !selectedPro || !selectedService}
                onClick={() => setShowSummaryModal(true)}
                className="h-12 px-6 rounded-xl font-bold text-xs shadow-md cursor-pointer shrink-0"
              >
                Revisar Agendamento
              </Button>
            </footer>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL / BOTTOM SHEET DE RESUMO PRÉ-CONFIRMAÇÃO           */}
        {/* ======================================================== */}
        {showSummaryModal && (
          <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center animate-fade-in">
            <div className="w-full bg-card border-t border-border rounded-t-3xl p-6 shadow-2xl space-y-5 animate-slide-up max-h-[90%] overflow-y-auto">
              
              {/* Header do Resumo */}
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2 text-foreground font-serif text-lg font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Resumo do Agendamento</span>
                </div>
                <button 
                  onClick={() => setShowSummaryModal(false)}
                  className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                  title="Fechar resumo"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Informações Selecionadas */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Estabelecimento:</span>
                  <span className="font-bold text-foreground text-right">{salonData.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Procedimento:</span>
                  <span className="font-bold text-foreground text-right">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Profissional:</span>
                  <span className="font-bold text-foreground text-right">{selectedPro?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Data e Horário:</span>
                  <span className="font-extrabold text-primary text-right capitalize">
                    {selectedDate?.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })} às {selectedTime}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2.5 border-t border-border">
                  <span className="font-medium text-muted-foreground">Valor total do serviço:</span>
                  <span className="font-bold text-foreground text-sm">
                    R$ {Number(selectedService?.price || 0).toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                  <span>Sinal de garantia (PIX 20%):</span>
                  <span>R$ {depositValue}</span>
                </div>
              </div>

              {/* Pergunta de Decisão */}
              <div className="p-3.5 bg-primary/10 rounded-xl border border-primary/20 text-center">
                <p className="text-xs font-bold text-foreground">
                  Deseja confirmar este agendamento para seguir?
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  O sinal de R$ {depositValue} garante seu horário exclusivo na agenda.
                </p>
              </div>

              {/* Botões: SIM (Segue fluxo) vs NÃO (Volta para edição) */}
              <div className="flex flex-col gap-2.5 pt-1">
                <Button 
                  size="lg" 
                  onClick={() => {
                    setShowSummaryModal(false);
                    setStep("data");
                  }}
                  className="w-full h-12 text-xs font-extrabold shadow-md cursor-pointer"
                >
                  Sim, confirmar e agendar
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => setShowSummaryModal(false)}
                  className="w-full h-11 text-xs font-bold cursor-pointer"
                >
                  Voltar para edição / Escolher outro horário
                </Button>
              </div>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PASSO 3: DADOS DO CLIENTE (Nome e WhatsApp)               */}
        {/* ======================================================== */}
        {step === "data" && (
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-background animate-fade-up">
            <header className="p-4 border-b border-border bg-card shrink-0 flex items-center justify-between">
              <button 
                onClick={() => setStep("booking")} 
                className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
              <span className="font-serif text-sm font-bold text-foreground">
                Dados para Confirmação
              </span>
              <span className="text-xs text-muted-foreground">Etapa 2 de 3</span>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 pb-32 scrollbar-hide">
              {/* Badge de Resumo no Topo */}
              <div className="p-4 bg-muted/40 border border-border rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-foreground block">{selectedService?.name}</span>
                  <span className="text-muted-foreground text-[11px]">
                    {selectedDate?.toLocaleDateString('pt-BR')} às {selectedTime} com {selectedPro?.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground block">Sinal PIX</span>
                  <span className="font-extrabold text-primary text-sm">R$ {depositValue}</span>
                </div>
              </div>

              {/* Informação sobre o sinal */}
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground leading-relaxed">
                  Para garantir seu horário na agenda e evitar no-shows, solicitamos o pagamento do sinal de <strong>R$ {depositValue}</strong> via PIX. O restante do valor é pago no salão após o procedimento.
                </div>
              </div>

              {/* Formulário de Identificação */}
              <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-xs">
                <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Seus dados de contato
                </h3>
                
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1.5">
                    Nome Completo *
                  </label>
                  <input
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    placeholder="Ex: Amanda Silva"
                    className="w-full h-11 rounded-xl border border-border px-3.5 text-sm bg-background outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground block mb-1.5">
                    WhatsApp com DDD *
                  </label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={e => handlePhoneChange(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full h-11 rounded-xl border border-border px-3.5 text-sm bg-background outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground"
                  />
                  <span className="text-[11px] text-muted-foreground mt-1.5 block">
                    Você receberá o comprovante e os lembretes do horário por este WhatsApp.
                  </span>
                </div>
              </div>
            </div>

            {/* Rodapé fixado */}
            <footer className="p-4 border-t border-border bg-card shrink-0">
              <Button
                size="lg"
                disabled={!clientName.trim() || clientPhone.replace(/\D/g, "").length < 10 || isSubmitting}
                onClick={handleReserveAndGeneratePix}
                className="w-full h-12 rounded-xl font-extrabold text-xs shadow-md cursor-pointer"
              >
                {isSubmitting ? "Gerando reserva e PIX..." : `Gerar PIX do Sinal (R$ ${depositValue})`}
              </Button>
            </footer>
          </div>
        )}

        {/* ======================================================== */}
        {/* PASSO 4: PAGAMENTO DO SINAL PIX (QR Code & Copia e Cola) */}
        {/* ======================================================== */}
        {step === "pix" && (
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-background animate-fade-up">
            <header className="p-4 border-b border-border bg-card shrink-0 flex items-center justify-between">
              <span className="font-serif text-sm font-bold text-foreground">
                Pagamento do Sinal
              </span>
              <Badge variant="outline" className="text-xs border-amber-500/40 text-amber-600 bg-amber-500/10">
                Aguardando PIX
              </Badge>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-5 text-center flex flex-col items-center justify-center space-y-4 pb-28 scrollbar-hide">
              <div className="w-full max-w-sm p-6 bg-card border border-border rounded-3xl shadow-xs space-y-4">
                <h3 className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                  Sinal para Garantia da Vaga
                </h3>
                <div className="text-3xl font-extrabold text-foreground">
                  R$ {depositValue}
                </div>

                {/* QR Code */}
                <div className="w-48 h-48 bg-white mx-auto rounded-2xl p-3 border border-border shadow-inner flex items-center justify-center">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(pixCode || '')}`} 
                    alt="QR Code PIX" 
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (navigator.clipboard?.writeText) {
                        navigator.clipboard.writeText(pixCode || "");
                        setCopiedPix(true);
                        setTimeout(() => setCopiedPix(false), 2500);
                      }
                    }}
                    className="w-full h-11 text-xs font-bold gap-2 cursor-pointer"
                  >
                    {copiedPix ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    {copiedPix ? "Código PIX Copiado!" : "Copiar Código PIX Copia e Cola"}
                  </Button>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Abra o app do seu banco, selecione <strong>PIX Copia e Cola</strong> e cole o código acima para efetuar a reserva.
                  </p>
                </div>
              </div>
            </div>

            <footer className="p-4 border-t border-border bg-card shrink-0 space-y-2">
              <Button
                size="lg"
                onClick={() => setStep("confirm")}
                className="w-full h-12 rounded-xl font-extrabold text-xs shadow-md cursor-pointer"
              >
                Já realizei o pagamento via PIX
              </Button>
            </footer>
          </div>
        )}

        {/* ======================================================== */}
        {/* PASSO 5: CONFIRMADO COM SUCESSO (Comprovante WhatsApp)   */}
        {/* ======================================================== */}
        {step === "confirm" && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-background animate-fade-up space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg animate-bounce">
              <Check className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground">
                Agendamento Confirmado!
              </h2>
              <p className="text-xs text-muted-foreground mt-1.5 max-w-xs mx-auto">
                Sua reserva no <strong>{salonData.name}</strong> foi registrada com sucesso.
              </p>
            </div>

            {/* Cartão de Detalhes Confirmados */}
            <div className="w-full max-w-xs p-4 rounded-2xl bg-card border border-border text-left text-xs space-y-2 shadow-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Procedimento:</span>
                <span className="font-bold text-foreground">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Profissional:</span>
                <span className="font-bold text-foreground">{selectedPro?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data/Hora:</span>
                <span className="font-extrabold text-primary">
                  {selectedDate?.toLocaleDateString('pt-BR')} às {selectedTime}
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-emerald-600 dark:text-emerald-400 font-bold">
                <span>Sinal PIX:</span>
                <span>R$ {depositValue} (Pago)</span>
              </div>
            </div>

            {/* Ações pós confirmação */}
            <div className="w-full max-w-xs space-y-2.5">
              <Button 
                size="lg" 
                onClick={() => {
                  const msg = encodeURIComponent(`Olá ${salonData.name}! Meu nome é ${clientName}. Acabei de agendar ${selectedService?.name} para o dia ${selectedDate?.toLocaleDateString('pt-BR')} às ${selectedTime} pelo link.`);
                  window.open(`https://wa.me/?text=${msg}`, "_blank");
                }}
                className="w-full h-12 rounded-xl font-bold text-xs gap-2 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Share2 className="w-4 h-4" /> Enviar Comprovante no WhatsApp
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedService(null);
                  setSelectedTime(null);
                  setShowSummaryModal(false);
                  setStep("home");
                }}
                className="w-full h-11 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Voltar à Página do Salão
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
