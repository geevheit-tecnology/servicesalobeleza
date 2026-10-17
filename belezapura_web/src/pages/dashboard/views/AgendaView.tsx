import { useState, useEffect, useMemo } from "react";
import {
  Calendar as CalendarIcon, Clock, Plus, ChevronLeft, ChevronRight, Check,
  X, AlertCircle, Phone, MessageCircle, Trash2, CheckCircle2, User, Scissors
} from "lucide-react";
import { Button, Badge, Avatar } from "@/components/ui";

const AGENDA_HOURS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
  "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
];

const statusStyles: Record<string, { bg: string; border: string; text: string; label: string }> = {
  confirmed: { bg: "bg-emerald-50 hover:bg-emerald-100/80", border: "border-emerald-300", text: "text-emerald-800", label: "Confirmado" },
  waiting: { bg: "bg-amber-50 hover:bg-amber-100/80", border: "border-amber-300", text: "text-amber-800", label: "Aguardando" },
  done: { bg: "bg-sky-50 hover:bg-sky-100/80", border: "border-sky-300", text: "text-sky-800", label: "Concluído" },
  cancelled: { bg: "bg-red-50 hover:bg-red-100/80", border: "border-red-300", text: "text-red-800", label: "Cancelado" },
};

export function AgendaView({ onNewAppointment }: { onNewAppointment: () => void }) {
  const [view, setView] = useState<"dia" | "semana" | "mes">("dia");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [pros, setPros] = useState<any[]>([]);
  const [rawAppts, setRawAppts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAppt, setSelectedAppt] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const token = localStorage.getItem("token");

  const loadData = () => {
    if (!token) return;
    setLoading(true);

    const p1 = fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3050"}/api/salon/details`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).catch(() => ({}));

    const p2 = fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3050"}/api/appointments`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).catch(() => []);

    Promise.all([p1, p2])
      .then(([details, appts]) => {
        if (details && Array.isArray(details.professionals)) {
          setPros(details.professionals.filter((p: any) => p.status !== "deleted" && p.status !== "inactive"));
        }
        if (Array.isArray(appts)) {
          setRawAppts(appts);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Format header date
  const dateLabel = useMemo(() => {
    return currentDate.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }, [currentDate]);

  const changeDay = (offset: number) => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + offset);
    setCurrentDate(next);
  };

  const setToday = () => {
    setCurrentDate(new Date());
  };

  // Columns for day view: If pros list is empty, display a default column so the agenda never breaks
  const displayPros = useMemo(() => {
    if (pros.length > 0) return pros;
    return [{ id: "default", name: "Equipe Geral", specialty: "Atendimento Geral" }];
  }, [pros]);

  // Filter appointments for the selected day
  const dayAppointments = useMemo(() => {
    const curYear = currentDate.getFullYear();
    const curMonth = currentDate.getMonth();
    const curDate = currentDate.getDate();

    return rawAppts.map((a: any) => {
      const d = a.date ? new Date(a.date) : new Date();
      const timeStr = a.date ? d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "09:00";
      const hourOnly = timeStr.substring(0, 2) + ":00";

      return {
        id: a.id,
        rawDate: d,
        isSameDay: d.getFullYear() === curYear && d.getMonth() === curMonth && d.getDate() === curDate,
        client: a.client?.name || a.clientName || "Cliente",
        clientPhone: a.client?.phone || a.clientPhone || "",
        service: a.service?.name || a.serviceName || "Serviço",
        proId: a.professionalId || a.professional?.id || "",
        proName: a.professional?.name || a.professionalName || "Profissional",
        hour: hourOnly,
        fullTime: timeStr,
        value: a.value ? `R$ ${Number(a.value).toFixed(2).replace(".", ",")}` : "R$ 0,00",
        payment: a.paymentMethod || "A Combinar",
        status: (a.status || "confirmed").toLowerCase(),
      };
    });
  }, [rawAppts, currentDate]);

  const updateApptStatus = async (id: string, newStatus: string) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3050"}/api/appointments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Erro ao atualizar status");
      
      setRawAppts(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
      if (selectedAppt && selectedAppt.id === id) {
        setSelectedAppt({ ...selectedAppt, status: newStatus });
      }
    } catch (e: any) {
      alert(e.message || "Erro ao atualizar");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteAppt = async (id: string) => {
    if (!confirm("Deseja realmente excluir este agendamento?")) return;
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3050"}/api/appointments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Erro ao excluir agendamento");

      setRawAppts(prev => prev.filter(a => a.id !== id));
      setSelectedAppt(null);
    } catch (e: any) {
      alert(e.message || "Erro ao excluir");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1600px] mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-semibold capitalize">{dateLabel}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {dayAppointments.filter(a => a.isSameDay).length} atendimentos para este dia
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Day Navigation */}
          <div className="flex items-center bg-secondary border border-border rounded-xl p-1">
            <button
              onClick={() => changeDay(-1)}
              className="p-1.5 hover:bg-card rounded-lg text-muted-foreground hover:text-foreground transition-all"
              title="Dia anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={setToday}
              className="px-3 py-1 text-xs font-semibold hover:bg-card rounded-lg transition-all"
            >
              Hoje
            </button>
            <button
              onClick={() => changeDay(1)}
              className="p-1.5 hover:bg-card rounded-lg text-muted-foreground hover:text-foreground transition-all"
              title="Próximo dia"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex bg-secondary border border-border rounded-xl p-1">
            {(["dia", "semana", "mes"] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${
                  view === v
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {v === "mes" ? "Mês" : v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>

          <Button size="sm" onClick={onNewAppointment} className="gap-1.5 shadow-sm">
            <Plus className="w-4 h-4" /> Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Main Grid View */}
      {view === "dia" && (
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          {/* Header row with professionals */}
          <div
            className="grid border-b border-border bg-muted/30 sticky top-0 z-10"
            style={{
              gridTemplateColumns: `70px repeat(${displayPros.length}, minmax(180px, 1fr))`
            }}
          >
            <div className="p-3 text-xs font-semibold text-muted-foreground text-center border-r border-border bg-muted/40">
              Horário
            </div>
            {displayPros.map(p => (
              <div key={p.id || p.name} className="p-3 border-r border-border last:border-r-0 flex items-center justify-center gap-2.5">
                <Avatar name={p.name} size="sm" />
                <div className="text-left min-w-0">
                  <div className="font-semibold text-xs sm:text-sm text-foreground truncate">{p.name}</div>
                  <div className="text-[11px] text-primary font-medium truncate">{p.specialty || "Profissional"}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Hours Grid */}
          <div className="overflow-y-auto max-h-[calc(100vh-270px)] divide-y divide-border/60">
            {AGENDA_HOURS.map(hour => (
              <div
                key={hour}
                className="grid transition-colors hover:bg-muted/10"
                style={{
                  gridTemplateColumns: `70px repeat(${displayPros.length}, minmax(180px, 1fr))`,
                  minHeight: "72px"
                }}
              >
                {/* Hour label */}
                <div className="p-2.5 text-xs font-medium text-muted-foreground text-center border-r border-border bg-muted/20 flex items-start justify-center pt-3 select-none">
                  {hour}
                </div>

                {/* Slots per professional */}
                {displayPros.map((pro, pIndex) => {
                  const slotAppts = dayAppointments.filter(a => {
                    if (!a.isSameDay) return false;
                    const matchesHour = a.hour === hour;
                    if (pros.length === 0) return matchesHour;
                    const matchesPro =
                      a.proId === pro.id ||
                      a.proName.toLowerCase().includes(pro.name.toLowerCase().split(" ")[0]);
                    return matchesHour && matchesPro;
                  });

                  return (
                    <div
                      key={pro.id || pIndex}
                      className="border-r border-border/50 last:border-r-0 p-1.5 relative min-h-[72px] flex flex-col gap-1.5"
                    >
                      {slotAppts.map(appt => {
                        const style = statusStyles[appt.status] || statusStyles.confirmed;
                        return (
                          <div
                            key={appt.id}
                            onClick={() => setSelectedAppt(appt)}
                            className={`rounded-xl p-2.5 border transition-all cursor-pointer shadow-sm hover:scale-[1.01] hover:shadow-md ${style.bg} ${style.border}`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className={`font-semibold text-xs truncate ${style.text}`}>{appt.client}</span>
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-white/70 border border-black/5 shrink-0">
                                {appt.fullTime}
                              </span>
                            </div>
                            <div className="text-[11px] text-foreground/80 font-medium truncate flex items-center gap-1">
                              <Scissors className="w-3 h-3 opacity-60 shrink-0" />
                              <span>{appt.service}</span>
                            </div>
                            <div className="flex items-center justify-between mt-1 pt-1 border-t border-black/5 text-[10px] text-muted-foreground">
                              <span>{appt.value}</span>
                              <span className="font-semibold">{style.label}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Week View */}
      {view === "semana" && (
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {[-3, -2, -1, 0, 1, 2, 3].map(offset => {
              const d = new Date(currentDate);
              d.setDate(d.getDate() + offset);
              const isToday = d.toDateString() === new Date().toDateString();
              const isCurrent = d.toDateString() === currentDate.toDateString();

              const apptsThisDay = rawAppts.filter(a => {
                if (!a.date) return false;
                const ad = new Date(a.date);
                return ad.toDateString() === d.toDateString();
              });

              return (
                <div
                  key={offset}
                  onClick={() => {
                    setCurrentDate(d);
                    setView("dia");
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isCurrent
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border hover:border-primary/40 bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase font-bold text-muted-foreground">
                      {d.toLocaleDateString("pt-BR", { weekday: "short" })}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isToday ? "bg-primary text-white" : "text-muted-foreground"}`}>
                      {d.getDate()}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-foreground">
                    {apptsThisDay.length} {apptsThisDay.length === 1 ? "atendimento" : "atendimentos"}
                  </div>
                  <div className="mt-2 space-y-1">
                    {apptsThisDay.slice(0, 3).map((a: any) => (
                      <div key={a.id} className="text-[10px] bg-muted/60 p-1.5 rounded truncate text-foreground/80">
                        {new Date(a.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} • {a.client?.name || a.clientName || "Cliente"}
                      </div>
                    ))}
                    {apptsThisDay.length > 3 && (
                      <div className="text-[9px] text-primary font-medium text-center">
                        +{apptsThisDay.length - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Month View */}
      {view === "mes" && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm text-center">
          <CalendarIcon className="w-12 h-12 text-primary mx-auto mb-3 opacity-80" />
          <h3 className="font-semibold text-base mb-1">Visão Mensal da Agenda</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto mb-4">
            Total de {rawAppts.length} agendamentos registrados no sistema. Clique abaixo para alternar para a visão diária detalhada.
          </p>
          <Button size="sm" variant="outline" onClick={() => setView("dia")}>
            Voltar para Visão Diária
          </Button>
        </div>
      )}

      {/* Appointment Details Drawer / Modal */}
      {selectedAppt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setSelectedAppt(null)}
        >
          <div
            className="w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Scissors className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-base">Detalhes do Agendamento</h3>
                  <p className="text-xs text-muted-foreground">{selectedAppt.fullTime} • {selectedAppt.value}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAppt(null)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-sm">
              <div className="bg-secondary/60 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Cliente</span>
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary" /> {selectedAppt.client}
                  </span>
                </div>
                {selectedAppt.clientPhone && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Telefone</span>
                    <span className="font-medium text-foreground">{selectedAppt.clientPhone}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Serviço</span>
                  <span className="font-medium text-foreground">{selectedAppt.service}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Profissional</span>
                  <span className="font-medium text-foreground">{selectedAppt.proName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Status Atual</span>
                  <Badge variant={selectedAppt.status === "confirmed" ? "success" : selectedAppt.status === "done" ? "info" : selectedAppt.status === "waiting" ? "warning" : "danger"}>
                    {statusStyles[selectedAppt.status]?.label || selectedAppt.status}
                  </Badge>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider">
                  Alterar Situação
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    size="sm"
                    variant={selectedAppt.status === "confirmed" ? "default" : "outline"}
                    className="text-xs h-9"
                    disabled={actionLoading}
                    onClick={() => updateApptStatus(selectedAppt.id, "confirmed")}
                  >
                    <Check className="w-3.5 h-3.5 mr-1" /> Confirmar
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedAppt.status === "done" ? "default" : "outline"}
                    className="text-xs h-9"
                    disabled={actionLoading}
                    onClick={() => updateApptStatus(selectedAppt.id, "done")}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-sky-500" /> Concluir
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedAppt.status === "cancelled" ? "default" : "outline"}
                    className="text-xs h-9 text-red-500 hover:bg-red-50"
                    disabled={actionLoading}
                    onClick={() => updateApptStatus(selectedAppt.id, "cancelled")}
                  >
                    <X className="w-3.5 h-3.5 mr-1" /> Cancelar
                  </Button>
                </div>
              </div>

              {/* Quick WhatsApp Action if phone available */}
              {selectedAppt.clientPhone && (
                <a
                  href={`https://wa.me/55${selectedAppt.clientPhone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-xs shadow-sm transition-all"
                >
                  <MessageCircle className="w-4 h-4" /> Conversar no WhatsApp
                </a>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-muted/10 flex justify-between items-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:bg-red-50 text-xs"
                disabled={actionLoading}
                onClick={() => deleteAppt(selectedAppt.id)}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Excluir Agendamento
              </Button>
              <Button size="sm" variant="outline" onClick={() => setSelectedAppt(null)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default AgendaView;