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
 return <div className="p-4 sm:p-6 space-y-4"><h1 className="font-serif text-2xl">Resumo de comissões</h1><p className="text-sm text-muted-foreground">Estimativa sobre atendimentos concluídos em todo o histórico, usando o percentual atual de cada profissional. Os repasses são feitos pelo salão, fora do sistema.</p>
 {error && <p role="alert">{error}</p>}
 <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr>{["Profissional", "Concluídos", "% atual", "Receita", "Comissão estimada"].map(label => <th key={label} className="p-3 text-left">{label}</th>)}</tr></thead><tbody>{rows.map(p => <tr key={p.id} className="border-t"><td className="p-3">{p.name}</td><td className="p-3">{p.count}</td><td className="p-3">{p.commission}%</td><td className="p-3">{formatCurrency(p.revenue)}</td><td className="p-3">{formatCurrency(p.commissionValue)}</td></tr>)}</tbody></table></div></div>;
}
