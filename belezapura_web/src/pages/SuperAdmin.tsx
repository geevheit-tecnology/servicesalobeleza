import { useState, useEffect } from "react";
import {
  LayoutDashboard, Store, Building2, CreditCard, Package, Users, HeadphonesIcon,
  Settings, TrendingUp, ArrowUpRight, ArrowDownRight, Bell, ChevronDown, MoreHorizontal,
  CheckCircle, AlertCircle, XCircle, Clock, Sparkles, Plus, Search, Filter
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from "recharts";
import { Button, Badge, Avatar } from "@/components/ui";

const NAV = [
  { id: "overview", label: "Visão geral", icon: LayoutDashboard },
  { id: "saloes", label: "Salões", icon: Store },
  { id: "unidades", label: "Unidades", icon: Building2 },
  { id: "assinaturas", label: "Assinaturas", icon: CreditCard },
  { id: "planos", label: "Planos", icon: Package },
  { id: "pagamentos", label: "Pagamentos", icon: CreditCard },
  { id: "usuarios", label: "Usuários", icon: Users },
  { id: "suporte", label: "Suporte", icon: HeadphonesIcon },
  { id: "configuracoes", label: "Configurações", icon: Settings },
];

const mrrData = [
  { name: "Abr", value: 28000 }, { name: "Mai", value: 32400 }, { name: "Jun", value: 35800 },
  { name: "Jul", value: 38200 }, { name: "Ago", value: 41600 }, { name: "Set", value: 44800 },
  { name: "Out", value: 49200 },
];
const growthData = [
  { name: "Abr", saloes: 180 }, { name: "Mai", saloes: 210 }, { name: "Jun", saloes: 250 },
  { name: "Jul", saloes: 310 }, { name: "Ago", saloes: 380 }, { name: "Set", saloes: 450 },
  { name: "Out", saloes: 540 },
];
const churnData = [
  { name: "Abr", novos: 42, cancelados: 8 }, { name: "Mai", novos: 38, cancelados: 6 },
  { name: "Jun", novos: 52, cancelados: 9 }, { name: "Jul", novos: 68, cancelados: 7 },
  { name: "Ago", novos: 78, cancelados: 10 }, { name: "Set", novos: 82, cancelados: 8 },
  { name: "Out", novos: 94, cancelados: 11 },
];

const saloes = [
  { name: "Salão Rosé", owner: "Rosé Silva", units: 4, plan: "Empresarial", status: "active", since: "Jan 2024", appointments: 1240, lastAccess: "Agora" },
  { name: "Studio Carla", owner: "Carla Mendes", units: 1, plan: "Profissional", status: "active", since: "Mar 2024", appointments: 380, lastAccess: "1h atrás" },
  { name: "Bella Estética", owner: "Patrícia Lima", units: 3, plan: "Premium", status: "active", since: "Fev 2024", appointments: 920, lastAccess: "3h atrás" },
  { name: "Hair Design", owner: "Ana Costa", units: 1, plan: "Básico", status: "trial", since: "Out 2024", appointments: 45, lastAccess: "Hoje" },
  { name: "Top Nails", owner: "Luciana Rocha", units: 1, plan: "Profissional", status: "late", since: "Jun 2024", appointments: 210, lastAccess: "2 dias" },
  { name: "Beauty Club", owner: "Fernanda Matos", units: 2, plan: "Premium", status: "blocked", since: "Ago 2024", appointments: 180, lastAccess: "5 dias" },
];

const subscriptions = [
  { salon: "Salão Rosé", plan: "Empresarial", value: "R$ 499", status: "active", next: "01/11/2024" },
  { salon: "Studio Carla", plan: "Profissional", value: "R$ 149", status: "active", next: "15/11/2024" },
  { salon: "Bella Estética", plan: "Premium", value: "R$ 299", status: "active", next: "20/11/2024" },
  { salon: "Hair Design", plan: "Básico", value: "R$ 0", status: "trial", next: "—" },
  { salon: "Top Nails", plan: "Profissional", value: "R$ 149", status: "late", next: "Vencida" },
];

const plans = [
  {
    name: "Básico", price: "R$ XX", period: "/mês", color: "#E8E0D8",
    features: ["1 profissional", "50 agendamentos/mês", "Agenda online", "Página do salão", "PIX básico"],
    users: 180, revenue: "R$ XX.XXX",
  },
  {
    name: "Profissional", price: "R$ XX", period: "/mês", color: "#9B7EA8",
    features: ["Até 5 profissionais", "Ilimitado", "Financeiro", "Comissões", "Relatórios", "WhatsApp"],
    users: 620, revenue: "R$ XX.XXX",
  },
  {
    name: "Premium", price: "R$ XX", period: "/mês", color: "#B8614A",
    features: ["Até 15 profissionais", "3 unidades", "CRM avançado", "Personalização", "Tudo do Pro"],
    users: 280, revenue: "R$ XX.XXX",
  },
  {
    name: "Empresarial", price: "Sob consulta", period: "", color: "#1C1714",
    features: ["Ilimitado", "Unidades ilimitadas", "API + integrações", "Suporte dedicado", "SLA"],
    users: 42, revenue: "R$ XX.XXX",
  },
];

const tickets = [
  { id: "#001", salon: "Top Nails", subject: "PIX não processando pagamento", status: "open", priority: "alta", time: "2h" },
  { id: "#002", salon: "Hair Design", subject: "Como configurar horários", status: "open", priority: "média", time: "4h" },
  { id: "#003", salon: "Bella Estética", subject: "Exportar relatório financeiro", status: "resolved", priority: "baixa", time: "1d" },
  { id: "#004", salon: "Studio Carla", subject: "Integração Instagram", status: "open", priority: "média", time: "1d" },
];

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
    <div className="bg-card border border-border rounded-2xl p-5">
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

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "danger" | "info" | "outline" }> = {
  active: { label: "Ativo", variant: "success" },
  trial: { label: "Trial", variant: "info" },
  late: { label: "Inadimplente", variant: "warning" },
  blocked: { label: "Bloqueado", variant: "danger" },
  cancelled: { label: "Cancelado", variant: "outline" },
};

