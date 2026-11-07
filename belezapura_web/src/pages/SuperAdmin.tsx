import { api } from "@/lib/api";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Store, Building2, CreditCard, Package, Users, HeadphonesIcon,
  Settings, TrendingUp, ArrowUpRight, ArrowDownRight, Bell, ChevronDown, MoreHorizontal,
  CheckCircle, AlertCircle, XCircle, Clock, Sparkles, Plus, Search, Filter, LogOut,
  X, Moon, Sun, Megaphone, Shield, Download, Menu
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from "recharts";
import { Button, Badge, Avatar } from "@/components/ui";

const NAV = [
  { id: "overview", label: "Visão geral", icon: LayoutDashboard },
  { id: "saloes", label: "Salões", icon: Store },
  { id: "assinaturas", label: "Assinaturas", icon: CreditCard },
  { id: "planos", label: "Planos", icon: Package },
  { id: "pagamentos", label: "Pagamentos", icon: CreditCard },
  { id: "usuarios", label: "Usuários & Permissões", icon: Users },
  { id: "auditoria", label: "Auditoria", icon: Shield },
  { id: "configuracoes", label: "Configurações", icon: Settings },
];

const mrrData: any[] = [];
const growthData: any[] = [];
const churnData: any[] = [];
const saloes: any[] = [];
const subscriptions: any[] = [];

const plans = [
  {
    name: "Essencial", price: "R$ 59,90", period: "/mês", color: "#B8614A",
    features: ["1 profissional", "Página exclusiva na Bio", "Agendamento online 24h", "Sinal antecipado via PIX", "Lembretes automáticos"],
    users: 0, revenue: "R$ 0",
  },
  {
    name: "Studio", price: "R$ 119,90", period: "/mês", color: "#111827",
    features: ["Até 5 profissionais", "Rateio e comissões automáticas", "Painel financeiro completo", "Lembretes no WhatsApp", "🎁 14 dias de teste grátis"],
    users: 0, revenue: "R$ 0",
  },
  {
    name: "Elite", price: "R$ 319,09", period: "/mês", color: "#E5A991",
    features: ["Profissionais ilimitados", "Automação total WhatsApp", "Mensagens de retorno para inativos", "Controle de estoque", "Suporte prioritário VIP"],
    users: 0, revenue: "R$ 0",
  },
];

const tickets: any[] = [];

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
  canceled: { label: "Cancelado", variant: "outline" },
  pending: { label: "Em Análise", variant: "warning" },
};

const normalizeStatus = (status?: string) => (status || "").toLowerCase();

const statusBadge = (status?: string) => {
  const normalized = normalizeStatus(status);
  return statusConfig[normalized] || { label: status || "Sem status", variant: "outline" as const };
};

