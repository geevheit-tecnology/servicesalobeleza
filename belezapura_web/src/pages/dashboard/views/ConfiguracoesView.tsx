import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { api } from "@/lib/api";
export function ConfiguracoesView() {
  const [name, setName] = useState(""); const [pixKey, setPixKey] = useState(""); const [document, setDocument] = useState("");
  const [phone, setPhone] = useState(""); const [instagram, setInstagram] = useState(""); const [pixName, setPixName] = useState("");
  const [address, setAddress] = useState({ zipCode: "", street: "", number: "", district: "", city: "", state: "" });
  const [depositPolicy, setDepositPolicy] = useState("required"); const [depositType, setDepositType] = useState("percentage"); const [depositValue, setDepositValue] = useState("20");
  const [message, setMessage] = useState(""); const [loaded, setLoaded] = useState(false); const [saving, setSaving] = useState(false);
  useEffect(() => { api("/salon/details").then(data => { setName(data.name); setPixKey(data.pixKey || ""); setDocument(data.document || "Não informado"); setPhone(data.phone || ""); setInstagram(data.instagram || ""); setPixName(data.pixName || ""); if (data.address) setAddress(data.address); setDepositPolicy(data.depositPolicy || "required"); setDepositType(data.depositType || "percentage"); setDepositValue(String(data.depositValue ?? 20)); setLoaded(true); }).catch(error => setMessage(error.message)); }, []);
  const save = async (event: React.FormEvent) => { event.preventDefault(); setSaving(true); try { await api("/salon/details", { method: "PUT", body: JSON.stringify({ name, pixKey, phone, instagram, address, pixName, depositPolicy, depositType, depositValue: Number(depositValue.replace(",", ".")) }) }); setMessage("Configurações salvas."); } catch (error) { setMessage((error as Error).message); } finally { setSaving(false); } };
  return <form onSubmit={save} className="p-4 sm:p-6 space-y-5 max-w-xl"><h1 className="font-serif text-2xl">Configurações do salão</h1>
    {message && <p role="status" className="p-3 bg-secondary rounded-lg">{message}</p>}
    <label className="block text-sm">Nome do salão<input required value={name} onChange={e => setName(e.target.value)} className="block w-full border rounded-lg p-3 mt-1 bg-background" /></label>
    <p className="text-sm">CPF/CNPJ: {document}</p>
    <label className="block text-sm">Telefone do espaço<input value={phone} onChange={e => setPhone(e.target.value)} maxLength={30} className="block w-full border rounded-lg p-3 mt-1 bg-background" /></label>
    <label className="block text-sm">Instagram<input value={instagram} onChange={e => setInstagram(e.target.value)} maxLength={100} className="block w-full border rounded-lg p-3 mt-1 bg-background" /></label>
    <fieldset className="border rounded-xl p-4 grid sm:grid-cols-2 gap-3">
      <legend className="px-1 text-sm font-semibold">Endereço do espaço</legend>
      {([['zipCode', 'CEP'], ['street', 'Rua / Avenida'], ['number', 'Número'], ['district', 'Bairro'], ['city', 'Cidade'], ['state', 'UF']] as const).map(([key, label]) => <label key={key} className="block text-sm">{label}<input value={address[key]} onChange={e => setAddress(prev => ({ ...prev, [key]: e.target.value }))} className="block w-full border rounded-lg p-3 mt-1 bg-background" /></label>)}
    </fieldset>
    <label className="block text-sm">Chave Pix do salão<input value={pixKey} onChange={e => setPixKey(e.target.value)} maxLength={77} className="block w-full border rounded-lg p-3 mt-1 bg-background" /></label>
    <label className="block text-sm">Nome do favorecido Pix<input value={pixName} onChange={e => setPixName(e.target.value)} maxLength={120} className="block w-full border rounded-lg p-3 mt-1 bg-background" /></label>
    <fieldset className="border rounded-xl p-4 space-y-3">
      <legend className="px-1 text-sm font-semibold">Sinal de reserva</legend>
      <label className="block text-sm">Exigir sinal<select aria-label="Exigir sinal" value={depositPolicy} onChange={e => setDepositPolicy(e.target.value)} className="block w-full border rounded-lg p-3 mt-1 bg-background"><option value="required">Obrigatório</option><option value="optional">Opcional para a cliente</option><option value="none">Sem sinal antecipado</option></select></label>
      <label className="block text-sm">Tipo do sinal<select aria-label="Tipo do sinal" value={depositType} onChange={e => { setDepositType(e.target.value); setDepositValue(e.target.value === "percentage" ? "20" : "30"); }} className="block w-full border rounded-lg p-3 mt-1 bg-background"><option value="percentage">Percentual do serviço (%)</option><option value="fixed">Valor fixo (R$)</option></select></label>
      <label className="block text-sm">Valor do sinal<input required value={depositValue} onChange={e => setDepositValue(e.target.value)} inputMode="decimal" className="block w-full border rounded-lg p-3 mt-1 bg-background" /></label>
      <p className="text-xs text-muted-foreground">O sinal é descontado do atendimento e nunca supera o preço do serviço.</p>
    </fieldset>
    <p className="text-sm text-muted-foreground">O sinal é enviado diretamente ao salão. Confira o recebimento no banco antes de confirmar o agendamento. Sem chave cadastrada, a reserva é registrada sem cobrança antecipada.</p>
    <Button type="submit" disabled={!loaded || saving}>{saving ? "Salvando..." : "Salvar alterações"}</Button>
  </form>;
}
