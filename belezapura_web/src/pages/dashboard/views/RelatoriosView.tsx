import { useState, useEffect } from "react";
import { LayoutDashboard, Calendar, ListOrdered, Users, Scissors, UserCheck, Clock, DollarSign, BarChart3, Settings, Star, Globe, Menu, X, Bell, ChevronDown, TrendingUp, TrendingDown, Plus, Search, Filter, Eye, Edit3, Trash2, MoreHorizontal, MessageCircle, Percent, Building2, Zap, ArrowUpRight, ArrowDownRight, Check, ArrowLeft, ChevronRight, LogOut, Package, Download, AlertTriangle, XCircle } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Button, Badge, Avatar, Card, Stars } from "@/components/ui";
import { NAV, revenueData, appointmentsData, servicesPie, PIE_COLORS, appointments, clients, professionals, reviewsList, AGENDA_HOURS, AGENDA_PROS, AGENDA_ITEMS, statusColors, statusLabel, StatCard } from "./shared";

export function RelatoriosView() {
  const [period, setPeriod] = useState("outubro");
  const topServices = [
    { name: "Escova Progressiva", qty: 48, revenue: "R$ 8.640" },
    { name: "Manicure Gel", qty: 92, revenue: "R$ 5.980" },
    { name: "Massagem Relaxante", qty: 31, revenue: "R$ 4.030" },
    { name: "Corte Feminino", qty: 44, revenue: "R$ 3.960" },
    { name: "Design Sobrancelha", qty: 67, revenue: "R$ 2.680" },
  ];
  const maxQty = Math.max(...topServices.map(s => s.qty));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-medium">Relatórios</h1>
        <select value={period} onChange={e => setPeriod(e.target.value)}
          className="h-9 px-3 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary appearance-none">
          <option value="outubro">Outubro 2024</option>
          <option value="setembro">Setembro 2024</option>
          <option value="agosto">Agosto 2024</option>
        </select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Faturamento" value="R$ 13.280" trend={12} icon={DollarSign} color="emerald" />
        <StatCard label="Agendamentos" value="282" trend={8} icon={Calendar} color="primary" />
        <StatCard label="Novos clientes" value="18" trend={20} icon={Users} color="purple" />
        <StatCard label="Cancelamentos" value="14" sub="taxa: 4,9%" trend={-3} icon={X} color="rose" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5">
          <h3 className="font-semibold mb-4">Serviços mais vendidos</h3>
          <div className="space-y-3">
            {topServices.map((s, i) => (
              <div key={s.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                    <span className="font-medium">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{s.qty}x</span>
                    <span className="font-semibold text-primary">{s.revenue}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(s.qty / maxQty) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5">
          <h3 className="font-semibold mb-4">Desempenho por profissional</h3>
          <div className="space-y-3">
            {professionals.map(p => {
              const rev = parseInt(p.revenue.replace(/\D/g, ""));
              const maxRev = 2840;
              return (
                <div key={p.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Avatar name={p.name} size="xs" />
                      <span className="font-medium">{p.name.split(" ")[0]}</span>
                      <span className="text-xs text-muted-foreground">{p.appointments} atend.</span>
                    </div>
                    <span className="font-semibold text-primary text-xs">{p.revenue}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${(rev / maxRev) * 100}%`, background: PIE_COLORS[professionals.indexOf(p)] }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-border">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[["Ticket médio", "R$ 107"], ["Maior ticket", "R$ 180"], ["Ocupação média", "78%"], ["Clientes novos", "18"]].map(([k, v]) => (
                <div key={String(k)} className="bg-secondary rounded-xl p-3">
                  <div className="text-muted-foreground text-xs">{k}</div>
                  <div className="font-semibold mt-0.5">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5">
        <h3 className="font-semibold mb-4">Faturamento — evolução diária</h3>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="repGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#B8614A" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#B8614A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D8" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#7C6F65" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#7C6F65" }} axisLine={false} tickLine={false} tickFormatter={(v: any) => `R$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: any) => [`R$ ${Number(v).toLocaleString("pt-BR")}`, "Faturamento"]} />
            <Area type="monotone" dataKey="value" stroke="#B8614A" strokeWidth={2} fill="url(#repGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}