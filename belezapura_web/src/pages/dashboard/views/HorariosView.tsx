import { useState, useEffect } from "react";
import { LayoutDashboard, Calendar, ListOrdered, Users, Scissors, UserCheck, Clock, DollarSign, BarChart3, Settings, Star, Globe, Menu, X, Bell, ChevronDown, TrendingUp, TrendingDown, Plus, Search, Filter, Eye, Edit3, Trash2, MoreHorizontal, MessageCircle, Percent, Building2, Zap, ArrowUpRight, ArrowDownRight, Check, ArrowLeft, ChevronRight, LogOut, Package, Download, AlertTriangle, XCircle } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Button, Badge, Avatar, Card, Stars } from "@/components/ui";
import { NAV, revenueData, appointmentsData, servicesPie, PIE_COLORS, appointments, clients, professionals, reviewsList, AGENDA_HOURS, AGENDA_PROS, AGENDA_ITEMS, statusColors, statusLabel, StatCard } from "./shared";

export function HorariosView() {
  const [schedule, setSchedule] = useState(defaultSchedule);
  const [blockModal, setBlockModal] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-medium">Horários</h1>
        <Button variant="outline" size="sm" onClick={() => setBlockModal(v => !v)}>
          <Plus className="w-4 h-4" /> Adicionar bloqueio
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5">
          <h3 className="font-semibold mb-4">Horário de funcionamento</h3>
          <div className="space-y-3">
            {schedule.map((s, i) => (
              <div key={s.day} className="flex items-center gap-3">
                <button
                  onClick={() => setSchedule(prev => prev.map((d, j) => j === i ? { ...d, open: !d.open } : d))}
                  className={`w-10 h-5 rounded-full transition-all relative shrink-0 ${s.open ? "bg-primary" : "bg-muted border border-border"}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${s.open ? "left-5" : "left-0.5"}`} />
                </button>
                <span className={`text-sm font-medium w-8 ${s.open ? "text-foreground" : "text-muted-foreground"}`}>{s.day}</span>
                {s.open ? (
                  <div className="flex items-center gap-2 ml-auto">
                    <select value={s.start} onChange={e => setSchedule(prev => prev.map((d, j) => j === i ? { ...d, start: e.target.value } : d))}
                      className="h-8 px-2 rounded-lg border border-border text-sm outline-none focus:border-primary bg-card appearance-none w-20">
                      {["07:00", "08:00", "09:00", "10:00"].map(t => <option key={t}>{t}</option>)}
                    </select>
                    <span className="text-muted-foreground text-xs">até</span>
                    <select value={s.end} onChange={e => setSchedule(prev => prev.map((d, j) => j === i ? { ...d, end: e.target.value } : d))}
                      className="h-8 px-2 rounded-lg border border-border text-sm outline-none focus:border-primary bg-card appearance-none w-20">
                      {["17:00", "18:00", "19:00", "20:00", "21:00"].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                ) : (
                  <span className="ml-auto text-xs text-muted-foreground">Fechado</span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Intervalo entre agendamentos</span>
            <select className="h-8 px-2 rounded-lg border border-border text-sm outline-none focus:border-primary bg-card appearance-none">
              <option>30 minutos</option>
              <option>15 minutos</option>
              <option>60 minutos</option>
            </select>
          </div>
          <Button className="w-full mt-4" size="sm">Salvar horários</Button>
        </div>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5">
            <h3 className="font-semibold mb-3">Bloqueios e folgas</h3>
            <div className="space-y-2">
              {[
                { label: "Feriado — 02/11 (Finados)", type: "feriado" },
                { label: "Folga Ana — 20/10 a 22/10", type: "folga" },
                { label: "Férias Juliana — Nov 01–15", type: "ferias" },
              ].map(b => (
                <div key={b.label} className="flex items-center justify-between p-3 bg-secondary rounded-xl text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${b.type === "feriado" ? "bg-amber-400" : b.type === "folga" ? "bg-sky-400" : "bg-violet-400"}`} />
                    <span>{b.label}</span>
                  </div>
                  <button className="text-muted-foreground hover:text-red-500 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
            {blockModal && (
              <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-xl space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" className="h-9 rounded-lg border border-border px-2 text-sm outline-none focus:border-primary bg-card" />
                  <select className="h-9 rounded-lg border border-border px-2 text-sm outline-none focus:border-primary bg-card appearance-none">
                    <option>Feriado</option><option>Folga</option><option>Férias</option><option>Bloqueio</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <input placeholder="Descrição" className="flex-1 h-9 rounded-lg border border-border px-2 text-sm outline-none focus:border-primary bg-card" />
                  <Button size="sm" className="h-9" onClick={() => setBlockModal(false)}>OK</Button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5">
            <h3 className="font-semibold mb-3">Horários por profissional</h3>
            <div className="space-y-2">
              {professionals.map(p => (
                <div key={p.name} className="flex items-center justify-between p-3 bg-secondary rounded-xl text-sm">
                  <div className="flex items-center gap-2">
                    <Avatar name={p.name} size="xs" />
                    <span className="font-medium">{p.name.split(" ")[0]}</span>
                  </div>
                  <span className="text-muted-foreground text-xs">Seg–Sex: 9h–18h</span>
                  <button className="text-primary text-xs hover:underline">Editar</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}