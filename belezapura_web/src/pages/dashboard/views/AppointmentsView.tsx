import { useState, useEffect } from "react";
import {
  Plus, Search, Filter, MoreHorizontal, Check, CheckCircle2, X, Trash2, Calendar
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
  const [actionLoading, setActionLoading] = useState(false);

  const token = localStorage.getItem("token");

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

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1600px] mx-auto" onClick={() => setOpenMenuId(null)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-medium">Agendamentos</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Histórico e gestão de todos os atendimentos</p>
        </div>
        <Button size="sm" onClick={onNewAppointment} className="gap-1.5 shadow-sm">
          <Plus className="w-4 h-4" /> Novo Agendamento
        </Button>
      </div>

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
            <option value="waiting">Aguardando</option>
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
                <th className="px-4 py-3 text-right">Ações</th>
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
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === a.id ? null : a.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Opções"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {openMenuId === a.id && (
                        <div
                          className="absolute right-4 top-10 w-48 bg-card border border-border rounded-xl shadow-xl py-1 z-50 text-left animate-in fade-in zoom-in-95"
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