import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Phone, MessageCircle, Check, Copy, ChevronRight, Calendar, User, Scissors, Sparkles, X } from "lucide-react";
import { Button, Avatar, Stars } from "@/components/ui";

const SALON_HERO = "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=500&fit=crop&auto=format";
const SALON_1 = "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=300&fit=crop&auto=format";
const SALON_2 = "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop&auto=format";

const TIMES = ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00", "15:30", "16:00", "17:00", "17:30"];
const UNAVAILABLE = ["09:30", "11:00", "15:00"];

type BookingStep = "salon" | "service" | "professional" | "date" | "time" | "data" | "summary" | "pix" | "confirm";

function QRCode() {
  return (
    <svg viewBox="0 0 200 200" className="w-48 h-48" fill="none">
      <rect width="200" height="200" fill="white" />
      {Array.from({ length: 10 }).map((_, r) =>
        Array.from({ length: 10 }).map((_, c) => {
          const filled = (r + c) % 3 !== 0 && !((r < 3 && c < 3) || (r < 3 && c > 6) || (r > 6 && c < 3));
          return filled ? <rect key={`${r}-${c}`} x={20 + c * 16} y={20 + r * 16} width={14} height={14} rx={1} fill="#1C1714" /> : null;
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
  const { slug } = useParams();
  const navigate = useNavigate();

  const [salonData, setSalonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState<BookingStep>("salon");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedPro, setSelectedPro] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [paymentState, setPaymentState] = useState<"pending" | "confirmed">("pending");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    
    fetch(`http://localhost:3050/api/public/salons/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setSalonData(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando página do salão...</div>;
  }

  if (!salonData && slug) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">Salão não encontrado (URL: {slug})</div>;
  }

  const goBack = () => {
    const prev: Record<BookingStep, BookingStep | null> = {
      salon: null, service: "salon", professional: "service", date: "professional",
      time: "date", data: "time", summary: "data", pix: "summary", confirm: "pix",
    };
    const p = prev[step];
    if (p) setStep(p);
  };

  const services = salonData?.services || [];
  const professionals = salonData?.professionals || [];

  const stepLabel: Record<BookingStep, string> = {
    salon: "Salão", service: "Escolha o serviço", professional: "Profissional",
    date: "Data", time: "Horário", data: "Seus dados", summary: "Resumo",
    pix: "Pagamento PIX", confirm: "Confirmado!",
  };

  const bookingSteps: BookingStep[] = ["service", "professional", "date", "time", "data", "summary", "pix", "confirm"];
  const currentBookingIdx = bookingSteps.indexOf(step);

  const confirmBooking = async () => {
    try {
      const res = await fetch('http://localhost:3050/api/public/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salonId: salonData.id,
          clientName: clientName || "Cliente Web",
          clientPhone: clientPhone,
          serviceId: selectedService.id,
          professionalId: selectedPro.id,
          date: new Date(2024, 9, selectedDate || 1, parseInt(selectedTime?.split(':')[0] || "9"), parseInt(selectedTime?.split(':')[1] || "0")).toISOString(),
          value: parseFloat(selectedService.price)
        })
      });
      if (res.ok) {
        setStep("confirm");
      }
    } catch (e) {
      console.error(e);
      alert('Erro ao confirmar agendamento.');
    }
  };

  return (
    <div className="flex flex-col items-center bg-muted/30 min-h-full py-8 px-4">
      <div className="w-full max-w-sm bg-background rounded-3xl overflow-hidden shadow-2xl border border-border" style={{ minHeight: 700 }}>
        
        {/* Salon Page */}
        {step === "salon" && (
          <div className="flex flex-col">
            <div className="relative h-56 bg-muted">
              <img src={SALON_HERO} alt="Capa do salão" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow mb-2">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <h1 className="text-white font-serif text-2xl font-medium">{salonData?.name || "Salão Demo"}</h1>
                  </div>
                  <Stars rating={4.9} count={12} />
                </div>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <Button size="lg" className="w-full" onClick={() => setStep("service")}>
                <Calendar className="w-4 h-4" /> Agendar horário
              </Button>
              
              <div className="bg-secondary rounded-xl p-3 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>Seg–Sáb: 9h–19h</span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-3">Serviços</h3>
                <div className="space-y-2">
                  {services.slice(0, 3).map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                      <div>
                        <div className="font-medium text-sm">{s.name}</div>
                        <div className="text-muted-foreground text-xs">{s.duration} min</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm text-primary">R$ {s.price}</div>
                        <button onClick={() => { setSelectedService(s); setStep("professional"); }} className="text-xs text-primary hover:underline">Agendar</button>
                      </div>
                    </div>
                  ))}
                  {services.length > 3 && (
                    <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => setStep("service")}>
                      Ver todos os serviços
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Booking Flow */}
        {step !== "salon" && (
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 p-4 border-b border-border">
              {step !== "confirm" && (
                <button onClick={goBack} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div className="flex-1">
                <div className="font-semibold text-sm">{stepLabel[step]}</div>
              </div>
              <button onClick={() => setStep("salon")} className="p-1.5 rounded-lg hover:bg-muted">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              
              {/* Step: Service */}
              {step === "service" && (
                <div className="space-y-3">
                  {services.map((s: any) => (
                    <div
                      key={s.id}
                      onClick={() => { setSelectedService(s); setStep("professional"); }}
                      className="flex gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:border-primary/40 bg-card"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{s.name}</div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {s.duration} min
                          </span>
                          <span className="font-semibold text-primary text-sm">R$ {s.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Step: Professional */}
              {step === "professional" && (
                <div className="space-y-3">
                  {professionals.map((p: any) => (
                    <div
                      key={p.id}
                      onClick={() => { setSelectedPro(p); setStep("date"); }}
                      className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer hover:border-primary/40 bg-card"
                    >
                      <Avatar name={p.name} />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.specialty || "Profissional"}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ))}
                  {professionals.length === 0 && (
                    <div className="text-sm text-center text-muted-foreground">
                      Nenhum profissional cadastrado.
                    </div>
                  )}
                </div>
              )}

              {/* Step: Date */}
              {step === "date" && (
                <div>
                  <div className="mb-4"><h3 className="font-semibold">Novembro 2024</h3></div>
                  <div className="grid grid-cols-7 gap-1">
                    {[null, null, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((d, i) => (
                      <button
                        key={i}
                        disabled={!d}
                        onClick={() => d && setSelectedDate(d)}
                        className={`aspect-square rounded-xl text-sm font-medium transition-all ${
                          !d ? "invisible" : selectedDate === d ? "bg-primary text-primary-foreground shadow" : "hover:bg-secondary text-foreground"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                  {selectedDate && (
                    <Button className="w-full mt-4" onClick={() => setStep("time")}>
                      Continuar
                    </Button>
                  )}
                </div>
              )}

              {/* Step: Time */}
              {step === "time" && (
                <div>
                  <p className="text-sm text-muted-foreground mb-4">Horários disponíveis</p>
                  <div className="grid grid-cols-3 gap-2">
                    {TIMES.map(t => (
                      <button
                        key={t}
                        onClick={() => { setSelectedTime(t); setStep("data"); }}
                        className={`py-2.5 rounded-xl text-sm font-medium border ${selectedTime === t ? "bg-primary text-white" : "hover:border-primary"}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step: Data */}
              {step === "data" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Seu nome</label>
                    <input value={clientName} onChange={e => setClientName(e.target.value)} className="w-full h-11 border rounded-xl px-3 text-sm outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5">WhatsApp</label>
                    <input value={clientPhone} onChange={e => setClientPhone(e.target.value)} className="w-full h-11 border rounded-xl px-3 text-sm outline-none focus:border-primary" />
                  </div>
                  <Button className="w-full" onClick={() => setStep("summary")}>Revisar agendamento</Button>
                </div>
              )}

              {/* Step: Summary */}
              {step === "summary" && (
                <div>
                  <div className="bg-secondary rounded-2xl p-4 space-y-3 mb-4">
                    <h3 className="font-semibold">Resumo</h3>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Serviço</span><span>{selectedService?.name}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Profissional</span><span>{selectedPro?.name}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Data/Hora</span><span>{selectedDate}/11 às {selectedTime}</span></div>
                    <div className="border-t pt-3 flex justify-between font-medium"><span>Valor total</span><span className="text-primary">R$ {selectedService?.price}</span></div>
                  </div>
                  <Button className="w-full" onClick={() => setStep("pix")}>Pagar via PIX e Reservar</Button>
                </div>
              )}

              {/* Step: PIX */}
              {step === "pix" && (
                <div className="text-center">
                  <h3 className="font-semibold mb-1">Pagamento da reserva</h3>
                  <div className="flex justify-center mb-4"><div className="p-3 bg-white rounded-2xl border shadow-sm"><QRCode /></div></div>
                  <Button className="w-full" onClick={() => { setPaymentState("confirmed"); setTimeout(confirmBooking, 1000); }}>
                    {paymentState === "confirmed" ? "Confirmando..." : "Simular Pagamento Confirmado"}
                  </Button>
                </div>
              )}

              {/* Step: Confirm */}
              {step === "confirm" && (
                <div className="text-center py-4">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h2 className="font-serif text-2xl font-medium text-emerald-700 mb-6">Confirmado!</h2>
                  <Button size="sm" className="w-full" onClick={() => setStep("salon")}>Voltar ao início</Button>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
