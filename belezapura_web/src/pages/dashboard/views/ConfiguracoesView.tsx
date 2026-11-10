import { CurrencyInput } from "@/components/FormattedInputs";
import { parseCurrency } from "@/utils/formatters";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { api } from "@/lib/api";
import { MapPin, Copy, Check, ExternalLink, Sparkles } from "lucide-react";

export function ConfiguracoesView() {
  const [name, setName] = useState(""); const [pixKey, setPixKey] = useState(""); const [document, setDocument] = useState("");
  const [phone, setPhone] = useState(""); const [instagram, setInstagram] = useState(""); const [pixName, setPixName] = useState("");
  const [slug, setSlug] = useState("");
  const [copiedGoogleLink, setCopiedGoogleLink] = useState(false);
  const [address, setAddress] = useState({ zipCode: "", street: "", number: "", district: "", city: "", state: "" });
  const [depositPolicy, setDepositPolicy] = useState("required"); const [depositType, setDepositType] = useState("percentage"); const [depositValue, setDepositValue] = useState("20");
  const [message, setMessage] = useState(""); const [loaded, setLoaded] = useState(false); const [saving, setSaving] = useState(false);

  useEffect(() => {
    api("/salon/details").then(data => {
      setName(data.name);
      setSlug(data.slug || "");
      setPixKey(data.pixKey || "");
      setDocument(data.document || "Não informado");
      setPhone(data.phone || "");
      setInstagram(data.instagram || "");
      setPixName(data.pixName || "");
      if (data.address) setAddress(data.address);
      setDepositPolicy(data.depositPolicy || "required");
      setDepositType(data.depositType || "percentage");
      setDepositValue(String(data.depositValue ?? 20));
      setLoaded(true);
    }).catch(error => setMessage(error.message));
  }, []);

  const publicUrl = slug ? `${window.location.origin}/s/${slug}` : "";

  const copyLink = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setCopiedGoogleLink(true);
    setTimeout(() => setCopiedGoogleLink(false), 3000);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api("/salon/details", {
        method: "PUT",
        body: JSON.stringify({ name, pixKey, phone, instagram, address, pixName, depositPolicy, depositType, depositValue: parseCurrency(depositValue) })
      });
      setMessage("Configurações salvas.");
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-2xl">
      <div className="border border-primary/20 bg-primary/5 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-base">Presença no Google Maps & Redes Sociais</h2>
              <p className="text-xs text-muted-foreground">Link oficial de agendamento online do seu salão</p>
            </div>
          </div>
          {publicUrl && (
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1 shrink-0"
            >
              Ver página <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <input
            readOnly
            value={publicUrl}
            className="flex-1 text-xs font-mono bg-background border border-border rounded-lg px-3 py-2 outline-none"
          />
          <Button type="button" size="sm" onClick={copyLink} className="gap-1.5 shrink-0">
            {copiedGoogleLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedGoogleLink ? "Copiado!" : "Copiar Link"}
          </Button>
        </div>

        <div className="bg-background/80 rounded-xl p-3 border border-border/60 text-xs space-y-1.5">
          <div className="font-medium text-foreground">Como colocar o botão no seu Google Maps em 3 passos:</div>
          <ol className="list-decimal list-inside text-muted-foreground space-y-1">
            <li>Abra o aplicativo do Google Maps no celular ou acesse <strong>google.com/business</strong></li>
            <li>Toque em <strong>"Editar perfil"</strong> e depois em <strong>"Agendamentos"</strong> (ou "Links")</li>
            <li>Cole o link copiado acima e clique em Salvar! O Google exibirá o botão de agendamento direto na sua ficha.</li>
          </ol>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>No <strong>Plano Elite</strong>, nossa equipe faz a assessoria completa e otimiza o seu Google Meu Negócio por você!</span>
        </div>
      </div>

      <form onSubmit={save} className="space-y-5">
        <h1 className="font-serif text-2xl font-medium">Configurações do salão</h1>
        {message && <p role="status" className="p-3 bg-secondary rounded-lg text-sm">{message}</p>}
        <label className="block text-sm font-medium">Nome do salão<input required value={name} onChange={e => setName(e.target.value)} className="block w-full border rounded-lg p-3 mt-1 bg-background text-sm" /></label>
        <p className="text-sm text-muted-foreground">CPF/CNPJ: {document}</p>
        <label className="block text-sm font-medium">Telefone do espaço<input value={phone} onChange={e => setPhone(e.target.value)} maxLength={30} className="block w-full border rounded-lg p-3 mt-1 bg-background text-sm" /></label>
        <label className="block text-sm font-medium">Instagram<input value={instagram} onChange={e => setInstagram(e.target.value)} maxLength={100} className="block w-full border rounded-lg p-3 mt-1 bg-background text-sm" /></label>
        <fieldset className="border rounded-xl p-4 grid sm:grid-cols-2 gap-3">
          <legend className="px-1 text-sm font-semibold">Endereço do espaço</legend>
          {([['zipCode', 'CEP'], ['street', 'Rua / Avenida'], ['number', 'Número'], ['district', 'Bairro'], ['city', 'Cidade'], ['state', 'UF']] as const).map(([key, label]) => (
            <label key={key} className="block text-sm font-medium">{label}<input value={address[key]} onChange={e => setAddress(prev => ({ ...prev, [key]: e.target.value }))} className="block w-full border rounded-lg p-3 mt-1 bg-background text-sm" /></label>
          ))}
        </fieldset>
        <label className="block text-sm font-medium">Chave Pix do salão<input value={pixKey} onChange={e => setPixKey(e.target.value)} maxLength={77} className="block w-full border rounded-lg p-3 mt-1 bg-background text-sm" /></label>
        <label className="block text-sm font-medium">Nome do favorecido Pix<input value={pixName} onChange={e => setPixName(e.target.value)} maxLength={120} className="block w-full border rounded-lg p-3 mt-1 bg-background text-sm" /></label>
        <fieldset className="border rounded-xl p-4 space-y-3">
          <legend className="px-1 text-sm font-semibold">Sinal de reserva</legend>
          <label className="block text-sm font-medium">Exigir sinal<select aria-label="Exigir sinal" value={depositPolicy} onChange={e => setDepositPolicy(e.target.value)} className="block w-full border rounded-lg p-3 mt-1 bg-background text-sm"><option value="required">Obrigatório</option><option value="optional">Opcional para a cliente</option><option value="none">Sem sinal antecipado</option></select></label>
          <label className="block text-sm font-medium">Tipo do sinal<select aria-label="Tipo do sinal" value={depositType} onChange={e => { setDepositType(e.target.value); setDepositValue(e.target.value === "percentage" ? "20" : "30"); }} className="block w-full border rounded-lg p-3 mt-1 bg-background text-sm"><option value="percentage">Percentual do serviço (%)</option><option value="fixed">Valor fixo (R$)</option></select></label>
          <label className="block text-sm font-medium">Valor do sinal{depositType === "fixed" ? <CurrencyInput aria-label="Valor do sinal" required value={depositValue} onValueChange={setDepositValue} className="h-10 rounded-lg border border-border px-3 text-sm bg-card" /> : <input type="number" min="0.01" max="100" step="0.01" required value={depositValue} onChange={e => setDepositValue(e.target.value)} inputMode="decimal" className="block w-full border rounded-lg p-3 mt-1 bg-background text-sm" />}</label>
          <p className="text-xs text-muted-foreground">O sinal é descontado do atendimento e nunca supera o preço do serviço.</p>
        </fieldset>
        <p className="text-xs text-muted-foreground">O sinal é enviado diretamente ao salão. Confira o recebimento no banco antes de confirmar o agendamento. Sem chave cadastrada, a reserva é registrada sem cobrança antecipada.</p>
        <Button type="submit" disabled={!loaded || saving}>{saving ? "Salvando..." : "Salvar alterações"}</Button>
      </form>
    </div>
  );
}
