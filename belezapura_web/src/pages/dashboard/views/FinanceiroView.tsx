import { useState, useEffect, useMemo } from "react";
import { DollarSign, TrendingUp, CheckCircle, Zap } from "lucide-react";
import { StatCard } from "./shared";

export function FinanceiroView() {
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3050";

    fetch(`${apiBase}/api/appointments`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(json => {
        if (Array.isArray(json)) setAppointments(json);
      })
      .catch(console.error);
  }, []);

  const validAppts = useMemo(
    () => appointments.filter(a => a.status !== "canceled" && a.status !== "cancelled"),
    [appointments]
  );

  const doneAppts = useMemo(
    () => validAppts.filter(a => a.status === "done" || a.status === "confirmed"),
    [validAppts]
  );

  const pendingAppts = useMemo(
    () => validAppts.filter(a => a.status !== "done" && a.status !== "confirmed"),
    [validAppts]
  );

  const realizedRevenue = useMemo(
    () => doneAppts.reduce((sum, a) => sum + Number(a.value || 0), 0),
    [doneAppts]
  );

  const pendingRevenue = useMemo(
    () => pendingAppts.reduce((sum, a) => sum + Number(a.value || 0), 0),
    [pendingAppts]
  );

  const totalScheduled = realizedRevenue + pendingRevenue;

  const transactions = useMemo(() => {
    return validAppts.map((a: any) => ({
      desc: `${a.service?.name || "Serviço"} — ${a.client?.name || "Cliente"}`,
      status: a.status,
      valueNum: Number(a.value || 0),
      value: `R$ ${Number(a.value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      date: a.date ? new Date(a.date).toLocaleDateString("pt-BR") : "—",
      method: (a.paymentMethod || "PIX").toUpperCase(),
    }));
  }, [validAppts]);

  const paymentBreakdown = useMemo(() => {
    if (transactions.length === 0) return [];
    const counts: Record<string, number> = {};
    for (const t of transactions) {
      counts[t.method] = (counts[t.method] || 0) + 1;
    }
    const colors: Record<string, string> = {
      PIX: "#B8614A",
      CARTÃO: "#8B5CF6",
      DINHEIRO: "#10B981",
    };
    return Object.entries(counts).map(([method, count]) => {
      const pct = Math.round((count / transactions.length) * 100);
      return {
        method,
        pct: `${pct}%`,
        color: colors[method] || "#B8614A",
      };
    });
  }, [transactions]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="font-serif text-2xl font-medium">Painel Financeiro</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Receita confirmada / concluída"
          value={`R$ ${realizedRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          sub={`${doneAppts.length} atendimento(s)`}
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          label="A receber (pendentes)"
          value={`R$ ${pendingRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          sub={`${pendingAppts.length} agendamento(s)`}
          icon={Zap}
          color="amber"
        />
        <StatCard
          label="Total movimentado"
          value={`R$ ${totalScheduled.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={TrendingUp}
          color="primary"
        />
        <StatCard
          label="Ticket médio"
          value={`R$ ${(validAppts.length > 0 ? totalScheduled / validAppts.length : 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="purple"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Movimentações de atendimentos</h3>
          </div>
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
              Nenhuma movimentação registrada no período.
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((m, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-emerald-100 text-emerald-600">
                      ↑
                    </div>
                    <div>
                      <div className="font-medium text-sm">{m.desc}</div>
                      <div className="text-xs text-muted-foreground">
                        {m.date} · {m.method} · {m.status === "done" ? "Concluído" : m.status === "confirmed" ? "Confirmado" : "Pendente"}
                      </div>
                    </div>
                  </div>
                  <span className="font-semibold text-sm text-emerald-600">+{m.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl shadow-sm p-5">
            <h3 className="font-semibold mb-4">Formas de pagamento</h3>
            {paymentBreakdown.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Sem dados registrados.</p>
            ) : (
              <div className="space-y-3">
                {paymentBreakdown.map(item => (
                  <div key={item.method} className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-20">{item.method}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: item.pct, background: item.color }} />
                    </div>
                    <span className="text-xs font-medium w-10 text-right">{item.pct}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
