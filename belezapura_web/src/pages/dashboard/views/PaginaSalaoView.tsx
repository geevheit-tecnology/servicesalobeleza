import { useState, useEffect } from "react";
import { 
  Globe, Eye, Copy, Share2, Upload, Plus, X, Sparkles, Check, 
  MapPin, Scissors, Image as ImageIcon, CheckCircle2, Loader2, Camera 
} from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { optimizeImage, PRESETS } from "@/utils/imageOptimizer";

export function PaginaSalaoView() {
  const [tab, setTab] = useState<"desktop" | "mobile">("desktop");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [salonData, setSalonData] = useState<any>(null);

  // Form states
  const [name, setName] = useState("");
  const [mainColor, setMainColor] = useState("#B8614A");
  const [pixKey, setPixKey] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [cover, setCover] = useState<string>("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState("");

  const loadSalon = () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/salon/details`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => {
        setSalonData(d);
        setName(d.name || "");
        setMainColor(d.mainColor || "#B8614A");
        setPixKey(d.pixKey || "");
        setLogo(d.logo || null);
        setCover(d.cover || "");
        if (d.gallery) {
          try {
            const parsed = JSON.parse(d.gallery);
            setGallery(Array.isArray(parsed) ? parsed : []);
          } catch {
            setGallery([]);
          }
        } else {
          setGallery([]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSalon();
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await optimizeImage(file, PRESETS.logo);
      setLogo(base64);
    } catch (err: any) {
      alert(err.message || "Erro ao processar logo.");
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await optimizeImage(file, PRESETS.cover);
      setCover(base64);
    } catch (err: any) {
      alert(err.message || "Erro ao processar foto de capa.");
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await optimizeImage(file, PRESETS.gallery);
      setGallery(prev => [...prev, base64].slice(0, 6));
    } catch (err: any) {
      alert(err.message || "Erro ao processar foto.");
    }
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setSuccessMsg("");
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3050'}/api/salon/details`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          mainColor,
          pixKey,
          logo,
          cover,
          gallery: JSON.stringify(gallery)
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao salvar alterações.");
      }

      const updated = await res.json();
      setSalonData(updated);
      setSuccessMsg("Alterações salvas com sucesso!");
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (e: any) {
      alert(e.message || "Erro de conexão ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const slug = salonData?.slug || localStorage.getItem('salonSlug') || 'geevheithair-studio';
  const publicUrl = `${window.location.origin}/agendar/${slug}`;

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-medium">Página do Salão</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Personalize a foto de capa, logo, galeria e cores que seus clientes veem no celular.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(publicUrl, "_blank")}
          >
            <Eye className="w-4 h-4" /> Abrir Site do Cliente
          </Button>
          <Button 
            size="sm" 
            onClick={handleSave} 
            disabled={saving}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {successMsg}
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Editor Form */}
        <div className="lg:col-span-7 bg-card border border-border rounded-2xl shadow-sm p-5 space-y-5">
          <h3 className="font-semibold text-base border-b border-border pb-3">
            Identidade Visual & Conteúdo
          </h3>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Nome do Salão / Estúdio *</label>
            <input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-background" 
            />
          </div>

          {/* Logo & Capa Uploaders */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Logo do Salão</label>
              <label className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/20 flex flex-col items-center justify-center h-36 relative overflow-hidden group">
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                {logo ? (
                  <>
                    <img src={logo} alt="Logo" className="w-full h-full object-contain p-2" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-white bg-black/60 px-2 py-1 rounded">Trocar logo</span>
                    </div>
                  </>
                ) : (
                  <>
                    <Camera className="w-6 h-6 text-muted-foreground mb-1" />
                    <span className="text-xs font-medium text-foreground">Enviar logo</span>
                    <span className="text-[10px] text-muted-foreground">Otimizado até 400x400</span>
                  </>
                )}
              </label>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Foto de Capa</label>
              <label className="border-2 border-dashed border-border rounded-xl overflow-hidden cursor-pointer hover:border-primary/50 transition-colors relative h-36 bg-muted/20 flex flex-col items-center justify-center group">
                <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                {cover ? (
                  <>
                    <img src={cover} alt="Capa" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-white bg-black/60 px-2 py-1 rounded">Trocar capa</span>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                    <span className="text-xs font-medium text-foreground">Enviar foto de capa</span>
                    <span className="text-[10px] text-muted-foreground">Recomendado 1000x500</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Galeria de Fotos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-muted-foreground">Fotos de Trabalhos (Máx 6)</label>
              {gallery.length < 6 && (
                <label className="text-xs text-primary font-medium flex items-center gap-1 cursor-pointer">
                  <Plus className="w-3.5 h-3.5" /> Adicionar foto
                  <input type="file" accept="image/*" className="hidden" onChange={handleGalleryUpload} />
                </label>
              )}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {gallery.map((img, idx) => (
                <div key={idx} className="aspect-square rounded-xl overflow-hidden relative group border border-border">
                  <img src={img} alt="Trabalho" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setGallery(gallery.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {gallery.length < 6 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-muted/20">
                  <input type="file" accept="image/*" className="hidden" onChange={handleGalleryUpload} />
                  <Plus className="w-5 h-5 text-muted-foreground" />
                </label>
              )}
            </div>
          </div>

          {/* Cor Principal */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Cor de Destaque da Sua Marca</label>
            <div className="flex gap-2 flex-wrap items-center">
              {["#B8614A", "#9B7EA8", "#5B8DB8", "#7DC198", "#E87B4A", "#18181B", "#E11D48"].map(c => (
                <button 
                  key={c} 
                  type="button"
                  onClick={() => setMainColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${mainColor === c ? "scale-110 border-foreground shadow-md ring-2 ring-primary/30" : "border-white shadow-sm"}`} 
                  style={{ background: c }} 
                />
              ))}
            </div>
          </div>

          {/* Chave PIX */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Chave PIX para Recebimento de Sinais</label>
            <input 
              value={pixKey} 
              onChange={e => setPixKey(e.target.value)} 
              placeholder="Chave CPF, CNPJ, Telefone ou Aleatória" 
              className="w-full h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary bg-background" 
            />
          </div>

          {/* Links e Compartilhamento */}
          <div className="pt-3 border-t border-border flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-xs" 
              onClick={() => {
                if (navigator.clipboard?.writeText) {
                  navigator.clipboard.writeText(publicUrl).then(() => alert("Link copiado: " + publicUrl));
                } else {
                  alert("Link do salão: " + publicUrl);
                }
              }}
            >
              <Copy className="w-3.5 h-3.5" /> Copiar Link
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-xs" 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: name || 'Agende seu horário!', url: publicUrl }).catch(() => {});
                } else {
                  navigator.clipboard?.writeText(publicUrl);
                  alert("Link copiado para compartilhar: " + publicUrl);
                }
              }}
            >
              <Share2 className="w-3.5 h-3.5" /> Compartilhar
            </Button>
            <Button 
              size="sm" 
              className="flex-1 text-xs" 
              onClick={handleSave}
              disabled={saving}
            >
              <Check className="w-3.5 h-3.5" /> Salvar Tudo
            </Button>
          </div>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pré-visualização em tempo real
            </span>
            <div className="flex items-center gap-1 bg-secondary rounded-lg p-1 text-xs">
              {(["desktop", "mobile"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1 rounded-md transition-all font-medium capitalize ${tab === t ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Smartphone Simulator */}
          <div className={`bg-white rounded-3xl overflow-hidden border border-border shadow-xl mx-auto ${tab === "mobile" ? "max-w-[310px]" : "w-full"}`}>
            {/* Header com Capa Real ou Gradiente */}
            <div className="relative h-44 bg-zinc-900 text-white overflow-hidden flex flex-col justify-end p-4">
              {cover ? (
                <img src={cover} alt="Capa" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white/30" style={{ background: `linear-gradient(135deg, ${mainColor}, #18181b)` }}>
                  <Sparkles className="w-10 h-10 opacity-40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              <div className="relative z-10 flex items-center gap-3">
                {logo ? (
                  <img src={logo} alt="Logo" className="w-12 h-12 rounded-xl object-contain bg-white shadow-md border-2 border-white" />
                ) : (
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center font-serif text-lg font-bold text-white shadow-md border-2 border-white" style={{ background: mainColor }}>
                    {name ? name.slice(0, 2).toUpperCase() : "SL"}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-base leading-tight drop-shadow">{name || "Seu Salão"}</h4>
                  <p className="text-[11px] opacity-80 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> Centro • 5.0 ★
                  </p>
                </div>
              </div>
            </div>

            {/* Content Simulator */}
            <div className="p-4 bg-[#FAFAFA] space-y-3">
              <div className="flex justify-around border-b border-border/60 pb-2 text-xs font-semibold text-gray-500">
                <span className="text-gray-900 border-b-2 pb-1" style={{ borderColor: mainColor }}>Serviços</span>
                <span>Equipe</span>
                <span>Fotos</span>
              </div>

              <div className="space-y-2">
                {["Corte & Estilo", "Coloração & Mechas", "Manicure & Pedicure"].map((svcName, i) => (
                  <div key={i} className="p-2.5 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ background: mainColor }}>
                        <Scissors className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-800 block">{svcName}</span>
                        <span className="text-[10px] text-gray-400">45 min</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-900">R$ {60 + i * 40}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => window.open(publicUrl, "_blank")}
                className="w-full py-2.5 rounded-xl text-white text-xs font-bold shadow-md hover:brightness-110 transition-all flex items-center justify-center gap-1.5"
                style={{ background: mainColor }}
              >
                <Sparkles className="w-3.5 h-3.5" /> Testar Agendamento Real
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}