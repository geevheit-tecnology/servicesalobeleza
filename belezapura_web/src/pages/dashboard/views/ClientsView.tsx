import { useState, useEffect } from "react";
import { LayoutDashboard, Calendar, ListOrdered, Users, Scissors, UserCheck, Clock, DollarSign, BarChart3, Settings, Star, Globe, Menu, X, Bell, ChevronDown, TrendingUp, TrendingDown, Plus, Search, Filter, Eye, Edit3, Trash2, MoreHorizontal, MessageCircle, Percent, Building2, Zap, ArrowUpRight, ArrowDownRight, Check, ArrowLeft, ChevronRight, LogOut, Package, Download, AlertTriangle, XCircle } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Button, Badge, Avatar, Card, Stars } from "@/components/ui";
import { NAV, revenueData, appointmentsData, servicesPie, PIE_COLORS, appointments, clients, professionals, reviewsList, AGENDA_HOURS, AGENDA_PROS, AGENDA_ITEMS, statusColors, statusLabel, StatCard } from "./shared";

export function ClientsView() {
  const [data, setData] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [showCampaign, setShowCampaign] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({ id: "", name: "", phone: "", tags: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadClients = () => {
    const token = localStorage.getItem('token');
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/salon/clients`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(json => {
        if(Array.isArray(json)) {
          const formatted = json.map((c: any) => ({
            id: c.id,
            name: c.name,
            phone: c.phone || "",
            lastVisit: c.lastVisit ? new Date(c.lastVisit).toLocaleDateString('pt-BR') : "Nunca",
            visits: c.visits || 0,
            total: `R$ ${c.totalSpent || "0"}`,
            tags: c.tags || [],
            status: c.status || "active",
            pontos: c.pontos || Math.floor((c.totalSpent || 0) / 10) + 150
          }));
          setData(formatted);
        }
      })
      .catch(console.error);
  };

  useEffect(() => { loadClients(); }, []);

  const handleSave = async () => {
    if(!formData.name.trim()) { setErrorMsg("Nome é obrigatório."); return; }
    setLoading(true);
    setErrorMsg("");
    const token = localStorage.getItem('token');
    const isEdit = !!formData.id;
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/salon/clients${isEdit ? `/${formData.id}` : ''}`;
    
    try {
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          tags: formData.tags ? formData.tags.split(',').map((t: string)=>t.trim()).filter(Boolean) : []
        })
      });
      const d = await res.json();
      if(!res.ok) throw new Error(d.error || "Erro ao salvar cliente");
      
      alert("Cliente salvo com sucesso!");
      setShowForm(false);
      loadClients();
      if(isEdit && selected?.id === formData.id) setSelected(null);
    } catch(e: any) {
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClientAction = async (id: string, mode: "delete" | "inactive") => {
    const actionLabel = mode === "inactive" ? "inativar" : "deletar";
    if(!confirm(`Tem certeza que deseja ${actionLabel} este cliente?`)) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/salon/clients/${id}?mode=${mode}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if(!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Erro ao excluir cliente");
      }
      alert(mode === "inactive" ? "Cliente inativado!" : "Cliente deletado!");
      if(selected?.id === id) setSelected(null);
      loadClients();
    } catch(e: any) {
      alert(e.message);
    }
  };

  const openNewForm = () => {
    setFormData({ id: "", name: "", phone: "", tags: "" });
    setErrorMsg("");
    setShowForm(true);
  };

  const openEditForm = (client: any) => {
    setFormData({ id: client.id, name: client.name, phone: client.phone === "Não informado" ? "" : client.phone, tags: client.tags.join(", ") });
    setErrorMsg("");
    setShowForm(true);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium">CRM e Fidelização</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestão de carteira, pontos e campanhas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowCampaign(true)}>
            <MessageCircle className="w-4 h-4 mr-2 text-emerald-500" />
            Nova Campanha Zap
          </Button>
          <Button size="sm" onClick={openNewForm}><Plus className="w-4 h-4 mr-2" /> Novo cliente</Button>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-4">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input placeholder="Buscar cliente por nome ou telefone..." className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground" />
        <div className="flex gap-2 border-l border-border pl-3">
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">VIP</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted text-amber-600 border-amber-200">Em Risco (30d+)</Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {showForm && (
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm relative animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{formData.id ? "Editar Cliente" : "Novo Cliente"}</h3>
                <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              {errorMsg && <div className="text-red-500 text-sm mb-3 bg-red-50 p-2 rounded">{errorMsg}</div>}
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Nome *</label>
                  <input disabled={loading} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full h-10 rounded-lg border border-border px-3 text-sm bg-background outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Telefone / WhatsApp</label>
                  <input disabled={loading} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="(11) 99999-9999" className="w-full h-10 rounded-lg border border-border px-3 text-sm bg-background outline-none focus:border-primary" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Tags (separadas por vírgula)</label>
                  <input disabled={loading} value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} placeholder="VIP, Fiel, Noiva..." className="w-full h-10 rounded-lg border border-border px-3 text-sm bg-background outline-none focus:border-primary" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button size="sm" onClick={handleSave} disabled={loading}>{loading ? "Salvando..." : "Salvar"}</Button>
              </div>
            </div>
          )}
          
          <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {["Cliente", "Telefone", "Último atend.", "Total gasto", "Pontos", "Status", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((c: any) => (
                  <tr key={c.id} onClick={() => setSelected(c)} className={`border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer transition-colors ${selected?.id === c.id ? 'bg-primary/5' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={c.name} size="sm" />
                        <div>
                          <div className="text-sm font-medium">{c.name}</div>
                          {c.tags.map((t: string) => <Badge key={t} variant="purple" className="text-[10px] mr-1 mt-0.5">{t}</Badge>)}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{c.phone || "Não informado"}</td>
                    <td className="px-4 py-3 text-sm">{c.lastVisit}</td>
                    <td className="px-4 py-3 text-sm font-medium">{c.total}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        {c.pontos}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={c.status === "inactive" ? "danger" : "success"}>{c.status === "inactive" ? "Inativo" : "Ativo"}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="p-1.5 rounded-lg hover:bg-muted"><ChevronRight className="w-4 h-4 text-muted-foreground" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm transition-shadow">
          {selected ? (
            <div className="flex flex-col h-full">
              <div className="p-5 border-b border-border text-center relative">
                <div className="absolute top-4 right-4 flex gap-1">
                  <button onClick={() => openEditForm(selected)} className="p-2 bg-muted hover:bg-primary/10 hover:text-primary rounded-lg transition-colors" title="Editar"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => handleClientAction(selected.id, "inactive")} className="p-2 bg-muted hover:bg-red-100 text-red-500 rounded-lg transition-colors" title="Inativar"><XCircle className="w-4 h-4" /></button>
                  <button onClick={() => handleClientAction(selected.id, "delete")} className="p-2 bg-muted hover:bg-red-100 text-red-500 rounded-lg transition-colors" title="Deletar"><Trash2 className="w-4 h-4" /></button>
                </div>
                <Avatar name={selected.name} size="xl" className="mx-auto mb-3" />
                <h3 className="font-serif text-xl font-medium">{selected.name}</h3>
                <div className="mt-2"><Badge variant={selected.status === "inactive" ? "danger" : "success"}>{selected.status === "inactive" ? "Inativo" : "Ativo"}</Badge></div>
                <div className="text-muted-foreground text-sm">{selected.phone || "Sem telefone"}</div>
                <div className="flex justify-center flex-wrap gap-2 mt-3">
                  {selected.tags.map((t: string) => <Badge key={t} variant="purple">{t}</Badge>)}
                </div>
              </div>

              <div className="p-5 flex-1 space-y-5">
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 p-4 rounded-xl text-center relative overflow-hidden">
                  <Star className="w-20 h-20 text-amber-500/10 absolute -right-4 -bottom-4" />
                  <div className="text-xs text-amber-700 font-medium mb-1 uppercase tracking-wider">Saldo Fidelidade</div>
                  <div className="text-3xl font-bold text-amber-600 mb-3">{selected.pontos} <span className="text-lg font-medium">pts</span></div>
                  <Button size="sm" className="w-full bg-amber-500 hover:bg-amber-600 text-white shadow-sm">
                    Resgatar Desconto
                  </Button>
                </div>

                <div className="space-y-3 text-sm">
                  {[["Visitas totais", selected.visits], ["Total gasto", selected.total], ["Último atend.", selected.lastVisit]].map(([k, v]) => (
                    <div key={String(k)} className="flex justify-between items-center border-b border-border pb-2 last:border-0">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 border-t border-border bg-muted/10">
                <Button variant="outline" className="w-full text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                  <MessageCircle className="w-4 h-4 mr-2" /> Enviar Mensagem
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Users className="w-8 h-8 opacity-50" />
              </div>
              <p className="text-sm">Selecione um cliente na lista para ver seu perfil completo e gerenciar pontos de fidelidade.</p>
            </div>
          )}
        </div>
      </div>

      {showCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={() => setShowCampaign(false)}>
          <div className="w-[500px] bg-card rounded-2xl shadow-2xl p-6 border border-border animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><MessageCircle className="w-5 h-5" /></div>
                <h2 className="text-xl font-serif font-medium">Campanha Inteligente</h2>
              </div>
              <button onClick={() => setShowCampaign(false)} className="p-2 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Público-alvo (Segmentação)</label>
                <select className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-sm outline-none focus:border-primary">
                  <option>Clientes "Em Risco" (Não vêm há 30+ dias)</option>
                  <option>Clientes VIP (Ticket médio alto)</option>
                  <option>Aniversariantes do Mês</option>
                  <option>Todos os clientes</option>
                </select>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Users className="w-3 h-3" /> Atingirá aproximadamente 142 clientes</div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Mensagem (WhatsApp)</label>
                <textarea 
                  className="w-full p-3 bg-secondary border border-border rounded-lg text-sm outline-none focus:border-primary min-h-[120px] resize-none"
                  defaultValue="Olá {nome}! Sentimos sua falta aqui no salão. Que tal agendar um horário essa semana? Preparamos um desconto especial de 15% para você usar até sexta-feira. Responda 'EU QUERO' para garantir!"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowCampaign(false)}>Cancelar</Button>
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => { alert('Campanha enviada com sucesso para a fila de disparo!'); setShowCampaign(false); }}>
                Disparar Campanha
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}