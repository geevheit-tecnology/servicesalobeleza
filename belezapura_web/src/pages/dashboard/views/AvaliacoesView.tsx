import { useState, useEffect } from "react";
import { LayoutDashboard, Calendar, ListOrdered, Users, Scissors, UserCheck, Clock, DollarSign, BarChart3, Settings, Star, Globe, Menu, X, Bell, ChevronDown, TrendingUp, TrendingDown, Plus, Search, Filter, Eye, Edit3, Trash2, MoreHorizontal, MessageCircle, Percent, Building2, Zap, ArrowUpRight, ArrowDownRight, Check, ArrowLeft, ChevronRight, LogOut, Package, Download, AlertTriangle, XCircle } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Button, Badge, Avatar, Card, Stars } from "@/components/ui";
import { NAV, revenueData, appointmentsData, servicesPie, PIE_COLORS, appointments, clients, professionals, reviewsList, AGENDA_HOURS, AGENDA_PROS, AGENDA_ITEMS, statusColors, statusLabel, StatCard } from "./shared";

export function AvaliacoesView() {
  const [reviews, setReviews] = useState<any[]>([]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="font-serif text-2xl font-medium">Avaliações</h1>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5 text-center">
          <div className="font-serif text-5xl font-medium text-amber-500 mb-1">
            {reviews.length > 0 ? "5,0" : "—"}
          </div>
          <div className="text-amber-400 text-xl mb-2">★★★★★</div>
          <div className="text-muted-foreground text-sm">{reviews.length} avaliações</div>
        </div>
        <div className="md:col-span-2 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5 flex items-center justify-center">
          <p className="text-sm text-muted-foreground text-center">
            Suas clientes poderão avaliar o atendimento e os profissionais logo após a conclusão dos serviços.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-2xl p-12 text-center text-sm text-muted-foreground">
            Nenhuma avaliação recebida ainda.
          </div>
        ) : (
          reviews.map(r => (
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
            </div>
          ))
        )}
      </div>
    </div>
  );
}