import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Search, ChevronLeft, ChevronRight, Check } from "lucide-react";

// Imagens de placeholder para dar vida ao app
const SALON_HERO = "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=800&fit=crop&auto=format";
const PRO_IMGS = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop"
];
const SERVICE_IMGS = [
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1516975080661-46bce0aa8610?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1512496015851-a1fbbfc6146a?w=200&h=200&fit=crop"
];

const TIMES = ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00", "15:30", "16:00", "17:00", "17:30"];

type BookingStep = "home" | "booking" | "data" | "confirm";

// Componente da curva SVG para separar a foto do conteúdo
function WaveCurve() {
  return (
    <svg viewBox="0 0 1440 320" className="absolute -bottom-1 left-0 w-full z-10" preserveAspectRatio="none" style={{ height: '80px' }}>
      <path fill="#ffffff" fillOpacity="1" d="M0,192L48,197.3C96,203,192,213,288,197.3C384,181,480,139,576,144C672,149,768,203,864,213.3C960,224,1056,192,1152,165.3C1248,139,1344,117,1392,106.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
    </svg>
  );
}

function WaveCurvePink() {
  return (
    <svg viewBox="0 0 1440 320" className="absolute -bottom-1 left-0 w-full z-10" preserveAspectRatio="none" style={{ height: '120px' }}>
      <path fill="#ffffff" fillOpacity="1" d="M0,128L60,144C120,160,240,192,360,181.3C480,171,600,117,720,112C840,107,960,149,1080,176C1200,203,1320,213,1380,218.7L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
    </svg>
  );
}

