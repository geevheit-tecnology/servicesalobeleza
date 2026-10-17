import { useState, useEffect } from "react";
import {
  Users, Scissors, UserCheck, Plus, X, Edit3, Trash2, XCircle, Camera
} from "lucide-react";
import { Button, Badge, Avatar } from "@/components/ui";

export function ProfissionaisView() {
  const [data, setData] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formPro, setFormPro] = useState({ name: "", specialty: "", commission: "", avatar: "" });
  const [tab, setTab] = useState<"agenda" | "faturamento" | "comissoes" | "avaliacoes">("agenda");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [planInfo, setPlanInfo] = useState<{ name: string; maxProfessionals: number } | null>(null);

  const loadData = () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3050"}/api/salon/details`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => {
        if (d.subscriptions && d.subscriptions.length > 0) {
          const sub = d.subscriptions.find((s: any) => s.status === "ACTIVE" || s.status === "TRIAL") || d.subscriptions[0];
          if (sub?.plan) {
            setPlanInfo({
              name: sub.plan.name,
              maxProfessionals: sub.plan.maxProfessionals || 0
            });
          }
        }

        if (d.professionals && Array.isArray(d.professionals)) {
          const mapped = d.professionals.map((p: any) => ({
            ...p,
            appointments: p.appointmentsCount || 0,
            revenue: p.revenue ? `R$ ${p.revenue}` : "R$ 0,00",
            commission: p.commission ? `${p.commission}%` : "0%",
            status: p.status || "active"
          }));
          setData(mapped);
          if (selected) {
            const updated = mapped.find((m: any) => m.id === selected.id);
            if (updated) setSelected(updated);
          } else if (mapped.length > 0) {
            setSelected(mapped[0]);
          }
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg("A imagem deve ter no máximo 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormPro(prev => ({ ...prev, avatar: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const openNewForm = () => {
    setEditingId(null);
    setFormPro({ name: "", specialty: "", commission: "30", avatar: "" });
    setErrorMsg("");
    setShowForm(true);
  };

  const openEditForm = (pro: any) => {
    setEditingId(pro.id);
    setFormPro({
      name: pro.name,
      specialty: pro.specialty || "",
      commission: String(pro.commission || "").replace("%", ""),
      avatar: pro.avatar || ""
    });
    setErrorMsg("");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (loading) return;
    if (!formPro.name.trim()) {
      setErrorMsg("Nome é obrigatório.");
      return;
    }

    const isEdit = !!editingId;

    if (!isEdit && planInfo?.maxProfessionals && planInfo.maxProfessionals > 0 && data.length >= planInfo.maxProfessionals) {
      setErrorMsg(`Limite do seu plano (${planInfo.name || "Básico"}) atingido: máximo de ${planInfo.maxProfessionals} profissional(is).`);
      return;
    }

    setLoading(true);
    setErrorMsg("");
    const token = localStorage.getItem("token");

    const url = isEdit
      ? `${import.meta.env.VITE_API_URL || "http://localhost:3050"}/api/professionals/${editingId}`
      : `${import.meta.env.VITE_API_URL || "http://localhost:3050"}/api/professionals`;

    try {
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: formPro.name.trim(),
          specialty: formPro.specialty || null,
          avatar: formPro.avatar || null,
          commission: formPro.commission ? parseFloat(formPro.commission) : 0
        })
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Erro ao salvar profissional");

      setShowForm(false);
      setEditingId(null);
      setFormPro({ name: "", specialty: "", commission: "", avatar: "" });
      loadData();
    } catch (e: any) {
      setErrorMsg(e.message || "Erro de conexão ao salvar");
    } finally {
      setLoading(false);
    }
  };

  const handleProfessionalAction = async (id: string, mode: "delete" | "inactive") => {
    const actionLabel = mode === "inactive" ? "alternar o status de" : "deletar permanentemente";
    if (!confirm(`Tem certeza que deseja ${actionLabel} este profissional?`)) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3050"}/api/professionals/${id}?mode=${mode}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Erro ao atualizar profissional");
      }
      loadData();
      if (mode === "delete" && selected?.id === id) {
        setSelected(null);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const isLimitReached = planInfo && planInfo.maxProfessionals > 0 && data.length >= planInfo.maxProfessionals;

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-medium">Equipe & Profissionais</h1>
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
            <Button size="sm" onClick={openNewForm} className="gap-1.5 shadow-sm">
              <Plus className="w-4 h-4" /> Novo profissional
            </Button>
          )}
        </div>
      </div>

      {/* Form Drawer */}
      {showForm && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-foreground">
              {editingId ? "Editar Profissional" : "Cadastrar Profissional"}
            </h3>
            <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-muted text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          {errorMsg && <div className="text-red-500 text-xs bg-red-50 border border-red-200 p-2.5 rounded-lg">{errorMsg}</div>}

          {/* Avatar Upload */}
          <div className="flex items-center gap-4">
            <label className="relative w-16 h-16 rounded-full border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 bg-card overflow-hidden group">
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={loading} />
              {formPro.avatar ? (
                <img src={formPro.avatar} alt="Foto" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              )}
            </label>
            <div>
              <span className="text-xs font-semibold text-foreground block">Foto do profissional</span>
              <span className="text-[11px] text-muted-foreground">Clique para enviar uma foto do perfil</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">Nome Completo *</label>
              <input
                disabled={loading}
                value={formPro.name}
                onChange={e => setFormPro({ ...formPro, name: e.target.value })}
                placeholder="Ex: Carlos Barbeiro"
                className="w-full h-10 rounded-xl border border-border px-3 text-sm outline-none focus:border-primary bg-card"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">Especialidade Principal</label>
              <input
                disabled={loading}
                value={formPro.specialty}
                onChange={e => setFormPro({ ...formPro, specialty: e.target.value })}
                placeholder="Ex: Barba & Cabelo, Colorista, Manicure"
                className="w-full h-10 rounded-xl border border-border px-3 text-sm outline-none focus:border-primary bg-card"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">Comissão Padrão (%)</label>
              <input
                disabled={loading}
                value={formPro.commission}
                onChange={e => setFormPro({ ...formPro, commission: e.target.value })}
                placeholder="Ex: 35"
                className="w-full h-10 rounded-xl border border-border px-3 text-sm outline-none focus:border-primary bg-card"
              />
            </div>
            <div className="flex items-end">
              <Button size="sm" className="h-10 w-full font-semibold shadow-sm" onClick={handleSave} disabled={loading}>
                {loading ? "Salvando..." : editingId ? "Salvar Alterações" : "Cadastrar Profissional"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: List + Detail Card */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          {data.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-2xl p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-base text-foreground">Nenhum profissional cadastrado</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Cadastre os membros da equipe para organizar a agenda individual e comissões.
              </p>
              {!isLimitReached && (
                <Button size="sm" onClick={openNewForm} className="mt-2">
                  <Plus className="w-4 h-4" /> Cadastrar primeiro profissional
                </Button>
              )}
            </div>
          ) : (
            data.map((p: any) => (
              <div
                key={p.id}
                onClick={() => setSelected(p)}
                className={`bg-card border rounded-2xl p-4 flex items-center gap-4 transition-all cursor-pointer ${
                  selected?.id === p.id
                    ? "border-primary ring-2 ring-primary/20 shadow-sm"
                    : "border-border hover:border-primary/40 shadow-xs"
                }`}
              >
                <Avatar src={p.avatar} name={p.name} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-foreground truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{p.specialty || "Geral"}</div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span>{p.appointments || 0} atendimentos</span>
                    <span className="text-primary font-semibold">{p.revenue}</span>
                    <span>Comissão: {p.commission}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={p.status === "inactive" ? "danger" : "success"}>
                    {p.status === "inactive" ? "Inativo" : "Ativo"}
                  </Badge>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      openEditForm(p);
                    }}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Editar Profissional"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Professional Details & Stats */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-5">
          {selected ? (
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <Avatar src={selected.avatar} name={selected.name} size="lg" />
                  <div>
                    <div className="font-semibold text-base text-foreground">{selected.name}</div>
                    <div className="text-muted-foreground text-xs">{selected.specialty || "Geral"}</div>
                    <Badge variant={selected.status === "inactive" ? "danger" : "success"} className="mt-1 text-[10px]">
                      {selected.status === "inactive" ? "Inativo" : "Ativo"}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => openEditForm(selected)}
                    className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors"
                    title="Editar Dados"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleProfessionalAction(selected.id, "inactive")}
                    className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    title={selected.status === "active" ? "Inativar profissional" : "Reativar profissional"}
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleProfessionalAction(selected.id, "delete")}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Deletar permanentemente"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-1 mb-4 bg-secondary rounded-xl p-1">
                {(["agenda", "faturamento", "comissoes"] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                      tab === t ? "bg-card shadow-xs text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {t === "faturamento" ? "Faturamento" : t === "comissoes" ? "Comissões" : "Agenda"}
                  </button>
                ))}
              </div>

              {tab === "agenda" && (
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Histórico de Atendimentos</div>
                  <div className="py-8 text-center text-muted-foreground text-xs bg-muted/20 border border-border/60 rounded-xl">
                    {selected.appointments > 0
                      ? `${selected.appointments} atendimentos computados no período.`
                      : "Nenhum agendamento pendente no momento."}
                  </div>
                </div>
              )}

              {tab === "faturamento" && (
                <div className="space-y-3 text-sm">
                  {[
                    ["Volume Total", selected.revenue || "R$ 0,00"],
                    ["Comissão Acordada", selected.commission || "0%"]
                  ].map(([k, v]) => (
                    <div key={String(k)} className="flex justify-between items-center py-2 border-b border-border last:border-0 text-xs">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="font-semibold text-foreground">{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {tab === "comissoes" && (
                <div className="space-y-3 text-sm">
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-xs space-y-1">
                    <span className="text-muted-foreground block">Percentual por atendimento</span>
                    <span className="text-lg font-bold text-primary">{selected.commission}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-muted-foreground">
              Selecione um profissional para ver suas estatísticas e gerenciar suas comissões.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default ProfissionaisView;