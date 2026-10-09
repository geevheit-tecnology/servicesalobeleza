import { useState, useEffect } from "react";
import { LayoutDashboard, Calendar, ListOrdered, Users, Scissors, UserCheck, Clock, DollarSign, BarChart3, Settings, Star, Globe, Menu, X, Bell, ChevronDown, TrendingUp, TrendingDown, Plus, Search, Filter, Eye, Edit3, Trash2, MoreHorizontal, MessageCircle, Percent, Building2, Zap, ArrowUpRight, ArrowDownRight, Check, ArrowLeft, ChevronRight, LogOut, Package, Download, AlertTriangle, XCircle } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Button, Badge, Avatar, Card, Stars } from "@/components/ui";
import { NAV, revenueData, appointmentsData, servicesPie, PIE_COLORS, appointments, clients, professionals, reviewsList, AGENDA_HOURS, AGENDA_PROS, AGENDA_ITEMS, statusColors, statusLabel, StatCard } from "./shared";

export function AvaliacoesView() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="font-serif text-2xl font-medium">Avaliações</h1>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5 text-center">
          <div className="font-serif text-5xl font-medium text-amber-500 mb-1">4,9</div>
          <div className="text-amber-400 text-xl mb-2">★★★★★</div>
          <div className="text-muted-foreground text-sm">327 avaliações</div>
        </div>
        <div className="md:col-span-2 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5">
          <h3 className="font-semibold mb-4">Distribuição</h3>
          <div className="space-y-2">
            {[[5, 78], [4, 15], [3, 5], [2, 1], [1, 1]].map(([stars, pct]) => (
              <div key={stars} className="flex items-center gap-3 text-sm">
                <span className="w-4 text-muted-foreground">{stars}</span>
                <span className="text-amber-400">★</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-muted-foreground w-8 text-right">{pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {reviewsList.map(r => (
          <div key={r.name} className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Avatar name={r.name} size="sm" />
                <div>
                  <div className="font-medium text-sm">{r.name}</div>
                  <div className="text-amber-400 text-xs">{"★".repeat(r.rating)}</div>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{r.date}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-3">{r.comment}</p>
            <div className="flex items-center justify-between mt-3">
              {r.replied ? (
                <Badge variant="success"><Check className="w-3 h-3" /> Respondido</Badge>
              ) : (
                <Badge variant="outline">Sem resposta</Badge>
              )}
              <Button variant="ghost" size="sm">Responder</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}