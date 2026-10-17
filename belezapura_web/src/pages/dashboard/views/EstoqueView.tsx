import { useState, useEffect } from "react";
import {
  Package, Plus, AlertTriangle, MoreHorizontal, Download, Trash2, ArrowUpRight, ArrowDownRight, Edit3, X, Check
} from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { formatCurrency, parseCurrency } from "@/utils/formatters";

interface Produto {
  id: string;
  nome: string;
  categoria: string;
  qtde: number;
  min: number;
  valor: string;
  usoInterno: boolean;
  venda: boolean;
}

const DEFAULT_PRODUTOS: Produto[] = [
  { id: "1", nome: "Shampoo Pós-Química 1L", categoria: "Lavatório", qtde: 4, min: 2, valor: "R$ 68,00", usoInterno: true, venda: false },
  { id: "2", nome: "Máscara Nutrição Intensa 500g", categoria: "Tratamento", qtde: 1, min: 3, valor: "R$ 95,00", usoInterno: true, venda: true },
  { id: "3", nome: "Óleo Reparador de Pontas 60ml", categoria: "Finalizador", qtde: 12, min: 5, valor: "R$ 45,00", usoInterno: false, venda: true },
  { id: "4", nome: "Oxidante 20 Vol 900ml", categoria: "Química", qtde: 6, min: 4, valor: "R$ 32,00", usoInterno: true, venda: false },
  { id: "5", nome: "Pó Descolorante White 500g", categoria: "Química", qtde: 2, min: 2, valor: "R$ 82,00", usoInterno: true, venda: false },
];

