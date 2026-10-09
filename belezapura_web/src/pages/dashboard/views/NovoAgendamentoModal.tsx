import { useState, useEffect } from "react";
import { LayoutDashboard, Calendar, ListOrdered, Users, Scissors, UserCheck, Clock, DollarSign, BarChart3, Settings, Star, Globe, Menu, X, Bell, ChevronDown, TrendingUp, TrendingDown, Plus, Search, Filter, Eye, Edit3, Trash2, MoreHorizontal, MessageCircle, Percent, Building2, Zap, ArrowUpRight, ArrowDownRight, Check, ArrowLeft, ChevronRight, LogOut, Package, Download, AlertTriangle, XCircle } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Button, Badge, Avatar, Card, Stars } from "@/components/ui";
import { NAV, revenueData, appointmentsData, servicesPie, PIE_COLORS, appointments, clients, professionals, reviewsList, AGENDA_HOURS, AGENDA_PROS, AGENDA_ITEMS, statusColors, statusLabel, StatCard } from "./shared";

export function NovoAgendamentoModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [selService, setSelService] = useState("");
  const [selPro, setSelPro] = useState("");
  const [selDate, setSelDate] = useState("");
  const [selTime, setSelTime] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  const done = step === 4;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow shadow-2xl w-full max-w-md">
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
              <p className="text-muted-foreground text-sm mt-1">{clientName || "Cliente"} — {selService} com {selPro}</p>
              <p className="text-sm font-medium text-primary mt-1">{selDate} às {selTime}</p>
              <Button className="w-full mt-4" onClick={onClose}>Fechar</Button>
            </div>
          ) : step === 1 ? (
            <>
              <div>
                <label className="text-sm font-medium block mb-2">Serviço</label>
                <div className="grid grid-cols-2 gap-2">
                  {allServices.filter(s => s.status === "active").map(s => (
                    <button key={s.name} onClick={() => setSelService(s.name)}
                      className={`p-3 rounded-xl border text-left text-sm transition-all ${selService === s.name ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                      <div className="font-medium text-xs">{s.name}</div>
                      <div className="text-muted-foreground text-xs mt-0.5">{s.duration} · {s.price}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Profissional</label>
                <div className="flex gap-2">
                  {["Qualquer", ...professionals.map(p => p.name.split(" ")[0])].map(p => (
                    <button key={p} onClick={() => setSelPro(p)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selPro === p ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/30"}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : step === 2 ? (
            <>
              <div>
                <label className="text-sm font-medium block mb-2">Data</label>
                <input type="date" value={selDate} onChange={e => setSelDate(e.target.value)}
                  className="w-full h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-background" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Horário</label>
                <div className="grid grid-cols-4 gap-2">
                  {["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00"].map(t => (
                    <button key={t} onClick={() => setSelTime(t)}
                      className={`py-2 rounded-lg text-sm font-medium border transition-all ${selTime === t ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/30"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
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
                {[["Serviço", selService], ["Profissional", selPro], ["Data", selDate], ["Horário", selTime]].map(([k, v]) => (
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
            <Button variant="ghost" size="sm" onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}>
              {step === 1 ? "Cancelar" : <><ArrowLeft className="w-4 h-4" /> Voltar</>}
            </Button>
            <Button size="sm" disabled={step === 1 && (!selService || !selPro)}
              onClick={() => step < 3 ? setStep(s => s + 1) : setStep(4)}>
              {step === 3 ? <><Check className="w-4 h-4" /> Confirmar</> : <>Continuar <ChevronRight className="w-4 h-4" /></>}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}