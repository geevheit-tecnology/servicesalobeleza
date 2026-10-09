import { useState, useEffect } from "react";
import { LayoutDashboard, Calendar, ListOrdered, Users, Scissors, UserCheck, Clock, DollarSign, BarChart3, Settings, Star, Globe, Menu, X, Bell, ChevronDown, TrendingUp, TrendingDown, Plus, Search, Filter, Eye, Edit3, Trash2, MoreHorizontal, MessageCircle, Percent, Building2, Zap, ArrowUpRight, ArrowDownRight, Check, ArrowLeft, ChevronRight, LogOut, Package, Download, AlertTriangle, XCircle } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Button, Badge, Avatar, Card, Stars } from "@/components/ui";
import { NAV, revenueData, appointmentsData, servicesPie, PIE_COLORS, appointments, clients, professionals, reviewsList, AGENDA_HOURS, AGENDA_PROS, AGENDA_ITEMS, statusColors, statusLabel, StatCard } from "./shared";

export function FinanceiroView() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="font-serif text-2xl font-medium">Financeiro</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Receitas do mês" value="R$ 13.280" trend={12} icon={TrendingUp} color="emerald" />
        <StatCard label="Despesas" value="R$ 4.200" trend={-3} icon={TrendingDown} color="rose" />
        <StatCard label="Saldo" value="R$ 9.080" trend={18} icon={DollarSign} color="primary" />
        <StatCard label="A receber" value="R$ 1.440" sub="8 pagamentos" icon={Zap} color="amber" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Movimentações recentes</h3>
            <Button variant="outline" size="sm"><Plus className="w-4 h-4" /> Nova</Button>
          </div>
          <div className="space-y-2">
            {[
              { desc: "Escova Progressiva — Fernanda L.", type: "entrada", value: "R$ 180", date: "Hoje 09:00", method: "PIX" },
              { desc: "Manicure Gel — Camila F.", type: "entrada", value: "R$ 65", date: "Hoje 10:00", method: "Dinheiro" },
              { desc: "Material de limpeza", type: "saida", value: "R$ 120", date: "Ontem", method: "PIX" },
              { desc: "Massagem Relaxante — Patrícia S.", type: "entrada", value: "R$ 130", date: "Ontem", method: "PIX" },
              { desc: "Energia elétrica", type: "saida", value: "R$ 380", date: "12/10", method: "Débito" },
              { desc: "Corte + Hidratação — Beatriz R.", type: "entrada", value: "R$ 130", date: "12/10", method: "Cartão" },
            ].map((m, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${m.type === "entrada" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"}`}>
                    {m.type === "entrada" ? "↑" : "↓"}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{m.desc}</div>
                    <div className="text-xs text-muted-foreground">{m.date} · {m.method}</div>
                  </div>
                </div>
                <span className={`font-semibold text-sm ${m.type === "entrada" ? "text-emerald-600" : "text-red-500"}`}>
                  {m.type === "saida" ? "-" : "+"}{m.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5">
            <h3 className="font-semibold mb-4">Formas de pagamento</h3>
            <div className="space-y-3">
              {[["PIX", "62%", "#B8614A"], ["Cartão", "21%", "#9B7EA8"], ["Dinheiro", "12%", "#5B8DB8"], ["Outros", "5%", "#E8E0D8"]].map(([m, pct, color]) => (
                <div key={String(m)} className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-16">{m}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: String(pct), background: String(color) }} />
                  </div>
                  <span className="text-xs font-medium w-8 text-right">{pct}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5">
            <h3 className="font-semibold mb-3">Categorias de despesa</h3>
            <div className="space-y-2 text-sm">
              {[["Comissões", "R$ 1.840"], ["Aluguel", "R$ 1.200"], ["Materiais", "R$ 680"], ["Energia", "R$ 380"], ["Marketing", "R$ 100"]].map(([k, v]) => (
                <div key={String(k)} className="flex justify-between">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}