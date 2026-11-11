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
    <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto">
      <div className="border border-primary/20 bg-primary/5 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-sm sm:text-base text-foreground truncate">Presença no Google Maps & Redes Sociais</h2>
              <p className="text-xs text-muted-foreground truncate">Link oficial de agendamento online do seu salão</p>
            </div>
          </div>
          {publicUrl && (
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1 shrink-0 font-medium self-end sm:self-auto"
            >
              Ver página <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <input
            readOnly
            value={publicUrl}
            className="flex-1 text-xs font-mono bg-background border border-border rounded-xl px-3 py-2.5 outline-none truncate"
          />
          <Button type="button" size="sm" onClick={copyLink} className="gap-1.5 shrink-0 min-h-10 text-xs font-semibold">
            {copiedGoogleLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedGoogleLink ? "Copiado!" : "Copiar Link"}
          </Button>
        </div>

        <div className="bg-background/80 rounded-xl p-3.5 border border-border/60 text-xs space-y-1.5">
          <div className="font-semibold text-foreground">Como colocar o botão no seu Google Maps em 3 passos:</div>
          <ol className="list-decimal list-inside text-muted-foreground space-y-1 leading-relaxed">
            <li>Abra o aplicativo do Google Maps no celular ou acesse <strong>google.com/business</strong></li>
            <li>Toque em <strong>"Editar perfil"</strong> e depois em <strong>"Agendamentos"</strong> (ou "Links")</li>
            <li>Cole o link copiado acima e clique em Salvar! O Google exibirá o botão de agendamento direto na sua ficha.</li>
          </ol>
        </div>

        <div className="flex items-start sm:items-center gap-2 text-xs text-muted-foreground pt-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5 sm:mt-0" />
          <span>No <strong>Plano Elite</strong>, nossa equipe faz a assessoria completa e otimiza o seu Google Meu Negócio por você!</span>
        </div>
      </div>

      <form onSubmit={save} className="space-y-5">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">Configurações do salão</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Gerencie os dados cadastrais e as regras de agendamento.</p>
        </div>

        {message && <p role="status" className="p-3.5 bg-secondary border border-border rounded-xl text-xs sm:text-sm">{message}</p>}

        <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 space-y-4 shadow-xs">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5">Nome do salão *</label>
            <input required value={name} onChange={e => setName(e.target.value)} className="w-full h-11 rounded-xl border border-border px-3.5 text-xs sm:text-sm bg-background outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
          </div>

          <div className="text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg border border-border/60">
            Documento registrado: <span className="font-mono font-medium text-foreground">{document}</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5">Telefone / WhatsApp</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} maxLength={30} placeholder="(11) 99999-9999" className="w-full h-11 rounded-xl border border-border px-3.5 text-xs sm:text-sm bg-background outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5">Instagram (sem @)</label>
              <input value={instagram} onChange={e => setInstagram(e.target.value)} maxLength={100} placeholder="meusalao" className="w-full h-11 rounded-xl border border-border px-3.5 text-xs sm:text-sm bg-background outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
            </div>
          </div>
        </div>

        <fieldset className="bg-card border border-border rounded-2xl p-4 sm:p-6 space-y-3.5 shadow-xs">
          <legend className="px-2 text-xs sm:text-sm font-bold text-foreground uppercase tracking-wider">Endereço do espaço</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {([['zipCode', 'CEP'], ['street', 'Rua / Avenida'], ['number', 'Número'], ['district', 'Bairro'], ['city', 'Cidade'], ['state', 'UF']] as const).map(([key, label]) => (
              <div key={key} className={key === 'street' ? 'sm:col-span-2' : ''}>
                <label className="block text-xs font-semibold text-foreground mb-1.5">{label}</label>
                <input 
                  value={address[key]} 
                  onChange={e => setAddress(prev => ({ ...prev, [key]: e.target.value }))} 
                  className="w-full h-10 rounded-xl border border-border px-3 text-xs sm:text-sm bg-background outline-none focus:border-primary" 
                />
              </div>
            ))}
          </div>
        </fieldset>

        <fieldset className="bg-card border border-border rounded-2xl p-4 sm:p-6 space-y-4 shadow-xs">
          <legend className="px-2 text-xs sm:text-sm font-bold text-foreground uppercase tracking-wider">Sinal e Pagamento PIX</legend>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Chave Pix do salão</label>
              <input value={pixKey} onChange={e => setPixKey(e.target.value)} maxLength={77} placeholder="CPF, CNPJ, e-mail, celular ou aleatória" className="w-full h-11 rounded-xl border border-border px-3.5 text-xs sm:text-sm font-mono bg-background outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Nome do favorecido Pix</label>
              <input value={pixName} onChange={e => setPixName(e.target.value)} maxLength={120} placeholder="Nome como aparece no banco" className="w-full h-11 rounded-xl border border-border px-3.5 text-xs sm:text-sm bg-background outline-none focus:border-primary" />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3.5 pt-2">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Exigir sinal?</label>
              <select aria-label="Exigir sinal" value={depositPolicy} onChange={e => setDepositPolicy(e.target.value)} className="w-full h-10 rounded-xl border border-border px-3 text-xs sm:text-sm bg-background outline-none focus:border-primary">
                <option value="required">Obrigatório</option>
                <option value="optional">Opcional para a cliente</option>
                <option value="none">Sem sinal antecipado</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Tipo do sinal</label>
              <select aria-label="Tipo do sinal" value={depositType} onChange={e => { setDepositType(e.target.value); setDepositValue(e.target.value === "percentage" ? "20" : "30"); }} className="w-full h-10 rounded-xl border border-border px-3 text-xs sm:text-sm bg-background outline-none focus:border-primary">
                <option value="percentage">Percentual (%)</option>
                <option value="fixed">Valor fixo (R$)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Valor do sinal</label>
              {depositType === "fixed" ? (
                <CurrencyInput aria-label="Valor do sinal" required value={depositValue} onValueChange={setDepositValue} className="h-10 rounded-xl border border-border text-xs sm:text-sm bg-background" />
              ) : (
                <input type="number" min="0.01" max="100" step="0.01" required value={depositValue} onChange={e => setDepositValue(e.target.value)} inputMode="decimal" className="w-full h-10 rounded-xl border border-border px-3 text-xs sm:text-sm bg-background outline-none focus:border-primary" />
              )}
            </div>
          </div>

          <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed pt-1">
            O sinal é enviado diretamente para a conta do seu salão. Sempre confira o comprovante ou extrato antes de confirmar o agendamento.
          </p>
        </fieldset>

        <Button type="submit" disabled={!loaded || saving} className="min-h-12 px-6 text-sm font-bold shadow-md">
          {saving ? "Salvando..." : "Salvar alterações"}
        </Button>
      </form>
    </div>
  );
}
