import { useState, useEffect } from "react";
import { LayoutDashboard, Calendar, ListOrdered, Users, Scissors, UserCheck, Clock, DollarSign, BarChart3, Settings, Star, Globe, Menu, X, Bell, ChevronDown, TrendingUp, TrendingDown, Plus, Search, Filter, Eye, Edit3, Trash2, MoreHorizontal, MessageCircle, Percent, Building2, Zap, ArrowUpRight, ArrowDownRight, Check, ArrowLeft, ChevronRight, LogOut, Package, Download, AlertTriangle, XCircle } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Button, Badge, Avatar, Card, Stars } from "@/components/ui";
import { NAV, revenueData, appointmentsData, servicesPie, PIE_COLORS, appointments, clients, professionals, reviewsList, AGENDA_HOURS, AGENDA_PROS, AGENDA_ITEMS, statusColors, statusLabel, StatCard } from "./shared";

export function LoginScreen({ onLogin }: { onLogin: (token: string, role: string, name: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("owner");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Simulating API behavior based on role
      const nameMap: Record<string, string> = {
        owner: "Rosé Silva (Dona)",
        receptionist: "Ana Souza (Recepcionista)",
        professional: "Juliana (Profissional)"
      };
      
      onLogin("fake-jwt-token-123", role, nameMap[role]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm bg-card p-8 rounded-3xl border border-border shadow-2xl">
        <div className="flex items-center gap-2 justify-center mb-6">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Scissors className="w-4 h-4 text-white" />
          </div>
          <span className="font-serif font-medium text-lg">beautyOS</span>
        </div>
        <h2 className="text-xl font-semibold text-center mb-6">Acesso ao Painel</h2>
        {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Entrar como:</label>
            <select value={role} onChange={e => setRole(e.target.value)} className="w-full h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-background">
              <option value="owner">Dono(a) do Salão (Acesso Total)</option>
              <option value="receptionist">Recepcionista (S/ Financeiro)</option>
              <option value="professional">Profissional (Apenas Agenda)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-background" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-background" />
          </div>
          <Button className="w-full h-10">Entrar</Button>
        </form>
      </div>
    </div>
  );
}