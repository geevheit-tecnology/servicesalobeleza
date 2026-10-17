import { useState, useEffect } from "react";
import { Plus, X, Edit3, Trash2, XCircle, Scissors, Clock } from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { formatCurrency, formatDurationDisplay, parseCurrency, parseDuration } from "@/utils/formatters";

export function ServicosView() {
  const [services, setServices] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formSvc, setFormSvc] = useState({ name: "", duration: "", price: "", cat: "Cabelo" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const cats = ["Todos", "Cabelo", "Unhas", "Massagem", "Estética", "Sobrancelhas", "Maquiagem"];
  const [filterCat, setFilterCat] = useState("Todos");

  const loadServices = () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3050"}/api/salon/details`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => {
        if (d.services && Array.isArray(d.services)) {
          setServices(d.services.map((s: any) => ({
            ...s,
            cat: s.category || "Cabelo",
            pros: ["Geral"],
            status: s.status || "active"
          })));
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadServices();
  }, []);

  const openNewForm = () => {
    setEditingId(null);
    setFormSvc({ name: "", duration: "30", price: "", cat: "Cabelo" });
    setErrorMsg("");
    setShowForm(true);
  };

  const openEditForm = (svc: any) => {
    setEditingId(svc.id);
    setFormSvc({
      name: svc.name,
      duration: String(svc.duration || "30"),
      price: svc.price ? Number(svc.price).toFixed(2).replace(".", ",") : "",
      cat: svc.cat || "Cabelo"
    });
    setErrorMsg("");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (loading) return;
    if (!formSvc.name.trim() || !formSvc.price) {
      setErrorMsg("Preencha o nome do procedimento e o valor.");
      return;
    }
    const cleanPrice = parseCurrency(formSvc.price);
    const durationInt = parseDuration(formSvc.duration);

    if (cleanPrice <= 0) {
      setErrorMsg("Informe um valor válido (ex: 50 ou 50,00).");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    const token = localStorage.getItem("token");

    const isEdit = !!editingId;
    const url = isEdit
      ? `${import.meta.env.VITE_API_URL || "http://localhost:3050"}/api/services/${editingId}`
      : `${import.meta.env.VITE_API_URL || "http://localhost:3050"}/api/services`;

    try {
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: formSvc.name.trim(),
          price: cleanPrice,
          duration: durationInt
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar serviço");

      setShowForm(false);
      setEditingId(null);
      setFormSvc({ name: "", duration: "30", price: "", cat: "Cabelo" });
      loadServices();
    } catch (e: any) {
      setErrorMsg(e.message || "Erro de conexão ao salvar");
    } finally {
      setLoading(false);
    }
  };

  const handleServiceAction = async (id: string, mode: "delete" | "inactive") => {
    const actionLabel = mode === "inactive" ? "alternar o status de" : "deletar";
    if (!confirm(`Tem certeza que deseja ${actionLabel} este serviço?`)) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3050"}/api/services/${id}?mode=${mode}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Erro ao atualizar serviço");
      }
      if (mode === "inactive") {
        const data = await res.json();
        setServices(services.map(s => s.id === id ? { ...s, status: data.status || "inactive" } : s));
      } else {
        setServices(services.filter(s => s.id !== id));
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const filtered = filterCat === "Todos" ? services : services.filter(s => s.cat === filterCat);

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-medium">Serviços</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Catálogo de procedimentos, preços e durações</p>
        </div>
        <Button size="sm" onClick={openNewForm} className="gap-1.5 shadow-sm">
          <Plus className="w-4 h-4" /> Novo serviço
        </Button>
      </div>

      {/* Form Drawer / Accordion */}
      {showForm && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-3 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-foreground">
              {editingId ? "Editar Serviço" : "Novo Serviço"}
            </h3>
            <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-muted text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          {errorMsg && <div className="text-red-500 text-xs bg-red-50 border border-red-200 p-2.5 rounded-lg">{errorMsg}</div>}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">Nome do Procedimento</label>
              <input
                disabled={loading}
                value={formSvc.name}
                onChange={e => setFormSvc({ ...formSvc, name: e.target.value })}
                placeholder="Ex: Corte Masculino, Escova, Manicure..."
                className="w-full h-10 rounded-xl border border-border px-3 text-sm outline-none focus:border-primary bg-card"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">Categoria</label>
              <select
                disabled={loading}
                value={formSvc.cat}
                onChange={e => setFormSvc({ ...formSvc, cat: e.target.value })}
                className="w-full h-10 rounded-xl border border-border px-3 text-sm outline-none focus:border-primary bg-card"
              >
                {cats.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          {/* Duração & Preço Inteligentes */}
          <div className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Duração com atalhos e preview automático */}
              <div className="bg-muted/20 border border-border/80 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" /> Tempo de Atendimento
                  </label>
                  <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    {formatDurationDisplay(formSvc.duration)}
                  </span>
                </div>
                
                <div className="relative mb-2">
                  <input
                    disabled={loading}
                    type="text"
                    value={formSvc.duration}
                    onChange={e => setFormSvc({ ...formSvc, duration: e.target.value })}
                    placeholder="Digite apenas o número (ex: 45 ou 1h)"
                    className="w-full h-10 rounded-xl border border-border px-3 text-sm outline-none focus:border-primary bg-card"
                  />
                </div>

                {/* Chips rápidos de duração */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-muted-foreground mr-1">Rápido:</span>
                  {[15, 30, 45, 60, 90, 120].map(mins => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setFormSvc({ ...formSvc, duration: String(mins) })}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                        parseDuration(formSvc.duration) === mins
                          ? "bg-primary text-primary-foreground font-bold shadow-xs"
                          : "bg-card border border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {mins < 60 ? `${mins}m` : mins === 60 ? "1h" : mins === 90 ? "1h30" : "2h"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preço com R$ automático e formatação inteligente */}
              <div className="bg-muted/20 border border-border/80 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-semibold text-foreground">
                    Valor do Serviço
                  </label>
                  {parseCurrency(formSvc.price) > 0 && (
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      {formatCurrency(formSvc.price)}
                    </span>
                  )}
                </div>

                <div className="relative mb-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground select-none">
                    R$
                  </span>
                  <input
                    disabled={loading}
                    type="text"
                    value={formSvc.price}
                    onChange={e => setFormSvc({ ...formSvc, price: e.target.value })}
                    onBlur={() => {
                      const num = parseCurrency(formSvc.price);
                      if (num > 0) {
                        setFormSvc({ ...formSvc, price: num.toFixed(2).replace(".", ",") });
                      }
                    }}
                    placeholder="Digite o número (ex: 80 ou 80,00)"
                    className="w-full h-10 rounded-xl border border-border pl-10 pr-3 text-sm outline-none focus:border-primary bg-card"
                  />
                </div>

                {/* Chips rápidos de valores populares */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-muted-foreground mr-1">Exemplos:</span>
                  {[35, 50, 70, 90, 120, 150].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setFormSvc({ ...formSvc, price: `${val},00` })}
                      className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-colors cursor-pointer"
                    >
                      R$ {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button size="sm" className="h-10 px-6 font-semibold shadow-sm" onClick={handleSave} disabled={loading}>
                {loading ? "Salvando..." : editingId ? "Salvar Alterações" : "Cadastrar Procedimento"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Categories Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {cats.map(c => (
          <button
            key={c}
            onClick={() => setFilterCat(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filterCat === c
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Services Table */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground">
              <th className="px-4 py-3">Serviço</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Duração</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  <Scissors className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  Nenhum serviço encontrado nesta categoria.
                </td>
              </tr>
            ) : (
              filtered.map(s => (
                <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-semibold text-sm text-foreground">{s.name}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-xs">{s.cat}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground font-medium">
                    {formatDurationDisplay(s.duration)}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-primary">
                    {formatCurrency(s.price)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleServiceAction(s.id, "inactive")}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                        s.status === "active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                      }`}
                      title="Clique para alternar status"
                    >
                      {s.status === "active" ? "Ativo" : "Inativo"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditForm(s)}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Editar Serviço"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleServiceAction(s.id, "inactive")}
                        className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-600 transition-colors"
                        title={s.status === "active" ? "Inativar" : "Reativar"}
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleServiceAction(s.id, "delete")}
                        className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
                        title="Deletar permanentemente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default ServicosView;