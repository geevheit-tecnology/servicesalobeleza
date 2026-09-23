import { useState, useEffect } from "react";
import {
  LayoutDashboard, Calendar, ListOrdered, Users, Scissors, UserCheck, Clock,
  DollarSign, BarChart3, Settings, Star, Globe, Menu, X, Bell, ChevronDown,
  TrendingUp, TrendingDown, Plus, Search, Filter, Eye, Edit3, Trash2, MoreHorizontal,
  MessageCircle, Percent, Building2, Zap, ArrowUpRight, ArrowDownRight, Check,
  ArrowLeft, ChevronRight, LogOut
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { Button, Badge, Avatar, Card, Stars } from "@/components/ui";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "agenda", label: "Agenda", icon: Calendar },
  { id: "agendamentos", label: "Agendamentos", icon: ListOrdered },
  { id: "clientes", label: "Clientes", icon: Users },
  { id: "servicos", label: "Serviços", icon: Scissors },
  { id: "profissionais", label: "Profissionais", icon: UserCheck },
  { id: "horarios", label: "Horários", icon: Clock },
  { id: "financeiro", label: "Financeiro", icon: DollarSign },
  { id: "comissoes", label: "Comissões", icon: Percent },
  { id: "pagina", label: "Página do Salão", icon: Globe },
  { id: "avaliacoes", label: "Avaliações", icon: Star },
  { id: "relatorios", label: "Relatórios", icon: BarChart3 },
  { id: "configuracoes", label: "Configurações", icon: Settings },
];

const revenueData = [
  { name: "Jul", value: 8200 }, { name: "Ago", value: 9400 }, { name: "Set", value: 7800 },
  { name: "Out", value: 11200 }, { name: "Nov", value: 10400 }, { name: "Dez", value: 13800 },
];
const appointmentsData = [
  { name: "Seg", value: 8 }, { name: "Ter", value: 12 }, { name: "Qua", value: 10 },
  { name: "Qui", value: 15 }, { name: "Sex", value: 18 }, { name: "Sáb", value: 22 }, { name: "Dom", value: 4 },
];
const servicesPie = [
  { name: "Cabelo", value: 40 }, { name: "Unhas", value: 25 }, { name: "Estética", value: 20 }, { name: "Outros", value: 15 },
];
const PIE_COLORS = ["#B8614A", "#9B7EA8", "#5B8DB8", "#7DC198"];

const appointments = [
  { id: 1, client: "Fernanda Lima", service: "Escova Progressiva", pro: "Ana Carvalho", date: "Hoje", time: "09:00", value: "R$ 180", payment: "PIX", status: "confirmed" },
  { id: 2, client: "Camila Ferreira", service: "Manicure Gel", pro: "Mariana Souza", date: "Hoje", time: "10:00", value: "R$ 65", payment: "Dinheiro", status: "waiting" },
  { id: 3, client: "Beatriz Rocha", service: "Corte + Hidratação", pro: "Ana Carvalho", date: "Hoje", time: "11:30", value: "R$ 130", payment: "Cartão", status: "confirmed" },
  { id: 4, client: "Patrícia Souza", service: "Massagem Relaxante", pro: "Juliana Costa", date: "Hoje", time: "14:00", value: "R$ 130", payment: "PIX", status: "confirmed" },
  { id: 5, client: "Letícia Matos", service: "Design Sobrancelha", pro: "Ana Carvalho", date: "Hoje", time: "15:00", value: "R$ 40", payment: "PIX", status: "cancelled" },
  { id: 6, client: "Sandra Oliveira", service: "Bronzeamento", pro: "Juliana Costa", date: "Amanhã", time: "09:30", value: "R$ 80", payment: "PIX", status: "confirmed" },
];

const clients = [
  { name: "Fernanda Lima", phone: "(11) 98765-1234", lastVisit: "Hoje", visits: 24, total: "R$ 3.240", tags: ["VIP"] },
  { name: "Camila Ferreira", phone: "(11) 97654-2345", lastVisit: "15/10/2024", visits: 12, total: "R$ 960", tags: [] },
  { name: "Beatriz Rocha", phone: "(11) 96543-3456", lastVisit: "12/10/2024", visits: 8, total: "R$ 620", tags: ["Aniversário"] },
  { name: "Patrícia Souza", phone: "(11) 95432-4567", lastVisit: "08/10/2024", visits: 31, total: "R$ 4.800", tags: ["VIP"] },
  { name: "Letícia Matos", phone: "(11) 94321-5678", lastVisit: "01/10/2024", visits: 5, total: "R$ 280", tags: ["Nova"] },
];

const professionals = [
  { name: "Ana Carvalho", specialty: "Cabelos", services: 8, appointments: 18, revenue: "R$ 2.840", commission: "40%", status: "active" },
  { name: "Mariana Souza", specialty: "Unhas", services: 4, appointments: 22, revenue: "R$ 1.430", commission: "45%", status: "active" },
  { name: "Juliana Costa", specialty: "Massagens", services: 3, appointments: 12, revenue: "R$ 1.560", commission: "50%", status: "active" },
];

const reviewsList = [
  { name: "Fernanda Lima", rating: 5, comment: "Atendimento incrível! Ana foi muito cuidadosa com meu cabelo.", date: "Há 2 dias", replied: false },
  { name: "Camila P.", rating: 5, comment: "Melhor manicure da cidade! Já indiquei para todas as amigas.", date: "Há 4 dias", replied: true },
  { name: "Sandra T.", rating: 4, comment: "Ótimo serviço, só achei que poderia ter mais horários disponíveis.", date: "Há 1 semana", replied: false },
];

