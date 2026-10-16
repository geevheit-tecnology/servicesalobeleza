import { useState, useEffect } from "react";
import { LayoutDashboard, Calendar, ListOrdered, Users, Scissors, UserCheck, Clock, DollarSign, BarChart3, Settings, Star, Globe, Menu, X, Bell, ChevronDown, TrendingUp, TrendingDown, Plus, Search, Filter, Eye, Edit3, Trash2, MoreHorizontal, MessageCircle, Percent, Building2, Zap, ArrowUpRight, ArrowDownRight, Check, ArrowLeft, ChevronRight, LogOut, Package, Download, AlertTriangle, XCircle } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Button, Badge, Avatar, Card, Stars } from "@/components/ui";
import { NAV, revenueData, appointmentsData, servicesPie, PIE_COLORS, appointments, clients, professionals, reviewsList, AGENDA_HOURS, AGENDA_PROS, AGENDA_ITEMS, statusColors, statusLabel, StatCard } from "./shared";

export function RelatoriosView() {
  const [period, setPeriod] = useState("mes_atual");
  const [stats, setStats] = useState<any>(null);
  const [pros, setPros] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/salon/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(setStats)
      .catch(console.error);

      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/salon/details`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(d => {
        if (d.professionals) setPros(d.professionals);
      })
      .catch(console.error);
    }
  }, []);

  const totalRev = Number(stats?.monthlyRevenue ?? stats?.revenue ?? 0);
  const totalAppts = Number(stats?.totalAppointments ?? 0);
  const totalClients = Number(stats?.totalClients ?? stats?.clientsCount ?? 0);
  const ticketMedio = totalAppts > 0 ? totalRev / totalAppts : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-medium">Relatórios</h1>
        <select value={period} onChange={e => setPeriod(e.target.value)}
          className="h-9 px-3 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary appearance-none">
          <option value="mes_atual">Mês Atual</option>
          <option value="mes_anterior">Mês Anterior</option>
        </select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Faturamento" value={`R$ ${totalRev.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={DollarSign} color="emerald" />
        <StatCard label="Agendamentos" value={String(totalAppts)} icon={Calendar} color="primary" />
        <StatCard label="Novos clientes" value={String(totalClients)} icon={Users} color="purple" />
        <StatCard label="Cancelamentos" value="0" sub="taxa: 0%" icon={X} color="rose" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5">
          <h3 className="font-semibold mb-4">Serviços mais vendidos</h3>
          <div className="text-center py-12 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
            Nenhum serviço registrado no período selecionado.
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5">
          <h3 className="font-semibold mb-4">Desempenho por profissional</h3>
          {pros.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
              Nenhum profissional cadastrado com atendimentos.
            </div>
          ) : (
            <div className="space-y-3">
              {pros.map((p, idx) => (
                <div key={p.id || p.name} className="flex items-center justify-between text-sm py-1 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    <Avatar name={p.name} size="xs" />
                    <span className="font-medium">{p.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">0 atendimentos</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-border">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Ticket médio", `R$ ${ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
                ["Maior ticket", "R$ 0,00"],
                ["Taxa de conversão", "100%"],
                ["Clientes novos", String(totalClients)]
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