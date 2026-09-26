import { useState, useEffect } from "react";
import {
  LayoutDashboard, Store, Building2, CreditCard, Package, Users, HeadphonesIcon,
  Settings, TrendingUp, ArrowUpRight, ArrowDownRight, Bell, ChevronDown, MoreHorizontal,
  CheckCircle, AlertCircle, XCircle, Clock, Sparkles, Plus, Search, Filter, LogOut,
  X, Moon, Sun, Megaphone, Shield, Download
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
  { id: "usuarios", label: "Usuários & Permissões", icon: Users },
  { id: "auditoria", label: "Auditoria", icon: Shield },
  { id: "suporte", label: "Suporte", icon: HeadphonesIcon },
  { id: "comunicacao", label: "Comunicação", icon: Megaphone },
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
  { salon: "Studio Beauty Prime", plan: "Profissional", value: "R$ 149", status: "pending", next: "Aguardando aprovação" },
  { salon: "Salão Rosé", plan: "Empresarial", value: "R$ 499", status: "active", next: "01/11/2024" },
  { salon: "Studio Carla", plan: "Profissional", value: "R$ 149", status: "active", next: "15/11/2024" },
  { salon: "Bella Estética", plan: "Premium", value: "R$ 299", status: "active", next: "20/11/2024" },
  { salon: "Hair Design", plan: "Básico", value: "R$ 0", status: "trial", next: "—" },
  { salon: "Top Nails", plan: "Profissional", value: "R$ 149", status: "late", next: "Vencida" },
];