const AGENDA_HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
const AGENDA_PROS = ["Ana Carvalho", "Mariana Souza", "Juliana Costa"];
const AGENDA_ITEMS = [
  { pro: 0, startH: 1, duration: 2, client: "Fernanda L.", service: "Escova Prog.", status: "confirmed" },
  { pro: 0, startH: 4, duration: 1, client: "Beatriz R.", service: "Corte", status: "confirmed" },
  { pro: 1, startH: 2, duration: 1, client: "Camila F.", service: "Manicure", status: "waiting" },
  { pro: 1, startH: 5, duration: 1, client: "Letícia M.", service: "Pedicure", status: "confirmed" },
  { pro: 2, startH: 3, duration: 1, client: "Patrícia S.", service: "Massagem", status: "confirmed" },
  { pro: 2, startH: 6, duration: 1, client: "Sandra O.", service: "Relaxamento", status: "confirmed" },
];

const statusColors: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  waiting: "bg-amber-100 text-amber-700 border-amber-200",
  cancelled: "bg-red-100 text-red-600 border-red-200",
  done: "bg-sky-100 text-sky-700 border-sky-200",
};
const statusLabel: Record<string, string> = {
  confirmed: "Confirmado", waiting: "Aguardando", cancelled: "Cancelado", done: "Concluído",
};

