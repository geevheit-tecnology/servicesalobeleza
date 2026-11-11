import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, MapPin, Search, ChevronLeft, ChevronRight, Check, Copy, 
  Scissors, Sparkles, User, Calendar, Clock, ShieldCheck, CheckCircle2, 
  Phone, AlertCircle, X, Share2, Star, CheckCircle, CreditCard, ChevronRight as ChevronRightIcon,
  LogOut, ExternalLink, MessageCircle, Heart, Award, ArrowRight
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
  const [slotDates, setSlotDates] = useState<Record<string, string>>({});
  const [loadingTimes, setLoadingTimes] = useState(false);

  // Modal / Bottom-sheet de Resumo Pré-Confirmação
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  // Dados do Cliente
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  // Pagamento PIX
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [payDeposit, setPayDeposit] = useState(true);
  const [reservedDeposit, setReservedDeposit] = useState<number | null>(null);
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
    const targetSlug = slug || "studio-belezapura";
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

  // SEO Local Google Maps & Rich Snippets (Schema.org / BeautySalon)
  useEffect(() => {
    if (!salonData) return;
    document.title = `${salonData.name} · Agendamento Online | BelezaPura`;
    const addr = salonData.address || {};
    const fullAddr = [addr.street, addr.number, addr.district, addr.city, addr.state].filter(Boolean).join(", ");
    const scriptId = "schema-belezapura-salon";
    let el = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement("script");
      el.id = scriptId;
      el.type = "application/ld+json";
      document.head.appendChild(el);
    }
    const schema: Record<string, any> = {
      "@context": "https://schema.org",
      "@type": "BeautySalon",
      "name": salonData.name,
      "url": window.location.href,
      "telephone": salonData.phone || undefined,
      "image": salonData.cover || salonData.logo || undefined,
      "potentialAction": {
        "@type": "ReserveAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": window.location.href,
          "inLanguage": "pt-BR",
          "actionPlatform": [
            "http://schema.org/DesktopWebPlatform",
            "http://schema.org/MobileWebPlatform"
          ]
        },
        "result": {
          "@type": "Reservation",
          "name": `Reserva Online - ${salonData.name}`
        }
      }
    };
    if (fullAddr) {
      schema.address = {
        "@type": "PostalAddress",
        "streetAddress": `${addr.street || ""} ${addr.number || ""}`.trim(),
        "addressLocality": addr.city,
        "addressRegion": addr.state,
        "postalCode": addr.zipCode,
        "addressCountry": "BR"
      };
    }
    el.text = JSON.stringify(schema);
    return () => {
      const existing = document.getElementById(scriptId);
      if (existing) existing.remove();
    };
  }, [salonData]);

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

      setLoadingTimes(true); setSelectedTime(null); setAvailableTimes([]); setSlotDates({});
      const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
      const controller = new AbortController();
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/public/availability?salonId=${salonData.id}&date=${dateStr}&professionalId=${selectedPro.id}&serviceId=${selectedService.id}`, { signal: controller.signal })
        .then(async res => { const data = await res.json(); if (!res.ok) throw new Error(data.error); return data; })
        .then(data => { setAvailableTimes(Array.isArray(data.available) ? data.available : []); setSlotDates(data.slots || {}); })
        .catch(() => { if (!controller.signal.aborted) { setAvailableTimes([]); setSlotDates({}); } })
        .finally(() => { if (!controller.signal.aborted) setLoadingTimes(false); });
      return () => controller.abort();
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
  const reviews = (() => {
    try {
      const r = JSON.parse(salonData.reviewsRaw || salonData.reviews || "[]");
      if (Array.isArray(r) && r.length > 0) return r;
    } catch {}
    return [
      { id: "1", author: "Camila M.", comment: "Atendimento maravilhoso e super pontual. O espaço é aconchegante e saí renovada!", date: "Semana passada", rating: 5 },
      { id: "2", author: "Juliana R.", comment: "Profissionais incríveis, tiraram todas as minhas dúvidas e o resultado ficou perfeito.", date: "Há 2 semanas", rating: 5 },
      { id: "3", author: "Fernanda S.", comment: "Adorei a facilidade de agendar e receber o lembrete no WhatsApp. Recomendo muito!", date: "Mês passado", rating: 5 }
    ];
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
      const timestamp = slotDates[selectedTime];
      if (!timestamp) throw new Error("Atualize os horários disponíveis.");

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/public/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salonId: salonData.id,
          clientName: clientName || "Cliente",
          clientPhone,
          serviceId: selectedService.id,
          professionalId: selectedPro.id,
          date: timestamp,
          payDeposit
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
      setReservedDeposit(Number(data.deposit || 0));
      if (data.pixCode) {
        setPixCode(data.pixCode);
        setStep("pix");
      } else {
        setPixCode(null);
        setStep("confirm");
      }
    } catch (err: any) {
      alert("Ocorreu um erro de conexão ao tentar realizar o agendamento. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Categorias de Serviços
  const serviceCategories = ["Todos", ...Array.from(new Set<string>(services.map((s: any) => String(s.cat || "Serviços"))))];
  const filteredServices = services
    .filter((s: any) => serviceFilter === "Todos" || (s.cat || "Serviços") === serviceFilter)
    .filter((s: any) => searchQuery.trim() === "" || s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const depositForPrice = (price: number) => {
    if (!salonData.pixKey || salonData.depositPolicy === "none" || (salonData.depositPolicy === "optional" && !payDeposit)) return 0;
    const value = Number(salonData.depositValue ?? 20);
    return Math.round((salonData.depositType === "fixed" ? Math.min(price, value) : price * value / 100) * 100) / 100;
  };
  const amount = ((step === "pix" || step === "confirm") && reservedDeposit !== null) ? reservedDeposit : depositForPrice(Number(selectedService?.price || 0));
  const depositValue = amount.toFixed(2).replace(".", ",");
  const depositDescription = salonData.depositPolicy === "none" || !salonData.pixKey ? "Sem sinal antecipado" : salonData.depositType === "fixed" ? `Sinal de até R$ ${Number(salonData.depositValue).toFixed(2).replace(".", ",")}` : `Sinal de ${salonData.depositValue ?? 20}%`;
  const address = salonData.address || {};
  const addressText = [address.street, address.number, address.district, address.city, address.state].filter(Boolean).join(", ");

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

  // Se for o passo inicial "home", renderiza a LANDING PAGE COMPLETA E RESPONSIVA DO SALÃO
  if (step === "home") {
    const cleanPhone = (salonData.phone || "").replace(/\D/g, "");
    const waUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone}?text=${encodeURIComponent(`Olá ${salonData.name}! Gostaria de mais informações sobre os atendimentos.`)}`
      : null;
    const mapsUrl = addressText ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${salonData.name}, ${addressText}`)}` : null;

    return (
      <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 font-sans text-foreground selection:bg-primary/20 flex flex-col scroll-smooth">
        
        {/* ======================================================== */}
        {/* 1. NAVBAR FIXA / CABEÇALHO SUPERIOR                      */}
        {/* ======================================================== */}
        <header className="sticky top-0 z-40 w-full bg-background/90 backdrop-blur-md border-b border-border transition-all">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
            
            {/* Logo + Nome do Salão */}
            <div className="flex items-center gap-3 min-w-0">
              {salonData.logo ? (
                <img 
                  src={salonData.logo} 
                  alt={salonData.name} 
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-contain bg-white shadow-md border border-border/60 shrink-0" 
                />
              ) : (
                <div 
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-serif text-base sm:text-lg font-bold text-white shadow-md shrink-0"
                  style={{ background: mainColor }}
                >
                  {salonData.name ? salonData.name.slice(0, 2).toUpperCase() : "SL"}
                </div>
              )}
              <div className="min-w-0">
                <span className="font-serif text-base sm:text-lg font-bold text-foreground block truncate leading-snug">
                  {salonData.name}
                </span>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className={`w-2 h-2 rounded-full ${openStatus.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />
                  <span className="truncate">{openStatus.text}</span>
                </div>
              </div>
            </div>

            {/* Menu de Navegação Rápida (Desktop) */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-muted-foreground">
              <a href="#servicos" className="hover:text-primary transition-colors">Procedimentos</a>
              <a href="#equipe" className="hover:text-primary transition-colors">Especialistas</a>
              <a href="#fotos" className="hover:text-primary transition-colors">Galeria</a>
              <a href="#avaliacoes" className="hover:text-primary transition-colors">Avaliações</a>
              <a href="#local" className="hover:text-primary transition-colors">Horários & Local</a>
            </nav>

            {/* Ações do Topo */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Botão Compartilhar */}
              <button
                onClick={handleShareLink}
                className="p-2 sm:px-3 sm:py-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                title="Compartilhar salão"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                <span className="hidden sm:inline">{copiedLink ? "Copiado!" : "Compartilhar"}</span>
              </button>

              {/* Botão Agendar no Topo */}
              <a
                href="#servicos"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md hover:opacity-90 transition-all cursor-pointer"
                style={{ background: mainColor }}
              >
                <Calendar className="w-3.5 h-3.5" /> Agendar Horário
              </a>

              {/* Botão de Sair */}
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/40 transition-colors cursor-pointer"
                title="Sair da página do salão"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>

          </div>
        </header>

        {/* ======================================================== */}
        {/* 2. HERO SECTION COM CAPA DE ALTO IMPACTO                  */}
        {/* ======================================================== */}
        <section className="relative overflow-hidden bg-zinc-950 text-white">
          {/* Imagem de Fundo / Capa */}
          <div className="absolute inset-0 z-0">
            {salonData.cover ? (
              <img 
                src={salonData.cover} 
                alt={salonData.name} 
                className="w-full h-full object-cover object-center opacity-30 transform scale-105 transition-transform duration-1000" 
              />
            ) : (
              <div 
                className="w-full h-full opacity-35"
                style={{ background: `linear-gradient(135deg, ${mainColor} 0%, #18181b 100%)` }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/30" />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 lg:py-24">
            <div className="max-w-3xl">
              
              {/* Badges de Destaque */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge variant="outline" className="bg-white/10 backdrop-blur-md text-white border-white/20 text-xs font-semibold py-1 px-3">
                  <Sparkles className="w-3 h-3 text-amber-400 mr-1.5" /> Salão Verificado BelezaPura
                </Badge>
                <div className="flex items-center gap-1 bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full font-bold text-xs border border-amber-500/30">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>5.0 (Avaliações Excelentes)</span>
                </div>
              </div>

              {/* Título Principal */}
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]">
                {salonData.name}
              </h1>

              {/* Descrição / Sobre */}
              <p className="mt-4 text-sm sm:text-base lg:text-lg text-zinc-300 leading-relaxed max-w-2xl">
                {salonData.about || "Espaço especializado em beleza, autocuidado e estética de alto padrão. Atendimento exclusivo com hora marcada e os melhores especialistas da região."}
              </p>

              {/* Endereço Resumido */}
              {addressText && (
                <div className="flex items-center gap-2 mt-4 text-xs sm:text-sm text-zinc-300">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span className="truncate">{addressText}</span>
                </div>
              )}

              {/* CTAs de Ação Imediata */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#servicos"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-extrabold text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  style={{ background: mainColor }}
                >
                  <Calendar className="w-4 h-4" /> Agendar Meu Horário
                </a>

                {waUrl && (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" /> Falar no WhatsApp
                  </a>
                )}

                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" /> Como Chegar
                  </a>
                )}
              </div>

            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 3. FAIXA DE DIFERENCIAIS E GARANTIAS                     */}
        {/* ======================================================== */}
        <section className="bg-card border-b border-border py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-muted/40 border border-border/50">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-foreground">Sem Espera</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Pontualidade com hora marcada</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-muted/40 border border-border/50">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-foreground">Reserva Garantida</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Anti-furo no sistema</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-muted/40 border border-border/50">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-foreground">Especialistas Top</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Equipe qualificada e certificada</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-muted/40 border border-border/50">
                <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-foreground">Alerta no Zap</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Lembrete antes do horário</p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 4. CATÁLOGO DE PROCEDIMENTOS & AGENDAMENTO (#servicos)    */}
        {/* ======================================================== */}
        <section id="servicos" className="py-12 sm:py-16 max-w-6xl mx-auto px-4 sm:px-6 w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <Badge variant="outline" className="text-xs font-semibold text-primary border-primary/30 mb-2">
                Cardápio de Procedimentos
              </Badge>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-foreground tracking-tight">
                Escolha o serviço desejado
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Selecione um procedimento para escolher o especialista, dia e horário ideal
              </p>
            </div>

            {/* Campo de Busca em Tempo Real */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar procedimento..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-border bg-card text-xs sm:text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Categorias em Pílulas */}
          {serviceCategories.length > 2 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
              {serviceCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setServiceFilter(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    serviceFilter === cat
                      ? "text-white shadow-sm"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  style={serviceFilter === cat ? { background: mainColor } : {}}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Grid de Serviços */}
          {filteredServices.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground bg-card border border-border rounded-3xl">
              <Scissors className="w-10 h-10 mx-auto mb-3 opacity-40 text-primary" />
              <p className="text-sm font-semibold">Nenhum procedimento encontrado.</p>
              <p className="text-xs mt-1">Tente buscar por outro termo ou selecione a categoria "Todos".</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredServices.map((service: any) => {
                const sPrice = Number(service.price || 0);
                const sDeposit = depositForPrice(sPrice);
                return (
                  <div 
                    key={service.id}
                    className="p-5 sm:p-6 rounded-3xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-xl flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 group-hover:scale-110 transition-transform">
                          <Scissors className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-muted-foreground flex items-center gap-1 bg-muted/60 px-2.5 py-1 rounded-lg">
                          <Clock className="w-3 h-3" /> {service.duration} min
                        </span>
                      </div>

                      <h3 className="font-serif text-base sm:text-lg font-bold text-foreground leading-snug">
                        {service.name}
                      </h3>
                      {service.desc && (
                        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                          {service.desc}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-border flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-muted-foreground block font-medium">Valor total</span>
                        <div className="font-extrabold text-base sm:text-lg text-foreground">
                          R$ {sPrice.toFixed(2).replace('.', ',')}
                        </div>
                        {sDeposit > 0 && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                            Sinal: R$ {sDeposit.toFixed(2).replace('.', ',')}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setSelectedService(service);
                          setSelectedTime(null);
                          setShowSummaryModal(false);
                          setStep("booking");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                        style={{ background: mainColor }}
                      >
                        Agendar <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ======================================================== */}
        {/* 5. NOSSA EQUIPE DE ESPECIALISTAS (#equipe)               */}
        {/* ======================================================== */}
        {professionals.length > 0 && (
          <section id="equipe" className="py-12 sm:py-16 bg-card border-y border-border">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="text-center max-w-xl mx-auto mb-10">
                <Badge variant="outline" className="text-xs font-semibold text-primary border-primary/30 mb-2">
                  Especialistas
                </Badge>
                <h2 className="font-serif text-2xl sm:text-4xl font-bold text-foreground tracking-tight">
                  Conheça nossa equipe
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Profissionais dedicados a transformar sua beleza com atendimento personalizado
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {professionals.map((pro: any) => (
                  <div 
                    key={pro.id}
                    className="p-5 rounded-3xl bg-background border border-border text-center flex flex-col items-center hover:shadow-lg transition-all"
                  >
                    {pro.avatar ? (
                      <img src={pro.avatar} alt={pro.name} className="w-20 h-20 rounded-2xl object-cover shadow-md mb-3" />
                    ) : (
                      <div 
                        className="w-20 h-20 rounded-2xl flex items-center justify-center font-serif text-xl font-bold text-white shadow-md mb-3"
                        style={{ background: mainColor }}
                      >
                        {pro.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <h3 className="font-serif text-base font-bold text-foreground">{pro.name}</h3>
                    <p className="text-xs text-primary font-medium mt-0.5">{pro.role || "Especialista"}</p>
                    <div className="flex items-center gap-1 text-[11px] text-amber-500 font-semibold mt-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>5.0</span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedPro(pro);
                        const target = document.getElementById("servicos");
                        if (target) target.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="mt-4 w-full py-2 px-3 rounded-xl text-xs font-semibold border border-border hover:border-primary text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                    >
                      Escolher profissional
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 6. GALERIA DE FOTOS E TRABALHOS (#fotos)                 */}
        {/* ======================================================== */}
        {gallery.length > 0 && (
          <section id="fotos" className="py-12 sm:py-16 max-w-6xl mx-auto px-4 sm:px-6 w-full">
            <div className="text-center max-w-xl mx-auto mb-10">
              <Badge variant="outline" className="text-xs font-semibold text-primary border-primary/30 mb-2">
                Portfólio & Espaço
              </Badge>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-foreground tracking-tight">
                Galeria de transformações
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Confira alguns dos trabalhos realizados pelas nossas mãos
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {gallery.map((img: string, idx: number) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group shadow-md bg-zinc-900">
                  <img 
                    src={img} 
                    alt={`Foto ${idx + 1}`} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                    <Sparkles className="w-5 h-5 text-amber-300" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 7. DEPOIMENTOS DE CLIENTES (#avaliacoes)                  */}
        {/* ======================================================== */}
        {reviews.length > 0 && (
          <section id="avaliacoes" className="py-12 sm:py-16 bg-card border-y border-border">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="text-center max-w-xl mx-auto mb-10">
                <Badge variant="outline" className="text-xs font-semibold text-primary border-primary/30 mb-2">
                  Prova Social
                </Badge>
                <h2 className="font-serif text-2xl sm:text-4xl font-bold text-foreground tracking-tight">
                  O que nossas clientes dizem
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  A experiência de quem já confiou na nossa equipe
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {reviews.slice(0, 3).map((r: any, idx: number) => (
                  <div key={idx} className="p-5 sm:p-6 rounded-3xl bg-background border border-border shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-amber-500 mb-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-xs sm:text-sm text-foreground/90 italic leading-relaxed">
                        "{r.comment || "Atendimento impecável! Pontualidade, ambiente acolhedor e resultado perfeito."}"
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">
                        {(r.author || "C")[0]}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-foreground block">{r.author || "Cliente Satisfeita"}</span>
                        <span className="text-[10px] text-muted-foreground">{r.date || "Atendimento recente"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 8. HORÁRIOS & LOCALIZAÇÃO (#local)                       */}
        {/* ======================================================== */}
        <section id="local" className="py-12 sm:py-16 max-w-6xl mx-auto px-4 sm:px-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* Horários de Funcionamento */}
            <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-xs">
              <h3 className="font-serif text-xl font-bold text-foreground flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary" /> Horários de Funcionamento
              </h3>
              <div className="divide-y divide-border/60 text-xs sm:text-sm">
                {[
                  { day: "Segunda-feira", key: "mon" },
                  { day: "Terça-feira", key: "tue" },
                  { day: "Quarta-feira", key: "wed" },
                  { day: "Quinta-feira", key: "thu" },
                  { day: "Sexta-feira", key: "fri" },
                  { day: "Sábado", key: "sat" },
                  { day: "Domingo", key: "sun" },
                ].map(({ day, key }) => {
                  const dayData = salonData.hours?.[key];
                  const isOpen = dayData?.isOpen ?? (key !== "sun");
                  const open = dayData?.open || "09:00";
                  const close = dayData?.close || "19:00";
                  return (
                    <div key={key} className="py-2.5 flex items-center justify-between">
                      <span className="text-foreground font-medium">{day}</span>
                      <span className={isOpen ? "text-muted-foreground font-semibold" : "text-red-500 font-semibold text-xs"}>
                        {isOpen ? `${open} - ${close}` : "Fechado"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Políticas e Regras */}
              <div className="mt-6 p-4 rounded-2xl bg-muted/40 border border-border/80 text-xs space-y-1.5">
                <span className="font-bold text-foreground block">Regras & Política do Salão</span>
                <p className="text-muted-foreground leading-relaxed">
                  • <strong>{depositDescription}:</strong> {salonData.depositPolicy === "none" || !salonData.pixKey ? "O pagamento é combinado diretamente com o salão." : "O sinal garante sua reserva e é descontado do valor total."}<br />
                  • <strong>Cancelamento ou Reagendamento:</strong> Solicite com antecedência diretamente pelo WhatsApp oficial.
                </p>
              </div>
            </div>

            {/* Endereço e Mapa */}
            <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-xs space-y-4">
              <h3 className="font-serif text-xl font-bold text-foreground flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Localização & Contato
              </h3>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2 text-xs sm:text-sm">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Endereço Completo</span>
                  <span className="font-semibold text-foreground">{addressText || "Endereço sob consulta com o salão"}</span>
                </div>
                {salonData.phone && (
                  <div>
                    <span className="text-muted-foreground block text-[11px]">WhatsApp / Contato</span>
                    <span className="font-semibold text-foreground">{salonData.phone}</span>
                  </div>
                )}
              </div>

              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold bg-primary text-white flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-all cursor-pointer"
                  style={{ background: mainColor }}
                >
                  <MapPin className="w-4 h-4" /> Traçar Rota no Google Maps
                </a>
              )}

              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" /> Conversar no WhatsApp
                </a>
              )}
            </div>

          </div>
        </section>

        {/* ======================================================== */}
        {/* 9. RODAPÉ DA LANDING PAGE                                */}
        {/* ======================================================== */}
        <footer className="bg-background border-t border-border py-8 mt-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-foreground">{salonData.name}</span>
              <span>•</span>
              <span>Agendamento Online</span>
            </div>

            <div className="flex items-center gap-4">
              <span>Powered by <strong>BelezaPura</strong></span>
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-1 text-red-600 dark:text-red-400 hover:underline font-semibold cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Sair
              </button>
            </div>
          </div>
        </footer>

        {/* ======================================================== */}
        {/* 10. STICKY BOTTOM BAR NO MOBILE (MD:HIDDEN)               */}
        {/* ======================================================== */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-3 bg-background/95 backdrop-blur-md border-t border-border z-40 shadow-2xl flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="font-serif text-xs font-bold text-foreground block truncate">{salonData.name}</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Agenda Online Aberta
            </span>
          </div>
          <a
            href="#servicos"
            className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-md cursor-pointer shrink-0"
            style={{ background: mainColor }}
          >
            Agendar Horário
          </a>
        </div>

      </div>
    );
  }

  // ================================================================
  // PASSOS DE AGENDAMENTO (booking, data, pix, confirm)
  // Layout focado, moderno e 100% responsivo para Mobile & Desktop
  // ================================================================
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-stone-100 dark:bg-zinc-950 font-sans p-0 sm:p-4 md:p-6 text-foreground selection:bg-primary/20">
      {/* Container Principal de Agendamento */}
      <div className="relative w-full max-w-xl min-h-[100dvh] sm:min-h-[750px] sm:max-h-[92vh] bg-background sm:rounded-[2rem] overflow-hidden shadow-2xl flex flex-col border border-border/80">
        
        {/* Barra Superior Unificada dos Passos de Agendamento */}
        <header className="p-3.5 sm:p-4 border-b border-border bg-card shrink-0 flex items-center justify-between gap-2">
          <button 
            onClick={() => setStep("home")} 
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Voltar para a página do salão"
          >
            <ArrowLeft className="w-4 h-4" /> 
            <span className="hidden sm:inline">Página do Salão</span>
            <span className="sm:hidden">Voltar</span>
          </button>

          <div className="text-center truncate px-2">
            <span className="font-serif text-xs sm:text-sm font-bold text-foreground block truncate">
              {salonData.name}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {step === "booking" && "1. Escolha Data e Horário"}
              {step === "data" && "2. Identificação"}
              {step === "pix" && "3. Pagamento do Sinal"}
              {step === "confirm" && "4. Agendamento Concluído"}
            </span>
          </div>

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 px-2 py-1 rounded-lg transition-colors cursor-pointer"
            title="Sair do agendamento"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </header>

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
                        aria-label={`Escolher data ${d.dateObj.getFullYear()}-${String(d.dateObj.getMonth() + 1).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`}
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
            <footer className="p-3.5 sm:p-4 border-t border-border bg-card/95 backdrop-blur-md shrink-0 flex items-center justify-between gap-2.5 sm:gap-3 shadow-lg z-20">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] sm:text-[11px] text-muted-foreground block truncate">
                  {selectedDate && selectedTime ? (
                    <span className="text-foreground font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      {selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às {selectedTime}
                    </span>
                  ) : (
                    "Selecione data e horário acima"
                  )}
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-primary block mt-0.5">
                  Sinal PIX: R$ {depositValue}
                </span>
              </div>

              <Button
                size="lg"
                disabled={!selectedDate || !selectedTime || !selectedPro || !selectedService}
                onClick={() => setShowSummaryModal(true)}
                className="min-h-11 py-2 px-3.5 sm:px-5 rounded-xl font-bold text-xs shadow-md cursor-pointer shrink-0"
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
          <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in p-0 sm:p-4">
            <div className="w-full sm:max-w-md bg-card border-t sm:border border-border rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-slide-up max-h-[90%] overflow-y-auto">
              
              {/* Header do Resumo */}
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2 text-foreground font-serif text-base sm:text-lg font-bold">
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
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground shrink-0">Estabelecimento:</span>
                  <span className="font-bold text-foreground text-right truncate">{salonData.name}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground shrink-0">Procedimento:</span>
                  <span className="font-bold text-foreground text-right truncate">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground shrink-0">Profissional:</span>
                  <span className="font-bold text-foreground text-right truncate">{selectedPro?.name}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground shrink-0">Data e Horário:</span>
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
                  <span>{depositDescription}:</span>
                  <span>R$ {depositValue}</span>
                </div>
              </div>

              {/* Pergunta de Decisão */}
              <div className="p-3.5 bg-primary/10 rounded-xl border border-primary/20 text-center">
                <p className="text-xs font-bold text-foreground">
                  Deseja confirmar este agendamento para seguir?
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {amount > 0 ? `O sinal de R$ ${depositValue} será conferido pelo salão antes da confirmação.` : "Sua reserva será confirmada pelo salão, sem sinal antecipado."}
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
                  className="w-full min-h-11 py-2.5 px-3 text-xs sm:text-sm font-extrabold shadow-md cursor-pointer"
                >
                  Sim, confirmar e agendar
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => setShowSummaryModal(false)}
                  className="w-full min-h-11 py-2.5 px-3 text-xs sm:text-sm font-bold cursor-pointer"
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
                  {amount > 0 ? <>O sinal de <strong>R$ {depositValue}</strong> via Pix será conferido pelo salão. O restante é pago no atendimento.</> : "Esta reserva não exige sinal antecipado. Aguarde a confirmação do salão."}
                </div>
              </div>

              {salonData.depositPolicy === "optional" && salonData.pixKey && (
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={payDeposit} onChange={e => setPayDeposit(e.target.checked)} />
                  Quero pagar o sinal opcional no Pix
                </label>
              )}
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
                    O salão poderá entrar em contato por este WhatsApp para confirmar o atendimento.
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
                className="w-full min-h-12 py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm shadow-md cursor-pointer"
              >
                {isSubmitting ? "Registrando reserva..." : amount > 0 ? `Gerar PIX do Sinal (R$ ${depositValue})` : "Confirmar reserva sem sinal"}
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
              <div className="w-full max-w-sm p-5 sm:p-6 bg-card border border-border rounded-3xl shadow-xs space-y-4">
                <h3 className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                  Sinal para Garantia da Vaga
                </h3>
                <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  R$ {depositValue}
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground">Use o Pix Copia e Cola no aplicativo do seu banco.</p>

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
                    className="w-full min-h-11 py-2.5 px-3 text-xs sm:text-sm font-bold gap-2 cursor-pointer"
                  >
                    {copiedPix ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    {copiedPix ? "Código PIX Copiado!" : "Copiar Código PIX Copia e Cola"}
                  </Button>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Abra o app do seu banco, selecione <strong>PIX Copia e Cola</strong> e cole o código acima para efetuar a reserva.
                  </p>

                  {/* Alerta de Confirmação de Pagamento PIX */}
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-left flex items-start gap-2.5 mt-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-[11px] text-amber-800 dark:text-amber-200 leading-tight">
                      <strong>Reserva Garantida:</strong> Após efetuar o PIX, conclua abaixo para que o salão identifique seu pagamento e confirme seu atendimento.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <footer className="p-4 border-t border-border bg-card shrink-0 space-y-2">
              <Button
                size="lg"
                onClick={() => setStep("confirm")}
                className="w-full min-h-12 py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm shadow-md cursor-pointer"
              >
                Concluir e aguardar conferência do salão
              </Button>
            </footer>
          </div>
        )}

        {/* ======================================================== */}
        {/* PASSO 5: CONFIRMADO COM SUCESSO (Comprovante WhatsApp)   */}
        {/* ======================================================== */}
        {step === "confirm" && (
          <div className="flex-1 flex flex-col items-center justify-center p-5 sm:p-6 text-center bg-background animate-fade-up space-y-5 sm:space-y-6 overflow-y-auto">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg animate-bounce shrink-0">
              <Check className="w-8 h-8 sm:w-10 sm:h-10 stroke-[2.5]" />
            </div>

            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                Reserva registrada com sucesso!
              </h2>
              <p className="text-xs text-muted-foreground mt-1.5 max-w-sm mx-auto leading-relaxed">
                Sua solicitação no <strong>{salonData.name}</strong> foi registrada no sistema. {amount > 0 ? "O salão fará a conferência do seu sinal e confirmará seu horário." : "Aguarde a confirmação do atendimento pelo salão."}
              </p>
            </div>

            {/* Cartão de Detalhes Confirmados */}
            <div className="w-full max-w-xs p-4 rounded-2xl bg-card border border-border text-left text-xs space-y-2 shadow-xs">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground shrink-0">Procedimento:</span>
                <span className="font-bold text-foreground text-right truncate">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground shrink-0">Profissional:</span>
                <span className="font-bold text-foreground text-right truncate">{selectedPro?.name}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground shrink-0">Data/Hora:</span>
                <span className="font-extrabold text-primary text-right">
                  {selectedDate?.toLocaleDateString('pt-BR')} às {selectedTime}
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-emerald-600 dark:text-emerald-400 font-bold">
                <span>Sinal PIX:</span>
                <span>{amount > 0 ? `R$ ${depositValue} (aguardando conferência)` : "Sem sinal antecipado"}</span>
              </div>
            </div>

            {/* ALERTA DE LEMBRETE DE HORÁRIO AUTOMÁTICO */}
            <div className="w-full max-w-xs p-3.5 bg-sky-500/10 border border-sky-500/20 rounded-2xl flex items-start gap-2.5 text-left">
              <Clock className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
              <div className="text-xs text-sky-900 dark:text-sky-200">
                <p className="font-bold">Lembrete de Horário Ativado ⏰</p>
                <p className="text-[11px] opacity-90 mt-0.5 leading-snug">
                  Você receberá um lembrete do seu atendimento no seu WhatsApp antes do seu horário para você não esquecer!
                </p>
              </div>
            </div>

            {/* Ações pós confirmação */}
            <div className="w-full max-w-xs space-y-2.5">
              <Button 
                size="lg" 
                onClick={() => {
                  const sPhone = (salonData.phone || "").replace(/\D/g, "");
                  const waTarget = sPhone ? `55${sPhone.length <= 11 ? sPhone : sPhone.replace(/^55/, '')}` : "";
                  const msg = encodeURIComponent(
                    `Olá ${salonData.name}! ✨\nMeu nome é *${clientName}*.\n\nAcabei de agendar:\n✂️ *Procedimento:* ${selectedService?.name}\n👤 *Profissional:* ${selectedPro?.name}\n📅 *Data:* ${selectedDate?.toLocaleDateString('pt-BR')} às ${selectedTime}\n${amount > 0 ? `💰 *Sinal PIX:* R$ ${depositValue} (envio em anexo)\n` : ''}\nPodem confirmar o agendamento? Obrigado!`
                  );
                  window.open(waTarget ? `https://wa.me/${waTarget}?text=${msg}` : `https://wa.me/?text=${msg}`, "_blank");
                }}
                className="w-full min-h-12 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm gap-2 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
              >
                <Share2 className="w-4 h-4 shrink-0" /> Notificar Salão no WhatsApp
              </Button>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedService(null);
                  setSelectedTime(null);
                  setShowSummaryModal(false);
                  setStep("home");
                }}
                className="w-full min-h-11 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer"
              >
                Voltar à Página do Salão
              </Button>

              <button
                onClick={() => navigate("/")}
                className="w-full py-2 text-xs font-semibold text-muted-foreground hover:text-red-500 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Sair
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
