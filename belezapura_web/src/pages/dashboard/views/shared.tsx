import { useState, useEffect } from "react";

import {
  LayoutDashboard, Calendar, ListOrdered, Users, Scissors, UserCheck, Clock,
  DollarSign, BarChart3, Settings, Star, Globe, Menu, X, Bell, ChevronDown,
  TrendingUp, TrendingDown, Plus, Search, Filter, Eye, Edit3, Trash2, MoreHorizontal,
  MessageCircle, Percent, Building2, Zap, ArrowUpRight, ArrowDownRight, Check,
  ArrowLeft, ChevronRight, LogOut, Package, Download, AlertTriangle, XCircle
} from "lucide-react";

import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

import { Button, Badge, Avatar, Card, Stars } from "@/components/ui";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "agenda", label: "Agenda", icon: Calendar },
  { id: "agendamentos", label: "Agendamentos", icon: ListOrdered },
  { id: "clientes", label: "Clientes", icon: Users },
  { id: "servicos", label: "Serviços", icon: Scissors },
  { id: "profissionais", label: "Profissionais", icon: UserCheck },
  { id: "horarios", label: "Horários", icon: Clock },
  { id: "financeiro", label: "Financeiro", icon: DollarSign },
  { id: "comissoes", label: "Comissões", icon: Percent },
  { id: "estoque", label: "Estoque", icon: Package },
  { id: "pagina", label: "Página do Salão", icon: Globe },
  { id: "avaliacoes", label: "Avaliações", icon: Star },
  { id: "marketing", label: "Marketing & Zap", icon: MessageCircle },
  { id: "relatorios", label: "Relatórios", icon: BarChart3 },
  { id: "configuracoes", label: "Configurações", icon: Settings },
];

const revenueData: any[] = [];
const appointmentsData: any[] = [];
const servicesPie: any[] = [];
const PIE_COLORS = ["#B8614A", "#9B7EA8", "#5B8DB8", "#7DC198"];
const appointments: any[] = [];
const clients: any[] = [];
const professionals: any[] = [];
const reviewsList: any[] = [];
const AGENDA_HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
const AGENDA_PROS: any[] = [];
const AGENDA_ITEMS: any[] = [];

const statusColors: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  waiting: "bg-amber-100 text-amber-700 border-amber-200",
  cancelled: "bg-red-100 text-red-600 border-red-200",
  done: "bg-sky-100 text-sky-700 border-sky-200",
};

const statusLabel: Record<string, string> = {
  confirmed: "Confirmado", waiting: "Aguardando", cancelled: "Cancelado", done: "Concluído",
};

function StatCard({ label, value, sub, icon: Icon, trend, color = "primary" }: {
  label: string; value: string; sub?: string; icon: any; trend?: number; color?: string;
}) {
  const colors: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    purple: "bg-violet-100 text-violet-600",
    emerald: "bg-emerald-100 text-emerald-600",
    amber: "bg-amber-100 text-amber-600",
    sky: "bg-sky-100 text-sky-600",
    rose: "bg-rose-100 text-rose-600",
  };
  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color] || colors.primary}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium flex items-center gap-0.5 ${trend >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="font-serif text-2xl font-medium">{value}</div>
      <div className="text-muted-foreground text-xs mt-1">{label}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

const allServices = [
  { id: 1, name: "Escova Progressiva", cat: "Cabelo", duration: "120 min", price: "R$ 180", pros: ["Ana Carvalho"], status: "active" },
  { id: 2, name: "Manicure Gel", cat: "Unhas", duration: "45 min", price: "R$ 65", pros: ["Mariana Souza"], status: "active" },
  { id: 3, name: "Corte Feminino", cat: "Cabelo", duration: "60 min", price: "R$ 90", pros: ["Ana Carvalho"], status: "active" },
  { id: 4, name: "Massagem Relaxante", cat: "Massagem", duration: "60 min", price: "R$ 130", pros: ["Juliana Costa"], status: "active" },
  { id: 5, name: "Design de Sobrancelha", cat: "Sobrancelhas", duration: "30 min", price: "R$ 40", pros: ["Ana Carvalho"], status: "active" },
  { id: 6, name: "Bronzeamento", cat: "Estética", duration: "20 min", price: "R$ 80", pros: ["Juliana Costa"], status: "active" },
  { id: 7, name: "Pedicure", cat: "Unhas", duration: "50 min", price: "R$ 60", pros: ["Mariana Souza"], status: "inactive" },
  { id: 8, name: "Maquiagem Completa", cat: "Maquiagem", duration: "90 min", price: "R$ 150", pros: ["Ana Carvalho"], status: "inactive" },
];

const weekDaysShort = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const defaultSchedule = weekDaysShort.map((d, i) => ({ day: d, open: i < 6, start: "09:00", end: i === 5 ? "17:00" : "19:00" }));

export { NAV, revenueData, appointmentsData, servicesPie, PIE_COLORS, appointments, clients, professionals, reviewsList, AGENDA_HOURS, AGENDA_PROS, AGENDA_ITEMS, statusColors, statusLabel, StatCard };