import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/utils/formatters";
export function ComissoesView() {
 const [rows, setRows] = useState<any[]>([]); const [error, setError] = useState("");
 useEffect(() => { Promise.all([api("/salon/details"), api<any[]>("/appointments")]).then(([salon, appointments]) => {
   setRows((salon.professionals || []).map((p: any) => {
     const done = appointments.filter(a => a.professionalId === p.id && a.status === "done");
     const revenueCents = done.reduce((sum, a) => sum + Math.round(Number(a.value) * 100), 0);
     const commissionCents = Math.round(revenueCents * Number(p.commission || 0) / 100);
     return { ...p, count: done.length, revenue: revenueCents / 100, commissionValue: commissionCents / 100 };
   }));
 }).catch(error => setError(error.message)); }, []);
  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-5xl mx-auto">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">Resumo de comissões</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Estimativa sobre atendimentos concluídos em todo o histórico, usando o percentual atual de cada profissional. Os repasses são feitos pelo salão, fora do sistema.
        </p>
      </div>

      {error && <p role="alert" className="p-3.5 rounded-xl bg-red-50 text-red-600 border border-red-200 text-xs sm:text-sm">{error}</p>}

      <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground">
              <tr>
                {["Profissional", "Concluídos", "% atual", "Receita", "Comissão estimada"].map(label => (
                  <th key={label} className="p-3.5 sm:p-4 font-semibold whitespace-nowrap">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground text-xs">
                    Nenhum profissional com dados de comissão no momento.
                  </td>
                </tr>
              ) : (
                rows.map(p => (
                  <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3.5 sm:p-4 font-semibold text-foreground whitespace-nowrap">{p.name}</td>
                    <td className="p-3.5 sm:p-4 text-muted-foreground whitespace-nowrap">{p.count}</td>
                    <td className="p-3.5 sm:p-4 text-muted-foreground whitespace-nowrap">{p.commission}%</td>
                    <td className="p-3.5 sm:p-4 font-mono font-medium text-foreground whitespace-nowrap">{formatCurrency(p.revenue)}</td>
                    <td className="p-3.5 sm:p-4 font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">{formatCurrency(p.commissionValue)}</td>
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
