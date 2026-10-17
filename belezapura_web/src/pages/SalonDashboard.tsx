import { useState, useEffect, useMemo } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import {
  LayoutDashboard, Calendar, ListOrdered, Users, Scissors, UserCheck, Clock,
  DollarSign, BarChart3, Settings, Star, Globe, Menu, X, Bell, ChevronDown,
  TrendingUp, TrendingDown, Plus, Search, Filter, Eye, Edit3, Trash2, MoreHorizontal,
  MessageCircle, Percent, Building2, Zap, ArrowUpRight, ArrowDownRight, Check,
  ArrowLeft, ChevronRight, LogOut, Lock, Crown, Bot
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { Button, Badge, Avatar, Card, Stars } from "@/components/ui";

import { NAV, DashboardView, AgendaView, AppointmentsView, ClientsView, FinanceiroView, ComissoesView, AvaliacoesView, PaginaSalaoView, ServicosView, ProfissionaisView, HorariosView, RelatoriosView, ConfiguracoesView, NovoAgendamentoModal, EstoqueView, ChatbotWhatsAppView } from './dashboard/views';

export default function SalonDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unit, setUnit] = useState("Unidade Moema");
  const [showModal, setShowModal] = useState(false);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [role, setRole] = useState<string>(localStorage.getItem('role') || 'owner');
  const [userName, setUserName] = useState<string>(localStorage.getItem('userName') || 'Geevheit Gestão');

  if (!token) {
    return <Navigate to="/login" replace />;
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

  const [planName, setPlanName] = useState<string>("Trial 10 Dias");
  const [trialExpired, setTrialExpired] = useState<boolean>(false);
  const [daysRemaining, setDaysRemaining] = useState<number>(10);
  const [isTrial, setIsTrial] = useState<boolean>(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/salon/details`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('userName');
          setToken(null);
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data) {
          if (data.trialExpired) {
            setTrialExpired(true);
          }
          if (typeof data.daysRemaining === 'number') {
            setDaysRemaining(data.daysRemaining);
          }
          if (data.subscriptions && data.subscriptions.length > 0) {
            const sub = data.subscriptions.find((s: any) => s.status === "ACTIVE" || s.status === "TRIAL") || data.subscriptions[0];
            if (sub?.plan?.name) {
              setPlanName(`Plano ${sub.plan.name}`);
            }
            if (sub?.status === "ACTIVE") {
              setIsTrial(false);
              setTrialExpired(false);
            }
          }
        }
      })
      .catch(console.error);
    }
  }, [token]);

  const handleUpgrade = async (selectedPlan: string) => {
    if (upgradingPlan) return; // Anti-double click protection
    setUpgradingPlan(selectedPlan);
    setUpgradeError(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/salon/upgrade-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ planName: selectedPlan })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Erro ao processar assinatura.');
      }

      setPlanName(`Plano ${data.planName || selectedPlan}`);
      setTrialExpired(false);
      setIsTrial(false);
      setShowUpgradeModal(false);
      alert(`🎉 Parabéns! Sua assinatura do Plano ${data.planName || selectedPlan} foi ativada com sucesso!`);
    } catch (err: any) {
      setUpgradeError(err.message || 'Falha na comunicação com o servidor.');
    } finally {
      setUpgradingPlan(null);
    }
  };

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
      case "chatbot": return <ChatbotWhatsAppView />;
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
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity animate-in fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col md:hidden transition-transform duration-300 ${
        mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      }`}>
        <div className="h-14 flex items-center justify-between px-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Scissors className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-tight">Beleza<span className="text-primary">Pura</span></span>
              <span className="text-[10px] text-primary font-semibold">{planName}</span>
            </div>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 rounded-lg hover:bg-muted cursor-pointer">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <nav className="flex-1 py-2 overflow-y-auto">
          {allowedNav.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all cursor-pointer ${
                activeSection === item.id
                  ? "bg-primary/10 text-primary border-r-2 border-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <div className="flex items-center justify-between flex-1 min-w-0">
                <span className="truncate">{item.label}</span>
                {(item as any).badge && (
                  <span className="text-[8px] bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-600 dark:text-amber-400 font-extrabold px-1.5 py-0.5 rounded border border-amber-500/30 shrink-0 ml-1">
                    {(item as any).badge}
                  </span>
                )}
              </div>
            </button>
          ))}
        </nav>

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
      </aside>

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex ${sidebarOpen ? "w-60" : "w-16"} shrink-0 bg-card border-r border-border flex-col transition-all duration-300`}>
        <div className="h-14 flex items-center justify-between px-4 border-b border-border">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Scissors className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm leading-tight">Beleza<span className="text-primary">Pura</span></span>
                <span className="text-[10px] text-primary font-semibold">{planName}</span>
              </div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(v => !v)} className="p-1.5 rounded-lg hover:bg-muted ml-auto cursor-pointer">
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
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all cursor-pointer ${
                activeSection === item.id
                  ? "bg-primary/10 text-primary border-r-2 border-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {sidebarOpen && (
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <span className="truncate">{item.label}</span>
                  {(item as any).badge && (
                    <span className="text-[8px] bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-600 dark:text-amber-400 font-extrabold px-1.5 py-0.5 rounded border border-amber-500/30 shrink-0 ml-1">
                      {(item as any).badge}
                    </span>
                  )}
                </div>
              )}
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

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Topbar */}
        <header className="h-14 bg-card border-b border-border flex items-center justify-between px-3 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-muted text-foreground cursor-pointer shrink-0"
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-semibold text-sm sm:text-base truncate">{NAV.find(n => n.id === activeSection)?.label}</span>
            {isTrial && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs text-amber-600 dark:text-amber-400 font-medium shrink-0">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Demonstração: {daysRemaining} {daysRemaining === 1 ? 'dia restante' : 'dias restantes'}</span>
                <button 
                  onClick={() => setShowUpgradeModal(true)} 
                  className="ml-1 text-[11px] underline font-bold hover:text-amber-700 cursor-pointer"
                >
                  Assinar Plano
                </button>
              </div>
            )}
            {role === 'superadmin' && (
              <button
                onClick={() => navigate('/superadmin')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-full text-xs font-semibold cursor-pointer transition-colors"
                title="Ir para o painel de administração global"
              >
                <Crown className="w-3.5 h-3.5 text-purple-600" />
                <span>Painel SuperAdmin</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
              <Building2 className="w-3.5 h-3.5" />
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="bg-transparent border-0 outline-none text-xs sm:text-sm text-muted-foreground cursor-pointer"
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
        <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 bg-background pb-20 md:pb-6">
          {renderContent()}
        </main>

        {/* Mobile App Bottom Navigation Bar (PWA Style) */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-card/95 backdrop-blur-md border-t border-border z-30 flex items-center justify-around h-16 px-1 shadow-lg safe-area-bottom">
          <button
            onClick={() => setActiveSection("dashboard")}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
              activeSection === "dashboard" ? "text-primary font-semibold" : "text-muted-foreground"
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Início</span>
          </button>

          <button
            onClick={() => setActiveSection("agenda")}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
              activeSection === "agenda" ? "text-primary font-semibold" : "text-muted-foreground"
            }`}
          >
            <Calendar className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Agenda</span>
          </button>

          <button
            onClick={() => setActiveSection("chatbot")}
            className={`flex flex-col items-center justify-center flex-1 py-1 relative transition-colors cursor-pointer ${
              activeSection === "chatbot" ? "text-primary font-semibold" : "text-muted-foreground"
            }`}
          >
            <div className="relative">
              <Bot className="w-5 h-5 mb-0.5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className="text-[10px]">IA Zap</span>
          </button>

          <button
            onClick={() => setActiveSection("clientes")}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
              activeSection === "clientes" ? "text-primary font-semibold" : "text-muted-foreground"
            }`}
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Clientes</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center flex-1 py-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Mais</span>
          </button>
        </nav>
      </div>

      {/* Trial Expired Lock Screen / Upgrade Modal */}
      {(trialExpired || showUpgradeModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md">
          <div className="bg-card border border-border shadow-2xl rounded-2xl max-w-4xl w-full p-6 sm:p-8 relative overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-primary to-purple-600" />

            {!trialExpired && (
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <div className="text-center max-w-2xl mx-auto mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold mb-3">
                <Lock className="w-3.5 h-3.5" />
                {trialExpired ? "Período de Demonstração (10 Dias) Expirado" : "Evolua seu Salão"}
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-2">
                {trialExpired ? "Acesso bloqueado: Ative seu plano para continuar" : "Escolha o plano ideal para seu crescimento"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {trialExpired
                  ? "Os 10 dias de teste gratuito terminaram. Para desbloquear sua agenda, serviços e liberar a página pública do salão para novos clientes, escolha um plano oficial abaixo:"
                  : "Automatize sua rotina, aumente a retenção e impulsione o faturamento do seu espaço."}
              </p>
            </div>

            {upgradeError && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm text-center font-medium">
                {upgradeError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Básico */}
              <div className="rounded-xl border border-border bg-card p-5 flex flex-col justify-between hover:border-primary/50 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-base">Básico</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/30">10 vagas</span>
                  </div>
                  <div className="mb-4">
                    <span className="text-2xl font-extrabold text-foreground">R$ 49,99</span>
                    <span className="text-xs text-muted-foreground">/mês</span>
                  </div>
                  <ul className="space-y-2 text-xs text-muted-foreground mb-6">
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> 1 profissional</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Página do Salão (Link Bio)</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Agendamento Automático 24h</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Cobrança de Sinal PIX</li>
                  </ul>
                </div>
                <Button
                  onClick={() => handleUpgrade("Básico")}
                  disabled={upgradingPlan !== null}
                  variant="outline"
                  className="w-full text-xs font-semibold py-2 cursor-pointer"
                >
                  {upgradingPlan === "Básico" ? "Ativando..." : "Assinar Básico"}
                </Button>
              </div>

              {/* Profissional */}
              <div className="rounded-xl border-2 border-primary bg-primary/5 p-5 flex flex-col justify-between relative shadow-lg">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Mais Popular
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-base text-primary">Profissional</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">10 vagas</span>
                  </div>
                  <div className="mb-4">
                    <span className="text-2xl font-extrabold text-foreground">R$ 99,99</span>
                    <span className="text-xs text-muted-foreground">/mês</span>
                  </div>
                  <ul className="space-y-2 text-xs text-muted-foreground mb-6">
                    <li className="flex items-center gap-2 text-foreground font-medium"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> Até 5 profissionais</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> Agendamentos Ilimitados</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> Cálculo de Comissões</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> Controle Financeiro Completo</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> Suporte VIP Prioritário</li>
                  </ul>
                </div>
                <Button
                  onClick={() => handleUpgrade("Profissional")}
                  disabled={upgradingPlan !== null}
                  className="w-full text-xs font-semibold py-2 bg-primary hover:bg-primary/90 text-white cursor-pointer"
                >
                  {upgradingPlan === "Profissional" ? "Ativando..." : "Assinar Profissional"}
                </Button>
              </div>

              {/* Premium */}
              <div className="rounded-xl border border-purple-500/40 bg-purple-500/5 p-5 flex flex-col justify-between hover:border-purple-500 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Crown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <h3 className="font-bold text-base text-purple-600 dark:text-purple-400">Premium</h3>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-600 border border-purple-500/30">5 vagas</span>
                  </div>
                  <div className="mb-4">
                    <span className="text-2xl font-extrabold text-foreground">R$ 219,99</span>
                    <span className="text-xs text-muted-foreground">/mês</span>
                  </div>
                  <ul className="space-y-2 text-xs text-muted-foreground mb-6">
                    <li className="flex items-center gap-2 text-foreground font-semibold"><Check className="w-3.5 h-3.5 text-purple-500 shrink-0" /> 🤖 Chatbot WhatsApp IA 24h</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-500 shrink-0" /> Agendamento e Sinal no Zap</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-500 shrink-0" /> Lembrete Anti-Furo 2h Antes</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-500 shrink-0" /> Profissionais Ilimitados</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-500 shrink-0" /> Gestão de Estoque Completa</li>
                  </ul>
                </div>
                <Button
                  onClick={() => handleUpgrade("Premium")}
                  disabled={upgradingPlan !== null}
                  className="w-full text-xs font-semibold py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white cursor-pointer"
                >
                  {upgradingPlan === "Premium" ? "Ativando..." : "Assinar Premium"}
                </Button>
              </div>
            </div>

            {trialExpired && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("role");
                    localStorage.removeItem("userName");
                    window.location.reload();
                  }}
                  className="text-xs text-muted-foreground hover:text-red-500 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> Encerrar sessão
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
