import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { api } from "@/lib/api";
export function ConfiguracoesView() {
  const [name, setName] = useState(""); const [pixKey, setPixKey] = useState(""); const [document, setDocument] = useState("");
  const [message, setMessage] = useState(""); const [loaded, setLoaded] = useState(false); const [saving, setSaving] = useState(false);
  useEffect(() => { api("/salon/details").then(data => { setName(data.name); setPixKey(data.pixKey || ""); setDocument(data.document || "Não informado"); setLoaded(true); }).catch(error => setMessage(error.message)); }, []);
  const save = async (event: React.FormEvent) => { event.preventDefault(); setSaving(true); try { await api("/salon/details", { method: "PUT", body: JSON.stringify({ name, pixKey }) }); setMessage("Configurações salvas."); } catch (error) { setMessage((error as Error).message); } finally { setSaving(false); } };
  return <form onSubmit={save} className="p-4 sm:p-6 space-y-5 max-w-xl"><h1 className="font-serif text-2xl">Configurações do salão</h1>
    {message && <p role="status" className="p-3 bg-secondary rounded-lg">{message}</p>}
    <label className="block text-sm">Nome do salão<input required value={name} onChange={e => setName(e.target.value)} className="block w-full border rounded-lg p-3 mt-1 bg-background" /></label>
    <p className="text-sm">CPF/CNPJ: {document}</p>
    <label className="block text-sm">Chave Pix do salão<input value={pixKey} onChange={e => setPixKey(e.target.value)} maxLength={77} className="block w-full border rounded-lg p-3 mt-1 bg-background" /></label>
    <p className="text-sm text-muted-foreground">O sinal é enviado diretamente ao salão. Confira o recebimento no banco antes de confirmar o agendamento. Sem chave cadastrada, a reserva é registrada sem cobrança antecipada.</p>
    <Button type="submit" disabled={!loaded || saving}>{saving ? "Salvando..." : "Salvar alterações"}</Button>
  </form>;
}
