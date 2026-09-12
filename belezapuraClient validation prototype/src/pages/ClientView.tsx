import { useState } from "react";
import { ArrowLeft, Star, MapPin, Clock, Phone, MessageCircle, Check, Copy, ChevronRight, Calendar, User, Scissors, Sparkles, X } from "lucide-react";
import { Button, Badge, Avatar, Stars } from "@/components/ui";

const SALON_HERO = "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=500&fit=crop&auto=format";
const SALON_1 = "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=300&fit=crop&auto=format";
const SALON_2 = "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop&auto=format";
const SALON_3 = "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400&h=300&fit=crop&auto=format";
const SALON_4 = "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400&h=300&fit=crop&auto=format";

const services = [
  { id: 1, name: "Escova Progressiva", category: "Cabelo", desc: "Alinhamento com keratina profissional", duration: "120 min", price: "R$ 180", img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&h=150&fit=crop&auto=format" },
  { id: 2, name: "Manicure", category: "Unhas", desc: "Cutícula + esmaltação gel", duration: "45 min", price: "R$ 55", img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=200&h=150&fit=crop&auto=format" },
  { id: 3, name: "Corte Feminino", category: "Cabelo", desc: "Corte + finalização", duration: "60 min", price: "R$ 90", img: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&h=150&fit=crop&auto=format" },
  { id: 4, name: "Massagem Relaxante", category: "Massagem", desc: "60 min corpo inteiro", duration: "60 min", price: "R$ 130", img: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=200&h=150&fit=crop&auto=format" },
  { id: 5, name: "Sobrancelha Design", category: "Sobrancelhas", desc: "Design + henna ou tinta", duration: "30 min", price: "R$ 40", img: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=150&fit=crop&auto=format" },
  { id: 6, name: "Bronzeamento", category: "Estética", desc: "Cabine UV com bronzeado uniforme", duration: "20 min", price: "R$ 80", img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&h=150&fit=crop&auto=format" },
];

const professionals = [
  { id: 0, name: "Qualquer disponível", specialty: "", rating: 0 },
  { id: 1, name: "Ana Carvalho", specialty: "Especialista em Cabelos", rating: 4.9, img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&auto=format" },
  { id: 2, name: "Mariana Souza", specialty: "Manicure & Pedicure", rating: 4.8, img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&h=80&fit=crop&auto=format" },
  { id: 3, name: "Juliana Costa", specialty: "Massoterapeuta", rating: 5.0, img: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&auto=format" },
];

const testimonials = [
  { name: "Fernanda R.", rating: 5, text: "Atendimento impecável! Adorei o resultado da escova.", date: "Há 3 dias" },
  { name: "Camila P.", rating: 5, text: "Profissionais incríveis e espaço super aconchegante.", date: "Há 1 semana" },
  { name: "Beatriz M.", rating: 4, text: "Pontualidade excelente. Voltarei com certeza.", date: "Há 2 semanas" },
];

const TIMES = ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00", "15:30", "16:00", "17:00", "17:30"];
const UNAVAILABLE = ["09:30", "11:00", "15:00"];

const CALENDAR_DAYS = [
  { day: "D", dates: [null, null, null, 1, 2, 3, 4] },
];
const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const CATEGORIES = ["Todos", "Cabelo", "Unhas", "Massagem", "Sobrancelhas", "Estética"];

type BookingStep = "salon" | "service" | "professional" | "date" | "time" | "data" | "summary" | "pix" | "confirm";

function QRCode() {
  return (
    <svg viewBox="0 0 200 200" className="w-48 h-48" fill="none">
      <rect width="200" height="200" fill="white" />
      {/* QR mock pattern */}
      {Array.from({ length: 10 }).map((_, r) =>
        Array.from({ length: 10 }).map((_, c) => {
          const filled = (r + c) % 3 !== 0 && !((r < 3 && c < 3) || (r < 3 && c > 6) || (r > 6 && c < 3));
          return filled ? (
            <rect key={`${r}-${c}`} x={20 + c * 16} y={20 + r * 16} width={14} height={14} rx={1} fill="#1C1714" />
          ) : null;
        })
      )}
      <rect x="20" y="20" width="52" height="52" rx="4" fill="none" stroke="#1C1714" strokeWidth="4" />
      <rect x="30" y="30" width="32" height="32" rx="2" fill="#1C1714" />
      <rect x="128" y="20" width="52" height="52" rx="4" fill="none" stroke="#1C1714" strokeWidth="4" />
      <rect x="138" y="30" width="32" height="32" rx="2" fill="#1C1714" />
      <rect x="20" y="128" width="52" height="52" rx="4" fill="none" stroke="#1C1714" strokeWidth="4" />
      <rect x="30" y="138" width="32" height="32" rx="2" fill="#1C1714" />
    </svg>
  );
}

export default function ClientView() {
  const [step, setStep] = useState<BookingStep>("salon");
  const [selectedService, setSelectedService] = useState<typeof services[0] | null>(null);
  const [selectedPro, setSelectedPro] = useState<typeof professionals[0] | null>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [copied, setCopied] = useState(false);
  const [paymentState, setPaymentState] = useState<"pending" | "confirmed">("pending");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [reminder, setReminder] = useState(true);

  const goBack = () => {
    const prev: Record<BookingStep, BookingStep | null> = {
      salon: null, service: "salon", professional: "service", date: "professional",
      time: "date", data: "time", summary: "data", pix: "summary", confirm: "pix",
    };
    const p = prev[step];
    if (p) setStep(p);
  };

  const filteredServices = activeCategory === "Todos" ? services : services.filter(s => s.category === activeCategory);

  const stepLabel: Record<BookingStep, string> = {
    salon: "Salão", service: "Escolha o serviço", professional: "Profissional",
    date: "Data", time: "Horário", data: "Seus dados", summary: "Resumo",
    pix: "Pagamento PIX", confirm: "Confirmado!",
  };

  const bookingSteps: BookingStep[] = ["service", "professional", "date", "time", "data", "summary", "pix", "confirm"];
  const currentBookingIdx = bookingSteps.indexOf(step);

  return (
    <div className="flex flex-col items-center bg-muted/30 min-h-full py-8 px-4">
      <div className="w-full max-w-sm bg-background rounded-3xl overflow-hidden shadow-2xl border border-border" style={{ minHeight: 700 }}>

        {/* Salon Page */}
        {step === "salon" && (
          <div className="flex flex-col">
            <div className="relative h-56 bg-muted">
              <img src={SALON_HERO} alt="Salão Rosé" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow mb-2">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <h1 className="text-white font-serif text-2xl font-medium">Salão Rosé</h1>
                    <p className="text-white/80 text-xs mt-0.5">Cabelo · Unhas · Estética</p>
                  </div>
                  <Stars rating={4.9} count={327} />
                </div>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* CTA */}
              <Button size="lg" className="w-full" onClick={() => setStep("service")}>
                <Calendar className="w-4 h-4" /> Agendar horário
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="w-full">
                  <MessageCircle className="w-4 h-4 text-emerald-500" /> WhatsApp
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <MapPin className="w-4 h-4 text-blue-500" /> Como chegar
                </Button>
              </div>

              {/* Info */}
              <div className="bg-secondary rounded-xl p-3 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>Rua das Flores, 142 — Moema, SP</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>Seg–Sáb: 9h–19h · Dom: fechado</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>(11) 99999-0000</span>
                </div>
              </div>

              {/* Gallery */}
              <div>
                <h3 className="font-semibold text-sm mb-3">Conheça nosso espaço</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[SALON_1, SALON_2, SALON_3, SALON_4].map((img, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden bg-muted">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Services preview */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">Nossos serviços</h3>
                  <button className="text-primary text-xs font-medium" onClick={() => setStep("service")}>Ver todos →</button>
                </div>
                <div className="space-y-2">
                  {services.slice(0, 3).map(s => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                      <div>
                        <div className="font-medium text-sm">{s.name}</div>
                        <div className="text-muted-foreground text-xs">{s.duration}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm text-primary">{s.price}</div>
                        <button onClick={() => { setSelectedService(s); setStep("professional"); }} className="text-xs text-primary hover:underline">Agendar</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Professionals */}
              <div>
                <h3 className="font-semibold text-sm mb-3">Nossa equipe</h3>
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {professionals.slice(1).map(p => (
                    <div key={p.id} className="flex flex-col items-center gap-1.5 shrink-0">
                      <img src={p.img} alt={p.name} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow" />
                      <div className="text-xs font-medium text-center">{p.name.split(" ")[0]}</div>
                      <div className="text-xs text-amber-500">★ {p.rating}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-semibold text-sm">Avaliações</h3>
                  <span className="text-amber-400 font-medium text-sm">4,9 ★</span>
                  <span className="text-muted-foreground text-xs">327 avaliações</span>
                </div>
                {testimonials.map(t => (
                  <div key={t.name} className="py-3 border-b border-border last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{t.name}</span>
                      <span className="text-muted-foreground text-xs">{t.date}</span>
                    </div>
                    <div className="text-amber-400 text-xs mb-1">{"★".repeat(t.rating)}</div>
                    <p className="text-sm text-muted-foreground">{t.text}</p>
                  </div>
                ))}
              </div>

              {/* Map */}
              <div>
                <h3 className="font-semibold text-sm mb-3">Como chegar</h3>
                <div className="h-36 bg-sky-50 rounded-xl overflow-hidden border border-border relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-8 h-8 text-primary mx-auto mb-1" />
                      <div className="text-xs font-medium">Salão Rosé</div>
                      <div className="text-xs text-muted-foreground">Rua das Flores, 142 — Moema</div>
                    </div>
                  </div>
                  {/* Grid lines to simulate map */}
                  <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                    {Array.from({ length: 8 }).map((_, i) => <line key={`h${i}`} x1="0" y1={i * 20} x2="100%" y2={i * 20} stroke="#94a3b8" strokeWidth="1" />)}
                    {Array.from({ length: 12 }).map((_, i) => <line key={`v${i}`} x1={i * 32} y1="0" x2={i * 32} y2="100%" stroke="#94a3b8" strokeWidth="1" />)}
                  </svg>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2">
                  <MapPin className="w-4 h-4" /> Abrir no Google Maps
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Booking Steps */}
        {step !== "salon" && (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border">
              {step !== "confirm" && (
                <button onClick={goBack} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div className="flex-1">
                <div className="font-semibold text-sm">{stepLabel[step]}</div>
                {currentBookingIdx >= 0 && (
                  <div className="text-xs text-muted-foreground">Passo {currentBookingIdx + 1} de {bookingSteps.length}</div>
                )}
              </div>
              <button onClick={() => setStep("salon")} className="p-1.5 rounded-lg hover:bg-muted">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Progress */}
            {currentBookingIdx >= 0 && (
              <div className="px-4 pt-2">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${((currentBookingIdx + 1) / bookingSteps.length) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4">

              {/* Step: Service */}
              {step === "service" && (
                <div>
                  <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
                    {CATEGORIES.map(c => (
                      <button
                        key={c}
                        onClick={() => setActiveCategory(c)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                          activeCategory === c ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {filteredServices.map(s => (
                      <div
                        key={s.id}
                        onClick={() => { setSelectedService(s); setStep("professional"); }}
                        className={`flex gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:border-primary/40 hover:shadow-sm ${
                          selectedService?.id === s.id ? "border-primary bg-primary/5" : "border-border bg-card"
                        }`}
                      >
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                          <img src={s.img} alt={s.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{s.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{s.desc}</div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {s.duration}
                            </span>
                            <span className="font-semibold text-primary text-sm">{s.price}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step: Professional */}
              {step === "professional" && (
                <div className="space-y-3">
                  {selectedService && (
                    <div className="bg-secondary rounded-xl p-3 flex items-center gap-2 mb-4">
                      <Scissors className="w-4 h-4 text-primary" />
                      <div>
                        <div className="text-xs text-muted-foreground">Serviço selecionado</div>
                        <div className="font-medium text-sm">{selectedService.name}</div>
                      </div>
                      <div className="ml-auto font-semibold text-primary text-sm">{selectedService.price}</div>
                    </div>
                  )}
                  {professionals.map(p => (
                    <div
                      key={p.id}
                      onClick={() => { setSelectedPro(p); setStep("date"); }}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:border-primary/40 ${
                        selectedPro?.id === p.id ? "border-primary bg-primary/5" : "border-border bg-card"
                      }`}
                    >
                      {p.id === 0 ? (
                        <div className="w-12 h-12 rounded-full bg-secondary border-2 border-dashed border-border flex items-center justify-center">
                          <User className="w-5 h-5 text-muted-foreground" />
                        </div>
                      ) : (
                        <img src={p.img} alt={p.name} className="w-12 h-12 rounded-full object-cover" />
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-sm">{p.name}</div>
                        {p.specialty && <div className="text-xs text-muted-foreground">{p.specialty}</div>}
                        {p.rating > 0 && <div className="text-xs text-amber-500 mt-0.5">★ {p.rating}</div>}
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              )}

              {/* Step: Date */}
              {step === "date" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Outubro 2024</h3>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
                      <div key={i} className="text-center text-xs text-muted-foreground font-medium py-1">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {[null, null, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31].map((d, i) => (
                      <button
                        key={i}
                        disabled={!d || (d !== null && d < 5)}
                        onClick={() => d && setSelectedDate(d)}
                        className={`aspect-square rounded-xl text-sm font-medium transition-all ${
                          !d ? "invisible" :
                          d < 5 ? "text-muted-foreground/30 cursor-not-allowed" :
                          selectedDate === d ? "bg-primary text-primary-foreground shadow" :
                          "hover:bg-secondary text-foreground"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                  {selectedDate && (
                    <Button className="w-full mt-4" onClick={() => setStep("time")}>
                      Continuar com {selectedDate} de outubro
                    </Button>
                  )}
                </div>
              )}

              {/* Step: Time */}
              {step === "time" && (
                <div>
                  <p className="text-sm text-muted-foreground mb-4">Horários disponíveis para {selectedDate} de outubro</p>
                  <div className="grid grid-cols-3 gap-2">
                    {TIMES.map(t => {
                      const unavail = UNAVAILABLE.includes(t);
                      return (
                        <button
                          key={t}
                          disabled={unavail}
                          onClick={() => { setSelectedTime(t); setStep("data"); }}
                          className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                            unavail ? "bg-muted text-muted-foreground/40 border-transparent cursor-not-allowed line-through" :
                            selectedTime === t ? "bg-primary text-primary-foreground border-primary" :
                            "border-border hover:border-primary/40 hover:bg-primary/5"
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step: Data */}
              {step === "data" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Nome completo</label>
                    <input
                      value={clientName}
                      onChange={e => setClientName(e.target.value)}
                      placeholder="Seu nome"
                      className="w-full h-11 rounded-xl border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 bg-card"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Celular / WhatsApp</label>
                    <input
                      value={clientPhone}
                      onChange={e => setClientPhone(e.target.value)}
                      placeholder="(11) 99999-0000"
                      className="w-full h-11 rounded-xl border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 bg-card"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5">E-mail <span className="text-muted-foreground font-normal">(opcional)</span></label>
                    <input
                      placeholder="seu@email.com"
                      className="w-full h-11 rounded-xl border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 bg-card"
                    />
                  </div>
                  <label className="flex items-center gap-3 p-3 bg-secondary rounded-xl cursor-pointer">
                    <div
                      onClick={() => setReminder(v => !v)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${reminder ? "bg-primary border-primary" : "border-border"}`}
                    >
                      {reminder && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm">Quero receber lembrete pelo WhatsApp</span>
                  </label>
                  <Button className="w-full" onClick={() => setStep("summary")}>
                    Continuar
                  </Button>
                </div>
              )}

              {/* Step: Summary */}
              {step === "summary" && (
                <div>
                  <div className="bg-secondary rounded-2xl p-4 space-y-3 mb-4">
                    <h3 className="font-semibold">Resumo do agendamento</h3>
                    {[
                      ["Salão", "Salão Rosé — Moema"],
                      ["Serviço", selectedService?.name || ""],
                      ["Profissional", selectedPro?.id === 0 ? "Qualquer disponível" : selectedPro?.name || ""],
                      ["Data", `${selectedDate} de outubro de 2024`],
                      ["Horário", selectedTime || ""],
                      ["Duração", selectedService?.duration || ""],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{k}</span>
                        <span className="font-medium text-right">{v}</span>
                      </div>
                    ))}
                    <div className="border-t border-border pt-3 flex justify-between">
                      <span className="font-medium">Valor total</span>
                      <span className="font-semibold text-primary">{selectedService?.price}</span>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                    <div className="text-sm font-medium text-amber-800 mb-1">Sinal para reservar</div>
                    <div className="text-2xl font-serif font-medium text-amber-700">R$ 30,00</div>
                    <div className="text-xs text-amber-700 mt-1">Restante pago no salão</div>
                  </div>

                  <Button className="w-full" onClick={() => setStep("pix")}>
                    Pagar sinal e confirmar
                  </Button>
                </div>
              )}

              {/* Step: PIX */}
              {step === "pix" && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-3 py-1 text-xs font-medium mb-4">
                    {paymentState === "pending" ? "⏳ Aguardando pagamento" : "✓ Pagamento confirmado"}
                  </div>
                  <h3 className="font-semibold mb-1">Pagamento da reserva</h3>
                  <p className="text-muted-foreground text-sm mb-4">Escaneie o QR Code ou copie o código PIX</p>

                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-white rounded-2xl border border-border shadow-sm">
                      <QRCode />
                    </div>
                  </div>

                  <div className="text-3xl font-serif font-medium text-primary mb-2">R$ 30,00</div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Seu horário ficará reservado por{" "}
                    <span className="font-semibold text-foreground">10 minutos</span>
                  </p>

                  <div className="bg-secondary rounded-xl p-3 mb-3 flex items-center gap-2 text-left">
                    <div className="flex-1 font-mono text-xs text-muted-foreground truncate">
                      00020126580014BR.GOV.BCB.PIX...salaorose123456
                    </div>
                    <button
                      onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                      className="p-2 rounded-lg bg-primary text-primary-foreground hover:brightness-110 shrink-0"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-center text-muted-foreground mb-4">
                    {copied ? "✓ Código copiado!" : "Copiar código PIX"}
                  </p>

                  <Button className="w-full" onClick={() => { setPaymentState("confirmed"); setTimeout(() => setStep("confirm"), 800); }}>
                    {paymentState === "confirmed" ? "✓ Confirmado!" : "Simuler pagamento confirmado"}
                  </Button>
                </div>
              )}

              {/* Step: Confirm */}
              {step === "confirm" && (
                <div className="text-center py-4">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h2 className="font-serif text-2xl font-medium text-emerald-700 mb-1">Confirmado!</h2>
                  <p className="text-muted-foreground text-sm mb-6">Seu agendamento foi confirmado.</p>

                  <div className="bg-secondary rounded-2xl p-4 text-left space-y-2.5 mb-6">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Nº do agendamento</span>
                      <span className="font-mono font-medium text-foreground">#AGD-2024-8847</span>
                    </div>
                    {[
                      ["Salão", "Salão Rosé"],
                      ["Serviço", selectedService?.name || ""],
                      ["Profissional", selectedPro?.id === 0 ? "A definir" : selectedPro?.name || ""],
                      ["Data", `${selectedDate} de outubro`],
                      ["Horário", selectedTime || ""],
                      ["Valor total", selectedService?.price || ""],
                      ["Sinal pago", "R$ 30,00"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{k}</span>
                        <span className="font-medium">{v}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <Calendar className="w-4 h-4" /> Adicionar ao calendário
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <MessageCircle className="w-4 h-4 text-emerald-500" /> Compartilhar no WhatsApp
                    </Button>
                    <Button size="sm" className="w-full" onClick={() => setStep("salon")}>
                      Voltar ao início
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-4 text-center">
        Visualização mobile — experiência do cliente final
      </p>
    </div>
  );
}
