import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button, Avatar } from "@/components/ui";
import { api } from "@/lib/api";

interface ReviewItem {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

export function AvaliacoesView() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", rating: 5, comment: "" });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api<any>("/salon/details")
      .then(data => {
        try {
          const parsed = JSON.parse(data.reviewsRaw || "[]");
          if (Array.isArray(parsed)) setReviews(parsed);
        } catch {
          setReviews([]);
        }
      })
      .catch(() => {});
  }, []);

  const persistReviews = async (nextReviews: ReviewItem[]) => {
    setSaving(true);
    setMsg("");
    try {
      await api("/salon/details", {
        method: "PUT",
        body: JSON.stringify({ reviewsRaw: JSON.stringify(nextReviews) }),
      });
      setReviews(nextReviews);
      setMsg("Mural de avaliações atualizado na página pública!");
    } catch (e) {
      setMsg((e as Error).message || "Erro ao salvar avaliação.");
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.comment.trim()) return;
    const item: ReviewItem = {
      id: String(Date.now()),
      name: form.name.trim(),
      rating: Number(form.rating) || 5,
      comment: form.comment.trim(),
      date: new Date().toLocaleDateString("pt-BR"),
    };
    await persistReviews([item, ...reviews]);
    setForm({ name: "", rating: 5, comment: "" });
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    const next = reviews.filter(r => r.id !== id && r.name !== id);
    await persistReviews(next);
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + Number(r.rating || 5), 0) / reviews.length).toFixed(1).replace(".", ",")
      : "—";

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-medium">Mural de Avaliações</h1>
          <p className="text-xs text-muted-foreground">
            Depoimentos exibidos na página pública de agendamento do seu salão.
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm(v => !v)}>
          <Plus className="w-4 h-4 mr-1.5" /> Registrar Depoimento
        </Button>
      </div>

      {msg && <div className="p-3 rounded-xl bg-secondary text-sm">{msg}</div>}

      {showForm && (
        <form onSubmit={handleAdd} className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="text-xs font-medium text-muted-foreground">
              Nome da Cliente
              <input
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Mariana Costa"
                className="block w-full border border-border rounded-lg p-2 mt-1 bg-background text-sm text-foreground"
              />
            </label>
            <label className="text-xs font-medium text-muted-foreground">
              Nota (1 a 5 estrelas)
              <select
                value={form.rating}
                onChange={e => setForm({ ...form, rating: Number(e.target.value) })}
                className="block w-full border border-border rounded-lg p-2 mt-1 bg-background text-sm text-foreground"
              >
                {[5, 4, 3, 2, 1].map(n => (
                  <option key={n} value={n}>{n} estrelas</option>
                ))}
              </select>
            </label>
          </div>
          <label className="block text-xs font-medium text-muted-foreground">
            Comentário / Avaliação
            <textarea
              required
              rows={2}
              value={form.comment}
              onChange={e => setForm({ ...form, comment: e.target.value })}
              placeholder="Ex: Atendimento impecável, amei o resultado!"
              className="block w-full border border-border rounded-lg p-2 mt-1 bg-background text-sm text-foreground"
            />
          </label>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={saving}>Salvar no Mural</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </form>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl shadow-sm p-5 text-center">
          <div className="font-serif text-5xl font-medium text-amber-500 mb-1">{avgRating}</div>
          <div className="text-amber-400 text-xl mb-2">★★★★★</div>
          <div className="text-muted-foreground text-sm">{reviews.length} avaliação(ões) publicada(s)</div>
        </div>
        <div className="md:col-span-2 bg-card border border-border rounded-2xl shadow-sm p-5 flex items-center justify-center">
          <p className="text-sm text-muted-foreground text-center">
            As avaliações cadastradas aqui aparecem automaticamente na página exclusiva do seu salão na Bio para aumentar a conversão de novas clientes.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-2xl p-12 text-center text-sm text-muted-foreground">
            Nenhuma avaliação cadastrada ainda. Clique em "Registrar Depoimento" para publicar na página do salão.
          </div>
        ) : (
          reviews.map(r => (
            <div key={r.id || r.name} className="bg-card border border-border rounded-2xl shadow-sm p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Avatar name={r.name} size="sm" />
                  <div>
                    <div className="font-medium text-sm">{r.name}</div>
                    <div className="text-amber-400 text-xs">{"★".repeat(Number(r.rating) || 5)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{r.date}</span>
                  <button
                    onClick={() => handleDelete(r.id || r.name)}
                    className="p-1 rounded hover:bg-red-50 text-red-500"
                    title="Remover avaliação"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3">{r.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
