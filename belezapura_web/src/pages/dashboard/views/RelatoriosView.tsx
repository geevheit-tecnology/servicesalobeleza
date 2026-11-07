import { useState, useEffect, useMemo } from "react";
import { Calendar, Users, DollarSign, X } from "lucide-react";
import { Avatar } from "@/components/ui";
import { StatCard } from "./shared";

export function RelatoriosView() {
  const [period, setPeriod] = useState("mes_atual");
  const [stats, setStats] = useState<any>(null);
  const [pros, setPros] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3050";
    const headers = { Authorization: `Bearer ${token}` };

    fetch(`${apiBase}/api/salon/dashboard`, { headers })
      .then(res => res.json())
      .then(setStats)
      .catch(console.error);

    fetch(`${apiBase}/api/salon/details`, { headers })
      .then(res => res.json())
      .then(d => {
        if (d.professionals) setPros(d.professionals);
      })
      .catch(console.error);

    fetch(`${apiBase}/api/appointments`, { headers })
      .then(res => res.json())
      .then(list => {
        if (Array.isArray(list)) setAppointments(list);
      })
      .catch(console.error);
  }, []);

  const filteredAppointments = useMemo(() => {
    const now = new Date();
    const targetMonth = period === "mes_atual" ? now.getMonth() : (now.getMonth() + 11) % 12;
    const targetYear = period === "mes_atual" ? now.getFullYear() : (now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear());
    return appointments.filter(a => {
      if (!a.date) return period === "mes_atual";
      const d = new Date(a.date);
      if (isNaN(d.getTime())) return period === "mes_atual";
      return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
    });
  }, [appointments, period]);

  const validAppts = useMemo(
    () => filteredAppointments.filter(a => a.status !== "canceled" && a.status !== "cancelled"),
    [filteredAppointments]
  );
  const canceledAppts = useMemo(
    () => filteredAppointments.filter(a => a.status === "canceled" || a.status === "cancelled"),
    [filteredAppointments]
  );

  const totalRev = useMemo(() => {
    if (period === "mes_atual" && validAppts.length === 0 && stats?.monthlyRevenue) {
      return Number(stats.monthlyRevenue);
    }
    return validAppts.reduce((acc, a) => acc + Number(a.value || 0), 0);
  }, [validAppts, stats, period]);

  const totalAppts = filteredAppointments.length || Number(stats?.totalAppointments ?? 0);
  const totalClients = Number(stats?.totalClients ?? stats?.clientsCount ?? 0);
  const ticketMedio = validAppts.length > 0 ? totalRev / validAppts.length : 0;
  const maiorTicket = validAppts.reduce((max, a) => Math.max(max, Number(a.value || 0)), 0);
  const cancelRate = totalAppts > 0 ? Math.round((canceledAppts.length / totalAppts) * 100) : 0;
  const conversionRate = totalAppts > 0 ? 100 - cancelRate : 100;

  const topServices = useMemo(() => {
    const map: Record<string, { name: string; count: number; revenue: number }> = {};
    for (const a of validAppts) {
      const sName = a.service?.name || a.serviceName || "Atendimento";
      if (!map[sName]) map[sName] = { name: sName, count: 0, revenue: 0 };
      map[sName].count += 1;
      map[sName].revenue += Number(a.value || 0);
    }
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [validAppts]);

  const prosPerformance = useMemo(() => {
    return pros.map(p => {
      const proAppts = validAppts.filter(a => a.professionalId === p.id || a.professional?.id === p.id);
      const rev = proAppts.reduce((sum, a) => sum + Number(a.value || 0), 0);
      return {
        ...p,
        count: proAppts.length,
        revenue: rev,
      };
    });
  }, [pros, validAppts]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-medium">Relatórios de Desempenho</h1>
        <select
          value={period}
          onChange={e => setPeriod(e.target.value)}
          className="h-9 px-3 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary"
        >
          <option value="mes_atual">Mês Atual</option>
          <option value="mes_anterior">Mês Anterior</option>
        </select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Faturamento no período"
          value={`R$ ${totalRev.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="emerald"
        />
        <StatCard label="Agendamentos" value={String(totalAppts)} icon={Calendar} color="primary" />
        <StatCard label="Base de clientes" value={String(totalClients)} icon={Users} color="purple" />
        <StatCard
          label="Cancelamentos"
          value={String(canceledAppts.length)}
          sub={`taxa: ${cancelRate}%`}
          icon={X}
          color="rose"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl shadow-sm p-5">
          <h3 className="font-semibold mb-4">Serviços mais realizados</h3>
          {topServices.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
              Nenhum serviço registrado no período selecionado.
            </div>
          ) : (
            <div className="space-y-3">
              {topServices.map(s => (
                <div key={s.name} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.count} atendimento(s)</div>
                  </div>
                  <div className="font-semibold text-emerald-700">
                    R$ {s.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm p-5">
          <h3 className="font-semibold mb-4">Desempenho por profissional</h3>
          {prosPerformance.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
              Nenhum profissional cadastrado.
            </div>
          ) : (
            <div className="space-y-3">
              {prosPerformance.map(p => (
                <div key={p.id || p.name} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    <Avatar name={p.name} size="xs" />
                    <span className="font-medium">{p.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium block">
                      R$ {p.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{p.count} atendimento(s)</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-border">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Ticket médio", `R$ ${ticketMedio.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
                ["Maior ticket", `R$ ${maiorTicket.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
                ["Taxa de conclusão", `${conversionRate}%`],
                ["Clientes cadastrados", String(totalClients)],
              ].map(([k, v]) => (
                <div key={String(k)} className="bg-secondary rounded-xl p-3">
                  <div className="text-muted-foreground text-xs">{k}</div>
                  <div className="font-semibold mt-0.5">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
