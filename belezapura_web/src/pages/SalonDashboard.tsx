import { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard, Calendar, ListOrdered, Users, Scissors, UserCheck, Clock,
  DollarSign, BarChart3, Settings, Star, Globe, Menu, X, Bell, ChevronDown,
  TrendingUp, TrendingDown, Plus, Search, Filter, Eye, Edit3, Trash2, MoreHorizontal,
  MessageCircle, Percent, Building2, Zap, ArrowUpRight, ArrowDownRight, Check,
  ArrowLeft, ChevronRight, LogOut
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { Button, Badge, Avatar, Card, Stars } from "@/components/ui";

import { NAV, DashboardView, AgendaView, AppointmentsView, ClientsView, FinanceiroView, ComissoesView, AvaliacoesView, PaginaSalaoView, ServicosView, ProfissionaisView, HorariosView, RelatoriosView, ConfiguracoesView, NovoAgendamentoModal, LoginScreen, EstoqueView } from './dashboard/views/AllViews';

export default function SalonDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [unit, setUnit] = useState("Unidade Moema");
  const [showModal, setShowModal] = useState(false);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [role, setRole] = useState<string>(localStorage.getItem('role') || 'owner');
  const [userName, setUserName] = useState<string>(localStorage.getItem('userName') || 'Rosé Silva');

  if (!token) {
    return <LoginScreen onLogin={(t, r, n) => {
      localStorage.setItem('token', t);
      localStorage.setItem('role', r);
      localStorage.setItem('userName', n);
      setToken(t);
      setRole(r);
      setUserName(n);
    }} />;
  }

  const allowedNav = useMemo(() => {
    if (role === 'professional') {
      return NAV.filter(n => ['agenda', 'avaliacoes', 'pagina'].includes(n.id));
    }
    if (role === 'receptionist') {
      return NAV.filter(n => !['financeiro', 'comissoes', 'relatorios', 'configuracoes', 'estoque'].includes(n.id));
    }
    return NAV;
  }, [role]);

  useEffect(() => {
    if (!allowedNav.find(n => n.id === activeSection)) {
      setActiveSection(allowedNav[0]?.id || 'dashboard');
    }
  }, [allowedNav, activeSection]);

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard": return <DashboardView onNewAppointment={() => setShowModal(true)} />;
      case "agenda": return <AgendaView onNewAppointment={() => setShowModal(true)} />;
      case "agendamentos": return <AppointmentsView onNewAppointment={() => setShowModal(true)} />;
      case "clientes": return <ClientsView />;
      case "servicos": return <ServicosView />;
      case "profissionais": return <ProfissionaisView />;
      case "horarios": return <HorariosView />;
      case "financeiro": return <FinanceiroView />;
      case "comissoes": return <ComissoesView />;
      case "estoque": return <EstoqueView />;
      case "avaliacoes": return <AvaliacoesView />;
      case "pagina": return <PaginaSalaoView />;
      case "relatorios": return <RelatoriosView />;
      case "configuracoes": return <ConfiguracoesView />;
      default: return null;
    }
  };

  const getRoleLabel = () => {
    if (role === 'professional') return 'Profissional';
    if (role === 'receptionist') return 'Recepcionista';
    return 'Administradora';
  };

  return (
    <div className="flex h-full bg-background">
      {showModal && <NovoAgendamentoModal onClose={() => setShowModal(false)} />}
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-60" : "w-16"} shrink-0 bg-card border-r border-border flex flex-col transition-all duration-300`}>
        <div className="h-14 flex items-center justify-between px-4 border-b border-border">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Scissors className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-serif font-medium text-sm">beautyOS</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(v => !v)} className="p-1.5 rounded-lg hover:bg-muted ml-auto">
            <Menu className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {sidebarOpen && (
          <div className="px-3 py-2 border-b border-border">
            <button className="w-full flex items-center justify-between bg-secondary rounded-lg px-3 py-2 text-sm">
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground font-medium truncate">{unit}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            </button>
          </div>
        )}

        <nav className="flex-1 py-2 overflow-y-auto">
          {allowedNav.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all ${
                activeSection === item.id
                  ? "bg-primary/10 text-primary border-r-2 border-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {sidebarOpen && (
          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-2">
              <Avatar name={userName.split(' (')[0]} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium truncate">{userName.split(' (')[0]}</div>
                <div className="text-xs text-muted-foreground">{getRoleLabel()}</div>
              </div>
              <button 
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("role");
                  localStorage.removeItem("userName");
                  window.location.reload();
                }}
                className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6">
          <div>
            <span className="font-medium text-sm">{NAV.find(n => n.id === activeSection)?.label}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Building2 className="w-3.5 h-3.5" />
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="bg-transparent border-0 outline-none text-sm text-muted-foreground cursor-pointer"
              >
                <option>Todas as unidades</option>
                <option>Unidade Moema</option>
                <option>Unidade Centro</option>
                <option>Unidade Tatuapé</option>
              </select>
            </div>
            <button className="p-2 rounded-lg hover:bg-muted relative">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
            </button>
            <Avatar name={userName.split(' (')[0]} size="sm" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-background">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