function OverviewView({ overviewData }: { overviewData: any }) {
  if (!overviewData) return <div>Carregando...</div>;
  if (overviewData.error) return <div className="p-6 text-red-500 font-medium">Erro ao carregar os dados: {overviewData.error}. Verifique o banco de dados.</div>;
  
  const { totalSalons, totalAppointments, totalClients, mrrData, mrrValue } = overviewData;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium">Visão geral da plataforma</h1>
          <p className="text-muted-foreground text-sm">Atualizado agora</p>
        </div>
        <Badge variant="success" className="text-sm px-3 py-1">✓ Plataforma operacional</Badge>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Salões ativos" value={totalSalons.toString()} icon={Store} trend={21} color="primary" />
        <StatCard label="MRR" value={`R$ ${mrrValue}`} sub="Receita recorrente" icon={TrendingUp} trend={9} color="emerald" />
        <StatCard label="Assinaturas ativas" value={totalSalons.toString()} icon={CreditCard} trend={8} color="purple" />
        <StatCard label="Inadimplentes" value="0" icon={AlertCircle} trend={0} color="rose" />
        <StatCard label="Agendamentos" value={totalAppointments.toString()} icon={Sparkles} trend={14} color="sky" />
        <StatCard label="Clientes" value={totalClients.toString()} icon={Users} trend={18} color="amber" />
        <StatCard label="Novos salões" value="0" icon={Plus} trend={15} color="primary" />
        <StatCard label="Tickets abertos" value="0" icon={HeadphonesIcon} trend={-5} color="rose" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">MRR — Crescimento</h3>
            <Badge variant="success">↑ 9% mês a mês</Badge>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={mrrData}>
              <defs>
                <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#B8614A" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#B8614A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D8" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#7C6F65" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#7C6F65" }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => [`R$ ${v.toLocaleString("pt-BR")}`, "MRR"]} />
              <Area type="monotone" dataKey="value" stroke="#B8614A" strokeWidth={2.5} fill="url(#mrrGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold mb-4">Novos vs. Cancelados</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={churnData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D8" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#7C6F65" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#7C6F65" }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="novos" fill="#7DC198" radius={[4, 4, 0, 0]} name="Novos" />
              <Bar dataKey="cancelados" fill="#F87171" radius={[4, 4, 0, 0]} name="Cancelados" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground justify-center">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Novos</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Cancelados</span>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Base de salões — crescimento</h3>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={growthData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D8" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#7C6F65" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#7C6F65" }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Line type="monotone" dataKey="saloes" stroke="#9B7EA8" strokeWidth={2.5} dot={{ fill: "#9B7EA8", r: 4 }} name="Salões" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SaloesView({ salonsData }: { salonsData: any }) {
  if (salonsData && salonsData.error) {
    return <div className="p-6 text-red-500 font-medium">Erro ao carregar salões: {salonsData.error}. Verifique o banco de dados.</div>;
  }
  
  const dataToUse = Array.isArray(salonsData) && salonsData.length > 0 ? salonsData : saloes;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-medium">Salões</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 h-9 text-sm text-muted-foreground">
            <Search className="w-4 h-4" />
            <input placeholder="Buscar salão..." className="bg-transparent outline-none placeholder:text-muted-foreground" />
          </div>
          <Button size="sm"><Filter className="w-4 h-4" /> Filtrar</Button>
        </div>
      </div>

      <div className="flex gap-2">
        {["Todos", "Ativos", "Trial", "Inadimplentes", "Bloqueados"].map(f => (
          <button key={f} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${f === "Todos" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {["Salão", "Responsável", "Unidades", "Plano", "Status", "Desde", "Agendamentos", "Último acesso", ""].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataToUse.map(s => (
              <tr key={s.name} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={s.name} size="sm" />
                    <span className="font-medium text-sm">{s.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{s.owner}</td>
                <td className="px-4 py-3 text-sm text-center">{s.units}</td>
                <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{s.plan}</Badge></td>
                <td className="px-4 py-3">
                  <Badge variant={statusConfig[s.status]?.variant || "outline"}>{statusConfig[s.status]?.label || s.status}</Badge>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{s.since}</td>
                <td className="px-4 py-3 text-sm font-medium">{s.appointments?.toLocaleString("pt-BR")}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{s.lastAccess}</td>
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

function AssinaturasView() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="font-serif text-2xl font-medium">Assinaturas</h1>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Ativas" value="2.241" icon={CheckCircle} color="emerald" />
        <StatCard label="Trial" value="134" icon={Clock} color="sky" />
        <StatCard label="Atrasadas" value="87" icon={AlertCircle} color="amber" />
        <StatCard label="Canceladas (mês)" value="11" icon={XCircle} color="rose" />
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {["Salão", "Plano", "Valor mensal", "Status", "Próxima cobrança", ""].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subscriptions.map(s => (
              <tr key={s.salon} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={s.salon} size="sm" />
                    <span className="font-medium text-sm">{s.salon}</span>
                  </div>
                </td>
                <td className="px-4 py-3"><Badge variant="outline">{s.plan}</Badge></td>
                <td className="px-4 py-3 text-sm font-semibold text-primary">{s.value}</td>
                <td className="px-4 py-3">
                  <Badge variant={statusConfig[s.status]?.variant || "outline"}>
                    {statusConfig[s.status]?.label || s.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{s.next}</td>
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

function PlanosView() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="font-serif text-2xl font-medium">Planos</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map(p => (
          <div key={p.name} className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="h-2" style={{ background: p.color }} />
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{p.name}</h3>
                <Badge variant="outline">{p.users} salões</Badge>
              </div>
              <div className="font-serif text-3xl font-medium mb-1">{p.price}</div>
              <div className="text-muted-foreground text-sm mb-4">{p.period || "Negociado"}</div>
              <ul className="space-y-2 mb-4">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <div className="pt-3 border-t border-border">
                <div className="text-xs text-muted-foreground mb-1">Receita do plano</div>
                <div className="font-semibold text-primary">{p.revenue}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-semibold">Tabela comparativa</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Recurso</th>
                {plans.map(p => <th key={p.name} className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">{p.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {[
                ["Profissionais", "1", "5", "15", "Ilimitado"],
                ["Agendamentos/mês", "50", "Ilimitado", "Ilimitado", "Ilimitado"],
                ["Unidades", "1", "1", "3", "Ilimitado"],
                ["Financeiro", "—", "✓", "✓", "✓"],
                ["Comissões", "—", "✓", "✓", "✓"],
                ["Relatórios", "—", "✓", "✓", "✓"],
                ["API", "—", "—", "—", "✓"],
                ["Suporte dedicado", "—", "—", "—", "✓"],
              ].map(([feat, ...vals]) => (
                <tr key={feat} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 text-sm text-muted-foreground">{feat}</td>
                  {vals.map((v, i) => (
                    <td key={i} className="px-4 py-3 text-center text-sm">
                      {v === "✓" ? <span className="text-emerald-500">✓</span> : v === "—" ? <span className="text-muted-foreground/30">—</span> : <span className="font-medium">{v}</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SuporteView() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-medium">Suporte</h1>
        <div className="flex gap-2">
          <Badge variant="danger">2 urgentes</Badge>
          <Badge variant="warning">10 abertos</Badge>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {["Ticket", "Salão", "Assunto", "Prioridade", "Status", "Tempo", ""].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tickets.map(t => (
              <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{t.id}</td>
                <td className="px-4 py-3 text-sm font-medium">{t.salon}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{t.subject}</td>
                <td className="px-4 py-3">
                  <Badge variant={t.priority === "alta" ? "danger" : t.priority === "média" ? "warning" : "outline"}>
                    {t.priority}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={t.status === "open" ? "info" : "success"}>
                    {t.status === "open" ? "Aberto" : "Resolvido"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{t.time}</td>
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

const unidades = [
  { salon: "Salão Rosé", name: "Unidade Moema", address: "Rua das Flores, 142", pros: 3, status: "active", appts: 480 },
  { salon: "Salão Rosé", name: "Unidade Centro", address: "Av. Paulista, 800", pros: 4, status: "active", appts: 390 },
  { salon: "Bella Estética", name: "Unidade Campinas", address: "Av. Palmeiras, 50", pros: 2, status: "active", appts: 210 },
  { salon: "Bella Estética", name: "Unidade Santos", address: "Rua XV, 100", pros: 2, status: "inactive", appts: 0 },
  { salon: "Studio Carla", name: "Unidade Jardins", address: "Al. Lorena, 320", pros: 1, status: "active", appts: 380 },
];

function UnidadesView() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-medium">Unidades</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary px-3 py-1.5 rounded-lg">
          <Building2 className="w-4 h-4" /> {unidades.length} unidades cadastradas
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {["Unidade", "Salão", "Endereço", "Profissionais", "Agendamentos", "Status", ""].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {unidades.map(u => (
              <tr key={u.name} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium text-sm">{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{u.salon}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{u.address}</td>
                <td className="px-4 py-3 text-sm">{u.pros}</td>
                <td className="px-4 py-3 text-sm font-medium">{u.appts.toLocaleString("pt-BR")}</td>
                <td className="px-4 py-3">
                  <Badge variant={u.status === "active" ? "success" : "outline"}>{u.status === "active" ? "Ativa" : "Inativa"}</Badge>
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

const pagamentos = [
  { salon: "Salão Rosé", plan: "Empresarial", value: "R$ 499", date: "01/10/2024", method: "Cartão", status: "paid" },
  { salon: "Studio Carla", plan: "Profissional", value: "R$ 149", date: "15/10/2024", method: "PIX", status: "paid" },
  { salon: "Bella Estética", plan: "Premium", value: "R$ 299", date: "20/10/2024", method: "Boleto", status: "paid" },
  { salon: "Top Nails", plan: "Profissional", value: "R$ 149", date: "01/10/2024", method: "Cartão", status: "failed" },
  { salon: "Hair Design", plan: "Básico", value: "—", date: "—", method: "—", status: "trial" },
];

function PagamentosView() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="font-serif text-2xl font-medium">Pagamentos</h1>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Recebido este mês" value="R$ 12.840" icon={CheckCircle} color="emerald" trend={9} />
        <StatCard label="Inadimplente" value="R$ 1.490" icon={AlertCircle} color="amber" trend={-2} />
        <StatCard label="Em trial" value="134 salões" icon={Clock} color="sky" />
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {["Salão", "Plano", "Valor", "Data", "Método", "Status", ""].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagamentos.map(p => (
              <tr key={p.salon} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={p.salon} size="sm" />
                    <span className="font-medium text-sm">{p.salon}</span>
                  </div>
                </td>
                <td className="px-4 py-3"><Badge variant="outline">{p.plan}</Badge></td>
                <td className="px-4 py-3 text-sm font-semibold text-primary">{p.value}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{p.date}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{p.method}</td>
                <td className="px-4 py-3">
                  <Badge variant={p.status === "paid" ? "success" : p.status === "failed" ? "danger" : "info"}>
                    {p.status === "paid" ? "Pago" : p.status === "failed" ? "Falhou" : "Trial"}
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

const adminUsers = [
  { name: "Admin beautyOS", role: "Super Admin", email: "admin@beautyos.app", last: "Agora", status: "active" },
  { name: "Carlos Mendes", role: "Suporte N1", email: "carlos@beautyos.app", last: "2h atrás", status: "active" },
  { name: "Fernanda Ramos", role: "Suporte N2", email: "fernanda@beautyos.app", last: "Hoje", status: "active" },
  { name: "Rodrigo Lima", role: "Financeiro", email: "rodrigo@beautyos.app", last: "Ontem", status: "inactive" },
];

function UsuariosView() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-medium">Usuários da plataforma</h1>
        <Button size="sm"><Plus className="w-4 h-4" /> Novo usuário</Button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {["Nome", "Função", "E-mail", "Último acesso", "Status", ""].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {adminUsers.map(u => (
              <tr key={u.name} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={u.name} size="sm" />
                    <span className="font-medium text-sm">{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={u.role === "Super Admin" ? "purple" : "outline"}>{u.role}</Badge>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{u.last}</td>
                <td className="px-4 py-3">
                  <Badge variant={u.status === "active" ? "success" : "outline"}>{u.status === "active" ? "Ativo" : "Inativo"}</Badge>
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

function ConfiguracoesAdminView() {
  return (
    <div className="p-6 space-y-5">
      <h1 className="font-serif text-2xl font-medium">Configurações da plataforma</h1>
      <div className="grid lg:grid-cols-2 gap-5 max-w-3xl">
        {[
          { title: "Dados da plataforma", fields: [{ label: "Nome", value: "beautyOS" }, { label: "Domínio", value: "beautyos.app" }, { label: "E-mail suporte", value: "suporte@beautyos.app" }] },
          { title: "Trial e planos", fields: [{ label: "Duração do trial", value: "14 dias" }, { label: "Plano padrão no trial", value: "Profissional" }, { label: "Notificação de vencimento", value: "3 dias antes" }] },
        ].map(s => (
          <div key={s.title} className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <h3 className="font-semibold">{s.title}</h3>
            {s.fields.map(f => (
              <div key={f.label}>
                <label className="text-xs font-medium text-muted-foreground block mb-1">{f.label}</label>
                <input defaultValue={f.value} className="w-full h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-background" />
              </div>
            ))}
            <Button size="sm" className="mt-1">Salvar</Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SuperAdmin() {
  const [activeSection, setActiveSection] = useState("overview");
  const [overviewData, setOverviewData] = useState<any>(null);
  const [salonsData, setSalonsData] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/superadmin/overview`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setOverviewData(data))
      .catch(console.error);

    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/superadmin/salons`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setSalonsData(data))
      .catch(console.error);
  }, []);

  const renderContent = () => {
    switch (activeSection) {
      case "overview": return <OverviewView overviewData={overviewData} />;
      case "saloes": return <SaloesView salonsData={salonsData} />;
      case "unidades": return <UnidadesView />;
      case "assinaturas": return <AssinaturasView />;
      case "planos": return <PlanosView />;
      case "pagamentos": return <PagamentosView />;
      case "usuarios": return <UsuariosView />;
      case "suporte": return <SuporteView />;
      case "configuracoes": return <ConfiguracoesAdminView />;
      default: return null;
    }
  };

  return (
    <div className="flex h-full bg-background">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-foreground flex flex-col">
        <div className="h-14 flex items-center gap-2 px-5 border-b border-white/10">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <div className="text-white font-serif text-sm font-medium">beautyOS</div>
            <div className="text-white/40 text-xs">Super Admin</div>
          </div>
        </div>

        <nav className="flex-1 py-3 overflow-y-auto">
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all ${
                activeSection === item.id
                  ? "bg-white/15 text-white"
                  : "text-white/50 hover:bg-white/8 hover:text-white/80"
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <Avatar name="Admin beautyOS" size="sm" className="shrink-0" />
            <div>
              <div className="text-white text-xs font-medium">Admin beautyOS</div>
              <div className="text-white/40 text-xs">Super Administrador</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6">
          <div className="text-sm font-medium text-muted-foreground">
            {NAV.find(n => n.id === activeSection)?.label}
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-muted relative">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <Avatar name="Admin beautyOS" size="sm" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