function StatCard({ label, value, sub, icon: Icon, trend, color = "primary" }: {
  label: string; value: string; sub?: string; icon: any; trend?: number; color?: string;
}) {
  const colors: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    purple: "bg-violet-100 text-violet-600",
    emerald: "bg-emerald-100 text-emerald-600",
    amber: "bg-amber-100 text-amber-600",
    sky: "bg-sky-100 text-sky-600",
    rose: "bg-rose-100 text-rose-600",
  };
  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color] || colors.primary}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium flex items-center gap-0.5 ${trend >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="font-serif text-2xl font-medium">{value}</div>
      <div className="text-muted-foreground text-xs mt-1">{label}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

function DashboardView({ onNewAppointment }: { onNewAppointment: () => void }) {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}`, { headers: { 'Authorization': `Bearer ${token}` } })
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

function AgendaView({ onNewAppointment }: { onNewAppointment: () => void }) {
  const [view, setView] = useState<"dia" | "semana" | "mes">("dia");
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-medium">Agenda</h1>
        <div className="flex items-center gap-2">
          <div className="flex bg-secondary border border-border rounded-lg overflow-hidden">
            {(["dia", "semana", "mes"] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 text-sm font-medium capitalize transition-all ${view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {v === "mes" ? "Mês" : v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <Button size="sm" onClick={onNewAppointment}><Plus className="w-4 h-4" /> Novo</Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        {/* Date header */}
        <div className="grid border-b border-border" style={{ gridTemplateColumns: "80px repeat(3, 1fr)" }}>
          <div className="p-3 bg-muted/40" />
          {AGENDA_PROS.map(p => (
            <div key={p} className="p-3 border-l border-border text-center">
              <div className="font-medium text-sm">{p.split(" ")[0]}</div>
              <div className="text-xs text-muted-foreground">{p.split(" ")[1]}</div>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="relative overflow-y-auto" style={{ maxHeight: 500 }}>
          {AGENDA_HOURS.map((h, hi) => (
            <div key={h} className="grid border-b border-border last:border-0" style={{ gridTemplateColumns: "80px repeat(3, 1fr)", minHeight: 60 }}>
              <div className="p-2 text-xs text-muted-foreground text-right pr-4 pt-2 bg-muted/20">{h}</div>
              {AGENDA_PROS.map((_, pi) => {
                const item = AGENDA_ITEMS.find(a => a.pro === pi && a.startH === hi);
                return (
                  <div key={pi} className="border-l border-border relative p-1">
                    {item && (
                      <div className={`rounded-lg p-2 text-xs cursor-pointer hover:brightness-95 transition-all border ${statusColors[item.status]}`}
                        style={{ minHeight: `${item.duration * 56}px` }}>
                        <div className="font-semibold">{item.client}</div>
                        <div className="opacity-70">{item.service}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AppointmentsView({ onNewAppointment }: { onNewAppointment: () => void }) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(json => {
        // Mapeia os dados do backend para o formato que a tabela espera
        const formatted = json.map((a: any) => ({
          id: a.id,
          client: a.client.name,
          service: a.service.name,
          pro: a.professional.name,
          date: new Date(a.date).toLocaleDateString('pt-BR'),
          time: new Date(a.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          value: `R$ ${a.value}`,
          payment: a.paymentMethod || 'PIX',
          status: a.status
        }));
        setData(formatted);
      })
      .catch(err => console.error("Erro ao buscar agendamentos", err));
  }, []);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-medium">Agendamentos</h1>
        <Button size="sm" onClick={onNewAppointment}><Plus className="w-4 h-4" /> Novo</Button>
      </div>

      <div className="flex flex-wrap gap-3 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-4">
        {["Data", "Profissional", "Serviço", "Status", "Pagamento"].map(f => (
          <div key={f} className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-lg text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
            <Filter className="w-3.5 h-3.5" /> {f}
          </div>
        ))}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg text-sm text-muted-foreground ml-auto">
          <Search className="w-3.5 h-3.5" />
          <input placeholder="Buscar..." className="bg-transparent outline-none text-foreground placeholder:text-muted-foreground w-32" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {["Cliente", "Serviço", "Profissional", "Data / Hora", "Valor", "Pagamento", "Status", ""].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(data.length > 0 ? data : appointments).map(a => (
              <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={a.client} size="sm" />
                    <span className="text-sm font-medium">{a.client}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{a.service}</td>
                <td className="px-4 py-3 text-sm">{a.pro.split(" ")[0]}</td>
                <td className="px-4 py-3">
                  <div className="text-sm font-medium">{a.date}</div>
                  <div className="text-xs text-muted-foreground">{a.time}</div>
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-primary">{a.value}</td>
                <td className="px-4 py-3"><Badge variant="outline">{a.payment}</Badge></td>
                <td className="px-4 py-3">
                  <Badge variant={a.status === "confirmed" ? "success" : a.status === "waiting" ? "warning" : "danger"}>
                    {statusLabel[a.status]}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <button className="p-1.5 rounded-lg hover:bg-muted"><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ClientsView() {
  const [selected, setSelected] = useState<typeof clients[0] | null>(null);
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-medium">Clientes</h1>
        <Button size="sm"><Plus className="w-4 h-4" /> Novo cliente</Button>
      </div>

      <div className="flex items-center gap-3 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-4">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input placeholder="Buscar cliente..." className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["Cliente", "Telefone", "Último atend.", "Visitas", "Total gasto", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map(c => (
                <tr key={c.name} onClick={() => setSelected(c)} className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={c.name} size="sm" />
                      <div>
                        <div className="text-sm font-medium">{c.name}</div>
                        {c.tags.map(t => <Badge key={t} variant="purple" className="text-xs mr-1">{t}</Badge>)}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{c.phone}</td>
                  <td className="px-4 py-3 text-sm">{c.lastVisit}</td>
                  <td className="px-4 py-3 text-sm font-medium">{c.visits}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-primary">{c.total}</td>
                  <td className="px-4 py-3">
                    <button className="p-1.5 rounded-lg hover:bg-muted"><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5">
          {selected ? (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Avatar name={selected.name} size="lg" />
                <div>
                  <div className="font-semibold">{selected.name}</div>
                  <div className="text-muted-foreground text-sm">{selected.phone}</div>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                {[["Visitas", selected.visits], ["Total gasto", selected.total], ["Último atend.", selected.lastVisit]].map(([k, v]) => (
                  <div key={String(k)} className="flex justify-between">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-medium">{v}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border mt-4 pt-4">
                <div className="text-xs font-semibold text-muted-foreground mb-2">Histórico recente</div>
                <div className="space-y-2">
                  {["Escova Progressiva — Hoje", "Manicure — 01/10", "Corte + Hidratação — 15/09"].map(h => (
                    <div key={h} className="text-xs text-muted-foreground">{h}</div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground text-sm py-8">
              Selecione um cliente para ver o perfil
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FinanceiroView() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="font-serif text-2xl font-medium">Financeiro</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Receitas do mês" value="R$ 13.280" trend={12} icon={TrendingUp} color="emerald" />
        <StatCard label="Despesas" value="R$ 4.200" trend={-3} icon={TrendingDown} color="rose" />
        <StatCard label="Saldo" value="R$ 9.080" trend={18} icon={DollarSign} color="primary" />
        <StatCard label="A receber" value="R$ 1.440" sub="8 pagamentos" icon={Zap} color="amber" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Movimentações recentes</h3>
            <Button variant="outline" size="sm"><Plus className="w-4 h-4" /> Nova</Button>
          </div>
          <div className="space-y-2">
            {[
              { desc: "Escova Progressiva — Fernanda L.", type: "entrada", value: "R$ 180", date: "Hoje 09:00", method: "PIX" },
              { desc: "Manicure Gel — Camila F.", type: "entrada", value: "R$ 65", date: "Hoje 10:00", method: "Dinheiro" },
              { desc: "Material de limpeza", type: "saida", value: "R$ 120", date: "Ontem", method: "PIX" },
              { desc: "Massagem Relaxante — Patrícia S.", type: "entrada", value: "R$ 130", date: "Ontem", method: "PIX" },
              { desc: "Energia elétrica", type: "saida", value: "R$ 380", date: "12/10", method: "Débito" },
              { desc: "Corte + Hidratação — Beatriz R.", type: "entrada", value: "R$ 130", date: "12/10", method: "Cartão" },
            ].map((m, i) => (
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
                  {m.type === "saida" ? "-" : "+"}{m.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5">
            <h3 className="font-semibold mb-4">Formas de pagamento</h3>
            <div className="space-y-3">
              {[["PIX", "62%", "#B8614A"], ["Cartão", "21%", "#9B7EA8"], ["Dinheiro", "12%", "#5B8DB8"], ["Outros", "5%", "#E8E0D8"]].map(([m, pct, color]) => (
                <div key={String(m)} className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-16">{m}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: String(pct), background: String(color) }} />
                  </div>
                  <span className="text-xs font-medium w-8 text-right">{pct}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5">
            <h3 className="font-semibold mb-3">Categorias de despesa</h3>
            <div className="space-y-2 text-sm">
              {[["Comissões", "R$ 1.840"], ["Aluguel", "R$ 1.200"], ["Materiais", "R$ 680"], ["Energia", "R$ 380"], ["Marketing", "R$ 100"]].map(([k, v]) => (
                <div key={String(k)} className="flex justify-between">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComissoesView() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-medium">Comissões</h1>
        <div className="flex items-center gap-2">
          <select className="h-9 px-3 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary">
            <option>Outubro 2024</option>
            <option>Setembro 2024</option>
          </select>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {["Profissional", "Serviços realizados", "Faturamento", "Percentual", "Comissão", "A pagar"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {professionals.map(p => {
              const revenue = parseInt(p.revenue.replace(/\D/g, ""));
              const pct = parseInt(p.commission);
              const commission = Math.round(revenue * pct / 100);
              return (
                <tr key={p.name} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={p.name} size="sm" />
                      <div>
                        <div className="font-medium text-sm">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.specialty}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{p.appointments} atend.</td>
                  <td className="px-4 py-3 text-sm font-medium">{p.revenue}</td>
                  <td className="px-4 py-3"><Badge variant="info">{p.commission}</Badge></td>
                  <td className="px-4 py-3 text-sm font-semibold text-primary">R$ {commission.toLocaleString("pt-BR")}</td>
                  <td className="px-4 py-3">
                    <Badge variant="warning">R$ {commission.toLocaleString("pt-BR")}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-border bg-muted/20 flex justify-between text-sm">
          <span className="font-semibold">Total a pagar este mês</span>
          <span className="font-bold text-primary">R$ 2.314</span>
        </div>
      </div>
    </div>
  );
}

function AvaliacoesView() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="font-serif text-2xl font-medium">Avaliações</h1>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5 text-center">
          <div className="font-serif text-5xl font-medium text-amber-500 mb-1">4,9</div>
          <div className="text-amber-400 text-xl mb-2">★★★★★</div>
          <div className="text-muted-foreground text-sm">327 avaliações</div>
        </div>
        <div className="md:col-span-2 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5">
          <h3 className="font-semibold mb-4">Distribuição</h3>
          <div className="space-y-2">
            {[[5, 78], [4, 15], [3, 5], [2, 1], [1, 1]].map(([stars, pct]) => (
              <div key={stars} className="flex items-center gap-3 text-sm">
                <span className="w-4 text-muted-foreground">{stars}</span>
                <span className="text-amber-400">★</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-muted-foreground w-8 text-right">{pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {reviewsList.map(r => (
          <div key={r.name} className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Avatar name={r.name} size="sm" />
                <div>
                  <div className="font-medium text-sm">{r.name}</div>
                  <div className="text-amber-400 text-xs">{"★".repeat(r.rating)}</div>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{r.date}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-3">{r.comment}</p>
            <div className="flex items-center justify-between mt-3">
              {r.replied ? (
                <Badge variant="success"><Check className="w-3 h-3" /> Respondido</Badge>
              ) : (
                <Badge variant="outline">Sem resposta</Badge>
              )}
              <Button variant="ghost" size="sm">Responder</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PaginaSalaoView() {
  const [tab, setTab] = useState<"desktop" | "mobile">("desktop");
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-medium">Página do Salão</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Eye className="w-4 h-4" /> Visualizar</Button>
          <Button size="sm"><Globe className="w-4 h-4" /> Publicar</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5 space-y-4">
          <h3 className="font-semibold">Personalizar página</h3>
          {[
            { label: "Nome do salão", value: "Salão Rosé" },
            { label: "Descrição", value: "Cabelo, unhas e estética com cuidado especial" },
            { label: "Endereço", value: "Rua das Flores, 142 — Moema, SP" },
            { label: "Telefone", value: "(11) 99999-0000" },
            { label: "WhatsApp", value: "(11) 99999-0000" },
            { label: "Instagram", value: "@salarose" },
          ].map(f => (
            <div key={f.label}>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{f.label}</label>
              <input defaultValue={f.value} className="w-full h-9 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-background" />
            </div>
          ))}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Cor principal</label>
            <div className="flex gap-2">
              {["#B8614A", "#9B7EA8", "#5B8DB8", "#7DC198", "#E87B4A", "#3D3D3D"].map(c => (
                <button key={c} className="w-8 h-8 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform" style={{ background: c }} />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => {
              const slug = localStorage.getItem('salonSlug') || 'beleza-pura-matriz';
              navigator.clipboard.writeText(`http://localhost:8443/agendar/${slug}`);
              alert("Link copiado para a área de transferência!");
            }}>Copiar link</Button>
            <Button variant="outline" size="sm" className="flex-1">Compartilhar</Button>
            <Button size="sm" className="flex-1">Publicar</Button>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            {(["desktop", "mobile"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
              >
                {t === "desktop" ? "Desktop" : "Mobile"}
              </button>
            ))}
          </div>
          <div className={`bg-muted rounded-2xl overflow-hidden border border-border ${tab === "mobile" ? "mx-auto max-w-[240px]" : ""}`}>
            <div className="bg-primary/90 text-white p-4 text-center">
              <div className="font-serif text-lg">Salão Rosé</div>
              <div className="text-sm opacity-80">Moema · 4,9 ★</div>
              <button className="mt-2 bg-white text-primary text-xs px-4 py-1.5 rounded-full font-medium">Agendar horário</button>
            </div>
            <div className="p-3 space-y-2">
              {["Cabelo", "Unhas", "Massagem"].map(s => (
                <div key={s} className="flex justify-between bg-white rounded-lg p-2 text-xs">
                  <span className="font-medium">{s}</span>
                  <span className="text-primary">→</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const allServices = [
  { id: 1, name: "Escova Progressiva", cat: "Cabelo", duration: "120 min", price: "R$ 180", pros: ["Ana Carvalho"], status: "active" },
  { id: 2, name: "Manicure Gel", cat: "Unhas", duration: "45 min", price: "R$ 65", pros: ["Mariana Souza"], status: "active" },
  { id: 3, name: "Corte Feminino", cat: "Cabelo", duration: "60 min", price: "R$ 90", pros: ["Ana Carvalho"], status: "active" },
  { id: 4, name: "Massagem Relaxante", cat: "Massagem", duration: "60 min", price: "R$ 130", pros: ["Juliana Costa"], status: "active" },
  { id: 5, name: "Design de Sobrancelha", cat: "Sobrancelhas", duration: "30 min", price: "R$ 40", pros: ["Ana Carvalho"], status: "active" },
  { id: 6, name: "Bronzeamento", cat: "Estética", duration: "20 min", price: "R$ 80", pros: ["Juliana Costa"], status: "active" },
  { id: 7, name: "Pedicure", cat: "Unhas", duration: "50 min", price: "R$ 60", pros: ["Mariana Souza"], status: "inactive" },
  { id: 8, name: "Maquiagem Completa", cat: "Maquiagem", duration: "90 min", price: "R$ 150", pros: ["Ana Carvalho"], status: "inactive" },
];

function ServicosView() {
  const [services, setServices] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newSvc, setNewSvc] = useState({ name: "", duration: "", price: "" });

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.services) {
          setServices(d.services.map((s: any) => ({ ...s, cat: 'Serviço', pros: ['Geral'], status: 'active' })));
        }
      })
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newSvc)
      });
      const data = await res.json();
      setServices([...services, { ...data, cat: 'Serviço', pros: ['Geral'], status: 'active' }]);
      setShowForm(false);
      setNewSvc({ name: "", duration: "", price: "" });
    } catch(e) { console.error(e) }
  };

  const cats = ["Todos", "Cabelo", "Unhas", "Massagem", "Estética", "Sobrancelhas", "Maquiagem"];
  const [filterCat, setFilterCat] = useState("Todos");
  const filtered = filterCat === "Todos" ? services : services.filter(s => s.cat === filterCat);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-medium">Serviços</h1>
        <Button size="sm" onClick={() => setShowForm(v => !v)}><Plus className="w-4 h-4" /> Novo serviço</Button>
      </div>

      {showForm && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Novo serviço</h3>
            <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <input value={newSvc.name} onChange={e => setNewSvc({...newSvc, name: e.target.value})} placeholder="Nome do serviço" className="h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-card" />
            <select className="h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-card appearance-none">
              {cats.slice(1).map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input value={newSvc.duration} onChange={e => setNewSvc({...newSvc, duration: e.target.value})} placeholder="Duração (min)" className="h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-card" />
            <input value={newSvc.price} onChange={e => setNewSvc({...newSvc, price: e.target.value})} placeholder="Preço (R$)" className="h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-card" />
            <Button size="sm" className="h-10" onClick={handleSave}>Salvar</Button>
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {cats.map(c => (
          <button key={c} onClick={() => setFilterCat(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filterCat === c ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {["Serviço", "Categoria", "Duração", "Preço", "Profissionais", "Status", ""].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-medium text-sm">{s.name}</td>
                <td className="px-4 py-3"><Badge variant="outline">{s.cat}</Badge></td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{s.duration}</td>
                <td className="px-4 py-3 text-sm font-semibold text-primary">{s.price}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{s.pros.join(", ")}</td>
                <td className="px-4 py-3">
                  <button onClick={() => setServices(prev => prev.map(sv => sv.id === s.id ? { ...sv, status: sv.status === "active" ? "inactive" : "active" } : sv))}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${s.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" : "bg-muted text-muted-foreground border-border hover:border-primary/30"}`}>
                    {s.status === "active" ? "Ativo" : "Inativo"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded hover:bg-muted"><Edit3 className="w-3.5 h-3.5 text-muted-foreground" /></button>
                    <button className="p-1.5 rounded hover:bg-muted"><Trash2 className="w-3.5 h-3.5 text-muted-foreground" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const weekDaysShort = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const defaultSchedule = weekDaysShort.map((d, i) => ({ day: d, open: i < 6, start: "09:00", end: i === 5 ? "17:00" : "19:00" }));

function ProfissionaisView() {
  const [selected, setSelected] = useState<typeof professionals[0] | null>(null);
  const [tab, setTab] = useState<"agenda" | "faturamento" | "comissoes" | "avaliacoes">("agenda");

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-medium">Profissionais</h1>
        <Button size="sm"><Plus className="w-4 h-4" /> Novo profissional</Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          {professionals.map(p => (
            <div key={p.name} onClick={() => setSelected(p)}
              className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${selected?.name === p.name ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/30"}`}>
              <Avatar name={p.name} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{p.name}</div>
                <div className="text-sm text-muted-foreground">{p.specialty}</div>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>{p.appointments} atend. este mês</span>
                  <span className="text-primary font-medium">{p.revenue}</span>
                  <span>Comissão: {p.commission}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant="success">Ativo</Badge>
                <div className="text-xs text-amber-500">★ 4,9</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5">
          {selected ? (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Avatar name={selected.name} size="lg" />
                <div>
                  <div className="font-semibold">{selected.name}</div>
                  <div className="text-muted-foreground text-sm">{selected.specialty}</div>
                  <div className="text-amber-500 text-xs mt-0.5">★★★★★ 4.9</div>
                </div>
              </div>

              <div className="flex gap-1 mb-4 bg-secondary rounded-lg p-1">
                {(["agenda", "faturamento", "comissoes", "avaliacoes"] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${tab === t ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}>
                    {t === "faturamento" ? "Fatur." : t === "comissoes" ? "Comiss." : t === "avaliacoes" ? "Aval." : "Agenda"}
                  </button>
                ))}
              </div>

              {tab === "agenda" && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground mb-2">Hoje</div>
                  {[["09:00", "Fernanda L.", "Escova"], ["11:00", "Beatriz R.", "Corte"], ["14:00", "Camila F.", "Manicure"]].map(([t, c, s]) => (
                    <div key={t} className="flex items-center gap-2 p-2 bg-secondary rounded-lg text-xs">
                      <span className="font-mono text-primary font-medium">{t}</span>
                      <div className="flex-1"><div className="font-medium">{c}</div><div className="text-muted-foreground">{s}</div></div>
                    </div>
                  ))}
                </div>
              )}
              {tab === "faturamento" && (
                <div className="space-y-3 text-sm">
                  {[["Este mês", selected.revenue], ["Mês anterior", "R$ 2.410"], ["Média/atend.", "R$ 158"]].map(([k, v]) => (
                    <div key={String(k)} className="flex justify-between">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="font-semibold text-primary">{v}</span>
                    </div>
                  ))}
                </div>
              )}
              {tab === "comissoes" && (
                <div className="space-y-3 text-sm">
                  {[["Percentual", selected.commission], ["Base de cálculo", selected.revenue], ["Comissão a pagar", `R$ ${Math.round(parseInt(selected.revenue.replace(/\D/g, "")) * parseInt(selected.commission) / 100).toLocaleString("pt-BR")}`]].map(([k, v]) => (
                    <div key={String(k)} className="flex justify-between">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="font-semibold">{v}</span>
                    </div>
                  ))}
                </div>
              )}
              {tab === "avaliacoes" && (
                <div className="space-y-3">
                  {[{ text: "Incrível, melhor do salão!", stars: 5 }, { text: "Muito cuidadosa e atenciosa.", stars: 5 }, { text: "Ótimo atendimento!", stars: 4 }].map((r, i) => (
                    <div key={i} className="p-2 bg-secondary rounded-lg text-xs">
                      <div className="text-amber-400 mb-1">{"★".repeat(r.stars)}</div>
                      <p className="text-muted-foreground">{r.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground text-sm py-8">
              Selecione uma profissional para ver o perfil
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HorariosView() {
  const [schedule, setSchedule] = useState(defaultSchedule);
  const [blockModal, setBlockModal] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-medium">Horários</h1>
        <Button variant="outline" size="sm" onClick={() => setBlockModal(v => !v)}>
          <Plus className="w-4 h-4" /> Adicionar bloqueio
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5">
          <h3 className="font-semibold mb-4">Horário de funcionamento</h3>
          <div className="space-y-3">
            {schedule.map((s, i) => (
              <div key={s.day} className="flex items-center gap-3">
                <button
                  onClick={() => setSchedule(prev => prev.map((d, j) => j === i ? { ...d, open: !d.open } : d))}
                  className={`w-10 h-5 rounded-full transition-all relative shrink-0 ${s.open ? "bg-primary" : "bg-muted border border-border"}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${s.open ? "left-5" : "left-0.5"}`} />
                </button>
                <span className={`text-sm font-medium w-8 ${s.open ? "text-foreground" : "text-muted-foreground"}`}>{s.day}</span>
                {s.open ? (
                  <div className="flex items-center gap-2 ml-auto">
                    <select value={s.start} onChange={e => setSchedule(prev => prev.map((d, j) => j === i ? { ...d, start: e.target.value } : d))}
                      className="h-8 px-2 rounded-lg border border-border text-sm outline-none focus:border-primary bg-card appearance-none w-20">
                      {["07:00", "08:00", "09:00", "10:00"].map(t => <option key={t}>{t}</option>)}
                    </select>
                    <span className="text-muted-foreground text-xs">até</span>
                    <select value={s.end} onChange={e => setSchedule(prev => prev.map((d, j) => j === i ? { ...d, end: e.target.value } : d))}
                      className="h-8 px-2 rounded-lg border border-border text-sm outline-none focus:border-primary bg-card appearance-none w-20">
                      {["17:00", "18:00", "19:00", "20:00", "21:00"].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                ) : (
                  <span className="ml-auto text-xs text-muted-foreground">Fechado</span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Intervalo entre agendamentos</span>
            <select className="h-8 px-2 rounded-lg border border-border text-sm outline-none focus:border-primary bg-card appearance-none">
              <option>30 minutos</option>
              <option>15 minutos</option>
              <option>60 minutos</option>
            </select>
          </div>
          <Button className="w-full mt-4" size="sm">Salvar horários</Button>
        </div>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5">
            <h3 className="font-semibold mb-3">Bloqueios e folgas</h3>
            <div className="space-y-2">
              {[
                { label: "Feriado — 02/11 (Finados)", type: "feriado" },
                { label: "Folga Ana — 20/10 a 22/10", type: "folga" },
                { label: "Férias Juliana — Nov 01–15", type: "ferias" },
              ].map(b => (
                <div key={b.label} className="flex items-center justify-between p-3 bg-secondary rounded-xl text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${b.type === "feriado" ? "bg-amber-400" : b.type === "folga" ? "bg-sky-400" : "bg-violet-400"}`} />
                    <span>{b.label}</span>
                  </div>
                  <button className="text-muted-foreground hover:text-red-500 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
            {blockModal && (
              <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-xl space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" className="h-9 rounded-lg border border-border px-2 text-sm outline-none focus:border-primary bg-card" />
                  <select className="h-9 rounded-lg border border-border px-2 text-sm outline-none focus:border-primary bg-card appearance-none">
                    <option>Feriado</option><option>Folga</option><option>Férias</option><option>Bloqueio</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <input placeholder="Descrição" className="flex-1 h-9 rounded-lg border border-border px-2 text-sm outline-none focus:border-primary bg-card" />
                  <Button size="sm" className="h-9" onClick={() => setBlockModal(false)}>OK</Button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5">
            <h3 className="font-semibold mb-3">Horários por profissional</h3>
            <div className="space-y-2">
              {professionals.map(p => (
                <div key={p.name} className="flex items-center justify-between p-3 bg-secondary rounded-xl text-sm">
                  <div className="flex items-center gap-2">
                    <Avatar name={p.name} size="xs" />
                    <span className="font-medium">{p.name.split(" ")[0]}</span>
                  </div>
                  <span className="text-muted-foreground text-xs">Seg–Sex: 9h–18h</span>
                  <button className="text-primary text-xs hover:underline">Editar</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RelatoriosView() {
  const [period, setPeriod] = useState("outubro");
  const topServices = [
    { name: "Escova Progressiva", qty: 48, revenue: "R$ 8.640" },
    { name: "Manicure Gel", qty: 92, revenue: "R$ 5.980" },
    { name: "Massagem Relaxante", qty: 31, revenue: "R$ 4.030" },
    { name: "Corte Feminino", qty: 44, revenue: "R$ 3.960" },
    { name: "Design Sobrancelha", qty: 67, revenue: "R$ 2.680" },
  ];
  const maxQty = Math.max(...topServices.map(s => s.qty));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-medium">Relatórios</h1>
        <select value={period} onChange={e => setPeriod(e.target.value)}
          className="h-9 px-3 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary appearance-none">
          <option value="outubro">Outubro 2024</option>
          <option value="setembro">Setembro 2024</option>
          <option value="agosto">Agosto 2024</option>
        </select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Faturamento" value="R$ 13.280" trend={12} icon={DollarSign} color="emerald" />
        <StatCard label="Agendamentos" value="282" trend={8} icon={Calendar} color="primary" />
        <StatCard label="Novos clientes" value="18" trend={20} icon={Users} color="purple" />
        <StatCard label="Cancelamentos" value="14" sub="taxa: 4,9%" trend={-3} icon={X} color="rose" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5">
          <h3 className="font-semibold mb-4">Serviços mais vendidos</h3>
          <div className="space-y-3">
            {topServices.map((s, i) => (
              <div key={s.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                    <span className="font-medium">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{s.qty}x</span>
                    <span className="font-semibold text-primary">{s.revenue}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(s.qty / maxQty) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5">
          <h3 className="font-semibold mb-4">Desempenho por profissional</h3>
          <div className="space-y-3">
            {professionals.map(p => {
              const rev = parseInt(p.revenue.replace(/\D/g, ""));
              const maxRev = 2840;
              return (
                <div key={p.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Avatar name={p.name} size="xs" />
                      <span className="font-medium">{p.name.split(" ")[0]}</span>
                      <span className="text-xs text-muted-foreground">{p.appointments} atend.</span>
                    </div>
                    <span className="font-semibold text-primary text-xs">{p.revenue}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${(rev / maxRev) * 100}%`, background: PIE_COLORS[professionals.indexOf(p)] }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-border">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[["Ticket médio", "R$ 107"], ["Maior ticket", "R$ 180"], ["Ocupação média", "78%"], ["Clientes novos", "18"]].map(([k, v]) => (
                <div key={String(k)} className="bg-secondary rounded-xl p-3">
                  <div className="text-muted-foreground text-xs">{k}</div>
                  <div className="font-semibold mt-0.5">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5">
        <h3 className="font-semibold mb-4">Faturamento — evolução diária</h3>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="repGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#B8614A" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#B8614A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D8" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#7C6F65" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#7C6F65" }} axisLine={false} tickLine={false} tickFormatter={(v: any) => `R$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: any) => [`R$ ${Number(v).toLocaleString("pt-BR")}`, "Faturamento"]} />
            <Area type="monotone" dataKey="value" stroke="#B8614A" strokeWidth={2} fill="url(#repGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ConfiguracoesView() {
  const [tab, setTab] = useState<"empresa" | "usuarios" | "unidades" | "pagamentos" | "notificacoes" | "preferencias">("empresa");
  const tabs = [
    { id: "empresa", label: "Dados da empresa" },
    { id: "usuarios", label: "Usuários" },
    { id: "unidades", label: "Unidades" },
    { id: "pagamentos", label: "Pagamentos / PIX" },
    { id: "notificacoes", label: "Notificações" },
    { id: "preferencias", label: "Preferências" },
  ] as const;

  const unitsList = [
    { name: "Unidade Moema", address: "Rua das Flores, 142", status: "active", pros: 3 },
    { name: "Unidade Centro", address: "Av. Paulista, 800", status: "active", pros: 4 },
    { name: "Unidade Tatuapé", address: "Rua Guanabara, 22", status: "active", pros: 2 },
    { name: "Unidade Campinas", address: "Av. das Palmeiras, 50", status: "inactive", pros: 0 },
  ];

  const usersList = [
    { name: "Rosé Silva", role: "Administradora", email: "rose@salaorose.com.br", status: "active" },
    { name: "Ana Carvalho", role: "Profissional", email: "ana@salaorose.com.br", status: "active" },
    { name: "Mariana Souza", role: "Profissional", email: "mariana@salaorose.com.br", status: "active" },
  ];

  return (
    <div className="p-6 space-y-4">
      <h1 className="font-serif text-2xl font-medium">Configurações</h1>

      <div className="flex gap-1 flex-wrap bg-secondary border border-border rounded-xl p-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t.id ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "empresa" && (
        <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5 space-y-4 max-w-xl">
          {[
            { label: "Nome do salão", value: "Salão Rosé" },
            { label: "CNPJ", value: "00.000.000/0001-00" },
            { label: "Telefone principal", value: "(11) 99999-0000" },
            { label: "E-mail", value: "contato@salaorose.com.br" },
            { label: "Endereço", value: "Rua das Flores, 142 — Moema, SP" },
            { label: "Instagram", value: "@salaorose" },
          ].map(f => (
            <div key={f.label}>
              <label className="text-xs font-medium text-muted-foreground block mb-1">{f.label}</label>
              <input defaultValue={f.value} className="w-full h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-background" />
            </div>
          ))}
          <Button className="mt-2">Salvar alterações</Button>
        </div>
      )}

      {tab === "usuarios" && (
        <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <span className="font-semibold text-sm">Usuários do sistema</span>
            <Button size="sm"><Plus className="w-4 h-4" /> Convidar usuário</Button>
          </div>
          <table className="w-full">
            <thead><tr className="border-b border-border bg-muted/40">
              {["Nome", "Função", "E-mail", "Status", ""].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>)}
            </tr></thead>
            <tbody>
              {usersList.map(u => (
                <tr key={u.name} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><Avatar name={u.name} size="sm" /><span className="font-medium text-sm">{u.name}</span></div></td>
                  <td className="px-4 py-3"><Badge variant="outline">{u.role}</Badge></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3"><Badge variant="success">Ativo</Badge></td>
                  <td className="px-4 py-3"><button className="p-1.5 rounded hover:bg-muted"><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "unidades" && (
        <div className="space-y-3">
          {unitsList.map(u => (
            <div key={u.name} className="flex items-center gap-4 p-4 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{u.name}</div>
                <div className="text-xs text-muted-foreground">{u.address} · {u.pros} profissionais</div>
              </div>
              <Badge variant={u.status === "active" ? "success" : "outline"}>{u.status === "active" ? "Ativa" : "Inativa"}</Badge>
              <button className="text-xs text-primary hover:underline">Editar</button>
            </div>
          ))}
          <Button variant="outline" size="sm"><Plus className="w-4 h-4" /> Adicionar unidade</Button>
        </div>
      )}

      {tab === "pagamentos" && (
        <div className="max-w-xl space-y-4">
          <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5 space-y-4">
            <h3 className="font-semibold">Chave PIX</h3>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Tipo de chave</label>
              <select className="w-full h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-background appearance-none">
                <option>CPF</option><option>CNPJ</option><option>E-mail</option><option>Celular</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Chave PIX</label>
              <input defaultValue="000.000.000-00" className="w-full h-10 rounded-lg border border-border px-3 text-sm font-mono outline-none focus:border-primary bg-background" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Nome do favorecido</label>
              <input defaultValue="Salão Rosé" className="w-full h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-background" />
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5 space-y-3">
            <h3 className="font-semibold">Sinal de reserva</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm">Exigir sinal para confirmar agendamento</span>
              <div className="w-10 h-5 rounded-full bg-primary relative cursor-pointer">
                <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white shadow" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Valor padrão do sinal</label>
              <input defaultValue="R$ 30,00" className="w-full h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-background" />
            </div>
            <Button size="sm">Salvar</Button>
          </div>
        </div>
      )}

      {tab === "notificacoes" && (
        <div className="max-w-xl bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5 space-y-4">
          <h3 className="font-semibold">Notificações WhatsApp</h3>
          {[
            { label: "Novo agendamento", desc: "Quando um cliente agendar online", on: true },
            { label: "Lembrete ao cliente", desc: "24h antes do agendamento", on: true },
            { label: "Confirmação de pagamento", desc: "Quando o PIX for confirmado", on: true },
            { label: "Cancelamento", desc: "Quando um agendamento for cancelado", on: false },
            { label: "Avaliação pós-atendimento", desc: "Solicitar avaliação após o serviço", on: true },
          ].map(n => (
            <div key={n.label} className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{n.label}</div>
                <div className="text-xs text-muted-foreground">{n.desc}</div>
              </div>
              <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-all ${n.on ? "bg-primary" : "bg-muted border border-border"}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${n.on ? "right-0.5" : "left-0.5"}`} />
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "preferencias" && (
        <div className="max-w-xl bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5 space-y-4">
          <h3 className="font-semibold">Preferências do sistema</h3>
          {[
            { label: "Intervalo entre agendamentos", type: "select", options: ["15 min", "30 min", "60 min"], value: "30 min" },
            { label: "Antecedência mínima para agendamento", type: "select", options: ["1 hora", "2 horas", "24 horas"], value: "2 horas" },
            { label: "Cancelamento permitido até", type: "select", options: ["1 hora antes", "2 horas antes", "24 horas antes"], value: "2 horas antes" },
            { label: "Idioma da plataforma", type: "select", options: ["Português (BR)", "Inglês"], value: "Português (BR)" },
          ].map(p => (
            <div key={p.label}>
              <label className="text-xs font-medium text-muted-foreground block mb-1">{p.label}</label>
              <select defaultValue={p.value} className="w-full h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-background appearance-none">
                {p.options.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <Button size="sm">Salvar preferências</Button>
        </div>
      )}
    </div>
  );
}

function NovoAgendamentoModal({ onClose }: { onClose: () => void }) {
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

function LoginScreen({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail] = useState("admin@belezapura.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro no login");
      
      onLogin(data.token);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm bg-card p-8 rounded-3xl border border-border shadow-2xl">
        <div className="flex items-center gap-2 justify-center mb-6">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Scissors className="w-4 h-4 text-white" />
          </div>
          <span className="font-serif font-medium text-lg">beautyOS</span>
        </div>
        <h2 className="text-xl font-semibold text-center mb-6">Acesso ao Painel</h2>
        {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-background" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-background" />
          </div>
          <Button className="w-full h-10">Entrar</Button>
        </form>
      </div>
    </div>
  );
}

export default function SalonDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [unit, setUnit] = useState("Unidade Moema");
  const [showModal, setShowModal] = useState(false);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  if (!token) {
    return <LoginScreen onLogin={(t) => {
      localStorage.setItem('token', t);
      setToken(t);
    }} />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard": return <DashboardView onNewAppointment={() => setShowModal(true)} />;
      case "agenda": return <AgendaView onNewAppointment={() => setShowModal(true)} />;
      case "agendamentos": return <AppointmentsView onNewAppointment={() => setShowModal(true)} />;
      case "clientes": return <ClientsView />;
      case "servicos": return <ServicosView />;
      case "profissionais": return <ProfissionaisView />;
      case "horarios": return <HorariosView />;
      case "financeiro": return <FinanceiroView />;
      case "comissoes": return <ComissoesView />;
      case "avaliacoes": return <AvaliacoesView />;
      case "pagina": return <PaginaSalaoView />;
      case "relatorios": return <RelatoriosView />;
      case "configuracoes": return <ConfiguracoesView />;
      default: return null;
    }
  };

  return (
    <div className="flex h-full bg-background">
      {showModal && <NovoAgendamentoModal onClose={() => setShowModal(false)} />}
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-60" : "w-16"} shrink-0 bg-card border-r border-border flex flex-col transition-all duration-300`}>
        <div className="h-14 flex items-center justify-between px-4 border-b border-border">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Scissors className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-serif font-medium text-sm">beautyOS</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(v => !v)} className="p-1.5 rounded-lg hover:bg-muted ml-auto">
            <Menu className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {sidebarOpen && (
          <div className="px-3 py-2 border-b border-border">
            <button className="w-full flex items-center justify-between bg-secondary rounded-lg px-3 py-2 text-sm">
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground font-medium truncate">{unit}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            </button>
          </div>
        )}

        <nav className="flex-1 py-2 overflow-y-auto">
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all ${
                activeSection === item.id
                  ? "bg-primary/10 text-primary border-r-2 border-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {sidebarOpen && (
          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-2">
              <Avatar name="Rosé Silva" size="sm" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium truncate">Rosé Silva</div>
                <div className="text-xs text-muted-foreground">Administradora</div>
              </div>
              <button 
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.reload();
                }}
                className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6">
          <div>
            <span className="font-medium text-sm">{NAV.find(n => n.id === activeSection)?.label}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Building2 className="w-3.5 h-3.5" />
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="bg-transparent border-0 outline-none text-sm text-muted-foreground cursor-pointer"
              >
                <option>Todas as unidades</option>
                <option>Unidade Moema</option>
                <option>Unidade Centro</option>
                <option>Unidade Tatuapé</option>
              </select>
            </div>
            <button className="p-2 rounded-lg hover:bg-muted relative">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
            </button>
            <Avatar name="Rosé Silva" size="sm" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-background">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