export default function ClientView() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [salonData, setSalonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState<BookingStep>("home");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedPro, setSelectedPro] = useState<any>(null);
  
  // Lógica do Calendário Real
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/public/salons/${slug}`)
      .then(res => res.json())
      .then(data => { if (!data.error) setSalonData(data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Carregando...</div>;
  if (!salonData && slug) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500">Salão não encontrado</div>;

  const services = salonData?.services || [];
  const professionals = salonData?.professionals || [];

  // Funções de Calendário
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
    
    for (let i = 1; i <= daysCount; i++) {
      const date = new Date(year, month, i);
      const weekDays = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
      const monthsStr = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
      days.push({
        dateObj: date,
        day: i,
        weekStr: weekDays[date.getDay()],
        monthStr: monthsStr[month]
      });
    }
    return days;
  };

  const calendarDays = generateCalendarDays();
  const currentMonthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  const confirmBooking = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/public/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salonId: salonData.id,
          clientName: clientName || "Cliente Web",
          clientPhone,
          serviceId: selectedService.id,
          professionalId: selectedPro.id,
          date: selectedDate?.toISOString(),
          value: parseFloat(selectedService.price)
        })
      });
      if (res.ok) setStep("confirm");
    } catch (e) {
      alert('Erro ao confirmar agendamento.');
    }
  };

  // Tema Pink vibrante da referência
  const COLOR_PINK = "bg-[#FF4B72]";
  const TEXT_PINK = "text-[#FF4B72]";
  const BORDER_PINK = "border-[#FF4B72]";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 font-sans">
      <div className="relative w-full max-w-md h-[100dvh] sm:h-[850px] bg-white sm:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col">
        
        {step === "home" && (
          <div className="flex-1 flex flex-col overflow-y-auto pb-6 bg-[#FAFAFA]">
            {/* Header com Imagem e Curva Branca */}
            <div className="relative h-64 shrink-0">
              <img src={SALON_HERO} alt="Salão" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute top-12 left-6 right-6 flex items-center justify-between text-white">
                <div>
                  <h1 className="text-2xl font-bold shadow-sm">{salonData?.name || "Studio Hair"}</h1>
                  <p className="text-sm font-medium opacity-90 drop-shadow-md flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4" /> Centro, SP
                  </p>
                </div>
              </div>
              <WaveCurve />
            </div>

            {/* Menu Tabs */}
            <div className="flex justify-around px-6 mb-8 mt-2">
              <button className={`font-bold text-sm pb-2 border-b-2 ${BORDER_PINK} ${TEXT_PINK}`}>Serviços</button>
              <button className="font-bold text-sm pb-2 text-gray-400">Profissionais</button>
              <button className="font-bold text-sm pb-2 text-gray-400">Fotos</button>
            </div>

            {/* Serviços em Cards Verticais Vibrantes */}
            <div className="px-6 space-y-6">
              <div className="flex justify-between items-end mb-2">
                <h2 className="text-xl font-bold text-gray-800">Top Serviços</h2>
              </div>
              
              {services.map((s: any, idx: number) => (
                <div key={s.id} onClick={() => { setSelectedService(s); setStep("booking"); }} className="relative bg-white rounded-3xl shadow-md p-4 flex gap-4 cursor-pointer hover:shadow-lg transition-all border border-gray-100">
                  <div className={`w-24 h-24 rounded-2xl overflow-hidden shrink-0 ${COLOR_PINK}`}>
                    <img src={SERVICE_IMGS[idx % SERVICE_IMGS.length]} alt="Serviço" className="w-full h-full object-cover opacity-90 mix-blend-multiply" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="font-bold text-gray-800 text-lg mb-1">{s.name}</h3>
                    <p className="text-xs text-gray-500 mb-3">{s.duration} min de puro cuidado.</p>
                    <div className="flex justify-between items-center mt-auto">
                      <span className={`font-bold text-lg ${TEXT_PINK}`}>R$ {s.price}</span>
                    </div>
                  </div>
                  <button className={`absolute right-0 bottom-0 ${COLOR_PINK} text-white px-5 py-3 rounded-tl-3xl rounded-br-3xl font-bold text-sm shadow-md`}>
                    Agendar ➔
                  </button>
                </div>
              ))}
            </div>

            {/* Profissionais */}
            <div className="px-6 pt-10 pb-10">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Nossos Profissionais</h2>
              <div className="space-y-4">
                {professionals.map((p: any, idx: number) => (
                  <div key={p.id} className="flex items-center gap-4 bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100">
                    <img src={PRO_IMGS[idx % PRO_IMGS.length]} alt="Profissional" className="w-16 h-16 rounded-full object-cover shadow-sm border-2 border-white" />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">{p.name}</h3>
                      <p className="text-xs text-gray-400">Especialista</p>
                      <div className="flex text-amber-400 text-[10px] mt-1">★★★★★</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step: Booking (Agendamento completo com Onda Pink) */}
        {step === "booking" && (
          <div className="flex-1 flex flex-col bg-white overflow-y-auto">
            
            {/* Header curvo rosa gigante */}
            <div className={`relative w-full ${COLOR_PINK} pt-12 pb-24 px-6 shrink-0`}>
              <div className="flex items-center gap-4 mb-4">
                <button onClick={goBack} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-bold text-white">Minha Agenda</h2>
              </div>
              <p className="text-white/80 font-medium ml-14">Escolha a melhor data e horário para o serviço <strong className="text-white">{selectedService?.name}</strong>.</p>
              <WaveCurvePink />
            </div>

            <div className="px-6 flex-1 -mt-16 relative z-20 pb-24">
              
              {/* Calendário: Scroll Horizontal de Cards Gigantes */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-800 font-bold text-lg capitalize">{currentMonthName}</h3>
                  <div className="flex gap-3">
                    <button onClick={() => changeMonth(-1)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"><ChevronLeft className="w-4 h-4" /></button>
                    <button onClick={() => changeMonth(1)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide pt-2">
                  {calendarDays.map((d, i) => {
                    const isSelected = selectedDate?.getDate() === d.day && selectedDate?.getMonth() === d.dateObj.getMonth();
                    return (
                      <button 
                        key={i}
                        onClick={() => setSelectedDate(d.dateObj)}
                        className={`shrink-0 w-[85px] h-[110px] rounded-[2rem] flex flex-col items-center justify-center transition-all ${
                          isSelected 
                            ? `${COLOR_PINK} text-white shadow-lg shadow-pink-200/50 scale-105` 
                            : "bg-white text-gray-400 border border-gray-100 hover:border-pink-200"
                        }`}
                      >
                        <span className={`text-xs font-bold mb-1 ${isSelected ? "text-white/80" : "text-gray-400"}`}>{d.monthStr}</span>
                        <span className={`text-3xl font-bold mb-1 ${isSelected ? "text-white" : "text-gray-800"}`}>{d.day}</span>
                        <span className={`text-[10px] font-bold ${isSelected ? "text-white/80" : "text-gray-400"}`}>{d.weekStr}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Profissional Select (Horizontal Circular) */}
              <div className="mb-10">
                <h3 className="text-gray-800 font-bold text-lg mb-4">Com quem?</h3>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {professionals.map((p: any, idx: number) => (
                    <div key={p.id} className="flex flex-col items-center flex-shrink-0 cursor-pointer" onClick={() => setSelectedPro(p)}>
                      <div className={`w-[70px] h-[70px] rounded-full p-1 mb-2 transition-all ${selectedPro?.id === p.id ? "bg-gradient-to-tr from-pink-400 to-orange-300 shadow-md" : "bg-transparent"}`}>
                        <img src={PRO_IMGS[idx % PRO_IMGS.length]} alt="Profissional" className="w-full h-full rounded-full object-cover border-2 border-white" />
                      </div>
                      <span className={`text-xs font-bold ${selectedPro?.id === p.id ? "text-gray-800" : "text-gray-400"}`}>{p.name.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Horários */}
              <div className="mb-8">
                <h3 className="text-gray-800 font-bold text-lg mb-4">Que horas?</h3>
                <div className="grid grid-cols-3 gap-3">
                  {TIMES.map(t => (
                    <button 
                      key={t}
                      onClick={() => setSelectedTime(t)}
                      className={`py-3.5 rounded-[1.5rem] text-sm font-bold transition-all ${
                        selectedTime === t 
                          ? `${COLOR_PINK} text-white shadow-md shadow-pink-200/50 border-transparent` 
                          : "bg-gray-50 text-gray-500 border border-transparent hover:bg-pink-50 hover:text-pink-500"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Bar fixada */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent pt-12">
              <button 
                disabled={!selectedDate || !selectedTime || !selectedService || !selectedPro}
                onClick={() => setStep("data")}
                className={`w-full h-14 rounded-full ${COLOR_PINK} disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-lg shadow-lg shadow-pink-300 transition-all`}
              >
                Confirmar Horário
              </button>
            </div>
          </div>
        )}

        {/* Step: Dados e Pagamento integrados */}
        {step === "data" && (
          <div className="flex-1 flex flex-col bg-white overflow-y-auto">
            <div className={`relative w-full ${COLOR_PINK} pt-12 pb-24 px-6 shrink-0`}>
              <div className="flex items-center gap-4 mb-4">
                <button onClick={goBack} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-bold text-white">Finalizar</h2>
              </div>
              <WaveCurvePink />
            </div>

            <div className="px-6 flex-1 -mt-16 relative z-20 pb-24">
              <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 p-6 mb-8 border border-gray-50">
                <h3 className="font-bold text-gray-800 mb-6 text-lg">Seus Dados</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 mb-2 block uppercase tracking-wider">Nome Completo</label>
                    <input 
                      value={clientName} onChange={e => setClientName(e.target.value)}
                      className="w-full h-14 rounded-2xl bg-gray-50 border-none px-4 outline-none focus:ring-2 focus:ring-pink-400 transition-all text-gray-800 font-bold"
                      placeholder="Ex: Issys Helena"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 mb-2 block uppercase tracking-wider">WhatsApp</label>
                    <input 
                      value={clientPhone} onChange={e => setClientPhone(e.target.value)}
                      className="w-full h-14 rounded-2xl bg-gray-50 border-none px-4 outline-none focus:ring-2 focus:ring-pink-400 transition-all text-gray-800 font-bold"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 p-6 mb-8 border border-gray-50">
                <h3 className="font-bold text-gray-800 mb-4 text-lg">Resumo</h3>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-500 font-medium">Serviço</span>
                  <span className="text-gray-800 font-bold">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-500 font-medium">Profissional</span>
                  <span className="text-gray-800 font-bold">{selectedPro?.name}</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-500 font-medium">Data</span>
                  <span className="text-gray-800 font-bold">{selectedDate?.toLocaleDateString('pt-BR')} às {selectedTime}</span>
                </div>
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                  <span className="font-bold text-gray-800 text-lg">Total</span>
                  <span className={`font-bold text-2xl ${TEXT_PINK}`}>R$ {selectedService?.price}</span>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100">
              <button 
                disabled={!clientName || !clientPhone}
                onClick={confirmBooking}
                className={`w-full h-14 rounded-full ${COLOR_PINK} disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-lg shadow-lg shadow-pink-300 transition-all`}
              >
                Pagar e Agendar
              </button>
            </div>
          </div>
        )}

        {step === "confirm" && (
          <div className={`p-8 flex-1 flex flex-col items-center justify-center text-center ${COLOR_PINK}`}>
            <div className={`w-28 h-28 rounded-full bg-white/20 flex items-center justify-center mb-8 backdrop-blur-md`}>
              <div className={`w-20 h-20 rounded-full bg-white flex items-center justify-center ${TEXT_PINK} shadow-2xl`}>
                <Check className="w-10 h-10" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Confirmado!</h2>
            <p className="text-white/90 font-medium leading-relaxed mb-12 text-lg">
              Sua reserva no <strong className="text-white">{salonData?.name}</strong> foi realizada.
            </p>
            <button 
              onClick={() => setStep("home")}
              className="w-full h-14 rounded-full bg-white text-pink-500 font-bold text-lg shadow-xl"
            >
              Voltar ao início
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
