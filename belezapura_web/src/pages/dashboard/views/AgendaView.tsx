import { useState, useEffect } from "react";
import { LayoutDashboard, Calendar, ListOrdered, Users, Scissors, UserCheck, Clock, DollarSign, BarChart3, Settings, Star, Globe, Menu, X, Bell, ChevronDown, TrendingUp, TrendingDown, Plus, Search, Filter, Eye, Edit3, Trash2, MoreHorizontal, MessageCircle, Percent, Building2, Zap, ArrowUpRight, ArrowDownRight, Check, ArrowLeft, ChevronRight, LogOut, Package, Download, AlertTriangle, XCircle } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Button, Badge, Avatar, Card, Stars } from "@/components/ui";
import { NAV, revenueData, appointmentsData, servicesPie, PIE_COLORS, appointments, clients, professionals, reviewsList, AGENDA_HOURS, AGENDA_PROS, AGENDA_ITEMS, statusColors, statusLabel, StatCard } from "./shared";

export function AgendaView({ onNewAppointment }: { onNewAppointment: () => void }) {
  const [view, setView] = useState<"dia" | "semana" | "mes">("dia");
  const [items, setItems] = useState(AGENDA_ITEMS.map((item, id) => ({ id, ...item })));
  const [draggedItem, setDraggedItem] = useState<any>(null);

  const handleDragStart = (e: React.DragEvent, item: any) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
    // For visual ghost effect
    setTimeout(() => { (e.target as HTMLElement).style.opacity = "0.5"; }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.target as HTMLElement).style.opacity = "1";
    setDraggedItem(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetProIndex: number, targetHourIndex: number) => {
    e.preventDefault();
    if (!draggedItem) return;
    
    // Check if slot is taken
    const slotTaken = items.find(i => i.id !== draggedItem.id && i.pro === targetProIndex && i.startH === targetHourIndex);
    if (slotTaken) return alert("Horário já está ocupado por outro cliente.");

    setItems(prev => prev.map(item => 
      item.id === draggedItem.id ? { ...item, pro: targetProIndex, startH: targetHourIndex } : item
    ));
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-medium">Agenda Inteligente</h1>
        <div className="flex items-center gap-2">
          <Badge variant="success" className="px-3 py-1 font-medium bg-emerald-100 text-emerald-700">✓ Arraste e solte para reagendar</Badge>
          <div className="flex bg-secondary border border-border rounded-lg overflow-hidden ml-4">
            {(["dia", "semana", "mes"] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 text-sm font-medium capitalize transition-all ${view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {v === "mes" ? "Mês" : v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <Button size="sm" onClick={onNewAppointment}><Plus className="w-4 h-4" /> Novo Agendamento</Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        {/* Date header */}
        <div className="grid border-b border-border bg-muted/20" style={{ gridTemplateColumns: "80px repeat(3, 1fr)" }}>
          <div className="p-3 bg-muted/40" />
          {AGENDA_PROS.map(p => (
            <div key={p} className="p-3 border-l border-border text-center flex flex-col items-center justify-center">
              <Avatar name={p} size="sm" className="mb-2" />
              <div className="font-medium text-sm text-foreground">{p}</div>
              <div className="text-xs text-primary font-medium">{professionals.find(prof => prof.name === p)?.specialty || 'Geral'}</div>
            </div>
          ))}
        </div>

        {/* Interactive Grid */}
        <div className="relative overflow-y-auto bg-card" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          {AGENDA_HOURS.map((h, hi) => (
            <div key={h} className="grid border-b border-border last:border-0 relative group" style={{ gridTemplateColumns: "80px repeat(3, 1fr)", minHeight: 70 }}>
              <div className="p-2 text-xs font-medium text-muted-foreground text-right pr-4 pt-2 bg-muted/20 border-r border-border">{h}</div>
              
              {AGENDA_PROS.map((_, pi) => {
                const item = items.find(a => a.pro === pi && a.startH === hi);
                return (
                  <div 
                    key={pi} 
                    className="border-l border-border/50 relative p-1 transition-colors hover:bg-muted/10 group-hover:border-border"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, pi, hi)}
                  >
                    {item && (
                      <div 
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                        onDragEnd={handleDragEnd}
                        className={`rounded-xl p-2.5 text-xs cursor-grab active:cursor-grabbing hover:brightness-95 transition-all border shadow-sm absolute left-1 right-1 z-10 ${statusColors[item.status]}`}
                        style={{ height: `calc(${item.duration * 70}px - 8px)` }}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="font-semibold text-sm truncate">{item.client}</div>
                          {item.status === 'confirmed' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1" />}
                          {item.status === 'waiting' && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1" />}
                        </div>
                        <div className="opacity-80 font-medium truncate mb-1">{item.service}</div>
                        <div className="text-[10px] opacity-60 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {AGENDA_HOURS[item.startH]} • {item.duration}h
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}