export function EstoqueView() {
  const [produtos, setProdutos] = useState<Produto[]>(() => {
    const saved = localStorage.getItem("salon_estoque");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return DEFAULT_PRODUTOS;
  });

  const [filtro, setFiltro] = useState("Todos");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome: "",
    categoria: "Lavatório",
    qtde: "5",
    min: "2",
    valor: "50,00",
    usoInterno: true,
    venda: false,
  });

  useEffect(() => {
    localStorage.setItem("salon_estoque", JSON.stringify(produtos));
  }, [produtos]);

  const openNewForm = () => {
    setEditingId(null);
    setFormData({
      nome: "",
      categoria: "Lavatório",
      qtde: "5",
      min: "2",
      valor: "50,00",
      usoInterno: true,
      venda: false,
    });
    setShowModal(true);
  };

  const openEditForm = (p: Produto) => {
    setEditingId(p.id);
    setFormData({
      nome: p.nome,
      categoria: p.categoria,
      qtde: String(p.qtde),
      min: String(p.min),
      valor: p.valor.replace("R$ ", ""),
      usoInterno: p.usoInterno,
      venda: p.venda,
    });
    setOpenMenuId(null);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const numValor = parseCurrency(formData.valor);
    const formattedValor = formatCurrency(numValor);

    if (editingId) {
      setProdutos(prev => prev.map(p => p.id === editingId ? {
        ...p,
        nome: formData.nome.trim(),
        categoria: formData.categoria,
        qtde: parseInt(formData.qtde, 10) || 0,
        min: parseInt(formData.min, 10) || 0,
        valor: formattedValor,
        usoInterno: formData.usoInterno,
        venda: formData.venda,
      } : p));
    } else {
      const novo: Produto = {
        id: String(Date.now()),
        nome: formData.nome.trim(),
        categoria: formData.categoria,
        qtde: parseInt(formData.qtde, 10) || 0,
        min: parseInt(formData.min, 10) || 0,
        valor: formattedValor,
        usoInterno: formData.usoInterno,
        venda: formData.venda,
      };
      setProdutos(prev => [novo, ...prev]);
    }
    setShowModal(false);
  };

  const adjustStock = (id: string, delta: number) => {
    setOpenMenuId(null);
    setProdutos(prev => prev.map(p => {
      if (p.id !== id) return p;
      const nextQtde = Math.max(0, p.qtde + delta);
      return { ...p, qtde: nextQtde };
    }));
  };

  const deleteProduct = (id: string, name: string) => {
    setOpenMenuId(null);
    if (!confirm(`Deseja realmente excluir "${name}" do estoque?`)) return;
    setProdutos(prev => prev.filter(p => p.id !== id));
  };

  const dadosExibicao = filtro === "Todos"
    ? produtos
    : filtro === "Baixo Estoque"
      ? produtos.filter(p => p.qtde <= p.min)
      : produtos.filter(p => p.categoria === filtro);

  const lowStockCount = produtos.filter(p => p.qtde <= p.min).length;

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1600px] mx-auto" onClick={() => setOpenMenuId(null)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-medium">Controle de Estoque</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Gestão de consumo interno no salão e produtos para revenda</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={openNewForm} className="gap-1.5 shadow-sm">
            <Plus className="w-4 h-4" /> Adicionar Produto
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">Total de Produtos</span>
            <Package className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">{produtos.length} itens</div>
        </div>

        <div className={`border rounded-2xl p-4 shadow-xs ${lowStockCount > 0 ? "bg-red-50/40 border-red-200" : "bg-card border-border"}`}>
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium text-red-600 font-semibold">Baixo Estoque (Reposição)</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600">{lowStockCount} produtos</div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">Categorias Ativas</span>
            <Check className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {new Set(produtos.map(p => p.categoria)).size} categorias
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {["Todos", "Baixo Estoque", "Química", "Lavatório", "Tratamento", "Finalizador"].map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filtro === f
                ? (f === "Baixo Estoque" ? "bg-red-500 text-white shadow-sm" : "bg-primary text-primary-foreground shadow-sm")
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Products Table */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground">
                <th className="px-4 py-3">Produto</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Estoque Atual</th>
                <th className="px-4 py-3">Mínimo</th>
                <th className="px-4 py-3">Custo Unitário</th>
                <th className="px-4 py-3">Destinação</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {dadosExibicao.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    Nenhum produto encontrado neste filtro.
                  </td>
                </tr>
              ) : (
                dadosExibicao.map(p => {
                  const isLow = p.qtde <= p.min;
                  return (
                    <tr key={p.id} className={`hover:bg-muted/20 transition-colors ${isLow ? "bg-red-50/20" : ""}`}>
                      <td className="px-4 py-3 font-semibold text-sm text-foreground">{p.nome}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-xs">{p.categoria}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold text-sm ${isLow ? "text-red-500" : "text-foreground"}`}>
                            {p.qtde} un.
                          </span>
                          {isLow && <AlertTriangle className="w-3.5 h-3.5 text-red-500" title="Estoque abaixo do mínimo!" />}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{p.min} un.</td>
                      <td className="px-4 py-3 text-sm font-semibold text-primary">{p.valor}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {p.usoInterno && (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-medium border border-slate-200">
                              USO INTERNO
                            </span>
                          )}
                          {p.venda && (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-medium border border-emerald-200">
                              REVENDA
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right relative">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === p.id ? null : p.id);
                          }}
                          className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                          title="Opções"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {openMenuId === p.id && (
                          <div
                            className="absolute right-4 top-10 w-44 bg-card border border-border rounded-xl shadow-xl py-1 z-50 text-left animate-in fade-in zoom-in-95"
                            onClick={e => e.stopPropagation()}
                          >
                            <button
                              onClick={() => adjustStock(p.id, 5)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-50 transition-colors"
                            >
                              <ArrowUpRight className="w-3.5 h-3.5" /> Adicionar Entrada (+5)
                            </button>
                            <button
                              onClick={() => adjustStock(p.id, -1)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-amber-600 hover:bg-amber-50 transition-colors"
                            >
                              <ArrowDownRight className="w-3.5 h-3.5" /> Registrar Saída (-1)
                            </button>
                            <button
                              onClick={() => openEditForm(p)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Editar Produto
                            </button>
                            <div className="border-t border-border my-1" />
                            <button
                              onClick={() => deleteProduct(p.id, p.nome)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Excluir do Estoque
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Product */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Package className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-base">
                  {editingId ? "Editar Produto" : "Novo Produto no Estoque"}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Nome do Produto *</label>
                <input
                  required
                  value={formData.nome}
                  onChange={e => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Tinta Louro Médio 7.0"
                  className="w-full h-10 rounded-xl border border-border px-3 text-sm bg-background outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Categoria</label>
                  <select
                    value={formData.categoria}
                    onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full h-10 rounded-xl border border-border px-3 text-sm bg-background outline-none focus:border-primary"
                  >
                    {["Lavatório", "Química", "Tratamento", "Finalizador", "Descartáveis"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-muted-foreground">Custo Unitário</label>
                    {parseCurrency(formData.valor) > 0 && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                        {formatCurrency(formData.valor)}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground select-none">
                      R$
                    </span>
                    <input
                      value={formData.valor}
                      onChange={e => setFormData({ ...formData, valor: e.target.value })}
                      onBlur={() => {
                        const num = parseCurrency(formData.valor);
                        if (num > 0) {
                          setFormData({ ...formData, valor: num.toFixed(2).replace(".", ",") });
                        }
                      }}
                      placeholder="Ex: 45 ou 45,00"
                      className="w-full h-10 rounded-xl border border-border pl-10 pr-3 text-sm bg-background outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Quantidade Atual</label>
                  <input
                    type="number"
                    value={formData.qtde}
                    onChange={e => setFormData({ ...formData, qtde: e.target.value })}
                    className="w-full h-10 rounded-xl border border-border px-3 text-sm bg-background outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Alerta Mínimo</label>
                  <input
                    type="number"
                    value={formData.min}
                    onChange={e => setFormData({ ...formData, min: e.target.value })}
                    className="w-full h-10 rounded-xl border border-border px-3 text-sm bg-background outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.usoInterno}
                    onChange={e => setFormData({ ...formData, usoInterno: e.target.checked })}
                    className="rounded border-border"
                  />
                  <span>Uso Interno</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.venda}
                    onChange={e => setFormData({ ...formData, venda: e.target.checked })}
                    className="rounded border-border"
                  />
                  <span>Venda para Cliente</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" size="sm">
                  {editingId ? "Salvar Alterações" : "Adicionar Produto"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default EstoqueView;