import { useState, useEffect } from "react";
import { LayoutDashboard, Calendar, ListOrdered, Users, Scissors, UserCheck, Clock, DollarSign, BarChart3, Settings, Star, Globe, Menu, X, Bell, ChevronDown, TrendingUp, TrendingDown, Plus, Search, Filter, Eye, Edit3, Trash2, MoreHorizontal, MessageCircle, Percent, Building2, Zap, ArrowUpRight, ArrowDownRight, Check, ArrowLeft, ChevronRight, LogOut, Package, Download, AlertTriangle, XCircle } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Button, Badge, Avatar, Card, Stars } from "@/components/ui";
import { NAV, revenueData, appointmentsData, servicesPie, PIE_COLORS, appointments, clients, professionals, reviewsList, AGENDA_HOURS, AGENDA_PROS, AGENDA_ITEMS, statusColors, statusLabel, StatCard } from "./shared";

export function EstoqueView() {
  const [produtos, setProdutos] = useState([
    { id: 1, nome: "Coloração Igora Royal 6.0", categoria: "Química", qtde: 4, min: 5, valor: "R$ 45,00", usoInterno: true, venda: false },
    { id: 2, nome: "Shampoo L'Oréal Professionnel 1.5L", categoria: "Lavatório", qtde: 2, min: 2, valor: "R$ 180,00", usoInterno: true, venda: false },
    { id: 3, nome: "Máscara Wella Invigo 500g", categoria: "Tratamento", qtde: 12, min: 5, valor: "R$ 120,00", usoInterno: true, venda: true },
    { id: 4, nome: "Pó Descolorante Schwarzkopf 450g", categoria: "Química", qtde: 1, min: 3, valor: "R$ 145,00", usoInterno: true, venda: false },
    { id: 5, nome: "Óleo Extraordinário Elsève 100ml", categoria: "Finalizador", qtde: 8, min: 4, valor: "R$ 35,00", usoInterno: false, venda: true },
  ]);

  const [filtro, setFiltro] = useState("Todos");

  const dadosExibicao = filtro === "Todos" 
    ? produtos 
    : filtro === "Baixo Estoque" 
      ? produtos.filter(p => p.qtde < p.min)
      : produtos.filter(p => p.categoria === filtro);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium">Controle de Estoque</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestão de consumo interno e vendas</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" /> Relatório</Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground"><Plus className="w-4 h-4 mr-2" /> Adicionar Produto</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-2">
        <StatCard label="Total de Itens" value={produtos.length.toString()} icon={Package} color="primary" />
        <StatCard label="Baixo Estoque" value={produtos.filter(p => p.qtde < p.min).length.toString()} icon={AlertTriangle} color="rose" />
        <StatCard label="Valor em Estoque" value="R$ 3.840,00" icon={DollarSign} color="emerald" />
      </div>

      <div className="flex gap-2">
        {["Todos", "Baixo Estoque", "Química", "Lavatório", "Tratamento", "Finalizador"].map(f => (
          <button key={f} onClick={() => setFiltro(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filtro === f ? (f === 'Baixo Estoque' ? 'bg-red-500 text-white' : 'bg-primary text-primary-foreground') : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {["Produto", "Categoria", "Estoque Atual", "Nível Mínimo", "Custo Uni.", "Aplicação", ""].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dadosExibicao.map(p => {
              const isLow = p.qtde < p.min;
              return (
                <tr key={p.id} className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${isLow ? 'bg-red-50/30' : ''}`}>
                  <td className="px-4 py-3 font-medium text-sm">
                    {p.nome}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{p.categoria}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm ${isLow ? 'text-red-500' : 'text-foreground'}`}>{p.qtde} un.</span>
                      {isLow && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{p.min} un.</td>
                  <td className="px-4 py-3 text-sm font-medium">{p.valor}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {p.usoInterno && <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-medium">USO INTERNO</span>}
                      {p.venda && <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-700 font-medium">REVENDA</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}