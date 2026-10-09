import { useState, useEffect } from "react";
import { LayoutDashboard, Calendar, ListOrdered, Users, Scissors, UserCheck, Clock, DollarSign, BarChart3, Settings, Star, Globe, Menu, X, Bell, ChevronDown, TrendingUp, TrendingDown, Plus, Search, Filter, Eye, Edit3, Trash2, MoreHorizontal, MessageCircle, Percent, Building2, Zap, ArrowUpRight, ArrowDownRight, Check, ArrowLeft, ChevronRight, LogOut, Package, Download, AlertTriangle, XCircle } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Button, Badge, Avatar, Card, Stars } from "@/components/ui";
import { NAV, revenueData, appointmentsData, servicesPie, PIE_COLORS, appointments, clients, professionals, reviewsList, AGENDA_HOURS, AGENDA_PROS, AGENDA_ITEMS, statusColors, statusLabel, StatCard } from "./shared";

export function ConfiguracoesView() {
  const [tab, setTab] = useState<"empresa" | "usuarios" | "unidades" | "pagamentos" | "notificacoes" | "preferencias">("empresa");
  const tabs = [
    { id: "empresa", label: "Dados da empresa" },
    { id: "usuarios", label: "Usuários" },
    { id: "unidades", label: "Unidades" },
    { id: "pagamentos", label: "Pagamentos / PIX" },
    { id: "notificacoes", label: "Notificações" },
    { id: "preferencias", label: "Preferências" },
  ] as const;

  const unitsList = [
    { name: "Unidade Moema", address: "Rua das Flores, 142", status: "active", pros: 3 },
    { name: "Unidade Centro", address: "Av. Paulista, 800", status: "active", pros: 4 },
    { name: "Unidade Tatuapé", address: "Rua Guanabara, 22", status: "active", pros: 2 },
    { name: "Unidade Campinas", address: "Av. das Palmeiras, 50", status: "inactive", pros: 0 },
  ];

  const usersList = [
    { name: "Rosé Silva", role: "Administradora", email: "rose@salaorose.com.br", status: "active" },
    { name: "Ana Carvalho", role: "Profissional", email: "ana@salaorose.com.br", status: "active" },
    { name: "Mariana Souza", role: "Profissional", email: "mariana@salaorose.com.br", status: "active" },
  ];

  return (
    <div className="p-6 space-y-4">
      <h1 className="font-serif text-2xl font-medium">Configurações</h1>

      <div className="flex gap-1 flex-wrap bg-secondary border border-border rounded-xl p-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t.id ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "empresa" && (
        <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5 space-y-4 max-w-xl">
          {[
            { label: "Nome do salão", value: "Salão Rosé" },
            { label: "CNPJ", value: "00.000.000/0001-00" },
            { label: "Telefone principal", value: "(11) 99999-0000" },
            { label: "E-mail", value: "contato@salaorose.com.br" },
            { label: "Endereço", value: "Rua das Flores, 142 — Moema, SP" },
            { label: "Instagram", value: "@salaorose" },
          ].map(f => (
            <div key={f.label}>
              <label className="text-xs font-medium text-muted-foreground block mb-1">{f.label}</label>
              <input defaultValue={f.value} className="w-full h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-background" />
            </div>
          ))}
          <Button className="mt-2">Salvar alterações</Button>
        </div>
      )}

      {tab === "usuarios" && (
        <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <span className="font-semibold text-sm">Usuários do sistema</span>
            <Button size="sm"><Plus className="w-4 h-4" /> Convidar usuário</Button>
          </div>
          <table className="w-full">
            <thead><tr className="border-b border-border bg-muted/40">
              {["Nome", "Função", "E-mail", "Status", ""].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>)}
            </tr></thead>
            <tbody>
              {usersList.map(u => (
                <tr key={u.name} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><Avatar name={u.name} size="sm" /><span className="font-medium text-sm">{u.name}</span></div></td>
                  <td className="px-4 py-3"><Badge variant="outline">{u.role}</Badge></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3"><Badge variant="success">Ativo</Badge></td>
                  <td className="px-4 py-3"><button className="p-1.5 rounded hover:bg-muted"><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "unidades" && (
        <div className="space-y-3">
          {unitsList.map(u => (
            <div key={u.name} className="flex items-center gap-4 p-4 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{u.name}</div>
                <div className="text-xs text-muted-foreground">{u.address} · {u.pros} profissionais</div>
              </div>
              <Badge variant={u.status === "active" ? "success" : "outline"}>{u.status === "active" ? "Ativa" : "Inativa"}</Badge>
              <button className="text-xs text-primary hover:underline">Editar</button>
            </div>
          ))}
          <Button variant="outline" size="sm"><Plus className="w-4 h-4" /> Adicionar unidade</Button>
        </div>
      )}

      {tab === "pagamentos" && (
        <div className="max-w-xl space-y-4">
          <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5 space-y-4">
            <h3 className="font-semibold">Chave PIX</h3>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Tipo de chave</label>
              <select className="w-full h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-background appearance-none">
                <option>CPF</option><option>CNPJ</option><option>E-mail</option><option>Celular</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Chave PIX</label>
              <input defaultValue="000.000.000-00" className="w-full h-10 rounded-lg border border-border px-3 text-sm font-mono outline-none focus:border-primary bg-background" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Nome do favorecido</label>
              <input defaultValue="Salão Rosé" className="w-full h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-background" />
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5 space-y-3">
            <h3 className="font-semibold">Sinal de reserva</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm">Exigir sinal para confirmar agendamento</span>
              <div className="w-10 h-5 rounded-full bg-primary relative cursor-pointer">
                <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white shadow" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Valor padrão do sinal</label>
              <input defaultValue="R$ 30,00" className="w-full h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-background" />
            </div>
            <Button size="sm">Salvar</Button>
          </div>
        </div>
      )}

      {tab === "notificacoes" && (
        <div className="max-w-xl bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5 space-y-4">
          <h3 className="font-semibold">Notificações WhatsApp</h3>
          {[
            { label: "Novo agendamento", desc: "Quando um cliente agendar online", on: true },
            { label: "Lembrete ao cliente", desc: "24h antes do agendamento", on: true },
            { label: "Confirmação de pagamento", desc: "Quando o PIX for confirmado", on: true },
            { label: "Cancelamento", desc: "Quando um agendamento for cancelado", on: false },
            { label: "Avaliação pós-atendimento", desc: "Solicitar avaliação após o serviço", on: true },
          ].map(n => (
            <div key={n.label} className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{n.label}</div>
                <div className="text-xs text-muted-foreground">{n.desc}</div>
              </div>
              <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-all ${n.on ? "bg-primary" : "bg-muted border border-border"}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${n.on ? "right-0.5" : "left-0.5"}`} />
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "preferencias" && (
        <div className="max-w-xl bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5 space-y-4">
          <h3 className="font-semibold">Preferências do sistema</h3>
          {[
            { label: "Intervalo entre agendamentos", type: "select", options: ["15 min", "30 min", "60 min"], value: "30 min" },
            { label: "Antecedência mínima para agendamento", type: "select", options: ["1 hora", "2 horas", "24 horas"], value: "2 horas" },
            { label: "Cancelamento permitido até", type: "select", options: ["1 hora antes", "2 horas antes", "24 horas antes"], value: "2 horas antes" },
            { label: "Idioma da plataforma", type: "select", options: ["Português (BR)", "Inglês"], value: "Português (BR)" },
          ].map(p => (
            <div key={p.label}>
              <label className="text-xs font-medium text-muted-foreground block mb-1">{p.label}</label>
              <select defaultValue={p.value} className="w-full h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-background appearance-none">
                {p.options.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <Button size="sm">Salvar preferências</Button>
        </div>
      )}
    </div>
  );
}