const plans = [
  {
    name: "Básico", price: "R$ 59,90", period: "/mês", color: "#E8E0D8",
    features: ["1 profissional", "50 agendamentos/mês", "Agenda online", "Página do salão", "PIX básico"],
    users: 180, revenue: "R$ 10.782",
  },
  {
    name: "Profissional", price: "R$ 149,90", period: "/mês", color: "#9B7EA8",
    features: ["Até 5 profissionais", "Ilimitado", "Financeiro", "Comissões", "Relatórios", "Lembretes WhatsApp"],
    users: 620, revenue: "R$ 92.938",
  },
  {
    name: "Premium", price: "R$ 299,90", period: "/mês", color: "#B8614A",
    features: ["Até 15 profissionais", "Até 3 unidades", "CRM avançado", "Personalização", "Tudo do Pro"],
    users: 280, revenue: "R$ 83.972",
  },
  {
    name: "Empresarial", price: "Sob consulta", period: "", color: "#1C1714",
    features: ["Ilimitado", "Unidades ilimitadas", "API + integrações", "Gerente de Conta", "SLA"],
    users: 42, revenue: "R$ 126.000",
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
  pending: { label: "Em Análise", variant: "warning" },
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

      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Análise de Cohort (Retenção)</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Comportamento de retenção por mês de ativação</p>
          </div>
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Exportar CSV</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 text-left font-medium text-muted-foreground w-32">Mês (Ativação)</th>
                <th className="py-2 text-left font-medium text-muted-foreground w-20">Salões</th>
                {[1, 2, 3, 4, 5, 6].map(m => (
                  <th key={m} className="py-2 text-center font-medium text-muted-foreground w-16">Mês {m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { month: "Jan 2024", total: 120, data: [100, 95, 90, 85, 80, 78] },
                { month: "Fev 2024", total: 145, data: [100, 96, 92, 88, 85, "-"] },
                { month: "Mar 2024", total: 180, data: [100, 98, 93, 90, "-", "-"] },
                { month: "Abr 2024", total: 210, data: [100, 94, 91, "-", "-", "-"] },
              ].map(row => (
                <tr key={row.month} className="border-b border-border/50 last:border-0">
                  <td className="py-2.5 font-medium">{row.month}</td>
                  <td className="py-2.5 text-muted-foreground">{row.total}</td>
                  {row.data.map((val, idx) => {
                    const isNum = typeof val === "number";
                    const bgOpacity = isNum ? Math.max(0.1, (val - 70) / 30) : 0;
                    return (
                      <td key={idx} className="py-2.5 px-1 text-center">
                        {isNum ? (
                          <div className="py-1 rounded font-medium text-emerald-800" style={{ backgroundColor: `rgba(16, 185, 129, ${bgOpacity})` }}>
                            {val}%
                          </div>
                        ) : <span className="text-muted-foreground/30">{val}</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SaloesView({ salonsData }: { salonsData: any }) {
  const [filter, setFilter] = useState("Todos");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [drawerInfo, setDrawerInfo] = useState<{ salonName: string, type: 'history' | 'edit' } | null>(null);

  const initialData = Array.isArray(salonsData) && salonsData.length > 0 ? salonsData : saloes;
  const [localSalons, setLocalSalons] = useState<any[]>(initialData);

  useEffect(() => {
    setLocalSalons(Array.isArray(salonsData) && salonsData.length > 0 ? salonsData : saloes);
  }, [salonsData]);

  if (salonsData && salonsData.error) {
    return <div className="p-6 text-red-500 font-medium">Erro ao carregar salões: {salonsData.error}. Verifique o banco de dados.</div>;
  }
  
  const handleAction = (salonName: string, action: string) => {
    setOpenMenu(null);
    if (action === 'block') {
      const confirm = window.confirm(`Tem certeza que deseja bloquear o salão ${salonName}?`);
      if (confirm) {
        setLocalSalons(prev => prev.map(s => s.name === salonName ? { ...s, status: 'blocked' } : s));
      }
    } else if (action === 'history' || action === 'edit') {
      setDrawerInfo({ salonName, type: action as 'history' | 'edit' });
    }
  };

  const dataToUse = filter === "Todos" 
    ? localSalons 
    : localSalons.filter((s: any) => {
        if (filter === "Ativos") return s.status === "active";
        if (filter === "Trial") return s.status === "trial";
        if (filter === "Inadimplentes") return s.status === "late";
        if (filter === "Bloqueados") return s.status === "blocked";
        return true;
      });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-medium">Salões</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 h-9 text-sm text-muted-foreground">
            <Search className="w-4 h-4" />
            <input placeholder="Buscar salão..." className="bg-transparent outline-none placeholder:text-muted-foreground" />
          </div>
          <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" /> Filtrar</Button>
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" /> Exportar CSV</Button>
        </div>
      </div>

      <div className="flex gap-2">
        {["Todos", "Ativos", "Trial", "Inadimplentes", "Bloqueados"].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
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
                <td className="px-4 py-3 relative">
                  <button onClick={() => setOpenMenu(openMenu === s.name ? null : s.name)} className="p-1.5 rounded-lg hover:bg-muted"><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></button>
                  {openMenu === s.name && (
                    <div className="absolute right-8 top-10 w-40 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                      <button onClick={() => handleAction(s.name, 'history')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700">Ver histórico</button>
                      <button onClick={() => handleAction(s.name, 'edit')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700">Editar dados</button>
                      <button onClick={() => handleAction(s.name, 'block')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600">Bloquear</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {drawerInfo && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={() => setDrawerInfo(null)}>
          <div className="w-[400px] sm:w-[450px] bg-background h-full shadow-2xl flex flex-col animate-in slide-in-from-right" onClick={e => e.stopPropagation()}>
            <div className="h-14 border-b border-border flex items-center justify-between px-6 shrink-0">
              <h3 className="font-medium font-serif">{drawerInfo.type === 'history' ? 'Histórico do Salão' : 'Editar Dados'}</h3>
              <button onClick={() => setDrawerInfo(null)} className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="flex items-center gap-4 mb-6">
                <Avatar name={drawerInfo.salonName} size="md" />
                <div>
                  <div className="font-semibold text-lg">{drawerInfo.salonName}</div>
                  <Badge variant="outline" className="mt-1">Desde 10/01/2023</Badge>
                </div>
              </div>
              
              {drawerInfo.type === 'history' ? (
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground mb-4">Últimas Atividades</h4>
                  <div className="border-l-2 border-border ml-3 pl-4 py-2 space-y-6">
                    <div className="relative">
                      <div className="absolute -left-[23px] top-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background"></div>
                      <p className="text-sm font-medium">Pagamento Confirmado</p>
                      <p className="text-xs text-muted-foreground">Há 5 dias - Plano Profissional</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[23px] top-1 w-3 h-3 bg-primary rounded-full border-2 border-background"></div>
                      <p className="text-sm font-medium">Acesso ao sistema</p>
                      <p className="text-xs text-muted-foreground">Hoje às 10:30</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[23px] top-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-background"></div>
                      <p className="text-sm font-medium">Ticket de Suporte aberto</p>
                      <p className="text-xs text-muted-foreground">Há 2 semanas - Status: Resolvido</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Nome do Salão</label>
                    <input defaultValue={drawerInfo.salonName} className="w-full h-10 rounded-lg border border-border px-3 text-sm bg-background outline-none focus:border-primary transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Responsável</label>
                    <input defaultValue={localSalons.find(s => s.name === drawerInfo.salonName)?.owner} className="w-full h-10 rounded-lg border border-border px-3 text-sm bg-background outline-none focus:border-primary transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Plano Atual</label>
                    <select defaultValue={localSalons.find(s => s.name === drawerInfo.salonName)?.plan} className="w-full h-10 rounded-lg border border-border px-3 text-sm bg-background outline-none focus:border-primary transition-colors">
                      <option>Básico</option>
                      <option>Profissional</option>
                      <option>Premium</option>
                      <option>Empresarial</option>
                    </select>
                  </div>
                  <Button className="w-full mt-4" onClick={() => setDrawerInfo(null)}>Salvar Alterações</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AssinaturasView() {
  const [localSubs, setLocalSubs] = useState<any[]>(subscriptions);
  const [filter, setFilter] = useState("Todos");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [kycDrawer, setKycDrawer] = useState<string | null>(null);

  const handleAction = (salonName: string, action: string) => {
    setOpenMenu(null);
    if (action === 'analyze') {
      setKycDrawer(salonName);
    } else if (action === 'cancel') {
      const confirm = window.confirm(`Deseja cancelar a assinatura de ${salonName}?`);
      if (confirm) {
        setLocalSubs(prev => prev.map(s => s.salon === salonName ? { ...s, status: 'cancelled' } : s));
      }
    }
  };

  const handleApproveKYC = () => {
    setLocalSubs(prev => prev.map(s => s.salon === kycDrawer ? { ...s, status: 'active', next: 'Daqui a 30 dias' } : s));
    setKycDrawer(null);
  };

  const handleRejectKYC = () => {
    if(window.confirm("Rejeitar este salão permanentemente?")) {
      setLocalSubs(prev => prev.map(s => s.salon === kycDrawer ? { ...s, status: 'cancelled' } : s));
      setKycDrawer(null);
    }
  };

  const dataToUse = filter === "Todos" 
    ? localSubs 
    : localSubs.filter((s: any) => {
        if (filter === "Em Análise") return s.status === "pending";
        if (filter === "Ativas") return s.status === "active";
        if (filter === "Inadimplentes") return s.status === "late";
        return true;
      });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-medium">Assinaturas e KYC</h1>
        <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" /> Exportar Dados (PDF)</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Em Análise" value={localSubs.filter(s => s.status === 'pending').length.toString()} icon={Clock} color="amber" />
        <StatCard label="Ativas" value={localSubs.filter(s => s.status === 'active').length.toString()} icon={CheckCircle} color="emerald" />
        <StatCard label="Inadimplentes" value={localSubs.filter(s => s.status === 'late').length.toString()} icon={AlertCircle} color="rose" />
        <StatCard label="Canceladas" value={localSubs.filter(s => s.status === 'cancelled').length.toString()} icon={XCircle} color="slate" />
      </div>

      <div className="flex gap-2 my-4">
        {["Todos", "Em Análise", "Ativas", "Inadimplentes"].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            {f}
          </button>
        ))}
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
            {dataToUse.map(s => (
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
                <td className="px-4 py-3 relative">
                  <button onClick={() => setOpenMenu(openMenu === s.salon ? null : s.salon)} className="p-1.5 rounded-lg hover:bg-muted"><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></button>
                  {openMenu === s.salon && (
                    <div className="absolute right-8 top-10 w-48 bg-card border border-border rounded-xl shadow-lg py-1 z-50">
                      {s.status === 'pending' && (
                        <button onClick={() => handleAction(s.salon, 'analyze')} className="w-full text-left px-4 py-2 text-sm hover:bg-muted text-emerald-500 font-medium">Validar Compliance (KYC)</button>
                      )}
                      <button onClick={() => handleAction(s.salon, 'cancel')} className="w-full text-left px-4 py-2 text-sm hover:bg-muted text-red-500">Cancelar assinatura</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {kycDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={() => setKycDrawer(null)}>
          <div className="w-[450px] sm:w-[500px] bg-background h-full shadow-2xl flex flex-col animate-in slide-in-from-right" onClick={e => e.stopPropagation()}>
            <div className="h-14 border-b border-border flex items-center justify-between px-6 shrink-0">
              <h3 className="font-medium font-serif">Validação de Compliance (KYC)</h3>
              <button onClick={() => setKycDrawer(null)} className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors"><X className="w-4 h-4" /></button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              <div className="flex items-center gap-4 border-b border-border pb-6">
                <Avatar name={kycDrawer} size="lg" />
                <div>
                  <h4 className="text-xl font-medium">{kycDrawer}</h4>
                  <Badge variant="warning" className="mt-1">Aguardando Aprovação</Badge>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="font-medium text-sm text-foreground uppercase tracking-wider">Dados Cadastrais (Receita Federal)</h5>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/30 p-3 rounded-lg border border-border">
                    <span className="block text-xs text-muted-foreground mb-1">CNPJ</span>
                    <span className="font-mono text-sm">45.293.109/0001-44</span>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg border border-border">
                    <span className="block text-xs text-muted-foreground mb-1">Status Receita</span>
                    <span className="text-sm font-medium text-emerald-500 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> ATIVA</span>
                  </div>
                </div>

                <div className="bg-muted/30 p-3 rounded-lg border border-border">
                  <span className="block text-xs text-muted-foreground mb-1">Razão Social</span>
                  <span className="text-sm font-medium">BELEZA PURA ESTETICA LTDA</span>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="font-medium text-sm text-foreground uppercase tracking-wider">Split de Pagamentos (Recebimento)</h5>
                
                <div className="bg-muted/30 p-4 rounded-lg border border-border space-y-3">
                  <div className="flex justify-between items-center border-b border-border pb-2">
                    <span className="text-sm text-muted-foreground">Banco</span>
                    <span className="text-sm font-medium">Itaú Unibanco (341)</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border pb-2">
                    <span className="text-sm text-muted-foreground">Agência / Conta</span>
                    <span className="text-sm font-medium">1234 / 56789-0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Titular</span>
                    <span className="text-sm font-medium">BELEZA PURA ESTETICA LTDA</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-emerald-500/10 text-emerald-600 rounded-lg text-sm border border-emerald-500/20">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  Titularidade da conta coincide com o CNPJ informado.
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="font-medium text-sm text-foreground uppercase tracking-wider">Documentos Anexados</h5>
                <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-card">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg"><CheckCircle className="w-4 h-4 text-primary" /></div>
                    <div>
                      <div className="text-sm font-medium">Contrato Social.pdf</div>
                      <div className="text-xs text-muted-foreground">Enviado hoje, 2MB</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Visualizar</Button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border flex gap-3 bg-card shrink-0">
              <Button variant="outline" className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleRejectKYC}>Rejeitar</Button>
              <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white" onClick={handleApproveKYC}>Aprovar e Ativar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PlanosView() {
  const [plansList, setPlansList] = useState<any[]>([]);
  const [newPlan, setNewPlan] = useState({ name: "", price: "", features: "" });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/superadmin/plans`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(setPlansList)
      .catch(console.error);
  }, []);

  const handleCreate = async () => {
    const data = {
      name: newPlan.name,
      price: parseFloat(newPlan.price) || 0,
      features: newPlan.features.split(',').map(f => f.trim())
    };
    await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/superadmin/plans`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(data)
    });
    setNewPlan({ name: "", price: "", features: "" });
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/superadmin/plans`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
    setPlansList(await res.json());
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-serif text-2xl font-medium">Planos</h1>
      </div>

      {/* Form to create plan */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3 max-w-3xl">
        <h3 className="font-semibold">Cadastrar Novo Plano</h3>
        <div className="flex gap-4">
          <input value={newPlan.name} onChange={e => setNewPlan({...newPlan, name: e.target.value})} placeholder="Nome do plano" className="flex-1 h-10 rounded-lg border border-border px-3 text-sm outline-none bg-background" />
          <input value={newPlan.price} onChange={e => setNewPlan({...newPlan, price: e.target.value})} placeholder="Preço (ex: 49.90)" className="w-32 h-10 rounded-lg border border-border px-3 text-sm outline-none bg-background" />
        </div>
        <input value={newPlan.features} onChange={e => setNewPlan({...newPlan, features: e.target.value})} placeholder="Funcionalidades (separadas por vírgula)" className="w-full h-10 rounded-lg border border-border px-3 text-sm outline-none bg-background" />
        <Button size="sm" onClick={handleCreate}>Cadastrar</Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plansList.map(p => (
          <div key={p.id} className="bg-card border border-border rounded-2xl overflow-hidden relative">
            <div className="h-2" style={{ background: p.color || '#000' }} />
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{p.name}</h3>
              </div>
              <div className="font-serif text-3xl font-medium mb-1">R$ {p.price}</div>
              <div className="text-muted-foreground text-sm mb-4">{p.period || "/mês"}</div>
              <ul className="space-y-2 mb-4">
                {(p.features || []).map((f: string) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
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
  const [localTickets, setLocalTickets] = useState(tickets);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const handleAction = (id: string, action: string) => {
    setOpenMenu(null);
    if (action === 'resolve') {
      setLocalTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'resolved' } : t));
    } else if (action === 'view') {
      alert(`Abrindo detalhes do ticket ${id}...`);
    } else if (action === 'escalate') {
      setLocalTickets(prev => prev.map(t => t.id === id ? { ...t, priority: 'alta' } : t));
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-medium">Suporte</h1>
        <div className="flex gap-2">
          <Badge variant="danger">{localTickets.filter(t => t.priority === 'alta' && t.status === 'open').length} urgentes</Badge>
          <Badge variant="warning">{localTickets.filter(t => t.status === 'open').length} abertos</Badge>
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
            {localTickets.map(t => (
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
                <td className="px-4 py-3 relative">
                  <button onClick={() => setOpenMenu(openMenu === t.id ? null : t.id)} className="p-1.5 rounded-lg hover:bg-muted"><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></button>
                  {openMenu === t.id && (
                    <div className="absolute right-8 top-10 w-40 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                      <button onClick={() => handleAction(t.id, 'view')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700">Ver detalhes</button>
                      {t.status === 'open' && (
                        <>
                          <button onClick={() => handleAction(t.id, 'escalate')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-amber-600">Escalar prioridade</button>
                          <button onClick={() => handleAction(t.id, 'resolve')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-emerald-600">Marcar resolvido</button>
                        </>
                      )}
                    </div>
                  )}
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
  const [localUnidades, setLocalUnidades] = useState(unidades);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const handleAction = (name: string, action: string) => {
    setOpenMenu(null);
    if (action === 'toggle') {
      setLocalUnidades(prev => prev.map(u => u.name === name ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
    } else if (action === 'edit') {
      alert(`Abrindo formulário de edição para ${name}...`);
    } else if (action === 'delete') {
      if(window.confirm(`Tem certeza que deseja excluir ${name}?`)) {
        setLocalUnidades(prev => prev.filter(u => u.name !== name));
      }
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-medium">Unidades</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary px-3 py-1.5 rounded-lg">
          <Building2 className="w-4 h-4" /> {localUnidades.length} unidades cadastradas
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
            {localUnidades.map(u => (
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
                <td className="px-4 py-3 relative">
                  <button onClick={() => setOpenMenu(openMenu === u.name ? null : u.name)} className="p-1.5 rounded-lg hover:bg-muted"><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></button>
                  {openMenu === u.name && (
                    <div className="absolute right-8 top-10 w-40 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                      <button onClick={() => handleAction(u.name, 'edit')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700">Editar</button>
                      <button onClick={() => handleAction(u.name, 'toggle')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700">{u.status === 'active' ? 'Desativar' : 'Ativar'}</button>
                      <button onClick={() => handleAction(u.name, 'delete')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600">Excluir</button>
                    </div>
                  )}
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
  const [localPagamentos, setLocalPagamentos] = useState(pagamentos);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const handleAction = (salon: string, action: string) => {
    setOpenMenu(null);
    if (action === 'receipt') {
      alert(`Gerando 2ª via do recibo para ${salon}...`);
    } else if (action === 'charge') {
      alert(`Enviando cobrança manual para ${salon}...`);
      setLocalPagamentos(prev => prev.map(p => p.salon === salon ? { ...p, status: 'paid' } : p));
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-medium">Pagamentos</h1>
        <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" /> Exportar Faturamento (CSV)</Button>
      </div>

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
            {localPagamentos.map(p => (
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
                <td className="px-4 py-3 relative">
                  <button onClick={() => setOpenMenu(openMenu === p.salon ? null : p.salon)} className="p-1.5 rounded-lg hover:bg-muted"><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></button>
                  {openMenu === p.salon && (
                    <div className="absolute right-8 top-10 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                      <button onClick={() => handleAction(p.salon, 'receipt')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700">Ver recibo</button>
                      {p.status === 'failed' && (
                        <button onClick={() => handleAction(p.salon, 'charge')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-amber-600">Reenviar cobrança</button>
                      )}
                    </div>
                  )}
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
  { id: 1, name: "Admin beautyOS", role: "Super Admin", email: "admin@beautyos.app", last: "Agora", status: "active", permissions: ["all"] },
  { id: 2, name: "Carlos Mendes", role: "Suporte N1", email: "carlos@beautyos.app", last: "2h atrás", status: "active", permissions: ["tickets:read", "tickets:write"] },
  { id: 3, name: "Fernanda Ramos", role: "Suporte N2", email: "fernanda@beautyos.app", last: "Hoje", status: "active", permissions: ["tickets:read", "tickets:write", "salons:read"] },
  { id: 4, name: "Rodrigo Lima", role: "Financeiro", email: "rodrigo@beautyos.app", last: "Ontem", status: "inactive", permissions: ["finance:read", "finance:write"] },
];

function UsuariosView() {
  const [localUsers, setLocalUsers] = useState(adminUsers);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [drawerUser, setDrawerUser] = useState<any | null>(null);

  const handleAction = (id: number, action: string) => {
    setOpenMenu(null);
    if (action === 'toggle') {
      setLocalUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
    } else if (action === 'delete') {
      if(window.confirm(`Excluir usuário permanentemente?`)) {
        setLocalUsers(prev => prev.filter(u => u.id !== id));
      }
    } else if (action === 'edit') {
      const user = localUsers.find(u => u.id === id);
      if(user) setDrawerUser(user);
    }
  };

  const handleNewUser = () => {
    setDrawerUser({ id: Date.now(), name: "", email: "", role: "Visualizador", status: "active", permissions: [] });
  };

  const handleSaveUser = () => {
    if(!drawerUser.name || !drawerUser.email) return alert("Preencha nome e e-mail");
    const exists = localUsers.find(u => u.id === drawerUser.id);
    if (exists) {
      setLocalUsers(prev => prev.map(u => u.id === drawerUser.id ? drawerUser : u));
    } else {
      setLocalUsers([{ ...drawerUser, last: "Nunca" }, ...localUsers]);
    }
    setDrawerUser(null);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-medium">Usuários da plataforma</h1>
        <Button size="sm" onClick={handleNewUser}><Plus className="w-4 h-4" /> Novo usuário</Button>
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
            {localUsers.map(u => (
              <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={u.name} size="sm" />
                    <span className="font-medium text-sm">{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={u.role === "Super Admin" ? "purple" : "outline"} className={u.role !== "Super Admin" ? "bg-secondary/50" : ""}>{u.role}</Badge>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{u.last}</td>
                <td className="px-4 py-3">
                  <Badge variant={u.status === "active" ? "success" : "outline"}>{u.status === "active" ? "Ativo" : "Inativo"}</Badge>
                </td>
                <td className="px-4 py-3 relative">
                  <button onClick={() => setOpenMenu(openMenu === u.id ? null : u.id)} className="p-1.5 rounded-lg hover:bg-muted"><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></button>
                  {openMenu === u.id && (
                    <div className="absolute right-8 top-10 w-40 bg-card border border-border rounded-xl shadow-lg py-1 z-50">
                      <button onClick={() => handleAction(u.id, 'edit')} className="w-full text-left px-4 py-2 text-sm hover:bg-muted text-foreground">Editar Permissões</button>
                      <button onClick={() => handleAction(u.id, 'toggle')} className="w-full text-left px-4 py-2 text-sm hover:bg-muted text-foreground">{u.status === 'active' ? 'Desativar' : 'Ativar'}</button>
                      <button onClick={() => handleAction(u.id, 'delete')} className="w-full text-left px-4 py-2 text-sm hover:bg-muted text-red-500">Excluir</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {drawerUser && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={() => setDrawerUser(null)}>
          <div className="w-[400px] sm:w-[450px] bg-background h-full shadow-2xl flex flex-col animate-in slide-in-from-right" onClick={e => e.stopPropagation()}>
            <div className="h-14 border-b border-border flex items-center justify-between px-6 shrink-0">
              <h3 className="font-medium font-serif">{drawerUser.id > 10000 ? 'Novo Usuário' : 'Editar Usuário e Permissões'}</h3>
              <button onClick={() => setDrawerUser(null)} className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto space-y-5">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Nome Completo</label>
                <input value={drawerUser.name} onChange={e => setDrawerUser({...drawerUser, name: e.target.value})} className="w-full h-10 rounded-lg border border-border px-3 text-sm bg-background outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">E-mail Corporativo</label>
                <input value={drawerUser.email} onChange={e => setDrawerUser({...drawerUser, email: e.target.value})} type="email" className="w-full h-10 rounded-lg border border-border px-3 text-sm bg-background outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Cargo / Função (RBAC)</label>
                <select value={drawerUser.role} onChange={e => setDrawerUser({...drawerUser, role: e.target.value})} className="w-full h-10 rounded-lg border border-border px-3 text-sm bg-background outline-none focus:border-primary transition-colors">
                  <option>Super Admin</option>
                  <option>Admin</option>
                  <option>Financeiro</option>
                  <option>Suporte N2</option>
                  <option>Suporte N1</option>
                  <option>Visualizador</option>
                </select>
              </div>
              
              <div className="pt-2">
                <label className="text-sm font-medium mb-3 block">Privilégios de Acesso Específicos</label>
                <div className="space-y-3 border border-border rounded-xl p-4 bg-muted/20">
                  {['salons', 'finance', 'tickets', 'plans', 'users', 'audit'].map(resource => (
                    <div key={resource} className="flex flex-col gap-1.5 pb-3 border-b border-border last:border-0 last:pb-0">
                      <span className="text-xs font-semibold uppercase text-muted-foreground">{resource === 'salons' ? 'Gestão de Salões' : resource === 'finance' ? 'Financeiro & Pagamentos' : resource === 'tickets' ? 'Suporte & Tickets' : resource === 'plans' ? 'Planos & Assinaturas' : resource === 'users' ? 'Usuários do Sistema' : 'Logs de Auditoria'}</span>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" checked={drawerUser.role === 'Super Admin' || drawerUser.permissions?.includes(`${resource}:read`)} onChange={e => {
                            if(drawerUser.role === 'Super Admin') return;
                            const p = new Set(drawerUser.permissions || []);
                            e.target.checked ? p.add(`${resource}:read`) : p.delete(`${resource}:read`);
                            setDrawerUser({...drawerUser, permissions: Array.from(p)});
                          }} disabled={drawerUser.role === 'Super Admin'} />
                          Leitura
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" checked={drawerUser.role === 'Super Admin' || drawerUser.permissions?.includes(`${resource}:write`)} onChange={e => {
                            if(drawerUser.role === 'Super Admin') return;
                            const p = new Set(drawerUser.permissions || []);
                            e.target.checked ? p.add(`${resource}:write`) : p.delete(`${resource}:write`);
                            if(e.target.checked) p.add(`${resource}:read`); // write implies read
                            setDrawerUser({...drawerUser, permissions: Array.from(p)});
                          }} disabled={drawerUser.role === 'Super Admin'} />
                          Escrita
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <Button className="w-full mt-4" onClick={handleSaveUser}>Salvar Configurações de Acesso</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ConfiguracoesAdminView() {
  const [platformData, setPlatformData] = useState({
    platformName: "",
    domain: "",
    supportEmail: ""
  });

  const [trialData, setTrialData] = useState({
    trialDays: 14,
    defaultPlanId: ""
  });

  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/superadmin/settings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setPlatformData({
          platformName: data.platformName || "beautyOS",
          domain: data.domain || "beautyos.app",
          supportEmail: data.supportEmail || "suporte@beautyos.app"
        });
        setTrialData({
          trialDays: data.trialDays || 14,
          defaultPlanId: data.defaultPlanId || ""
        });
      })
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/superadmin/settings`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...platformData, ...trialData })
      });
      showToast("Configurações salvas com sucesso!");
    } catch (e) {
      showToast("Erro ao salvar configurações.");
    }
  };

  return (
    <div className="p-6 space-y-5 relative">
      <h1 className="font-serif text-2xl font-medium">Configurações da plataforma</h1>
      <div className="grid lg:grid-cols-2 gap-5 max-w-3xl">
        <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
          <h3 className="font-semibold">Dados da plataforma</h3>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Nome</label>
            <input value={platformData.platformName} onChange={(e) => setPlatformData({...platformData, platformName: e.target.value})} className="w-full h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-background" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Domínio</label>
            <input value={platformData.domain} onChange={(e) => setPlatformData({...platformData, domain: e.target.value})} className="w-full h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-background" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">E-mail suporte</label>
            <input value={platformData.supportEmail} onChange={(e) => setPlatformData({...platformData, supportEmail: e.target.value})} className="w-full h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-background" />
          </div>
          <Button size="sm" className="mt-1" onClick={handleSave}>Salvar</Button>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
          <h3 className="font-semibold">Trial e planos</h3>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Duração do trial (dias)</label>
            <input type="number" value={trialData.trialDays} onChange={(e) => setTrialData({...trialData, trialDays: parseInt(e.target.value) || 0})} className="w-full h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-background" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">ID do Plano padrão</label>
            <input value={trialData.defaultPlanId} onChange={(e) => setTrialData({...trialData, defaultPlanId: e.target.value})} className="w-full h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-background" />
          </div>
          <Button size="sm" className="mt-1" onClick={handleSave}>Salvar</Button>
        </div>
      </div>
      
      {toast && (
        <div className="fixed bottom-10 right-10 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 z-50">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}
    </div>
  );
}

const broadcasts = [
  { id: 1, title: "Manutenção programada (V2.0)", audience: "Todos", date: "Ontem, 22:00", status: "sent" },
  { id: 2, title: "Lembrete: Como usar o split de pagamento", audience: "Ativos", date: "Segunda, 10:00", status: "sent" },
  { id: 3, title: "Sua trial está acabando!", audience: "Trial", date: "Hoje, 09:00", status: "sent" },
];

function ComunicacaoView() {
  const [localBroadcasts, setLocalBroadcasts] = useState(broadcasts);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [newMsg, setNewMsg] = useState({ title: "", audience: "Todos os Salões", text: "" });

  const handleSend = () => {
    if(!newMsg.title || !newMsg.text) return alert("Preencha todos os campos");
    setLocalBroadcasts([{ 
      id: Date.now(), 
      title: newMsg.title, 
      audience: newMsg.audience, 
      date: "Agora mesmo", 
      status: "sent" 
    }, ...localBroadcasts]);
    setDrawerOpen(false);
    setNewMsg({ title: "", audience: "Todos os Salões", text: "" });
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-medium">Comunicação e Avisos</h1>
        <Button size="sm" onClick={() => setDrawerOpen(true)}><Megaphone className="w-4 h-4 mr-2" /> Novo Aviso Global</Button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden mt-4">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {["Título do Aviso", "Público-alvo", "Data de envio", "Status"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {localBroadcasts.map(b => (
              <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3 text-sm font-medium">{b.title}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{b.audience}</Badge>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{b.date}</td>
                <td className="px-4 py-3">
                  <Badge variant="success">Enviado</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={() => setDrawerOpen(false)}>
          <div className="w-[400px] sm:w-[450px] bg-background h-full shadow-2xl flex flex-col animate-in slide-in-from-right" onClick={e => e.stopPropagation()}>
            <div className="h-14 border-b border-border flex items-center justify-between px-6 shrink-0">
              <h3 className="font-medium font-serif">Criar Aviso Global</h3>
              <button onClick={() => setDrawerOpen(false)} className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto space-y-5">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Título do aviso</label>
                <input value={newMsg.title} onChange={e => setNewMsg({...newMsg, title: e.target.value})} placeholder="Ex: Nova atualização disponível" className="w-full h-10 rounded-lg border border-border px-3 text-sm bg-background outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Público-alvo</label>
                <select value={newMsg.audience} onChange={e => setNewMsg({...newMsg, audience: e.target.value})} className="w-full h-10 rounded-lg border border-border px-3 text-sm bg-background outline-none focus:border-primary transition-colors">
                  <option>Todos os Salões</option>
                  <option>Salões Ativos</option>
                  <option>Salões em Trial</option>
                  <option>Salões Inadimplentes</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Mensagem (Markdown suportado)</label>
                <textarea value={newMsg.text} onChange={e => setNewMsg({...newMsg, text: e.target.value})} rows={6} className="w-full rounded-lg border border-border p-3 text-sm bg-background outline-none focus:border-primary transition-colors resize-none" placeholder="Escreva a mensagem aqui..." />
              </div>
              <div className="bg-amber-500/10 text-amber-600 p-3 rounded-lg text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>Este aviso aparecerá no dashboard dos salões imediatamente após o envio. Certifique-se de revisar o texto.</p>
              </div>
              <Button className="w-full" onClick={handleSend}>Publicar Aviso Agora</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SuperAdmin() {
  const [activeSection, setActiveSection] = useState("overview");
  const [overviewData, setOverviewData] = useState<any>(null);
  const [salonsData, setSalonsData] = useState<any[]>([]);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  };

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
      case "auditoria": return <AuditoriaView />;
      case "suporte": return <SuporteView />;
      case "comunicacao": return <ComunicacaoView />;
      case "configuracoes": return <ConfiguracoesAdminView />;
      default: return null;
    }
  };

  return (
    <div className="flex h-full bg-background">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-zinc-950 flex flex-col">
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
            <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors" title={isDark ? "Modo Claro" : "Modo Escuro"}>
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button className="p-2 rounded-lg hover:bg-muted relative">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <Avatar name="Admin beautyOS" size="sm" />
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/login';
              }}
              className="p-2 rounded-lg hover:bg-red-50 text-red-500 flex items-center transition-colors ml-2"
              title="Sair da conta"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
