import { useState, useEffect } from "react";
import { LayoutDashboard, Calendar, ListOrdered, Users, Scissors, UserCheck, Clock, DollarSign, BarChart3, Settings, Star, Globe, Menu, X, Bell, ChevronDown, TrendingUp, TrendingDown, Plus, Search, Filter, Eye, Edit3, Trash2, MoreHorizontal, MessageCircle, Percent, Building2, Zap, ArrowUpRight, ArrowDownRight, Check, ArrowLeft, ChevronRight, LogOut, Package, Download, AlertTriangle, XCircle } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Button, Badge, Avatar, Card, Stars } from "@/components/ui";
import { NAV, revenueData, appointmentsData, servicesPie, PIE_COLORS, appointments, clients, professionals, reviewsList, AGENDA_HOURS, AGENDA_PROS, AGENDA_ITEMS, statusColors, statusLabel, StatCard } from "./shared";

export function FinanceiroView() {
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/salon/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(setStats)
      .catch(console.error);

      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/appointments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(json => {
        if (Array.isArray(json)) {
          const list = json.map((a: any) => ({
            desc: `${a.service?.name || "Serviço"} — ${a.client?.name || "Cliente"}`,
            type: "entrada",
            value: `R$ ${a.value || 0}`,
            date: new Date(a.date).toLocaleDateString('pt-BR'),
            method: a.paymentMethod || "PIX"
          }));
          setTransactions(list);
        }
      })
      .catch(console.error);
    }
  }, []);

  const totalRevenue = Number(stats?.monthlyRevenue ?? stats?.revenue ?? 0);

  return (
    <div className="p-6 space-y-6">
      <h1 className="font-serif text-2xl font-medium">Financeiro</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Receitas do mês" value={`R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={TrendingUp} color="emerald" />
        <StatCard label="Despesas" value="R$ 0,00" icon={TrendingDown} color="rose" />
        <StatCard label="Saldo" value={`R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={DollarSign} color="primary" />
        <StatCard label="A receber" value="R$ 0,00" sub="0 pagamentos" icon={Zap} color="amber" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Movimentações recentes</h3>
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
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${m.type === "entrada" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"}`}>
                      {m.type === "entrada" ? "↑" : "↓"}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{m.desc}</div>
                      <div className="text-xs text-muted-foreground">{m.date} · {m.method}</div>
                    </div>
                  </div>
                  <span className={`font-semibold text-sm ${m.type === "entrada" ? "text-emerald-600" : "text-red-500"}`}>
                    +{m.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5">
            <h3 className="font-semibold mb-4">Formas de pagamento</h3>
            {transactions.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Sem dados registrados.</p>
            ) : (
              <div className="space-y-3">
                {[["PIX", "100%", "#B8614A"]].map(([m, pct, color]) => (
                  <div key={String(m)} className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-16">{m}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: String(pct), background: String(color) }} />
                    </div>
                    <span className="text-xs font-medium w-8 text-right">{pct}</span>
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