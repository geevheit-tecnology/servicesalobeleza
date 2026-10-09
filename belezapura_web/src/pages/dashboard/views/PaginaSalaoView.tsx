import { useState, useEffect } from "react";
import { LayoutDashboard, Calendar, ListOrdered, Users, Scissors, UserCheck, Clock, DollarSign, BarChart3, Settings, Star, Globe, Menu, X, Bell, ChevronDown, TrendingUp, TrendingDown, Plus, Search, Filter, Eye, Edit3, Trash2, MoreHorizontal, MessageCircle, Percent, Building2, Zap, ArrowUpRight, ArrowDownRight, Check, ArrowLeft, ChevronRight, LogOut, Package, Download, AlertTriangle, XCircle } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Button, Badge, Avatar, Card, Stars } from "@/components/ui";
import { NAV, revenueData, appointmentsData, servicesPie, PIE_COLORS, appointments, clients, professionals, reviewsList, AGENDA_HOURS, AGENDA_PROS, AGENDA_ITEMS, statusColors, statusLabel, StatCard } from "./shared";

export function PaginaSalaoView() {
  const [tab, setTab] = useState<"desktop" | "mobile">("desktop");
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-medium">Página do Salão</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Eye className="w-4 h-4" /> Visualizar</Button>
          <Button size="sm"><Globe className="w-4 h-4" /> Publicar</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5 space-y-4">
          <h3 className="font-semibold">Personalizar página</h3>
          {[
            { label: "Nome do salão", value: "Salão Rosé" },
            { label: "Descrição", value: "Cabelo, unhas e estética com cuidado especial" },
            { label: "Endereço", value: "Rua das Flores, 142 — Moema, SP" },
            { label: "Telefone", value: "(11) 99999-0000" },
            { label: "WhatsApp", value: "(11) 99999-0000" },
            { label: "Instagram", value: "@salarose" },
          ].map(f => (
            <div key={f.label}>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{f.label}</label>
              <input defaultValue={f.value} className="w-full h-9 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-background" />
            </div>
          ))}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Cor principal</label>
            <div className="flex gap-2">
              {["#B8614A", "#9B7EA8", "#5B8DB8", "#7DC198", "#E87B4A", "#3D3D3D"].map(c => (
                <button key={c} className="w-8 h-8 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform" style={{ background: c }} />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => {
              const slug = localStorage.getItem('salonSlug') || 'beleza-pura-matriz';
              const url = `${window.location.origin}/agendar/${slug}`;
              if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url).then(() => {
                  alert("Link copiado: " + url);
                }).catch(() => alert("Copie este link manualmente: " + url));
              } else {
                alert("Seu navegador não suporta cópia automática. Link: " + url);
              }
            }}>Copiar link</Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={() => {
              const slug = localStorage.getItem('salonSlug') || 'beleza-pura-matriz';
              const url = `${window.location.origin}/agendar/${slug}`;
              if (navigator.share) {
                navigator.share({ title: 'Agende seu horário conosco!', url }).catch(console.error);
              } else {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                  navigator.clipboard.writeText(url);
                  alert("Link copiado para compartilhar!");
                } else {
                  alert("Compartilhe este link: " + url);
                }
              }
            }}>Compartilhar</Button>
            <Button size="sm" className="flex-1">Publicar</Button>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            {(["desktop", "mobile"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
              >
                {t === "desktop" ? "Desktop" : "Mobile"}
              </button>
            ))}
          </div>
          <div className={`bg-muted rounded-2xl overflow-hidden border border-border ${tab === "mobile" ? "mx-auto max-w-[240px]" : ""}`}>
            <div className="bg-primary/90 text-white p-4 text-center">
              <div className="font-serif text-lg">Salão Rosé</div>
              <div className="text-sm opacity-80">Moema · 4,9 ★</div>
              <button className="mt-2 bg-white text-primary text-xs px-4 py-1.5 rounded-full font-medium">Agendar horário</button>
            </div>
            <div className="p-3 space-y-2">
              {["Cabelo", "Unhas", "Massagem"].map(s => (
                <div key={s} className="flex justify-between bg-white rounded-lg p-2 text-xs">
                  <span className="font-medium">{s}</span>
                  <span className="text-primary">→</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}