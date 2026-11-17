import { useState, useEffect } from "react";
import { LayoutDashboard, Calendar, ListOrdered, Users, Scissors, UserCheck, Clock, DollarSign, BarChart3, Settings, Star, Globe, Menu, X, Bell, ChevronDown, TrendingUp, TrendingDown, Plus, Search, Filter, Eye, Edit3, Trash2, MoreHorizontal, MessageCircle, Percent, Building2, Zap, ArrowUpRight, ArrowDownRight, Check, ArrowLeft, ChevronRight, LogOut, Package, Download, AlertTriangle, XCircle } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Button, Badge, Avatar, Card, Stars } from "@/components/ui";
import { NAV, revenueData, appointmentsData, servicesPie, PIE_COLORS, appointments, clients, professionals, reviewsList, AGENDA_HOURS, AGENDA_PROS, AGENDA_ITEMS, statusColors, statusLabel, StatCard, allServices } from "./shared";

export function NovoAgendamentoModal({ onClose, onCreated }: { onClose: () => void; onCreated?: () => void }) {
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3050";
  const [step, setStep] = useState(1);
  const [salonId, setSalonId] = useState("");
  const [selServiceId, setSelServiceId] = useState("");
  const [selProId, setSelProId] = useState("");
  const [selDate, setSelDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  });
  const [selTime, setSelTime] = useState("");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [slotDates, setSlotDates] = useState<Record<string, string>>({});
  const [slotPros, setSlotPros] = useState<Record<string, string>>({});
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [prosList, setProsList] = useState<any[]>([]);
  const [salonSchedule, setSalonSchedule] = useState<any[]>([]);

  const selectedService = servicesList.find(s => s.id === selServiceId);
  const resolvedProId = selProId === "any" ? (slotPros[selTime] || prosList[0]?.id || "") : selProId;
  const selectedPro = prosList.find(p => p.id === resolvedProId);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${apiBase}/api/salon/details`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.id) setSalonId(data.id);
          if (Array.isArray(data.services)) {
            setServicesList(data.services.filter((s: any) => s.status !== "inactive" && s.status !== "deleted"));
          }
          if (Array.isArray(data.professionals)) {
            const activePros = data.professionals.filter((p: any) => p.status !== "inactive" && p.status !== "deleted");
            setProsList(activePros);
            if (activePros.length === 1) setSelProId(activePros[0].id);
          }
          if (data.scheduleRaw) {
            try {
              const parsed = JSON.parse(data.scheduleRaw);
              if (Array.isArray(parsed)) setSalonSchedule(parsed);
            } catch {}
          }
        })
        .catch(console.error);
    }
  }, [apiBase]);

  useEffect(() => {
    if (step !== 2 || !salonId || !selServiceId || !selProId || !selDate) return;
    const targetPros = selProId === "any" ? prosList : prosList.filter(p => p.id === selProId);
    if (targetPros.length === 0) return;

    let cancelled = false;
    setLoadingTimes(true);
    setAvailabilityError("");
    setSelTime("");
    setAvailableTimes([]);
    setSlotDates({});
    setSlotPros({});

    Promise.all(
      targetPros.map(async pro => {
        const res = await fetch(
          `${apiBase}/api/public/availability?salonId=${salonId}&date=${selDate}&professionalId=${pro.id}&serviceId=${selServiceId}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao consultar horários.");
        return { proId: pro.id, available: Array.isArray(data.available) ? data.available : [], slots: data.slots || {} };
      })
    )
      .then(results => {
        if (cancelled) return;
        const mergedTimes: string[] = [];
        const nextSlotDates: Record<string, string> = {};
        const nextSlotPros: Record<string, string> = {};
        for (const r of results) {
          for (const t of r.available) {
            if (!nextSlotDates[t] && r.slots[t]) {
              mergedTimes.push(t);
              nextSlotDates[t] = r.slots[t];
              nextSlotPros[t] = r.proId;
            }
          }
        }
        mergedTimes.sort();
        setAvailableTimes(mergedTimes);
        setSlotDates(nextSlotDates);
        setSlotPros(nextSlotPros);
      })
      .catch(err => {
        if (cancelled) return;
        // Fallback para horários do expediente caso a consulta falhe
        const fallbackSlots: string[] = [];
        const fallbackDates: Record<string, string> = {};
        const fallbackPros: Record<string, string> = {};
        const [y, m, d] = selDate.split("-").map(Number);
        const targetDay = new Date(y, m - 1, d);
        const weekDaysPt = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];
        const dayPrefix = weekDaysPt[targetDay.getDay()];
        const dayCfg = salonSchedule.find((s: any) =>
          String(s.day || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").startsWith(dayPrefix)
        );
        if (!dayCfg || dayCfg.open !== false) {
          const [sh, sm] = String(dayCfg?.start || "09:00").split(":").map(Number);
          const [eh, em] = String(dayCfg?.end || "19:00").split(":").map(Number);
          const duration = Number(selectedService?.duration) || 30;
          let cur = sh * 60 + sm;
          const endMin = eh * 60 + em;
          while (cur + duration <= endMin) {
            const hh = String(Math.floor(cur / 60)).padStart(2, "0");
            const mm = String(cur % 60).padStart(2, "0");
            const label = `${hh}:${mm}`;
            const dt = new Date(y, m - 1, d, Math.floor(cur / 60), cur % 60, 0, 0);
            if (dt.getTime() > Date.now()) {
              fallbackSlots.push(label);
              fallbackDates[label] = dt.toISOString();
              fallbackPros[label] = targetPros[0].id;
            }
            cur += 30;
          }
        }
        setAvailableTimes(fallbackSlots);
        setSlotDates(fallbackDates);
        setSlotPros(fallbackPros);
        if (fallbackSlots.length === 0) {
          setAvailabilityError(err instanceof Error ? err.message : "Erro ao consultar horários.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingTimes(false);
      });

    return () => {
      cancelled = true;
    };
  }, [step, salonId, selServiceId, selProId, selDate, apiBase, prosList, salonSchedule, selectedService?.duration]);

  const done = step === 4;

  const handleConfirm = async () => {
    if (isSubmitting) return;
    const token = localStorage.getItem("token");
    if (!token) {
      setSubmitError("Sessão expirada. Faça login novamente.");
      return;
    }
    const timestamp = slotDates[selTime];
    const proId = resolvedProId;
    if (!timestamp || !proId || !selServiceId) {
      setSubmitError("Selecione um horário válido antes de confirmar.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    try {
      const cleanDigits = clientPhone.replace(/\D/g, "");
      let clientId = "";
      const clientsRes = await fetch(`${apiBase}/api/salon/clients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (clientsRes.ok) {
        const existingClients = await clientsRes.json();
        if (Array.isArray(existingClients)) {
          const match = existingClients.find((c: any) =>
            cleanDigits && String(c.phone || "").replace(/\D/g, "") === cleanDigits
          );
          if (match?.id) clientId = match.id;
        }
      }

      if (!clientId) {
        const createClientRes = await fetch(`${apiBase}/api/salon/clients`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: clientName.trim(),
            phone: clientPhone.trim()
          })
        });
        const clientData = await createClientRes.json();
        if (!createClientRes.ok || !clientData.id) {
          throw new Error(clientData.error || "Não foi possível cadastrar o cliente.");
        }
        clientId = clientData.id;
      }

      const apptRes = await fetch(`${apiBase}/api/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          clientId,
          professionalId: proId,
          serviceId: selServiceId,
          date: timestamp
        })
      });
      const apptData = await apptRes.json().catch(() => ({}));
      if (!apptRes.ok) {
        throw new Error(apptData.error || apptData.message || "Não foi possível registrar o agendamento.");
      }

      window.dispatchEvent(new CustomEvent("belezapura:appointments-updated"));
      onCreated?.();
      setStep(4);
    } catch (err: any) {
      setSubmitError(err?.message || "Erro ao registrar agendamento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h3 className="font-semibold">Novo agendamento</h3>
            {!done && <p className="text-xs text-muted-foreground mt-0.5">Passo {step} de 3</p>}
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>

        {!done && (
          <div className="px-5 pt-3">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(step / 3) * 100}%` }} />
            </div>
          </div>
        )}

        <div className="p-5 space-y-4">
          {done ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                <Check className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-lg">Agendamento criado!</h3>
              <p className="text-muted-foreground text-sm mt-1">
                {clientName || "Cliente"} — {selectedService?.name} com {selectedPro?.name || "Profissional"}
              </p>
              <p className="text-sm font-medium text-primary mt-1">
                {selDate.split("-").reverse().join("/")} às {selTime}
              </p>
              <Button className="w-full mt-4" onClick={onClose}>Fechar</Button>
            </div>
          ) : step === 1 ? (
            <>
              <div>
                <label className="text-sm font-medium block mb-2">Serviço</label>
                <div className="grid grid-cols-2 gap-2">
                  {servicesList.length === 0 ? (
                    <div className="col-span-2 text-center py-6 text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                      Nenhum serviço cadastrado ainda.<br />Cadastre serviços na aba "Serviços".
                    </div>
                  ) : (
                    servicesList.map(s => (
                      <button key={s.id || s.name} type="button" onClick={() => setSelServiceId(s.id)}
                        className={`p-3 rounded-xl border text-left text-sm transition-all cursor-pointer ${selServiceId === s.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                        <div className="font-medium text-xs">{s.name}</div>
                        <div className="text-muted-foreground text-xs mt-0.5">{s.duration} min · R$ {Number(s.price || 0).toFixed(2).replace(".", ",")}</div>
                      </button>
                    ))
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Profissional</label>
                {prosList.length === 0 ? (
                  <div className="text-center py-4 text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                    Nenhum profissional ativo cadastrado.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => setSelProId("any")}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${selProId === "any" ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/30"}`}>
                      Qualquer
                    </button>
                    {prosList.map(p => (
                      <button key={p.id} type="button" onClick={() => setSelProId(p.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${selProId === p.id ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/30"}`}>
                        {p.name.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : step === 2 ? (
            <>
              <div>
                <label className="text-sm font-medium block mb-2">Data</label>
                <input
                  type="date"
                  value={selDate}
                  min={(() => {
                    const n = new Date();
                    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
                  })()}
                  onChange={e => setSelDate(e.target.value)}
                  className="w-full h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Horário disponível</label>
                {loadingTimes ? (
                  <div className="py-6 text-center text-xs text-muted-foreground">Consultando horários disponíveis...</div>
                ) : availabilityError ? (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 text-center">{availabilityError}</div>
                ) : availableTimes.length === 0 ? (
                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-800 text-center">
                    Não há horários disponíveis para esta data. Escolha outra data ou verifique a aba "Horários".
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
                    {availableTimes.map(t => (
                      <button key={t} type="button" onClick={() => setSelTime(t)}
                        className={`py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer ${selTime === t ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/30"}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {submitError && (
                <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">
                  {submitError}
                </div>
              )}
              <div>
                <label className="text-sm font-medium block mb-1.5">Nome do cliente</label>
                <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Nome completo"
                  className="w-full h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-background" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">WhatsApp</label>
                <input value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="(11) 99999-0000"
                  className="w-full h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-background" />
              </div>
              <div className="bg-secondary rounded-xl p-3 text-sm space-y-1.5">
                <div className="font-medium text-xs text-muted-foreground mb-2">Resumo</div>
                {[
                  ["Serviço", selectedService?.name || "—"],
                  ["Profissional", selectedPro?.name || "—"],
                  ["Data", selDate.split("-").reverse().join("/")],
                  ["Horário", selTime]
                ].map(([k, v]) => (
                  <div key={String(k)} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {!done && (
          <div className="flex items-center justify-between p-5 border-t border-border">
            <Button variant="ghost" size="sm" onClick={() => { setSubmitError(""); step > 1 ? setStep(s => s - 1) : onClose(); }}>
              {step === 1 ? "Cancelar" : <><ArrowLeft className="w-4 h-4" /> Voltar</>}
            </Button>
            <Button
              size="sm"
              disabled={
                isSubmitting ||
                (step === 1 && (!selServiceId || !selProId)) ||
                (step === 2 && (!selDate || !selTime)) ||
                (step === 3 && (!clientName.trim() || clientPhone.replace(/\D/g, "").length < 8))
              }
              onClick={() => {
                if (step < 3) {
                  setStep(s => s + 1);
                } else {
                  handleConfirm();
                }
              }}
            >
              {isSubmitting ? (
                "Salvando..."
              ) : step === 3 ? (
                <><Check className="w-4 h-4" /> Confirmar</>
              ) : (
                <>Continuar <ChevronRight className="w-4 h-4" /></>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}