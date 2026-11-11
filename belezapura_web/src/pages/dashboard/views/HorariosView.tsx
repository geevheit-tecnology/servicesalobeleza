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
  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-3xl mx-auto">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">Horários de funcionamento</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">Defina os dias e turnos em que seu salão está aberto para agendamentos online.</p>
      </div>

      {message && <p role="status" className="p-3.5 rounded-xl bg-secondary border border-border text-xs sm:text-sm">{message}</p>}

      <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 space-y-4 shadow-xs">
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5">
            Fuso horário do salão
          </label>
          <select 
            aria-label="Fuso horário" 
            value={timezone} 
            onChange={e => setTimezone(e.target.value)} 
            className="w-full h-10 rounded-xl border border-border px-3 text-xs sm:text-sm bg-background outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            {["America/Sao_Paulo", "America/Manaus", "America/Rio_Branco", "America/Noronha", "America/Cuiaba", "America/Belem"].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div className="space-y-2.5 pt-2">
          {schedule.map((day, i) => (
            <div key={day.day} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 sm:p-3.5 rounded-xl border border-border bg-muted/20">
              <label className="flex items-center gap-2.5 text-xs sm:text-sm font-medium cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={day.open} 
                  onChange={e => setSchedule(rows => rows.map((d, j) => j === i ? { ...d, open: e.target.checked } : d))}
                  className="w-4 h-4 rounded text-primary focus:ring-primary"
                />
                <span className={day.open ? "text-foreground font-semibold" : "text-muted-foreground"}>{day.day}</span>
              </label>

              {day.open ? (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input 
                    aria-label={`Abertura ${day.day}`} 
                    type="time" 
                    value={day.start} 
                    onChange={e => setSchedule(rows => rows.map((d, j) => j === i ? { ...d, start: e.target.value } : d))} 
                    className="flex-1 sm:w-32 h-9 px-2.5 rounded-lg border border-border text-xs sm:text-sm bg-background outline-none focus:border-primary" 
                  />
                  <span className="text-xs text-muted-foreground shrink-0">até</span>
                  <input 
                    aria-label={`Fechamento ${day.day}`} 
                    type="time" 
                    value={day.end} 
                    onChange={e => setSchedule(rows => rows.map((d, j) => j === i ? { ...d, end: e.target.value } : d))} 
                    className="flex-1 sm:w-32 h-9 px-2.5 rounded-lg border border-border text-xs sm:text-sm bg-background outline-none focus:border-primary" 
                  />
                </div>
              ) : (
                <span className="text-xs font-medium text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md w-fit">Fechado</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 space-y-4 shadow-xs">
        <div>
          <h2 className="font-semibold text-sm sm:text-base text-foreground">Dias bloqueados para todo o salão</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Feriados ou folgas em que nenhum profissional atenderá.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input 
            aria-label="Data de bloqueio" 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
            className="h-10 px-3 rounded-xl border border-border text-xs sm:text-sm bg-background outline-none focus:border-primary flex-1" 
          />
          <Button 
            variant="outline" 
            disabled={!date} 
            onClick={() => { setBlocks(rows => Array.from(new Set([...rows, date])).sort()); setDate(""); }}
            className="min-h-10 shrink-0 text-xs sm:text-sm font-semibold"
          >
            Adicionar data
          </Button>
        </div>

        {blocks.length === 0 ? (
          <p className="text-xs sm:text-sm text-muted-foreground">Nenhum bloqueio cadastrado.</p>
        ) : (
          <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
            {blocks.map(d => (
              <div key={d} className="flex items-center justify-between p-3 text-xs sm:text-sm bg-card">
                <span className="font-medium text-foreground">{d.split("-").reverse().join("/")}</span>
                <Button size="sm" variant="ghost" onClick={() => setBlocks(rows => rows.filter(b => b !== d))} className="text-rose-500 hover:text-rose-600">
                  Remover
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button disabled={!loaded || saving} onClick={save} className="min-h-11 px-6 text-sm font-bold shadow-md">
        {saving ? "Salvando..." : "Salvar horários"}
      </Button>
    </div>
  );
}