function OverviewView({ overviewData }: { overviewData: any }) {
  if (!overviewData) return <div className="p-6 text-sm text-muted-foreground">Carregando indicadores...</div>;
  if (overviewData.error) return <div className="p-6 text-red-500 font-medium">Erro ao carregar os dados: {overviewData.error}. Verifique o banco de dados.</div>;
  
  const {
    totalSalons,
    activeSubscriptions,
    trialSubscriptions,
    lateSubscriptions,
    totalAppointments,
    totalClients,
    mrrData,
    mrrValue,
    totalRevenueReceived,
    pendingRevenue,
  } = overviewData;

  const exportCohortCsv = () => {
    const csv = "Mes,Saloes,Mes1,Mes2,Mes3,Mes4,Mes5,Mes6\nJan 2026,120,100%,95%,90%,85%,80%,78%\nFev 2026,145,100%,96%,92%,88%,85%,-\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "retencao-belezapura.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-3 sm:p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-medium">Visão geral da plataforma & Finanças</h1>
          <p className="text-muted-foreground text-sm">Controle central do Super Admin atualizado em tempo real</p>
        </div>
        <Badge variant="success" className="text-sm px-3 py-1">✓ Poder Supremo & Finanças Alinhadas</Badge>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard 
          label="MRR (Receita Recorrente)" 
          value={`R$ ${(Number(mrrValue ?? 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          sub="Assinaturas ativas no mês" 
          icon={TrendingUp} 
          trend={9} 
          color="emerald" 
        />
        <StatCard 
          label="Caixa Total Recebido" 
          value={`R$ ${(Number(totalRevenueReceived ?? 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          sub="Pagamentos Pix confirmados" 
          icon={CreditCard} 
          color="purple" 
        />
        <StatCard 
          label="A Receber (Em análise)" 
          value={`R$ ${(Number(pendingRevenue ?? 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          sub="Solicitações aguardando conferência" 
          icon={Clock} 
          color="amber" 
        />
        <StatCard label="Salões cadastrados" value={String(totalSalons ?? 0)} sub={`${activeSubscriptions ?? 0} ativos · ${trialSubscriptions ?? 0} em trial`} icon={Store} trend={21} color="primary" />
        <StatCard label="Assinaturas ativas" value={String(activeSubscriptions ?? 0)} icon={CheckCircle} trend={8} color="emerald" />
        <StatCard label="Inadimplentes / Bloq." value={String(lateSubscriptions ?? 0)} icon={AlertCircle} trend={0} color="rose" />
        <StatCard label="Agendamentos totais" value={String(totalAppointments ?? 0)} icon={Sparkles} trend={14} color="sky" />
        <StatCard label="Clientes finais atendidos" value={String(totalClients ?? 0)} icon={Users} trend={18} color="amber" />
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

  const initialData = Array.isArray(salonsData) ? salonsData : [];
  const [localSalons, setLocalSalons] = useState<any[]>(initialData);

  useEffect(() => {
    setLocalSalons(Array.isArray(salonsData) ? salonsData : []);
  }, [salonsData]);

  const [editSalonForm, setEditSalonForm] = useState({
    id: '', name: '', owner: '', plan: 'Studio', status: 'TRIAL',
    whatsappEnabled: false, whatsappMonthlyLimit: '0', whatsappUsed: 0, whatsappPlanLimit: 0,
  });
  const [savingSalon, setSavingSalon] = useState(false);
  const [search, setSearch] = useState("");

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3050';

  const handleAction = async (salon: any, action: string) => {
    setOpenMenu(null);
    if (action === 'block') {
      const confirm = window.confirm(`Tem certeza que deseja bloquear o salão ${salon.name}?`);
      if (confirm) {
        await fetch(`${API_BASE}/api/superadmin/salons/${salon.id}/block`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setLocalSalons(prev => prev.map(s => s.id === salon.id ? { ...s, status: 'BLOCKED' } : s));
      }
    } else if (action === 'unblock') {
      const res = await fetch(`${API_BASE}/api/superadmin/salons/${salon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ status: 'ACTIVE' })
      });
      if (res.ok) setLocalSalons(prev => prev.map(s => s.id === salon.id ? { ...s, status: 'ACTIVE' } : s));
      else alert("Não foi possível desbloquear o salão.");
    } else if (action === 'delete') {
      if (window.confirm(`Tem certeza que deseja excluir permanentemente o salão ${salon.name}?`)) {
        await fetch(`${API_BASE}/api/superadmin/salons/${salon.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setLocalSalons(prev => prev.filter(s => s.id !== salon.id));
      }
    } else if (action === 'edit') {
      setEditSalonForm({
        id: salon.id,
        name: salon.name,
        owner: salon.owner || '',
        plan: salon.plan || 'Studio',
        status: String(salon.status || 'TRIAL').toUpperCase(),
        whatsappEnabled: Boolean(salon.whatsappEnabled),
        whatsappMonthlyLimit: String(salon.whatsappMonthlyLimit ?? 0),
        whatsappUsed: Number(salon.whatsappUsed ?? 0),
        whatsappPlanLimit: Number(salon.whatsappPlanLimit ?? 0),
      });
      setDrawerInfo({ salonName: salon.name, type: 'edit' });
    } else if (action === 'history') {
      setDrawerInfo({ salonName: salon.name, type: 'history' });
    }
  };

  const handleSaveSalonEdit = async () => {
    if (!editSalonForm.id) {
      setDrawerInfo(null);
      return;
    }
    setSavingSalon(true);
    try {
      const customLimit = Math.max(0, parseInt(editSalonForm.whatsappMonthlyLimit, 10) || 0);
      const res = await fetch(`${API_BASE}/api/superadmin/salons/${editSalonForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: editSalonForm.name,
          owner: editSalonForm.owner,
          plan: editSalonForm.plan,
          status: editSalonForm.status,
          whatsappEnabled: editSalonForm.whatsappEnabled,
          whatsappMonthlyLimit: customLimit,
        })
      });
      if (!res.ok) throw new Error("Erro ao salvar alterações");

      setLocalSalons(prev => prev.map(s => s.id === editSalonForm.id ? {
        ...s,
        name: editSalonForm.name,
        owner: editSalonForm.owner,
        plan: editSalonForm.plan,
        status: editSalonForm.status,
        whatsappEnabled: editSalonForm.whatsappEnabled,
        whatsappMonthlyLimit: customLimit,
        whatsappLimit: customLimit > 0 ? customLimit : s.whatsappPlanLimit,
      } : s));
      setDrawerInfo(null);
    } catch (e: any) {
      alert(e.message || "Erro ao salvar dados do salão");
    } finally {
      setSavingSalon(false);
    }
  };

  const term = search.trim().toLowerCase();
  const dataToUse = localSalons.filter((s: any) => {
    if (term && !`${s.name} ${s.owner} ${s.plan}`.toLowerCase().includes(term)) return false;
    if (filter === "Todos") return true;
    const status = normalizeStatus(s.status);
    if (filter === "Ativos") return status === "active";
    if (filter === "Trial") return status === "trial";
    if (filter === "Inadimplentes") return status === "late";
    if (filter === "Bloqueados") return status === "blocked";
    if (filter === "WhatsApp ativo") return Boolean(s.whatsappEnabled);
    return true;
  });

  const exportCsv = () => {
    const header = "Salao,Responsavel,Plano,Status,WhatsApp,Disparos no mes,Franquia\n";
    const rows = dataToUse.map((s: any) =>
      [s.name, s.owner, s.plan, s.status, s.whatsappEnabled ? "Ativo" : "Desativado", s.whatsappUsed ?? 0, s.whatsappLimit ?? 0]
        .map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "saloes-belezapura.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (salonsData && (salonsData as any).error) {
    return <div className="p-6 text-red-500 font-medium">Erro ao carregar salões: {(salonsData as any).error}. Verifique o banco de dados.</div>;
  }

  return (
    <div className="p-3 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl font-medium">Salões</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 h-9 text-sm text-muted-foreground">
            <Search className="w-4 h-4" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar salão, dono ou plano..." className="bg-transparent outline-none placeholder:text-muted-foreground" />
          </div>
          <Button variant="outline" size="sm" onClick={exportCsv}><Download className="w-4 h-4 mr-2" /> Exportar CSV</Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {["Todos", "Ativos", "Trial", "Inadimplentes", "Bloqueados", "WhatsApp ativo"].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-x-auto">
        <table className="w-full min-w-[680px]">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {["Salão", "Responsável", "Plano", "Status", "WhatsApp (mês)", "Desde", "Agendamentos", "Último acesso", ""].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataToUse.map(s => (
              <tr key={s.id || s.name} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={s.name} size="sm" />
                    <span className="font-medium text-sm">{s.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{s.owner}</td>
                <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{s.plan}</Badge></td>
                <td className="px-4 py-3">
                  <Badge variant={statusBadge(s.status).variant}>{statusBadge(s.status).label}</Badge>
                </td>
                <td className="px-4 py-3 text-xs whitespace-nowrap">
                  {s.whatsappEnabled ? (
                    <span className="text-emerald-700 font-medium">● {Number(s.whatsappUsed ?? 0)} / {Number(s.whatsappLimit ?? 0)}</span>
                  ) : (
                    <span className="text-muted-foreground">Desativado</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{s.since}</td>
                <td className="px-4 py-3 text-sm font-medium">{s.appointments?.toLocaleString("pt-BR")}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{s.lastAccess}</td>
                <td className="px-4 py-3 relative">
                  <button onClick={() => setOpenMenu(openMenu === s.name ? null : s.name)} className="p-1.5 rounded-lg hover:bg-muted"><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></button>
                  {openMenu === s.name && (
                    <div className="absolute right-8 top-10 w-44 bg-card border border-border rounded-xl shadow-lg py-1 z-50 text-left">
                      <button onClick={() => handleAction(s, 'history')} className="w-full text-left px-4 py-2 text-xs hover:bg-muted text-foreground">Ver histórico</button>
                      <button onClick={() => handleAction(s, 'edit')} className="w-full text-left px-4 py-2 text-xs hover:bg-muted text-foreground">Editar dados / Plano / WhatsApp</button>
                      {['blocked', 'late', 'canceled', 'cancelled'].includes(normalizeStatus(s.status)) ? (
                        <button onClick={() => handleAction(s, 'unblock')} className="w-full text-left px-4 py-2 text-xs hover:bg-muted text-emerald-600">Desbloquear / Ativar</button>
                      ) : (
                        <button onClick={() => handleAction(s, 'block')} className="w-full text-left px-4 py-2 text-xs hover:bg-muted text-amber-600">Bloquear</button>
                      )}
                      <div className="border-t border-border my-1" />
                      <button onClick={() => handleAction(s, 'delete')} className="w-full text-left px-4 py-2 text-xs hover:bg-muted text-red-600">Excluir salão</button>
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
          <div className="w-full sm:w-[450px] bg-background h-full shadow-2xl flex flex-col animate-in slide-in-from-right" onClick={e => e.stopPropagation()}>
            <div className="h-14 border-b border-border flex items-center justify-between px-6 shrink-0">
              <h3 className="font-medium font-serif">{drawerInfo.type === 'history' ? 'Histórico do Salão' : 'Editar Dados'}</h3>
              <button onClick={() => setDrawerInfo(null)} className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="flex items-center gap-4 mb-6">
                <Avatar name={drawerInfo.salonName} size="md" />
                <div>
                  <div className="font-semibold text-lg">{drawerInfo.salonName}</div>
                  <Badge variant="outline" className="mt-1">Salão Cadastrado</Badge>
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
                    <input
                      value={editSalonForm.name}
                      onChange={e => setEditSalonForm({ ...editSalonForm, name: e.target.value })}
                      className="w-full h-10 rounded-lg border border-border px-3 text-sm bg-background outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Responsável</label>
                    <input
                      value={editSalonForm.owner}
                      onChange={e => setEditSalonForm({ ...editSalonForm, owner: e.target.value })}
                      className="w-full h-10 rounded-lg border border-border px-3 text-sm bg-background outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Plano</label>
                      <select
                        value={editSalonForm.plan}
                        onChange={e => setEditSalonForm({ ...editSalonForm, plan: e.target.value })}
                        className="w-full h-10 rounded-lg border border-border px-3 text-sm bg-background outline-none focus:border-primary"
                      >
                        {Array.from(new Set(["Essencial", "Studio", "Elite", editSalonForm.plan].filter(Boolean))).map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Status da assinatura</label>
                      <select
                        value={editSalonForm.status}
                        onChange={e => setEditSalonForm({ ...editSalonForm, status: e.target.value })}
                        className="w-full h-10 rounded-lg border border-border px-3 text-sm bg-background outline-none focus:border-primary"
                      >
                        <option value="ACTIVE">Ativo (libera 30 dias)</option>
                        <option value="TRIAL">Trial</option>
                        <option value="LATE">Inadimplente</option>
                        <option value="BLOCKED">Bloqueado</option>
                        <option value="CANCELED">Cancelado</option>
                      </select>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground -mt-2">
                    Poder supremo: a troca de plano/status é aplicada na hora, sem passar pela conferência de Pix. Para registrar recebimento no caixa, use a aba Assinaturas.
                  </p>

                  <div className="border border-border rounded-xl p-4 space-y-3 bg-muted/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold">WhatsApp automático (sob demanda)</div>
                        <div className="text-[11px] text-muted-foreground">Só dispara mensagens quando ativado aqui.</div>
                      </div>
                      <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editSalonForm.whatsappEnabled}
                          onChange={e => setEditSalonForm({ ...editSalonForm, whatsappEnabled: e.target.checked })}
                          className="w-4 h-4"
                        />
                        {editSalonForm.whatsappEnabled ? "Ativo" : "Desativado"}
                      </label>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">
                        Franquia mensal personalizada (0 = padrão do plano: {editSalonForm.whatsappPlanLimit} disparos)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={editSalonForm.whatsappMonthlyLimit}
                        onChange={e => setEditSalonForm({ ...editSalonForm, whatsappMonthlyLimit: e.target.value })}
                        className="w-full h-10 rounded-lg border border-border px-3 text-sm bg-background outline-none focus:border-primary"
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Usado neste mês: <strong className="text-foreground">{editSalonForm.whatsappUsed}</strong> disparos
                    </div>
                  </div>
                  <Button className="w-full mt-4" onClick={handleSaveSalonEdit} disabled={savingSalon}>
                    {savingSalon ? "Salvando..." : "Salvar Alterações"}
                  </Button>
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
  const [subs, setSubs] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [reference, setReference] = useState("");
  const [amount, setAmount] = useState("");

  const load = () =>
    Promise.all([
      api<any[]>("/superadmin/subscriptions").then(setSubs),
      api<any[]>("/superadmin/plans").then(setPlans).catch(() => {}),
    ]);

  useEffect(() => {
    load().catch(err => setError(err.message));
  }, []);

  const update = async (sub: any, status: string) => {
    if (busy) return;
    setBusy(true);
    setError("");
    setSuccessMsg("");
    try {
      await api(`/superadmin/subscriptions/${sub.id}/status`, {
        method: "PUT",
        body: JSON.stringify({
          status,
          planId: selectedPlanId || sub.pendingPlanId || sub.planId || "",
          paymentReference: reference,
          amount: Number(String(amount).replace(",", ".")),
        }),
      });
      await load();
      setSelected(null);
      setReference("");
      setSuccessMsg(`Assinatura do salão "${sub.salon}" atualizada para ${status}.`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <h1 className="font-serif text-2xl font-medium">Assinaturas e conferência de recebimentos</h1>
      <p className="text-sm text-muted-foreground">
        Confira o crédito no banco antes de aprovar. A aprovação ativa o plano escolhido por 30 dias; a renovação de uma assinatura vigente soma 30 dias ao vencimento atual.
      </p>
      {error && <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}
      {successMsg && <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3">{successMsg}</p>}
      <div className="bg-card border border-border rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {["Salão", "Plano atual", "Valor", "Estado", "Vencimento", "Solicitação pendente", "Ações"].map(h => (
                <th key={h} className="p-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subs.map(sub => (
              <tr key={sub.id} data-subscription-id={sub.id} className="border-t border-border hover:bg-muted/20">
                <td className="p-3 font-medium">{sub.salon}</td>
                <td className="p-3"><Badge variant="outline">{sub.plan}</Badge></td>
                <td className="p-3 text-muted-foreground">{sub.value}</td>
                <td className="p-3"><Badge variant={statusBadge(sub.status).variant}>{statusBadge(sub.status).label}</Badge></td>
                <td className="p-3">{sub.next}</td>
                <td className="p-3">
                  {sub.pendingPlanId ? (
                    <Badge variant="warning">{sub.pendingPlanName || "Plano solicitado"} — R$ {Number(sub.requestedPrice).toFixed(2)}</Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">Sem solicitação</span>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() => {
                        setSelected(sub);
                        const initialPlanId = sub.pendingPlanId || sub.planId || (plans[0]?.id ?? "");
                        setSelectedPlanId(initialPlanId);
                        const matchedPlan = plans.find(p => p.id === initialPlanId);
                        const initialPrice = sub.requestedPrice || matchedPlan?.price || sub.priceNumeric || 119.9;
                        setAmount(Number(initialPrice).toFixed(2));
                        setReference("");
                        setError("");
                      }}
                    >
                      {sub.pendingPlanId ? "Conferir pagamento" : "Ativar / Renovar"}
                    </Button>
                    <Button size="sm" variant="outline" disabled={busy} onClick={() => { if (confirm(`Bloquear ${sub.salon}?`)) update(sub, "BLOCKED"); }}>
                      Bloquear
                    </Button>
                    <Button size="sm" variant="outline" disabled={busy} onClick={() => { if (confirm(`Cancelar ${sub.salon}?`)) update(sub, "CANCELED"); }}>
                      Cancelar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {subs.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">Nenhuma assinatura encontrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {selected && (
        <form
          onSubmit={event => {
            event.preventDefault();
            update(selected, "ACTIVE");
          }}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <div className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h2 className="font-semibold text-lg">Conferir recebimento — {selected.salon}</h2>
            <p className="text-xs text-muted-foreground">
              Selecione o plano e registre a referência do comprovante/Pix para liberar 30 dias de acesso.
            </p>
            <label className="block text-sm font-medium">
              Plano a ativar
              <select
                value={selectedPlanId}
                onChange={e => {
                  const pid = e.target.value;
                  setSelectedPlanId(pid);
                  const found = plans.find(p => p.id === pid);
                  if (found) setAmount(Number(found.price).toFixed(2));
                }}
                className="block border border-border rounded-lg p-2.5 w-full bg-background mt-1 text-sm"
              >
                {plans.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.category || "Mensal"}) — R$ {Number(p.price).toFixed(2)}/mês
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              Referência bancária / ID da transação Pix
              <input
                required
                minLength={6}
                maxLength={160}
                placeholder="Ex: E18236120202611071830..."
                value={reference}
                onChange={e => setReference(e.target.value)}
                className="block border border-border rounded-lg p-2.5 w-full bg-background mt-1 text-sm"
              />
            </label>
            <label className="block text-sm font-medium">
              Valor recebido (R$)
              <input
                required
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="block border border-border rounded-lg p-2.5 w-full bg-background mt-1 text-sm"
              />
            </label>
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={busy}>Confirmar recebimento e ativar</Button>
              <Button type="button" variant="outline" disabled={busy} onClick={() => setSelected(null)}>Voltar</Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

const CATALOG_BENEFITS_BY_TIER: Record<string, { label: string; badge: string; defaultMaxPros: string; color: string; benefits: string[] }> = {
  "Inicial / Autônoma": {
    label: "Categoria 1 — Inicial / Autônoma (Entrada)",
    badge: "Inicial / Autônoma",
    defaultMaxPros: "1",
    color: "#B8614A",
    benefits: [
      "Até 1 profissional (autônoma)",
      "Página exclusiva na Bio e agendamento online 24h",
      "Gestão de agenda, clientes e catálogo de serviços",
      "Sinal antecipado via Pix com conferência no painel",
      "Aviso de WhatsApp com 1 clique na agenda (envio manual sem custo extra)",
      "Mural de avaliações de clientes na página pública",
    ],
  },
  "Intermediário / Equipe": {
    label: "Categoria 2 — Intermediário / Equipe (Crescimento)",
    badge: "Intermediário / Equipe",
    defaultMaxPros: "5",
    color: "#E11D48",
    benefits: [
      "Tudo do plano Essencial incluso",

      "Avisos automáticos no WhatsApp sob demanda (franquia de até 150 disparos/mês)",
      "Até 5 profissionais na equipe",
      "Gestão de comissões e rateio automático por profissional",
      "Painel financeiro completo (fluxo de caixa e receitas)",
      "Agenda multi-profissional com bloqueio de horários",
      "Relatórios gerenciais de desempenho",
      "Controle de estoque de produtos do salão",
    ],
  },
  "Completo / VIP": {
    label: "Categoria 3 — Completo / VIP (Máximo de Benefícios)",
    badge: "Completo / VIP",
    defaultMaxPros: "0",
    color: "#8B5CF6",
    benefits: [
      "Tudo do plano Studio incluso",
      "Profissionais ilimitados",
      "Automação WhatsApp & Bot IA 24h (franquia de até 1.000 disparos/mês)",
      "Controle de estoque completo com alerta de reposição",
      "Relatórios avançados de faturamento, retenção e ticket médio",
      "Múltiplos acessos por perfil (Recepção e Profissionais)",
      "Suporte prioritário VIP",
    ],
  },
};

const ALL_SYSTEM_BENEFITS = [
  { group: "Essencial (Base do Sistema)", items: [
    "Página exclusiva na Bio e agendamento online 24h",
    "Gestão de agenda, clientes e catálogo de serviços",
    "Sinal antecipado via Pix com conferência no painel",
    "Aviso de WhatsApp com 1 clique na agenda (envio manual sem custo extra)",
    "Mural de avaliações de clientes na página pública",
  ]},
  { group: "Intermediário (Gestão de Equipe & Financeiro)", items: [
    "Tudo do plano Essencial incluso",

    "Avisos automáticos no WhatsApp sob demanda (franquia de até 150 disparos/mês)",
    "Gestão de comissões e rateio automático por profissional",
    "Painel financeiro completo (fluxo de caixa e receitas)",
    "Agenda multi-profissional com bloqueio de horários",
    "Relatórios gerenciais de desempenho",
    "Controle de estoque de produtos do salão",
  ]},
  { group: "Elite / VIP (Automação IA & Escala)", items: [
    "Tudo do plano Studio incluso",
    "Automação WhatsApp & Bot IA 24h (franquia de até 1.000 disparos/mês)",
    "Controle de estoque completo com alerta de reposição",
    "Relatórios avançados de faturamento, retenção e ticket médio",
    "Múltiplos acessos por perfil (Recepção e Profissionais)",
    "Suporte prioritário VIP",
  ]},
];

function PlanosView() {
  const [plansList, setPlansList] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [customFeature, setCustomFeature] = useState("");
  const [form, setForm] = useState<{
    name: string;
    category: string;
    price: string;
    maxProfessionals: string;
    highlight: boolean;
    color: string;
    features: string[];
  }>({
    name: "",
    category: "Inicial / Autônoma",
    price: "",
    maxProfessionals: "1",
    highlight: false,
    color: "#B8614A",
    features: [...CATALOG_BENEFITS_BY_TIER["Inicial / Autônoma"].benefits],
  });

  const load = () => api<any[]>("/superadmin/plans").then(setPlansList);
  useEffect(() => {
    load().catch(err => setError(err.message));
  }, []);

  const detectCategory = (plan: any): string => {
    if (plan.category && CATALOG_BENEFITS_BY_TIER[plan.category]) return plan.category;
    const n = String(plan.name || "").toLowerCase();
    if (n.includes("elite") || n.includes("vip") || Number(plan.maxProfessionals) === 0 || Number(plan.price) >= 200) {
      return "Completo / VIP";
    }
    if (n.includes("studio") || n.includes("equipe") || Number(plan.maxProfessionals) > 1 || Number(plan.price) >= 100) {
      return "Intermediário / Equipe";
    }
    return "Inicial / Autônoma";
  };

  const handleSelectEdit = (plan: any) => {
    const cat = detectCategory(plan);
    setEditing(plan.id);
    setError("");
    setSuccessMsg("");
    setForm({
      name: plan.name || "",
      category: cat,
      price: String(plan.price ?? ""),
      maxProfessionals: String(plan.maxProfessionals ?? 1),
      highlight: Boolean(plan.highlight),
      color: plan.color || CATALOG_BENEFITS_BY_TIER[cat]?.color || "#B8614A",
      features: Array.isArray(plan.features) && plan.features.length > 0
        ? [...plan.features]
        : [...(CATALOG_BENEFITS_BY_TIER[cat]?.benefits || [])],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditing(null);
    setCustomFeature("");
    setForm({
      name: "",
      category: "Inicial / Autônoma",
      price: "",
      maxProfessionals: "1",
      highlight: false,
      color: "#B8614A",
      features: [...CATALOG_BENEFITS_BY_TIER["Inicial / Autônoma"].benefits],
    });
  };

  const applyTierPreset = (tierKey: string) => {
    const preset = CATALOG_BENEFITS_BY_TIER[tierKey];
    if (!preset) return;
    setForm(prev => ({
      ...prev,
      category: tierKey,
      maxProfessionals: prev.name ? prev.maxProfessionals : preset.defaultMaxPros,
      color: preset.color,
      highlight: tierKey === "Intermediário / Equipe",
      features: [...preset.benefits],
    }));
  };

  const toggleFeature = (item: string) => {
    setForm(prev => {
      const exists = prev.features.includes(item);
      return {
        ...prev,
        features: exists ? prev.features.filter(f => f !== item) : [...prev.features, item],
      };
    });
  };

  const addCustomFeature = () => {
    const trimmed = customFeature.trim();
    if (!trimmed) return;
    if (!form.features.includes(trimmed)) {
      setForm(prev => ({ ...prev, features: [...prev.features, trimmed] }));
    }
    setCustomFeature("");
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    const numericPrice = Number(String(form.price).replace(",", "."));
    const numericPros = Number(form.maxProfessionals);
    if (!form.name.trim() || isNaN(numericPrice) || numericPrice <= 0 || isNaN(numericPros) || numericPros < 0) {
      setError("Informe um nome válido, preço maior que zero e limite de profissionais (0 para ilimitado).");
      return;
    }
    setBusy(true);
    setError("");
    setSuccessMsg("");

    const proHeadline = numericPros > 0
      ? (numericPros === 1 ? "Até 1 profissional (autônoma)" : `Até ${numericPros} profissionais na equipe`)
      : "Profissionais ilimitados";

    const filteredFeatures = form.features.filter(
      f => !f.toLowerCase().startsWith("até ") && !f.toLowerCase().includes("profissionais ilimitados")
    );
    const finalFeatures = [proHeadline, ...filteredFeatures];

    try {
      await api(`/superadmin/plans${editing ? `/${editing}` : ""}`, {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          price: numericPrice,
          period: "/mês",
          highlight: form.highlight,
          color: form.color || "#B8614A",
          maxProfessionals: numericPros,
          features: finalFeatures,
        }),
      });
      await load();
      setSuccessMsg(editing ? `Plano "${form.name.trim()}" atualizado com sucesso!` : `Plano "${form.name.trim()}" criado com sucesso!`);
      resetForm();
    } catch (err) {
      setError((err as Error).message || "Erro ao salvar plano.");
    } finally {
      setBusy(false);
    }
  };

  const handleDeletePlan = async (plan: any) => {
    if (!window.confirm(`Tem certeza que deseja excluir o plano "${plan.name}"?`)) return;
    setBusy(true);
    setError("");
    setSuccessMsg("");
    try {
      await api(`/superadmin/plans/${plan.id}`, { method: "DELETE" });
      await load();
      if (editing === plan.id) resetForm();
      setSuccessMsg(`Plano "${plan.name}" removido.`);
    } catch (err) {
      setError((err as Error).message || "Não foi possível excluir o plano.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-medium">Planos por Categoria e Benefícios</h1>
          <p className="text-sm text-muted-foreground">
            Divisão progressiva por categoria e valor: quanto maior o plano, mais módulos e benefícios do sistema são liberados.
          </p>
        </div>
      </div>

      {error && (
        <div role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-xs underline ml-3">Fechar</button>
        </div>
      )}
      {successMsg && (
        <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
          <span className="font-medium">✓ {successMsg}</span>
          <button onClick={() => setSuccessMsg("")} className="text-xs underline ml-3">Fechar</button>
        </div>
      )}

      {/* Cards dos Planos Atuais */}
      <div className="grid md:grid-cols-3 gap-5">
        {plansList.map(plan => {
          const cat = detectCategory(plan);
          const isEditingThis = editing === plan.id;
          return (
            <article
              key={plan.id}
              className={`border rounded-2xl bg-card p-5 flex flex-col justify-between transition-all relative ${
                isEditingThis
                  ? "ring-2 ring-primary border-primary shadow-lg"
                  : plan.highlight
                  ? "border-2 border-primary/60 shadow-md"
                  : "border-border"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant={cat === "Completo / VIP" ? "purple" : cat === "Intermediário / Equipe" ? "info" : "outline"}>
                    {cat}
                  </Badge>
                  {plan.highlight && (
                    <Badge variant="success" className="text-[11px]">★ Mais Escolhido</Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: plan.color || "#B8614A" }} />
                  <h2 className="font-serif text-xl font-semibold">{plan.name}</h2>
                </div>

                <div className="mt-3 pb-4 border-b border-border">
                  <span className="font-serif text-3xl font-bold">
                    R$ {Number(plan.price).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs text-muted-foreground">{plan.period || "/mês"}</span>
                  <div className="text-xs text-muted-foreground mt-1">
                    Limite de equipe:{" "}
                    <strong className="text-foreground">
                      {Number(plan.maxProfessionals) > 0 ? `Até ${plan.maxProfessionals} profissional(is)` : "Profissionais ilimitados"}
                    </strong>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
                    Benefícios e opcionais inclusos ({(plan.features || []).length})
                  </div>
                  <ul className="text-sm space-y-2 mb-5">
                    {(plan.features || []).map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-xs sm:text-sm text-foreground/90">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-border">
                <Button
                  variant={isEditingThis ? "primary" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => handleSelectEdit(plan)}
                >
                  {isEditingThis ? "Editando abaixo..." : "Editar plano"}
                </Button>
                {plansList.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeletePlan(plan)}
                    disabled={busy}
                    className="text-red-600 hover:bg-red-50"
                  >
                    Excluir
                  </Button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Formulário Completo de Criação / Edição de Plano */}
      <form onSubmit={save} className="p-5 sm:p-6 rounded-2xl border border-border bg-card space-y-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
          <div>
            <h2 className="font-serif text-lg font-semibold">
              {editing ? `Editando Plano: ${form.name}` : "Cadastrar Novo Plano"}
            </h2>
            <p className="text-xs text-muted-foreground">
              Configure categoria, preço mensal, limite de profissionais e marque os benefícios liberados neste nível.
            </p>
          </div>
          {editing && (
            <Button type="button" variant="outline" size="sm" onClick={resetForm}>
              Cancelar edição
            </Button>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <label className="text-xs font-medium text-muted-foreground">
            Nome do Plano
            <input
              required
              placeholder="Ex: Essencial, Studio, Elite"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="block w-full border border-border rounded-lg p-2.5 mt-1 bg-background text-sm text-foreground outline-none focus:border-primary"
            />
          </label>

          <label className="text-xs font-medium text-muted-foreground">
            Categoria / Nível do Sistema
            <select
              value={form.category}
              onChange={e => applyTierPreset(e.target.value)}
              className="block w-full border border-border rounded-lg p-2.5 mt-1 bg-background text-sm text-foreground outline-none focus:border-primary"
            >
              {Object.keys(CATALOG_BENEFITS_BY_TIER).map(catKey => (
                <option key={catKey} value={catKey}>{catKey}</option>
              ))}
            </select>
          </label>

          <label className="text-xs font-medium text-muted-foreground">
            Preço mensal (R$)
            <input
              required
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Ex: 119.90"
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
              className="block w-full border border-border rounded-lg p-2.5 mt-1 bg-background text-sm text-foreground outline-none focus:border-primary"
            />
          </label>

          <label className="text-xs font-medium text-muted-foreground">
            Profissionais ativos (0 = ilimitado)
            <input
              required
              type="number"
              min="0"
              step="1"
              value={form.maxProfessionals}
              onChange={e => setForm({ ...form, maxProfessionals: e.target.value })}
              className="block w-full border border-border rounded-lg p-2.5 mt-1 bg-background text-sm text-foreground outline-none focus:border-primary"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-6 pt-1">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.highlight}
              onChange={e => setForm({ ...form, highlight: e.target.checked })}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <span>Destacar este plano como <strong>"Mais Escolhido"</strong> na página pública</span>
          </label>

          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Cor do plano:</span>
            <input
              type="color"
              value={form.color}
              onChange={e => setForm({ ...form, color: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent"
            />
          </label>

          <button
            type="button"
            onClick={() => applyTierPreset(form.category)}
            className="text-xs text-primary underline font-medium hover:opacity-80 cursor-pointer"
          >
            Restaurar opcionais recomendados para "{form.category}"
          </button>
        </div>

        {/* Checklist de Benefícios por Categoria */}
        <div className="space-y-4 pt-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Selecione os benefícios e módulos inclusos neste plano
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {ALL_SYSTEM_BENEFITS.map(section => (
              <div key={section.group} className="border border-border rounded-xl p-3.5 bg-muted/20 space-y-2.5">
                <div className="text-xs font-semibold text-foreground border-b border-border pb-1.5">
                  {section.group}
                </div>
                {section.items.map(item => {
                  const checked = form.features.includes(item);
                  return (
                    <label key={item} className="flex items-start gap-2 text-xs cursor-pointer hover:text-primary transition-colors">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleFeature(item)}
                        className="mt-0.5 rounded border-border text-primary focus:ring-primary"
                      />
                      <span>{item}</span>
                    </label>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Adicionar benefício personalizado */}
          <div className="flex flex-wrap gap-2 items-center pt-2">
            <input
              value={customFeature}
              onChange={e => setCustomFeature(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomFeature();
                }
              }}
              placeholder="Adicionar benefício extra personalizado..."
              className="border border-border rounded-lg px-3 py-2 text-xs bg-background flex-1 min-w-[220px] outline-none focus:border-primary"
            />
            <Button type="button" variant="outline" size="sm" onClick={addCustomFeature}>
              + Adicionar benefício
            </Button>
          </div>

          {/* Tags dos benefícios selecionados */}
          <div className="flex flex-wrap gap-2 pt-1">
            {form.features.map(f => (
              <span
                key={f}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20"
              >
                {f}
                <button
                  type="button"
                  onClick={() => toggleFeature(f)}
                  className="hover:text-red-600 font-bold"
                  title="Remover benefício"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-3 border-t border-border">
          <Button type="submit" disabled={busy}>
            {busy ? "Salvando..." : editing ? "Salvar alterações do plano" : "Cadastrar novo plano"}
          </Button>
          {editing && (
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancelar edição
            </Button>
          )}
        </div>
      </form>
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
    <div className="p-3 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl font-medium">Suporte</h1>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Badge variant="danger">{localTickets.filter(t => t.priority === 'alta' && t.status === 'open').length} urgentes</Badge>
          <Badge variant="warning">{localTickets.filter(t => t.status === 'open').length} abertos</Badge>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-x-auto">
        <table className="w-full min-w-[680px]">
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
  const [editUnidade, setEditUnidade] = useState<any | null>(null);

  const handleAction = (name: string, action: string) => {
    setOpenMenu(null);
    if (action === 'toggle') {
      setLocalUnidades(prev => prev.map(u => u.name === name ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
    } else if (action === 'edit') {
      const target = localUnidades.find(u => u.name === name);
      if (target) setEditUnidade({ ...target });
    } else if (action === 'delete') {
      if(window.confirm(`Tem certeza que deseja excluir ${name}?`)) {
        setLocalUnidades(prev => prev.filter(u => u.name !== name));
      }
    }
  };

  const handleSaveUnidade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUnidade) return;
    setLocalUnidades(prev => prev.map(u => u.name === editUnidade.name ? { ...u, ...editUnidade } : u));
    setEditUnidade(null);
  };

  return (
    <div className="p-3 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl font-medium">Unidades</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary px-3 py-1.5 rounded-lg">
          <Building2 className="w-4 h-4" /> {localUnidades.length} unidades cadastradas
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-x-auto">
        <table className="w-full min-w-[680px]">
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
                    <div className="absolute right-8 top-10 w-40 bg-card border border-border rounded-xl shadow-lg py-1 z-50 text-left">
                      <button onClick={() => handleAction(u.name, 'edit')} className="w-full text-left px-4 py-2 text-xs hover:bg-muted text-foreground">Editar</button>
                      <button onClick={() => handleAction(u.name, 'toggle')} className="w-full text-left px-4 py-2 text-xs hover:bg-muted text-foreground">{u.status === 'active' ? 'Desativar' : 'Ativar'}</button>
                      <button onClick={() => handleAction(u.name, 'delete')} className="w-full text-left px-4 py-2 text-xs hover:bg-muted text-red-600">Excluir</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editUnidade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in" onClick={() => setEditUnidade(null)}>
          <div className="w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-base">Editar Unidade</h3>
              </div>
              <button onClick={() => setEditUnidade(null)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSaveUnidade} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Nome da Unidade</label>
                <input
                  required
                  value={editUnidade.name}
                  onChange={e => setEditUnidade({ ...editUnidade, name: e.target.value })}
                  className="w-full h-10 rounded-xl border border-border px-3 text-sm bg-background outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Endereço</label>
                <input
                  value={editUnidade.address}
                  onChange={e => setEditUnidade({ ...editUnidade, address: e.target.value })}
                  className="w-full h-10 rounded-xl border border-border px-3 text-sm bg-background outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Quantidade de Profissionais</label>
                <input
                  type="number"
                  value={editUnidade.pros}
                  onChange={e => setEditUnidade({ ...editUnidade, pros: parseInt(e.target.value, 10) || 0 })}
                  className="w-full h-10 rounded-xl border border-border px-3 text-sm bg-background outline-none focus:border-primary"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditUnidade(null)}>Cancelar</Button>
                <Button type="submit" size="sm">Salvar Alterações</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function PagamentosView() {
  const [payments, setPayments] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  useEffect(() => { api<any[]>("/superadmin/payments").then(d => setPayments(Array.isArray(d) ? d : [])).catch(err => setError(err.message)); }, []);

  const fmt = (v: number) => `R$ ${Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const term = search.trim().toLowerCase();
  const filtered = payments.filter(p => !term || `${p.salon} ${p.plan} ${p.reference}`.toLowerCase().includes(term));
  const total = payments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
  const now = new Date();
  const monthTotal = payments
    .filter(p => { const d = new Date(p.createdAt); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); })
    .reduce((acc, p) => acc + Number(p.amount || 0), 0);

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div>
        <h1 className="font-serif text-2xl font-medium">Recebimentos conferidos (Caixa)</h1>
        <p className="text-sm text-muted-foreground">Histórico das confirmações de Pix registradas pelo administrador na aba Assinaturas.</p>
      </div>
      {error && <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Total recebido (histórico)" value={fmt(total)} icon={CreditCard} color="emerald" />
        <StatCard label="Recebido neste mês" value={fmt(monthTotal)} icon={TrendingUp} color="purple" />
        <StatCard label="Pagamentos registrados" value={String(payments.length)} icon={CheckCircle} color="sky" />
      </div>
      <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 h-9 text-sm text-muted-foreground max-w-sm">
        <Search className="w-4 h-4" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar salão, plano ou referência..." className="bg-transparent outline-none w-full" />
      </div>
      <div className="bg-card border border-border rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {["Data", "Salão", "Plano", "Referência Pix", "Valor"].map(h => <th key={h} className="p-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-t border-border hover:bg-muted/20">
                <td className="p-3 whitespace-nowrap">{new Date(p.createdAt).toLocaleString("pt-BR")}</td>
                <td className="p-3 font-medium">{p.salon}</td>
                <td className="p-3"><Badge variant="outline">{p.plan}</Badge></td>
                <td className="p-3 font-mono text-xs text-muted-foreground">{p.reference}</td>
                <td className="p-3 font-semibold text-emerald-700">{fmt(p.amount)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Nenhum pagamento registrado ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const adminUsers: any[] = [];

function UsuariosView() {
  const [localUsers, setLocalUsers] = useState<any[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [drawerUser, setDrawerUser] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const roleLabel = (role: string) => ({
    superadmin: "Super Admin",
    admin: "Admin",
    financeiro: "Financeiro",
    suporte_n2: "Suporte N2",
    suporte_n1: "Suporte N1",
    visualizador: "Visualizador",
  }[role] || role);

  const fetchUsers = () => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/superadmin/users`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setLocalUsers(Array.isArray(data) ? data : adminUsers))
      .catch(() => setLocalUsers(adminUsers));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAction = async (id: string, action: string) => {
    setOpenMenu(null);
    if (action === 'toggle') {
      const user = localUsers.find(u => u.id === id);
      if (!user) return;
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/superadmin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ status: user.status === 'active' ? 'inactive' : 'active' })
      });
      fetchUsers();
    } else if (action === 'delete') {
      if(window.confirm(`Excluir usuário permanentemente?`)) {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/superadmin/users/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        fetchUsers();
      }
    } else if (action === 'edit') {
      const user = localUsers.find(u => u.id === id);
      if(user) setDrawerUser({ ...user, password: "" });
    }
  };

  const handleNewUser = () => {
    setErrorMsg("");
    setDrawerUser({ id: "", name: "", email: "", password: "", role: "admin", status: "active", permissions: [] });
  };

  const handleSaveUser = async () => {
    if(!drawerUser.name || !drawerUser.email) return setErrorMsg("Preencha nome e e-mail.");
    if(!drawerUser.id && !drawerUser.password) return setErrorMsg("Informe uma senha temporária para novo usuário.");
    setErrorMsg("");

    const isEdit = !!drawerUser.id;
    const payload = { ...drawerUser };
    if (isEdit && !payload.password) delete payload.password;

    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/superadmin/users${isEdit ? `/${drawerUser.id}` : ''}`, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      setErrorMsg(data.error || "Erro ao salvar usuário.");
      return;
    }

    setDrawerUser(null);
    fetchUsers();
  };

  return (
    <div className="p-3 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl font-medium">Usuários da plataforma</h1>
        <Button size="sm" onClick={handleNewUser}><Plus className="w-4 h-4" /> Novo usuário</Button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-x-auto">
        <table className="w-full min-w-[680px]">
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
                  <Badge variant={u.role === "superadmin" ? "purple" : "outline"} className={u.role !== "superadmin" ? "bg-secondary/50" : ""}>{roleLabel(u.role)}</Badge>
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
          <div className="w-full sm:w-[450px] bg-background h-full shadow-2xl flex flex-col animate-in slide-in-from-right" onClick={e => e.stopPropagation()}>
            <div className="h-14 border-b border-border flex items-center justify-between px-6 shrink-0">
              <h3 className="font-medium font-serif">{!drawerUser.id ? 'Novo Usuário' : 'Editar Usuário e Permissões'}</h3>
              <button onClick={() => setDrawerUser(null)} className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto space-y-5">
              {errorMsg && <div className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg p-2">{errorMsg}</div>}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Nome Completo</label>
                <input value={drawerUser.name} onChange={e => setDrawerUser({...drawerUser, name: e.target.value})} className="w-full h-10 rounded-lg border border-border px-3 text-sm bg-background outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">E-mail Corporativo</label>
                <input value={drawerUser.email} onChange={e => setDrawerUser({...drawerUser, email: e.target.value})} type="email" className="w-full h-10 rounded-lg border border-border px-3 text-sm bg-background outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">{drawerUser.id ? "Nova senha (opcional)" : "Senha temporária"}</label>
                <input value={drawerUser.password || ""} onChange={e => setDrawerUser({...drawerUser, password: e.target.value})} type="password" className="w-full h-10 rounded-lg border border-border px-3 text-sm bg-background outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Cargo / Função (RBAC)</label>
                <select value={drawerUser.role} onChange={e => setDrawerUser({...drawerUser, role: e.target.value})} className="w-full h-10 rounded-lg border border-border px-3 text-sm bg-background outline-none focus:border-primary transition-colors">
                  <option value="superadmin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="financeiro">Financeiro</option>
                  <option value="suporte_n2">Suporte N2</option>
                  <option value="suporte_n1">Suporte N1</option>
                  <option value="visualizador">Visualizador</option>
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
                          <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" checked={drawerUser.role === 'superadmin' || drawerUser.permissions?.includes(`${resource}:read`)} onChange={e => {
                            if(drawerUser.role === 'superadmin') return;
                            const p = new Set(drawerUser.permissions || []);
                            e.target.checked ? p.add(`${resource}:read`) : p.delete(`${resource}:read`);
                            setDrawerUser({...drawerUser, permissions: Array.from(p)});
                          }} disabled={drawerUser.role === 'superadmin'} />
                          Leitura
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" checked={drawerUser.role === 'superadmin' || drawerUser.permissions?.includes(`${resource}:write`)} onChange={e => {
                            if(drawerUser.role === 'superadmin') return;
                            const p = new Set(drawerUser.permissions || []);
                            e.target.checked ? p.add(`${resource}:write`) : p.delete(`${resource}:write`);
                            if(e.target.checked) p.add(`${resource}:read`); // write implies read
                            setDrawerUser({...drawerUser, permissions: Array.from(p)});
                          }} disabled={drawerUser.role === 'superadmin'} />
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
    trialDays: 10,
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
          platformName: data.platformName || "BelezaPura",
          domain: data.domain || "servicesalobeleza.vercel.app",
          supportEmail: data.supportEmail || "contato@belezapura.com"
        });
        setTrialData({
          trialDays: data.trialDays || 14,
          defaultPlanId: data.defaultPlanId || "studio"
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
    <div className="p-3 sm:p-6 space-y-5 relative">
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
    <div className="p-3 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl font-medium">Comunicação e Avisos</h1>
        <Button size="sm" onClick={() => setDrawerOpen(true)}><Megaphone className="w-4 h-4 mr-2" /> Novo Aviso Global</Button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden mt-4">
        <table className="w-full min-w-[680px]">
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
          <div className="w-full sm:w-[450px] bg-background h-full shadow-2xl flex flex-col animate-in slide-in-from-right" onClick={e => e.stopPropagation()}>
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

const auditLevelConfig: Record<string, { label: string; variant: "success" | "warning" | "danger" | "info" | "outline" }> = {
  info: { label: "Info", variant: "info" },
  warning: { label: "Aviso", variant: "warning" },
  success: { label: "Sucesso", variant: "success" },
  danger: { label: "Alerta", variant: "danger" },
};

type AuditLog = {
  id: string;
  action: string;
  user: string;
  resource: string;
  detail: string;
  time: string;
  level: string;
};

function AuditoriaView() {
  const [filter, setFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const token = localStorage.getItem('token');
    const api = import.meta.env.VITE_API_URL || 'http://localhost:3050';
    setLoading(true);
    fetch(`${api}/api/superadmin/audit-logs`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => {
        if (!res.ok) throw new Error('Falha ao carregar auditoria');
        return res.json();
      })
      .then(data => {
        setLogs(Array.isArray(data) ? data : []);
        setErrorMsg("");
      })
      .catch(() => {
        setLogs([]);
        setErrorMsg("Não foi possível carregar os logs de auditoria agora.");
      })
      .finally(() => setLoading(false));
  }, []);

  const dataToUse = logs.filter(log => {
    const level = String(log.level || "").toLowerCase();
    const action = String(log.action || "");
    const resource = String(log.resource || "");
    const detail = String(log.detail || "");
    const matchFilter = filter === "Todos" || level === filter.toLowerCase();
    const matchSearch = !search || action.includes(search.toUpperCase()) || resource.toLowerCase().includes(search.toLowerCase()) || detail.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="p-3 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-medium">Logs de Auditoria</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Registro de todas as ações administrativas na plataforma</p>
        </div>
        <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" /> Exportar Logs (CSV)</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total de eventos" value={logs.length.toString()} icon={Shield} color="primary" />
        <StatCard label="Alertas de segurança" value={logs.filter(l => l.level === "danger").length.toString()} icon={AlertCircle} color="rose" />
        <StatCard label="Ações concluídas" value={logs.filter(l => l.level === "success").length.toString()} icon={CheckCircle} color="emerald" />
        <StatCard label="Avisos operacionais" value={logs.filter(l => l.level === "warning").length.toString()} icon={XCircle} color="amber" />
      </div>

      {errorMsg && (
        <div className="bg-amber-500/10 text-amber-700 border border-amber-500/20 rounded-lg px-3 py-2 text-sm">
          {errorMsg}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 h-9 text-sm text-muted-foreground flex-1 max-w-sm">
          <Search className="w-4 h-4 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar evento, recurso..." className="bg-transparent outline-none placeholder:text-muted-foreground w-full" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["Todos", "Info", "Success", "Warning", "Danger"].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
              {f === "Success" ? "Sucesso" : f === "Warning" ? "Aviso" : f === "Danger" ? "Alerta" : f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-x-auto">
        <table className="w-full min-w-[680px]">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {["ID", "Ação", "Usuário", "Recurso", "Detalhe", "Nível", "Tempo"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataToUse.map(log => (
              <tr key={log.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{log.id}</td>
                <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">{log.action}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{log.user}</td>
                <td className="px-4 py-3 text-sm font-medium">{log.resource}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">{log.detail}</td>
                <td className="px-4 py-3">
                  <Badge variant={auditLevelConfig[log.level]?.variant || "outline"}>
                    {auditLevelConfig[log.level]?.label || log.level}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{log.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {dataToUse.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-sm">
            {loading ? "Carregando logs..." : "Nenhum evento encontrado."}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper: decode JWT payload without external lib
function decodeToken(token: string): Record<string, any> | null {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export default function SuperAdmin() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("overview");
  const [overviewData, setOverviewData] = useState<any>(null);
  const [salonsData, setSalonsData] = useState<any[]>([]);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [adminName, setAdminName] = useState("Administrador");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    // ── Auth guard ──────────────────────────────────────
    const token = localStorage.getItem('token');
    const role  = localStorage.getItem('role');

    if (!token || role !== 'superadmin') {
      navigate('/login', { replace: true });
      return;
    }

    // Decode name from JWT
    const decoded = decodeToken(token);
    if (decoded?.name) setAdminName(decoded.name);

    // ── Data fetching ────────────────────────────────────
    const headers = { 'Authorization': `Bearer ${token}` };
    const api = import.meta.env.VITE_API_URL || 'http://localhost:3050';

    fetch(`${api}/api/superadmin/overview`, { headers })
      .then(res => { if (!res.ok) throw new Error('Unauthorized'); return res.json(); })
      .then(data => setOverviewData(data))
      .catch(err => {
        if (err.message === 'Unauthorized') { navigate('/login-admin', { replace: true }); }
        else { setOverviewData({ error: err.message }); }
      });

    fetch(`${api}/api/superadmin/salons`, { headers })
      .then(res => res.json())
      .then(data => setSalonsData(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [navigate]);

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
    <div className="flex h-full bg-background overflow-hidden">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1C1917] flex flex-col md:hidden transition-transform duration-300 ${
        mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      }`}>
        <div className="h-14 flex items-center justify-between px-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <div className="text-white font-serif text-sm font-medium">BelezaPura</div>
              <div className="text-white/40 text-xs">Super Admin</div>
            </div>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 rounded-lg text-white/60 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 py-3 overflow-y-auto">
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all ${
                activeSection === item.id
                  ? "bg-white/15 text-white border-r-2 border-primary"
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
            <Avatar name={adminName} size="sm" className="shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-white text-xs font-medium truncate">{adminName}</div>
              <div className="text-white/40 text-xs">Super Administrador</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 bg-[#1C1917] flex-col">
        <div className="h-14 flex items-center gap-2 px-5 border-b border-white/10">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <div className="text-white font-serif text-sm font-medium">BelezaPura</div>
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
                  ? "bg-white/15 text-white border-r-2 border-primary"
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
            <Avatar name={adminName} size="sm" className="shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-white text-xs font-medium truncate">{adminName}</div>
              <div className="text-white/40 text-xs">Super Administrador</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 bg-card border-b border-border flex items-center justify-between px-3 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-muted text-foreground cursor-pointer"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-sm font-medium text-foreground sm:text-muted-foreground truncate">
              {NAV.find(n => n.id === activeSection)?.label}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors" title={isDark ? "Modo Claro" : "Modo Escuro"}>
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button className="p-2 rounded-lg hover:bg-muted relative">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <Avatar name={adminName} size="sm" />
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                localStorage.removeItem('salonSlug');
                navigate('/login', { replace: true });
              }}
              className="p-2 rounded-lg hover:bg-red-50 text-red-500 flex items-center transition-colors ml-1"
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
