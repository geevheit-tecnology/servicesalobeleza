import { useState, useEffect } from "react";
import { LayoutDashboard, Calendar, ListOrdered, Users, Scissors, UserCheck, Clock, DollarSign, BarChart3, Settings, Star, Globe, Menu, X, Bell, ChevronDown, TrendingUp, TrendingDown, Plus, Search, Filter, Eye, Edit3, Trash2, MoreHorizontal, MessageCircle, Percent, Building2, Zap, ArrowUpRight, ArrowDownRight, Check, ArrowLeft, ChevronRight, LogOut, Package, Download, AlertTriangle, XCircle, Camera, Upload } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Button, Badge, Avatar, Card, Stars } from "@/components/ui";
import { optimizeImage, PRESETS } from "@/utils/imageOptimizer";
import { NAV, revenueData, appointmentsData, servicesPie, PIE_COLORS, appointments, clients, reviewsList, AGENDA_HOURS, AGENDA_PROS, AGENDA_ITEMS, statusColors, statusLabel, StatCard } from "./shared";

export function ProfissionaisView() {
  const [data, setData] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [tab, setTab] = useState<"agenda" | "faturamento" | "comissoes" | "avaliacoes">("agenda");
  const [showForm, setShowForm] = useState(false);
  const [newPro, setNewPro] = useState({ name: "", specialty: "", commission: "", avatar: "" });
  const [planInfo, setPlanInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadProfessionals = () => {
    const token = localStorage.getItem('token');
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/salon/details`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.professionals) {
          const formatted = d.professionals.map((p: any) => ({
             ...p,
             appointments: 0,
             revenue: "R$ 0",
             commission: `${p.commission || 0}%`,
             status: p.status || "active",
          }));
          setData(formatted);
        }
        if (d.subscriptions && d.subscriptions.length > 0) {
          const activeSub = d.subscriptions.find((s: any) => s.status === "ACTIVE" || s.status === "TRIAL") || d.subscriptions[0];
          setPlanInfo(activeSub?.plan || null);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadProfessionals();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await optimizeImage(file, PRESETS.avatar);
      setNewPro(prev => ({ ...prev, avatar: base64 }));
    } catch (err: any) {
      alert(err.message || "Erro ao processar foto.");
    }
  };

  const handleSave = async () => {
    if (loading) return;
    if (!newPro.name.trim()) {
      setErrorMsg("O nome do profissional é obrigatório.");
      return;
    }

    if (planInfo?.maxProfessionals > 0 && data.length >= planInfo.maxProfessionals) {
      setErrorMsg(`Limite do seu plano (${planInfo.name || "Básico"}) atingido: máximo de ${planInfo.maxProfessionals} profissional(is).`);
      return;
    }

    setLoading(true);
    setErrorMsg("");
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/professionals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: newPro.name,
          specialty: newPro.specialty,
          avatar: newPro.avatar || null,
          commission: newPro.commission ? parseFloat(newPro.commission) : 0
        })
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Erro ao salvar profissional");
      
      setData([...data, { ...resData, appointments: 0, revenue: "R$ 0", commission: `${resData.commission}%` }]);
      setShowForm(false);
      setNewPro({ name: "", specialty: "", commission: "", avatar: "" });
      alert("Profissional salvo com sucesso!");
    } catch(e: any) { 
      setErrorMsg(e.message || "Erro de conexão ao salvar");
    } finally {
      setLoading(false);
    }
  };

  const handleProfessionalAction = async (id: string, mode: "delete" | "inactive") => {
    const actionLabel = mode === "inactive" ? "inativar" : "deletar";
    if (!confirm(`Tem certeza que deseja ${actionLabel} este profissional?`)) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/professionals/${id}?mode=${mode}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Erro ao excluir profissional");
      }
      if (mode === "inactive") {
        const resData = await res.json();
        setData(data.map(p => p.id === id ? { ...p, status: resData.status || "inactive" } : p));
        setSelected((current: any) => current?.id === id ? { ...current, status: resData.status || "inactive" } : current);
      } else {
        setData(data.filter(p => p.id !== id));
        setSelected(null);
      }
      alert(mode === "inactive" ? "Profissional inativado!" : "Profissional deletado!");
    } catch(e: any) {
      alert(e.message);
    }
  };

  const isLimitReached = planInfo?.maxProfessionals > 0 && data.length >= planInfo.maxProfessionals;

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-medium">Profissionais</h1>
          {planInfo && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Plano: <span className="font-semibold text-foreground">{planInfo.name}</span> • {data.length} de {planInfo.maxProfessionals > 0 ? planInfo.maxProfessionals : "Ilimitados"} membros
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {isLimitReached ? (
            <Badge variant="warning" className="text-xs py-1 px-3">
              Limite do plano atingido ({data.length}/{planInfo.maxProfessionals})
            </Badge>
          ) : (
            <Button size="sm" onClick={() => setShowForm(v => !v)}>
              <Plus className="w-4 h-4" /> Novo profissional
            </Button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Cadastrar Profissional</h3>
            <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-muted">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          {errorMsg && <div className="text-red-500 text-sm bg-red-50 p-2.5 rounded-lg border border-red-200">{errorMsg}</div>}
          
          {/* Avatar Upload */}
          <div className="flex items-center gap-4">
            <label className="relative w-16 h-16 rounded-full border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 bg-card overflow-hidden group">
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={loading} />
              {newPro.avatar ? (
                <img src={newPro.avatar} alt="Foto" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              )}
            </label>
            <div>
              <span className="text-xs font-medium text-foreground block">Foto do profissional</span>
              <span className="text-[11px] text-muted-foreground">Otimizada automaticamente para leveza</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <input disabled={loading} value={newPro.name} onChange={e => setNewPro({...newPro, name: e.target.value})} placeholder="Nome completo *" className="h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-card" />
            <input disabled={loading} value={newPro.specialty} onChange={e => setNewPro({...newPro, specialty: e.target.value})} placeholder="Especialidade (ex: Cabelos, Unhas)" className="h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-card" />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <input disabled={loading} value={newPro.commission} onChange={e => setNewPro({...newPro, commission: e.target.value})} placeholder="Comissão (%)" className="h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-card" />
            <Button size="sm" className="h-10" onClick={handleSave} disabled={loading}>{loading ? "Salvando..." : "Salvar Profissional"}</Button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          {data.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-2xl p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-base text-foreground">Nenhum profissional cadastrado ainda</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Cadastre os membros da sua equipe para que seus clientes possam escolher com quem desejam ser atendidos.
              </p>
              {!isLimitReached && (
                <Button size="sm" onClick={() => setShowForm(true)} className="mt-2">
                  <Plus className="w-4 h-4" /> Cadastrar primeiro profissional
                </Button>
              )}
            </div>
          ) : (
            data.map((p: any) => (
              <div key={p.id || p.name} onClick={() => setSelected(p)}
                className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${selected?.id === p.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/30"}`}>
                <Avatar src={p.avatar} name={p.name} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-sm text-muted-foreground">{p.specialty || "Geral"}</div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>{p.appointments || 0} atendimentos</span>
                    <span className="text-primary font-medium">{p.revenue || "R$ 0"}</span>
                    <span>Comissão: {p.commission}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={p.status === "inactive" ? "danger" : "success"}>{p.status === "inactive" ? "Inativo" : "Ativo"}</Badge>
                  <div className="text-xs text-amber-500">★ 5.0</div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5">
          {selected ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar src={selected.avatar} name={selected.name} size="lg" />
                  <div>
                    <div className="font-semibold">{selected.name}</div>
                    <div className="text-muted-foreground text-sm">{selected.specialty || "Geral"}</div>
                    <div className="text-amber-500 text-xs mt-0.5">★★★★★ 5.0</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleProfessionalAction(selected.id, "inactive")} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Inativar profissional">
                    <XCircle className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleProfessionalAction(selected.id, "delete")} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Deletar profissional">
                    <Trash2 className="w-4 h-4" />
                  </button>
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
                  <div className="py-6 text-center text-muted-foreground text-xs bg-secondary/50 rounded-lg">
                    Nenhum agendamento para hoje
                  </div>
                </div>
              )}
              {tab === "faturamento" && (
                <div className="space-y-3 text-sm">
                  {[["Este mês", selected.revenue || "R$ 0,00"], ["Mês anterior", "R$ 0,00"], ["Média/atend.", "R$ 0,00"]].map(([k, v]) => (
                    <div key={String(k)} className="flex justify-between">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="font-semibold text-primary">{v}</span>
                    </div>
                  ))}
                </div>
              )}
              {tab === "comissoes" && (
                <div className="space-y-3 text-sm">
                  {[["Percentual", selected.commission || "0%"], ["Base de cálculo", selected.revenue || "R$ 0,00"], ["Comissão a pagar", "R$ 0,00"]].map(([k, v]) => (
                    <div key={String(k)} className="flex justify-between">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="font-semibold">{v}</span>
                    </div>
                  ))}
                </div>
              )}
              {tab === "avaliacoes" && (
                <div className="py-6 text-center text-muted-foreground text-xs bg-secondary/50 rounded-lg">
                  Nenhuma avaliação registrada ainda
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