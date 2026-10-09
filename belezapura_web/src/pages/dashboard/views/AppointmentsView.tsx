import { useState, useEffect } from "react";
import { LayoutDashboard, Calendar, ListOrdered, Users, Scissors, UserCheck, Clock, DollarSign, BarChart3, Settings, Star, Globe, Menu, X, Bell, ChevronDown, TrendingUp, TrendingDown, Plus, Search, Filter, Eye, Edit3, Trash2, MoreHorizontal, MessageCircle, Percent, Building2, Zap, ArrowUpRight, ArrowDownRight, Check, ArrowLeft, ChevronRight, LogOut, Package, Download, AlertTriangle, XCircle } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Button, Badge, Avatar, Card, Stars } from "@/components/ui";
import { NAV, revenueData, appointmentsData, servicesPie, PIE_COLORS, appointments, clients, professionals, reviewsList, AGENDA_HOURS, AGENDA_PROS, AGENDA_ITEMS, statusColors, statusLabel, StatCard } from "./shared";

export function AppointmentsView({ onNewAppointment }: { onNewAppointment: () => void }) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/appointments`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(json => {
        // Mapeia os dados do backend para o formato que a tabela espera
        const formatted = json.map((a: any) => ({
          id: a.id,
          client: a.client.name,
          service: a.service.name,
          pro: a.professional.name,
          date: new Date(a.date).toLocaleDateString('pt-BR'),
          time: new Date(a.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          value: `R$ ${a.value}`,
          payment: a.paymentMethod || 'PIX',
          status: a.status
        }));
        setData(formatted);
      })
      .catch(err => console.error("Erro ao buscar agendamentos", err));
  }, []);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-medium">Agendamentos</h1>
        <Button size="sm" onClick={onNewAppointment}><Plus className="w-4 h-4" /> Novo</Button>
      </div>

      <div className="flex flex-wrap gap-3 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-4">
        {["Data", "Profissional", "Serviço", "Status", "Pagamento"].map(f => (
          <div key={f} className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-lg text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
            <Filter className="w-3.5 h-3.5" /> {f}
          </div>
        ))}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg text-sm text-muted-foreground ml-auto">
          <Search className="w-3.5 h-3.5" />
          <input placeholder="Buscar..." className="bg-transparent outline-none text-foreground placeholder:text-muted-foreground w-32" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {["Cliente", "Serviço", "Profissional", "Data / Hora", "Valor", "Pagamento", "Status", ""].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(data.length > 0 ? data : appointments).map(a => (
              <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={a.client} size="sm" />
                    <span className="text-sm font-medium">{a.client}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{a.service}</td>
                <td className="px-4 py-3 text-sm">{a.pro.split(" ")[0]}</td>
                <td className="px-4 py-3">
                  <div className="text-sm font-medium">{a.date}</div>
                  <div className="text-xs text-muted-foreground">{a.time}</div>
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-primary">{a.value}</td>
                <td className="px-4 py-3"><Badge variant="outline">{a.payment}</Badge></td>
                <td className="px-4 py-3">
                  <Badge variant={a.status === "confirmed" ? "success" : a.status === "waiting" ? "warning" : "danger"}>
                    {statusLabel[a.status]}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <button className="p-1.5 rounded-lg hover:bg-muted"><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}