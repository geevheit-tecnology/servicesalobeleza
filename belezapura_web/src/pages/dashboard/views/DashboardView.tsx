import { useState, useEffect } from "react";
import { LayoutDashboard, Calendar, ListOrdered, Users, Scissors, UserCheck, Clock, DollarSign, BarChart3, Settings, Star, Globe, Menu, X, Bell, ChevronDown, TrendingUp, TrendingDown, Plus, Search, Filter, Eye, Edit3, Trash2, MoreHorizontal, MessageCircle, Percent, Building2, Zap, ArrowUpRight, ArrowDownRight, Check, ArrowLeft, ChevronRight, LogOut, Package, Download, AlertTriangle, XCircle } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Button, Badge, Avatar, Card, Stars } from "@/components/ui";
import { NAV, revenueData, appointmentsData, servicesPie, PIE_COLORS, appointments, clients, professionals, reviewsList, AGENDA_HOURS, AGENDA_PROS, AGENDA_ITEMS, statusColors, statusLabel, StatCard } from "./shared";

export function DashboardView({ onNewAppointment }: { onNewAppointment: () => void }) {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/salon/dashboard`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium">Painel de Controle ✨</h1>
          <p className="text-muted-foreground text-sm">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <Button size="sm" onClick={onNewAppointment}><Plus className="w-4 h-4" /> Novo agendamento</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Agendamentos hoje" value={stats ? String(stats.appointmentsToday) : "0"} icon={Calendar} color="primary" />
        <StatCard label="Faturamento" value={stats ? `R$ ${stats.revenue}` : "R$ 0"} icon={DollarSign} color="emerald" />
        <StatCard label="Total Agendamentos" value={stats ? String(stats.totalAppointments) : "0"} icon={BarChart3} color="sky" />
        <StatCard label="Total Clientes" value={stats ? String(stats.clientsCount) : "0"} icon={Users} color="purple" />
        <StatCard label="Profissionais" value={stats ? String(stats.prosCount) : "0"} icon={UserCheck} color="rose" />
        <StatCard label="Serviços" value={stats ? String(stats.servicesCount) : "0"} icon={Scissors} color="amber" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Faturamento mensal</h3>
            <Badge variant="outline">Últimos 6 meses</Badge>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#B8614A" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#B8614A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D8" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#7C6F65" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#7C6F65" }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => [`R$ ${v.toLocaleString("pt-BR")}`, "Faturamento"]} />
              <Area type="monotone" dataKey="value" stroke="#B8614A" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5">
          <h3 className="font-semibold mb-4">Serviços por categoria</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={servicesPie} cx="50%" cy="50%" outerRadius={70} dataKey="value">
                {servicesPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {servicesPie.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i] }} />
                  <span className="text-muted-foreground">{s.name}</span>
                </div>
                <span className="font-medium">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Agendamentos por dia</h3>
            <Badge variant="outline">Esta semana</Badge>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={appointmentsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D8" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#7C6F65" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#7C6F65" }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#9B7EA8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Próximos agendamentos</h3>
            <button className="text-primary text-sm hover:underline">Ver todos</button>
          </div>
          <div className="space-y-3">
            {appointments.slice(0, 4).map(a => (
              <div key={a.id} className="flex items-center gap-3">
                <div className="text-center bg-primary/10 rounded-xl p-2 shrink-0 min-w-[3rem]">
                  <div className="text-primary font-semibold text-sm leading-none">{a.time}</div>
                  <div className="text-primary/60 text-xs mt-0.5">{a.date}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{a.client}</div>
                  <div className="text-xs text-muted-foreground">{a.service} · {a.pro.split(" ")[0]}</div>
                </div>
                <Badge variant={a.status === "confirmed" ? "success" : a.status === "waiting" ? "warning" : "danger"} className="shrink-0">
                  {statusLabel[a.status]}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}