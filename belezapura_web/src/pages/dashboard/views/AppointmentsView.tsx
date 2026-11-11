import { useState, useEffect } from "react";
import {
  Plus, Search, Filter, MoreHorizontal, Check, CheckCircle2, X, Trash2, Calendar,
  MessageCircle, Clock, AlertCircle, Send, Sparkles, CheckCheck, ShieldCheck
} from "lucide-react";
import { Button, Badge, Avatar } from "@/components/ui";

const statusLabel: Record<string, string> = {
  confirmed: "Confirmado",
  waiting: "Aguardando",
  cancelled: "Cancelado",
  done: "Concluído",
};

export function AppointmentsView({ onNewAppointment }: { onNewAppointment: () => void }) {
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [openAlertMenuId, setOpenAlertMenuId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const token = localStorage.getItem("token");

  // Disparo de Alertas e Notificações no WhatsApp
  const handleWhatsAppAlert = (a: any, type: "confirm" | "reminder24h" | "reminder2h" | "post") => {
    setOpenAlertMenuId(null);
    setOpenMenuId(null);
    const cleanPhone = (a.clientPhone || "").replace(/\D/g, "");
    if (!cleanPhone) {
      alert(`O cliente ${a.client} não possui número de WhatsApp informado.`);
      return;
    }
    const phoneWithCountry = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;

    let text = "";
    if (type === "confirm") {
      text = `Olá, *${a.client}*! ✨\n\nSeu agendamento está *CONFIRMADO*! 🎉\n\n✂️ *Serviço:* ${a.service}\n👤 *Profissional:* ${a.pro}\n📅 *Data:* ${a.date} às ${a.time}\n💰 *Valor:* ${a.value} (${a.payment})\n\nEstamos ansiosos para te receber! Qualquer dúvida, estamos por aqui.`;
    } else if (type === "reminder24h") {
      text = `Oi, *${a.client}*! 🌸 Passando para lembrar do seu atendimento amanhã:\n\n📅 *Data:* ${a.date}\n⏰ *Horário:* ${a.time}\n✂️ *Serviço:* ${a.service}\n👤 *Profissional:* ${a.pro}\n\nEstamos ansiosos para receber você!`;
    } else if (type === "reminder2h") {
      text = `Olá, *${a.client}*! ⏰ Seu atendimento de *${a.service}* começa em breve (às *${a.time}* com *${a.pro}*).\n\nVocê confirma sua presença?\n👉 Digite *1* para Confirmar\n👉 Digite *2* se precisar Reagendar`;
    } else if (type === "post") {
      text = `Oi, *${a.client}*! ❤️ Adoramos receber você hoje no salão!\n\nComo foi sua experiência com *${a.pro}*? Sua opinião nos ajuda a evoluir e é muito especial para nós!\n\nAté a próxima! ✨`;
    }

    window.open(`https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const loadAppointments = () => {
    if (!token) return;

    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3050"}/api/appointments`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(json => {
        if (Array.isArray(json)) {
          const formatted = json.map((a: any) => ({
            id: a.id,
            client: a.client?.name || a.clientName || "Cliente",
            clientPhone: a.client?.phone || a.clientPhone || "",
            service: a.service?.name || a.serviceName || "Serviço",
            pro: a.professional?.name || a.professionalName || "Profissional",
            date: a.date ? new Date(a.date).toLocaleDateString("pt-BR") : "—",
            time: a.date ? new Date(a.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "—",
            value: a.value ? `R$ ${Number(a.value).toFixed(2).replace(".", ",")}` : "R$ 0,00",
            payment: a.paymentMethod || "PIX",
            status: (a.status || "confirmed").toLowerCase()
          }));
          setData(formatted);
        } else {
          setData([]);
        }
      })
      .catch(err => {
        console.error("Erro ao buscar agendamentos", err);
        setData([]);
      });
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setOpenMenuId(null);
    setActionLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3050"}/api/appointments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Erro ao atualizar status");
      setData(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    } catch (e: any) {
      alert(e.message || "Erro ao atualizar agendamento");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string, clientName: string) => {
    setOpenMenuId(null);
    if (!confirm(`Deseja realmente excluir o agendamento de ${clientName}?`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3050"}/api/appointments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Erro ao excluir agendamento");
      setData(prev => prev.filter(a => a.id !== id));
    } catch (e: any) {
      alert(e.message || "Erro ao excluir");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredData = data.filter(a => {
    const matchesSearch =
      a.client.toLowerCase().includes(search.toLowerCase()) ||
      a.service.toLowerCase().includes(search.toLowerCase()) ||
      a.pro.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "todos" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const waitingCount = data.filter(a => a.status === "waiting").length;
  const confirmedCount = data.filter(a => a.status === "confirmed").length;
  const doneCount = data.filter(a => a.status === "done").length;

  return (
    <div 
      className="p-4 sm:p-6 space-y-4 max-w-[1600px] mx-auto" 
      onClick={() => { setOpenMenuId(null); setOpenAlertMenuId(null); }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-medium">Agendamentos & Alertas</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Gestão de horários, confirmações de sinal PIX e lembretes de clientes</p>
        </div>
        <Button size="sm" onClick={onNewAppointment} className="gap-1.5 shadow-sm">
          <Plus className="w-4 h-4" /> Novo Agendamento
        </Button>
      </div>

      {/* Cards de Resumo e Alertas de Status */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-card border border-border shadow-xs">
          <span className="text-[11px] font-medium text-muted-foreground block">Total Cadastrados</span>
          <span className="text-xl sm:text-2xl font-bold text-foreground mt-0.5 block">{data.length}</span>
        </div>

        <div className={`p-3.5 rounded-2xl border shadow-xs transition-all ${
          waitingCount > 0 
            ? "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200" 
            : "bg-card border-border"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium block">Aguardando PIX / Sinal</span>
            {waitingCount > 0 && <AlertCircle className="w-4 h-4 text-amber-500 animate-pulse" />}
          </div>
          <span className="text-xl sm:text-2xl font-extrabold mt-0.5 block text-amber-600 dark:text-amber-400">
            {waitingCount}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-card border border-border shadow-xs">
          <span className="text-[11px] font-medium text-muted-foreground block">Confirmados</span>
          <span className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
            {confirmedCount}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-card border border-border shadow-xs">
          <span className="text-[11px] font-medium text-muted-foreground block">Concluídos</span>
          <span className="text-xl sm:text-2xl font-bold text-sky-600 dark:text-sky-400 mt-0.5 block">
            {doneCount}
          </span>
        </div>
      </div>

      {/* Alerta de Ação Imediata se houver pendências de sinal */}
      {waitingCount > 0 && (
        <div className="p-3 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-200">
            <p className="font-bold">Atenção para conferência de pagamentos PIX!</p>
            <p className="text-[11px] opacity-90 mt-0.5">
              Você tem {waitingCount} agendamento(s) aguardando conferência do sinal PIX. Verifique seu extrato bancário ou solicite o comprovante no WhatsApp antes de confirmar a vaga no sistema.
            </p>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-card border border-border rounded-2xl shadow-sm p-3 sm:p-4">
        <div className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-xl text-xs font-medium text-muted-foreground">
          <Filter className="w-3.5 h-3.5" />
          <span>Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-transparent border-0 outline-none text-foreground font-semibold cursor-pointer"
          >
            <option value="todos">Todos</option>
            <option value="confirmed">Confirmados</option>
            <option value="waiting">Aguardando PIX</option>
            <option value="done">Concluídos</option>
            <option value="cancelled">Cancelados</option>
          </select>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-xl text-xs text-muted-foreground ml-auto w-full sm:w-auto">
          <Search className="w-3.5 h-3.5" />
          <input
            placeholder="Buscar por cliente, serviço ou profissional..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent outline-none text-foreground placeholder:text-muted-foreground w-full sm:w-64 text-xs"
          />
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[750px]">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground">
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Serviço</th>
                <th className="px-4 py-3">Profissional</th>
                <th className="px-4 py-3">Data / Hora</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Pagamento</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Alertas & Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    Nenhum agendamento encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filteredData.map(a => (
                  <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={a.client} size="sm" />
                        <div>
                          <div className="text-sm font-semibold text-foreground">{a.client}</div>
                          {a.clientPhone && <div className="text-[11px] text-muted-foreground">{a.clientPhone}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{a.service}</td>
                    <td className="px-4 py-3 text-sm font-medium">{a.pro.split(" ")[0]}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium">{a.date}</div>
                      <div className="text-xs text-muted-foreground">{a.time}</div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-primary">{a.value}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs font-medium">{a.payment}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={a.status === "confirmed" ? "success" : a.status === "done" ? "info" : a.status === "waiting" ? "warning" : "danger"}>
                        {statusLabel[a.status] || a.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right relative">
                      <div className="inline-flex items-center gap-1">
                        
                        {/* Botão de Enviar Alerta no WhatsApp */}
                        <div className="relative">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setOpenMenuId(null);
                              setOpenAlertMenuId(openAlertMenuId === a.id ? null : a.id);
                            }}
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-colors"
                            title="Disparar Alerta ou Lembrete no WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>

                          {/* Menu de Tipos de Alerta WhatsApp */}
                          {openAlertMenuId === a.id && (
                            <div
                              className="absolute right-0 top-9 w-60 bg-card border border-border rounded-xl shadow-2xl py-1.5 z-50 text-left animate-in fade-in zoom-in-95"
                              onClick={e => e.stopPropagation()}
                            >
                              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border mb-1">
                                Disparar Alerta WhatsApp
                              </div>
                              <button
                                onClick={() => handleWhatsAppAlert(a, "confirm")}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                              >
                                <CheckCheck className="w-3.5 h-3.5 shrink-0" />
                                <span>Confirmar Vaga & Pagamento</span>
                              </button>
                              <button
                                onClick={() => handleWhatsAppAlert(a, "reminder24h")}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/30 transition-colors"
                              >
                                <Clock className="w-3.5 h-3.5 shrink-0" />
                                <span>Lembrete 24h antes</span>
                              </button>
                              <button
                                onClick={() => handleWhatsAppAlert(a, "reminder2h")}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                              >
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>Lembrete 2h (Confirmar Horário)</span>
                              </button>
                              <button
                                onClick={() => handleWhatsAppAlert(a, "post")}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors"
                              >
                                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                                <span>Agradecimento & Avaliação</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Botão de Mais Opções */}
                        <div className="relative">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setOpenAlertMenuId(null);
                              setOpenMenuId(openMenuId === a.id ? null : a.id);
                            }}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Alterar status / Opções"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {/* Dropdown Menu de Status */}
                          {openMenuId === a.id && (
                            <div
                              className="absolute right-0 top-9 w-48 bg-card border border-border rounded-xl shadow-xl py-1 z-50 text-left animate-in fade-in zoom-in-95"
                              onClick={e => e.stopPropagation()}
                            >
                              <button
                                onClick={() => handleStatusChange(a.id, "confirmed")}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-50 transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" /> Confirmar Agendamento
                              </button>
                              <button
                                onClick={() => handleStatusChange(a.id, "done")}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-sky-600 hover:bg-sky-50 transition-colors"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Concluir Atendimento
                              </button>
                              <button
                                onClick={() => handleStatusChange(a.id, "cancelled")}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-amber-600 hover:bg-amber-50 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" /> Cancelar Agendamento
                              </button>
                              <div className="border-t border-border my-1" />
                              <button
                                onClick={() => handleDelete(a.id, a.client)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Excluir Registro
                              </button>
                            </div>
                          )}
                        </div>

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
export default AppointmentsView;