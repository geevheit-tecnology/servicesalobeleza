import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { api } from "@/lib/api";
type WorkingDay = { day: string; open: boolean; start: string; end: string };
const initialSchedule: WorkingDay[] = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"].map((day, i) => ({ day, open: i < 6, start: "09:00", end: "19:00" }));
export function HorariosView() {
  const [schedule, setSchedule] = useState<WorkingDay[]>(initialSchedule);
  const [timezone, setTimezone] = useState("America/Sao_Paulo");
  const [blocks, setBlocks] = useState<string[]>([]);
  const [date, setDate] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => { api("/salon/details").then(data => {
    const stored = JSON.parse(data.scheduleRaw || "[]");
    if (stored.length === 7) setSchedule(stored);
    setTimezone(data.timezone || "America/Sao_Paulo"); setBlocks(JSON.parse(data.blockedDates || "[]")); setLoaded(true);
  }).catch(error => setMessage(error.message)); }, []);
  const save = async () => {
    setSaving(true); setMessage("");
    try { await api("/salon/details", { method: "PUT", body: JSON.stringify({ scheduleRaw: JSON.stringify(schedule), timezone, blockedDates: JSON.stringify(blocks) }) }); setMessage("Horários salvos."); }
    catch (error) { setMessage((error as Error).message); } finally { setSaving(false); }
  };
  return <div className="p-4 sm:p-6 space-y-5 max-w-3xl">
    <h1 className="font-serif text-2xl">Horários de funcionamento</h1>
    {message && <p role="status" className="p-3 rounded-lg bg-secondary">{message}</p>}
    <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
      <label className="block text-sm">Fuso horário do salão<select aria-label="Fuso horário" value={timezone} onChange={e => setTimezone(e.target.value)} className="block w-full border rounded-lg p-2 bg-background mt-1">
        {["America/Sao_Paulo", "America/Manaus", "America/Rio_Branco", "America/Noronha", "America/Cuiaba", "America/Belem"].map(t => <option key={t}>{t}</option>)}
      </select></label>
      {schedule.map((day, i) => <div key={day.day} className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 w-28 text-sm"><input type="checkbox" checked={day.open} onChange={e => setSchedule(rows => rows.map((d, j) => j === i ? { ...d, open: e.target.checked } : d))} />{day.day}</label>
        {day.open && <><input aria-label={`Abertura ${day.day}`} type="time" value={day.start} onChange={e => setSchedule(rows => rows.map((d, j) => j === i ? { ...d, start: e.target.value } : d))} className="border rounded-lg p-2 bg-background" /><span>até</span><input aria-label={`Fechamento ${day.day}`} type="time" value={day.end} onChange={e => setSchedule(rows => rows.map((d, j) => j === i ? { ...d, end: e.target.value } : d))} className="border rounded-lg p-2 bg-background" /></>}
      </div>)}
    </div>
    <div className="bg-card border rounded-2xl p-4 space-y-3"><h2 className="font-semibold">Dias bloqueados para todo o salão</h2>
      <div className="flex flex-wrap gap-2"><input aria-label="Data de bloqueio" type="date" value={date} onChange={e => setDate(e.target.value)} className="border rounded-lg p-2 bg-background" /><Button variant="outline" disabled={!date} onClick={() => { setBlocks(rows => Array.from(new Set([...rows, date])).sort()); setDate(""); }}>Adicionar data</Button></div>
      {blocks.length === 0 && <p className="text-sm text-muted-foreground">Nenhum bloqueio cadastrado.</p>}
      {blocks.map(d => <div key={d} className="flex items-center justify-between"><span>{d.split("-").reverse().join("/")}</span><Button variant="ghost" onClick={() => setBlocks(rows => rows.filter(b => b !== d))}>Remover</Button></div>)}
    </div>
    <Button disabled={!loaded || saving} onClick={save}>{saving ? "Salvando..." : "Salvar horários"}</Button>
  </div>;
}
