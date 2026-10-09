import { useState, useEffect } from "react";
import { LayoutDashboard, Calendar, ListOrdered, Users, Scissors, UserCheck, Clock, DollarSign, BarChart3, Settings, Star, Globe, Menu, X, Bell, ChevronDown, TrendingUp, TrendingDown, Plus, Search, Filter, Eye, Edit3, Trash2, MoreHorizontal, MessageCircle, Percent, Building2, Zap, ArrowUpRight, ArrowDownRight, Check, ArrowLeft, ChevronRight, LogOut, Package, Download, AlertTriangle, XCircle } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Button, Badge, Avatar, Card, Stars } from "@/components/ui";
import { NAV, revenueData, appointmentsData, servicesPie, PIE_COLORS, appointments, clients, professionals, reviewsList, AGENDA_HOURS, AGENDA_PROS, AGENDA_ITEMS, statusColors, statusLabel, StatCard } from "./shared";

export function ComissoesView() {
  const [profs, setProfs] = useState(professionals.map(p => ({ ...p, isEditing: false, customCommission: parseInt(p.commission) })));

  const handleToggleEdit = (index: number) => {
    setProfs(prev => prev.map((p, i) => i === index ? { ...p, isEditing: !p.isEditing, commission: p.isEditing ? `${p.customCommission}%` : p.commission } : p));
  };

  const handleUpdatePct = (index: number, val: number) => {
    setProfs(prev => prev.map((p, i) => i === index ? { ...p, customCommission: val } : p));
  };

  const handlePagar = (name: string) => {
    alert(`Enviando PIX via split de pagamento automático para ${name}...`);
  };

  const totalPagar = profs.reduce((acc, p) => acc + Math.round(parseInt(p.revenue.replace(/\D/g, "")) * p.customCommission / 100), 0);
  const totalFaturado = profs.reduce((acc, p) => acc + parseInt(p.revenue.replace(/\D/g, "")), 0);
  const lucroSalao = totalFaturado - totalPagar;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-medium">Gestor de Comissões (Split)</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" /> Exportar</Button>
          <select className="h-9 px-3 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary font-medium">
            <option>Outubro 2024</option>
            <option>Setembro 2024</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-card border border-border p-4 rounded-xl">
          <div className="text-sm text-muted-foreground mb-1">Faturamento Bruto (Serviços)</div>
          <div className="text-xl font-medium text-foreground">R$ {totalFaturado.toLocaleString("pt-BR")}</div>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl border-l-4 border-l-amber-500">
          <div className="text-sm text-muted-foreground mb-1">Total de Repasse (Profissionais)</div>
          <div className="text-xl font-medium text-amber-600">R$ {totalPagar.toLocaleString("pt-BR")}</div>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl border-l-4 border-l-emerald-500 bg-emerald-50/30">
          <div className="text-sm text-muted-foreground mb-1">Lucro Retido (Salão)</div>
          <div className="text-xl font-medium text-emerald-600">R$ {lucroSalao.toLocaleString("pt-BR")}</div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {["Profissional", "Serviços realizados", "Faturamento", "Regra (Split %)", "Comissão", "Ações"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {profs.map((p, i) => {
              const revenue = parseInt(p.revenue.replace(/\D/g, ""));
              const commission = Math.round(revenue * p.customCommission / 100);
              return (
                <tr key={p.name} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={p.name} size="sm" />
                      <div>
                        <div className="font-medium text-sm">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.specialty}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{p.appointments} atend.</td>
                  <td className="px-4 py-3 text-sm font-medium">{p.revenue}</td>
                  <td className="px-4 py-3">
                    {p.isEditing ? (
                      <div className="flex items-center gap-1">
                        <input 
                          type="number" 
                          value={p.customCommission} 
                          onChange={(e) => handleUpdatePct(i, Number(e.target.value))}
                          className="w-16 h-8 text-sm px-2 border border-primary rounded-md bg-transparent"
                        />
                        <span className="text-sm">%</span>
                      </div>
                    ) : (
                      <Badge variant="info">{p.customCommission}%</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-primary">R$ {commission.toLocaleString("pt-BR")}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleToggleEdit(i)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors" title="Editar regra">
                        {p.isEditing ? <Check className="w-4 h-4 text-emerald-500" /> : <Edit3 className="w-4 h-4" />}
                      </button>
                      <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white h-8 text-xs px-3" onClick={() => handlePagar(p.name)}>Pagar</Button>
                    </div>
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