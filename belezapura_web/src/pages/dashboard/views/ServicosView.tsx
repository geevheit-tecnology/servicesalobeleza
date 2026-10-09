import { useState, useEffect } from "react";
import { LayoutDashboard, Calendar, ListOrdered, Users, Scissors, UserCheck, Clock, DollarSign, BarChart3, Settings, Star, Globe, Menu, X, Bell, ChevronDown, TrendingUp, TrendingDown, Plus, Search, Filter, Eye, Edit3, Trash2, MoreHorizontal, MessageCircle, Percent, Building2, Zap, ArrowUpRight, ArrowDownRight, Check, ArrowLeft, ChevronRight, LogOut, Package, Download, AlertTriangle, XCircle } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Button, Badge, Avatar, Card, Stars } from "@/components/ui";
import { NAV, revenueData, appointmentsData, servicesPie, PIE_COLORS, appointments, clients, professionals, reviewsList, AGENDA_HOURS, AGENDA_PROS, AGENDA_ITEMS, statusColors, statusLabel, StatCard } from "./shared";

export function ServicosView() {
  const [services, setServices] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newSvc, setNewSvc] = useState({ name: "", duration: "", price: "", cat: "Cabelo" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/salon/details`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.services) {
          setServices(d.services.map((s: any) => ({ ...s, cat: 'Serviço', pros: ['Geral'], status: s.status || 'active' })));
        }
      })
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    if (!newSvc.name.trim() || !newSvc.price || !newSvc.duration) {
      setErrorMsg("Preencha nome, preço e duração.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    const token = localStorage.getItem('token');
    
    // Limpar o preço de qualquer formatação (R$, letras, etc)
    const cleanPrice = newSvc.price.toString().replace(/[^\d.,]/g, '').replace(',', '.');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...newSvc, price: cleanPrice })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar serviço");

      setServices([...services, { ...data, cat: newSvc.cat || 'Serviço', pros: ['Geral'], status: 'active' }]);
      setShowForm(false);
      setNewSvc({ name: "", duration: "", price: "", cat: "Cabelo" });
      alert("Serviço salvo com sucesso!");
    } catch(e: any) { 
      setErrorMsg(e.message || "Erro de conexão ao salvar");
    } finally {
      setLoading(false);
    }
  };

  const handleServiceAction = async (id: string, mode: "delete" | "inactive") => {
    const actionLabel = mode === "inactive" ? "inativar" : "deletar";
    if (!confirm(`Tem certeza que deseja ${actionLabel} este serviço?`)) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/services/${id}?mode=${mode}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Erro ao excluir serviço");
      }
      if (mode === "inactive") {
        const data = await res.json();
        setServices(services.map(s => s.id === id ? { ...s, status: data.status || "inactive" } : s));
      } else {
        setServices(services.filter(s => s.id !== id));
      }
      alert(mode === "inactive" ? "Serviço inativado!" : "Serviço deletado!");
    } catch(e: any) {
      alert(e.message);
    }
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
          {errorMsg && <div className="text-red-500 text-sm mb-2">{errorMsg}</div>}
          <div className="grid sm:grid-cols-2 gap-3">
            <input disabled={loading} value={newSvc.name} onChange={e => setNewSvc({...newSvc, name: e.target.value})} placeholder="Nome do serviço" className="h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-card" />
            <select disabled={loading} value={newSvc.cat} onChange={e => setNewSvc({...newSvc, cat: e.target.value})} className="h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-card appearance-none">
              {cats.slice(1).map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input disabled={loading} value={newSvc.duration} onChange={e => setNewSvc({...newSvc, duration: e.target.value})} placeholder="Duração (min)" className="h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-card" />
            <input disabled={loading} value={newSvc.price} onChange={e => setNewSvc({...newSvc, price: e.target.value})} placeholder="Preço (R$)" className="h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-card" />
            <Button size="sm" className="h-10" onClick={handleSave} disabled={loading}>{loading ? "..." : "Salvar"}</Button>
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
                <td className="px-4 py-3 text-sm text-muted-foreground">{s.duration} min</td>
                <td className="px-4 py-3 text-sm font-semibold text-primary">R$ {Number(s.price).toFixed(2).replace('.', ',')}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{s.pros?.join(", ") || "Geral"}</td>
                <td className="px-4 py-3">
                  <button
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${s.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                    {s.status === "active" ? "Ativo" : "Inativo"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded hover:bg-muted"><Edit3 className="w-3.5 h-3.5 text-muted-foreground" /></button>
                    <button onClick={() => handleServiceAction(s.id, "inactive")} className="p-1.5 rounded hover:bg-red-100 text-red-500 transition-colors" title="Inativar"><XCircle className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleServiceAction(s.id, "delete")} className="p-1.5 rounded hover:bg-red-100 text-red-500 transition-colors" title="Deletar"><Trash2 className="w-3.5 h-3.5" /></button>
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