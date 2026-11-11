import { useState, useEffect } from "react";
import { 
  Globe, Eye, Copy, Share2, Upload, Plus, X, Sparkles, Check, 
  MapPin, Scissors, Image as ImageIcon, CheckCircle2, Loader2, Camera,
  Clock, ShieldCheck, Award, MessageCircle, Star, ExternalLink, ArrowRight
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

  const slug = salonData?.slug || localStorage.getItem('salonSlug') || 'studio-belezapura';
  const publicUrl = `${window.location.origin}/agendar/${slug}`;

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-medium">Página do Salão</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Personalize a foto de capa, logo, galeria e cores que seus clientes veem no celular.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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

        {/* Live Preview Column - LANDING PAGE REAL DO SALÃO */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Pré-visualização da Landing Page
              </span>
              <span className="text-[11px] text-muted-foreground">
                Atualização em tempo real conforme você edita
              </span>
            </div>
            <div className="flex items-center gap-1 bg-secondary rounded-lg p-1 text-xs">
              {(["desktop", "mobile"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1 rounded-md transition-all font-medium capitalize cursor-pointer ${tab === t ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Link público com botão direto */}
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between gap-2 text-xs">
            <div className="truncate min-w-0">
              <span className="text-muted-foreground text-[10px] block font-medium">Link Oficial do Seu Salão</span>
              <span className="font-bold text-primary truncate block">{publicUrl}</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(publicUrl, "_blank")}
              className="shrink-0 h-8 text-xs gap-1 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" /> Abrir Site
            </Button>
          </div>

          {/* SIMULADOR LANDING PAGE: DESKTOP & MOBILE */}
          {(() => {
            const previewServices = (salonData?.services && salonData.services.length > 0) ? salonData.services : [
              { id: "1", name: "Corte & Modelagem", duration: 45, price: 70, desc: "Lavagem, corte personalizado e finalização com escova." },
              { id: "2", name: "Tratamento & Hidratação", duration: 60, price: 120, desc: "Nutrição profunda e brilho intenso para os fios." },
              { id: "3", name: "Design & Estética", duration: 30, price: 50, desc: "Realce do olhar com alinhamento e acabamento impecável." }
            ];

            const previewPros = (salonData?.professionals && salonData.professionals.length > 0) ? salonData.professionals : [
              { id: "1", name: "Especialista Principal", role: "Atendimento Exclusivo" }
            ];

            return (
              <div className={`transition-all duration-300 mx-auto ${tab === "mobile" ? "max-w-[340px]" : "w-full"}`}>
                <div className="bg-background rounded-3xl overflow-hidden border border-border shadow-2xl flex flex-col h-[650px] relative">
                  
                  {/* Topo do Navegador no Simulador */}
                  <div className="h-8 bg-muted/80 border-b border-border flex items-center px-3 gap-1.5 shrink-0 select-none">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-[10px] text-muted-foreground ml-2 truncate">
                      {publicUrl.replace(/^https?:\/\//, '')}
                    </span>
                  </div>

                  {/* Conteúdo com rolagem da Landing Page */}
                  <div className="flex-1 overflow-y-auto scrollbar-hide text-foreground">
                    
                    {/* 1. Header / Navbar da Landing Page */}
                    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border p-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {logo ? (
                          <img src={logo} alt="Logo" className="w-7 h-7 rounded-lg object-contain bg-white border border-border shrink-0" />
                        ) : (
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center font-serif text-xs font-bold text-white shrink-0" style={{ background: mainColor }}>
                            {name ? name.slice(0, 2).toUpperCase() : "SL"}
                          </div>
                        )}
                        <span className="font-serif text-xs font-bold truncate">{name || "Seu Salão"}</span>
                      </div>
                      <span className="text-[9px] font-bold text-white px-2 py-1 rounded-lg shrink-0 cursor-pointer" style={{ background: mainColor }} onClick={() => window.open(publicUrl, "_blank")}>
                        Agendar Horário
                      </span>
                    </div>

                    {/* 2. Hero Section com Capa Real ou Gradiente */}
                    <div className="relative h-44 sm:h-52 bg-zinc-900 text-white overflow-hidden flex flex-col justify-end p-4">
                      {cover ? (
                        <img src={cover} alt="Capa" className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white/30" style={{ background: `linear-gradient(135deg, ${mainColor}, #18181b)` }}>
                          <Sparkles className="w-10 h-10 opacity-40 animate-pulse" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                      
                      <div className="relative z-10 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="bg-white/20 text-white text-[9px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-amber-300" /> Salão Verificado
                          </span>
                          <span className="bg-amber-500/20 text-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded-md border border-amber-500/30">
                            ★ 5.0
                          </span>
                        </div>
                        <h2 className="font-serif text-lg sm:text-xl font-bold text-white leading-tight drop-shadow truncate">
                          {name || "Seu Salão / Estúdio"}
                        </h2>
                        <p className="text-[11px] text-zinc-300 flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-primary shrink-0" /> Atendimento exclusivo com hora marcada
                        </p>
                      </div>
                    </div>

                    {/* 3. Faixa de Diferenciais e Garantias */}
                    <div className="p-3 bg-card border-b border-border grid grid-cols-2 gap-2 text-left">
                      <div className="p-2 rounded-xl bg-muted/40 border border-border/60 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold block truncate">Sem Espera</span>
                          <span className="text-[9px] text-muted-foreground block truncate">Hora marcada</span>
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-muted/40 border border-border/60 flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold block truncate">Vaga Garantida</span>
                          <span className="text-[9px] text-muted-foreground block truncate">Reserva anti-furo</span>
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-muted/40 border border-border/60 flex items-center gap-2">
                        <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold block truncate">Especialistas</span>
                          <span className="text-[9px] text-muted-foreground block truncate">Equipe top</span>
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-muted/40 border border-border/60 flex items-center gap-2">
                        <MessageCircle className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold block truncate">Alerta no Zap</span>
                          <span className="text-[9px] text-muted-foreground block truncate">Lembrete de horário</span>
                        </div>
                      </div>
                    </div>

                    {/* 4. Catálogo de Procedimentos */}
                    <div className="p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-serif text-xs font-bold block">Procedimentos Disponíveis</span>
                          <span className="text-[10px] text-muted-foreground">Escolha para agendar online</span>
                        </div>
                        <span className="text-[10px] text-primary font-semibold">
                          {previewServices.length} {previewServices.length === 1 ? 'opção' : 'opções'}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {previewServices.map((svc: any) => (
                          <div 
                            key={svc.id}
                            className="p-3 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all flex items-center justify-between gap-2 shadow-xs"
                          >
                            <div className="min-w-0 flex-1">
                              <span className="font-serif text-xs font-bold block truncate text-foreground">{svc.name}</span>
                              {svc.desc && <p className="text-[10px] text-muted-foreground truncate">{svc.desc}</p>}
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Clock className="w-2.5 h-2.5" /> {svc.duration || 45} min
                              </span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs font-extrabold text-foreground block">
                                R$ {Number(svc.price || 0).toFixed(2).replace('.', ',')}
                              </span>
                              <button 
                                onClick={() => window.open(publicUrl, "_blank")}
                                className="mt-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-white shadow-xs hover:opacity-90 transition-all cursor-pointer"
                                style={{ background: mainColor }}
                              >
                                Agendar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 5. Equipe */}
                    {previewPros.length > 0 && (
                      <div className="p-3.5 bg-card/60 border-t border-border space-y-2">
                        <span className="font-serif text-xs font-bold block">Nossa Equipe</span>
                        <div className="grid grid-cols-1 gap-2">
                          {previewPros.map((pro: any) => (
                            <div key={pro.id} className="p-2.5 rounded-xl bg-background border border-border flex items-center gap-2.5">
                              {pro.avatar ? (
                                <img src={pro.avatar} alt={pro.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                              ) : (
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0" style={{ background: mainColor }}>
                                  {pro.name.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <span className="text-xs font-bold block truncate">{pro.name}</span>
                                <span className="text-[10px] text-muted-foreground block truncate">{pro.role || pro.specialty || "Especialista"}</span>
                              </div>
                              <span className="text-[10px] text-amber-500 font-semibold shrink-0">★ 5.0</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 6. Horários & Localização */}
                    <div className="p-3.5 border-t border-border space-y-2 text-xs">
                      <span className="font-serif text-xs font-bold block flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary" /> Horários & Regras
                      </span>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        • Segunda a Sábado: 09:00 às 19:00<br />
                        • Domingo: Fechado<br />
                        • Atendimento com hora marcada e confirmação via WhatsApp.
                      </p>
                    </div>

                    <div className="h-14" /> {/* Espaço para a barra inferior no mobile */}
                  </div>

                  {/* Barra Fixa Inferior no Mobile do Simulador */}
                  <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-background/95 backdrop-blur-md border-t border-border flex items-center justify-between gap-2 z-30">
                    <div className="min-w-0 flex-1">
                      <span className="font-serif text-[11px] font-bold block truncate">{name || "Seu Salão"}</span>
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" /> Agenda Online Aberta
                      </span>
                    </div>
                    <button
                      onClick={() => window.open(publicUrl, "_blank")}
                      className="px-3.5 py-1.5 rounded-xl text-[10px] font-extrabold text-white shadow-md cursor-pointer hover:opacity-90 shrink-0"
                      style={{ background: mainColor }}
                    >
                      Agendar Horário
                    </button>
                  </div>

                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}